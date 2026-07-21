import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import { describe, expect, it } from "vitest";
import {
  credentialsConfig,
  credentialsFromEnvEffect,
} from "../src/credentials.ts";

const spec = {
  apiKeyVar: "ACME_API_KEY",
  baseUrlVar: "ACME_API_URL",
  defaultBaseUrl: "https://api.acme.test",
};

describe("credentialsConfig", () => {
  it("uses the default base URL", async () => {
    const credentials = await Effect.runPromise(
      credentialsConfig(spec).parse(
        ConfigProvider.fromEnv({ env: { ACME_API_KEY: "secret" } }),
      ),
    );
    expect(Redacted.value(credentials.apiKey)).toBe("secret");
    expect(credentials.baseUrl).toBe("https://api.acme.test");
  });

  it("uses an environment base URL override", async () => {
    const credentials = await Effect.runPromise(
      credentialsConfig(spec).parse(
        ConfigProvider.fromEnv({
          env: {
            ACME_API_KEY: "secret",
            ACME_API_URL: "https://api.override.test",
          },
        }),
      ),
    );
    expect(credentials.baseUrl).toBe("https://api.override.test");
  });
});

describe("credentialsFromEnvEffect", () => {
  it("maps a missing API key to the configured ConfigError message", async () => {
    const error = await Effect.runPromise(
      credentialsFromEnvEffect(
        spec,
        "Acme credentials are not configured (set ACME_API_KEY).",
      ).pipe(
        Effect.provideService(
          ConfigProvider.ConfigProvider,
          ConfigProvider.fromEnv({ env: {} }),
        ),
        Effect.flip,
      ),
    );
    expect(error._tag).toBe("ConfigError");
    expect(error.message).toBe(
      "Acme credentials are not configured (set ACME_API_KEY).",
    );
  });
});
