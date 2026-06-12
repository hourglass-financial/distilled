import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { getOutboundInternationalWireTransfer } from "../src/operations/getOutboundInternationalWireTransfer.ts";
import { listOutboundInternationalWireTransfers } from "../src/operations/listOutboundInternationalWireTransfers.ts";
import { runEffect, unknownId } from "./setup.ts";

describe("getOutboundInternationalWireTransfer", () => {
  describe("happy path", () => {
    it("retrieves an existing outbound international wire transfer by id", async () => {
      const list = await runEffect(
        listOutboundInternationalWireTransfers({ page_size: 1 }),
      );
      if (list.data.length === 0) return;
      const target = list.data[0]!;
      const result = await runEffect(
        getOutboundInternationalWireTransfer({ id: target.id }),
      );
      expect(result.type).toBe("INTERNATIONAL_WIRE_OUT");
      expect(result.id).toBe(target.id);
      expect(typeof result.deposit_account_id).toBe("string");
      expect(typeof result.counterparty_international_bank_account_id).toBe(
        "string",
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
        getOutboundInternationalWireTransfer({
          id: unknownId("international_wire_out"),
        }).pipe(
          Effect.flip,
          Effect.provide(Layer.merge(BadCreds, FetchHttpClient.layer)),
        ),
      );
      expect(error._tag).toBe("Unauthorized");
    }, 30_000);

    it("returns NotFound for a non-existent id", async () => {
      const error = await runEffect(
        getOutboundInternationalWireTransfer({
          id: unknownId("international_wire_out"),
        }).pipe(Effect.flip),
      );
      expect(error._tag).toBe("NotFound");
    }, 30_000);

    it("returns BadRequest for a malformed id", async () => {
      const error = await runEffect(
        getOutboundInternationalWireTransfer({ id: "!!!invalid!!!" }).pipe(
          Effect.flip,
        ),
      );
      expect(error._tag).toBe("BadRequest");
    }, 30_000);
  });
});
