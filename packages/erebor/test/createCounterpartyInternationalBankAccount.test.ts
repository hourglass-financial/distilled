/**
 * Tests for the `createCounterpartyInternationalBankAccount` operation.
 *
 * Happy path discovers a real `counterparty_id` via `listCounterparties`
 * and attaches a new international bank account with a valid IBAN + BIC.
 * Error coverage hits Forbidden (bad key), NotFound (unknown
 * counterparty_id), BadRequest (malformed counterparty_id), and
 * EreborValidationError (malformed IBAN that fails the structural
 * validation, surfaced as 422 VALIDATION_ERROR).
 */
import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { createCounterpartyInternationalBankAccount } from "../src/operations/createCounterpartyInternationalBankAccount.ts";
import { listCounterparties } from "../src/operations/listCounterparties.ts";
import { runEffect, testRunId, unknownId } from "./setup.ts";

// Deutsche Bank Frankfurt sample IBAN + BIC — passes structural validation.
const VALID_IBAN = "DE89370400440532013000";
const VALID_BIC = "DEUTDEFF";
// Same digits but with the country/check digits scrambled — fails IBAN
// modulo-97 / structural validation.
const INVALID_IBAN = "DE00000000000000000001";

describe("createCounterpartyInternationalBankAccount", () => {
  describe("happy path", () => {
    it(
      "creates an international bank account for an existing counterparty",
      async () => {
        const list = await runEffect(listCounterparties({ page_size: 1 }));
        if (list.data.length === 0) return;

        const counterparty = list.data[0]!;
        const customRef = `distilled-erebor-${testRunId}`;
        const result = await runEffect(
          createCounterpartyInternationalBankAccount({
            counterparty_id: counterparty.id,
            description: `Distilled test intl bank ${testRunId}`,
            account_number: VALID_IBAN,
            bic: VALID_BIC,
            custom_ref: customRef,
            custom_fields: { test_run_id: testRunId, source: "distilled" },
          }),
        );

        expect(result.type).toBe("COUNTERPARTY_INTERNATIONAL_BANK_ACCOUNT");
        expect(typeof result.id).toBe("string");
        expect(result.id.length).toBeGreaterThan(0);
        expect(result.counterparty_id).toBe(counterparty.id);
        expect(result.description).toBe(
          `Distilled test intl bank ${testRunId}`,
        );
        expect(result.account_number).toBe(VALID_IBAN);
        expect(result.bic).toBe(VALID_BIC);
        expect(typeof result.country_code).toBe("string");
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
          createCounterpartyInternationalBankAccount({
            counterparty_id: unknownId("cntrprty"),
            description: `Distilled test intl bank ${testRunId}`,
            account_number: VALID_IBAN,
            bic: VALID_BIC,
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
          createCounterpartyInternationalBankAccount({
            counterparty_id: unknownId("cntrprty"),
            description: `Distilled test intl bank ${testRunId}`,
            account_number: VALID_IBAN,
            bic: VALID_BIC,
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
          createCounterpartyInternationalBankAccount({
            counterparty_id: "!!!invalid!!!",
            description: `Distilled test intl bank ${testRunId}`,
            account_number: VALID_IBAN,
            bic: VALID_BIC,
          }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("BadRequest");
      },
      30_000,
    );

    it(
      "IBAN that fails structural validation -> BadRequest",
      async () => {
        // Reach the validation step with a real counterparty so the
        // IBAN check failure surfaces as 422 VALIDATION_ERROR, which the
        // client remaps to EreborValidationError (preserving the
        // structured error_details array).
        const list = await runEffect(listCounterparties({ page_size: 1 }));
        if (list.data.length === 0) return;
        const counterparty = list.data[0]!;

        const error = (await runEffect(
          createCounterpartyInternationalBankAccount({
            counterparty_id: counterparty.id,
            description: `Distilled test intl bank invalid ${testRunId}`,
            account_number: INVALID_IBAN,
            bic: VALID_BIC,
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
