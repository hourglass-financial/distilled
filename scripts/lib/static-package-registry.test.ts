import { afterEach, describe, expect, test } from "vitest";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import {
  startStaticPackageRegistry,
  type StaticPackageRegistry,
} from "./static-package-registry.ts";

let registry: StaticPackageRegistry | undefined;
let tempDir: string | undefined;

afterEach(async () => {
  await registry?.close();
  if (tempDir) await rm(tempDir, { recursive: true, force: true });
  registry = undefined;
  tempDir = undefined;
});

describe("static package registry", () => {
  test("serves immutable metadata and tarballs from loopback", async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), "static-registry-test-"));
    const tarballPath = path.join(tempDir, "package.tgz");
    await writeFile(tarballPath, "packed artifact");
    registry = await startStaticPackageRegistry([
      {
        name: "@hourglass-financial/example",
        version: "1.2.3",
        manifest: { name: "@hourglass-financial/example", version: "1.2.3" },
        tarballPath,
        integrity: "sha512-example",
        shasum: "example",
      },
    ]);

    expect(new URL(registry.url).hostname).toBe("127.0.0.1");
    const metadata = (await fetch(
      `${registry.url}/${encodeURIComponent("@hourglass-financial/example")}`,
    ).then((response) => response.json())) as {
      readonly versions: Record<
        string,
        {
          readonly dist: {
            readonly integrity: string;
            readonly tarball: string;
          };
        }
      >;
    };
    expect(metadata.versions["1.2.3"].dist.integrity).toBe("sha512-example");
    expect(
      await fetch(metadata.versions["1.2.3"].dist.tarball).then((response) =>
        response.text(),
      ),
    ).toBe("packed artifact");
  });
});
