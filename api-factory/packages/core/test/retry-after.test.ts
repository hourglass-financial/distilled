import { describe, expect, it } from "vitest";
import * as Duration from "effect/Duration";
import { parseRetryAfter } from "../src/retry-after.ts";
import {
  acceptsRetryAfter,
  BadRequest,
  TooManyRequests,
} from "../src/errors.ts";

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

  it("hint-carrying is the class's own schema fact, not a status list", () => {
    // The matcher threads a hint only into a class whose schema declares
    // `retryAfter` — read from the class itself, nothing to drift.
    expect(acceptsRetryAfter(TooManyRequests)).toBe(true);
    expect(acceptsRetryAfter(BadRequest)).toBe(false);
  });
});
