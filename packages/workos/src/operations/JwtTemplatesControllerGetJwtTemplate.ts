import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { NotFound } from "../errors.ts";

// Input Schema
export interface JwtTemplatesControllerGetJwtTemplateInput {}
export const JwtTemplatesControllerGetJwtTemplateInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({}).pipe(
    T.Http({ method: "GET", path: "/user_management/jwt_template" }),
  ) as unknown as GeneratedStructCodec<JwtTemplatesControllerGetJwtTemplateInput>;

// Output Schema
export interface JwtTemplatesControllerGetJwtTemplateOutput {
  object: "jwt_template";
  content: string;
  created_at: string;
  updated_at: string;
}
export const JwtTemplatesControllerGetJwtTemplateOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    object: Schema.Literals(["jwt_template"]),
    content: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
  }) as unknown as GeneratedStructCodec<JwtTemplatesControllerGetJwtTemplateOutput>;

// The operation
/**
 * Get JWT template
 *
 * Get the JWT template for the current environment.
 */
export const JwtTemplatesControllerGetJwtTemplate =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: JwtTemplatesControllerGetJwtTemplateInput,
    outputSchema: JwtTemplatesControllerGetJwtTemplateOutput,
    errors: [NotFound] as const,
  }));
