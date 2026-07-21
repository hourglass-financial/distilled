/**
 * Scope-based test-resource lifecycle (#30, decision 7).
 *
 * `resource(create, destroy)` is `Effect.acquireRelease` with the cleanup
 * conventions baked in: teardown registers atomically with acquisition (no
 * create-to-attach gap where a thrown assertion leaks the resource), runs on
 * failure and interruption alike, and composes LIFO for chained resources
 * (org → user → role-assignment). `liveTest()` supplies the `Scope`.
 *
 * Vendors declare one-line constructors over it:
 * ```ts
 * const orgResource = (name: string) =>
 *   resource(organizations.create({ name }), (org) =>
 *     organizations.delete({ id: org.id }));
 * ```
 */
import * as Effect from "effect/Effect";
import type { Scope } from "effect/Scope";

/**
 * Acquire a test resource whose teardown is guaranteed by the surrounding
 * `Scope`. Destroy failures are swallowed (`Effect.ignore`): cleanup
 * best-effort must never mask the test's own outcome — but the destroy runs
 * on every exit, including failure and interruption.
 */
export const resource = <A, E, R, XE, XR>(
  create: Effect.Effect<A, E, R>,
  destroy: (value: A) => Effect.Effect<unknown, XE, XR>,
): Effect.Effect<A, E, R | XR | Scope> =>
  Effect.acquireRelease(create, (value) => destroy(value).pipe(Effect.ignore));
