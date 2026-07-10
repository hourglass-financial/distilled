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
export const ArchiveADeviceFingerprintListItemInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    listItemId: Schema.String.pipe(T.PathParam()),
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
  }).pipe(
    T.Http({
      method: "DELETE",
      path: "/list-item/device-fingerprints/{listItemId}",
    }),
  );
export type ArchiveADeviceFingerprintListItemInput =
  typeof ArchiveADeviceFingerprintListItemInput.Type;

// Output Schema
export const ArchiveADeviceFingerprintListItemOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Struct({
      id: Schema.optional(Schema.String),
      type: Schema.optional(Schema.String),
      attributes: Schema.optional(
        Schema.Struct({
          status: Schema.optional(Schema.String),
          "archived-at": Schema.optional(Schema.NullOr(Schema.String)),
          "updated-at": Schema.optional(Schema.NullOr(Schema.String)),
          "created-at": Schema.optional(Schema.String),
          "redacted-at": Schema.optional(Schema.NullOr(Schema.String)),
          "match-count": Schema.optional(Schema.Number),
          value: Schema.optional(Schema.String),
        }),
      ),
      relationships: Schema.optional(
        Schema.Struct({
          creator: Schema.optional(
            Schema.Struct({
              data: Schema.optional(Schema.Unknown),
            }),
          ),
        }),
      ),
    }),
  });
export type ArchiveADeviceFingerprintListItemOutput =
  typeof ArchiveADeviceFingerprintListItemOutput.Type;

// The operation
/**
 * Archive a Device Fingerprint List Item
 *
 * Archived items are not matched against new inquiries.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 * @param listItemId - ID of list item to archive.
 */
export const archiveADeviceFingerprintListItem =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: ArchiveADeviceFingerprintListItemInput,
    outputSchema: ArchiveADeviceFingerprintListItemOutput,
    errors: [
      BadRequest,
      Forbidden,
      NotFound,
      Conflict,
      UnprocessableEntity,
    ] as const,
  }));
