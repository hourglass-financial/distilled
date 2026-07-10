import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, Forbidden } from "../errors.ts";

// Input Schema
export const ListAllInquirySessionsInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    filter: Schema.optional(
      Schema.Struct({
        "inquiry-id": Schema.optional(Schema.String),
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
  }).pipe(T.Http({ method: "GET", path: "/inquiry-sessions" }));
export type ListAllInquirySessionsInput =
  typeof ListAllInquirySessionsInput.Type;

// Output Schema
export const ListAllInquirySessionsOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Array(
      Schema.Struct({
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
            "browser-full-version": Schema.optional(
              Schema.NullOr(Schema.String),
            ),
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
            "network-organization": Schema.optional(
              Schema.NullOr(Schema.String),
            ),
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
    ),
    links: Schema.Struct({
      prev: Schema.NullOr(Schema.String),
      next: Schema.NullOr(Schema.String),
    }),
  });
export type ListAllInquirySessionsOutput =
  typeof ListAllInquirySessionsOutput.Type;

// The operation
/**
 * List all Inquiry Sessions
 *
 * Retrieves a list of Inquiry Sessions. Results are returned in reverse chronological order, with the most recently created objects first.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 */
export const listAllInquirySessions = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: ListAllInquirySessionsInput,
    outputSchema: ListAllInquirySessionsOutput,
    errors: [BadRequest, Forbidden] as const,
  }),
);
