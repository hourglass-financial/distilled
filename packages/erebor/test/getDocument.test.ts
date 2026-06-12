/**
 * Tests for the `getDocument` operation.
 *
 * Covers happy-path retrieval (via `listDocuments` to discover a real id)
 * and the three declared error paths: Forbidden (bad key), NotFound
 * (well-formed-but-missing id), and BadRequest (declared on the operation
 * by the spec patch).
 */
import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { getDocument } from "../src/operations/getDocument.ts";
import { listDocuments } from "../src/operations/listDocuments.ts";
import { runEffect, testRunId, unknownId } from "./setup.ts";

describe("getDocument", () => {
  describe("happy path", () => {
    it(
      "fetches a document by id",
      async () => {
        // Discover a real document id via listDocuments. If none exist in
        // the sandbox, there is nothing meaningful to assert against and
        // the test exits early — happy-path coverage moves to
        // createDocument.test.ts where the fixture is provisioned.
        const list = await runEffect(listDocuments({ page_size: 1 }));
        if (list.data.length === 0) return;

        const target = list.data[0]!;
        const result = await runEffect(getDocument({ id: target.id }));

        expect(result.type).toBe("DOCUMENT");
        expect(result.id).toBe(target.id);
        expect(typeof result.program_id).toBe("string");
        expect(typeof result.name).toBe("string");
        expect(typeof result.content_hash).toBe("string");
        expect(typeof result.content_size).toBe("number");
        expect(typeof result.content_type).toBe("string");
        expect(typeof result.content_url).toBe("string");
      },
      30_000,
    );
  });

  describe("errors", () => {
    it(
      "invalid API key -> Forbidden",
      async () => {
        const BadCreds = Layer.succeed(Credentials, {
          apiKey: Redacted.make(`test_key_invalid_${testRunId}`),
          apiBaseUrl: DEFAULT_API_BASE_URL,
        });
        const Main = Layer.merge(BadCreds, FetchHttpClient.layer);

        const error = (await Effect.runPromise(
          getDocument({ id: unknownId("doc") }).pipe(
            Effect.flip,
            Effect.provide(Main),
          ) as Effect.Effect<unknown, never, never>,
        )) as { _tag: string };

        expect(error._tag).toBe("Forbidden");
      },
      30_000,
    );

    it(
      "unknown document id -> NotFound",
      async () => {
        const error = (await runEffect(
          getDocument({ id: unknownId("doc") }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("NotFound");
      },
      30_000,
    );

    it(
      "malformed document id -> BadRequest",
      async () => {
        // The spec patch declares 400 INVALID_REQUEST as a documented
        // failure mode on `GET /documents/{id}`. A clearly malformed
        // path segment exercises that branch. (Note: prior discovery
        // observed that some malformed IDs are folded into 404; this
        // test pins the declared 400 path so any divergence surfaces
        // as a test failure.)
        const error = (await runEffect(
          getDocument({ id: "!!!invalid!!!" }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("BadRequest");
      },
      30_000,
    );
  });
});
