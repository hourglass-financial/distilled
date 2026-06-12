/**
 * Tests for the `createCounterpartyUsBankAccount` operation.
 *
 * Happy path discovers a real `counterparty_id` via `listCounterparties`
 * and attaches a new US bank account to it. Error coverage hits Forbidden
 * (bad key), NotFound (unknown counterparty_id), BadRequest (malformed
 * counterparty_id), and EreborValidationError (routing number that fails
 * the ABA checksum, which the API reports as 422 VALIDATION_ERROR with
 * a structured `error_details` payload).
 */
import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { createCounterpartyUsBankAccount } from "../src/operations/createCounterpartyUsBankAccount.ts";
import { listCounterparties } from "../src/operations/listCounterparties.ts";
import { runEffect, testRunId, unknownId } from "./setup.ts";

// A well-known valid US routing number (Chase NY) — passes ABA checksum.
const VALID_ROUTING_NUMBER = "021000021";
// 9 digits but fails the ABA checksum — surfaces VALIDATION_ERROR.
const INVALID_ROUTING_NUMBER = "123456789";

describe("createCounterpartyUsBankAccount", () => {
  describe("happy path", () => {
    it(
      "creates a US bank account for an existing counterparty",
      async () => {
        const list = await runEffect(listCounterparties({ page_size: 1 }));
        if (list.data.length === 0) return;

        const counterparty = list.data[0]!;
        const customRef = `distilled-erebor-${testRunId}`;
        const result = await runEffect(
          createCounterpartyUsBankAccount({
            counterparty_id: counterparty.id,
            description: `Distilled test US bank ${testRunId}`,
            account_number: "000123456789",
            routing_number: VALID_ROUTING_NUMBER,
            custom_ref: customRef,
            custom_fields: { test_run_id: testRunId, source: "distilled" },
          }),
        );

        expect(result.type).toBe("COUNTERPARTY_US_BANK_ACCOUNT");
        expect(typeof result.id).toBe("string");
        expect(result.id.length).toBeGreaterThan(0);
        expect(result.counterparty_id).toBe(counterparty.id);
        expect(result.description).toBe(
          `Distilled test US bank ${testRunId}`,
        );
        expect(result.account_number).toBe("000123456789");
        expect(result.routing_number).toBe(VALID_ROUTING_NUMBER);
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
          createCounterpartyUsBankAccount({
            counterparty_id: unknownId("cntrprty"),
            description: `Distilled test US bank ${testRunId}`,
            account_number: "000123456789",
            routing_number: VALID_ROUTING_NUMBER,
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
      "unknown counterparty id -> BadRequest",
      async () => {
        // Well-formed but unrecognised counterparty id forces the
        // documented 404 path.
        const error = (await runEffect(
          createCounterpartyUsBankAccount({
            counterparty_id: unknownId("cntrprty"),
            description: `Distilled test US bank ${testRunId}`,
            account_number: "000123456789",
            routing_number: VALID_ROUTING_NUMBER,
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
          createCounterpartyUsBankAccount({
            counterparty_id: "!!!invalid!!!",
            description: `Distilled test US bank ${testRunId}`,
            account_number: "000123456789",
            routing_number: VALID_ROUTING_NUMBER,
          }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("BadRequest");
      },
      30_000,
    );

    it(
      "routing number that fails ABA checksum -> BadRequest",
      async () => {
        // Reach the validation step with a real counterparty so the
        // routing number checksum failure surfaces as 422 VALIDATION_ERROR,
        // which the client remaps to EreborValidationError (preserving
        // the structured error_details array).
        const list = await runEffect(listCounterparties({ page_size: 1 }));
        if (list.data.length === 0) return;
        const counterparty = list.data[0]!;

        const error = (await runEffect(
          createCounterpartyUsBankAccount({
            counterparty_id: counterparty.id,
            description: `Distilled test US bank invalid ${testRunId}`,
            account_number: "000123456789",
            routing_number: INVALID_ROUTING_NUMBER,
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
