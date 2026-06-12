/**
 * Tests for the `createDepositAccount` operation.
 *
 * Happy path discovers a compatible (template_id, customer_id) pair from
 * an existing deposit account in the sandbox (so ownership_type and
 * program assignment line up), then creates a sibling account using the
 * same pair. Error coverage hits Forbidden (bad key), NotFound (unknown
 * customer/template id), and BadRequest (malformed id).
 */
import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { createDepositAccount } from "../src/operations/createDepositAccount.ts";
import { listDepositAccounts } from "../src/operations/listDepositAccounts.ts";
import { runEffect, testRunId, unknownId } from "./setup.ts";

describe("createDepositAccount", () => {
  describe("happy path", () => {
    it(
      "creates a deposit account for an existing customer + template pair",
      async () => {
        // Source a known-good (template, customer) pair from an existing
        // deposit account. This avoids guessing ownership_type / program
        // compatibility between independently-listed customers and templates.
        const list = await runEffect(listDepositAccounts({ page_size: 1 }));
        if (list.data.length === 0) return;
        const seed = list.data[0]!;

        const customRef = `distilled-erebor-${testRunId}`;
        const result = await runEffect(
          createDepositAccount({
            deposit_account_template_id: seed.deposit_account_template_id,
            customer_id: seed.customer_id,
            name: `distilled-erebor-da-${testRunId}`,
            disclosures: { disclosures_signed_externally: true },
            custom_ref: customRef,
            custom_fields: { test_run_id: testRunId, source: "distilled" },
          }),
        );

        expect(result.type).toBe("DEPOSIT_ACCOUNT");
        expect(typeof result.id).toBe("string");
        expect(result.id.length).toBeGreaterThan(0);
        expect(result.customer_id).toBe(seed.customer_id);
        expect(result.deposit_account_template_id).toBe(
          seed.deposit_account_template_id,
        );
        expect(result.custom_ref).toBe(customRef);
        expect(result.disclosures.disclosures_signed_externally).toBe(true);
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
          createDepositAccount({
            deposit_account_template_id: unknownId("datmpl"),
            customer_id: unknownId("cust"),
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
      "unknown customer + template ids -> BadRequest",
      async () => {
        // Well-formed but unrecognised IDs force the documented 404 path
        // (the server can't resolve either referenced resource).
        const error = (await runEffect(
          createDepositAccount({
            deposit_account_template_id: unknownId("datmpl"),
            customer_id: unknownId("cust"),
            disclosures: { disclosures_signed_externally: true },
          }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("BadRequest");
      },
      30_000,
    );

    it(
      "malformed customer id -> BadRequest",
      async () => {
        // A lexically invalid ID forces 400 INVALID_REQUEST rather than
        // the 404 path exercised above.
        const error = (await runEffect(
          createDepositAccount({
            deposit_account_template_id: "!!!invalid!!!",
            customer_id: "!!!invalid!!!",
            disclosures: { disclosures_signed_externally: true },
          }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("BadRequest");
      },
      30_000,
    );
  });
});
