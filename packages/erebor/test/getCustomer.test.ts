/**
 * Tests for the `getCustomer` operation.
 *
 * Happy path discovers a real id via `listCustomers`. Error coverage
 * hits Forbidden (bad key), NotFound (well-formed-but-missing id), and
 * the BadRequest path declared by the spec patch.
 */
import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { getCustomer } from "../src/operations/getCustomer.ts";
import { listCustomers } from "../src/operations/listCustomers.ts";
import { runEffect, testRunId, unknownId } from "./setup.ts";

describe("getCustomer", () => {
  describe("happy path", () => {
    it(
      "fetches a customer by id",
      async () => {
        const list = await runEffect(listCustomers({ page_size: 1 }));
        if (list.data.length === 0) return;

        const target = list.data[0]!;
        const result = await runEffect(getCustomer({ id: target.id }));

        expect(result.type).toBe("CUSTOMER");
        expect(result.id).toBe(target.id);
        expect(typeof result.name).toBe("string");
        expect(["ACTIVE", "OFFBOARDED"]).toContain(result.status);
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
          getCustomer({ id: unknownId("cust") }).pipe(
            Effect.flip,
            Effect.provide(Main),
          ) as Effect.Effect<unknown, never, never>,
        )) as { _tag: string };

        expect(error._tag).toBe("Forbidden");
      },
      30_000,
    );

    it(
      "unknown customer id -> NotFound",
      async () => {
        const error = (await runEffect(
          getCustomer({ id: unknownId("cust") }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("NotFound");
      },
      30_000,
    );

    it(
      "malformed customer id -> BadRequest",
      async () => {
        // Spec patch declares 400 INVALID_REQUEST on GET /customers/{id}.
        // A clearly malformed path segment exercises that branch.
        const error = (await runEffect(
          getCustomer({ id: "!!!invalid!!!" }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("BadRequest");
      },
      30_000,
    );
  });
});
