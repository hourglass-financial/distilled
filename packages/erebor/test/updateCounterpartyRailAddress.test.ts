/**
 * Tests for the `updateCounterpartyRailAddress` operation.
 *
 * Happy path discovers a real id via `listCounterpartyRailAddresses` and
 * patches its `description` / `custom_ref` / `custom_fields`. Error
 * coverage hits Forbidden (bad key), NotFound (well-formed-but-missing
 * id), and BadRequest (malformed id).
 */
import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { listCounterpartyRailAddresses } from "../src/operations/listCounterpartyRailAddresses.ts";
import { updateCounterpartyRailAddress } from "../src/operations/updateCounterpartyRailAddress.ts";
import { runEffect, testRunId, unknownId } from "./setup.ts";

describe("updateCounterpartyRailAddress", () => {
  describe("happy path", () => {
    it(
      "patches description, custom_ref and custom_fields on an existing counterparty rail address",
      async () => {
        const list = await runEffect(
          listCounterpartyRailAddresses({ page_size: 1 }),
        );
        if (list.data.length === 0) return;

        const target = list.data[0]!;
        const newDesc = `Distilled test rail ${testRunId}`;
        const newRef = `distilled-erebor-${testRunId}`;
        const newFields = { test_run_id: testRunId, source: "distilled" };

        const result = await runEffect(
          updateCounterpartyRailAddress({
            id: target.id,
            description: newDesc,
            custom_ref: newRef,
            custom_fields: newFields,
          }),
        );

        expect(result.type).toBe("COUNTERPARTY_RAIL_ADDRESS");
        expect(result.id).toBe(target.id);
        expect(result.description).toBe(newDesc);
        expect(result.custom_ref).toBe(newRef);
        expect(result.custom_fields).toMatchObject(newFields);
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
          updateCounterpartyRailAddress({
            id: unknownId("cp_rail_addr"),
            custom_ref: `distilled-erebor-${testRunId}`,
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
      "missing counterparty rail address id -> NotFound",
      async () => {
        const error = (await runEffect(
          updateCounterpartyRailAddress({
            id: unknownId("cp_rail_addr"),
            custom_ref: `distilled-erebor-${testRunId}`,
          }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("NotFound");
      },
      30_000,
    );

    it(
      "malformed counterparty rail address id -> BadRequest",
      async () => {
        // Spec patch declares 400 INVALID_REQUEST on PATCH
        // /counterparty_rail_addresses/{id}. A clearly malformed path
        // segment exercises that branch.
        const error = (await runEffect(
          updateCounterpartyRailAddress({
            id: "!!!invalid!!!",
            custom_ref: `distilled-erebor-${testRunId}`,
          }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("BadRequest");
      },
      30_000,
    );
  });
});
