/** Fixture standing in for a vendor's `tests/coverage.ts` — clean. */
import type { CoverageManifest } from "../../src/coverage/manifest.ts";
import type { operations } from "./registry.ts";

export default {
  "organizations.create": { contract: "tested", live: "tested" },
  "organizations.delete": { contract: "tested", live: "todo" },
  "organizations.get": { contract: "todo", live: "todo" },
  "organizations.list": {
    contract: "todo",
    live: {
      status: "skip",
      reason: "pagination live walk deferred to burn-down",
    },
  },
} satisfies CoverageManifest<(typeof operations)[number]>;
