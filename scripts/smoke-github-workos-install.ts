#!/usr/bin/env bun

import { runPrivatePackageSmokeCli } from "./lib/private-package-smoke.ts";

try {
  await runPrivatePackageSmokeCli({
    provider: "workos",
    packageName: "@hourglass-financial/workos",
    tag: "workos-sdk",
  });
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
