/**
 * Tests for the `updateInboundBlockchainTransfer` operation.
 *
 * Happy path discovers a real id via `listInboundBlockchainTransfers`
 * and patches its `custom_ref` / `custom_fields` (the only mutable
 * fields). Error coverage hits Forbidden (bad key), NotFound (well-
 * formed-but-missing id), and BadRequest (malformed id).
 */
import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { listInboundBlockchainTransfers } from "../src/operations/listInboundBlockchainTransfers.ts";
import { updateInboundBlockchainTransfer } from "../src/operations/updateInboundBlockchainTransfer.ts";
import { runEffect, testRunId, unknownId } from "./setup.ts";

describe("updateInboundBlockchainTransfer", () => {
  describe("happy path", () => {
    it(
      "patches custom_ref and custom_fields on an existing inbound blockchain transfer",
      async () => {
        const list = await runEffect(
          listInboundBlockchainTransfers({ page_size: 1 }),
        );
        if (list.data.length === 0) return;

        const target = list.data[0]!;
        const newRef = `distilled-erebor-${testRunId}`;
        const newFields = { test_run_id: testRunId, source: "distilled" };

        const result = await runEffect(
          updateInboundBlockchainTransfer({
            id: target.id,
            custom_ref: newRef,
            custom_fields: newFields,
          }),
        );

        expect(result.type).toBe("BLOCKCHAIN_IN");
        expect(result.id).toBe(target.id);
        expect(result.custom_ref).toBe(newRef);
        expect(result.custom_fields).toMatchObject(newFields);
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
          updateInboundBlockchainTransfer({
            id: unknownId("blockchain_in"),
            custom_ref: `distilled-erebor-${testRunId}`,
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
      "missing inbound blockchain transfer id -> NotFound",
      async () => {
        const error = (await runEffect(
          updateInboundBlockchainTransfer({
            id: unknownId("blockchain_in"),
            custom_ref: `distilled-erebor-${testRunId}`,
          }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("NotFound");
      },
      30_000,
    );

    it(
      "malformed inbound blockchain transfer id -> BadRequest",
      async () => {
        // Spec patch declares 400 INVALID_REQUEST on PATCH
        // /blockchain_in/{id}. A clearly malformed path segment exercises
        // that branch.
        const error = (await runEffect(
          updateInboundBlockchainTransfer({
            id: "!!!invalid!!!",
            custom_ref: `distilled-erebor-${testRunId}`,
          }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("BadRequest");
      },
      30_000,
    );
  });
});
