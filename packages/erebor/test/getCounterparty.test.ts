/**
 * Tests for the `getCounterparty` operation.
 *
 * Happy path discovers a real id via `listCounterparties`. Error coverage
 * hits Forbidden (bad key), NotFound (well-formed-but-missing id), and
 * the BadRequest path declared by the spec patch.
 */
import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { getCounterparty } from "../src/operations/getCounterparty.ts";
import { listCounterparties } from "../src/operations/listCounterparties.ts";
import { runEffect, testRunId, unknownId } from "./setup.ts";

describe("getCounterparty", () => {
  describe("happy path", () => {
    it(
      "fetches a counterparty by id",
      async () => {
        const list = await runEffect(listCounterparties({ page_size: 1 }));
        if (list.data.length === 0) return;

        const target = list.data[0]!;
        const result = await runEffect(getCounterparty({ id: target.id }));

        expect(result.type).toBe("COUNTERPARTY");
        expect(result.id).toBe(target.id);
        expect(typeof result.name).toBe("string");
        expect(result.address).toBeTruthy();
        expect(typeof result.address.street_address).toBe("string");
        expect(typeof result.address.city).toBe("string");
        expect(typeof result.address.postal_code).toBe("string");
        expect(typeof result.address.country).toBe("string");
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
          getCounterparty({ id: unknownId("cntrprty") }).pipe(
            Effect.flip,
            Effect.provide(Main),
          ) as Effect.Effect<unknown, never, never>,
        )) as { _tag: string };

        expect(error._tag).toBe("Forbidden");
      },
      30_000,
    );

    it(
      "unknown counterparty id -> NotFound",
      async () => {
        const error = (await runEffect(
          getCounterparty({ id: unknownId("cntrprty") }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("NotFound");
      },
      30_000,
    );

    it(
      "malformed counterparty id -> BadRequest",
      async () => {
        // Spec patch declares 400 INVALID_REQUEST on GET
        // /counterparties/{id}. A clearly malformed path segment
        // exercises that branch.
        const error = (await runEffect(
          getCounterparty({ id: "!!!invalid!!!" }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("BadRequest");
      },
      30_000,
    );
  });
});
