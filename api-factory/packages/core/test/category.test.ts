import { describe, expect, it } from "vitest";
import * as Duration from "effect/Duration";
import * as Category from "../src/category.ts";
import {
  BadRequest,
  InternalServerError,
  Locked,
  NotFound,
  TooManyRequests,
} from "../src/errors.ts";

describe("Category classification (symbol-keyed instance metadata)", () => {
  it("reads classification off an error instance", () => {
    expect(Category.metaOf(new TooManyRequests({ message: "x" }))).toEqual({
      category: "throttling",
      retry: "throttling",
    });
    expect(Category.metaOf(new BadRequest({ message: "x" }))).toEqual({
      category: "bad-request",
      retry: "none",
    });
  });

  it("returns undefined for unclassified values", () => {
    expect(Category.metaOf(new Error("plain"))).toBeUndefined();
    expect(Category.metaOf(null)).toBeUndefined();
    expect(Category.metaOf("nope")).toBeUndefined();
  });

  it("keeps classification out of the instance's data shape", () => {
    const error = new TooManyRequests({ message: "x" });
    // No string-keyed classification props pollute the data...
    expect("category" in error).toBe(false);
    expect("retry" in error).toBe(false);
    expect("meta" in error).toBe(false);
    // ...and the symbol key never serializes.
    const printed = JSON.stringify({ ...error, message: error.message });
    expect(printed).not.toContain("throttling");
    // Yet the instance itself is the evidence — no constructor reflection.
    expect(Category.isClassified(error)).toBe(true);
    expect(error[Category.MetaKey]).toBe(Category.Meta.throttling);
  });

  it("hasCategory filters at runtime and narrows at compile time", () => {
    const errors: Array<TooManyRequests | BadRequest | NotFound> = [
      new TooManyRequests({ message: "x", retryAfter: Duration.seconds(2) }),
      new BadRequest({ message: "y" }),
      new NotFound({ message: "z" }),
    ];
    const throttled = errors.filter(Category.hasCategory("throttling"));
    // The refinement narrowed the union: `retryAfter` is only on
    // TooManyRequests, so this line type-checks only if narrowing worked.
    expect(throttled.map((e) => e.retryAfter)).toStrictEqual([
      Duration.seconds(2),
    ]);
    expect(
      errors.filter(Category.hasCategory("bad-request", "not-found")).length,
    ).toBe(2);
    expect(Category.hasCategory("auth")(new Error("plain"))).toBe(false);
  });

  it("classifies transient vs terminal errors", () => {
    expect(
      Category.isTransient(new InternalServerError({ message: "5xx" })),
    ).toBe(true);
    expect(Category.isTransient(new TooManyRequests({ message: "429" }))).toBe(
      true,
    );
    expect(Category.isTransient(new Locked({ message: "423" }))).toBe(true);
    expect(Category.isTransient(new BadRequest({ message: "400" }))).toBe(
      false,
    );
    expect(Category.isTransient(new NotFound({ message: "404" }))).toBe(false);
  });

  it("identifies throttling errors", () => {
    expect(Category.isThrottling(new TooManyRequests({ message: "x" }))).toBe(
      true,
    );
    expect(
      Category.isThrottling(new InternalServerError({ message: "x" })),
    ).toBe(false);
  });

  it("reads a retry-after hint only when present as a Duration", () => {
    const withHint = new TooManyRequests({
      message: "x",
      retryAfter: Duration.seconds(5),
    });
    expect(Category.retryAfterOf(withHint)).toStrictEqual(Duration.seconds(5));
    expect(
      Category.retryAfterOf(new BadRequest({ message: "x" })),
    ).toBeUndefined();
  });

  it("names a semantic category", () => {
    expect(Category.categoryOf(new NotFound({ message: "x" }))).toBe(
      "not-found",
    );
    expect(Category.categoryOf(new Error("plain"))).toBe("unknown");
  });
});
