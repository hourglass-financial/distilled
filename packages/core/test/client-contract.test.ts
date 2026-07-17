import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import * as HttpClient from "effect/unstable/http/HttpClient";
import { describe, expect, it } from "vitest";
import { makeAPI } from "../src/client.ts";
import type { Policy } from "../src/retry.ts";
import * as T from "../src/traits.ts";

class Credentials extends Context.Service<
  Credentials,
  { readonly apiBaseUrl: string }
>()("ClientContractRuntimeCredentials") {}

class Retry extends Context.Service<Retry, Policy>()(
  "ClientContractRuntimeRetry",
) {}

class ProviderError extends Schema.TaggedErrorClass<ProviderError>()(
  "ProviderError",
  { message: Schema.String },
) {}

class ParseError extends Schema.TaggedErrorClass<ParseError>()("ParseError", {
  body: Schema.Unknown,
  cause: Schema.Unknown,
}) {}

const API = makeAPI<Credentials, never, ProviderError, ParseError>({
  credentials: Credentials as any,
  getBaseUrl: (credentials: any) => credentials.apiBaseUrl,
  getAuthHeaders: () => ({}),
  matchError: () => Effect.fail(new ProviderError({ message: "provider" })),
  ParseError,
  retry: Retry,
});

const Input = Schema.Struct({ value: Schema.String }).pipe(
  T.Http({ method: "POST", path: "/contract" }),
);
const Output = Schema.Struct({ ok: Schema.Boolean });
const operation = API.make(() => ({
  inputSchema: Input,
  outputSchema: Output,
}));

describe("makeAPI operation contract", () => {
  it("surfaces request encoding failures as the configured parse error", async () => {
    const client = HttpClient.make(() =>
      Effect.die("the transport must not run for invalid input"),
    );

    const error = await Effect.runPromise(
      operation({} as never).pipe(
        Effect.flip,
        Effect.provideService(Credentials, {
          apiBaseUrl: "https://example.test",
        }),
        Effect.provideService(HttpClient.HttpClient, client),
      ),
    );

    expect(error._tag).toBe("ParseError");
  });
});
