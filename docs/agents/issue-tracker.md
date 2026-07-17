# Issue tracker: GitHub (hourglass-financial/distilled)

Issues and PRDs for this repo live as GitHub issues on the **fork**, `hourglass-financial/distilled`. Use the `gh` CLI for all operations.

> **CRITICAL — always pin the repo.** This clone has two remotes (`origin` = `hourglass-financial/distilled`, `upstream` = `alchemy-run/distilled`), and `gh` resolves to the **public upstream** by default. Every `gh issue`/`gh pr`/`gh api` call MUST carry `-R hourglass-financial/distilled` (or the explicit `repos/hourglass-financial/distilled/...` path for `gh api`). Never create issues, comments, or labels on `alchemy-run/distilled`.

## Conventions

- **Create an issue**: `gh issue create -R hourglass-financial/distilled --title "..." --body-file <file>`. Write multi-line bodies to a file; do not fight shell escaping.
- **Read an issue**: `gh issue view <number> -R hourglass-financial/distilled --comments`, filtering comments by `jq` and also fetching labels.
- **List issues**: `gh issue list -R hourglass-financial/distilled --state open --json number,title,body,labels,comments` with appropriate `--label` and `--state` filters.
- **Comment on an issue**: `gh issue comment <number> -R hourglass-financial/distilled --body-file <file>`
- **Apply / remove labels**: `gh issue edit <number> -R hourglass-financial/distilled --add-label "..."` / `--remove-label "..."`
- **Close**: `gh issue close <number> -R hourglass-financial/distilled --comment "..."`

## Pull requests as a triage surface

**PRs as a request surface: no.** _(Set to `yes` if this repo treats external PRs as feature requests; `/triage` reads this flag.)_

## When a skill says "publish to the issue tracker"

Create a GitHub issue on `hourglass-financial/distilled`.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> -R hourglass-financial/distilled --comments`.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single issue with **child** issues as tickets. Labels in use: `wayfinder:map`, `wayfinder:research`, `wayfinder:prototype`, `wayfinder:grilling`, `wayfinder:task`.

- **Map**: a single issue labelled `wayfinder:map`, holding the Destination / Notes / Decisions-so-far / Fog body. `gh issue create -R hourglass-financial/distilled --label wayfinder:map`.
- **Child ticket**: an issue linked to the map as a GitHub sub-issue: `gh api --method POST repos/hourglass-financial/distilled/issues/<map-number>/sub_issues -F sub_issue_id=<child-db-id>`, where `<child-db-id>` is the child's numeric **database id** (`gh api repos/hourglass-financial/distilled/issues/<n> --jq .id`). Labels: `wayfinder:<type>`. Once claimed, the ticket is assigned to the driving dev.
- **Blocking**: GitHub's **native issue dependencies** — the canonical, UI-visible representation. Add an edge with `gh api --method POST repos/hourglass-financial/distilled/issues/<child-number>/dependencies/blocked_by -F issue_id=<blocker-db-id>`, where `<blocker-db-id>` is the blocker's numeric **database id** (not the `#number` or `node_id`). GitHub reports `issue_dependencies_summary.blocked_by` (open blockers only — the live gate). A ticket is unblocked when every blocker is closed.
- **Frontier query**: list the map's open children (`gh api repos/hourglass-financial/distilled/issues/<map-number>/sub_issues --jq '.[] | {number, title, assignees: [.assignees[].login], blocked_by: .issue_dependencies_summary.blocked_by}'`), drop any with `blocked_by > 0` or an assignee; first in map order wins.
- **Claim**: `gh issue edit <n> -R hourglass-financial/distilled --add-assignee @me` — the session's first write.
- **Resolve**: `gh issue comment <n> -R hourglass-financial/distilled --body-file <answer-file>`, then `gh issue close <n> -R hourglass-financial/distilled`, then append a context pointer (gist + link) to the map's Decisions-so-far.
