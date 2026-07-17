import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import * as HttpBody from "effect/unstable/http/HttpBody";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientError from "effect/unstable/http/HttpClientError";
import { describe, expect, expectTypeOf, it } from "vitest";
import { type ClientConfig, makeAPI } from "../src/client.ts";
import type { Policy } from "../src/retry.ts";
import { SensitiveString } from "../src/sensitive.ts";
import * as T from "../src/traits.ts";

class Credentials extends Context.Service<
  Credentials,
  { readonly apiBaseUrl: string }
>()("ClientContractRuntimeCredentials") {}

class Retry extends Context.Service<Retry, Policy>()(
  "ClientContractRuntimeRetry",
) {}

class OutputService extends Context.Service<OutputService, string>()(
  "ClientContractOutputService",
) {}

class OperationError extends Schema.TaggedErrorClass<OperationError>()(
  "OperationError",
  { message: Schema.String },
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
  errors: [OperationError] as const,
}));

declare const ServicefulOutput: Schema.Codec<
  { readonly ok: boolean },
  { readonly ok: boolean },
  OutputService
>;
const servicefulOperation = API.make(() => ({
  inputSchema: Input,
  outputSchema: ServicefulOutput,
}));

describe("makeAPI operation contract", () => {
  it("exposes complete errors and requirements in both calling forms", () => {
    type DefaultParseError = InstanceType<
      ClientConfig<Credentials>["ParseError"]
    >;
    type DirectEffect = ReturnType<typeof operation>;
    type ExpectedError =
      | OperationError
      | ProviderError
      | ParseError
      | HttpClientError.HttpClientError
      | HttpBody.HttpBodyError;

    expectTypeOf(null as never).toEqualTypeOf<DefaultParseError>();
    expectTypeOf<
      Schema.Codec.Encoded<typeof SensitiveString>
    >().toEqualTypeOf<string>();
    expectTypeOf<
      Schema.Codec.DecodingServices<typeof SensitiveString>
    >().toEqualTypeOf<never>();
    expectTypeOf<
      Schema.Codec.EncodingServices<typeof SensitiveString>
    >().toEqualTypeOf<never>();
    expectTypeOf<Effect.Services<DirectEffect>>().toEqualTypeOf<
      Credentials | HttpClient.HttpClient
    >();
    expectTypeOf<Effect.Error<DirectEffect>>().toEqualTypeOf<ExpectedError>();

    type CapturedOperation = Effect.Success<typeof operation>;
    type CapturedEffect = ReturnType<CapturedOperation>;
    expectTypeOf<Effect.Services<CapturedEffect>>().toEqualTypeOf<never>();
    expectTypeOf<Effect.Error<CapturedEffect>>().toEqualTypeOf<ExpectedError>();

    type ServicefulDirectEffect = ReturnType<typeof servicefulOperation>;
    expectTypeOf<Effect.Services<ServicefulDirectEffect>>().toEqualTypeOf<
      Credentials | HttpClient.HttpClient | OutputService
    >();
  });

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
