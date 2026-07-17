import { describe, expect, it } from "vitest";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import { Secret } from "../src/redaction.ts";

describe("Secret (redaction)", () => {
  it("decodes a wire string into a Redacted value", () => {
    const decoded = Schema.decodeUnknownSync(Secret)("hunter2");
    expect(Redacted.isRedacted(decoded)).toBe(true);
    expect(Redacted.value(decoded)).toBe("hunter2");
  });

  it("encodes a Redacted value back to the plain wire string", () => {
    const encoded = Schema.encodeSync(Secret)(Redacted.make("hunter2"));
    expect(encoded).toBe("hunter2");
  });

  it("never prints the secret", () => {
    const decoded = Schema.decodeUnknownSync(Secret)("hunter2");
    expect(String(decoded)).not.toContain("hunter2");
    expect(JSON.stringify({ token: decoded })).not.toContain("hunter2");
    expect(JSON.stringify({ token: decoded })).toContain("redacted");
  });

  it("round-trips inside a struct (request encode unwraps, response decode wraps)", () => {
    const Login = Schema.Struct({ email: Schema.String, password: Secret });
    const wire = Schema.encodeSync(Login)({
      email: "a@b.com",
      password: Redacted.make("s3cret"),
    });
    // The wire body carries the real secret so the request actually works...
    expect(wire).toEqual({ email: "a@b.com", password: "s3cret" });
    // ...but a decoded response keeps it redacted.
    const decoded = Schema.decodeUnknownSync(Login)(wire);
    expect(Redacted.value(decoded.password)).toBe("s3cret");
    expect(JSON.stringify(decoded)).not.toContain("s3cret");
  });
});
