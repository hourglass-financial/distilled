import { describe, expect, it } from "vitest";
import * as Duration from "effect/Duration";
import { parseRetryAfter, retryAfterForStatus } from "../src/retry-after.ts";
import { RETRYABLE_STATUSES } from "../src/errors.ts";

describe("parseRetryAfter", () => {
  it("parses delta-seconds", () => {
    expect(parseRetryAfter({ "retry-after": "5" })).toStrictEqual(
      Duration.seconds(5),
    );
  });

  it("parses an HTTP-date relative to now", () => {
    const now = Date.parse("2026-01-01T00:00:00Z");
    const hint = parseRetryAfter(
      { "retry-after": "Thu, 01 Jan 2026 00:00:30 GMT" },
      { now },
    );
    expect(hint).toStrictEqual(Duration.seconds(30));
  });

  it("falls back to RateLimit-Reset", () => {
    expect(parseRetryAfter({ "ratelimit-reset": "12" })).toStrictEqual(
      Duration.seconds(12),
    );
  });

  it("clamps to the cap (honestly — not v1's hard-coded 5s)", () => {
    const hint = parseRetryAfter(
      { "retry-after": "999999" },
      { max: Duration.seconds(60) },
    );
    expect(hint).toStrictEqual(Duration.seconds(60));
  });

  it("returns undefined when no hint is present", () => {
    expect(parseRetryAfter({})).toBeUndefined();
    expect(parseRetryAfter({ "retry-after": "not-a-date" })).toBeUndefined();
  });

  it("only threads a hint for retryable statuses", () => {
    const headers = { "retry-after": "5" };
    expect(retryAfterForStatus(429, headers, RETRYABLE_STATUSES)).toStrictEqual(
      Duration.seconds(5),
    );
    // A 400 is not retryable — never receives a stale hint.
    expect(
      retryAfterForStatus(400, headers, RETRYABLE_STATUSES),
    ).toBeUndefined();
  });
});
