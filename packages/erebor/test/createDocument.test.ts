/**
 * Tests for the `createDocument` operation.
 *
 * Multipart/form-data upload. Happy path requires a real program id
 * (EREBOR_TEST_PROGRAM_ID); error paths exercise Forbidden (bad key) and
 * BadRequest (malformed program_id reference).
 */
import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { createDocument } from "../src/operations/createDocument.ts";
import { runEffect, testRunId } from "./setup.ts";

const requireProgramId = (): string => {
  const id = process.env.EREBOR_TEST_PROGRAM_ID;
  if (!id) throw new Error("EREBOR_TEST_PROGRAM_ID not set");
  return id;
};

describe("createDocument", () => {
  describe("happy path", () => {
    it(
      "uploads a document tied to a real program",
      async () => {
        if (!process.env.EREBOR_TEST_PROGRAM_ID) return;
        const programId = requireProgramId();

        const result = await runEffect(
          createDocument({
            program_id: programId,
            document_type: "OTHER",
            name: `distilled-erebor-doc-${testRunId}.txt`,
            description: `Test upload from distilled SDK run ${testRunId}`,
            file: `distilled erebor sdk test fixture ${testRunId}`,
            custom_ref: `distilled-erebor-${testRunId}`,
          }),
        );

        expect(result.type).toBe("DOCUMENT");
        expect(typeof result.id).toBe("string");
        expect(result.id.length).toBeGreaterThan(0);
        expect(result.program_id).toBe(programId);
        expect(result.document_type).toBe("OTHER");
        expect(result.name).toBe(`distilled-erebor-doc-${testRunId}.txt`);
        expect(typeof result.content_hash).toBe("string");
        expect(typeof result.content_size).toBe("number");
        expect(typeof result.content_url).toBe("string");
      },
      60_000,
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
          createDocument({
            program_id: "prgrm_01h0000000000000000000000z",
            document_type: "OTHER",
            name: `distilled-erebor-doc-${testRunId}.txt`,
            file: `payload-${testRunId}`,
          }).pipe(
            Effect.flip,
            Effect.provide(Main),
          ) as Effect.Effect<unknown, never, never>,
        )) as { _tag: string };

        expect(error._tag).toBe("Forbidden");
      },
      30_000,
    );

    it(
      "malformed program_id -> BadRequest",
      async () => {
        // Per spec, /documents declares 400 INVALID_REQUEST as a valid
        // failure mode. A `program_id` value that does not parse as a
        // program reference forces the API onto that path.
        const error = (await runEffect(
          createDocument({
            program_id: "not-a-program-id",
            document_type: "OTHER",
            name: `distilled-erebor-doc-${testRunId}.txt`,
            file: `payload-${testRunId}`,
          }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("BadRequest");
      },
      30_000,
    );
  });
});
