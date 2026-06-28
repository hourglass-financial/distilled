/**
 * Tests for the `archiveCounterparty` operation.
 *
 * Happy path creates a counterparty with a minimal US address, then
 * archives it (soft-delete sets `archived_at`). Error coverage hits
 * NotFound (unknown id), Forbidden (bad key), and NotFound again when
 * archiving an already-archived counterparty.
 */
import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { archiveCounterparty } from "../src/operations/archiveCounterparty.ts";
import { createCounterparty } from "../src/operations/createCounterparty.ts";
import { runEffect, testRunId, unknownId } from "./setup.ts";

describe("archiveCounterparty", () => {
  describe("happy path", () => {
    it(
      "archives an existing counterparty",
      async () => {
        const created = await runEffect(
          createCounterparty({
            name: `Distilled Archive Counterparty ${testRunId}`,
            address: {
              street_address: "123 Test Street",
              city: "San Francisco",
              country_area: "CA",
              postal_code: "94105",
              country: "US",
            },
          }),
        );

        const result = await runEffect(
          archiveCounterparty({ id: created.id }),
        );

        expect(result.type).toBe("COUNTERPARTY");
        expect(result.id).toBe(created.id);
        expect(typeof result.archived_at).toBe("string");
      },
      30_000,
    );
  });

  describe("errors", () => {
    it(
      "unknown id -> NotFound",
      async () => {
        const error = await runEffect(
          archiveCounterparty({ id: unknownId("cp") }).pipe(Effect.flip),
        );

        expect(error._tag).toBe("NotFound");
      },
      30_000,
    );

    it(
      "invalid API key -> Forbidden",
      async () => {
        const BadCreds = Layer.succeed(Credentials, {
          apiKey: Redacted.make(`test_key_invalid_${testRunId}`),
          apiBaseUrl: DEFAULT_API_BASE_URL,
        });
        const Main = Layer.merge(BadCreds, FetchHttpClient.layer);

        const error = await Effect.runPromise(
          archiveCounterparty({ id: unknownId("cp") }).pipe(
            Effect.flip,
            Effect.provide(Main),
          ),
        );

        expect(error._tag).toBe("Forbidden");
      },
      30_000,
    );

    it(
      "archiving an already-archived counterparty -> NotFound",
      async () => {
        const created = await runEffect(
          createCounterparty({
            name: `Distilled Archive Counterparty Twice ${testRunId}`,
            address: {
              street_address: "123 Test Street",
              city: "San Francisco",
              country_area: "CA",
              postal_code: "94105",
              country: "US",
            },
          }),
        );

        await runEffect(archiveCounterparty({ id: created.id }));

        const error = await runEffect(
          archiveCounterparty({ id: created.id }).pipe(Effect.flip),
        );

        expect(error._tag).toBe("NotFound");
      },
      30_000,
    );
  });
});
