import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";

import {
  assertFullSourceSha,
  assertDistTag,
  createReleaseReceipt,
  digestLibDirectory,
  parseDistTagListing,
  pollForExpectedValue,
} from "./private-package-release.ts";

let tempDir: string | undefined;
afterEach(async () => {
  if (tempDir) await rm(tempDir, { recursive: true, force: true });
  tempDir = undefined;
});

describe("private package release provenance", () => {
  test("requires a full immutable source SHA", () => {
    expect(assertFullSourceSha("a".repeat(40))).toBe("a".repeat(40));
    for (const ref of ["main", "abc1234", "g".repeat(40)]) {
      expect(() => assertFullSourceSha(ref)).toThrow("40-character");
    }
  });

  test("rejects option-like and version-like dist tags", () => {
    expect(assertDistTag("persona-sdk")).toBe("persona-sdk");
    for (const tag of ["--registry", "Persona-SDK", "1.2.3", "tag/child"]) {
      expect(() => assertDistTag(tag)).toThrow("non-version npm tag");
    }
  });

  test("reads a version from npm's plain-text dist-tag listing", () => {
    const listing = [
      "erebor-sdk: 0.2.0-alpha.3.1.g225d212",
      "latest: 0.2.0-alpha.1",
    ].join("\n");
    expect(parseDistTagListing(listing, "erebor-sdk")).toBe(
      "0.2.0-alpha.3.1.g225d212",
    );
    expect(parseDistTagListing(listing, "missing-tag")).toBe("");
  });

  test("computes a deterministic normalized lib digest", async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), "release-digest-"));
    await mkdir(path.join(tempDir, "lib", "nested"), { recursive: true });
    await writeFile(path.join(tempDir, "lib", "b.js"), "b");
    await writeFile(path.join(tempDir, "lib", "nested", "a.js"), "a");
    const original = await digestLibDirectory(tempDir);
    expect(original).toBe(await digestLibDirectory(tempDir));
    await writeFile(path.join(tempDir, "lib", "nested", "a.js"), "changed");
    expect(await digestLibDirectory(tempDir)).not.toBe(original);
  });

  test("waits for a successfully read registry value to propagate", async () => {
    const values = ["old", "old", "expected"];
    const result = await pollForExpectedValue(
      async () => values.shift() ?? "expected",
      "expected",
      { attempts: 3, delayMs: 0, description: "test tag" },
    );
    expect(result).toBe("expected");
    expect(values).toEqual([]);
  });

  test("reports the last stale registry value after exhausting retries", async () => {
    let attempts = 0;
    await expect(
      pollForExpectedValue(
        async () => {
          attempts += 1;
          return "stale";
        },
        "expected",
        { attempts: 2, delayMs: 0, description: "test tag" },
      ),
    ).rejects.toThrow("last observed stale");
    expect(attempts).toBe(2);
  });

  test("reports the final registry error after exhausting retries", async () => {
    let attempts = 0;
    const finalError = new Error("registry unavailable");
    await expect(
      pollForExpectedValue(
        async () => {
          attempts += 1;
          throw finalError;
        },
        "expected",
        { attempts: 2, delayMs: 0 },
      ),
    ).rejects.toBe(finalError);
    expect(attempts).toBe(2);
  });

  test("receipt contains provenance without ambient secrets", () => {
    const packages = [
      {
        name: "@hourglass-financial/distilled-core",
        version: "1.2.3-release.1",
        localIntegrity: "sha512-core",
        registryIntegrity: "sha512-core",
        shasum: "core-shasum",
        libDigest: "sha256-core",
        finalTag: "persona-sdk",
      },
      {
        name: "@hourglass-financial/persona",
        version: "1.2.3-release.1",
        localIntegrity: "sha512-persona",
        registryIntegrity: "sha512-persona",
        shasum: "persona-shasum",
        libDigest: "sha256-persona",
        finalTag: "persona-sdk",
      },
    ] as const;
    const receipt = createReleaseReceipt({
      repository: "hourglass-financial/distilled",
      workflow: "Publish Private Persona Packages",
      workflowSha: "a".repeat(40),
      runId: "123",
      runAttempt: "1",
      runUrl:
        "https://github.com/hourglass-financial/distilled/actions/runs/123",
      sourceSha: "a".repeat(40),
      checkedOutSha: "a".repeat(40),
      distTag: "persona-sdk",
      packages,
    });
    expect(JSON.stringify(receipt)).not.toContain("TOKEN");
    expect(receipt.source.requestedSha).toBe("a".repeat(40));
    expect(receipt.packages).toEqual(packages);
  });
});
