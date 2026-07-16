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
export interface CreateAnInquirySessionInput {
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
  data?: { attributes?: { "inquiry-id": string } };
}
export const CreateAnInquirySessionInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
    data: Schema.optional(
      Schema.Struct({
        attributes: Schema.optional(
          Schema.Struct({
            "inquiry-id": Schema.String,
          }),
        ),
      }),
    ),
  }).pipe(
    T.Http({ method: "POST", path: "/inquiry-sessions" }),
  ) as unknown as Schema.Codec<CreateAnInquirySessionInput>;

// Output Schema
export interface CreateAnInquirySessionOutput {
  data: {
    type?: string;
    id?: string;
    attributes?: {
      status?: string;
      "created-at"?: string;
      "started-at"?: string | null;
      "expired-at"?: string | null;
      "ip-address"?: string | null;
      "user-agent"?: string | null;
      "os-name"?: string | null;
      "os-full-version"?: string | null;
      "device-type"?: string | null;
      "device-name"?: string | null;
      "browser-name"?: string | null;
      "browser-full-version"?: string | null;
      "mobile-sdk-name"?: string | null;
      "mobile-sdk-full-version"?: string | null;
      "device-handoff-method"?: string | null;
      "is-proxy"?: boolean | null;
      "is-tor"?: boolean | null;
      "is-datacenter"?: boolean | null;
      "is-vpn"?: boolean | null;
      "threat-level"?: string | null;
      "country-code"?: string | null;
      "country-name"?: string | null;
      "region-code"?: string | null;
      "region-name"?: string | null;
      latitude?: number | null;
      longitude?: number | null;
      "gps-latitude"?: number | null;
      "gps-longitude"?: number | null;
      "gps-precision"?: string | null;
      "ip-connection-type"?: string | null;
      "ip-isp"?: string | null;
      "network-organization"?: string | null;
    };
    relationships?: {
      inquiry?: { data?: { type?: string; id?: string } };
      device?: { data?: { type?: string; id?: string } | null };
      network?: { data?: { type?: string; id?: string } | null };
    };
  };
  included?: ReadonlyArray<
    | {
        type?: string;
        id?: string;
        attributes?: {
          "device-vendor-id"?: string | null;
          "device-fingerprint"?: string | null;
          "browser-fingerprint"?: string | null;
        };
      }
    | {
        type: string;
        id: string;
        attributes: {
          status: string;
          "reference-id": string | null;
          note: string | null;
          behaviors: Record<string, unknown> | null;
          tags: ReadonlyArray<string | null>;
          creator: string;
          "reviewer-comment": string | null;
          "created-at": string;
          "updated-at": string;
          "started-at": string | null;
          "expires-at": string | null;
          "completed-at": string | null;
          "failed-at": string | null;
          "marked-for-review-at": string | null;
          "decisioned-at": string | null;
          "expired-at": string | null;
          "redacted-at": string | null;
          "previous-step-name": string | null;
          "next-step-name": string | null;
          fields: Record<
            string,
            | { type: "string"; value: string | null }
            | { type: "choices"; value: string | null }
            | { type: "multi_choices"; value: ReadonlyArray<string> }
            | { type: "boolean"; value: boolean | null }
            | { type: "number"; value: number | null }
            | { type: "date"; value: string | null }
            | {
                type: "generic";
                value: { id: string; type: "Document::Generic" } | null;
              }
            | {
                type: "government_id";
                value: { id: string; type: "Document::GovernmentId" } | null;
              }
            | {
                type: "selfie";
                value: { id: string; type: "Selfie::ProfileAndCenter" } | null;
              }
            | { type: "json"; value: unknown }
          >;
        };
        relationships: {
          account?: { data?: { id?: string; type?: string } | null };
          documents?: { data?: ReadonlyArray<{ id?: string; type?: string }> };
          template?: { data?: { id?: string; type?: string } | null };
          "inquiry-template"?: { data?: { id?: string; type?: string } | null };
          "inquiry-template-version"?: {
            data?: { id?: string; type?: string } | null;
          };
          reports?: { data?: ReadonlyArray<{ id?: string; type?: string }> };
          transaction?: { data?: { id?: string; type?: string } | null };
          reviewer?: { data?: { id?: string; type?: string } | null };
          selfies?: { data?: ReadonlyArray<{ id?: string; type?: string }> };
          sessions?: { data?: ReadonlyArray<{ id?: string; type?: string }> };
          verifications?: {
            data?: ReadonlyArray<{ id?: string; type?: string }>;
          };
        };
      }
    | {
        type?: string;
        id?: string;
        attributes?: {
          "created-at"?: string;
          "ip-address"?: string | null;
          "service-provider"?: string | null;
          "service-type"?: string | null;
          "proxy-type"?: string | null;
          "threat-level"?: string | null;
          "country-code"?: string | null;
          "country-name"?: string | null;
          "region-code"?: string | null;
          "region-name"?: string | null;
          latitude?: number | null;
          longitude?: number | null;
        };
      }
  >;
}
export const CreateAnInquirySessionOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Struct({
      type: Schema.optional(Schema.String),
      id: Schema.optional(Schema.String),
      attributes: Schema.optional(
        Schema.Struct({
          status: Schema.optional(Schema.String),
          "created-at": Schema.optional(Schema.String),
          "started-at": Schema.optional(Schema.NullOr(Schema.String)),
          "expired-at": Schema.optional(Schema.NullOr(Schema.String)),
          "ip-address": Schema.optional(Schema.NullOr(Schema.String)),
          "user-agent": Schema.optional(Schema.NullOr(Schema.String)),
          "os-name": Schema.optional(Schema.NullOr(Schema.String)),
          "os-full-version": Schema.optional(Schema.NullOr(Schema.String)),
          "device-type": Schema.optional(Schema.NullOr(Schema.String)),
          "device-name": Schema.optional(Schema.NullOr(Schema.String)),
          "browser-name": Schema.optional(Schema.NullOr(Schema.String)),
          "browser-full-version": Schema.optional(Schema.NullOr(Schema.String)),
          "mobile-sdk-name": Schema.optional(Schema.NullOr(Schema.String)),
          "mobile-sdk-full-version": Schema.optional(
            Schema.NullOr(Schema.String),
          ),
          "device-handoff-method": Schema.optional(
            Schema.NullOr(Schema.String),
          ),
          "is-proxy": Schema.optional(Schema.NullOr(Schema.Boolean)),
          "is-tor": Schema.optional(Schema.NullOr(Schema.Boolean)),
          "is-datacenter": Schema.optional(Schema.NullOr(Schema.Boolean)),
          "is-vpn": Schema.optional(Schema.NullOr(Schema.Boolean)),
          "threat-level": Schema.optional(Schema.NullOr(Schema.String)),
          "country-code": Schema.optional(Schema.NullOr(Schema.String)),
          "country-name": Schema.optional(Schema.NullOr(Schema.String)),
          "region-code": Schema.optional(Schema.NullOr(Schema.String)),
          "region-name": Schema.optional(Schema.NullOr(Schema.String)),
          latitude: Schema.optional(Schema.NullOr(Schema.Number)),
          longitude: Schema.optional(Schema.NullOr(Schema.Number)),
          "gps-latitude": Schema.optional(Schema.NullOr(Schema.Number)),
          "gps-longitude": Schema.optional(Schema.NullOr(Schema.Number)),
          "gps-precision": Schema.optional(Schema.NullOr(Schema.String)),
          "ip-connection-type": Schema.optional(Schema.NullOr(Schema.String)),
          "ip-isp": Schema.optional(Schema.NullOr(Schema.String)),
          "network-organization": Schema.optional(Schema.NullOr(Schema.String)),
        }),
      ),
      relationships: Schema.optional(
        Schema.Struct({
          inquiry: Schema.optional(
            Schema.Struct({
              data: Schema.optional(
                Schema.Struct({
                  type: Schema.optional(Schema.String),
                  id: Schema.optional(Schema.String),
                }),
              ),
            }),
          ),
          device: Schema.optional(
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
          network: Schema.optional(
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
  }) as unknown as Schema.Codec<CreateAnInquirySessionOutput>;

// The operation
/**
 * Create an Inquiry Session
 *
 * Creates a new Inquiry Session. By default, we only allow up to 25 sessions per Inquiry.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const createAnInquirySession = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: CreateAnInquirySessionInput,
    outputSchema: CreateAnInquirySessionOutput,
    errors: [
      BadRequest,
      Forbidden,
      NotFound,
      Conflict,
      UnprocessableEntity,
    ] as const,
  }),
);
