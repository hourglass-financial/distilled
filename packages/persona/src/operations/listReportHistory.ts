import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden, NotFound } from "../errors.ts";

// Input Schema
export const ListReportHistoryInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct(
  {
    reportId: Schema.String.pipe(T.PathParam()),
    page: Schema.optional(
      Schema.Struct({
        after: Schema.optional(Schema.String),
        before: Schema.optional(Schema.String),
        size: Schema.optional(Schema.Number),
      }),
    ).pipe(T.HttpQuery("page")),
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
).pipe(T.Http({ method: "GET", path: "/reports/{reportId}/history" }));
export type ListReportHistoryInput = typeof ListReportHistoryInput.Type;

// Output Schema
export const ListReportHistoryOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Array(Schema.Unknown),
    links: Schema.NullOr(
      Schema.Struct({
        prev: Schema.NullOr(Schema.String),
        next: Schema.NullOr(Schema.String),
      }),
    ),
  });
export type ListReportHistoryOutput = typeof ListReportHistoryOutput.Type;

// The operation
/**
 * List Report history
 *
 * Retrieves the history of an existing Report, including runs and actions. See [Pagination](https://docs.withpersona.com/pagination) for more details about handling the response. Results are returned in reverse chronological order, with the most recently created objects first.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 */
export const listReportHistory = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListReportHistoryInput,
  outputSchema: ListReportHistoryOutput,
  errors: [BadRequest, Forbidden, NotFound] as const,
}));
