/**
 * `eventually()` — bounded polling for asynchronously-settling state
 * (#30, decision 7). The Audit-Logs export create→poll dance, resources that
 * appear a beat after their create call returns, caches converging.
 */
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";

/** Tunables for {@link eventually}. */
export interface EventuallyOptions {
  /** Delay between attempts. Default 1 second. */
  readonly interval?: Duration.Input;
  /** Maximum number of retries after the first attempt. Default 30. */
  readonly times?: number;
  /** Overall elapsed-time bound across retries. Default 30 seconds. */
  readonly timeout?: Duration.Input;
}

/**
 * Retry `effect` on any failure at a fixed interval until it succeeds or the
 * bounds run out; the last failure surfaces unchanged when they do. Use for
 * asserting state the API reaches asynchronously — never to paper over a
 * genuinely flaky call (that is what typed retry policies are for).
 */
export const eventually = <A, E, R>(
  effect: Effect.Effect<A, E, R>,
  options: EventuallyOptions = {},
): Effect.Effect<A, E, R> =>
  Effect.retry(effect, {
    schedule: Schedule.spaced(options.interval ?? Duration.seconds(1)).pipe(
      Schedule.upTo({
        times: options.times ?? 30,
        duration: options.timeout ?? Duration.seconds(30),
      }),
    ),
  });
