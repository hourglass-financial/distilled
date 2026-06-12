/**
 * Tests for the `createBusinessApplicant` operation.
 *
 * Happy path requires a real program id (EREBOR_TEST_PROGRAM_ID). Error
 * paths cover Forbidden (bad key), BadRequest (malformed program_id),
 * and EreborValidationError (422 VALIDATION_ERROR remapped by the
 * client's matchError when required KYC fields are incomplete).
 */
import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { createBusinessApplicant } from "../src/operations/createBusinessApplicant.ts";
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

describe("createBusinessApplicant", () => {
  describe("happy path", () => {
    it(
      "creates a business applicant with the minimal required fields",
      async () => {
        if (!process.env.EREBOR_TEST_PROGRAM_ID) return;
        const programId = requireProgramId();

        const result = await runEffect(
          createBusinessApplicant({
            program_id: programId,
            name: `Distilled Test Co ${testRunId}`,
            incorporation_address: usAddress,
            physical_address: usAddress,
            custom_ref: `distilled-erebor-${testRunId}`,
          }),
        );

        expect(result.type).toBe("BUSINESS_APPLICANT");
        expect(typeof result.id).toBe("string");
        expect(result.id.length).toBeGreaterThan(0);
        expect(result.program_id).toBe(programId);
        expect(result.name).toBe(`Distilled Test Co ${testRunId}`);
        expect(result.incorporation_address.country).toBe("US");
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
          createBusinessApplicant({
            program_id: "prgrm_01h0000000000000000000000z",
            name: `Distilled Test Co ${testRunId}`,
            incorporation_address: usAddress,
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
        // Spec patch declares 400 INVALID_REQUEST on POST /business_applicants.
        // A `program_id` that is not a valid reference forces that branch.
        const error = (await runEffect(
          createBusinessApplicant({
            program_id: "not-a-program-id",
            name: `Distilled Test Co ${testRunId}`,
            incorporation_address: usAddress,
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

        // A real program is referenced, addresses are valid, but the
        // business applicant lacks the KYC fields the API requires for
        // a real onboarding submission. Erebor responds 422 with
        // `error: "VALIDATION_ERROR"` which the client remaps to
        // EreborValidationError, preserving the structured error_details.
        const error = (await runEffect(
          createBusinessApplicant({
            program_id: programId,
            name: `Distilled Test Co ${testRunId}`,
            incorporation_address: {
              street_address: "",
              city: "",
              postal_code: "",
              country: "",
            },
            physical_address: {
              street_address: "",
              city: "",
              postal_code: "",
              country: "",
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
