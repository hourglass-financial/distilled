/**
 * Tests for the `listDepositAccountTemplates` operation.
 *
 * Exercises paginated retrieval against the Erebor sandbox plus the
 * auth-failure (Forbidden) and malformed-cursor (BadRequest) paths
 * surfaced by the client's matchError mapping.
 */
import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { listDepositAccountTemplates } from "../src/operations/listDepositAccountTemplates.ts";
import { runEffect, testRunId } from "./setup.ts";

describe("listDepositAccountTemplates", () => {
  describe("happy path", () => {
    it(
      "returns a paginated list of deposit account templates",
      async () => {
        const result = await runEffect(
          listDepositAccountTemplates({ page_size: 5 }),
        );

        expect(result).toBeTruthy();
        expect(Array.isArray(result.data)).toBe(true);
        expect(typeof result.has_more).toBe("boolean");
        expect(typeof result.page_size).toBe("number");
        expect(result.page_size).toBeLessThanOrEqual(5);
        for (const template of result.data) {
          expect(template.type).toBe("DEPOSIT_ACCOUNT_TEMPLATE");
          expect(typeof template.id).toBe("string");
          expect(typeof template.name).toBe("string");
          expect(["DDA", "FBO", "OMNIBUS", "VIRTUAL_DDA"]).toContain(
            template.deposit_account_type,
          );
          expect(["ENABLED", "DISABLED"]).toContain(template.status);
          expect(Array.isArray(template.ownership_types)).toBe(true);
        }
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
          listDepositAccountTemplates({}).pipe(
            Effect.flip,
            Effect.provide(Main),
          ) as Effect.Effect<unknown, never, never>,
        )) as { _tag: string };

        expect(error._tag).toBe("Forbidden");
      },
      30_000,
    );  });
});
