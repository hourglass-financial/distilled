import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import {
  BadRequest,
  Forbidden,
  NotFound,
  Conflict,
  UnprocessableEntity,
} from "../errors.ts";

// Input Schema
export const RedactAVerificationInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    verificationId: Schema.String.pipe(T.PathParam()),
    keyInflection: Schema.optional(
      Schema.Literals(["camel", "kebab", "snake"]),
    ).pipe(T.HttpHeader("Key-Inflection")),
    idempotencyKey: Schema.optional(Schema.String).pipe(
      T.HttpHeader("Idempotency-Key"),
    ),
    personaVersion: Schema.optional(
      Schema.Literals([
        "2025-12-08",
        "2025-10-27",
        "2023-01-05",
        "2022-09-01",
        "2021-08-18",
        "2021-07-05",
        "2021-02-21",
        "2020-05-18",
      ]),
    ).pipe(T.HttpHeader("Persona-Version")),
  }).pipe(
    T.Http({ method: "DELETE", path: "/verifications/{verificationId}" }),
  );
export type RedactAVerificationInput = typeof RedactAVerificationInput.Type;

// Output Schema
export const RedactAVerificationOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Unknown,
  });
export type RedactAVerificationOutput = typeof RedactAVerificationOutput.Type;

// The operation
/**
 * Redact a Verification
 *
 * Permanently deletes personally identifiable information (PII) for a Verification. **This action cannot be undone**. This endpoint can be used to comply with privacy regulations such as GDPR / CCPA or to enforce data privacy.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 */
export const redactAVerification = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: RedactAVerificationInput,
  outputSchema: RedactAVerificationOutput,
  errors: [
    BadRequest,
    Forbidden,
    NotFound,
    Conflict,
    UnprocessableEntity,
  ] as const,
}));
