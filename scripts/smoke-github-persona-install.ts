#!/usr/bin/env bun

import { runPrivatePackageSmokeCli } from "./lib/private-package-smoke.ts";

try {
  await runPrivatePackageSmokeCli({
    provider: "persona",
    packageName: "@hourglass-financial/persona",
    tag: "persona-sdk",
  });
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
