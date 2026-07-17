# GitHub WorkOS Package Publishing

This fork publishes private GitHub Packages artifacts for consuming the WorkOS
SDK from other `hourglass-financial` repositories. It does not publish to
npmjs.org.

## Packages

- `@hourglass-financial/workos` is the package consuming repositories install directly.
- `@hourglass-financial/distilled-core` is a private transitive dependency used by WorkOS.
- `effect` remains an external dependency resolved by the consuming package manager.

The private WorkOS package preserves runtime imports of
`@distilled.cloud/core/*` through an npm alias to
`@hourglass-financial/distilled-core`. Consumers normally do not need to install
or import core directly.

## Publishing

Merge the release source to `main`, then run the `Publish Private WorkOS
Packages` workflow on `main`. Supply the full 40-character merged commit SHA as
`source-sha`; the workflow rejects revisions that are not reachable from
`main`. The workflow:

1. Builds `@distilled.cloud/core` and `@distilled.cloud/workos`.
2. Stages registry-ready manifests under `.ai-workspace/github-workos-packages`.
3. Publishes immutable core and WorkOS tarballs under a temporary run tag.
4. Verifies registry integrity and tests the published pair with npm and Bun.
5. Moves the selected dist tag, defaulting to `workos-sdk`.
6. Uploads a release receipt containing the source SHA, versions, registry
   integrity values, and normalized build digests.

Each workflow run creates a unique prerelease version from the WorkOS package
version, run ID, run attempt, and commit SHA. This avoids GitHub Packages
version-collision failures on reruns.

From the repository root, dispatch a merged revision with:

```bash
gh workflow run publish-workos-private.yml \
  --ref main \
  -f source-sha="$(git rev-parse HEAD)" \
  -f dist-tag=workos-sdk
```

## Consumer Setup

Add this `.npmrc` entry in the consuming repository:

```ini
@hourglass-financial:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Install the private package with its verified Effect peer:

```bash
bun add @hourglass-financial/workos@workos-sdk effect@4.0.0-beta.98
```

Import from the private package name in consuming code:

```typescript
import { CredentialsFromEnv } from "@hourglass-financial/workos/Credentials";
import { UserlandUserOrganizationMembershipsControllerUpdate } from "@hourglass-financial/workos/Operations";
```

For GitHub Actions, pass the workflow token as `NODE_AUTH_TOKEN` during
dependency installation:

```yaml
env:
  NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

After the first publish, grant the consuming repository read access to both
private packages in GitHub Packages. Without that package access, dependency
installation fails even when the registry URL and token are correct.

For local development, use a GitHub token with package read access:

```bash
export NODE_AUTH_TOKEN=ghp_...
bun install
```

## Smoke Test

After publishing, verify installability from outside this monorepo with both
supported package managers:

```bash
bun run smoke:github-workos-install -- --tag workos-sdk --package-manager npm
bun run smoke:github-workos-install -- --tag workos-sdk --package-manager bun
```

The smoke helper creates a temporary consumer project, installs
`@hourglass-financial/workos` and the exact verified Effect peer, requires a
single physical Effect installation, checks the exact membership-update type
contract without skipping library declarations, verifies request-body
serialization, and imports the public runtime subpaths. It does not call the
WorkOS API or require WorkOS credentials.

Use `--dry-run` to inspect the temporary project setup without installing from
GitHub Packages.
