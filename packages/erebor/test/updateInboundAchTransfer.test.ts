/**
 * Tests for the `updateInboundAchTransfer` operation.
 *
 * Happy path discovers a real id via `listInboundAchTransfers` and
 * patches its `custom_ref` / `custom_fields` (the only mutable fields).
 * Error coverage hits Forbidden (bad key), NotFound (well-formed-but-
 * missing id), and BadRequest (malformed id).
 */
import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { listInboundAchTransfers } from "../src/operations/listInboundAchTransfers.ts";
import { updateInboundAchTransfer } from "../src/operations/updateInboundAchTransfer.ts";
import { runEffect, testRunId, unknownId } from "./setup.ts";

describe("updateInboundAchTransfer", () => {
  describe("happy path", () => {
    it(
      "patches custom_ref and custom_fields on an existing inbound ACH transfer",
      async () => {
        const list = await runEffect(listInboundAchTransfers({ page_size: 1 }));
        if (list.data.length === 0) return;

        const target = list.data[0]!;
        const newRef = `distilled-erebor-${testRunId}`;
        const newFields = { test_run_id: testRunId, source: "distilled" };

        const result = await runEffect(
          updateInboundAchTransfer({
            id: target.id,
            custom_ref: newRef,
            custom_fields: newFields,
          }),
        );

        expect(result.type).toBe("ACH_IN");
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
          updateInboundAchTransfer({
            id: unknownId("ach_in"),
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
      "missing inbound ACH transfer id -> NotFound",
      async () => {
        const error = (await runEffect(
          updateInboundAchTransfer({
            id: unknownId("ach_in"),
            custom_ref: `distilled-erebor-${testRunId}`,
          }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("NotFound");
      },
      30_000,
    );

    it(
      "malformed inbound ACH transfer id -> BadRequest",
      async () => {
        // Spec patch declares 400 INVALID_REQUEST on PATCH /ach_in/{id}.
        // A clearly malformed path segment exercises that branch.
        const error = (await runEffect(
          updateInboundAchTransfer({
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
