import * as EffectConfig from "effect/Config";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import { ConfigError } from "@distilled.cloud/core/errors";

export const DEFAULT_API_BASE_URL = "https://api.withpersona.com/api/v1";

export interface Config {
  readonly apiKey: Redacted.Redacted<string>;
  readonly apiBaseUrl: string;
}

export class Credentials extends Context.Service<Credentials, Config>()(
  "PersonaCredentials",
) {}

const envConfig = EffectConfig.all({
  apiKey: EffectConfig.string("PERSONA_API_KEY"),
  apiBaseUrl: EffectConfig.string("PERSONA_API_URL").pipe(
    EffectConfig.withDefault(DEFAULT_API_BASE_URL),
  ),
});

export const CredentialsFromEnv = Layer.effect(
  Credentials,
  envConfig.pipe(
    Effect.mapError(
      () =>
        new ConfigError({
          message: "PERSONA_API_KEY environment variable is required",
        }),
    ),
    Effect.map(({ apiKey, apiBaseUrl }) => ({
      apiKey: Redacted.make(apiKey),
      apiBaseUrl,
    })),
  ),
);
