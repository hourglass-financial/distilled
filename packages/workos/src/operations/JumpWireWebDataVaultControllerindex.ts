import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { BadRequest } from "../errors.ts";

// Input Schema
export interface JumpWireWebDataVaultControllerindexInput {
  limit?: number;
  before?: string;
  after?: string;
  order?: "asc" | "desc";
  search?: string;
  updatedAfter?: string;
}
export const JumpWireWebDataVaultControllerindexInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    limit: Schema.optional(Schema.Number).pipe(T.HttpQuery("limit")),
    before: Schema.optional(Schema.String).pipe(T.HttpQuery("before")),
    after: Schema.optional(Schema.String).pipe(T.HttpQuery("after")),
    order: Schema.optional(Schema.Literals(["asc", "desc"])).pipe(
      T.HttpQuery("order"),
    ),
    search: Schema.optional(Schema.String).pipe(T.HttpQuery("search")),
    updatedAfter: Schema.optional(Schema.String).pipe(
      T.HttpQuery("updatedAfter"),
    ),
  }).pipe(
    T.Http({ method: "GET", path: "/vault/v1/kv" }),
  ) as unknown as GeneratedStructCodec<JumpWireWebDataVaultControllerindexInput>;

// Output Schema
export interface JumpWireWebDataVaultControllerindexOutput {
  data: ReadonlyArray<{ id: string; name: string; updated_at?: string | null }>;
  list_metadata: { after?: string | null; before?: string | null };
}
export const JumpWireWebDataVaultControllerindexOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Array(
      Schema.Struct({
        id: Schema.String,
        name: Schema.String,
        updated_at: Schema.optional(Schema.NullOr(Schema.String)),
      }),
    ),
    list_metadata: Schema.Struct({
      after: Schema.optional(Schema.NullOr(Schema.String)),
      before: Schema.optional(Schema.NullOr(Schema.String)),
    }),
  }) as unknown as GeneratedStructCodec<JumpWireWebDataVaultControllerindexOutput>;

// The operation
/**
 * List objects
 *
 * List all encrypted objects with cursor-based pagination.
 *
 * @param limit - Upper limit on the number of objects to return.
 * @param before - Cursor for the previous page of results.
 * @param after - Cursor for the next page of results.
 * @param order - Sort direction for results.
 * @param search - Filter results by name or structured search JSON.
 * @param updatedAfter - ISO 8601 timestamp to filter by last modified time.
 */
export const JumpWireWebDataVaultControllerindex =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: JumpWireWebDataVaultControllerindexInput,
    outputSchema: JumpWireWebDataVaultControllerindexOutput,
    errors: [BadRequest] as const,
  }));
