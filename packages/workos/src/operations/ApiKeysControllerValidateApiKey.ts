import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { UnprocessableEntity } from "../errors.ts";

// Input Schema
export interface ApiKeysControllerValidateApiKeyInput {
  value: string;
}
export const ApiKeysControllerValidateApiKeyInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    value: Schema.String,
  }).pipe(
    T.Http({ method: "POST", path: "/api_keys/validations" }),
  ) as unknown as GeneratedStructCodec<ApiKeysControllerValidateApiKeyInput>;

// Output Schema
export interface ApiKeysControllerValidateApiKeyOutput {
  api_key: {
    object: "api_key";
    id: string;
    owner:
      | { type: "organization"; id: string }
      | { type: "user"; id: string; organization_id: string };
    name: string;
    obfuscated_value: string;
    last_used_at: string | null;
    expires_at: string | null;
    permissions: ReadonlyArray<string>;
    created_at: string;
    updated_at: string;
  } | null;
}
export const ApiKeysControllerValidateApiKeyOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    api_key: Schema.NullOr(
      Schema.Struct({
        object: Schema.Literals(["api_key"]),
        id: Schema.String,
        owner: Schema.Union(
          [
            Schema.Struct({
              type: Schema.Literals(["organization"]),
              id: Schema.String,
            }),
            Schema.Struct({
              type: Schema.Literals(["user"]),
              id: Schema.String,
              organization_id: Schema.String,
            }),
          ],
          { mode: "oneOf" },
        ),
        name: Schema.String,
        obfuscated_value: Schema.String,
        last_used_at: Schema.NullOr(Schema.String),
        expires_at: Schema.NullOr(Schema.String),
        permissions: Schema.Array(Schema.String),
        created_at: Schema.String,
        updated_at: Schema.String,
      }),
    ),
  }) as unknown as GeneratedStructCodec<ApiKeysControllerValidateApiKeyOutput>;

// The operation
/**
 * Validate API key
 *
 * Validate an API key value and return the API key object if valid.
 */
export const ApiKeysControllerValidateApiKey =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: ApiKeysControllerValidateApiKeyInput,
    outputSchema: ApiKeysControllerValidateApiKeyOutput,
    errors: [UnprocessableEntity] as const,
  }));
