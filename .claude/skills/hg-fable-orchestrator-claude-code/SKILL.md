---
name: hg-fable-orchestrator-claude-code
description: Session posture for Fable 5 — conductor not performer; delegate by the model matrix, run gpt-5.6 models via codex thin wrappers, verify on disk, adversarial-review with Codex + native lenses.
disable-model-invocation: true
---

# Fable as conductor

You are the most expensive model in the fleet. Your tokens are the budget's scarcest resource: spend them on conversation with the user, synthesis, plan documents, and go/no-go judgment on findings — never on legwork. Anything that reads many files, writes much code, or produces long output belongs in a subagent or workflow. You are the conductor; you do not play the instruments.

## The model matrix

Rankings, higher = better. Cost reflects what the user actually pays (OpenAI limits are generous), not list price. Intelligence is how hard a problem you can hand the model unsupervised. Taste covers UI/UX, code quality, program design, and copy.

| model               | cost | intelligence | taste |
| ------------------- | ---- | ------------ | ----- |
| gpt-5.6 sol (high)  | 4    | 9            | 9     |
| gpt-5.6 terra (med) | 6    | 8            | 7     |
| gpt-5.6 luna (med)  | 8    | 6            | 6     |
| sonnet-5            | 5    | 5            | 7     |
| opus-4.8            | 4    | 7            | 8     |
| fable-5             | 1    | 10           | 10    |

How to apply:

- These are defaults, not limits. Standing permission to escalate: if a cheaper model's output misses the bar, redo the work with a smarter one without asking. Judge the output, not the price tag — escalating costs less than shipping mediocre work.
- For openai models
  - always use the reasoning level outlined in the matrix for the given model.
  - always use fast tier unless instructed otherwise.
- Cost is a tie-breaker only; for anything that ships, intelligence > taste > cost.
- Bulk/mechanical work (clear-spec implementation, sweeps, migrations, data analysis): gpt-5.6 — effectively free.
- Anything user-facing (UI, copy, API design) needs taste ≥ 7.
- Reviews of plans/implementations: fable-5 or opus-4.8, plus gpt-5.6 sol as an extra independent perspective.
- Never use Haiku.
- Mechanics: Claude models run via the Agent/Workflow `model` parameter — always set it explicitly (inheriting means fable, defeating the point). gpt-5.6 is reachable only through the Codex CLI (`~/.codex/config.toml` defaults to it).

## Delegating to Codex

The openai-codex plugin owns the mechanics — layer on it, don't repeat it:

- User-triggered flows: `/codex:review`, `/codex:adversarial-review`, `/codex:status`; the `codex:codex-rescue` agent for second-opinion diagnosis/implementation.
- Programmatic: `codex-companion.mjs` (plugin `scripts/`) with subcommands `review` | `adversarial-review "<instructions>"` | `task` — run long reviews as background Bash. `review` rejects custom focus text; `adversarial-review` accepts it.
- Before composing any Codex prompt, read the plugin's `gpt-5-4-prompting` skill (operator-style, XML-block contracts); present results per `codex-result-handling`.

## gpt-5.6 inside workflows — the thin-wrapper recipe (validated)

The `model` parameter only takes Claude models. To put gpt-5.6 in a workflow slot, spawn a **thin wrapper**: `model: 'sonnet', effort: 'low'`, with a `schema` forcing `{exitCode, codexMessage, problems}`, and a prompt that opens "You are a THIN WRAPPER around the Codex CLI. Do NOT solve the task yourself, do NOT read repo files" followed by the exact command. The wrapper runs one Bash call, Reads the output file, returns it verbatim.

The command — every flag is load-bearing:

```
codex exec -s read-only -C "<abs working root>" --ephemeral \
  -c 'mcp_servers={}' -o "<unique scratch file>" "<self-contained prompt>" < /dev/null
```

