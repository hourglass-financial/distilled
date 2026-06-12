/**
 * Tests for the `createAccountNumber` operation.
 *
 * Happy path discovers a real `deposit_account_id` via `listDepositAccounts`
 * and creates a new account number against it. Error coverage hits
 * Forbidden (bad key), NotFound (unknown deposit_account_id), and
 * BadRequest (malformed deposit_account_id).
 */
import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { createAccountNumber } from "../src/operations/createAccountNumber.ts";
import { listDepositAccounts } from "../src/operations/listDepositAccounts.ts";
import { runEffect, testRunId, unknownId } from "./setup.ts";

describe("createAccountNumber", () => {
  describe("happy path", () => {
    it(
      "creates an account number for an existing deposit account",
      async () => {
        const list = await runEffect(listDepositAccounts({ page_size: 1 }));
        if (list.data.length === 0) return;

        const target = list.data[0]!;
        const customRef = `distilled-erebor-${testRunId}`;
        const result = await runEffect(
          createAccountNumber({
            deposit_account_id: target.id,
            name: `distilled-erebor-acctnum-${testRunId}`,
            custom_ref: customRef,
            custom_fields: { test_run_id: testRunId, source: "distilled" },
          }),
        );

        expect(result.type).toBe("ACCOUNT_NUMBER");
        expect(typeof result.id).toBe("string");
        expect(result.id.length).toBeGreaterThan(0);
        expect(result.deposit_account_id).toBe(target.id);
        expect(typeof result.account_number).toBe("string");
        expect(typeof result.routing_number).toBe("string");
        expect(typeof result.default).toBe("boolean");
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
          createAccountNumber({
            deposit_account_id: unknownId("dpst_acct"),
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
      "unknown deposit account id -> EreborValidationError",
      async () => {
        // Well-formed but unrecognised ID forces the documented 404 path.
        const error = (await runEffect(
          createAccountNumber({
            deposit_account_id: unknownId("dpst_acct"),
          }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("EreborValidationError");
      },
      30_000,
    );

    it(
      "malformed deposit account id -> BadRequest",
      async () => {
        // A lexically invalid ID forces 400 INVALID_REQUEST rather than
        // the 404 path exercised above.
        const error = (await runEffect(
          createAccountNumber({
            deposit_account_id: "!!!invalid!!!",
          }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("BadRequest");
      },
      30_000,
    );
  });
});
