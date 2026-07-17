import type * as Schema from "effect/Schema";

type OptionalKeys<T extends object> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

/**
 * Compact structural view of a generated `Schema.Struct` field map.
 *
 * It preserves decoded property names, values, and optional-key behavior while
 * deliberately widening encoded field types. This keeps generated declaration
 * files small and still allows consumers to safely spread `.fields` into a new
 * struct without casting through `unknown`.
 */
export type GeneratedStructFields<T extends object> = {
  readonly [K in keyof T]-?: K extends OptionalKeys<T>
    ? Schema.optional<Schema.Codec<Exclude<T[K], undefined>, unknown>>
    : Schema.Codec<T[K], unknown>;
};

// HOURGLASS PATCH: Keep generated structs composable without reintroducing the
// full inferred `Schema.Struct<{...}>` declaration-size cost.
export type GeneratedStructCodec<T extends object> = Schema.Codec<T> & {
  readonly fields: GeneratedStructFields<T>;
};
