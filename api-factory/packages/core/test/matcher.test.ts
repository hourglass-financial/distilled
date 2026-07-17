import { describe, expect, it } from "vitest";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import * as Headers from "effect/unstable/http/Headers";
import { Meta, MetaKey } from "../src/category.ts";
import { makeMatchError } from "../src/client.ts";
import {
  BadRequest,
  type ClassifiedErrorClass,
  DEFAULT_ERRORS,
  NotFound,
  RETRYABLE_STATUSES,
  STATUS_ERRORS,
  TooManyRequests,
} from "../src/errors.ts";
import { retryAfterForStatus } from "../src/retry-after.ts";

class SpecialCode extends Schema.TaggedErrorClass<SpecialCode>()(
  "SpecialCode",
  {
    message: Schema.String,
    code: Schema.String,
  },
) {
  readonly [MetaKey] = Meta.unknown;
}

class UnknownTestError extends Schema.TaggedErrorClass<UnknownTestError>()(
  "UnknownTestError",
  { status: Schema.optional(Schema.Number), message: Schema.String },
) {
  readonly [MetaKey] = Meta.unknown;
}

type Extra = InstanceType<(typeof DEFAULT_ERRORS)[number]> | UnknownTestError;

const matchError = makeMatchError<Extra>({
  decodeEnvelope: (body) => {
    const record = (body ?? {}) as Record<string, unknown>;
    return {
      message: typeof record.message === "string" ? record.message : "",
      discriminator: typeof record.code === "string" ? record.code : undefined,
      body,
    };
  },
  statusErrors: STATUS_ERRORS,
  codeErrors: { special_code: SpecialCode } as Record<
    string,
    ClassifiedErrorClass
  >,
  universalErrors: DEFAULT_ERRORS,
  retryableStatuses: RETRYABLE_STATUSES,
  retryAfterFor: (status, headers) =>
    retryAfterForStatus(status, headers, RETRYABLE_STATUSES),
  makeUnknown: ({ status, envelope }) =>
    new UnknownTestError({ status, message: envelope.message }),
});

const failWith = <EC extends readonly ClassifiedErrorClass[]>(
  status: number,
  body: unknown,
  operationErrors: EC,
  headers: Record<string, string> = {},
) =>
  Effect.runSync(
    matchError(status, body, Headers.fromInput(headers), operationErrors).pipe(
      Effect.flip,
    ),
  );

describe("makeMatchError gating", () => {
  it("maps a declared status error", () => {
    const error = failWith(400, { message: "bad" }, [BadRequest] as const);
    expect(error._tag).toBe("BadRequest");
    expect(error.message).toBe("bad");
  });

  it("maps a universal error even when the op does not declare it", () => {
    const error = failWith(401, { message: "nope" }, []);
    expect(error._tag).toBe("Unauthorized");
  });

  it("falls back to Unknown for an undeclared, non-universal status", () => {
    // 404 is not universal; an op that does not declare NotFound must not have
    // its channel widened — it gets the honest Unknown fallback instead.
    const error = failWith(404, { message: "missing" }, []);
    expect(error._tag).toBe("UnknownTestError");
  });

  it("produces the declared status error when the op declares it", () => {
    const error = failWith(404, { message: "missing" }, [NotFound] as const);
    expect(error._tag).toBe("NotFound");
  });

  it("code discrimination takes precedence over status", () => {
    const error = failWith(400, { code: "special_code", message: "special" }, [
      SpecialCode,
    ] as const);
    expect(error._tag).toBe("SpecialCode");
  });

  it("threads a Retry-After hint into a retryable status error", () => {
    const error = failWith(429, { message: "slow down" }, [], {
      "retry-after": "7",
    });
    expect(error._tag).toBe("TooManyRequests");
    expect((error as TooManyRequests).retryAfter).toStrictEqual(
      Duration.seconds(7),
    );
  });

  it("never attaches a hint to a non-retryable status", () => {
    const error = failWith(400, { message: "bad" }, [BadRequest] as const, {
      "retry-after": "7",
    });
    expect("retryAfter" in error).toBe(false);
  });
});
