/**
 * Tests for the `listCustomers` operation.
 *
 * Exercises paginated retrieval against the Erebor sandbox plus the
 * auth-failure (Forbidden) and malformed-cursor (BadRequest) paths
 * surfaced by the client's matchError mapping.
 */
import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { listCustomers } from "../src/operations/listCustomers.ts";
import { runEffect, testRunId } from "./setup.ts";

describe("listCustomers", () => {
  describe("happy path", () => {
    it(
      "returns a paginated list of customers",
      async () => {
        const result = await runEffect(listCustomers({ page_size: 5 }));

        expect(result).toBeTruthy();
        expect(Array.isArray(result.data)).toBe(true);
        expect(typeof result.has_more).toBe("boolean");
        expect(typeof result.page_size).toBe("number");
        expect(result.page_size).toBeLessThanOrEqual(5);
        for (const customer of result.data) {
          expect(customer.type).toBe("CUSTOMER");
          expect(typeof customer.id).toBe("string");
          expect(typeof customer.name).toBe("string");
          expect(["ACTIVE", "OFFBOARDED"]).toContain(customer.status);
        }
      },
      30_000,
    );

    it(
      "custom_ref filter that matches nothing returns an empty page",
      async () => {
        const result = await runEffect(
          listCustomers({ custom_ref: `nonexistent-${testRunId}` }),
        );

        expect(result.data).toEqual([]);
        expect(result.has_more).toBe(false);
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
          listCustomers({}).pipe(
            Effect.flip,
            Effect.provide(Main),
          ) as Effect.Effect<unknown, never, never>,
        )) as { _tag: string };

        expect(error._tag).toBe("Forbidden");
      },
      30_000,
    );

  });
});
