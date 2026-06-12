/**
 * Tests for the `getInboundBlockchainTransfer` operation.
 *
 * Happy path discovers a real id via `listInboundBlockchainTransfers`.
 * Error coverage hits Forbidden (bad key), NotFound (well-formed-but-
 * missing id), and the BadRequest path declared by the spec patch.
 */
import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { getInboundBlockchainTransfer } from "../src/operations/getInboundBlockchainTransfer.ts";
import { listInboundBlockchainTransfers } from "../src/operations/listInboundBlockchainTransfers.ts";
import { runEffect, testRunId, unknownId } from "./setup.ts";

describe("getInboundBlockchainTransfer", () => {
  describe("happy path", () => {
    it(
      "fetches an inbound blockchain transfer by id",
      async () => {
        const list = await runEffect(
          listInboundBlockchainTransfers({ page_size: 1 }),
        );
        if (list.data.length === 0) return;

        const target = list.data[0]!;
        const result = await runEffect(
          getInboundBlockchainTransfer({ id: target.id }),
        );

        expect(result.type).toBe("BLOCKCHAIN_IN");
        expect(result.id).toBe(target.id);
        expect(typeof result.deposit_account_id).toBe("string");
        expect(["USAT", "USDC", "USDT"]).toContain(result.amount.currency);
        expect(typeof result.amount.value).toBe("string");
        expect(["BASE", "ETHEREUM", "INK", "SOLANA", "SUI"]).toContain(
          result.network,
        );
        expect([
          "PENDING",
          "NEEDS_ATTRIBUTION",
          "SETTLED",
          "FAILED",
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
          getInboundBlockchainTransfer({ id: unknownId("blockchain_in") }).pipe(
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
          getInboundBlockchainTransfer({ id: unknownId("blockchain_in") }).pipe(
            Effect.flip,
          ),
        )) as { _tag: string };

        expect(error._tag).toBe("NotFound");
      },
      30_000,
    );

    it(
      "malformed inbound blockchain transfer id -> BadRequest",
      async () => {
        // Spec patch declares 400 INVALID_REQUEST on GET
        // /blockchain_in/{id}. A clearly malformed path segment exercises
        // that branch.
        const error = (await runEffect(
          getInboundBlockchainTransfer({ id: "!!!invalid!!!" }).pipe(
            Effect.flip,
          ),
        )) as { _tag: string };

        expect(error._tag).toBe("BadRequest");
      },
      30_000,
    );
  });
});
