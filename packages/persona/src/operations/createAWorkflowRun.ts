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
export const CreateAWorkflowRunInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    workflowId: Schema.String.pipe(T.PathParam()),
    include: Schema.optional(Schema.String).pipe(T.HttpQuery("include")),
    fields: Schema.optional(Schema.Record(Schema.String, Schema.String)).pipe(
      T.HttpQuery("fields"),
    ),
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
    data: Schema.Struct({
      attributes: Schema.Struct({
        fields: Schema.Record(Schema.String, Schema.Unknown),
      }),
    }),
  }).pipe(T.Http({ method: "POST", path: "/workflows/{workflowId}/trigger" }));
export type CreateAWorkflowRunInput = typeof CreateAWorkflowRunInput.Type;

// Output Schema
export const CreateAWorkflowRunOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Struct({
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
    included: Schema.optional(Schema.Array(Schema.Unknown)),
  });
export type CreateAWorkflowRunOutput = typeof CreateAWorkflowRunOutput.Type;

// The operation
/**
 * Create a Workflow Run
 *
 * Creates a new Workflow Run.
 * Note: The payload is arbitrary and defined by the Workflow version trigger schema.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const createAWorkflowRun = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: CreateAWorkflowRunInput,
  outputSchema: CreateAWorkflowRunOutput,
  errors: [
    BadRequest,
    Forbidden,
    NotFound,
    Conflict,
    UnprocessableEntity,
  ] as const,
}));
