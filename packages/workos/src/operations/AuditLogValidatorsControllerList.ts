import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { NotFound, UnprocessableEntity } from "../errors.ts";

// Input Schema
export interface AuditLogValidatorsControllerListInput {
  before?: string;
  after?: string;
  limit?: number;
  order?: "normal" | "desc" | "asc";
}
export const AuditLogValidatorsControllerListInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    before: Schema.optional(Schema.String).pipe(T.HttpQuery("before")),
    after: Schema.optional(Schema.String).pipe(T.HttpQuery("after")),
    limit: Schema.optional(Schema.Number).pipe(T.HttpQuery("limit")),
    order: Schema.optional(Schema.Literals(["normal", "desc", "asc"])).pipe(
      T.HttpQuery("order"),
    ),
  }).pipe(
    T.Http({ method: "GET", path: "/audit_logs/actions" }),
  ) as unknown as GeneratedStructCodec<AuditLogValidatorsControllerListInput>;

// Output Schema
export interface AuditLogValidatorsControllerListOutput {
  object?: "list";
  list_metadata?: { before: string | null; after: string | null };
  data?: ReadonlyArray<{
    object: "audit_log_action";
    name: string;
    schema: {
      object: "audit_log_schema";
      version: number;
      actor?: { metadata: Record<string, unknown> };
      targets: ReadonlyArray<{
        type: string;
        metadata?: Record<string, unknown>;
      }>;
      metadata?: Record<string, unknown>;
      created_at: string;
    };
    created_at: string;
    updated_at: string;
  }>;
}
export const AuditLogValidatorsControllerListOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    object: Schema.optional(Schema.Literals(["list"])),
    list_metadata: Schema.optional(
      Schema.Struct({
        before: Schema.NullOr(Schema.String),
        after: Schema.NullOr(Schema.String),
      }),
    ),
    data: Schema.optional(
      Schema.Array(
        Schema.Struct({
          object: Schema.Literals(["audit_log_action"]),
          name: Schema.String,
          schema: Schema.Struct({
            object: Schema.Literals(["audit_log_schema"]),
            version: Schema.Number,
            actor: Schema.optional(
              Schema.Struct({
                metadata: Schema.Record(Schema.String, Schema.Unknown),
              }),
            ),
            targets: Schema.Array(
              Schema.Struct({
                type: Schema.String,
                metadata: Schema.optional(
                  Schema.Record(Schema.String, Schema.Unknown),
                ),
              }),
            ),
            metadata: Schema.optional(
              Schema.Record(Schema.String, Schema.Unknown),
            ),
            created_at: Schema.String,
          }),
          created_at: Schema.String,
          updated_at: Schema.String,
        }),
      ),
    ),
  }) as unknown as GeneratedStructCodec<AuditLogValidatorsControllerListOutput>;

// The operation
/**
 * List Actions
 *
 * Get a list of all Audit Log actions in the current environment.
 *
 * @param before - An object ID that defines your place in the list. When the ID is not present, you are at the end of the list.
 * @param after - An object ID that defines your place in the list. When the ID is not present, you are at the end of the list.
 * @param limit - Upper limit on the number of objects to return, between `1` and `100`.
 * @param order - Order the results by the creation time.
 */
export const AuditLogValidatorsControllerList =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: AuditLogValidatorsControllerListInput,
    outputSchema: AuditLogValidatorsControllerListOutput,
    errors: [NotFound, UnprocessableEntity] as const,
  }));
