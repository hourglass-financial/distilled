import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden } from "../errors.ts";

// Input Schema
export const ListAllWorkflowRunsInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    page: Schema.optional(
      Schema.Struct({
        after: Schema.optional(Schema.String),
        before: Schema.optional(Schema.String),
        size: Schema.optional(Schema.Number),
      }),
    ).pipe(T.HttpQuery("page")),
    fields: Schema.optional(Schema.Record(Schema.String, Schema.String)).pipe(
      T.HttpQuery("fields"),
    ),
    filter: Schema.optional(
      Schema.Struct({
        status: Schema.optional(Schema.String),
      }),
    ).pipe(T.HttpQuery("filter")),
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
  }).pipe(T.Http({ method: "GET", path: "/workflow-runs" }));
export type ListAllWorkflowRunsInput = typeof ListAllWorkflowRunsInput.Type;

// Output Schema
export const ListAllWorkflowRunsOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Array(
      Schema.Struct({
        type: Schema.optional(Schema.String),
        id: Schema.optional(Schema.String),
        attributes: Schema.optional(
          Schema.Struct({
            "completed-at": Schema.optional(Schema.NullOr(Schema.String)),
            "created-at": Schema.optional(Schema.String),
            status: Schema.optional(Schema.String),
          }),
        ),
        relationships: Schema.optional(
          Schema.Struct({
            creator: Schema.optional(
              Schema.Struct({
                data: Schema.optional(Schema.Unknown),
              }),
            ),
            workflow: Schema.optional(
              Schema.Struct({
                data: Schema.optional(
                  Schema.Struct({
                    type: Schema.optional(Schema.String),
                    id: Schema.optional(Schema.String),
                  }),
                ),
              }),
            ),
            "workflow-version": Schema.optional(
              Schema.Struct({
                data: Schema.optional(
                  Schema.Struct({
                    type: Schema.optional(Schema.String),
                    id: Schema.optional(Schema.String),
                  }),
                ),
              }),
            ),
          }),
        ),
        meta: Schema.optional(
          Schema.Struct({
            "processing-time-seconds": Schema.optional(
              Schema.NullOr(Schema.Number),
            ),
          }),
        ),
      }),
    ),
    links: Schema.Struct({
      next: Schema.NullOr(Schema.String),
      prev: Schema.NullOr(Schema.String),
    }),
  });
export type ListAllWorkflowRunsOutput = typeof ListAllWorkflowRunsOutput.Type;

// The operation
/**
 * List all Workflow Runs
 *
 * Returns a list of your environment's workflow runs. Results are returned in reverse chronological order, with the most recently created objects first.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const listAllWorkflowRuns = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListAllWorkflowRunsInput,
  outputSchema: ListAllWorkflowRunsOutput,
  errors: [BadRequest, Forbidden] as const,
}));
