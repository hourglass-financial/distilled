/**
 * Fixture standing in for a vendor's `tests/coverage.ts` — drifted: one
 * registry op missing, one stale entry for a removed op. Deliberately NOT
 * `satisfies`-checked: the audit must catch this at runtime, the way the
 * CLI meets modules it cannot trust tsc to have checked.
 */
export default {
  "organizations.create": { contract: "tested", live: "tested" },
  "organizations.delete": { contract: "tested", live: "todo" },
  "organizations.get": { contract: "todo", live: "todo" },
  "organizations.update": { contract: "todo", live: "todo" },
};
