#!/usr/bin/env bun
/**
 * Erebor Nuke Script
 *
 * Lists and deletes all resources in an Erebor account.
 * Supports --dry-run to preview without deleting.
 *
 * Erebor only exposes two real delete-style operations via the SDK:
 *   - archiveWebhook       (POST /webhooks/{id}/archive)
 *   - closeDepositAccount  (POST /deposit_accounts/{id}/close)
 *
 * Everything else (documents, applicants, onboardings, customers,
 * counterparties, account numbers, blockchain addresses, transfers,
 * transactions, events, programs, templates) is immutable banking
 * history or has no SDK-level delete. Those are listed with a
 * [READONLY] marker but never deleted.
 *
 * Add exclusion rules in `packages/erebor/nuke-config.json` to preserve
 * specific resources.
 *
 * Usage:
 *   bun packages/erebor/scripts/nuke.ts --dry-run
 *   bun packages/erebor/scripts/nuke.ts
 */
import { config } from "dotenv";
import * as fs from "node:fs";
import * as nodePath from "node:path";

// Load .env from repo root (three levels up: scripts/ -> erebor/ -> packages/ -> repo)
const envPath = nodePath.resolve(import.meta.dir, "../../../.env");
config({ path: envPath });
if (!process.env.EREBOR_API_KEY) config();

if (!process.env.EREBOR_API_KEY) {
  console.error("EREBOR_API_KEY environment variable is required.");
  process.exit(1);
}

import { BunRuntime, BunServices } from "@effect/platform-bun";
import { Cause, Console, Effect, Option, Result } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";

import { CredentialsFromEnv } from "../src/credentials.ts";
import { archiveWebhook } from "../src/operations/archiveWebhook.ts";
import { closeDepositAccount } from "../src/operations/closeDepositAccount.ts";
import { listAccountNumbers } from "../src/operations/listAccountNumbers.ts";
import { listBlockchainAddresses } from "../src/operations/listBlockchainAddresses.ts";
import { listBookTransfers } from "../src/operations/listBookTransfers.ts";
import { listBusinessApplicants } from "../src/operations/listBusinessApplicants.ts";
import { listCounterparties } from "../src/operations/listCounterparties.ts";
import { listCounterpartyBlockchainAddresses } from "../src/operations/listCounterpartyBlockchainAddresses.ts";
import { listCounterpartyInternationalBankAccounts } from "../src/operations/listCounterpartyInternationalBankAccounts.ts";
import { listCounterpartyRailAddresses } from "../src/operations/listCounterpartyRailAddresses.ts";
import { listCounterpartyUsBankAccounts } from "../src/operations/listCounterpartyUsBankAccounts.ts";
import { listCustomers } from "../src/operations/listCustomers.ts";
import { listDepositAccounts } from "../src/operations/listDepositAccounts.ts";
import { listDepositAccountTemplates } from "../src/operations/listDepositAccountTemplates.ts";
import { listDocuments } from "../src/operations/listDocuments.ts";
import { listEvents } from "../src/operations/listEvents.ts";
import { listInboundAchTransfers } from "../src/operations/listInboundAchTransfers.ts";
import { listInboundBlockchainTransfers } from "../src/operations/listInboundBlockchainTransfers.ts";
import { listInboundInternationalWireTransfers } from "../src/operations/listInboundInternationalWireTransfers.ts";
import { listInboundRailTransfers } from "../src/operations/listInboundRailTransfers.ts";
import { listInboundWireTransfers } from "../src/operations/listInboundWireTransfers.ts";
import { listOnboardings } from "../src/operations/listOnboardings.ts";
import { listOutboundAchTransfers } from "../src/operations/listOutboundAchTransfers.ts";
import { listOutboundBlockchainTransfers } from "../src/operations/listOutboundBlockchainTransfers.ts";
import { listOutboundInternationalWireTransfers } from "../src/operations/listOutboundInternationalWireTransfers.ts";
import { listOutboundRailTransfers } from "../src/operations/listOutboundRailTransfers.ts";
import { listOutboundWireTransfers } from "../src/operations/listOutboundWireTransfers.ts";
import { listPersonApplicants } from "../src/operations/listPersonApplicants.ts";
import { listPrograms } from "../src/operations/listPrograms.ts";
import { listTransactions } from "../src/operations/listTransactions.ts";
import { listWebhooks } from "../src/operations/listWebhooks.ts";

