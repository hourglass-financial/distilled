/**
 * Vendor-neutral adapters for generated clients: error-envelope decoding,
 * failure wrapping, and matcher-table consistency checks.
 */
import * as Redacted from "effect/Redacted";
import type { SchemaError } from "effect/SchemaError";
import type * as HttpClientError from "effect/unstable/http/HttpClientError";
import { isTransportError, Meta, metaOf, type ErrorMeta } from "./category.ts";
import type { ErrorEnvelope, MatchErrorConfig, RunnerDeps } from "./client.ts";
import type { ClassifiedErrorClass } from "./errors.ts";
import {
  summarizeHttpClientError,
  type TransportFailure,
} from "./transport.ts";

/** Data describing how a vendor encodes error messages and discriminators. */
export interface EnvelopeSpec {
  readonly messageFields: ReadonlyArray<string>;
  readonly discriminatorFields: ReadonlyArray<string>;
  readonly stringBodyIsMessage: boolean;
}

const firstString = (
  record: Record<string, unknown>,
  fields: ReadonlyArray<string>,
): string | undefined => {
  for (const field of fields) {
    const value = record[field];
    if (typeof value === "string") return value;
  }
  return undefined;
};

/** Build an error-envelope decoder from vendor profile data. */
export const makeEnvelopeDecoder =
  (spec: EnvelopeSpec) =>
  (body: unknown): ErrorEnvelope => {
    if (typeof body === "string" && spec.stringBodyIsMessage) {
      return { message: body, discriminator: undefined, body };
    }
    if (typeof body === "object" && body !== null) {
      const record = body as Record<string, unknown>;
      return {
        message: firstString(record, spec.messageFields) ?? "",
        discriminator: firstString(record, spec.discriminatorFields),
        body,
      };
    }
    return { message: "", discriminator: undefined, body };
  };

/** Vendor error identities supplied to the shared failure adapters. */
export interface VendorErrorClasses<Extra> {
  readonly UnknownError: new (props: {
    readonly status: number;
    readonly code?: string | undefined;
    readonly message: string;
    readonly body: Redacted.Redacted<unknown>;
  }) => Extra;
  readonly TransportError: new (props: {
    readonly message: string;
    readonly cause: TransportFailure;
  }) => Extra;
  readonly DecodeError: new (props: {
    readonly message: string;
    readonly body?: Redacted.Redacted<unknown>;
    readonly cause: Redacted.Redacted<unknown>;
  }) => Extra;
}

/** Failure adapters consumed by the generic matcher and runner. */
export interface VendorAdapters<Extra> {
  readonly makeUnknown: MatchErrorConfig<Extra>["makeUnknown"];
  readonly toTransport: RunnerDeps<Extra>["toTransport"];
  readonly toDecode: RunnerDeps<Extra>["toDecode"];
}

/** Build all failure adapters from a vendor's three client-owned error classes. */
export const makeVendorAdapters = <Extra>(
  classes: VendorErrorClasses<Extra>,
): VendorAdapters<Extra> => ({
  makeUnknown: ({ status, envelope }) =>
    new classes.UnknownError({
      status,
      code: envelope.discriminator,
      message: envelope.message,
      body: Redacted.make(envelope.body),
    }),
  /**
   * Only a genuine wire-level fault is a retryable transport error. Every
   * other HTTP client reason is a decode-class failure. Both carry a
   * secret-free summary, never the raw request-bearing error.
   */
  toTransport: (cause: HttpClientError.HttpClientError) => {
    const failure = summarizeHttpClientError(cause);
    return isTransportError(cause)
      ? new classes.TransportError({
          message: `wire-level transport failure (${failure.method} ${failure.url})`,
          cause: failure,
        })
      : new classes.DecodeError({
          message: `the response could not be read from the wire (${failure.reason})`,
          cause: Redacted.make(failure),
        });
  },
  /**
   * The raw value and schema issue stay deliberately reachable through
   * `Redacted.value`; fixed messages prevent field values from leaking.
   */
  toDecode: (
    phase: "request-encode" | "response-decode",
    body: unknown,
    cause: SchemaError,
  ) =>
    new classes.DecodeError({
      message:
        phase === "request-encode"
          ? "request input did not match the operation's input schema"
          : "response body did not match the operation's output schema",
      body: Redacted.make(body),
      cause: Redacted.make(cause),
    }),
});

