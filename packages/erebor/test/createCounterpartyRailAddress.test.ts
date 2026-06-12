/**
 * Tests for the `createCounterpartyRailAddress` operation.
 *
 * Happy path discovers a real `counterparty_id` via `listCounterparties`
 * and attaches a new rail address with a unique `@handle`. Error coverage
 * hits Forbidden (bad key), NotFound (unknown counterparty_id), and
 * BadRequest (malformed counterparty_id).
 */
import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { createCounterpartyRailAddress } from "../src/operations/createCounterpartyRailAddress.ts";
import { listCounterparties } from "../src/operations/listCounterparties.ts";
import { runEffect, testRunId, unknownId } from "./setup.ts";

// Erebor rail addresses are `@handle` strings. The handle must be unique,
// so we incorporate testRunId to avoid collisions across runs.
const railHandle = `@distilled_${testRunId}`;

describe("createCounterpartyRailAddress", () => {
  describe("happy path", () => {
    it(
      "creates a rail address for an existing counterparty",
      async () => {
        const list = await runEffect(listCounterparties({ page_size: 1 }));
        if (list.data.length === 0) return;

        const counterparty = list.data[0]!;
        const customRef = `distilled-erebor-${testRunId}`;
        const result = await runEffect(
          createCounterpartyRailAddress({
            counterparty_id: counterparty.id,
            description: `Distilled test rail ${testRunId}`,
            address: railHandle,
            custom_ref: customRef,
            custom_fields: { test_run_id: testRunId, source: "distilled" },
          }),
        );

        expect(result.type).toBe("COUNTERPARTY_RAIL_ADDRESS");
        expect(typeof result.id).toBe("string");
        expect(result.id.length).toBeGreaterThan(0);
        expect(result.counterparty_id).toBe(counterparty.id);
        expect(result.description).toBe(`Distilled test rail ${testRunId}`);
        expect(result.address).toBe(railHandle);
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
        // Well-formed but unrecognised counterparty id forces the
        // documented 404 path.
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
        // A lexically invalid counterparty id forces 400 INVALID_REQUEST
        // rather than the 404 path exercised above.
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
