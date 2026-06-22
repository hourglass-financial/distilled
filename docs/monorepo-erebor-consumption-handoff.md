# Monorepo Erebor Package Consumption Handoff

This handoff is for adding the private Erebor SDK package from `hourglass-financial/distilled` to `hourglass-financial/monorepo`.

The package is published to GitHub Packages only, not npmjs.org.

## Current Package

- Runtime package to install: `@hourglass-financial/erebor`
- Private transitive dependency: `@hourglass-financial/distilled-core`
- Registry: `https://npm.pkg.github.com`
- Current dist tag: `erebor-sdk`
- Current verified version: `0.2.0-alpha.1.1.gaaea171`

Prefer pinning the exact version in `monorepo` for reproducible installs. Use the `erebor-sdk` tag only when intentionally floating with the latest private publish.

## Prerequisites Already Completed

The `distilled` repo has published private GitHub Packages artifacts for both:

- `@hourglass-financial/erebor`
- `@hourglass-financial/distilled-core`

The `hourglass-financial/monorepo` repository must have read access to both packages through each package's GitHub Packages settings:

1. Open the package in the `hourglass-financial` organization.
2. Open **Package settings**.
3. Under **Manage Actions access**, add `hourglass-financial/monorepo`.
4. Grant **Read** access.

Do this for both packages. Erebor installs directly, and `distilled-core` is required as a private dependency.

GitHub reference:

- https://docs.github.com/en/packages/learn-github-packages/configuring-a-packages-access-control-and-visibility

## Monorepo Changes

Add or update the repo-level `.npmrc` in `monorepo`:

```ini
@hourglass-financial:registry=https://npm.pkg.github.com
```

Do not commit any token to the repo-level `.npmrc`.

Add the dependency with pnpm:

```bash
pnpm add @hourglass-financial/erebor@0.2.0-alpha.1.1.gaaea171
```

Expected package.json entry:

```json
{
  "dependencies": {
    "@hourglass-financial/erebor": "0.2.0-alpha.1.1.gaaea171"
  }
}
```

Run the normal monorepo validation after install:

```bash
pnpm install --frozen-lockfile
pnpm build
```

If the monorepo has narrower package-specific checks, run the relevant checks for the app or package that imports Erebor.

## Import Smoke Test

Add or run a small local import check from the consuming package:

```typescript
import { CredentialsFromEnv } from "@hourglass-financial/erebor";
import { listPrograms } from "@hourglass-financial/erebor/Operations";
```

The import should resolve without needing to import `@hourglass-financial/distilled-core` directly.

## GitHub Actions Setup

For GitHub Actions in `monorepo`, use `GITHUB_TOKEN`, not a human PAT, once package read access is granted to the repo.

The workflow needs:

```yaml
permissions:
  contents: read
  packages: read
```

Before `pnpm install`, configure auth:

```yaml
- name: Configure GitHub Packages auth
  run: |
    echo "@hourglass-financial:registry=https://npm.pkg.github.com" >> ~/.npmrc
    echo "//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}" >> ~/.npmrc
  env:
    NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

- run: pnpm install --frozen-lockfile
```

If the monorepo already has a standard dependency-install action or shared workflow, put the `.npmrc` setup there so every job that installs dependencies can read GitHub Packages.

GitHub reference:

- https://docs.github.com/packages/working-with-a-github-packages-registry/working-with-the-npm-registry

## Local Developer Setup

Each developer needs their own local GitHub Packages authentication. GitHub Packages npm registry authentication uses a personal access token classic.

Create a classic PAT in GitHub:

1. Open GitHub **Settings**.
2. Go to **Developer settings**.
3. Go to **Personal access tokens**.
4. Create a **Tokens (classic)** token.
5. Add `read:packages`.
6. If the org enforces SSO, authorize the token for the `hourglass-financial` organization.

If a developer can access the org but still receives install failures, confirm they have package visibility and org SSO authorization. If GitHub reports missing repo access for private packages, recreate or update the classic PAT with `repo` in addition to `read:packages`.

Store the token only in the user's local npm config:

```bash
npm config set //npm.pkg.github.com/:_authToken YOUR_GITHUB_PAT
```

This writes to `~/.npmrc`, which is read by pnpm, npm, and Bun.

Expected split:

```ini
# monorepo/.npmrc, committed
@hourglass-financial:registry=https://npm.pkg.github.com
```

```ini
# ~/.npmrc, local only
//npm.pkg.github.com/:_authToken=github_pat_...
```

Then the developer can run:

```bash
pnpm install
```

Do not put the PAT in `package.json`, `pnpm-lock.yaml`, the repo `.npmrc`, GitHub workflow YAML, or shared shell scripts.

## Troubleshooting

`401 Unauthorized` usually means no token was provided, the token is invalid, or SSO has not been authorized.

`403 Forbidden` usually means the token is valid but the user or repository does not have read access to the package.

`404 Not Found` from `npm.pkg.github.com` often means GitHub is hiding a private package because the requester lacks access. Re-check package access for both `@hourglass-financial/erebor` and `@hourglass-financial/distilled-core`.

If CI fails while local install works:

- Confirm the package settings grant `hourglass-financial/monorepo` read access.
- Confirm the workflow has `packages: read`.
- Confirm the auth setup runs before `pnpm install`.
- Confirm the job is not overwriting `~/.npmrc` later.

If local install fails while CI works:

- Confirm the developer has a classic PAT with `read:packages`.
- Confirm the token is stored in `~/.npmrc`.
- Confirm SSO is authorized for `hourglass-financial`.
- Confirm the repo-level `.npmrc` maps `@hourglass-financial` to GitHub Packages.
