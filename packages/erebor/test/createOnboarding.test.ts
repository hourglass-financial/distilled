/**
 * Tests for the `createOnboarding` operation.
 *
 * Per the operation docs:
 * - Supplying neither `program_id` nor `deposit_account_template_id` -> 400.
 * - An unrecognised `program_id` -> 404.
 * - Sub-resource validation failures fold into 422 VALIDATION_ERROR which
 *   the client remaps to `EreborValidationError`.
 *
 * Happy path discovers a real person applicant via `listPersonApplicants`
 * and pairs it with `EREBOR_TEST_PROGRAM_ID`. If no applicant exists in
 * the sandbox, that branch exits early — onboarding submission still has
 * dedicated error coverage below.
 */
import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { createOnboarding } from "../src/operations/createOnboarding.ts";
import { listPersonApplicants } from "../src/operations/listPersonApplicants.ts";
import { runEffect, testRunId, unknownId } from "./setup.ts";

const requireProgramId = (): string => {
  const id = process.env.EREBOR_TEST_PROGRAM_ID;
  if (!id) throw new Error("EREBOR_TEST_PROGRAM_ID not set");
  return id;
};

describe("createOnboarding", () => {
  describe("happy path", () => {
    it(
      "submits an onboarding for a real person applicant",
      async () => {
        if (!process.env.EREBOR_TEST_PROGRAM_ID) return;
        const programId = requireProgramId();

        const list = await runEffect(listPersonApplicants({ page_size: 1 }));
        if (list.data.length === 0) return;
        const applicant = list.data[0]!;

        const result = await runEffect(
          createOnboarding({
            program_id: programId,
            person_applicant_id: applicant.id,
            disclosures: { disclosures_signed_externally: true },
            custom_ref: `distilled-erebor-${testRunId}`,
          }),
        );

        expect(result.type).toBe("ONBOARDING");
        expect(typeof result.id).toBe("string");
        expect(result.id.length).toBeGreaterThan(0);
        expect(result.applicant_type).toBe("PERSON");
        expect(result.person_applicant_id).toBe(applicant.id);
        expect(["SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED"]).toContain(
          result.status,
        );
        // The onboarding response does not echo `disclosures` (input-only
        // field), so assert the program linkage the create body established.
        expect(result.program_id).toBe(programId);
      },
      60_000,
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
          createOnboarding({
            program_id: "prgrm_01h0000000000000000000000z",
            person_applicant_id: unknownId("prsn_applct"),
            disclosures: { disclosures_signed_externally: true },
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
      "neither program_id nor deposit_account_template_id -> BadRequest",
      async () => {
        // Docs: "Supplying neither field returns `400`." This pins the
        // operation's required-one-of contract.
        const error = (await runEffect(
          createOnboarding({
            person_applicant_id: unknownId("prsn_applct"),
            disclosures: { disclosures_signed_externally: true },
          }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("BadRequest");
      },
      30_000,
    );

    it(
      "unrecognised program_id -> BadRequest",
      async () => {
        // Docs: "An unrecognised `program_id` (or one you do not manage)
        // returns `404`." A well-formed but unknown program id forces
        // the documented 404 path.
        const error = (await runEffect(
          createOnboarding({
            program_id: unknownId("prgrm"),
            person_applicant_id: unknownId("prsn_applct"),
            disclosures: { disclosures_signed_externally: true },
          }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("BadRequest");
      },
      30_000,
    );

    it(
      "no applicant identifier under a real program -> BadRequest",
      async () => {
        if (!process.env.EREBOR_TEST_PROGRAM_ID) return;
        const programId = requireProgramId();

        // Real program but no applicant link — onboarding submission
        // can't proceed and the API responds 422 VALIDATION_ERROR with
        // an `error_details` array describing the missing reference.
        // The client remaps that to EreborValidationError so the
        // structured detail array survives.
        const error = (await runEffect(
          createOnboarding({
            program_id: programId,
            disclosures: { disclosures_signed_externally: true },
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
