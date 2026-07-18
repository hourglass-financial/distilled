/**
 * Live-test harness for the WorkOS client. These tests hit the real WorkOS API
 * and are therefore gated on credentials: without `WORKOS_API_KEY` they SKIP
 * (visibly, via `it.skipIf`) rather than failing or silently passing.
 */
import {
  layerFromEnv,
  type WorkosClient,
} from "@hourglass-financial/api-factory-workos";
import * as Effect from "effect/Effect";

/** True when a WorkOS API key is available in the environment. */
export const hasCredentials =
  typeof process.env.WORKOS_API_KEY === "string" &&
  process.env.WORKOS_API_KEY.length > 0;

/** True when an AuthKit client id is also available (needed for authenticate). */
export const hasAuthKitClient =
  hasCredentials &&
  typeof process.env.WORKOS_CLIENT_ID === "string" &&
  process.env.WORKOS_CLIENT_ID.length > 0;

/** Unique-per-run suffix so parallel runs never collide on resource names. */
export const testRunId: string = crypto
  .randomUUID()
  .replace(/-/g, "")
  .slice(0, 8);

/** Run a WorkOS program against the live, env-configured client. */
export const run = <A, E>(
  program: Effect.Effect<A, E, WorkosClient>,
): Promise<A> => Effect.runPromise(program.pipe(Effect.provide(layerFromEnv)));
