/**
 * Error-discovery tests.
 *
 * Verifies that the typed error classes added in errors.ts / client.ts
 * line up with what api.erebor.bank actually returns. Each test pokes a
 * single failure mode end-to-end through a real API request so a vendor
 * shape change surfaces as a test failure rather than as a silent
 * UnknownEreborError downgrade.
 */
import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { closeDepositAccount } from "../src/operations/closeDepositAccount.ts";
import { createPersonApplicant } from "../src/operations/createPersonApplicant.ts";
import { getCustomer } from "../src/operations/getCustomer.ts";
import { getDepositAccount } from "../src/operations/getDepositAccount.ts";
import { getProgram } from "../src/operations/getProgram.ts";
import { runEffect, unknownId } from "./setup.ts";

/**
 * A real program ID in the sandbox. Set EREBOR_TEST_PROGRAM_ID to override.
 * We don't fetch via `listPrograms` because its generated output schema
 * currently requires `billing_deposit_account_id` which the live API does
 * not always return (separate spec/response mismatch, tracked elsewhere).
 */
const requireProgramId = (): string => {
  const id = process.env.EREBOR_TEST_PROGRAM_ID;
  if (!id) throw new Error("EREBOR_TEST_PROGRAM_ID not set");
  return id;
};

const requireDepositAccountId = (): string => {
  const id = process.env.EREBOR_TEST_DEPOSIT_ACCOUNT_ID;
  if (!id) throw new Error("EREBOR_TEST_DEPOSIT_ACCOUNT_ID not set");
  return id;
};

describe("Erebor error matching", () => {
  describe("Forbidden", () => {
    it("invalid API key -> Forbidden (Erebor returns 403, not 401)", async () => {
      // Discovery: Erebor returns 403 FORBIDDEN for malformed/unknown
      // API keys, not 401 UNAUTHORIZED. 401 appears to be reserved for
      // missing-credentials cases (which the SDK guards against by
      // requiring `apiKey` on the credentials layer).
      const BadCreds = Layer.succeed(Credentials, {
        apiKey: Redacted.make("test_key_definitely_not_valid"),
        apiBaseUrl: DEFAULT_API_BASE_URL,
      });
      const Main = Layer.merge(BadCreds, FetchHttpClient.layer);

      const error = (await Effect.runPromise(
        getProgram({ id: unknownId("prgrm") }).pipe(
          Effect.flip,
          Effect.provide(Main),
        ) as Effect.Effect<unknown, never, never>,
      )) as { _tag: string };

      expect(error._tag).toBe("Forbidden");
    });
  });

  describe("NotFound", () => {
    it("404 for unknown program id -> NotFound", async () => {
      const error = (await runEffect(
        getProgram({ id: unknownId("prgrm") }).pipe(Effect.flip),
      )) as { _tag: string; message: string };

      expect(error._tag).toBe("NotFound");
      expect(error.message).toContain("Program not found");
    });

    it("404 for unknown deposit account id -> NotFound", async () => {
      const error = (await runEffect(
        getDepositAccount({ id: unknownId("dep_acct") }).pipe(Effect.flip),
      )) as { _tag: string; message: string };

      expect(error._tag).toBe("NotFound");
      expect(error.message).toContain("Deposit account not found");
    });

    it("404 for unknown customer id -> NotFound", async () => {
      const error = (await runEffect(
        getCustomer({ id: unknownId("cust") }).pipe(Effect.flip),
      )) as { _tag: string; message: string };

      expect(error._tag).toBe("NotFound");
      expect(error.message).toContain("Customer not found");
    });

    it("malformed deposit account id also -> NotFound (Erebor does not differentiate)", async () => {
      // Discovery: Erebor returns 404 NOT_FOUND for syntactically invalid
      // IDs as well as for well-formed-but-unknown IDs. There is no 400
      // INVALID_REQUEST path for resource lookups by ID.
      const error = (await runEffect(
        getDepositAccount({ id: "not-a-real-id" }).pipe(Effect.flip),
      )) as { _tag: string };

      expect(error._tag).toBe("NotFound");
    });
  });

  describe("EreborValidationError", () => {
    it(
      "422 VALIDATION_ERROR with error_details on incomplete person applicant",
      async () => {
        if (!process.env.EREBOR_TEST_PROGRAM_ID) return;
        const programId = requireProgramId();
        const error = (await runEffect(
          Effect.gen(function* () {
            return yield* createPersonApplicant({
              program_id: programId,
              first_name: "Test",
              last_name: "User",
              date_of_birth: "1990-01-01",
              physical_address: {
                street_address: "1 Test St",
                city: "NYC",
                postal_code: "10001",
                country: "US",
              },
            }).pipe(Effect.flip);
          }),
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

  describe("EreborFeatureNotEnabled", () => {
    it(
      "429 with non-RATE_LIMITED code on closeDepositAccount -> EreborFeatureNotEnabled",
      async () => {
        if (!process.env.EREBOR_TEST_DEPOSIT_ACCOUNT_ID) {
          // Skip when no fixture is wired — this test asserts on a specific
          // sandbox behavior (programmatic closure not enabled) that the
          // test key does not have permission for. Any open deposit account
          // id will do; allow the user to plumb one in via env.
          return;
        }
        const id = requireDepositAccountId();
        const error = (await runEffect(
          closeDepositAccount({ id }).pipe(Effect.flip),
        )) as { _tag: string; message: string };

        expect(error._tag).toBe("EreborFeatureNotEnabled");
        expect(error.message.toLowerCase()).toContain("not enabled");
      },
      30_000,
    );
  });
});
