# WorkOS API Testability Survey

Research ticket: [hourglass-financial/distilled#24](https://github.com/hourglass-financial/distilled/issues/24)
(map: #20 — do not edit). Date: 2026-07-17.

This document answers, for a v2 rebuild of `@distilled.cloud/workos`: what API surface must
be covered, which official spec to consume, how WorkOS auth/environments work, which endpoint
areas are truly integration-testable with ephemeral resources, a sandbox/CI strategy, and a
post-mortem of the over-broad "strip required" patch distilled into locality rules a future
patch system must enforce.

All claims are evidence-cited: fork claims cite commit SHAs / file paths in `packages/workos`;
WorkOS claims cite `workos.com/docs` pages fetched 2026-07-17.

---

## 1. Official OpenAPI spec — availability and v2 source recommendation

**WorkOS publishes an official OpenAPI spec, and the fork already consumes it.**

- Source: `https://github.com/workos/openapi-spec`, wired in as a git submodule at
  `packages/workos/specs/openapi-spec` (see root `.gitmodules`:
  `submodule.packages/workos/specs/openapi-spec.url = https://github.com/workos/openapi-spec`).
- Format: **OpenAPI 3.1.1, YAML**, single file `spec/open-api-spec.yaml`. The generator
  (`packages/workos/scripts/generate.ts`) reads that YAML, converts to JSON, and feeds
  `generateFromOpenAPI` from `@distilled.cloud/core`.
- Status: official, WorkOS-maintained, described in its README as the OpenAPI spec for the
  WorkOS API and "the canonical source for SDK generation"; published to npm as
  `@workos/openapi-spec`. Actively maintained — ~237 commits, 35 releases, latest **v0.37.0
  (July 2026)**. It is hand-maintained (not auto-derived from code) with SDK-generation policy
  files under `src/policy/`.

**Recommendation for v2:**

1. **Keep consuming the official `workos/openapi-spec`** — do not hand-roll or scrape the HTML
   reference. It is the canonical, full-surface source (User Management, Organizations,
   Directory Sync/SCIM, SSO SAML+OIDC, Audit Logs, API Keys, RBAC/Authorization, plus Vault,
   Feature Flags, Radar, Data Integrations).
2. **Pin to a released tag / npm version** (e.g. `@workos/openapi-spec@0.37.0`), not floating
   `main`. The spec ships 35 releases; a floating submodule makes generation non-reproducible
   and lets upstream schema churn silently reshape generated types.
3. **Expect internal service codenames to leak into the public spec** and plan a
   naming-normalization layer. Generated operations carry raw WorkOS internal prefixes:
   `UserlandUsers*` (User Management / AuthKit), `JumpWireWebDataVault*` / `JumpWireWebKey*`
   (Vault), `AgentAdmin*`. v2 should map these to public names — but note that renames are
   exactly the high-blast-radius change the patch system must localize (see §7).
4. **Consult `src/policy/` in the upstream spec repo** — WorkOS uses it to drive its own SDK
   generation; it is the closest thing to an authoritative "what is public / stable" signal and
   should inform which operations v2 emits vs. skips (the generator already sets
   `skipDeprecated: true`).

---

## 2. Auth + environment / sandbox model

Source: `workos.com/docs/reference`, `workos.com/docs/authkit/environments`,
`workos.com/docs/reference/api-keys` (fetched 2026-07-17).

- **REST + JSON**, base host `https://api.workos.com`, standard HTTP verbs and status codes.
- **Auth = API key (bearer).** Fork wires this in `packages/workos/src/credentials.ts` /
  `client.ts`.
- **Two environments per workspace: Staging and Production**, and they are **fully isolated** —
  API keys, organizations, connections, users, and webhook endpoints are all scoped to one
  environment and never cross over. There is **no promotion/migration path**; going live means
  re-creating resources in Production.
- **Staging *is* the sandbox.** The Staging environment ships with an API key that is viewable
  in the dashboard as often as needed (Production keys are shown once). Staging allows
  `http://` and `localhost` redirect URIs and forbids nothing that CI needs; Production
  enforces HTTPS and bans wildcard redirect URIs.
- **Staging includes a built-in Test Organization and an active SSO connection backed by a
  "Test Identity Provider"** (`workos.com/docs/sso/test-sso`). A tester "signs in" by entering
  any `@example.com` email plus a name — no real IdP required. This is the single most important
  testability enabler in the whole API (see SSO row in §5).

**Implication:** CI should target a dedicated **Staging** environment key. Resources are free,
isolated from Production, and safe to create/destroy per run.

---

## 3. Rate limits

Source: `workos.com/docs/reference/rate-limits` (fetched 2026-07-17). Breach returns **HTTP 429**.

| Scope | Limit |
|---|---|
| Global (all endpoints) | **6,000 requests / 60s per API key** (counted per key, not per IP) |
| Organizations — delete | 50 requests / 60s per API key |
| SSO — authorization endpoint | 1,000 requests / 60s per connection |
| Directory Sync — user queries | 4 requests / **second** per directory |
| AuthKit — reads | 1,000 / 10s |
| AuthKit — writes | 500 / 10s |
| AuthKit — authentication | 10 / 60s per email or challenge ID |
| AuthKit — magic auth / password reset | 3 / 60s per email |

**CI implications:**

- The **per-email auth/magic-auth/password-reset limits are the real trap** (3–10 per minute).
  Negative-path auth tests must use unique per-run emails (the repo's `testRunId` convention
  already gives this) and must not loop.
- The 6,000/min bucket is shared across the whole environment, so a **dedicated CI Staging
  environment** (separate from developers' Staging) avoids contention.
- The existing `packages/workos/src/retry.ts` should back off on 429; verify it treats 429 as
  retryable with jitter.

---

## 4. API surface at a glance

Generated surface today: **211 operations** in `packages/workos/src/operations/` (excluding
`.test.ts`). Verb distribution: List 44, Create 27, Get 26, Delete 21, Update 16, Send 4, Verify
2, Revoke 2, Export 2, Authenticate 2, Challenge 1.

Largest product areas by operation count: User Management (`UserlandUsers` 22 + invites 7 +
org-memberships 7 + auth-factors 4 + sessions 4), Authorization/RBAC/FGA (~45 across
`Authorization*` controllers), Organizations 7, SSO 6, Vault (`JumpWire*`) 11, Groups 5,
Applications 5, Webhook Endpoints 4, Feature Flags 4, Directory Sync (Directories 3 +
DirectoryUsers 2 + DirectoryGroups 2), Data Integrations 7, Radar 4, Audit Logs ~9.

**Spec-quality artifact to fix in v2:** many User Management operations are emitted twice with a
`0` suffix — `UserlandUsersControllerCreate` **and** `...Create0`, plus `Delete0`, `Get0`,
`List0`, `Update0`, `EmailVerification0`, `ResetPassword0`, `SendVerificationEmail0`. These are
duplicate/overlapping paths (internal `userland` surface vs. public user-management surface)
colliding on operationId. v2 should dedupe/select one canonical path per operation.

---

## 5. Endpoint-area testability matrix

Legend:
- **A — Integration-testable with ephemeral resources**: full create→assert→delete cycle over
  the API, free in Staging, safe for live CI with `testRunId` naming.
- **B — Testable with setup**: exercisable, but needs pre-provisioned state, out-of-band
  creation (Admin Portal / dashboard), browser automation, or async settling.
- **C — Untestable in ephemeral CI**: needs a real third-party IdP/app or real-world signals; no
  API create path; or read-only over data the API cannot populate.

| Product area | Ops (evidence) | Class | Notes |
|---|---|---|---|
| **Organizations** | Create, DeleteOrganization, UpdateOrganization, List, Find, GetByExternalId | **A** | Textbook ephemeral CRUD. Free in Staging. Mind the 50/min delete cap. |
| **User Management / AuthKit** (`UserlandUsers`, invites, org-memberships, sessions) | Create, Get, List, Update, Delete + invite/membership CRUD | **A** | Full user lifecycle over the API. Email-verification / password-reset / magic-auth paths are **B** (delivery + per-email rate limits; assert request accepted, not inbox). |
| **RBAC / FGA** (`Authorization*` roles, permissions, resources, role-assignments, group-role-assignments) | Create/Update/Delete/List on Roles, Permissions, Resources; AssignRole, Check, ListEffectivePermissions | **A** | Rich ephemeral CRUD; `Authorization.Check` and effective-permission queries are assertable after creating role+permission+resource+assignment. Depends on an ephemeral org. |
| **Groups / Group Memberships** | Create, Get, List, Update, Delete + membership CRUD | **A** | Ephemeral CRUD. |
| **Webhook Endpoints** | Create, Update, Delete, List | **A** | Ephemeral CRUD; assert endpoint config, no delivery needed. |
| **Vault** (`JumpWireWebDataVault`, `JumpWireWebKey`) | create/update/delete/describe/index/show + createDataKey/encrypt/decrypt/rekey | **A** | Full secret + envelope-crypto lifecycle over the API; round-trip encrypt→decrypt is deterministic and ephemeral. |
| **Admin Portal** (`PortalSessions`) | Create | **A/B** | Create a portal session for an ephemeral org and assert the returned link; the hosted portal UI itself is out of scope. Needs an org to exist first. |
| **Feature Flags** (`FeatureFlags`, `FlagTargets`) | EnableFlag, DisableFlag, List, FindBySlug (+ target CRUD) | **B** | No API create/delete for a flag definition — flags are defined in the dashboard; enable/disable/list are testable against a pre-seeded flag. |
| **Audit Logs** | AuditLogEvents.Create, Exports.Export/Exports, Retention get/update, Validators/schema versions | **B** | Requires an org with an audit-log schema configured; exports are async (create→poll). Assert accepted + poll export status. |
| **API Keys** (`ApiKeys`, `OrganizationApiKeys`) | Delete, Expire, ValidateApiKey | **B** | **No create over the public API** (keys minted in dashboard). Validate/expire an existing seeded key; can't do a clean ephemeral create→delete. |
| **Events** | List | **B** | Read-only event stream; returns data only after other operations have generated events. Assert shape, tolerate empty. |
| **SSO** (`Sso.Authorize/Token/GetProfile/Logout/JWKS`, `Connections` Delete/Find/List) | OAuth redirect flow + connection read/delete | **B/C** | Staging's **Test IdP + default Test Organization + default Test Connection** make the *flow* exercisable end-to-end — but it is a **browser redirect** (`Authorize` → Test IdP login form → callback with `code` → `Token`), so headless CI needs browser automation. `Connections` has **no Create** (created via SSO setup/Admin Portal), so connection lifecycle is not API-ephemeral. `JWKS`/`GetProfile` are assertable given a token. |
| **Directory Sync** (`Directories` Delete/Find/List, `DirectoryUsers` Find/List, `DirectoryGroups` Find/List) | read-only + delete | **C** | **No API create for a directory**; users/groups are populated only by real IdP SCIM pushes. Read endpoints return data only against a pre-provisioned, actively-synced directory. Not ephemeral-testable; at best B against a persistent fixture directory. |
| **Data Integrations / Pipes / Connected Apps** (`DataIntegrations*`) | AuthorizeUrl, VendCredentials, UpsertApiKey, user-data installations | **C** | OAuth/credential-vending against real connected third-party apps; `GetDataIntegrationAuthorizeUrl` is assertable (B) but the vend/install paths need a real external grant. |
| **Radar** (`RadarStandalone`) | Assess, UpdateRadarAttempt, Update/DeleteRadarListEntry | **B/C** | List-entry CRUD is testable-with-setup (B); fraud/bot `Assess` needs real-world signals to be meaningful (C for behavior, B for wiring). |
| **Applications / Application Credentials** (OAuth/M2M apps) | Create, List, Update + credential create | **A/B** | Create/list/update look ephemeral (A); some credential flows need an app context (B). Verify against Staging before trusting as A. |

**Summary:** the high-value, safe-for-live-CI core is **Organizations, User Management, RBAC/FGA,
Groups, Webhook Endpoints, and Vault** (class A). SSO is testable only via the Test IdP with
browser automation; Directory Sync and Data Integrations are effectively untestable in ephemeral
CI without real IdPs/apps.

---

## 6. Sandbox / environment strategy for CI

1. **Provision a dedicated Staging environment for CI** (separate WorkOS workspace/environment
   from developer Staging) and expose its key as `WORKOS_API_KEY`. Staging is free, isolated
   from Production, viewable-key, and localhost-friendly.
2. **Self-provision everything per run.** Staging↔Production has no promotion path, so tests
   must create their own orgs/users/roles and tear them down. Use the repo convention
   `distilled-workos-{area}-{name}-${testRunId}` and `Effect.ensuring(delete…)` cleanup
   (`AGENTS.md` test rules).
3. **Respect the rate-limit shape**: unique per-run emails for auth/magic-auth (3–10/min per
   email), throttle org deletes (50/min), and cap Directory queries (4/s). Ensure `retry.ts`
   retries 429 with backoff.
4. **Tier the suite by testability class**: class A runs on every CI run; class B (SSO Test-IdP
   browser flow, audit-log exports, seeded flags/keys) runs in a slower gated job; class C
   (Directory Sync live data, Data Integrations) is covered by contract/replay tests, not live
   calls.
5. **SSO happy-path** uses the Staging Test Organization + Test IdP; drive `Authorize` →
   `@example.com` login → callback → `Token` with a headless browser, then assert `GetProfile`.

---

## 7. Patch post-mortem — the over-broad "strip required" patch

### What happened (with commit evidence)

Timeline of `packages/workos/patches/` (via `git log --all --name-status`):

1. `af98ed2b3` **feat(workos): create workos sdk (#203)** (Michael K, upstream) — adds
   `001-add-missing-404s.patch.json` (three per-endpoint 404 additions, evidence-based, fine).
2. `337cfe0af` **fix(workos): strip required arrays from all 124 response schemas (#211)**
   (Michael K, upstream) — despite its title, this commit adds only the **narrow**
   `002-relax-create-input-required.patch.json`, removing `required` from **two** schemas
   (`OrganizationDto`, `GenerateLinkDto`) and regenerating exactly **two** operation files
   (`OrganizationsControllerCreate.ts`, `PortalSessionsControllerCreate.ts`, one line each:
   `name: Schema.String` → `Schema.optional(Schema.String)`).
3. `c06741968` **test(workos): expect real tags + delete 37 dead test stubs (#212)**
   (Michael K, upstream) — **this** is where the damage landed. It adds the 501-line
   `002-strip-required.patch.json` (**124** `remove` ops on `/components/schemas/<X>/required`)
   and, per its `--stat`, regenerates dozens of operation files across Audit Logs,
   Authentication, Authorization, Applications, etc.
4. `e2813ddcb` **fix(sdk): align generated contracts with runtime behavior** (Bryce Morrow,
   **hourglass fork**, 2026-07-16) — **deletes** `002-strip-required.patch.json` and regenerates,
   restoring `required` on responses. This is the fork's remediation and is an ancestor of
   `origin/main`.

**The over-broad patch = `packages/workos/patches/002-strip-required.patch.json`, 124 entries,
introduced by `c06741968` (#212), removed by fork commit `e2813ddcb`.**

### Why it was wrong

The patch's own rationale (verbatim): "Strip required arrays from all WorkOS response schemas…
Removing required treats all fields as optional at decode time, which lets responses through
without sacrificing static type info on the consumer side." Three defects:

1. **It targets shared `#/components/schemas/*` nodes.** The generator inlines/resolves `$ref`s,
   so removing `required` from a shared component (`UserObject`, `Organization`, `Directory`,
   `Role`, `Profile`, `ApiKey`, …) cascades to **every** operation that references it — across
   all verbs and in both request and response roles. One entry, `remove
   /components/schemas/UserObject/required`, makes every user field optional in every
   user-returning operation (get, list, create, update, authenticate…).
2. **It conflates request and response relaxation.** The 124 entries mix response objects
   (`UserObject`, `Directory`, `Organization`) with request DTOs (`CreateRoleDto`,
   `CreateGroupDto`, `ValidateApiKeyDto`, `CreateOAuthApplicationDto`). Response leniency
   (tolerate omitted fields) and request leniency (allow bad input) are opposite concerns fixed
   with one blunt instrument.
3. **It destroys the SDK's reason to exist.** Distilled sells *exhaustive, precise typing*.
   Making every response field `T | undefined` forces consumers to null-check fields the API
   always returns and **silently swallows genuine server contract violations** (a truly missing
   required field decodes instead of surfacing a parse error). The "without sacrificing static
   type info" claim is false — it sacrifices exactly that.

The legitimate need was tiny and is preserved in the surviving narrow patch: let a
*deliberate-bad-input* test send `{}` to `OrganizationsControllerCreate` and assert the
**server's** `BadRequest` instead of the client schema short-circuiting. That justifies relaxing
**one field on two request bodies**, not stripping `required` from 124 schemas.

### Fork ⇄ upstream divergence (must be tracked)

The **upstream snapshot still ships** `002-strip-required.patch.json` (present in
`.../scratchpad/upstream-main/packages/workos/patches/`, 12,960 bytes, 124 `remove` ops). The
fork removed it. **A future upstream sync/merge would silently reintroduce the over-broad
patch.** `HOURGLASS.md` should record this as an intentional divergence so a sync doesn't
regress it.

---

## 8. Locality rules a future patch system must enforce

Distilled from the post-mortem — concrete, enforceable:

1. **No shared-component blast radius.** A patch that touches `/components/schemas/*` must be
   flagged high-risk. To relax one operation, target the **operation-local** node
   (`/paths/~1x/post/requestBody/.../schema/...` or `.../responses/200/.../schema/...`), never
   the shared component. If a component genuinely must change, the patch must enumerate and
   justify every operation it affects.
2. **Blast radius must be declared and verified.** Each patch declares an expected
   `src/operations/` change count/list; generation fails (or review blocks) if the actual diff
   exceeds it. A "two request bodies" patch that regenerates 100+ files (as `c06741968` did) is
   rejected automatically. Locality = diff matches stated intent.
3. **One observed failure (or cited spec bug) per patch entry.** No category-level bulk
   rationalizations. Good models: `001` (per-endpoint 404s seen in live testing) and narrow
   `002` (two named test failures quoted). Bad model: one paragraph justifying 124 removals.
4. **Never `remove` a whole `required` array to drop one field.** `remove /X/required` deletes
   every field's requiredness. If a specific field is genuinely sometimes-absent, drop only that
   field (`remove /X/required/{index}`, or `test`+`replace` the array) — and prove the API omits
   it.
5. **Separate request-relaxation from response-relaxation.** They are different concerns with
   opposite risk profiles; a single patch must not touch both, and each must state which side it
   changes and why.
6. **Test-only relaxations don't belong in the shipped type.** Even the surviving narrow `002`
   degrades the public type (`name?` on org-create) solely to enable a negative test. Keep the
   schema faithful; give negative tests an explicit un-validated escape hatch (send a raw body)
   rather than permanently loosening every consumer's type. Locality in *purpose*: a testing
   affordance must not leak into production types.
7. **Lint the diff, not the commit message.** Attribution here is booby-trapped: the broad patch
   shipped under a `test(...)`-titled commit (#212) while the commit literally titled "strip
   required arrays from all 124 response schemas" (#211) did the narrow change. A patch-locality
   check must key off file/AST diffs, never subjects.
8. **Track fork divergences from upstream patches.** Record removed/overridden upstream patches
   (e.g. `002-strip-required`) in `HOURGLASS.md` so an upstream merge cannot silently
   reintroduce a rejected patch.

---

## 9. Evidence index

- Spec source: root `.gitmodules`; `packages/workos/scripts/generate.ts`;
  `github.com/workos/openapi-spec` README (OpenAPI 3.1.1, `spec/open-api-spec.yaml`, v0.37.0).
- Environments/auth/rate limits: `workos.com/docs/reference`,
  `workos.com/docs/authkit/environments`, `workos.com/docs/reference/rate-limits`,
  `workos.com/docs/sso/test-sso` (all fetched 2026-07-17).
- API surface: `packages/workos/src/operations/` (211 operations).
- Patch history: `git log --all --name-status -- packages/workos/patches/`; commits
  `af98ed2b3`, `337cfe0af`, `c06741968` (upstream, Michael K), `e2813ddcb` (fork, Bryce Morrow).
- Over-broad patch content: upstream snapshot
  `scratchpad/upstream-main/packages/workos/patches/002-strip-required.patch.json` (124
  `remove` ops); narrow survivor
  `packages/workos/patches/002-relax-create-input-required.patch.json`.
