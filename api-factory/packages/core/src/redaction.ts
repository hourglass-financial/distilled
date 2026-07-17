/**
 * Redaction helper for secrets that must never print.
 *
 * `Secret` is Effect's own `Schema.RedactedFromValue(Schema.String)`: the
 * decoded (caller-facing) side is `Redacted<string>`, the wire side is the
 * plain string. Decode wraps a response secret before the caller ever sees it;
 * encode unwraps a request secret so it actually reaches the server. Its
 * built-in `redact` middleware also scrubs the raw value out of decode-error
 * messages, so a malformed secret cannot leak through a `SchemaError`.
 *
 * Two rejected alternatives, for the record:
 * - `Schema.Redacted(inner)` — its *encoded* side is `Redacted<T>` (serializes
 *   to `"<redacted>"`), so it can neither read a plain wire string nor emit the
 *   real secret over the wire. It is for values already `Redacted` end to end.
 * - v1's `Sensitive` — accepted `A | Redacted<A>` on input for convenience, at
 *   the cost of an `as any` in its decode getter and a union type that lets a
 *   plaintext secret travel (and print) inside the input object. v2 callers
 *   wrap with `Redacted.make(...)` instead; the secret is redacted from the
 *   moment it crosses the SDK boundary.
 */
import * as Schema from "effect/Schema";

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
export const Secret: Schema.RedactedFromValue<typeof Schema.String> =
  Schema.RedactedFromValue(Schema.String);
