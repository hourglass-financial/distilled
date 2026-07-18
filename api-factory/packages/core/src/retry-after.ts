/**
 * Parse a server wait hint from response headers into an Effect `Duration`.
 *
 * Recognizes the standard `Retry-After` header in both forms (delay-seconds and
 * HTTP-date) and the IETF `RateLimit-Reset` delta-seconds hint. The result is
 * clamped to a sane cap so a hostile server can't park a fiber forever, and is
 * only consulted for retryable statuses by the caller.
 */
import * as Duration from "effect/Duration";

/** Default clamp on an honored server hint. */
export const MAX_HINT: Duration.Duration = Duration.seconds(60);

const headerValue = (
  headers: Readonly<Record<string, string | undefined>>,
  name: string,
): string | undefined => headers[name] ?? headers[name.toLowerCase()];

/**
 * Parse `Retry-After` / `RateLimit-Reset` into a `Duration`, clamped to `max`
 * (default {@link MAX_HINT}). Returns `undefined` when no usable hint is
 * present. `now` is injectable for deterministic tests of the HTTP-date form.
 */
export const parseRetryAfter = (
  headers: Readonly<Record<string, string | undefined>>,
  options: { readonly max?: Duration.Duration; readonly now?: number } = {},
): Duration.Duration | undefined => {
  const max = options.max ?? MAX_HINT;
  const now = options.now ?? Date.now();

  const raw =
    headerValue(headers, "Retry-After") ??
    headerValue(headers, "RateLimit-Reset");
  if (raw === undefined) return undefined;

  const trimmed = raw.trim();
  if (trimmed === "") return undefined;

  // delta-seconds form: a bare non-negative integer.
  if (/^\d+$/.test(trimmed)) {
    const seconds = Number(trimmed);
    return Duration.min(Duration.seconds(seconds), max);
  }

  // HTTP-date form.
  const parsed = Date.parse(trimmed);
  if (Number.isNaN(parsed)) return undefined;
  const deltaMs = parsed - now;
  if (deltaMs <= 0) return Duration.zero;
  return Duration.min(Duration.millis(deltaMs), max);
};
