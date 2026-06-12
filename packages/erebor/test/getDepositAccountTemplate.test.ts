/**
 * Tests for the `getDepositAccountTemplate` operation.
 *
 * Happy path discovers a real id via `listDepositAccountTemplates`. Error
 * coverage hits Forbidden (bad key), NotFound (well-formed-but-missing id),
 * and the BadRequest path declared by the spec patch.
 */
import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { getDepositAccountTemplate } from "../src/operations/getDepositAccountTemplate.ts";
import { listDepositAccountTemplates } from "../src/operations/listDepositAccountTemplates.ts";
import { runEffect, testRunId, unknownId } from "./setup.ts";

describe("getDepositAccountTemplate", () => {
  describe("happy path", () => {
    it(
      "fetches a deposit account template by id",
      async () => {
        const list = await runEffect(
          listDepositAccountTemplates({ page_size: 1 }),
        );
        if (list.data.length === 0) return;

        const target = list.data[0]!;
        const result = await runEffect(
          getDepositAccountTemplate({ id: target.id }),
        );

        expect(result.type).toBe("DEPOSIT_ACCOUNT_TEMPLATE");
        expect(result.id).toBe(target.id);
        expect(typeof result.name).toBe("string");
        expect(["DDA", "FBO", "OMNIBUS", "VIRTUAL_DDA"]).toContain(
          result.deposit_account_type,
        );
        expect(["ENABLED", "DISABLED"]).toContain(result.status);
        expect(Array.isArray(result.ownership_types)).toBe(true);
        expect(result.interest_rates).toBeTruthy();
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
          getDepositAccountTemplate({ id: unknownId("datmpl") }).pipe(
            Effect.flip,
            Effect.provide(Main),
          ) as Effect.Effect<unknown, never, never>,
        )) as { _tag: string };

        expect(error._tag).toBe("Forbidden");
      },
      30_000,
    );

    it(
      "unknown deposit account template id -> NotFound",
      async () => {
        const error = (await runEffect(
          getDepositAccountTemplate({ id: unknownId("datmpl") }).pipe(
            Effect.flip,
          ),
        )) as { _tag: string };

        expect(error._tag).toBe("NotFound");
      },
      30_000,
    );

    it(
      "malformed deposit account template id -> BadRequest",
      async () => {
        // Spec patch declares 400 INVALID_REQUEST on
        // GET /deposit_account_templates/{id}. A clearly malformed path
        // segment exercises that branch.
        const error = (await runEffect(
          getDepositAccountTemplate({ id: "!!!invalid!!!" }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("BadRequest");
      },
      30_000,
    );
  });
});
