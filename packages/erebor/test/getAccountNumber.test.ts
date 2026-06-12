/**
 * Tests for the `getAccountNumber` operation.
 *
 * Happy path discovers a real id via `listAccountNumbers`. Error coverage
 * hits Forbidden (bad key), NotFound (well-formed-but-missing id), and
 * the BadRequest path declared by the spec patch.
 */
import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { getAccountNumber } from "../src/operations/getAccountNumber.ts";
import { listAccountNumbers } from "../src/operations/listAccountNumbers.ts";
import { runEffect, testRunId, unknownId } from "./setup.ts";

describe("getAccountNumber", () => {
  describe("happy path", () => {
    it(
      "fetches an account number by id",
      async () => {
        const list = await runEffect(listAccountNumbers({ page_size: 1 }));
        if (list.data.length === 0) return;

        const target = list.data[0]!;
        const result = await runEffect(getAccountNumber({ id: target.id }));

        expect(result.type).toBe("ACCOUNT_NUMBER");
        expect(result.id).toBe(target.id);
        expect(typeof result.deposit_account_id).toBe("string");
        expect(typeof result.account_number).toBe("string");
        expect(typeof result.routing_number).toBe("string");
        expect(typeof result.default).toBe("boolean");
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
          getAccountNumber({ id: unknownId("acctnum") }).pipe(
            Effect.flip,
            Effect.provide(Main),
          ) as Effect.Effect<unknown, never, never>,
        )) as { _tag: string };

        expect(error._tag).toBe("Forbidden");
      },
      30_000,
    );

    it(
      "unknown account number id -> NotFound",
      async () => {
        const error = (await runEffect(
          getAccountNumber({ id: unknownId("acctnum") }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("NotFound");
      },
      30_000,
    );

    it(
      "malformed account number id -> BadRequest",
      async () => {
        // Spec patch declares 400 INVALID_REQUEST on GET
        // /account_numbers/{id}. A clearly malformed path segment
        // exercises that branch.
        const error = (await runEffect(
          getAccountNumber({ id: "!!!invalid!!!" }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("BadRequest");
      },
      30_000,
    );
  });
});
