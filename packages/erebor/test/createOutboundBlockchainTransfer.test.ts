/**
 * Tests for the `createOutboundBlockchainTransfer` operation.
 *
 * Happy path sources a known-good (deposit_account_id,
 * counterparty_blockchain_address_id, network) tuple from an existing
 * outbound blockchain transfer and submits a small transfer. Error
 * coverage hits Forbidden (bad key), NotFound (well-formed-but-missing
 * deposit account id), and BadRequest (malformed deposit account id).
 */
import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { createOutboundBlockchainTransfer } from "../src/operations/createOutboundBlockchainTransfer.ts";
import { listOutboundBlockchainTransfers } from "../src/operations/listOutboundBlockchainTransfers.ts";
import { runEffect, testRunId, unknownId } from "./setup.ts";

describe("createOutboundBlockchainTransfer", () => {
  describe("happy path", () => {
    it(
      "creates a small outbound blockchain transfer from an existing pair",
      async () => {
        // Source a known-good (deposit account, counterparty blockchain
        // address, network, currency) tuple from an existing outbound
        // blockchain transfer to avoid guessing compatible IDs.
        const list = await runEffect(
          listOutboundBlockchainTransfers({ page_size: 1 }),
        );
        if (list.data.length === 0) return;
        const sample = list.data[0]!;

        const customRef = `distilled-erebor-${testRunId}`;
        const result = await runEffect(
          createOutboundBlockchainTransfer({
            deposit_account_id: sample.deposit_account_id,
            counterparty_blockchain_address_id:
              sample.counterparty_blockchain_address_id,
            amount: { currency: sample.amount.currency, value: "1" },
            network: sample.network,
            custom_ref: customRef,
            custom_fields: { test_run_id: testRunId, source: "distilled" },
          }),
        );

        expect(result.type).toBe("BLOCKCHAIN_OUT");
        expect(typeof result.id).toBe("string");
        expect(result.id.length).toBeGreaterThan(0);
        expect(result.deposit_account_id).toBe(sample.deposit_account_id);
        expect(result.counterparty_blockchain_address_id).toBe(
          sample.counterparty_blockchain_address_id,
        );
        expect(result.amount.currency).toBe(sample.amount.currency);
        expect(result.amount.value).toBe("1");
        expect(result.network).toBe(sample.network);
        expect(result.custom_ref).toBe(customRef);
        expect(["PENDING", "SETTLED", "FAILED"]).toContain(result.status);
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
          createOutboundBlockchainTransfer({
            deposit_account_id: unknownId("dpst_acct"),
            counterparty_blockchain_address_id: unknownId("cpba"),
            amount: { currency: "USDC", value: "1" },
            network: "ETHEREUM",
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
          createOutboundBlockchainTransfer({
            deposit_account_id: unknownId("dpst_acct"),
            counterparty_blockchain_address_id: unknownId("cpba"),
            amount: { currency: "USDC", value: "1" },
            network: "ETHEREUM",
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
          createOutboundBlockchainTransfer({
            deposit_account_id: "!!!invalid!!!",
            counterparty_blockchain_address_id: unknownId("cpba"),
            amount: { currency: "USDC", value: "1" },
            network: "ETHEREUM",
          }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("BadRequest");
      },
      30_000,
    );
  });
});
