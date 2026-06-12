/**
 * Tests for the `getProgram` operation.
 *
 * Happy path discovers a real id via `listPrograms`. Error coverage
 * hits Forbidden (bad key), NotFound (well-formed-but-missing id), and
 * the BadRequest path declared by the spec patch.
 */
import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { getProgram } from "../src/operations/getProgram.ts";
import { listPrograms } from "../src/operations/listPrograms.ts";
import { runEffect, testRunId, unknownId } from "./setup.ts";

describe("getProgram", () => {
  describe("happy path", () => {
    it(
      "fetches a program by id",
      async () => {
        const list = await runEffect(listPrograms({ page_size: 1 }));
        if (list.data.length === 0) return;

        const target = list.data[0]!;
        const result = await runEffect(getProgram({ id: target.id }));

        expect(result.type).toBe("PROGRAM");
        expect(result.id).toBe(target.id);
        expect(typeof result.name).toBe("string");
        expect(typeof result.billing_deposit_account_id).toBe("string");
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
          getProgram({ id: unknownId("prog") }).pipe(
            Effect.flip,
            Effect.provide(Main),
          ) as Effect.Effect<unknown, never, never>,
        )) as { _tag: string };

        expect(error._tag).toBe("Forbidden");
      },
      30_000,
    );

    it(
      "unknown program id -> NotFound",
      async () => {
        const error = (await runEffect(
          getProgram({ id: unknownId("prog") }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("NotFound");
      },
      30_000,
    );

    it(
      "malformed program id -> BadRequest",
      async () => {
        // Spec patch declares 400 INVALID_REQUEST on GET /programs/{id}.
        // A clearly malformed path segment exercises that branch.
        const error = (await runEffect(
          getProgram({ id: "!!!invalid!!!" }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("BadRequest");
      },
      30_000,
    );
  });
});
