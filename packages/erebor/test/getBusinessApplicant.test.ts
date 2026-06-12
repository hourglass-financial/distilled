/**
 * Tests for the `getBusinessApplicant` operation.
 *
 * Happy path discovers a real id via `listBusinessApplicants`. Error
 * coverage hits Forbidden (bad key), NotFound (well-formed-but-missing
 * id), and the BadRequest path declared by the spec patch.
 */
import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { getBusinessApplicant } from "../src/operations/getBusinessApplicant.ts";
import { listBusinessApplicants } from "../src/operations/listBusinessApplicants.ts";
import { runEffect, testRunId, unknownId } from "./setup.ts";

describe("getBusinessApplicant", () => {
  describe("happy path", () => {
    it(
      "fetches a business applicant by id",
      async () => {
        const list = await runEffect(listBusinessApplicants({ page_size: 1 }));
        if (list.data.length === 0) return;

        const target = list.data[0]!;
        const result = await runEffect(
          getBusinessApplicant({ id: target.id }),
        );

        expect(result.type).toBe("BUSINESS_APPLICANT");
        expect(result.id).toBe(target.id);
        expect(typeof result.program_id).toBe("string");
        expect(typeof result.name).toBe("string");
        expect(result.incorporation_address).toBeTruthy();
        expect(result.physical_address).toBeTruthy();
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
          getBusinessApplicant({ id: unknownId("biz_applct") }).pipe(
            Effect.flip,
            Effect.provide(Main),
          ) as Effect.Effect<unknown, never, never>,
        )) as { _tag: string };

        expect(error._tag).toBe("Forbidden");
      },
      30_000,
    );

    it(
      "unknown business applicant id -> NotFound",
      async () => {
        const error = (await runEffect(
          getBusinessApplicant({ id: unknownId("biz_applct") }).pipe(
            Effect.flip,
          ),
        )) as { _tag: string };

        expect(error._tag).toBe("NotFound");
      },
      30_000,
    );

    it(
      "malformed business applicant id -> BadRequest",
      async () => {
        // Spec patch declares 400 INVALID_REQUEST on GET /business_applicants/{id}.
        // A clearly malformed path segment exercises that branch.
        const error = (await runEffect(
          getBusinessApplicant({ id: "!!!invalid!!!" }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("BadRequest");
      },
      30_000,
    );
  });
});
