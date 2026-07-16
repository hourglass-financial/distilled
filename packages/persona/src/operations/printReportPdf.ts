import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden, NotFound, Conflict } from "../errors.ts";

// Input Schema
export interface PrintReportPdfInput {
  reportId: string;
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
export const PrintReportPdfInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  reportId: Schema.String.pipe(T.PathParam()),
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
  T.Http({ method: "GET", path: "/reports/{reportId}/print" }),
) as unknown as Schema.Codec<PrintReportPdfInput>;

// Output Schema
export type PrintReportPdfOutput = void;
export const PrintReportPdfOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Void as unknown as Schema.Codec<PrintReportPdfOutput>;

// The operation
/**
 * Print Report PDF
 *
 * Prints a report in PDF format.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 */
export const printReportPdf = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: PrintReportPdfInput,
  outputSchema: PrintReportPdfOutput,
  errors: [BadRequest, Forbidden, NotFound, Conflict] as const,
}));
