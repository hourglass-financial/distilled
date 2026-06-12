# GitHub Erebor Package Publishing

This fork publishes private GitHub Packages artifacts for consuming the Erebor SDK from other `hourglass-financial` repositories. It does not publish to npmjs.org.

## Packages

- `@hourglass-financial/erebor` is the package consuming repositories install directly.
- `@hourglass-financial/distilled-core` is a private transitive dependency used by Erebor.
- `effect` remains an external dependency resolved by the consuming package manager.

The private Erebor package preserves runtime imports of `@distilled.cloud/core/*` through an npm alias to `@hourglass-financial/distilled-core`. Consumers normally do not need to install or import core directly.

## Publishing

Run the `Publish Private Erebor Packages` GitHub Actions workflow from the branch that contains the Erebor build you want to consume. The workflow:

1. Builds `@distilled.cloud/core` and `@distilled.cloud/erebor`.
2. Stages registry-ready manifests under `.ai-workspace/github-packages`.
3. Publishes core and Erebor to `https://npm.pkg.github.com`.
4. Moves the selected dist tag, defaulting to `erebor-sdk`.

Each workflow run creates a unique prerelease version from the Erebor package version, run number, run attempt, and commit SHA. This avoids GitHub Packages version-collision failures on reruns.

## Consumer Setup

Add this `.npmrc` entry in the consuming repository:

```ini
@hourglass-financial:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Install the branch preview package:

```bash
bun add @hourglass-financial/erebor@erebor-sdk
```

Import from the private package name in consuming code:

```typescript
import { CredentialsFromEnv } from "@hourglass-financial/erebor";
import { listPrograms } from "@hourglass-financial/erebor/Operations";
```

For GitHub Actions, pass the workflow token as `NODE_AUTH_TOKEN` during dependency install:

```yaml
env:
  NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

After the first publish, grant the consuming repository read access to the private packages in GitHub Packages. Without that package access, dependency installation will fail even when the registry URL and token are correct.

For local development, use a GitHub token with package read access:

```bash
export NODE_AUTH_TOKEN=ghp_...
bun install
```

## Smoke Test

After publishing, verify installability from outside this monorepo:

```bash
bun run smoke:github-erebor-install -- --tag erebor-sdk
```

The smoke helper creates a temporary consumer project, installs `@hourglass-financial/erebor`, and imports the package entrypoint. It does not call the Erebor API.

Use `--dry-run` to inspect the temp project setup without installing from GitHub Packages.
