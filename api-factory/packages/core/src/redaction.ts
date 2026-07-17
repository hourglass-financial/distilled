/**
 * Redaction helper for secrets that must never print.
 *
 * v1 shipped two schemas: `Sensitive` (input — decoded `A | Redacted<A>`, with
 * an `as any` in its decode getter) and `SensitiveOutput` (strict `Redacted<A>`,
 * cast-free). We keep only the strict, cast-free one and use it for *both*
 * directions, because it is symmetric:
 *
 * - **Wire → decoded:** a plain string is wrapped into `Redacted<string>` so a
 *   response secret is redacted before the caller ever sees it.
 * - **Decoded → wire:** a `Redacted<string>` is unwrapped back to the plain
 *   string so a request secret actually reaches the server.
 *
 * Note `Schema.Redacted(inner)` alone does NOT do this — its *encoded* side is
 * `Redacted<T>` (it serializes to `"<redacted>"`), so it can neither read a
 * plain wire string nor emit the real secret. The `decodeTo` transform below is
 * what bridges the plain wire string and the `Redacted` decoded value.
 */
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import * as SchemaTransformation from "effect/SchemaTransformation";

/**
 * A secret string: `Redacted<string>` on the decoded (caller) side, plain
 * `string` on the wire. Use for request-body secrets (`password`,
 * `client_secret`) and response-body secrets (`access_token`, `refresh_token`).
 *
 * @example
 * ```ts
 * import * as Redacted from "effect/Redacted";
 * authenticateWithPassword({ password: Redacted.make(form.password), ... });
 * // result.access_token is Redacted<string> — prints "<redacted>"
 * ```
 */
export const Secret: Schema.decodeTo<
  Schema.Redacted<typeof Schema.String>,
  typeof Schema.String
> = Schema.String.pipe(
  Schema.decodeTo(
    Schema.Redacted(Schema.String),
    SchemaTransformation.transform({
      decode: (value: string) => Redacted.make(value),
      encode: (value: Redacted.Redacted<string>) => Redacted.value(value),
    }),
  ),
);
