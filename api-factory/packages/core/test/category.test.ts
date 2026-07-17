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

describe("Category classification (static meta, no prototype mutation)", () => {
  it("reads meta off an error via its constructor", () => {
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

  it("keeps classification on the class, not on the instance (no pollution)", () => {
    const error = new TooManyRequests({ message: "x" });
    // Neither the instance nor its prototype chain carries classification...
    expect("category" in error).toBe(false);
    expect("retry" in error).toBe(false);
    expect("meta" in error).toBe(false);
    // ...it lives statically on the constructor, where `metaOf` reads it.
    expect(
      (error.constructor as { readonly meta?: unknown }).meta,
    ).toBeDefined();
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
