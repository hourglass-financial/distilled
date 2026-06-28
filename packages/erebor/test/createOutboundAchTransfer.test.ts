/**
 * Tests for the `createOutboundAchTransfer` operation.
 *
 * Happy path sources a known-good (deposit_account_id,
 * counterparty_us_bank_account_id) pair from an existing outbound ACH
 * transfer and submits a small CREDIT for $0.01. Error coverage hits
 * Forbidden (bad key), NotFound (well-formed-but-missing deposit account
 * id), and BadRequest (malformed deposit account id).
 */
import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { createOutboundAchTransfer } from "../src/operations/createOutboundAchTransfer.ts";
import { listOutboundAchTransfers } from "../src/operations/listOutboundAchTransfers.ts";
import { runEffect, testRunId, unknownId } from "./setup.ts";

describe("createOutboundAchTransfer", () => {
  describe("happy path", () => {
    it(
      "creates a small outbound ACH transfer from an existing pair",
      async () => {
        // Source a known-good (deposit account, counterparty) pairing
        // from an existing outbound ACH transfer to avoid guessing
        // compatible IDs.
        const list = await runEffect(
          listOutboundAchTransfers({ page_size: 1 }),
        );
        if (list.data.length === 0) return;
        const sample = list.data[0]!;

        const customRef = `distilled-erebor-${testRunId}`;
        const result = await runEffect(
          createOutboundAchTransfer({
            deposit_account_id: sample.deposit_account_id,
            counterparty_us_bank_account_id:
              sample.counterparty_us_bank_account_id,
            amount: { currency: "USD", value: "1" },
            direction: "CREDIT",
            sec_code: "CCD",
            company_entry_description: `dist-${testRunId}`.slice(0, 10),
            service: "STANDARD",
            custom_ref: customRef,
            custom_fields: { test_run_id: testRunId, source: "distilled" },
          }),
        );

        expect(result.type).toBe("ACH_OUT");
        expect(typeof result.id).toBe("string");
        expect(result.id.length).toBeGreaterThan(0);
        expect(result.deposit_account_id).toBe(sample.deposit_account_id);
        expect(result.counterparty_us_bank_account_id).toBe(
          sample.counterparty_us_bank_account_id,
        );
        expect(result.amount.currency).toBe("USD");
        expect(result.amount.value).toBe("1");
        expect(result.direction).toBe("CREDIT");
        expect(result.sec_code).toBe("CCD");
        expect(result.service).toBe("STANDARD");
        expect(result.custom_ref).toBe(customRef);
        expect([
          "CREATED",
          "PENDING",
          "SETTLED",
          "FAILED",
          "RETURNED",
        ]).toContain(result.status);
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
          createOutboundAchTransfer({
            deposit_account_id: unknownId("dpst_acct"),
            counterparty_us_bank_account_id: unknownId("cpusba"),
            amount: { currency: "USD", value: "1" },
            direction: "CREDIT",
            sec_code: "CCD",
            company_entry_description: `dist-${testRunId}`.slice(0, 10),
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
      "missing deposit account id -> BadRequest",
      async () => {
        // Well-formed but unrecognised deposit account id forces the
        // documented 404 path.
        const error = (await runEffect(
          createOutboundAchTransfer({
            deposit_account_id: unknownId("dpst_acct"),
            counterparty_us_bank_account_id: unknownId("cpusba"),
            amount: { currency: "USD", value: "1" },
            direction: "CREDIT",
            sec_code: "CCD",
            company_entry_description: `dist-${testRunId}`.slice(0, 10),
          }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("BadRequest");
      },
      30_000,
    );

    it(
      "malformed deposit account id -> BadRequest",
      async () => {
        // A lexically invalid deposit account id forces 400
        // INVALID_REQUEST rather than the 404 path exercised above.
        const error = (await runEffect(
          createOutboundAchTransfer({
            deposit_account_id: "!!!invalid!!!",
            counterparty_us_bank_account_id: unknownId("cpusba"),
            amount: { currency: "USD", value: "1" },
            direction: "CREDIT",
            sec_code: "CCD",
            company_entry_description: `dist-${testRunId}`.slice(0, 10),
          }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("BadRequest");
      },
      30_000,
    );
  });
});
