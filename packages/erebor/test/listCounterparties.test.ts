/**
 * Tests for the `listCounterparties` operation.
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
import { listCounterparties } from "../src/operations/listCounterparties.ts";
import { runEffect, testRunId } from "./setup.ts";

describe("listCounterparties", () => {
  describe("happy path", () => {
    it(
      "returns a paginated list of counterparties",
      async () => {
        const result = await runEffect(listCounterparties({ page_size: 5 }));

        expect(result).toBeTruthy();
        expect(Array.isArray(result.data)).toBe(true);
        expect(typeof result.has_more).toBe("boolean");
        expect(typeof result.page_size).toBe("number");
        expect(result.page_size).toBeLessThanOrEqual(5);
        for (const cp of result.data) {
          expect(cp.type).toBe("COUNTERPARTY");
          expect(typeof cp.id).toBe("string");
          expect(typeof cp.name).toBe("string");
          expect(cp.address).toBeTruthy();
          expect(typeof cp.address.street_address).toBe("string");
          expect(typeof cp.address.city).toBe("string");
          expect(typeof cp.address.postal_code).toBe("string");
          expect(typeof cp.address.country).toBe("string");
        }
      },
      30_000,
    );

    it(
      "custom_ref filter that matches nothing returns an empty page",
      async () => {
        const result = await runEffect(
          listCounterparties({ custom_ref: `nonexistent-${testRunId}` }),
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
          listCounterparties({}).pipe(
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
          listCounterparties({ starting_after: "not-a-real-cursor" }).pipe(
            Effect.flip,
          ),
        )) as { _tag: string };

        expect(error._tag).toBe("BadRequest");
      },
      30_000,
    );
  });
});