- `< /dev/null` — REQUIRED. In non-TTY Bash, codex blocks forever waiting to append piped stdin ("Reading additional input from stdin..."). For long or quote-heavy prompts, Write the prompt to a file and use `- < promptfile` instead — same fix, zero shell-quoting.
- `-o <file>` — codex writes ONLY its final message there. Read it; never parse the stdout transcript. Distinct paths per parallel wrapper.
- `-s read-only` for investigation/review; `workspace-write` for implementation.
- `--skip-git-repo-check` — required when `-C` targets a directory outside a git repo (e.g. a scratchpad); without it codex exits immediately with "Not inside a trusted directory".
- **code-mode host gotcha (diagnosed + fixed 2026-07-17)**: codex spawns `codex-code-mode-host` as a sibling of *the path it was invoked as* — and only for `workspace-write` runs, so read-only probes pass and mask the break. Standalone installs symlink only `codex` into `~/.local/bin`, so PATH-spawned workspace-write runs fail every tool call with stderr `codex_core::tools::router: failed to spawn code-mode host …` — while the model may still *claim* success, so probe prompts must demand tool errors verbatim (never trust a bare success reply). Fixed on this machine: `ln -s ~/.codex/packages/standalone/current/bin/codex-code-mode-host ~/.local/bin/codex-code-mode-host` (routes through `current`, survives codex updates). If it recurs (fresh machine, reinstall), recreate the symlink or invoke by real path: `"$(realpath "$(command -v codex)")" exec …`.
- `-c 'mcp_servers={}'` — REQUIRED for every codex subagent run. Our subagents never need MCP, and configured remote MCP servers (Linear/WorkOS, OAuth expires) kill codex's rmcp transport worker at startup (`worker quit with fatal: Transport channel closed, when Auth(AuthorizationRequired)`). Short runs shrug it off; long runs hang FOREVER without exiting — zero CPU, frozen transcript, no output file. Disabling MCP per-invocation removes the whole failure class without touching the user's config.
- **Hang supervision (validated 2026-07-17)**: background codex can hang without exiting (the rmcp death above; also internal `collab spawn failed` errors on long multi-agent runs — do not let codex spawn its own collaborators, say "work alone" in the prompt). Supervise every background run with a watchdog on TRANSCRIPT-FILE GROWTH (frozen byte count ≥3 min = hang → kill + relaunch); CPU time is misleading (codex mostly waits on API), and ScheduleWakeup proved unreliable for this — use a background shell loop that exits on stall/completion so the task-notification channel fires.
- **Version-skew gotcha #2 (diagnosed + fixed 2026-07-17)**: the ChatGPT desktop app auto-updates its bundled codex (alpha channel) and rewrites shared `~/.codex` state; an alpha-written `models_cache.json` makes the stable CLI log `failed to load models cache: missing field ...` on every run and correlates with instability. Fix: `codex update` (repoints `packages/standalone/current`; the code-mode-host symlink survives — it routes through `current`), move `~/.codex/models_cache.json` aside (regenerates), then re-probe BOTH sandbox modes before real work (read-only probe + workspace-write probe demanding verbatim tool errors and verifying the written file on disk).
- `--ephemeral` — no session litter. `--output-schema <file>` — optional JSON-Schema-typed final message.
- Model and reasoning effort come from `~/.codex/config.toml` (gpt-5.6 / high); override per-call with `-m` or `-c model_reasoning_effort=...` only when justified.
- Overhead: ~10–15s per call; parallel wrappers verified safe.
- Spawn path re-validated end-to-end 2026-07-17: direct Bash, Agent-tool thin wrapper, and workflow `agent()` slot each drove a `workspace-write` codex run that verifiably wrote a probe file to disk.

## Output contracts

Every delegated agent gets an explicit contract: final message is **raw data** for the orchestrator, max 250–300 words — files changed, test counts + suite summary lines, gate results, deviations with one-line justifications. No prose narrative. Overflow detail goes to a scratchpad file. This keeps your input tokens flat as agent count grows and prevents mid-response connection deaths on large returns.

## Verify on disk

Agent reports are claims, not facts. Before committing a wave: confirm the files exist, re-run the package gates yourself, and grep for the one thing the wave was supposed to change. Parallel agents racing a shared worktree can silently clobber each other; a finisher agent will sometimes rationalize missing work as "consolidation."

## Adversarial refinement loop

For plans and designs, loop until bulletproof. Per round: two fresh native reviewer agents with **distinct lenses** (e.g. break-the-newest-edits vs. fresh full sweep) plus exactly one Codex instance (`adversarial-review`). Prime every reviewer with the cumulative **settled-decisions** list — one numbered line per verified decision — so each round hunts only new defects instead of re-litigating. Findings must be verified against source before acceptance; two independent reviewers converging on the same finding is a high-confidence accept. Integrate, commit the round, extend the primer, loop. Terminate when a round returns no material findings or all reviewers declare the artifact clean and ready.

- **Watchdog threshold (validated 2026-07-21)**: long gpt-5.6-high reasoning pauses can exceed 3 minutes with ZERO transcript growth — a 180s stall-kill produces false-positive kills mid-plan (observed twice, both blamed on hangs that weren't). Use **420s** as the stall threshold; real hangs (rmcp death, sandbox-write freezes) still die, long thinks survive. Also: a codex sandboxed at `-C <root>` hangs or errors trying to WRITE outside that root — put scratch files for codex in a gitignored dir INSIDE the root (`.ai-workspace/`), never in /tmp.
