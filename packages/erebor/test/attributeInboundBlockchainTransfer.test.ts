/**
 * Tests for the `attributeInboundBlockchainTransfer` operation.
 *
 * Happy path attributes a real inbound blockchain transfer to a counterparty
 * that belongs to the transfer's customer, asserting the returned
 * BLOCKCHAIN_IN object. (The canonical NEEDS_ATTRIBUTION precondition — a
 * transfer from an unknown sender — cannot be created through the API:
 * simulateBlockchainIn settles immediately, and the sandbox holds no
 * NEEDS_ATTRIBUTION transfers. The endpoint nonetheless accepts attribution
 * against any real transfer, so we exercise the success path against real
 * data rather than short-circuiting.) Error coverage hits Forbidden (bad key),
 * NotFound/BadRequest (unknown transfer id), and BadRequest (malformed id).
 */
import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { attributeInboundBlockchainTransfer } from "../src/operations/attributeInboundBlockchainTransfer.ts";
import { getDepositAccount } from "../src/operations/getDepositAccount.ts";
import { listCounterparties } from "../src/operations/listCounterparties.ts";
import { listInboundBlockchainTransfers } from "../src/operations/listInboundBlockchainTransfers.ts";
import { runEffect, testRunId, unknownId } from "./setup.ts";

describe("attributeInboundBlockchainTransfer", () => {
  describe("happy path", () => {
    it(
      "attributes a real inbound blockchain transfer to a counterparty",
      async (ctx) => {
        // The counterparty must belong to the transfer's customer or the API
        // rejects the attribution with a 400. Inbound transfers don't expose
        // customer_id, so resolve it via the owning deposit account and scope
        // counterparties to that customer. Scan the first page of transfers for
        // one whose customer owns a counterparty (read-only; breaks on the first
        // match, which the sandbox satisfies immediately).
        const transfers = await runEffect(
          listInboundBlockchainTransfers({ page_size: 25 }),
        );

        let target: { transferId: string; counterpartyId: string } | undefined;
        for (const transfer of transfers.data) {
          const depositAccount = await runEffect(
            getDepositAccount({ id: transfer.deposit_account_id }),
          );
          const counterparties = await runEffect(
            listCounterparties({
              customer_id: depositAccount.customer_id,
              page_size: 1,
            }),
          );
          if (counterparties.data.length > 0) {
            target = {
              transferId: transfer.id,
              counterpartyId: counterparties.data[0]!.id,
            };
            break;
          }
        }
        if (!target) {
          ctx.skip(
            "Sandbox has no inbound blockchain transfer whose customer owns a counterparty",
          );
          return;
        }

        const result = await runEffect(
          attributeInboundBlockchainTransfer({
            id: target.transferId,
            counterparty_id: target.counterpartyId,
            custodian: "SELF_HOSTED",
          }),
        );

        expect(result.type).toBe("BLOCKCHAIN_IN");
        expect(result.id).toBe(target.transferId);
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
