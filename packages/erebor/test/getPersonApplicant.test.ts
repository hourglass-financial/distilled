/**
 * Tests for the `getPersonApplicant` operation.
 *
 * Happy path discovers a real id via `listPersonApplicants`. Error
 * coverage hits Forbidden (bad key), NotFound (well-formed-but-missing
 * id), and the BadRequest path declared by the spec patch.
 */
import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { getPersonApplicant } from "../src/operations/getPersonApplicant.ts";
import { listPersonApplicants } from "../src/operations/listPersonApplicants.ts";
import { runEffect, testRunId, unknownId } from "./setup.ts";

describe("getPersonApplicant", () => {
  describe("happy path", () => {
    it(
      "fetches a person applicant by id",
      async () => {
        const list = await runEffect(listPersonApplicants({ page_size: 1 }));
        if (list.data.length === 0) return;

        const target = list.data[0]!;
        const result = await runEffect(getPersonApplicant({ id: target.id }));

        expect(result.type).toBe("PERSON_APPLICANT");
        expect(result.id).toBe(target.id);
        expect(typeof result.program_id).toBe("string");
        expect(typeof result.first_name).toBe("string");
        expect(typeof result.last_name).toBe("string");
        expect(typeof result.date_of_birth).toBe("string");
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
          getPersonApplicant({ id: unknownId("prsn_applct") }).pipe(
            Effect.flip,
            Effect.provide(Main),
          ) as Effect.Effect<unknown, never, never>,
        )) as { _tag: string };

        expect(error._tag).toBe("Forbidden");
      },
      30_000,
    );

    it(
      "unknown person applicant id -> NotFound",
      async () => {
        const error = (await runEffect(
          getPersonApplicant({ id: unknownId("prsn_applct") }).pipe(
            Effect.flip,
          ),
        )) as { _tag: string };

        expect(error._tag).toBe("NotFound");
      },
      30_000,
    );

    it(
      "malformed person applicant id -> BadRequest",
      async () => {
        // Spec patch declares 400 INVALID_REQUEST on GET /person_applicants/{id}.
        // A clearly malformed path segment exercises that branch.
        const error = (await runEffect(
          getPersonApplicant({ id: "!!!invalid!!!" }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("BadRequest");
      },
      30_000,
    );
  });
});
