import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden, NotFound } from "../errors.ts";

// Input Schema
export const RetrieveAnAccountTypeInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    accountTypeId: Schema.String.pipe(T.PathParam()),
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
  }).pipe(T.Http({ method: "GET", path: "/account-types/{accountTypeId}" }));
export type RetrieveAnAccountTypeInput = typeof RetrieveAnAccountTypeInput.Type;

// Output Schema
export const RetrieveAnAccountTypeOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Struct({
      type: Schema.optional(Schema.String),
      id: Schema.optional(Schema.String),
      attributes: Schema.optional(
        Schema.Struct({
          name: Schema.optional(Schema.String),
          "created-at": Schema.optional(Schema.String),
          "updated-at": Schema.optional(Schema.NullOr(Schema.String)),
          "field-schemas": Schema.optional(Schema.Array(Schema.Unknown)),
        }),
      ),
      relationships: Schema.optional(
        Schema.Struct({
          "account-statuses": Schema.optional(
            Schema.Struct({
              data: Schema.optional(
                Schema.Array(
                  Schema.Struct({
                    type: Schema.optional(Schema.String),
                    id: Schema.optional(Schema.String),
                  }),
                ),
              ),
            }),
          ),
          "default-account-status": Schema.optional(
            Schema.Struct({
              data: Schema.optional(
                Schema.NullOr(
                  Schema.Struct({
                    type: Schema.optional(Schema.String),
                    id: Schema.optional(Schema.String),
                  }),
                ),
              ),
            }),
          ),
        }),
      ),
    }),
    included: Schema.optional(Schema.Array(Schema.Unknown)),
  });
export type RetrieveAnAccountTypeOutput =
  typeof RetrieveAnAccountTypeOutput.Type;

// The operation
/**
 * Retrieve an Account Type
 *
 * Retrieves the details of an existing Account Type, including its configured field schemas.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 * @param accountTypeId - ID of the Account Type to retrieve.
 */
export const retrieveAnAccountType = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: RetrieveAnAccountTypeInput,
    outputSchema: RetrieveAnAccountTypeOutput,
    errors: [BadRequest, Forbidden, NotFound] as const,
  }),
);
