/**
 * Tests for the `listCounterpartyRailAddresses` operation.
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
import { listCounterpartyRailAddresses } from "../src/operations/listCounterpartyRailAddresses.ts";
import { runEffect, testRunId } from "./setup.ts";

describe("listCounterpartyRailAddresses", () => {
  describe("happy path", () => {
    it(
      "returns a paginated list of counterparty rail addresses",
      async () => {
        const result = await runEffect(
          listCounterpartyRailAddresses({ page_size: 5 }),
        );

        expect(result).toBeTruthy();
        expect(Array.isArray(result.data)).toBe(true);
        expect(typeof result.has_more).toBe("boolean");
        expect(typeof result.page_size).toBe("number");
        expect(result.page_size).toBeLessThanOrEqual(5);
        for (const addr of result.data) {
          expect(addr.type).toBe("COUNTERPARTY_RAIL_ADDRESS");
          expect(typeof addr.id).toBe("string");
          expect(typeof addr.address).toBe("string");
        }
      },
      30_000,
    );

    it(
      "custom_ref filter that matches nothing returns an empty page",
      async () => {
        const result = await runEffect(
          listCounterpartyRailAddresses({
            custom_ref: `nonexistent-${testRunId}`,
          }),
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
          listCounterpartyRailAddresses({}).pipe(
            Effect.flip,
            Effect.provide(Main),
          ) as Effect.Effect<unknown, never, never>,
        )) as { _tag: string };

        expect(error._tag).toBe("Forbidden");
      },
      30_000,
    );

    it(
      "malformed pagination cursor -> BadRequest",
      async () => {
        // A `starting_after` value that is not a valid resource ID forces
        // the API to reject the request with 400 INVALID_REQUEST rather
        // than silently returning an empty page.
        const error = (await runEffect(
          listCounterpartyRailAddresses({
            starting_after: "not-a-real-cursor",
          }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("BadRequest");
      },
      30_000,
    );
  });
});