// ANSI colors
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const BLUE = "\x1b[34m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

// Counters
let totalFound = 0;
let totalSkipped = 0;
let totalDeleted = 0;
let totalFailed = 0;
let totalReadonly = 0;

// ============================================================================
// Nuke Config
// ============================================================================

interface ExcludeRule {
  type: string;
  ids?: string[];
  namePatterns?: string[];
  reason?: string;
}

interface NukeConfig {
  exclude?: ExcludeRule[];
}

const PKG_DIR = nodePath.resolve(import.meta.dir, "..");

function loadNukeConfig(): NukeConfig {
  const p = nodePath.join(PKG_DIR, "nuke-config.json");
  return fs.existsSync(p)
    ? (JSON.parse(fs.readFileSync(p, "utf-8")) as NukeConfig)
    : {};
}

function matchGlob(pattern: string, value: string): boolean {
  return new RegExp("^" + pattern.replace(/\*/g, ".*") + "$").test(value);
}

function isExcluded(
  config: NukeConfig,
  type: string,
  id: string,
  name?: string,
): ExcludeRule | undefined {
  return config.exclude?.find((rule) => {
    if (rule.type !== type) return false;
    if (rule.ids?.includes(id)) return true;
    if (name && rule.namePatterns?.some((p) => matchGlob(p, name))) return true;
    return false;
  });
}

// ============================================================================
// Error formatting
// ============================================================================

function formatError(err: unknown): string {
  if (!err) return String(err);
  if (Cause.isCause(err as Cause.Cause<unknown>)) {
    const cause = err as Cause.Cause<unknown>;
    const failOpt = Cause.findErrorOption(cause);
    if (Option.isSome(failOpt)) return formatError(failOpt.value);
    const defectRes = Cause.findDefect(cause);
    if (Result.isSuccess(defectRes))
      return `defect: ${formatError(defectRes.success)}`;
    return Cause.pretty(cause);
  }
  const e = err as Record<string, unknown>;
  const tag = typeof e._tag === "string" ? e._tag : undefined;
  const status = typeof e.status === "number" ? e.status : undefined;
  const code = typeof e.code === "string" ? e.code : undefined;
  const message =
    typeof e.message === "string"
      ? e.message
      : typeof e.statusText === "string"
        ? e.statusText
        : undefined;
  const parts: string[] = [];
  if (tag) parts.push(tag);
  if (code) parts.push(`code=${code}`);
  if (status !== undefined && !tag) parts.push(`status=${status}`);
  if (message) parts.push(message);
  return parts.length > 0 ? parts.join(" ") : String(err);
}

// ============================================================================
// Pagination — Erebor uses cursor pagination via `starting_after` + `has_more`.
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ListOp = (input: any) => Effect.Effect<any, any, any>;

function collectAll<T extends { id: string }>(
  op: ListOp,
  baseInput: Record<string, unknown> = {},
  maxPages = 100,
): Effect.Effect<ReadonlyArray<T>, unknown, never> {
  return Effect.gen(function* () {
    const all: T[] = [];
    let startingAfter: string | undefined;
    for (let i = 0; i < maxPages; i++) {
      const input: Record<string, unknown> = { page_size: 100, ...baseInput };
      if (startingAfter) input.starting_after = startingAfter;
      const page = yield* op(input);
      const data = (page.data ?? []) as ReadonlyArray<T>;
      all.push(...data);
      if (!page.has_more || data.length === 0) break;
      startingAfter = data[data.length - 1]!.id;
    }
    return all as ReadonlyArray<T>;
  }) as Effect.Effect<ReadonlyArray<T>, unknown, never>;
}

// ============================================================================
// Generic resource nuker
// ============================================================================

