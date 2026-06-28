/**
 * Tests for the `createCounterpartyInternationalBankAccount` operation.
 *
 * Happy path creates a dedicated counterparty and attaches a new
 * international bank account with a valid IBAN + BIC.
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
import { createCounterparty } from "../src/operations/createCounterparty.ts";
import { createCounterpartyInternationalBankAccount } from "../src/operations/createCounterpartyInternationalBankAccount.ts";
import { runEffect, testRunId, unknownId } from "./setup.ts";

// Create a dedicated counterparty rather than borrowing one from
// listCounterparties: shared counterparties can be archived by the
// archiveCounterparty test running in parallel, which would make this create
// race into a "Counterparty not found" BadRequest.
const newCounterparty = () =>
  createCounterparty({
    name: `Distilled CP intl bank ${testRunId}`,
    address: {
      street_address: "123 Test Street",
      city: "San Francisco",
      country_area: "CA",
      postal_code: "94105",
      country: "US",
    },
  });

const VALID_BIC = "DEUTDEFF";
// Same digits but with the country/check digits scrambled — fails IBAN
// modulo-97 / structural validation.
const INVALID_IBAN = "DE00000000000000000001";

// A German IBAN must be unique per Erebor account — reusing a fixed IBAN
// across runs fails with `Address is already attached to another party.`
// Build a structurally valid (modulo-97) German IBAN whose 18-digit BBAN is
// derived from `testRunId`, so each run attaches a fresh address.
// Layout: DE + 2 check digits + 18-digit BBAN (8-digit bank code + 10-digit
// account number) = 22 chars.
const ibanCheckDigits = (countryCode: string, bban: string): string => {
  const rearranged = `${bban}${countryCode}00`;
  let numeric = "";
  for (const ch of rearranged) {
    numeric +=
      ch >= "0" && ch <= "9" ? ch : (ch.charCodeAt(0) - 55).toString();
  }
  let remainder = 0;
  for (let i = 0; i < numeric.length; i += 7) {
    remainder = Number(BigInt(`${remainder}${numeric.slice(i, i + 7)}`) % 97n);
  }
  return (98 - remainder).toString().padStart(2, "0");
};

const uniqueValidIban = (): string => {
  const bban = BigInt(`0x${testRunId}`)
    .toString()
    .padStart(18, "0")
    .slice(-18);
  return `DE${ibanCheckDigits("DE", bban)}${bban}`;
};

// Structurally valid IBAN, unique per test run.
const VALID_IBAN = uniqueValidIban();

describe("createCounterpartyInternationalBankAccount", () => {
  describe("happy path", () => {
    it(
      "creates an international bank account for an existing counterparty",
      async () => {
        const counterparty = await runEffect(newCounterparty());
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
        const counterparty = await runEffect(newCounterparty());

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
