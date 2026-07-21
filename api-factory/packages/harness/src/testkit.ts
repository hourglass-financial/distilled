/**
 * `liveTest` / `contractTest` — the vendor-suite test wrappers
 * (#30, decisions 5, 7, 9).
 *
 * Both stamp the covered op key(s) into the test title so the coverage
 * reporter can verify the manifest's `tested` claims against what actually
 * ran. `liveTest` additionally: gates on the vendor environment (credential
 * or capability missing → a visible skip whose title names exactly what is
 * absent), supplies the `Scope` that `resource()` teardown registers into,
 * provides the vendor's layer, and defaults the timeout to 30s for real-API
 * latency.
 */
import * as Effect from "effect/Effect";
import type * as Layer from "effect/Layer";
import type { Scope } from "effect/Scope";
import { it } from "vitest";
import type { VendorEnv } from "./env.ts";
import { type Covers, gatedSuffix, stampSuffix } from "./stamp.ts";

/** Default timeout for tests hitting a real API. */
export const LIVE_TIMEOUT = 30_000;

/** Per-test declaration for {@link contractTest}. */
export interface ContractSpec {
  /** Op key(s) this test covers, e.g. `"organizations.create"`. */
  readonly covers: Covers;
  readonly timeout?: number;
}

/**
 * Register a contract-lane (mock transport) test. The body is an ordinary
 * vitest test function — contract suites drive the client through their own
 * mock-transport helpers and stay in Promise land.
 */
export const contractTest = (
  title: string,
  spec: ContractSpec,
  body: () => unknown | Promise<unknown>,
): void => {
  it(`${title}${stampSuffix("contract", spec.covers)}`, body, spec.timeout);
};

/** Configuration captured once per vendor suite by {@link makeLiveTest}. */
export interface LiveTestConfig<Caps extends string, R, LE> {
  readonly env: VendorEnv<Caps>;
  /** The vendor's client layer, e.g. `layerFromEnv`. */
  readonly layer: Layer.Layer<R, LE>;
  /** Default timeout for every live test. Default {@link LIVE_TIMEOUT}. */
  readonly timeout?: number;
}

/** Per-test declaration for a live test. */
export interface LiveSpec<Caps extends string> {
  /** Op key(s) this test covers. */
  readonly covers: Covers;
  /** Capabilities this test needs beyond base credentials. */
  readonly needs?: readonly Caps[];
  readonly timeout?: number;
}

/** The registered live-test function for one vendor suite. */
export type LiveTest<Caps extends string, R> = (
  title: string,
  spec: LiveSpec<Caps>,
  body: () => Effect.Effect<unknown, unknown, R | Scope>,
) => void;

/**
 * Build the vendor's `liveTest`. Gating happens at collection time against
 * the resolved {@link VendorEnv}: no credential → every live test is a
 * visible skip naming the credential var; a missing capability → a visible
 * skip naming the capability. Otherwise the body runs `Effect.scoped` (so
 * `resource()` cleanup fires on success, failure, and interruption) with the
 * vendor layer provided.
 */
export const makeLiveTest = <Caps extends string, R, LE>(
  config: LiveTestConfig<Caps, R, LE>,
): LiveTest<Caps, R> => {
  const { env, layer } = config;
  return (title, spec, body) => {
    const stamped = `${title}${stampSuffix("live", spec.covers)}`;
    if (!env.live) {
      it.skip(`${stamped}${gatedSuffix(`missing ${env.apiKeyVar}`)}`, () => {});
      return;
    }
    const missing = env.missing(spec.needs ?? []);
    if (missing.length > 0) {
      it.skip(`${stamped}${gatedSuffix(`missing capability ${missing.join(", ")}`)}`, () => {});
      return;
    }
    it(
      stamped,
      () =>
        // The body may only require `R | Scope` (its signature), `scoped`
        // discharges Scope and the layer discharges R — but tsc cannot reduce
        // Exclude over an abstract type parameter, hence the local assertion.
        Effect.runPromise(
          Effect.scoped(body()).pipe(Effect.provide(layer)) as Effect.Effect<
            unknown,
            unknown,
            never
          >,
        ),
      spec.timeout ?? config.timeout ?? LIVE_TIMEOUT,
    );
  };
};
