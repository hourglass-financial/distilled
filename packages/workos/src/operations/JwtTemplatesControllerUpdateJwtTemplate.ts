import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { UnprocessableEntity } from "../errors.ts";

// Input Schema
export interface JwtTemplatesControllerUpdateJwtTemplateInput {
  content: string;
}
export const JwtTemplatesControllerUpdateJwtTemplateInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    content: Schema.String,
  }).pipe(
    T.Http({ method: "PUT", path: "/user_management/jwt_template" }),
  ) as unknown as GeneratedStructCodec<JwtTemplatesControllerUpdateJwtTemplateInput>;

// Output Schema
export interface JwtTemplatesControllerUpdateJwtTemplateOutput {
  object: "jwt_template";
  content: string;
  created_at: string;
  updated_at: string;
}
export const JwtTemplatesControllerUpdateJwtTemplateOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    object: Schema.Literals(["jwt_template"]),
    content: Schema.String,
    created_at: Schema.String,
    updated_at: Schema.String,
  }) as unknown as GeneratedStructCodec<JwtTemplatesControllerUpdateJwtTemplateOutput>;

// The operation
/**
 * Update JWT template
 *
 * Update the JWT template for the current environment.
 */
export const JwtTemplatesControllerUpdateJwtTemplate =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: JwtTemplatesControllerUpdateJwtTemplateInput,
    outputSchema: JwtTemplatesControllerUpdateJwtTemplateOutput,
    errors: [UnprocessableEntity] as const,
  }));
