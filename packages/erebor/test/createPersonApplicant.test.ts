/**
 * Tests for the `createPersonApplicant` operation.
 *
 * Happy path requires a real program id (EREBOR_TEST_PROGRAM_ID) and
 * provides a comprehensive KYC payload — the OpenAPI-required minimum
 * triggers 422 in practice, so the happy path supplies the optional
 * fields the sandbox validation actually demands. Error coverage hits
 * Forbidden (bad key), BadRequest (malformed program_id), and
 * EreborValidationError (422 VALIDATION_ERROR with the minimal payload).
 */
import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { createPersonApplicant } from "../src/operations/createPersonApplicant.ts";
import { runEffect, testRunId } from "./setup.ts";

const requireProgramId = (): string => {
  const id = process.env.EREBOR_TEST_PROGRAM_ID;
  if (!id) throw new Error("EREBOR_TEST_PROGRAM_ID not set");
  return id;
};

const usAddress = {
  street_address: "1 Test St",
  city: "NYC",
  country_area: "NY",
  postal_code: "10001",
  country: "US",
};

describe("createPersonApplicant", () => {
  describe("happy path", () => {
    it(
      "creates a person applicant with a comprehensive KYC payload",
      async () => {
        if (!process.env.EREBOR_TEST_PROGRAM_ID) return;
        const programId = requireProgramId();

        const result = await runEffect(
          createPersonApplicant({
            program_id: programId,
            first_name: "Distilled",
            last_name: `Test-${testRunId}`,
            date_of_birth: "1990-01-01",
            citizenship: "US",
            email_address: `distilled-${testRunId}@example.com`,
            phone_number: "+15555550100",
            physical_address: usAddress,
            tin: "999000000",
            source_of_wealth: ["INCOME"],
            account_purposes: ["PERSONAL_BANKING"],
            source_of_funds: ["INCOME"],
            expected_counterparty_countries: ["US"],
            custom_ref: `distilled-erebor-${testRunId}`,
          }),
        );

        expect(result.type).toBe("PERSON_APPLICANT");
        expect(typeof result.id).toBe("string");
        expect(result.id.length).toBeGreaterThan(0);
        expect(result.program_id).toBe(programId);
        expect(result.first_name).toBe("Distilled");
        expect(result.last_name).toBe(`Test-${testRunId}`);
        expect(result.physical_address.country).toBe("US");
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
          createPersonApplicant({
            program_id: "prgrm_01h0000000000000000000000z",
            first_name: "Distilled",
            last_name: `Test-${testRunId}`,
            date_of_birth: "1990-01-01",
            physical_address: usAddress,
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
      "malformed program_id -> BadRequest",
      async () => {
        // Spec patch declares 400 INVALID_REQUEST on POST /person_applicants.
        // A `program_id` that is not a valid reference forces that branch.
        const error = (await runEffect(
          createPersonApplicant({
            program_id: "not-a-program-id",
            first_name: "Distilled",
            last_name: `Test-${testRunId}`,
            date_of_birth: "1990-01-01",
            physical_address: usAddress,
          }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("BadRequest");
      },
      30_000,
    );

    it(
      "incomplete KYC fields -> EreborValidationError (422)",
      async () => {
        if (!process.env.EREBOR_TEST_PROGRAM_ID) return;
        const programId = requireProgramId();

        // OpenAPI-required minimum against a real program triggers 422
        // VALIDATION_ERROR because the sandbox demands KYC fields beyond
        // the spec's `required` list. The client remaps 422 with
        // `error: "VALIDATION_ERROR"` to EreborValidationError so the
        // structured error_details array survives.
        const error = (await runEffect(
          createPersonApplicant({
            program_id: programId,
            first_name: "Distilled",
            last_name: `Test-${testRunId}`,
            date_of_birth: "1990-01-01",
            physical_address: {
              street_address: "1 Test St",
              city: "NYC",
              postal_code: "10001",
              country: "US",
            },
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

        expect(error._tag).toBe("EreborValidationError");
        expect(error.code).toBe("VALIDATION_ERROR");
        expect(error.error_details).toBeTruthy();
        expect((error.error_details ?? []).length).toBeGreaterThan(0);
        expect(error.error_details![0]!.error_detail_type).toBe("FIELD_ERROR");
      },
      30_000,
    );
  });
});
