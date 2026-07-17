import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { NotFound, Conflict, UnprocessableEntity } from "../errors.ts";

// Input Schema
export interface ApiKeysControllerExpireInput {
  id: string;
  expires_at?: string | null;
}
export const ApiKeysControllerExpireInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    id: Schema.String.pipe(T.PathParam()),
    expires_at: Schema.optional(Schema.NullOr(Schema.String)),
  }).pipe(
    T.Http({ method: "POST", path: "/api_keys/{id}/expire" }),
  ) as unknown as GeneratedStructCodec<ApiKeysControllerExpireInput>;

// Output Schema
export interface ApiKeysControllerExpireOutput {
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
}
export const ApiKeysControllerExpireOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
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
  }) as unknown as GeneratedStructCodec<ApiKeysControllerExpireOutput>;

// The operation
/**
 * Expire an API key
 *
 * Expire an API key immediately, schedule a future expiration, or clear a scheduled future expiration.
 *
 * @param id - The unique ID of the API key.
 */
export const ApiKeysControllerExpire = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: ApiKeysControllerExpireInput,
    outputSchema: ApiKeysControllerExpireOutput,
    errors: [NotFound, Conflict, UnprocessableEntity] as const,
  }),
);
