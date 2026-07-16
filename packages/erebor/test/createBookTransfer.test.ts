/**
 * Tests for the `createBookTransfer` operation.
 *
 * Happy path sources a known-good (from_deposit_account_id,
 * to_deposit_account_id) pair from an existing book transfer and submits
 * a small $0.01 transfer. Error coverage hits Forbidden (bad key),
 * NotFound (well-formed-but-missing source account id), and BadRequest
 * (malformed source account id).
 */
import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { createBookTransfer } from "../src/operations/createBookTransfer.ts";
import { listBookTransfers } from "../src/operations/listBookTransfers.ts";
import { runEffect, testRunId, unknownId } from "./setup.ts";

describe("createBookTransfer", () => {
  describe("happy path", () => {
    it(
      "creates a small book transfer from an existing pair",
      async () => {
        // Source a known-good (source, destination) pairing from an
        // existing book transfer to avoid guessing compatible IDs.
        const list = await runEffect(listBookTransfers({ page_size: 1 }));
        if (list.data.length === 0) return;
        const sample = list.data[0]!;

        const customRef = `distilled-erebor-${testRunId}`;
        const result = await runEffect(
          createBookTransfer({
            from_deposit_account_id: sample.from_deposit_account_id,
            to_deposit_account_id: sample.to_deposit_account_id,
            amount: { currency: "USD", value: "1" },
            memo: `Distilled test book transfer ${testRunId}`,
            custom_ref: customRef,
            custom_fields: { test_run_id: testRunId, source: "distilled" },
          }),
        );

        expect(result.type).toBe("BOOK_TRANSFER");
        expect(typeof result.id).toBe("string");
        expect(result.id.length).toBeGreaterThan(0);
        expect(result.from_deposit_account_id).toBe(
          sample.from_deposit_account_id,
        );
        expect(result.to_deposit_account_id).toBe(sample.to_deposit_account_id);
        expect(result.amount.currency).toBe("USD");
        expect(result.amount.value).toBe("1");
        expect(result.memo).toBe(`Distilled test book transfer ${testRunId}`);
        expect(result.custom_ref).toBe(customRef);
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
          createBookTransfer({
            from_deposit_account_id: unknownId("dpst_acct"),
            to_deposit_account_id: unknownId("dpst_acct"),
            amount: { currency: "USD", value: "1" },
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
      "missing source deposit account id -> NotFound",
      async () => {
        // Well-formed but unrecognised deposit account id forces the
        // documented 404 path.
        const error = (await runEffect(
          createBookTransfer({
            from_deposit_account_id: unknownId("dpst_acct"),
            to_deposit_account_id: unknownId("dpst_acct"),
            amount: { currency: "USD", value: "1" },
          }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("NotFound");
      },
      30_000,
    );

    it(
      "malformed source deposit account id -> BadRequest",
      async () => {
        // A lexically invalid deposit account id forces 400
        // INVALID_REQUEST rather than the 404 path exercised above.
        const error = (await runEffect(
          createBookTransfer({
            from_deposit_account_id: "!!!invalid!!!",
            to_deposit_account_id: unknownId("dpst_acct"),
            amount: { currency: "USD", value: "1" },
          }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("BadRequest");
      },
      30_000,
    );
  });
});
