#!/usr/bin/env bun

import { runPrivatePackageSmokeCli } from "./lib/private-package-smoke.ts";

try {
  await runPrivatePackageSmokeCli({
    provider: "erebor",
    packageName: "@hourglass-financial/erebor",
    tag: "erebor-sdk",
  });
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
