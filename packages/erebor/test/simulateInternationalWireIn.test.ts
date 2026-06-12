import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { listInboundInternationalWireTransfers } from "../src/operations/listInboundInternationalWireTransfers.ts";
import { simulateInternationalWireIn } from "../src/operations/simulateInternationalWireIn.ts";
import { runEffect, unknownId } from "./setup.ts";

describe("simulateInternationalWireIn", () => {
  describe("happy path", () => {
    it("simulates an inbound international wire to an existing deposit account", async () => {
      const list = await runEffect(
        listInboundInternationalWireTransfers({ page_size: 1 }),
      );
      if (list.data.length === 0) return;
      const source = list.data[0]!;
      const result = await runEffect(
        simulateInternationalWireIn({
          deposit_account_id: source.deposit_account_id,
          amount: { currency: "USD", value: "100" },
          originator_name: "Distilled Test Originator",
          originator_account_number: "GB29NWBK60161331926819",
          originator_bic: "NWBKGB2L",
        }),
      );
      expect(result.deposit_account_id).toBe(source.deposit_account_id);
      expect(result.amount.currency).toBe("USD");
      expect(result.amount.value).toBe("100");
      expect(typeof result.international_wire_in_id).toBe("string");
    }, 30_000);
  });

  describe("errors", () => {
    it("returns Unauthorized when credentials are invalid", async () => {
      const BadCreds = Layer.succeed(Credentials, {
        apiKey: Redacted.make("not-a-real-key"),
        apiBaseUrl: DEFAULT_API_BASE_URL,
      });
      const error = await Effect.runPromise(
        simulateInternationalWireIn({
          deposit_account_id: unknownId("dpst_acct"),
          amount: { currency: "USD", value: "100" },
          originator_name: "Distilled Test Originator",
          originator_account_number: "GB29NWBK60161331926819",
          originator_bic: "NWBKGB2L",
        }).pipe(
          Effect.flip,
          Effect.provide(Layer.merge(BadCreds, FetchHttpClient.layer)),
        ),
      );
      expect(error._tag).toBe("Unauthorized");
    }, 30_000);

    it("returns BadRequest when both deposit_account_id and account_number are provided", async () => {
      const error = await runEffect(
        simulateInternationalWireIn({
          deposit_account_id: unknownId("dpst_acct"),
          account_number: "000123456789",
          routing_number: "021000021",
          amount: { currency: "USD", value: "100" },
          originator_name: "Distilled Test Originator",
          originator_account_number: "GB29NWBK60161331926819",
          originator_bic: "NWBKGB2L",
        }).pipe(Effect.flip),
      );
      expect(error._tag).toBe("BadRequest");
    }, 30_000);

    // The documented Conflict path requires reusing an `Erebor-Idempotency-Key`
    // across customers (per the operation JSDoc). That header is not exposed
    // by this operation's input schema, so a Conflict cannot be triggered from
    // the SDK surface. Unresolvable account_number/routing_number pairs surface
    // as BadRequest (covered above), not Conflict.
  });
});
