import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { listInboundBlockchainTransfers } from "../src/operations/listInboundBlockchainTransfers.ts";
import { simulateBlockchainIn } from "../src/operations/simulateBlockchainIn.ts";
import { runEffect, unknownId } from "./setup.ts";

describe("simulateBlockchainIn", () => {
  describe("happy path", () => {
    it("simulates an inbound blockchain transfer to an existing deposit account", async () => {
      const list = await runEffect(
        listInboundBlockchainTransfers({ page_size: 1 }),
      );
      if (list.data.length === 0) return;
      const source = list.data[0]!;
      const result = await runEffect(
        simulateBlockchainIn({
          deposit_account_id: source.deposit_account_id,
          amount: { currency: "USDC", value: "100" },
          network: "BASE",
        }),
      );
      expect(result.deposit_account_id).toBe(source.deposit_account_id);
      expect(result.amount.currency).toBe("USDC");
      expect(result.amount.value).toBe("100");
      expect(typeof result.transaction_hash).toBe("string");
    }, 30_000);
  });

  describe("errors", () => {
    it("returns Unauthorized when credentials are invalid", async () => {
      const BadCreds = Layer.succeed(Credentials, {
        apiKey: Redacted.make("not-a-real-key"),
        apiBaseUrl: DEFAULT_API_BASE_URL,
      });
      const error = await Effect.runPromise(
        simulateBlockchainIn({
          deposit_account_id: unknownId("dpst_acct"),
          amount: { currency: "USDC", value: "100" },
          network: "BASE",
        }).pipe(
          Effect.flip,
          Effect.provide(Layer.merge(BadCreds, FetchHttpClient.layer)),
        ),
      );
      expect(error._tag).toBe("Unauthorized");
    }, 30_000);

    it("returns BadRequest for a non-existent deposit_account_id", async () => {
      const error = await runEffect(
        simulateBlockchainIn({
          deposit_account_id: unknownId("dpst_acct"),
          amount: { currency: "USDC", value: "100" },
          network: "BASE",
        }).pipe(Effect.flip),
      );
      expect(error._tag).toBe("BadRequest");
    }, 30_000);
  });
});
