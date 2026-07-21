import { describe, expect, it } from "vitest";
import {
  gatedSuffix,
  parseGated,
  parseStamps,
  stampSuffix,
} from "../src/stamp.ts";

describe("op stamps", () => {
  it("renders and parses a single-op stamp", () => {
    const title = `creates an org${stampSuffix("live", "organizations.create")}`;
    expect(title).toBe("creates an org [live:organizations.create]");
    expect(parseStamps(title)).toEqual([
      { lane: "live", key: "organizations.create" },
    ]);
  });

  it("a multi-op cover renders one stamp per key", () => {
    const title = `crud round-trip${stampSuffix("live", [
      "organizations.create",
      "organizations.get",
      "organizations.delete",
    ])}`;
    expect(parseStamps(title).map((stamp) => stamp.key)).toEqual([
      "organizations.create",
      "organizations.get",
      "organizations.delete",
    ]);
  });

  it("parses stamps out of a full name with suite prefixes and rename-export keys", () => {
    const stamps = parseStamps(
      "organizations (live) > deletes [live:organizations.delete] [contract:organizations.get]",
    );
    expect(stamps).toEqual([
      { lane: "live", key: "organizations.delete" },
      { lane: "contract", key: "organizations.get" },
    ]);
  });

  it("gated marker round-trips and does not read as an op stamp", () => {
    const title = `authenticates [live:userManagement.authenticateWithPassword]${gatedSuffix(
      "missing capability authkit",
    )}`;
    expect(parseGated(title)).toBe("missing capability authkit");
    expect(parseStamps(title)).toHaveLength(1);
    expect(parseGated("plain title")).toBeUndefined();
  });
});
