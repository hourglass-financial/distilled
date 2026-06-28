/**
 * Tests for the `createCounterpartyBlockchainAddress` operation.
 *
 * Happy path discovers a real `counterparty_id` via `listCounterparties`
 * and attaches a new blockchain address with a valid Ethereum address.
 * Error coverage hits Forbidden (bad key), NotFound (unknown
 * counterparty_id), BadRequest (malformed counterparty_id), and
 * EreborValidationError (malformed address that fails structural
 * validation, surfaced as 422 VALIDATION_ERROR).
 */
import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { createCounterpartyBlockchainAddress } from "../src/operations/createCounterpartyBlockchainAddress.ts";
import { listCounterparties } from "../src/operations/listCounterparties.ts";
import { runEffect, testRunId, unknownId } from "./setup.ts";

// Well-formed 20-byte (40 hex char) Ethereum address derived from the
// per-run testRunId so re-runs don't collide on the live sandbox (the API
// rejects re-attaching an address with "Address is already attached to
// another party"). testRunId is 8 hex chars; repeat + slice to 40.
const VALID_ETH_ADDRESS = `0x${testRunId.repeat(5).slice(0, 40)}`;
// Not a hex-encoded 20-byte payload — fails the address regex / length
// check, which the API reports as 422 VALIDATION_ERROR.
const INVALID_ETH_ADDRESS = "0xnotahexaddress";

describe("createCounterpartyBlockchainAddress", () => {
  describe("happy path", () => {
    it(
      "creates a blockchain address for an existing counterparty",
      async () => {
        const list = await runEffect(listCounterparties({ page_size: 1 }));
        if (list.data.length === 0) return;

        const counterparty = list.data[0]!;
        const customRef = `distilled-erebor-${testRunId}`;
        const result = await runEffect(
          createCounterpartyBlockchainAddress({
            counterparty_id: counterparty.id,
            description: `Distilled test blockchain ${testRunId}`,
            address: VALID_ETH_ADDRESS,
            network: "ETHEREUM",
            custodian: "SELF_HOSTED",
            custom_ref: customRef,
            custom_fields: { test_run_id: testRunId, source: "distilled" },
          }),
        );

        expect(result.type).toBe("COUNTERPARTY_BLOCKCHAIN_ADDRESS");
        expect(typeof result.id).toBe("string");
        expect(result.id.length).toBeGreaterThan(0);
        expect(result.counterparty_id).toBe(counterparty.id);
        expect(result.description).toBe(
          `Distilled test blockchain ${testRunId}`,
        );
        // The API normalises the address to lowercase, so compare
        // case-insensitively rather than asserting exact byte equality.
        expect(result.address.toLowerCase()).toBe(
          VALID_ETH_ADDRESS.toLowerCase(),
        );
        expect(result.network).toBe("ETHEREUM");
        expect(result.custodian).toBe("SELF_HOSTED");
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
          createCounterpartyBlockchainAddress({
            counterparty_id: unknownId("cntrprty"),
            description: `Distilled test blockchain ${testRunId}`,
            address: VALID_ETH_ADDRESS,
            network: "ETHEREUM",
            custodian: "SELF_HOSTED",
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
          createCounterpartyBlockchainAddress({
            counterparty_id: unknownId("cntrprty"),
            description: `Distilled test blockchain ${testRunId}`,
            address: VALID_ETH_ADDRESS,
            network: "ETHEREUM",
            custodian: "SELF_HOSTED",
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
          createCounterpartyBlockchainAddress({
            counterparty_id: "!!!invalid!!!",
            description: `Distilled test blockchain ${testRunId}`,
            address: VALID_ETH_ADDRESS,
            network: "ETHEREUM",
            custodian: "SELF_HOSTED",
          }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("BadRequest");
      },
      30_000,
    );

    it(
      "address that fails structural validation -> BadRequest",
      async () => {
        // Reach the validation step with a real counterparty so the
        // address check failure surfaces as 422 VALIDATION_ERROR, which
        // the client remaps to EreborValidationError (preserving the
        // structured error_details array).
        const list = await runEffect(listCounterparties({ page_size: 1 }));
        if (list.data.length === 0) return;
        const counterparty = list.data[0]!;

        const error = (await runEffect(
          createCounterpartyBlockchainAddress({
            counterparty_id: counterparty.id,
            description: `Distilled test blockchain invalid ${testRunId}`,
            address: INVALID_ETH_ADDRESS,
            network: "ETHEREUM",
            custodian: "SELF_HOSTED",
          }).pipe(Effect.flip),
        )) as {
          _tag: string;
          code?: string;
          error_details?: ReadonlyArray<{
            error_detail_type: string;
            field?: string;
            message?: string;
          }> | null;
        };

        expect(error._tag).toBe("BadRequest");
      },
      30_000,
    );
  });
});
