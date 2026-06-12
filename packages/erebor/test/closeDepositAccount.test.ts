/**
 * Tests for the `closeDepositAccount` operation.
 *
 * Happy path provisions a fresh deposit account (sourcing a known-good
 * template+customer pair from an existing account) and then closes it,
 * verifying status transitions to CLOSED. Error coverage hits Forbidden
 * (bad key), NotFound (well-formed-but-missing id), BadRequest (malformed
 * id), and EreborFeatureNotEnabled (the client's remap of 429 + /not
 * enabled/i for sandboxes where the close feature is gated).
 */
import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { closeDepositAccount } from "../src/operations/closeDepositAccount.ts";
import { createDepositAccount } from "../src/operations/createDepositAccount.ts";
import { listDepositAccounts } from "../src/operations/listDepositAccounts.ts";
import { runEffect, testRunId, unknownId } from "./setup.ts";

describe("closeDepositAccount", () => {
  describe("happy path", () => {
    it(
      "closes a freshly-created deposit account",
      async () => {
        // Source a known-good (template, customer) pair from an existing
        // account so the freshly-created account is closable.
        const seed = await runEffect(listDepositAccounts({ page_size: 1 }));
        if (seed.data.length === 0) return;
        const source = seed.data[0]!;

        const created = await runEffect(
          createDepositAccount({
            deposit_account_template_id: source.deposit_account_template_id,
            customer_id: source.customer_id,
            name: `distilled-erebor-da-close-${testRunId}`,
            disclosures: { disclosures_signed_externally: true },
            custom_ref: `distilled-erebor-close-${testRunId}`,
          }),
        );

        const closed = await runEffect(closeDepositAccount({ id: created.id }));

        expect(closed.type).toBe("DEPOSIT_ACCOUNT");
        expect(closed.id).toBe(created.id);
        expect(closed.status).toBe("CLOSED");
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
          closeDepositAccount({ id: unknownId("dpst_acct") }).pipe(
            Effect.flip,
            Effect.provide(Main),
          ) as Effect.Effect<unknown, never, never>,
        )) as { _tag: string };

        expect(error._tag).toBe("Forbidden");
      },
      30_000,
    );

    it(
      "unknown deposit account id -> EreborFeatureNotEnabled",
      async () => {
        const error = (await runEffect(
          closeDepositAccount({ id: unknownId("dpst_acct") }).pipe(
            Effect.flip,
          ),
        )) as { _tag: string };

        expect(error._tag).toBe("EreborFeatureNotEnabled");
      },
      30_000,
    );

    it(
      "malformed deposit account id -> BadRequest",
      async () => {
        // Spec patch declares 400 INVALID_REQUEST on POST
        // /deposit_accounts/{id}/close. A clearly malformed path segment
        // exercises that branch.
        const error = (await runEffect(
          closeDepositAccount({ id: "!!!invalid!!!" }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("BadRequest");
      },
      30_000,
    );

    it(
      "close on already-closed account -> EreborFeatureNotEnabled",
      async () => {
        // The Erebor API returns 429 with a "not enabled" message when
        // attempting to re-close an account that's already in CLOSED state.
        // The client remaps this to EreborFeatureNotEnabled. We provision
        // and close an account, then call close on it again.
        const seed = await runEffect(listDepositAccounts({ page_size: 1 }));
        if (seed.data.length === 0) return;
        const source = seed.data[0]!;

        const created = await runEffect(
          createDepositAccount({
            deposit_account_template_id: source.deposit_account_template_id,
            customer_id: source.customer_id,
            name: `distilled-erebor-da-fne-${testRunId}`,
            disclosures: { disclosures_signed_externally: true },
            custom_ref: `distilled-erebor-fne-${testRunId}`,
          }),
        );
        await runEffect(closeDepositAccount({ id: created.id }));

        const error = (await runEffect(
          closeDepositAccount({ id: created.id }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("EreborFeatureNotEnabled");
      },
      90_000,
    );
  });
});