function nukeResources<T extends { id: string }>(opts: {
  type: string;
  header: string;
  dryRun: boolean;
  nukeConfig: NukeConfig;
  list: Effect.Effect<ReadonlyArray<T>, unknown, never>;
  getName?: (item: T) => string | undefined;
  getMeta?: (item: T) => string | undefined;
  shouldSkip?: (item: T) => string | undefined;
  delete: (item: T) => Effect.Effect<unknown, unknown, never>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Effect.Effect<void, never, any> {
  const body = Effect.gen(function* () {
    yield* Console.log(`\n${BOLD}${CYAN}${opts.header}${RESET}`);
    const items = yield* opts.list.pipe(
      Effect.catchCause((cause) =>
        Console.log(
          `  ${RED}Failed to list ${opts.type}: ${formatError(cause)}${RESET}`,
        ).pipe(Effect.map(() => [] as ReadonlyArray<T>)),
      ),
    );
    if (items.length === 0) {
      yield* Console.log(`  ${DIM}No ${opts.type} found${RESET}`);
      return;
    }
    for (const item of items) {
      yield* Effect.suspend(() =>
        Effect.gen(function* () {
          totalFound++;
          const id = item.id;
          const name = opts.getName?.(item);
          const meta = opts.getMeta?.(item);
          const label =
            name && name !== id ? `${name} ${DIM}(${id})${RESET}` : id;
          const metaSuffix = meta ? ` ${DIM}${meta}${RESET}` : "";

          const excluded = isExcluded(opts.nukeConfig, opts.type, id, name);
          if (excluded) {
            totalSkipped++;
            yield* Console.log(
              `  ${YELLOW}[SKIP]${RESET} ${opts.type}: ${label}${metaSuffix} — ${excluded.reason ?? "excluded"}`,
            );
            return;
          }

          const skipReason = opts.shouldSkip?.(item);
          if (skipReason) {
            totalSkipped++;
            yield* Console.log(
              `  ${YELLOW}[SKIP]${RESET} ${opts.type}: ${label}${metaSuffix} — ${skipReason}`,
            );
            return;
          }

          if (opts.dryRun) {
            yield* Console.log(
              `  ${RED}[DELETE]${RESET} ${opts.type}: ${label}${metaSuffix}`,
            );
            return;
          }

          yield* Console.log(
            `  ${RED}[DELETE]${RESET} ${opts.type}: ${label}${metaSuffix}`,
          );
          yield* opts.delete(item).pipe(
            Effect.matchCauseEffect({
              onSuccess: () => {
                totalDeleted++;
                return Console.log(`    ${GREEN}Success${RESET}`);
              },
              onFailure: (cause) => {
                totalFailed++;
                return Console.log(
                  `    ${RED}Failed: ${formatError(cause)}${RESET}`,
                );
              },
            }),
          );
        }),
      ).pipe(
        Effect.catchCause((cause) =>
          Console.log(
            `  ${RED}Error processing ${opts.type}: ${formatError(cause)}${RESET}`,
          ),
        ),
      );
    }
  });
  return body.pipe(
    Effect.catchCause((cause) =>
      Console.log(
        `  ${RED}Section ${opts.type} aborted: ${formatError(cause)}${RESET}`,
      ),
    ),
  );
}

// ============================================================================
// Read-only section: list and report, no deletion
// ============================================================================

function reportReadonly<T extends { id: string }>(opts: {
  type: string;
  header: string;
  list: Effect.Effect<ReadonlyArray<T>, unknown, never>;
  getName?: (item: T) => string | undefined;
  getMeta?: (item: T) => string | undefined;
  printMax?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Effect.Effect<void, never, any> {
  const printMax = opts.printMax ?? 25;
  return Effect.gen(function* () {
    yield* Console.log(
      `\n${BOLD}${BLUE}${opts.header}${RESET} ${DIM}(read-only — no SDK delete)${RESET}`,
    );
    const items = yield* opts.list.pipe(
      Effect.catchCause((cause) =>
        Console.log(
          `  ${RED}Failed to list ${opts.type}: ${formatError(cause)}${RESET}`,
        ).pipe(Effect.map(() => [] as ReadonlyArray<T>)),
      ),
    );
    if (items.length === 0) {
      yield* Console.log(`  ${DIM}No ${opts.type} found${RESET}`);
      return;
    }
    totalReadonly += items.length;
    for (const item of items.slice(0, printMax)) {
      const name = opts.getName?.(item);
      const meta = opts.getMeta?.(item);
      const label =
        name && name !== item.id ? `${name} ${DIM}(${item.id})${RESET}` : item.id;
      const metaSuffix = meta ? ` ${DIM}${meta}${RESET}` : "";
      yield* Console.log(
        `  ${DIM}[READONLY]${RESET} ${opts.type}: ${label}${metaSuffix}`,
      );
    }
    if (items.length > printMax) {
      yield* Console.log(
        `  ${DIM}... and ${items.length - printMax} more${RESET}`,
      );
    }
  }).pipe(
    Effect.catchCause((cause) =>
      Console.log(
        `  ${RED}Section ${opts.type} aborted: ${formatError(cause)}${RESET}`,
      ),
    ),
  );
}

// ============================================================================
// Main enumeration
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyItem = any;

const nukeAll = (dryRun: boolean, nukeConfig: NukeConfig) =>
  Effect.gen(function* () {
    // ----- Deletable: Webhooks (archive — soft delete, safe & idempotent) -----
    yield* nukeResources({
      type: "Webhook",
      header: "Webhooks",
      dryRun,
      nukeConfig,
      list: collectAll<AnyItem>(listWebhooks as ListOp, {}),
      getName: (w: AnyItem) => w.name,
      getMeta: (w: AnyItem) =>
        [w.status && `status: ${w.status}`, w.webhook_url && `url: ${w.webhook_url}`]
          .filter(Boolean)
          .join(" | ") || undefined,
      shouldSkip: (w: AnyItem) =>
        w.status === "ARCHIVED" ? "already archived" : undefined,
      delete: (w: AnyItem) =>
        archiveWebhook({ id: w.id }) as Effect.Effect<unknown, unknown, never>,
    });

    // ----- Deletable: Deposit Accounts (close) -----
    // Note: requires the "programmatic account closure" feature flag on the
    // API key. Without it Erebor returns EreborFeatureNotEnabled (a 429 with
    // RATE_LIMITED envelope) — that will surface as a per-item failure.
    yield* nukeResources({
      type: "DepositAccount",
      header: "Deposit Accounts",
      dryRun,
      nukeConfig,
      list: collectAll<AnyItem>(listDepositAccounts as ListOp, {}),
      getName: (a: AnyItem) => a.name ?? undefined,
      getMeta: (a: AnyItem) =>
        [
          a.status && `status: ${a.status}`,
          a.deposit_account_type && `type: ${a.deposit_account_type}`,
          a.balances?.available?.display_value &&
            `bal: ${a.balances.available.display_value}`,
        ]
          .filter(Boolean)
          .join(" | ") || undefined,
      shouldSkip: (a: AnyItem) =>
        a.status === "CLOSED" ? "already closed" : undefined,
      delete: (a: AnyItem) =>
        closeDepositAccount({ id: a.id }) as Effect.Effect<unknown, unknown, never>,
    });

    // ============================================================================
    // Read-only sections — no SDK delete; just enumerate.
    // ============================================================================

    yield* reportReadonly({
      type: "Document",
      header: "Documents",
      list: collectAll<AnyItem>(listDocuments as ListOp, {}),
      getName: (d: AnyItem) => d.name,
      getMeta: (d: AnyItem) => d.document_type,
    });

    yield* reportReadonly({
      type: "BusinessApplicant",
      header: "Business Applicants",
      list: collectAll<AnyItem>(listBusinessApplicants as ListOp, {}),
      getName: (a: AnyItem) => a.business_name ?? a.legal_name ?? a.name,
    });

    yield* reportReadonly({
      type: "PersonApplicant",
      header: "Person Applicants",
      list: collectAll<AnyItem>(listPersonApplicants as ListOp, {}),
      getName: (a: AnyItem) =>
        [a.first_name, a.last_name].filter(Boolean).join(" ") || undefined,
    });

    yield* reportReadonly({
      type: "Onboarding",
      header: "Onboardings",
      list: collectAll<AnyItem>(listOnboardings as ListOp, {}),
      getMeta: (o: AnyItem) => o.status,
    });

    yield* reportReadonly({
      type: "Customer",
      header: "Customers",
      list: collectAll<AnyItem>(listCustomers as ListOp, {}),
      getName: (c: AnyItem) =>
        c.name ??
        c.business_name ??
        ([c.first_name, c.last_name].filter(Boolean).join(" ") || undefined),
    });

    yield* reportReadonly({
      type: "Program",
      header: "Programs",
      list: collectAll<AnyItem>(listPrograms as ListOp, {}),
      getName: (p: AnyItem) => p.name ?? undefined,
    });

    yield* reportReadonly({
      type: "DepositAccountTemplate",
      header: "Deposit Account Templates",
      list: collectAll<AnyItem>(listDepositAccountTemplates as ListOp, {}),
      getName: (t: AnyItem) => t.name ?? undefined,
    });

    yield* reportReadonly({
      type: "AccountNumber",
      header: "Account Numbers",
      list: collectAll<AnyItem>(listAccountNumbers as ListOp, {}),
      getName: (n: AnyItem) => n.name ?? undefined,
      getMeta: (n: AnyItem) =>
        n.deposit_account_id && `acct: ${n.deposit_account_id}`,
    });

    yield* reportReadonly({
      type: "BlockchainAddress",
      header: "Blockchain Addresses",
      list: collectAll<AnyItem>(listBlockchainAddresses as ListOp, {}),
      getName: (a: AnyItem) => a.name ?? a.address,
      getMeta: (a: AnyItem) => a.address_type,
    });

    yield* reportReadonly({
      type: "Counterparty",
      header: "Counterparties",
      list: collectAll<AnyItem>(listCounterparties as ListOp, {}),
      getName: (c: AnyItem) => c.name,
    });

    yield* reportReadonly({
      type: "CounterpartyUsBankAccount",
      header: "Counterparty US Bank Accounts",
      list: collectAll<AnyItem>(listCounterpartyUsBankAccounts as ListOp, {}),
      getName: (a: AnyItem) => a.description,
    });

    yield* reportReadonly({
      type: "CounterpartyInternationalBankAccount",
      header: "Counterparty International Bank Accounts",
      list: collectAll<AnyItem>(
        listCounterpartyInternationalBankAccounts as ListOp,
        {},
      ),
      getName: (a: AnyItem) => a.description ?? a.name,
    });

    yield* reportReadonly({
      type: "CounterpartyBlockchainAddress",
      header: "Counterparty Blockchain Addresses",
      list: collectAll<AnyItem>(
        listCounterpartyBlockchainAddresses as ListOp,
        {},
      ),
      getName: (a: AnyItem) => a.description ?? a.address,
      getMeta: (a: AnyItem) => a.address_type,
    });

    yield* reportReadonly({
      type: "CounterpartyRailAddress",
      header: "Counterparty Rail Addresses",
      list: collectAll<AnyItem>(listCounterpartyRailAddresses as ListOp, {}),
      getName: (a: AnyItem) => a.description ?? a.name,
    });

    // ----- Transfers (immutable history; capped to a few pages each) -----
    const transferSections: ReadonlyArray<
      readonly [string, string, ListOp]
    > = [
      ["InboundAchTransfer", "Inbound ACH Transfers", listInboundAchTransfers as ListOp],
      ["OutboundAchTransfer", "Outbound ACH Transfers", listOutboundAchTransfers as ListOp],
      ["InboundBlockchainTransfer", "Inbound Blockchain Transfers", listInboundBlockchainTransfers as ListOp],
      ["OutboundBlockchainTransfer", "Outbound Blockchain Transfers", listOutboundBlockchainTransfers as ListOp],
      ["BookTransfer", "Book Transfers", listBookTransfers as ListOp],
      ["InboundInternationalWireTransfer", "Inbound International Wire Transfers", listInboundInternationalWireTransfers as ListOp],
      ["OutboundInternationalWireTransfer", "Outbound International Wire Transfers", listOutboundInternationalWireTransfers as ListOp],
      ["InboundRailTransfer", "Inbound Rail Transfers", listInboundRailTransfers as ListOp],
      ["OutboundRailTransfer", "Outbound Rail Transfers", listOutboundRailTransfers as ListOp],
      ["InboundWireTransfer", "Inbound Wire Transfers", listInboundWireTransfers as ListOp],
      ["OutboundWireTransfer", "Outbound Wire Transfers", listOutboundWireTransfers as ListOp],
    ];
    for (const [type, header, listOp] of transferSections) {
      yield* reportReadonly({
        type,
        header,
        list: collectAll<AnyItem>(listOp, {}, 3),
        getMeta: (t: AnyItem) =>
          [t.status, t.amount?.display_value].filter(Boolean).join(" ") ||
          undefined,
      });
    }

    yield* reportReadonly({
      type: "Transaction",
      header: "Transactions",
      list: collectAll<AnyItem>(listTransactions as ListOp, {}, 3),
      getMeta: (t: AnyItem) => t.status,
    });

    yield* reportReadonly({
      type: "Event",
      header: "Events",
      list: collectAll<AnyItem>(listEvents as ListOp, {}, 3),
      getMeta: (e: AnyItem) => e.event_type ?? e.type,
    });
  });

// ============================================================================
// Main command
// ============================================================================

const nuke = Command.make(
  "nuke",
  {
    dryRun: Flag.boolean("dry-run").pipe(
      Flag.withDescription("Only list resources without deleting them"),
      Flag.withDefault(false),
    ),
  },
  (cfg) =>
    Effect.gen(function* () {
      const nukeConfig = loadNukeConfig();
      const mode = cfg.dryRun
        ? `${YELLOW}DRY RUN${RESET}`
        : `${RED}LIVE${RESET}`;
      yield* Console.log(
        `\n${BOLD}Erebor Nuke${RESET} ${DIM}(mode: ${mode}${DIM})${RESET}`,
      );

      if (!cfg.dryRun) {
        yield* Console.log(
          `${RED}${BOLD}WARNING: This will close all open deposit accounts and archive all enabled webhooks in this Erebor account!${RESET}`,
        );
      }

      if (nukeConfig.exclude && nukeConfig.exclude.length > 0) {
        yield* Console.log(
          `${DIM}Loaded ${nukeConfig.exclude.length} exclusion rule(s) from nuke-config.json${RESET}`,
        );
      } else {
        yield* Console.log(
          `${DIM}No nuke-config.json — nothing preserved by default${RESET}`,
        );
      }

      yield* nukeAll(cfg.dryRun, nukeConfig);

      // Summary
      yield* Console.log(`\n${BOLD}Summary${RESET}`);
      yield* Console.log(`  Deletable found: ${totalFound}`);
      yield* Console.log(`  ${YELLOW}Skipped:         ${totalSkipped}${RESET}`);
      yield* Console.log(
        `  ${BLUE}Read-only items: ${totalReadonly}${RESET} ${DIM}(no SDK delete available)${RESET}`,
      );
      if (!cfg.dryRun) {
        yield* Console.log(`  ${GREEN}Deleted:         ${totalDeleted}${RESET}`);
        if (totalFailed > 0) {
          yield* Console.log(`  ${RED}Failed:          ${totalFailed}${RESET}`);
        }
      }
    }).pipe(
      Effect.provide(CredentialsFromEnv),
      Effect.provide(FetchHttpClient.layer),
    ),
).pipe(Command.withDescription("List and delete all Erebor resources"));

// ============================================================================
// Entry Point
// ============================================================================

process.on("uncaughtException", (err) => {
  console.error(`${RED}Uncaught exception:${RESET}`, err);
});
process.on("unhandledRejection", (reason) => {
  console.error(`${RED}Unhandled rejection:${RESET}`, reason);
});
process.on("exit", (code) => {
  if (code !== 0)
    console.error(`${DIM}Process exiting with code ${code}${RESET}`);
});

BunRuntime.runMain(
  Effect.provide(Command.run(nuke, { version: "1.0.0" }), BunServices.layer),
);
