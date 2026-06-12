import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { getTransaction } from "../src/operations/getTransaction.ts";
import { listTransactions } from "../src/operations/listTransactions.ts";
import { runEffect, unknownId } from "./setup.ts";

describe("getTransaction", () => {
  describe("happy path", () => {
    it("retrieves an existing transaction by id", async () => {
      const list = await runEffect(listTransactions({ page_size: 1 }));
      if (list.data.length === 0) return;
      const target = list.data[0]!;
      const result = await runEffect(getTransaction({ id: target.id }));
      expect(result.type).toBe("TRANSACTION");
      expect(result.id).toBe(target.id);
      expect([
        "CREATED",
        "PENDING",
        "SETTLED",
        "FAILED",
        "REVERSED",
      ]).toContain(result.status);
      expect(typeof result.description).toBe("string");
    }, 30_000);
  });

  describe("errors", () => {
    it("returns Unauthorized when credentials are invalid", async () => {
      const BadCreds = Layer.succeed(Credentials, {
        apiKey: Redacted.make("not-a-real-key"),
        apiBaseUrl: DEFAULT_API_BASE_URL,
      });
      const error = await Effect.runPromise(
        getTransaction({ id: unknownId("txn") }).pipe(
          Effect.flip,
          Effect.provide(Layer.merge(BadCreds, FetchHttpClient.layer)),
        ),
      );
      expect(error._tag).toBe("Unauthorized");
    }, 30_000);

    it("returns NotFound for a non-existent id", async () => {
      const error = await runEffect(
        getTransaction({ id: unknownId("txn") }).pipe(Effect.flip),
      );
      expect(error._tag).toBe("NotFound");
    }, 30_000);

    it("returns BadRequest for a malformed id", async () => {
      const error = await runEffect(
        getTransaction({ id: "!!!invalid!!!" }).pipe(Effect.flip),
      );
      expect(error._tag).toBe("BadRequest");
    }, 30_000);
  });
});
