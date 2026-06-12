/**
 * Tests for the `createCounterparty` operation.
 *
 * Happy path creates a counterparty with a minimal US address. Error
 * coverage hits Forbidden (bad key) and BadRequest (missing required
 * address fields).
 */
import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { createCounterparty } from "../src/operations/createCounterparty.ts";
import { runEffect, testRunId } from "./setup.ts";

describe("createCounterparty", () => {
  describe("happy path", () => {
    it(
      "creates a counterparty with a US address",
      async () => {
        const customRef = `distilled-erebor-${testRunId}`;
        const result = await runEffect(
          createCounterparty({
            name: `Distilled Test Counterparty ${testRunId}`,
            address: {
              street_address: "123 Test Street",
              city: "San Francisco",
              country_area: "CA",
              postal_code: "94105",
              country: "US",
            },
            custom_ref: customRef,
            custom_fields: { test_run_id: testRunId, source: "distilled" },
          }),
        );

        expect(result.type).toBe("COUNTERPARTY");
        expect(typeof result.id).toBe("string");
        expect(result.id.length).toBeGreaterThan(0);
        expect(result.name).toBe(`Distilled Test Counterparty ${testRunId}`);
        expect(result.address.street_address).toBe("123 Test Street");
        expect(result.address.city).toBe("San Francisco");
        expect(result.address.postal_code).toBe("94105");
        expect(result.address.country).toBe("US");
        expect(result.custom_ref).toBe(customRef);
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
          createCounterparty({
            name: `Distilled Test Counterparty ${testRunId}`,
            address: {
              street_address: "123 Test Street",
              city: "San Francisco",
              country_area: "CA",
              postal_code: "94105",
              country: "US",
            },
          }).pipe(
            Effect.flip,
            Effect.provide(Main),
          ) as Effect.Effect<unknown, never, never>,
        )) as { _tag: string };

        expect(error._tag).toBe("Forbidden");
      },
      30_000,
    );

    it(
      "empty address fields -> BadRequest",
      async () => {
        // Address fields are required and have non-empty validation. Empty
        // strings trigger 400 INVALID_REQUEST.
        const error = (await runEffect(
          createCounterparty({
            name: `Distilled Test Counterparty ${testRunId}`,
            address: {
              street_address: "",
              city: "",
              postal_code: "",
              country: "",
            },
          }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("BadRequest");
      },
      30_000,
    );
  });
});
