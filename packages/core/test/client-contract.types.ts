import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import * as HttpBody from "effect/unstable/http/HttpBody";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientError from "effect/unstable/http/HttpClientError";
import { makeAPI } from "../src/client.ts";
import type { Policy } from "../src/retry.ts";
import { SensitiveString } from "../src/sensitive.ts";
import * as T from "../src/traits.ts";

class Credentials extends Context.Service<
  Credentials,
  { readonly apiBaseUrl: string }
>()("ClientContractCredentials") {}

class Retry extends Context.Service<Retry, Policy>()("ClientContractRetry") {}

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

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
type Assert<T extends true> = T;

type _SensitiveEncoded = Assert<
  Equal<Schema.Codec.Encoded<typeof SensitiveString>, string>
>;
type _SensitiveDecodingServices = Assert<
  Equal<Schema.Codec.DecodingServices<typeof SensitiveString>, never>
>;
type _SensitiveEncodingServices = Assert<
  Equal<Schema.Codec.EncodingServices<typeof SensitiveString>, never>
>;

type DirectEffect = ReturnType<typeof operation>;
type ExpectedError =
  | OperationError
  | ProviderError
  | ParseError
  | HttpClientError.HttpClientError
  | HttpBody.HttpBodyError;

type _DirectRequirements = Assert<
  Equal<Effect.Services<DirectEffect>, Credentials | HttpClient.HttpClient>
>;
type _DirectErrors = Assert<Equal<Effect.Error<DirectEffect>, ExpectedError>>;

type CapturedOperation = Effect.Success<typeof operation>;
type CapturedEffect = ReturnType<CapturedOperation>;
type _CapturedRequirements = Assert<
  Equal<Effect.Services<CapturedEffect>, never>
>;
type _CapturedErrors = Assert<
  Equal<Effect.Error<CapturedEffect>, ExpectedError>
>;

declare const ServicefulOutput: Schema.Codec<
  { readonly ok: boolean },
  { readonly ok: boolean },
  OutputService
>;
const servicefulOperation = API.make(() => ({
  inputSchema: Input,
  outputSchema: ServicefulOutput,
}));
type ServicefulDirectEffect = ReturnType<typeof servicefulOperation>;
type _SchemaRequirements = Assert<
  Equal<
    Effect.Services<ServicefulDirectEffect>,
    Credentials | HttpClient.HttpClient | OutputService
  >
>;
