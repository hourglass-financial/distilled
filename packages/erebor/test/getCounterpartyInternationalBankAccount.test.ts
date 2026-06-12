/**
 * Tests for the `getCounterpartyInternationalBankAccount` operation.
 *
 * Happy path discovers a real id via `listCounterpartyInternationalBankAccounts`.
 * Error coverage hits Forbidden (bad key), NotFound (well-formed-but-
 * missing id), and the BadRequest path declared by the spec patch.
 */
import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { getCounterpartyInternationalBankAccount } from "../src/operations/getCounterpartyInternationalBankAccount.ts";
import { listCounterpartyInternationalBankAccounts } from "../src/operations/listCounterpartyInternationalBankAccounts.ts";
import { runEffect, testRunId, unknownId } from "./setup.ts";

describe("getCounterpartyInternationalBankAccount", () => {
  describe("happy path", () => {
    it(
      "fetches a counterparty international bank account by id",
      async () => {
        const list = await runEffect(
          listCounterpartyInternationalBankAccounts({ page_size: 1 }),
        );
        if (list.data.length === 0) return;

        const target = list.data[0]!;
        const result = await runEffect(
          getCounterpartyInternationalBankAccount({ id: target.id }),
        );

        expect(result.type).toBe("COUNTERPARTY_INTERNATIONAL_BANK_ACCOUNT");
        expect(result.id).toBe(target.id);
        expect(typeof result.description).toBe("string");
        expect(typeof result.account_number).toBe("string");
        expect(typeof result.bic).toBe("string");
        expect(typeof result.country_code).toBe("string");
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
          getCounterpartyInternationalBankAccount({
            id: unknownId("cpiba"),
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
      "missing counterparty international bank account id -> NotFound",
      async () => {
        const error = (await runEffect(
          getCounterpartyInternationalBankAccount({
            id: unknownId("cpiba"),
          }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("NotFound");
      },
      30_000,
    );

    it(
      "malformed counterparty international bank account id -> BadRequest",
      async () => {
        // Spec patch declares 400 INVALID_REQUEST on GET
        // /counterparty_international_bank_accounts/{id}. A clearly malformed
        // path segment exercises that branch.
        const error = (await runEffect(
          getCounterpartyInternationalBankAccount({
            id: "!!!invalid!!!",
          }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("BadRequest");
      },
      30_000,
    );
  });
});
