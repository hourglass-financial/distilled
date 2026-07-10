import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import {
  Credentials,
  CredentialsFromEnv,
  DEFAULT_API_BASE_URL,
} from "../src/credentials.ts";

export const testRunId: string = crypto
  .randomUUID()
  .replace(/-/g, "")
  .slice(0, 8);

export const TestLayer = Layer.merge(CredentialsFromEnv, FetchHttpClient.layer);

export const InvalidCredentialsLayer = Layer.merge(
  Layer.succeed(Credentials, {
    apiKey: Redacted.make(`distilled-persona-invalid-${testRunId}`),
    apiBaseUrl: DEFAULT_API_BASE_URL,
  }),
  FetchHttpClient.layer,
);

export const runEffect = <A, E, R>(
  effect: Effect.Effect<A, E, R>,
): Promise<A> =>
  Effect.runPromise(
    effect.pipe(Effect.provide(TestLayer)) as Effect.Effect<A, E, never>,
  );

export const runEffectWithInvalidCredentials = <A, E, R>(
  effect: Effect.Effect<A, E, R>,
): Promise<A> =>
  Effect.runPromise(
    effect.pipe(Effect.provide(InvalidCredentialsLayer)) as Effect.Effect<
      A,
      E,
      never
    >,
  );
