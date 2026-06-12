/**
 * Tests for the `getBlockchainAddress` operation.
 *
 * Happy path discovers a real id via `listBlockchainAddresses`. Error
 * coverage hits Forbidden (bad key), NotFound (well-formed-but-missing id),
 * and the BadRequest path declared by the spec patch.
 */
import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { getBlockchainAddress } from "../src/operations/getBlockchainAddress.ts";
import { listBlockchainAddresses } from "../src/operations/listBlockchainAddresses.ts";
import { runEffect, testRunId, unknownId } from "./setup.ts";

describe("getBlockchainAddress", () => {
  describe("happy path", () => {
    it(
      "fetches a blockchain address by id",
      async () => {
        const list = await runEffect(
          listBlockchainAddresses({ page_size: 1 }),
        );
        if (list.data.length === 0) return;

        const target = list.data[0]!;
        const result = await runEffect(getBlockchainAddress({ id: target.id }));

        expect(result.type).toBe("BLOCKCHAIN_ADDRESS");
        expect(result.id).toBe(target.id);
        expect(typeof result.deposit_account_id).toBe("string");
        expect(typeof result.address).toBe("string");
        expect(["ETHEREUM", "SOLANA", "SUI"]).toContain(result.address_type);
        expect(Array.isArray(result.network)).toBe(true);
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
          getBlockchainAddress({ id: unknownId("bca") }).pipe(
            Effect.flip,
            Effect.provide(Main),
          ) as Effect.Effect<unknown, never, never>,
        )) as { _tag: string };

        expect(error._tag).toBe("Forbidden");
      },
      30_000,
    );

    it(
      "unknown blockchain address id -> NotFound",
      async () => {
        const error = (await runEffect(
          getBlockchainAddress({ id: unknownId("bca") }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("NotFound");
      },
      30_000,
    );

    it(
      "malformed blockchain address id -> BadRequest",
      async () => {
        // Spec patch declares 400 INVALID_REQUEST on GET
        // /blockchain_addresses/{id}. A clearly malformed path segment
        // exercises that branch.
        const error = (await runEffect(
          getBlockchainAddress({ id: "!!!invalid!!!" }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("BadRequest");
      },
      30_000,
    );
  });
});
