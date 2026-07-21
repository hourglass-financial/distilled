import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import * as HttpClientError from "effect/unstable/http/HttpClientError";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import { describe, expect, it } from "vitest";
import {
  checkMatcherConsistency,
  makeEnvelopeDecoder,
  makeVendorAdapters,
} from "../src/adapters.ts";
import { Meta, MetaKey } from "../src/category.ts";
import {
  type ClassifiedErrorClass,
  DEFAULT_ERRORS,
  STATUS_ERRORS,
  Unauthorized,
} from "../src/errors.ts";

class CodeError extends Schema.TaggedErrorClass<CodeError>()("CodeError", {
  message: Schema.String,
  code: Schema.Literal("special_code"),
}) {
  readonly [MetaKey] = Meta.auth;
}

class UnknownTestError extends Schema.TaggedErrorClass<UnknownTestError>()(
  "UnknownTestError",
  {
    status: Schema.optional(Schema.Number),
    code: Schema.optional(Schema.String),
    message: Schema.String,
    body: Schema.Redacted(Schema.Unknown),
  },
) {
  readonly [MetaKey] = Meta.unknown;
}

class TransportTestError extends Schema.TaggedErrorClass<TransportTestError>()(
  "TransportTestError",
  { message: Schema.String, cause: Schema.Unknown },
) {
  readonly [MetaKey] = Meta.transport;
}

class DecodeTestError extends Schema.TaggedErrorClass<DecodeTestError>()(
  "DecodeTestError",
  {
    message: Schema.String,
    body: Schema.optional(Schema.Redacted(Schema.Unknown)),
    cause: Schema.Redacted(Schema.Unknown),
  },
) {
  readonly [MetaKey] = Meta.parse;
}

class RetryableCodeError extends Schema.TaggedErrorClass<RetryableCodeError>()(
  "RetryableCodeError",
  { message: Schema.String, code: Schema.Literal("retryable_code") },
) {
  readonly [MetaKey] = Meta.server;
}

const errorClasses = {
  UnknownError: UnknownTestError,
  TransportError: TransportTestError,
  DecodeError: DecodeTestError,
};

type TestExtra = UnknownTestError | TransportTestError | DecodeTestError;

describe("makeEnvelopeDecoder", () => {
  it("treats a string body as the message when configured", () => {
    const decode = makeEnvelopeDecoder({
      messageFields: ["message"],
      discriminatorFields: ["code"],
      stringBodyIsMessage: true,
    });
    expect(decode("plain failure")).toEqual({
      message: "plain failure",
      discriminator: undefined,
      body: "plain failure",
    });
  });

  it("does not treat a string body as the message when disabled", () => {
    const decode = makeEnvelopeDecoder({
      messageFields: ["message"],
      discriminatorFields: ["code"],
      stringBodyIsMessage: false,
    });
    expect(decode("plain failure")).toEqual({
      message: "",
      discriminator: undefined,
      body: "plain failure",
    });
  });

  it("decodes standard and OAuth-shaped envelopes in field order", () => {
    const decode = makeEnvelopeDecoder({
      messageFields: ["message", "error_description", "error"],
      discriminatorFields: ["code", "error"],
      stringBodyIsMessage: true,
    });
    expect(decode({ code: "bad_request", message: "Bad request" })).toEqual({
      message: "Bad request",
      discriminator: "bad_request",
      body: { code: "bad_request", message: "Bad request" },
    });
    expect(
      decode({ error: "invalid_grant", error_description: "Expired" }),
    ).toEqual({
      message: "Expired",
      discriminator: "invalid_grant",
      body: { error: "invalid_grant", error_description: "Expired" },
    });
  });

  it("ignores non-string message and discriminator fields", () => {
    const decode = makeEnvelopeDecoder({
      messageFields: ["message"],
      discriminatorFields: ["code"],
      stringBodyIsMessage: true,
    });
    expect(decode({ message: 42, code: false })).toEqual({
      message: "",
      discriminator: undefined,
      body: { message: 42, code: false },
    });
  });

  it("handles empty field lists and non-record bodies", () => {
    const decode = makeEnvelopeDecoder({
      messageFields: [],
      discriminatorFields: [],
      stringBodyIsMessage: true,
    });
    expect(decode(null)).toEqual({
      message: "",
      discriminator: undefined,
      body: null,
    });
    expect(decode(42)).toEqual({
      message: "",
      discriminator: undefined,
      body: 42,
    });
  });

  it("reads non-identifier fields", () => {
    const body = { "error-code": "hyphenated" };
    const decode = makeEnvelopeDecoder({
      messageFields: [],
      discriminatorFields: ["error-code"],
      stringBodyIsMessage: false,
    });
    expect(decode(body)).toEqual({
      message: "",
      discriminator: "hyphenated",
      body,
    });
  });

  it("reads inherited prototype-named fields", () => {
    const prototype = Object.create(null) as Record<string, unknown>;
    Object.defineProperty(prototype, "constructor", {
      value: "prototype message",
    });
    Object.defineProperty(prototype, "__proto__", {
      value: "prototype code",
    });
    const body = Object.create(prototype) as Record<string, unknown>;

    const decode = makeEnvelopeDecoder({
      messageFields: ["constructor"],
      discriminatorFields: ["__proto__"],
      stringBodyIsMessage: false,
    });
    expect(decode(body)).toEqual({
      message: "prototype message",
      discriminator: "prototype code",
      body,
    });
  });

  it("short-circuits before later throwing getters", () => {
    const body = { message: "first" } as Record<string, unknown>;
    Object.defineProperty(body, "later", {
      get: () => {
        throw new Error("later getter ran");
      },
    });
    const decode = makeEnvelopeDecoder({
      messageFields: ["message", "later"],
      discriminatorFields: [],
      stringBodyIsMessage: false,
    });
    expect(decode(body).message).toBe("first");
  });
});

