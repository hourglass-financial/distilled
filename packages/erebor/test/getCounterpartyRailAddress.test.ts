/**
 * Tests for the `getCounterpartyRailAddress` operation.
 *
 * Happy path discovers a real id via `listCounterpartyRailAddresses`.
 * Error coverage hits Forbidden (bad key), NotFound (well-formed-but-
 * missing id), and the BadRequest path declared by the spec patch.
 */
import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { getCounterpartyRailAddress } from "../src/operations/getCounterpartyRailAddress.ts";
import { listCounterpartyRailAddresses } from "../src/operations/listCounterpartyRailAddresses.ts";
import { runEffect, testRunId, unknownId } from "./setup.ts";

describe("getCounterpartyRailAddress", () => {
  describe("happy path", () => {
    it(
      "fetches a counterparty rail address by id",
      async () => {
        const list = await runEffect(
          listCounterpartyRailAddresses({ page_size: 1 }),
        );
        if (list.data.length === 0) return;

        const target = list.data[0]!;
        const result = await runEffect(
          getCounterpartyRailAddress({ id: target.id }),
        );

        expect(result.type).toBe("COUNTERPARTY_RAIL_ADDRESS");
        expect(result.id).toBe(target.id);
        expect(typeof result.address).toBe("string");
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
          getCounterpartyRailAddress({ id: unknownId("cp_rail_addr") }).pipe(
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
          getCounterpartyRailAddress({ id: unknownId("cp_rail_addr") }).pipe(
            Effect.flip,
          ),
        )) as { _tag: string };

        expect(error._tag).toBe("NotFound");
      },
      30_000,
    );

    it(
      "malformed counterparty rail address id -> BadRequest",
      async () => {
        // Spec patch declares 400 INVALID_REQUEST on GET
        // /counterparty_rail_addresses/{id}. A clearly malformed path
        // segment exercises that branch.
        const error = (await runEffect(
          getCounterpartyRailAddress({ id: "!!!invalid!!!" }).pipe(
            Effect.flip,
          ),
        )) as { _tag: string };

        expect(error._tag).toBe("BadRequest");
      },
      30_000,
    );
  });
});
