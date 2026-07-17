import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { UnprocessableEntity } from "../errors.ts";

// Input Schema
export interface AuditLogValidatorVersionsControllerCreateInput {
  actionName: string;
  actor?: { metadata: unknown };
  targets: ReadonlyArray<{ type: string; metadata?: unknown }>;
  metadata?: unknown;
}
export const AuditLogValidatorVersionsControllerCreateInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    actionName: Schema.String.pipe(T.PathParam()),
    actor: Schema.optional(
      Schema.Struct({
        metadata: Schema.Unknown,
      }),
    ),
    targets: Schema.Array(
      Schema.Struct({
        type: Schema.String,
        metadata: Schema.optional(Schema.Unknown),
      }),
    ),
    metadata: Schema.optional(Schema.Unknown),
  }).pipe(
    T.Http({
      method: "POST",
      path: "/audit_logs/actions/{actionName}/schemas",
    }),
  ) as unknown as GeneratedStructCodec<AuditLogValidatorVersionsControllerCreateInput>;

// Output Schema
export interface AuditLogValidatorVersionsControllerCreateOutput {
  object: "audit_log_schema";
  version: number;
  actor?: { metadata: Record<string, unknown> };
  targets: ReadonlyArray<{ type: string; metadata?: Record<string, unknown> }>;
  metadata?: Record<string, unknown>;
  created_at: string;
}
export const AuditLogValidatorVersionsControllerCreateOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
        metadata: Schema.optional(Schema.Record(Schema.String, Schema.Unknown)),
      }),
    ),
    metadata: Schema.optional(Schema.Record(Schema.String, Schema.Unknown)),
    created_at: Schema.String,
  }) as unknown as GeneratedStructCodec<AuditLogValidatorVersionsControllerCreateOutput>;

// The operation
/**
 * Create Schema
 *
 * Creates a new Audit Log schema used to validate the payload of incoming Audit Log Events. If the `action` does not exist, it will also be created.
 *
 * @param actionName - The name of the Audit Log action.
 */
export const AuditLogValidatorVersionsControllerCreate =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: AuditLogValidatorVersionsControllerCreateInput,
    outputSchema: AuditLogValidatorVersionsControllerCreateOutput,
    errors: [UnprocessableEntity] as const,
  }));