describe("makeVendorAdapters", () => {
  const adapters = makeVendorAdapters<TestExtra>(errorClasses);
  const request = HttpClientRequest.get("https://api.vendor.test/widgets");
  const schemaCause = Effect.runSync(
    Schema.decodeUnknownEffect(Schema.String)(42).pipe(Effect.flip),
  );

  it("wraps genuine transport failures with a secret-free summary", () => {
    const cause = new HttpClientError.HttpClientError({
      reason: new HttpClientError.TransportError({
        request,
        description: "socket reset",
      }),
    });
    const error = adapters.toTransport(cause) as TransportTestError;
    expect(error.message).toBe(
      "wire-level transport failure (GET https://api.vendor.test/widgets)",
    );
    expect(error.cause).toEqual({
      reason: "TransportError",
      method: "GET",
      url: "https://api.vendor.test/widgets",
      description: "socket reset",
    });
  });

  it("routes non-transport HttpClientError reasons through decode wrapping", () => {
    const cause = new HttpClientError.HttpClientError({
      reason: new HttpClientError.EncodeError({ request }),
    });
    const error = adapters.toTransport(cause) as DecodeTestError;
    expect(error.message).toBe(
      "the response could not be read from the wire (EncodeError)",
    );
    expect(Redacted.value(error.cause)).toEqual({
      reason: "EncodeError",
      method: "GET",
      url: "https://api.vendor.test/widgets",
      description: undefined,
    });
  });

  it("uses fixed messages and redacts values for both decode phases", () => {
    const input = { token: "input-secret" };
    const requestError = adapters.toDecode(
      "request-encode",
      input,
      schemaCause,
    ) as DecodeTestError;
    expect(requestError.message).toBe(
      "request input did not match the operation's input schema",
    );
    expect(Redacted.value(requestError.body!)).toBe(input);
    expect(Redacted.value(requestError.cause)).toBe(schemaCause);

    const response = { token: "response-secret" };
    const responseError = adapters.toDecode(
      "response-decode",
      response,
      schemaCause,
    ) as DecodeTestError;
    expect(responseError.message).toBe(
      "response body did not match the operation's output schema",
    );
    expect(Redacted.value(responseError.body!)).toBe(response);
    expect(Redacted.value(responseError.cause)).toBe(schemaCause);
  });

  it("wraps unknown response bodies in Redacted", () => {
    const body = { token: "secret" };
    const error = adapters.makeUnknown({
      status: 418,
      envelope: {
        message: "teapot",
        discriminator: "tea_error",
        body,
      },
    }) as UnknownTestError;
    expect(error).toMatchObject({
      status: 418,
      code: "tea_error",
      message: "teapot",
    });
    expect(Redacted.isRedacted(error.body)).toBe(true);
    expect(Redacted.value(error.body)).toBe(body);
  });
});

describe("checkMatcherConsistency", () => {
  it("returns no violations for consistent tables and wrappers", () => {
    expect(
      checkMatcherConsistency({
        statusErrors: STATUS_ERRORS,
        codeErrors: { special_code: CodeError },
        universalErrors: DEFAULT_ERRORS,
        ...errorClasses,
      }),
    ).toEqual([]);
  });

  it("reports universal classes missing from the status table", () => {
    expect(
      checkMatcherConsistency({
        statusErrors: {},
        codeErrors: {},
        universalErrors: [Unauthorized],
        ...errorClasses,
      }),
    ).toContain("universal error Unauthorized is not present in statusErrors");
  });

  it("reports retryable code errors and unclassified status errors", () => {
    class UnclassifiedError extends Error {
      readonly _tag = "UnclassifiedError";
    }
    const violations = checkMatcherConsistency({
      statusErrors: {
        400: UnclassifiedError as unknown as ClassifiedErrorClass,
      },
      codeErrors: { retryable_code: RetryableCodeError },
      universalErrors: [],
      ...errorClasses,
    });
    expect(violations).toContain(
      "status 400 maps to UnclassifiedError, which does not produce a classified instance",
    );
    expect(violations).toContain(
      'code "retryable_code" maps to RetryableCodeError with retry "transient"; expected "none"',
    );
  });
});
