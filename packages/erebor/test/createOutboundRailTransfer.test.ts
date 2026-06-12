import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { createOutboundRailTransfer } from "../src/operations/createOutboundRailTransfer.ts";
import { listOutboundRailTransfers } from "../src/operations/listOutboundRailTransfers.ts";
import { runEffect, testRunId, unknownId } from "./setup.ts";

describe("createOutboundRailTransfer", () => {
  describe("happy path", () => {
    it("creates an outbound rail transfer", async () => {
      const list = await runEffect(listOutboundRailTransfers({ page_size: 1 }));
      if (list.data.length === 0) return;
      const source = list.data[0]!;
      if (!source.counterparty_rail_address_id) return;
      const result = await runEffect(
        createOutboundRailTransfer({
          from_deposit_account_id: source.from_deposit_account_id,
          counterparty_rail_address_id: source.counterparty_rail_address_id,
          amount: { currency: "USD", value: "100" },
          custom_ref: `distilled-erebor-${testRunId}`,
          custom_fields: { test_run_id: testRunId, source: "distilled" },
        }),
      );
      expect(result.type).toBe("RAIL_OUT");
      expect(typeof result.id).toBe("string");
      expect(result.from_deposit_account_id).toBe(source.from_deposit_account_id);
      expect(["PENDING", "SETTLED", "FAILED"]).toContain(result.status);
    }, 30_000);
  });

  describe("errors", () => {
    it("returns Unauthorized when credentials are invalid", async () => {
      const BadCreds = Layer.succeed(Credentials, {
        apiKey: Redacted.make("not-a-real-key"),
        apiBaseUrl: DEFAULT_API_BASE_URL,
      });
      const error = await Effect.runPromise(
        createOutboundRailTransfer({
          from_deposit_account_id: unknownId("dpst_acct"),
          counterparty_rail_address_id: unknownId("cp_rail_addr"),
          amount: { currency: "USD", value: "100" },
        }).pipe(
          Effect.flip,
          Effect.provide(Layer.merge(BadCreds, FetchHttpClient.layer)),
        ),
      );
      expect(error._tag).toBe("Unauthorized");
    }, 30_000);

    it("returns BadRequest for non-existent from_deposit_account_id", async () => {
      const error = await runEffect(
        createOutboundRailTransfer({
          from_deposit_account_id: unknownId("dpst_acct"),
          counterparty_rail_address_id: unknownId("cp_rail_addr"),
          amount: { currency: "USD", value: "100" },
        }).pipe(Effect.flip),
      );
      expect(error._tag).toBe("BadRequest");
    }, 30_000);

    it("returns BadRequest for a malformed from_deposit_account_id", async () => {
      const error = await runEffect(
        createOutboundRailTransfer({
          from_deposit_account_id: "!!!invalid!!!",
          counterparty_rail_address_id: unknownId("cp_rail_addr"),
          amount: { currency: "USD", value: "100" },
        }).pipe(Effect.flip),
      );
      expect(error._tag).toBe("BadRequest");
    }, 30_000);

    it("returns EreborValidationError for an invalid amount value", async () => {
      const list = await runEffect(listOutboundRailTransfers({ page_size: 1 }));
      if (list.data.length === 0) return;
      const source = list.data[0]!;
      if (!source.counterparty_rail_address_id) return;
      const error = await runEffect(
        createOutboundRailTransfer({
          from_deposit_account_id: source.from_deposit_account_id,
          counterparty_rail_address_id: source.counterparty_rail_address_id,
          amount: { currency: "USD", value: "not-a-number" },
        }).pipe(Effect.flip),
      );
      expect(error._tag).toBe("EreborValidationError");
    }, 30_000);
  });
});
