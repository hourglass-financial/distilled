import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden, NotFound } from "../errors.ts";

// Input Schema
export interface ListReportHistoryInput {
  reportId: string;
  page?: { after?: string; before?: string; size?: number };
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
).pipe(
  T.Http({ method: "GET", path: "/reports/{reportId}/history" }),
) as unknown as Schema.Codec<ListReportHistoryInput>;

// Output Schema
export interface ListReportHistoryOutput {
  data: ReadonlyArray<
    | {
        id?: string;
        type: string;
        "created-at": string;
        "creator-name": string;
      }
    | {
        id?: string;
        type: string;
        "run-type": string;
        "scheduled-date"?: string;
        "completed-at"?: string | null;
        matches?: number | null;
      }
  >;
  links: { prev: string | null; next: string | null } | null;
}
export const ListReportHistoryOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Array(
      Schema.Union([
        Schema.Struct({
          id: Schema.optional(Schema.String),
          type: Schema.String,
          "created-at": Schema.String,
          "creator-name": Schema.String,
        }),
        Schema.Struct({
          id: Schema.optional(Schema.String),
          type: Schema.String,
          "run-type": Schema.String,
          "scheduled-date": Schema.optional(Schema.String),
          "completed-at": Schema.optional(Schema.NullOr(Schema.String)),
          matches: Schema.optional(Schema.NullOr(Schema.Number)),
        }),
      ]),
    ),
    links: Schema.NullOr(
      Schema.Struct({
        prev: Schema.NullOr(Schema.String),
        next: Schema.NullOr(Schema.String),
      }),
    ),
  }) as unknown as Schema.Codec<ListReportHistoryOutput>;

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
