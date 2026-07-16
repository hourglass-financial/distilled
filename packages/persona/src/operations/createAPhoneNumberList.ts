import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import {
  BadRequest,
  Forbidden,
  Conflict,
  UnprocessableEntity,
} from "../errors.ts";

// Input Schema
export interface CreateAPhoneNumberListInput {
  include?: string;
  fields?: Record<string, string>;
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
  data?: { attributes?: { name?: string } };
}
export const CreateAPhoneNumberListInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    include: Schema.optional(Schema.String).pipe(T.HttpQuery("include")),
    fields: Schema.optional(Schema.Record(Schema.String, Schema.String)).pipe(
      T.HttpQuery("fields", { style: "deepObject", explode: true }),
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
    data: Schema.optional(
      Schema.Struct({
        attributes: Schema.optional(
          Schema.Struct({
            name: Schema.optional(Schema.String),
          }),
        ),
      }),
    ),
  }).pipe(
    T.Http({ method: "POST", path: "/list/phone-numbers" }),
  ) as unknown as Schema.Codec<CreateAPhoneNumberListInput>;

// Output Schema
export interface CreateAPhoneNumberListOutput {
  data: {
    type?: string;
    id?: string;
    attributes?: {
      name?: string;
      status?: string;
      "archived-at"?: string | null;
      "created-at"?: string;
      "updated-at"?: string;
    };
    relationships?: { "list-items"?: { data?: ReadonlyArray<unknown> } };
  };
}
export const CreateAPhoneNumberListOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Struct({
      type: Schema.optional(Schema.String),
      id: Schema.optional(Schema.String),
      attributes: Schema.optional(
        Schema.Struct({
          name: Schema.optional(Schema.String),
          status: Schema.optional(Schema.String),
          "archived-at": Schema.optional(Schema.NullOr(Schema.String)),
          "created-at": Schema.optional(Schema.String),
          "updated-at": Schema.optional(Schema.String),
        }),
      ),
      relationships: Schema.optional(
        Schema.Struct({
          "list-items": Schema.optional(
            Schema.Struct({
              data: Schema.optional(Schema.Array(Schema.Unknown)),
            }),
          ),
        }),
      ),
    }),
  }) as unknown as Schema.Codec<CreateAPhoneNumberListOutput>;

// The operation
/**
 * Create a Phone Number List
 *
 * Create a new list for your organization.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const createAPhoneNumberList = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: CreateAPhoneNumberListInput,
    outputSchema: CreateAPhoneNumberListOutput,
    errors: [BadRequest, Forbidden, Conflict, UnprocessableEntity] as const,
  }),
);
