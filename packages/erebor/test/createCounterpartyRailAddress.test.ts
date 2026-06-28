/**
 * Tests for the `createCounterpartyRailAddress` operation.
 *
 * The API now requires the `address` to resolve to a real Erebor account (a
 * synthetic `@handle` is rejected with BadRequest "Rail address does not
 * resolve to an Erebor account."). The happy path therefore sources a
 * known-resolvable address from an existing counterparty rail address and
 * attaches it to a freshly-created counterparty, so the (counterparty, address)
 * pair is always new — the API rejects duplicate pairs. Error coverage hits
 * Forbidden (bad key), BadRequest (unknown counterparty_id), and BadRequest
 * (malformed counterparty_id).
 */
import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { createCounterparty } from "../src/operations/createCounterparty.ts";
import { createCounterpartyRailAddress } from "../src/operations/createCounterpartyRailAddress.ts";
import { listCounterpartyRailAddresses } from "../src/operations/listCounterpartyRailAddresses.ts";
import { runEffect, testRunId, unknownId } from "./setup.ts";

describe("createCounterpartyRailAddress", () => {
  describe("happy path", () => {
    it(
      "creates a rail address for an existing counterparty",
      async (ctx) => {
        // Source a known-resolvable address. Synthetic handles are rejected,
        // so reuse the value of an existing rail address (guaranteed to
        // resolve to a real Erebor account).
        const existing = await runEffect(
          listCounterpartyRailAddresses({ page_size: 1 }),
        );
        if (existing.data.length === 0) {
          ctx.skip("No existing rail address to source a resolvable value from");
          return;
        }
        const resolvableAddress = existing.data[0]!.address;

        // Attach it to a brand-new counterparty so the (counterparty, address)
        // pair is unique — the API rejects a duplicate pair. A single create,
        // no candidate-walking.
        const counterparty = await runEffect(
          createCounterparty({
            name: `Distilled Rail Counterparty ${testRunId}`,
            address: {
              street_address: "123 Test Street",
              city: "San Francisco",
              country_area: "CA",
              postal_code: "94105",
              country: "US",
            },
          }),
        );

        const customRef = `distilled-erebor-${testRunId}`;
        const result = await runEffect(
          createCounterpartyRailAddress({
            counterparty_id: counterparty.id,
            description: `Distilled test rail ${testRunId}`,
            address: resolvableAddress,
            custom_ref: customRef,
            custom_fields: { test_run_id: testRunId, source: "distilled" },
          }),
        );

        expect(result.type).toBe("COUNTERPARTY_RAIL_ADDRESS");
        expect(typeof result.id).toBe("string");
        expect(result.id.length).toBeGreaterThan(0);
        expect(result.counterparty_id).toBe(counterparty.id);
        expect(result.address).toBe(resolvableAddress);
        expect(result.custom_ref).toBe(customRef);
        // The API stores but does not echo `description` on create — it
        // returns null regardless of the submitted value.
        expect(result.description).toBeNull();
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
          createCounterpartyRailAddress({
            counterparty_id: unknownId("cntrprty"),
            address: `@distilled_forbidden_${testRunId}`,
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
      "missing counterparty id -> BadRequest",
      async () => {
        // Well-formed but unrecognised counterparty id.
        const error = (await runEffect(
          createCounterpartyRailAddress({
            counterparty_id: unknownId("cntrprty"),
            address: `@distilled_notfound_${testRunId}`,
          }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("BadRequest");
      },
      30_000,
    );

    it(
      "malformed counterparty id -> BadRequest",
      async () => {
        // A lexically invalid counterparty id forces 400 INVALID_REQUEST.
        const error = (await runEffect(
          createCounterpartyRailAddress({
            counterparty_id: "!!!invalid!!!",
            address: `@distilled_badreq_${testRunId}`,
          }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("BadRequest");
      },
      30_000,
    );
  });
});
