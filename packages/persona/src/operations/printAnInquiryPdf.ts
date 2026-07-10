import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden, NotFound, Conflict } from "../errors.ts";

// Input Schema
export const PrintAnInquiryPdfInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct(
  {
    inquiryId: Schema.String.pipe(T.PathParam()),
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
).pipe(T.Http({ method: "GET", path: "/inquiries/{inquiryId}/print" }));
export type PrintAnInquiryPdfInput = typeof PrintAnInquiryPdfInput.Type;

// Output Schema
export const PrintAnInquiryPdfOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Void;
export type PrintAnInquiryPdfOutput = typeof PrintAnInquiryPdfOutput.Type;

// The operation
/**
 * Print Inquiry PDF
 *
 * Prints an Inquiry as PDF.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 */
export const printAnInquiryPdf = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: PrintAnInquiryPdfInput,
  outputSchema: PrintAnInquiryPdfOutput,
  errors: [BadRequest, Forbidden, NotFound, Conflict] as const,
}));
