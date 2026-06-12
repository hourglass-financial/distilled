/**
 * Tests for the `updatePersonApplicant` operation.
 *
 * Only `custom_ref` / `custom_fields` are mutable. Happy path discovers
 * a real id via `listPersonApplicants`. Error coverage hits Forbidden,
 * NotFound, and the BadRequest path declared by the spec patch.
 */
import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { listPersonApplicants } from "../src/operations/listPersonApplicants.ts";
import { updatePersonApplicant } from "../src/operations/updatePersonApplicant.ts";
import { runEffect, testRunId, unknownId } from "./setup.ts";

describe("updatePersonApplicant", () => {
  describe("happy path", () => {
    it(
      "patches custom_ref and custom_fields on an existing person applicant",
      async () => {
        const list = await runEffect(listPersonApplicants({ page_size: 1 }));
        if (list.data.length === 0) return;

        const target = list.data[0]!;
        const newRef = `distilled-erebor-${testRunId}`;
        const newFields = { test_run_id: testRunId, source: "distilled" };

        const result = await runEffect(
          updatePersonApplicant({
            id: target.id,
            custom_ref: newRef,
            custom_fields: newFields,
          }),
        );

        expect(result.type).toBe("PERSON_APPLICANT");
        expect(result.id).toBe(target.id);
        expect(result.custom_ref).toBe(newRef);
        expect(result.custom_fields).toMatchObject(newFields);
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
          updatePersonApplicant({
            id: unknownId("prsn_applct"),
            custom_ref: `distilled-erebor-${testRunId}`,
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
      "unknown person applicant id -> NotFound",
      async () => {
        const error = (await runEffect(
          updatePersonApplicant({
            id: unknownId("prsn_applct"),
            custom_ref: `distilled-erebor-${testRunId}`,
          }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("NotFound");
      },
      30_000,
    );

    it(
      "malformed person applicant id -> BadRequest",
      async () => {
        // Spec patch declares 400 INVALID_REQUEST on PATCH /person_applicants/{id}.
        // A clearly malformed path segment exercises that branch.
        const error = (await runEffect(
          updatePersonApplicant({
            id: "!!!invalid!!!",
            custom_ref: `distilled-erebor-${testRunId}`,
          }).pipe(Effect.flip),
        )) as { _tag: string };

        expect(error._tag).toBe("BadRequest");
      },
      30_000,
    );
  });
});
