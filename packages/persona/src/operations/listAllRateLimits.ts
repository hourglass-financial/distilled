import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden } from "../errors.ts";

// Input Schema
export interface ListAllRateLimitsInput {
  keyInflection?: "camel" | "kebab" | "snake";
  idempotencyKey?: string;
  personaVersion?:
    | "2025-12-08"
    | "2025-10-27"
    | "2023-01-05"
    | "2022-09-01"
    | "2021-08-18"
    | "2021-07-05"
    | "2021-02-21"
    | "2020-05-18";
}
export const ListAllRateLimitsInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct(
  {
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
  },
).pipe(
  T.Http({ method: "GET", path: "/rate-limits" }),
) as unknown as Schema.Codec<ListAllRateLimitsInput>;

// Output Schema
export interface ListAllRateLimitsOutput {
  data: ReadonlyArray<{
    type?: "rate-limit/api";
    attributes?: {
      limit?: number;
      remaining?: number;
      "seconds-to-reset"?: number;
    };
  }>;
}
export const ListAllRateLimitsOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Array(
      Schema.Struct({
        type: Schema.optional(Schema.Literals(["rate-limit/api"])),
        attributes: Schema.optional(
          Schema.Struct({
            limit: Schema.optional(Schema.Number),
            remaining: Schema.optional(Schema.Number),
            "seconds-to-reset": Schema.optional(Schema.Number),
          }),
        ),
      }),
    ),
  }) as unknown as Schema.Codec<ListAllRateLimitsOutput>;

// The operation
/**
 * List all Rate Limits
 *
 * Returns a list of your current rate limits.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 */
export const listAllRateLimits = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListAllRateLimitsInput,
  outputSchema: ListAllRateLimitsOutput,
  errors: [BadRequest, Forbidden] as const,
}));
