import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { Conflict, UnprocessableEntity } from "../errors.ts";

// Input Schema
export interface CorsOriginsControllerCreateCorsOriginInput {
  origin: string;
}
export const CorsOriginsControllerCreateCorsOriginInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    origin: Schema.String,
  }).pipe(
    T.Http({ method: "POST", path: "/user_management/cors_origins" }),
  ) as unknown as GeneratedStructCodec<CorsOriginsControllerCreateCorsOriginInput>;

// Output Schema
export interface CorsOriginsControllerCreateCorsOriginOutput {
  object: "cors_origin";
  id: string;
  origin: string;
  created_at: string;
  updated_at: string;
}
export const CorsOriginsControllerCreateCorsOriginOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    object: Schema.Literals(["cors_origin"]),
    id: Schema.String,
    origin: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
  }) as unknown as GeneratedStructCodec<CorsOriginsControllerCreateCorsOriginOutput>;

// The operation
/**
 * Create a CORS origin
 *
 * Creates a new CORS origin for the current environment. CORS origins allow browser-based applications to make requests to the WorkOS API.
 */
export const CorsOriginsControllerCreateCorsOrigin =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: CorsOriginsControllerCreateCorsOriginInput,
    outputSchema: CorsOriginsControllerCreateCorsOriginOutput,
    errors: [Conflict, UnprocessableEntity] as const,
  }));
