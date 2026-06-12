/**
 * Tests for the `getCounterpartyUsBankAccount` operation.
 *
 * Happy path discovers a real id via `listCounterpartyUsBankAccounts`.
 * Error coverage hits Forbidden (bad key), NotFound (well-formed-but-
 * missing id), and the BadRequest path declared by the spec patch.
 */
import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { getCounterpartyUsBankAccount } from "../src/operations/getCounterpartyUsBankAccount.ts";
import { listCounterpartyUsBankAccounts } from "../src/operations/listCounterpartyUsBankAccounts.ts";
import { runEffect, testRunId, unknownId } from "./setup.ts";

describe("getCounterpartyUsBankAccount", () => {
  describe("happy path", () => {
    it(
      "fetches a counterparty US bank account by id",
      async () => {
        const list = await runEffect(
          listCounterpartyUsBankAccounts({ page_size: 1 }),
        );
        if (list.data.length === 0) return;

        const target = list.data[0]!;
        const result = await runEffect(
          getCounterpartyUsBankAccount({ id: target.id }),
        );

        expect(result.type).toBe("COUNTERPARTY_US_BANK_ACCOUNT");
        expect(result.id).toBe(target.id);
        expect(typeof result.description).toBe("string");
        expect(typeof result.account_number).toBe("string");
        expect(typeof result.routing_number).toBe("string");
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
          getCounterpartyUsBankAccount({ id: unknownId("cpusba") }).pipe(
            Effect.flip,
            Effect.provide(Main),
          ) as Effect.Effect<unknown, never, never>,
        )) as { _tag: string };

        expect(error._tag).toBe("Forbidden");
      },
      30_000,
    );

    it(
      "unknown counterparty US bank account id -> NotFound",
      async () => {
        const error = (await runEffect(
          getCounterpartyUsBankAccount({ id: unknownId("cpusba") }).pipe(
            Effect.flip,
          ),
        )) as { _tag: string };

        expect(error._tag).toBe("NotFound");
      },
      30_000,
    );

    it(
      "malformed counterparty US bank account id -> BadRequest",
      async () => {
        // Spec patch declares 400 INVALID_REQUEST on GET
        // /counterparty_us_bank_accounts/{id}. A clearly malformed path
        // segment exercises that branch.
        const error = (await runEffect(
          getCounterpartyUsBankAccount({ id: "!!!invalid!!!" }).pipe(
            Effect.flip,
          ),
        )) as { _tag: string };

        expect(error._tag).toBe("BadRequest");
      },
      30_000,
    );
  });
});
