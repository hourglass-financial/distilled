import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { createOutboundInternationalWireTransfer } from "../src/operations/createOutboundInternationalWireTransfer.ts";
import { listOutboundInternationalWireTransfers } from "../src/operations/listOutboundInternationalWireTransfers.ts";
import { runEffect, testRunId, unknownId } from "./setup.ts";

describe("createOutboundInternationalWireTransfer", () => {
  describe("happy path", () => {
    it("creates an outbound international wire transfer", async () => {
      const list = await runEffect(
        listOutboundInternationalWireTransfers({ page_size: 1 }),
      );
      if (list.data.length === 0) return;
      const source = list.data[0]!;
      const result = await runEffect(
        createOutboundInternationalWireTransfer({
          type: "INTERNATIONAL_WIRE_OUT",
          deposit_account_id: source.deposit_account_id,
          counterparty_international_bank_account_id:
            source.counterparty_international_bank_account_id,
          amount: { currency: "USD", value: "100" },
          custom_ref: `distilled-erebor-${testRunId}`,
          custom_fields: { test_run_id: testRunId, source: "distilled" },
        }),
      );
      expect(result.type).toBe("INTERNATIONAL_WIRE_OUT");
      expect(typeof result.id).toBe("string");
      expect(result.deposit_account_id).toBe(source.deposit_account_id);
      expect(result.counterparty_international_bank_account_id).toBe(
        source.counterparty_international_bank_account_id,
      );
      expect(["PENDING", "SETTLED", "FAILED", "RETURNED"]).toContain(
        result.status,
      );
    }, 30_000);
  });

  describe("errors", () => {
    it("returns Unauthorized when credentials are invalid", async () => {
      const BadCreds = Layer.succeed(Credentials, {
        apiKey: Redacted.make("not-a-real-key"),
        apiBaseUrl: DEFAULT_API_BASE_URL,
      });
      const error = await Effect.runPromise(
        createOutboundInternationalWireTransfer({
          type: "INTERNATIONAL_WIRE_OUT",
          deposit_account_id: unknownId("dpst_acct"),
          counterparty_international_bank_account_id: unknownId("cpiba"),
          amount: { currency: "USD", value: "100" },
        }).pipe(
          Effect.flip,
          Effect.provide(Layer.merge(BadCreds, FetchHttpClient.layer)),
        ),
      );
      expect(error._tag).toBe("Unauthorized");
    }, 30_000);

    it("returns BadRequest for non-existent deposit_account_id", async () => {
      const error = await runEffect(
        createOutboundInternationalWireTransfer({
          type: "INTERNATIONAL_WIRE_OUT",
          deposit_account_id: unknownId("dpst_acct"),
          counterparty_international_bank_account_id: unknownId("cpiba"),
          amount: { currency: "USD", value: "100" },
        }).pipe(Effect.flip),
      );
      expect(error._tag).toBe("BadRequest");
    }, 30_000);

    it("returns BadRequest for a malformed deposit_account_id", async () => {
      const error = await runEffect(
        createOutboundInternationalWireTransfer({
          type: "INTERNATIONAL_WIRE_OUT",
          deposit_account_id: "!!!invalid!!!",
          counterparty_international_bank_account_id: unknownId("cpiba"),
          amount: { currency: "USD", value: "100" },
        }).pipe(Effect.flip),
      );
      expect(error._tag).toBe("BadRequest");
    }, 30_000);

    it("returns EreborValidationError for an invalid amount value", async () => {
      const list = await runEffect(
        listOutboundInternationalWireTransfers({ page_size: 1 }),
      );
      if (list.data.length === 0) return;
      const source = list.data[0]!;
      const error = await runEffect(
        createOutboundInternationalWireTransfer({
          type: "INTERNATIONAL_WIRE_OUT",
          deposit_account_id: source.deposit_account_id,
          counterparty_international_bank_account_id:
            source.counterparty_international_bank_account_id,
          amount: { currency: "USD", value: "not-a-number" },
        }).pipe(Effect.flip),
      );
      expect(error._tag).toBe("EreborValidationError");
    }, 30_000);
  });
});
