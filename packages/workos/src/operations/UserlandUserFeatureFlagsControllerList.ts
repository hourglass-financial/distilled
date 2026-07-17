import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { NotFound } from "../errors.ts";

// Input Schema
export interface UserlandUserFeatureFlagsControllerListInput {
  userId: string;
  before?: string;
  after?: string;
  limit?: number;
  order?: "normal" | "desc" | "asc";
}
export const UserlandUserFeatureFlagsControllerListInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    userId: Schema.String.pipe(T.PathParam()),
    before: Schema.optional(Schema.String).pipe(T.HttpQuery("before")),
    after: Schema.optional(Schema.String).pipe(T.HttpQuery("after")),
    limit: Schema.optional(Schema.Number).pipe(T.HttpQuery("limit")),
    order: Schema.optional(Schema.Literals(["normal", "desc", "asc"])).pipe(
      T.HttpQuery("order"),
    ),
  }).pipe(
    T.Http({
      method: "GET",
      path: "/user_management/users/{userId}/feature-flags",
    }),
  ) as unknown as GeneratedStructCodec<UserlandUserFeatureFlagsControllerListInput>;

// Output Schema
export interface UserlandUserFeatureFlagsControllerListOutput {
  object: "list";
  data: ReadonlyArray<{
    object: "feature_flag";
    id: string;
    slug: string;
    name: string;
    description: string | null;
    owner: {
      email: string;
      first_name: string | null;
      last_name: string | null;
    } | null;
    tags: ReadonlyArray<string>;
    enabled: boolean;
    default_value: boolean;
    created_at: string;
    updated_at: string;
  }>;
  list_metadata: { before: string | null; after: string | null };
}
export const UserlandUserFeatureFlagsControllerListOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    object: Schema.Literals(["list"]),
    data: Schema.Array(
      Schema.Struct({
        object: Schema.Literals(["feature_flag"]),
        id: Schema.String,
        slug: Schema.String,
        name: Schema.String,
        description: Schema.NullOr(Schema.String),
        owner: Schema.NullOr(
          Schema.Struct({
            email: Schema.String,
            first_name: Schema.NullOr(Schema.String),
            last_name: Schema.NullOr(Schema.String),
          }),
        ),
        tags: Schema.Array(Schema.String),
        enabled: Schema.Boolean,
        default_value: Schema.Boolean,
        created_at: Schema.String,
        updated_at: Schema.String,
      }),
    ),
    list_metadata: Schema.Struct({
      before: Schema.NullOr(Schema.String),
      after: Schema.NullOr(Schema.String),
    }),
  }) as unknown as GeneratedStructCodec<UserlandUserFeatureFlagsControllerListOutput>;

// The operation
/**
 * List enabled feature flags for a user
 *
 * Get a list of all enabled feature flags for the provided user. This includes feature flags enabled specifically for the user as well as any organizations that the user is a member of.
 *
 * @param userId - The ID of the user.
 * @param before - An object ID that defines your place in the list. When the ID is not present, you are at the end of the list.
 * @param after - An object ID that defines your place in the list. When the ID is not present, you are at the end of the list.
 * @param limit - Upper limit on the number of objects to return, between `1` and `100`.
 * @param order - Order the results by the creation time.
 */
export const UserlandUserFeatureFlagsControllerList =
  /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
    inputSchema: UserlandUserFeatureFlagsControllerListInput,
    outputSchema: UserlandUserFeatureFlagsControllerListOutput,
    errors: [NotFound] as const,
  }));
