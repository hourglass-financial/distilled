import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { listTransactions } from "../src/operations/listTransactions.ts";
import { runEffect } from "./setup.ts";

const TRANSACTION_TYPES = [
  "ACH_IN",
  "ACH_OUT",
  "WIRE_IN",
  "WIRE_OUT",
  "INTERNATIONAL_WIRE_IN",
  "INTERNATIONAL_WIRE_OUT",
  "BLOCKCHAIN_IN",
  "BLOCKCHAIN_OUT",
  "RAIL_IN",
  "RAIL_OUT",
  "BOOK_TRANSFER",
  "INTEREST",
  "FEE",
  "ADJUSTMENT",
];

describe("listTransactions", () => {
  describe("happy path", () => {
    it("returns a paginated list of transactions", async () => {
      const result = await runEffect(listTransactions({ page_size: 5 }));
      expect(Array.isArray(result.data)).toBe(true);
      expect(typeof result.has_more).toBe("boolean");
      expect(typeof result.page_size).toBe("number");
      expect(result.page_size).toBeLessThanOrEqual(5);
      for (const transaction of result.data) {
        expect(transaction.type).toBe("TRANSACTION");
        expect(typeof transaction.id).toBe("string");
        expect([
          "CREATED",
          "PENDING",
          "SETTLED",
          "FAILED",
          "REVERSED",
        ]).toContain(transaction.status);
        expect(TRANSACTION_TYPES).toContain(transaction.transaction_type);
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
        listTransactions({ page_size: 1 }).pipe(
          Effect.flip,
          Effect.provide(Layer.merge(BadCreds, FetchHttpClient.layer)),
        ),
      );
      expect(error._tag).toBe("Unauthorized");
    }, 30_000);

    it("returns BadRequest for an invalid page_size", async () => {
      const error = await runEffect(
        listTransactions({ page_size: -1 }).pipe(Effect.flip),
      );
      expect(error._tag).toBe("BadRequest");
    }, 30_000);
  });
});
