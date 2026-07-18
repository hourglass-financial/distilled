/**
 * Retry policy — transient/throttling categorization driving bounded,
 * `Retry-After`-honoring backoff.
 *
 * This is an honest reimplementation of v1's `packages/core/src/retry.ts`,
 * whose `capped` helper had a latent bug: on exceeding the cap it returned a
 * hard-coded `Duration.millis(5000)` instead of the cap itself, so a 60s
 * server hint silently collapsed to 5s. Here the server hint is honored
 * exactly, clamped to a cap via `Duration.min`, using the schedule's own
 * failure metadata (`metadata.input` is the error being retried) — the
 * `Schedule.passthrough` + `Schedule.modifyDelay` idiom from the Effect skill.
 */
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import {
  isThrottling,
  isTransient,
  retryAfterOf,
  type RetryDisposition,
} from "./category.ts";
import { MAX_HINT } from "./retry-after.ts";

/**
 * A retry policy: which errors to retry (`while`) and the schedule that spaces
 * the retries. `schedule: undefined` disables retrying entirely.
 */
export interface RetryPolicy {
  readonly while: (error: unknown) => boolean;
  readonly schedule: Schedule.Schedule<unknown> | undefined;
}

/** Tunables for the built-in backoff schedule. */
export interface BackoffOptions {
  /** First-retry delay; doubles each attempt. Default 100ms. */
  readonly base?: Duration.Input;
  /** Exponential growth factor. Default 2. */
  readonly factor?: number;
  /** Maximum number of retries (initial attempt excluded). Default 5. */
  readonly maxRetries?: number;
  /**
   * Upper bound on an honored server `Retry-After` hint. A misbehaving server
   * could otherwise park a fiber indefinitely. Default `MAX_HINT` (60s).
   */
  readonly maxHint?: Duration.Input;
  /**
   * Minimum delay applied to throttling (429) errors, so a rate limit is not
   * hammered by the first tiny exponential step. Default 500ms.
   */
  readonly throttleFloor?: Duration.Input;
}

const resolveDelay = (
  error: unknown,
  backoff: Duration.Duration,
  maxHint: Duration.Duration,
  throttleFloor: Duration.Duration,
): Duration.Duration => {
  // A server-provided `Retry-After` wins, clamped to the cap.
  const hint = retryAfterOf(error);
  if (hint !== undefined) return Duration.min(hint, maxHint);
  // Otherwise back off, but never below the throttling floor for 429s.
  if (isThrottling(error)) return Duration.max(backoff, throttleFloor);
  return backoff;
};

/**
 * Build the built-in backoff schedule: exponential + jitter, bounded by
 * `maxRetries`, with `Retry-After` honoring and a throttling floor layered on
 * via `modifyDelay`. `passthrough` makes the schedule surface the retried
 * error as its output so `modifyDelay` can read it from `metadata.input`.
 */
export const backoffSchedule = (
  options: BackoffOptions = {},
): Schedule.Schedule<unknown> => {
  const maxHint = Duration.fromInputUnsafe(options.maxHint ?? MAX_HINT);
  const throttleFloor = Duration.fromInputUnsafe(
    options.throttleFloor ?? Duration.millis(500),
  );
  return Schedule.exponential(
    options.base ?? Duration.millis(100),
    options.factor ?? 2,
  ).pipe(
    Schedule.jittered,
    Schedule.upTo({ times: options.maxRetries ?? 5 }),
    Schedule.passthrough,
    Schedule.modifyDelay(({ input, duration }) =>
      Effect.succeed(resolveDelay(input, duration, maxHint, throttleFloor)),
    ),
  );
};

/**
 * Default policy: retry transient/throttling failures and wire-level transport
 * errors with bounded, `Retry-After`-honoring backoff. Non-idempotent-looking
 * client errors (4xx other than 423/429) and decode failures are never
 * retried — retrying them only masks the real problem.
 */
export const defaultPolicy: RetryPolicy = {
  while: isTransient,
  schedule: backoffSchedule(),
};

/** Retry only throttling (429) failures. */
export const throttlingPolicy: RetryPolicy = {
  while: isThrottling,
  schedule: backoffSchedule(),
};

/** Never retry — every failure surfaces on its first occurrence. */
export const disabled: RetryPolicy = {
  while: () => false,
  schedule: undefined,
};

/** Retry the given dispositions with the built-in backoff. */
export const forDispositions = (
  ...dispositions: readonly RetryDisposition[]
): RetryPolicy => {
  const set = new Set(dispositions);
  return {
    while: (error) => {
      if (set.has("throttling") && isThrottling(error)) return true;
      return isTransient(error) && set.has("transient");
    },
    schedule: backoffSchedule(),
  };
};

/** True when the operation's disposition permits retrying this error. */
const allowedByDisposition = (
  error: unknown,
  disposition: RetryDisposition,
): boolean =>
  disposition === "transient" ? isTransient(error) : isThrottling(error);

/**
 * Apply a retry policy to an effect, bounded by the operation's declared
 * disposition. The disposition says what the operation *may* retry (an
 * idempotent read may retry any transient failure; a mutating call only
 * explicit throttling); the policy says what the consumer *wants* retried and
 * on what schedule. The effective predicate is the conjunction, so a permissive
 * policy can never widen a mutating operation into transport replay. A no-op
 * when the disposition is `"none"` or the policy disables retrying.
 */
export const apply =
  (policy: RetryPolicy, disposition: RetryDisposition) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R> =>
    disposition === "none" || policy.schedule === undefined
      ? effect
      : Effect.retry(effect, {
          while: (error) =>
            allowedByDisposition(error, disposition) && policy.while(error),
          schedule: policy.schedule,
        });
