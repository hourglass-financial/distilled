import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { listOutboundInternationalWireTransfers } from "../src/operations/listOutboundInternationalWireTransfers.ts";
import { runEffect } from "./setup.ts";

describe("listOutboundInternationalWireTransfers", () => {
  describe("happy path", () => {
    it("returns a paginated list of outbound international wire transfers", async () => {
      const result = await runEffect(
        listOutboundInternationalWireTransfers({ page_size: 5 }),
      );
      expect(Array.isArray(result.data)).toBe(true);
      expect(typeof result.has_more).toBe("boolean");
      expect(typeof result.page_size).toBe("number");
      expect(result.page_size).toBeLessThanOrEqual(5);
      for (const transfer of result.data) {
        expect(transfer.type).toBe("INTERNATIONAL_WIRE_OUT");
        expect(typeof transfer.id).toBe("string");
        expect(typeof transfer.deposit_account_id).toBe("string");
        expect(typeof transfer.counterparty_international_bank_account_id).toBe(
          "string",
        );
        expect(["PENDING", "SETTLED", "FAILED", "RETURNED"]).toContain(
          transfer.status,
        );
      }
    }, 30_000);
  });

  describe("errors", () => {
    it("returns Unauthorized when credentials are invalid", async () => {
      const BadCreds = Layer.succeed(Credentials, {
        apiKey: Redacted.make("not-a-real-key"),
        apiBaseUrl: DEFAULT_API_BASE_URL,
      });
      const error = await Effect.runPromise(
        listOutboundInternationalWireTransfers({ page_size: 1 }).pipe(
          Effect.flip,
          Effect.provide(Layer.merge(BadCreds, FetchHttpClient.layer)),
        ),
      );
      expect(error._tag).toBe("Unauthorized");
    }, 30_000);

    it("returns BadRequest for an invalid page_size", async () => {
      const error = await runEffect(
        listOutboundInternationalWireTransfers({ page_size: -1 }).pipe(
          Effect.flip,
        ),
      );
      expect(error._tag).toBe("BadRequest");
    }, 30_000);
  });
});