/** Data required to verify that generated matcher tables remain coherent. */
export interface MatcherConsistencyTables {
  readonly statusErrors: Readonly<Record<number, ClassifiedErrorClass>>;
  readonly codeErrors: Readonly<Record<string, ClassifiedErrorClass>>;
  readonly universalErrors: ReadonlyArray<ClassifiedErrorClass>;
  readonly UnknownError: ClassifiedErrorClass;
  readonly TransportError: ClassifiedErrorClass;
  readonly DecodeError: ClassifiedErrorClass;
}

const className = (Cls: ClassifiedErrorClass): string =>
  Cls.name || "<anonymous>";

const sameMeta = (
  actual: ErrorMeta | undefined,
  expected: ErrorMeta,
): boolean =>
  actual?.category === expected.category && actual.retry === expected.retry;

/**
 * Return human-readable matcher-table violations. An empty array means the
 * tables and client-owned wrapper classes are mutually consistent.
 */
export const checkMatcherConsistency = (
  tables: MatcherConsistencyTables,
): ReadonlyArray<string> => {
  const violations: string[] = [];

  for (const [status, Cls] of Object.entries(tables.statusErrors)) {
    const instance = new Cls({ message: "boom" });
    if (metaOf(instance) === undefined) {
      violations.push(
        `status ${status} maps to ${className(Cls)}, which does not produce a classified instance`,
      );
    }
  }

  const statusClasses = new Set<unknown>(Object.values(tables.statusErrors));
  for (const Cls of tables.universalErrors) {
    if (!statusClasses.has(Cls)) {
      violations.push(
        `universal error ${className(Cls)} is not present in statusErrors`,
      );
    }
  }

  for (const [code, Cls] of Object.entries(tables.codeErrors)) {
    const instance = new Cls({ message: "boom", code });
    const shaped = instance as {
      readonly code?: string;
      readonly message: string;
    };
    if (shaped.code !== code) {
      violations.push(
        `code ${JSON.stringify(code)} maps to ${className(Cls)}, which produced code ${JSON.stringify(shaped.code)}`,
      );
    }
    if (shaped.message !== "boom") {
      violations.push(
        `code ${JSON.stringify(code)} maps to ${className(Cls)}, which did not preserve the message`,
      );
    }
    // A code class's classification must be one of the canonical `Meta.*`
    // singletons — identity, not shape, so the closed category↔retry pairing
    // (ADR-0005; the exotic-pairing hatch is shut) cannot be counterfeited by
    // a hand-rolled `{ category, retry }` object.
    const meta = metaOf(instance);
    const canonical: ReadonlyArray<ErrorMeta> = Object.values(Meta);
    if (meta === undefined || !canonical.includes(meta)) {
      violations.push(
        `code ${JSON.stringify(code)} maps to ${className(Cls)} whose classification is not a canonical Meta value`,
      );
    }
  }

  const wrapperChecks: ReadonlyArray<
    readonly [
      "unknown" | "transport" | "decode",
      ClassifiedErrorClass,
      unknown,
      ErrorMeta,
    ]
  > = [
    [
      "unknown",
      tables.UnknownError,
      new tables.UnknownError({
        message: "x",
        body: Redacted.make(null),
      }),
      { category: "unknown", retry: "none" },
    ],
    [
      "transport",
      tables.TransportError,
      new tables.TransportError({ message: "x", cause: null }),
      { category: "transport", retry: "transient" },
    ],
    [
      "decode",
      tables.DecodeError,
      new tables.DecodeError({
        message: "x",
        cause: Redacted.make(null),
      }),
      { category: "parse", retry: "none" },
    ],
  ];
  for (const [kind, Cls, instance, expected] of wrapperChecks) {
    const actual = metaOf(instance);
    if (!sameMeta(actual, expected)) {
      violations.push(
        `${kind} wrapper ${className(Cls)} has classification ${JSON.stringify(actual)}; expected ${JSON.stringify(expected)}`,
      );
    }
  }

  return violations;
};
