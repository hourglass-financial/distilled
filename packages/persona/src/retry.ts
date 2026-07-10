/**
 * Persona retry configuration.
 */
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import {
  type Policy,
  throttlingFactory,
  transientFactory,
} from "@distilled.cloud/core/retry";
export {
  type Options,
  type Factory,
  type Policy,
  makeDefault,
  jittered,
  capped,
  throttlingOptions,
  transientOptions,
  throttlingFactory,
  transientFactory,
} from "@distilled.cloud/core/retry";

/**
 * Context tag for configuring retry behavior of Persona API calls.
 */
export class Retry extends Context.Service<Retry, Policy>()("PersonaRetry") {}

/**
 * Provides a custom retry policy to all Persona API calls.
 */
export const policy = (optionsOrFactory: Policy) =>
  Effect.provide(Layer.succeed(Retry, optionsOrFactory));

/**
 * Disables all automatic retries.
 */
export const none = Effect.provide(
  Layer.succeed(Retry, { while: () => false }),
);

/**
 * Apply the throttling retry policy.
 */
export const throttling = policy(throttlingFactory);

/**
 * Apply the transient retry policy.
 */
export const transient = policy(transientFactory);
