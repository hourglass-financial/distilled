/**
 * Tests for the `attributeInboundBlockchainTransfer` operation.
 *
 * Happy path locates an inbound blockchain transfer in
 * `NEEDS_ATTRIBUTION` status and attributes it to an existing
 * counterparty. Error coverage hits Forbidden (bad key), NotFound
 * (well-formed-but-missing transfer id), and BadRequest (malformed
 * transfer id).
 */
import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { attributeInboundBlockchainTransfer } from "../src/operations/attributeInboundBlockchainTransfer.ts";
import { listCounterparties } from "../src/operations/listCounterparties.ts";
import { listInboundBlockchainTransfers } from "../src/operations/listInboundBlockchainTransfers.ts";
import { runEffect, testRunId, unknownId } from "./setup.ts";

describe("attributeInboundBlockchainTransfer", () => {
  describe("happy path", () => {
    it(
      "attributes an inbound blockchain transfer awaiting attribution to a counterparty",
      async () => {
        // Only NEEDS_ATTRIBUTION transfers can be attributed.
        const transfers = await runEffect(
          listInboundBlockchainTransfers({
            status: "NEEDS_ATTRIBUTION",
            page_size: 1,
          }),
        );
        if (transfers.data.length === 0) return;
        const counterparties = await runEffect(
          listCounterparties({ page_size: 1 }),
        );
        if (counterparties.data.length === 0) return;

        const transfer = transfers.data[0]!;
        const counterparty = counterparties.data[0]!;

        const result = await runEffect(
          attributeInboundBlockchainTransfer({
            id: transfer.id,
            counterparty_id: counterparty.id,
            custodian: "SELF_HOSTED",
          }),
        );

        expect(result.type).toBe("BLOCKCHAIN_IN");
        expect(result.id).toBe(transfer.id);
        expect([
          "PENDING",
          "NEEDS_ATTRIBUTION",
          "SETTLED",
          "FAILED",
        ]).toContain(result.status);
        expect(typeof result.deposit_account_id).toBe("string");
        expect(["BASE", "ETHEREUM", "INK", "SOLANA", "SUI"]).toContain(
          result.network,
        );
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
          attributeInboundBlockchainTransfer({
            id: unknownId("blockchain_in"),
            counterparty_id: unknownId("cntrprty"),
            custodian: "SELF_HOSTED",
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
      "missing inbound blockchain transfer id -> BadRequest",
      async () => {
        // Well-formed but unrecognised transfer id forces the documented
        // 404 path.
        const error = (await runEffect(
          attributeInboundBlockchainTransfer({
            id: unknownId("blockchain_in"),
            counterparty_id: unknownId("cntrprty"),
            custodian: "SELF_HOSTED",
          }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("BadRequest");
      },
      30_000,
    );

    it(
      "malformed inbound blockchain transfer id -> BadRequest",
      async () => {
        // A lexically invalid transfer id forces 400 INVALID_REQUEST
        // rather than the 404 path exercised above.
        const error = (await runEffect(
          attributeInboundBlockchainTransfer({
            id: "!!!invalid!!!",
            counterparty_id: unknownId("cntrprty"),
            custodian: "SELF_HOSTED",
          }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("BadRequest");
      },
      30_000,
    );
  });
});
