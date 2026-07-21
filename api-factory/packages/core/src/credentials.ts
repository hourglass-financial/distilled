/** Shared environment-backed credential assembly for generated clients. */
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import type * as Redacted from "effect/Redacted";
import { ConfigError } from "./errors.ts";

/** Resolved credentials shared by every generated client configuration. */
export interface CredentialsShape {
  readonly apiKey: Redacted.Redacted<string>;
  readonly baseUrl: string;
}

/** Vendor profile data needed to read credentials from the environment. */
export interface CredentialsEnvSpec {
  readonly apiKeyVar: string;
  readonly baseUrlVar: string;
  readonly defaultBaseUrl: string;
}

/** Build the environment configuration for a generated client's credentials. */
export const credentialsConfig = (
  spec: CredentialsEnvSpec,
): Config.Config<CredentialsShape> =>
  Config.all({
    apiKey: Config.redacted(spec.apiKeyVar),
    baseUrl: Config.string(spec.baseUrlVar).pipe(
      Config.withDefault(spec.defaultBaseUrl),
    ),
  });

/** Read credentials and replace provider details with the vendor's typed error. */
export const credentialsFromEnvEffect = (
  spec: CredentialsEnvSpec,
  missingMessage: string,
): Effect.Effect<CredentialsShape, ConfigError> =>
  credentialsConfig(spec).pipe(
    Effect.mapError(() => new ConfigError({ message: missingMessage })),
  );
