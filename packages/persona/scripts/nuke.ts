#!/usr/bin/env bun
/**
 * Persona Nuke Script
 *
 * Lists and deletes/archives/expires/redacts resources in a Persona sandbox
 * environment. Supports --dry-run to preview without deleting.
 *
 * Usage:
 *   bun packages/persona/scripts/nuke.ts --dry-run
 *   bun packages/persona/scripts/nuke.ts
 */
import "dotenv/config";
import * as fs from "node:fs";
import * as nodePath from "node:path";

import { BunRuntime, BunServices } from "@effect/platform-bun";
import { Console, Effect } from "effect";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { Command, Flag } from "effect/unstable/cli";

import { CredentialsFromEnv } from "../src/credentials.ts";
import { expireAnApiKey } from "../src/operations/expireAnApiKey.ts";
import { listAllApiKeys } from "../src/operations/listAllApiKeys.ts";
import { listAllApiLogs } from "../src/operations/listAllApiLogs.ts";
import { listAllAccounts } from "../src/operations/listAllAccounts.ts";
import { redactAnAccount } from "../src/operations/redactAnAccount.ts";
import { listAllCases } from "../src/operations/listAllCases.ts";
import { redactACase } from "../src/operations/redactACase.ts";
import { deactivateAConnectConnection } from "../src/operations/deactivateAConnectConnection.ts";
import { listAllConnectConnections } from "../src/operations/listAllConnectConnections.ts";
import { listAllDevices } from "../src/operations/listAllDevices.ts";
import { listAllEvents } from "../src/operations/listAllEvents.ts";
import { listAllImporters } from "../src/operations/listAllImporters.ts";
import { expireAnInquiry } from "../src/operations/expireAnInquiry.ts";
import { listAllInquiries } from "../src/operations/listAllInquiries.ts";
import { redactAnInquiry } from "../src/operations/redactAnInquiry.ts";
import { expireAnInquirySession } from "../src/operations/expireAnInquirySession.ts";
import { listAllInquirySessions } from "../src/operations/listAllInquirySessions.ts";
import { listAllInquiryTemplates } from "../src/operations/listAllInquiryTemplates.ts";
import { archiveAList } from "../src/operations/archiveAList.ts";
import { listAllLists } from "../src/operations/listAllLists.ts";
import { listAllRateLimits } from "../src/operations/listAllRateLimits.ts";
import { listReportHistory } from "../src/operations/listReportHistory.ts";
import { listAllReports } from "../src/operations/listAllReports.ts";
import { redactAReport } from "../src/operations/redactAReport.ts";
import { expireShareToken } from "../src/operations/expireShareToken.ts";
import { listAllShareTokens } from "../src/operations/listAllShareTokens.ts";
import { listAllTransactions } from "../src/operations/listAllTransactions.ts";
import { redactATransaction } from "../src/operations/redactATransaction.ts";
import { redactTransactionBiometrics } from "../src/operations/redactTransactionBiometrics.ts";
import { listAllUserAuditLogs } from "../src/operations/listAllUserAuditLogs.ts";
import { redactAVerification } from "../src/operations/redactAVerification.ts";
import { archiveAWebhook } from "../src/operations/archiveAWebhook.ts";
import { listAllWebhooks } from "../src/operations/listAllWebhooks.ts";
import { listAllWorkflowRuns } from "../src/operations/listAllWorkflowRuns.ts";

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

const PERSONA_VERSION = "2025-12-08";
const PAGE_SIZE = 100;

let totalFound = 0;
let totalSkipped = 0;
let totalDeleted = 0;
let totalFailed = 0;

interface ExcludeRule {
  type: string;
  ids?: string[];
  namePatterns?: string[];
  reason?: string;
}

interface NukeConfig {
  exclude?: ExcludeRule[];
}

interface ResourceItem {
  readonly type?: string;
  readonly id?: string;
  readonly attributes?: Record<string, unknown>;
  readonly relationships?: Record<string, unknown>;
  readonly meta?: Record<string, unknown>;
}

type ListOperation = (input: any) => Effect.Effect<unknown, unknown, unknown>;

type DeleteOperation = (input: any) => Effect.Effect<unknown, unknown, unknown>;

const PKG_DIR = nodePath.resolve(import.meta.dir, "..");

function loadNukeConfig(): NukeConfig {
  const path = nodePath.join(PKG_DIR, "nuke-config.json");
  if (!fs.existsSync(path)) return {};
  return JSON.parse(fs.readFileSync(path, "utf-8"));
}

function escapeRegExp(value: string): string {
  return value.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
}

function matchGlob(pattern: string, value: string): boolean {
  return new RegExp(
    `^${pattern.split("*").map(escapeRegExp).join(".*")}$`,
  ).test(value);
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
    if (
      name &&
      rule.namePatterns?.some((pattern) => matchGlob(pattern, name))
    ) {
      return true;
    }
    return false;
  });
}

function errorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message?: unknown }).message);
  }
  return String(error);
}

function short(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  const rendered = JSON.stringify(value);
  return rendered.length > 100 ? `${rendered.slice(0, 97)}...` : rendered;
}

function attr(item: ResourceItem, key: string): unknown {
  return item.attributes?.[key];
}

function relationIds(item: ResourceItem, key: string): string[] {
  const relationship = item.relationships?.[key] as
    | { data?: unknown }
    | undefined;
  const data = relationship?.data;
  if (Array.isArray(data)) {
    return data
      .map((entry) =>
        entry && typeof entry === "object" && "id" in entry
          ? String((entry as { id?: unknown }).id)
          : undefined,
      )
      .filter((id): id is string => Boolean(id));
  }
  if (data && typeof data === "object" && "id" in data) {
    const id = (data as { id?: unknown }).id;
    return id ? [String(id)] : [];
  }
  return [];
}

function nextAfter(next: unknown): string | undefined {
  if (typeof next !== "string" || next.length === 0) return undefined;
  try {
    const url = new URL(next, "https://api.withpersona.com");
    return url.searchParams.get("page[after]") ?? undefined;
  } catch {
    return undefined;
  }
}

function listPage(
  operation: ListOperation,
  input: Record<string, unknown>,
): Effect.Effect<unknown, unknown, unknown> {
  return operation({
    ...input,
    personaVersion: PERSONA_VERSION,
  });
}

function listAllPages(
  operation: ListOperation,
  input: Record<string, unknown> = {},
  maxPages = Number.POSITIVE_INFINITY,
): Effect.Effect<ResourceItem[], unknown, unknown> {
  return Effect.gen(function* () {
    const resources: ResourceItem[] = [];
    let after: string | undefined;
    let pages = 0;

    do {
      const response = (yield* listPage(operation, {
        ...input,
        page: { size: PAGE_SIZE, ...(after ? { after } : {}) },
      })) as { data?: unknown; links?: { next?: unknown } | null };
      const data = Array.isArray(response.data) ? response.data : [];
      resources.push(...(data as ResourceItem[]));
      after = nextAfter(response.links?.next);
      pages++;
    } while (after && pages < maxPages);

    return resources;
  });
}

function listOnce(
  operation: ListOperation,
  input: Record<string, unknown> = {},
): Effect.Effect<ResourceItem[], unknown, unknown> {
  return Effect.gen(function* () {
    const response = (yield* listPage(operation, input)) as { data?: unknown };
    return Array.isArray(response.data)
      ? (response.data as ResourceItem[])
      : [];
  });
}

function safeList(
  label: string,
  list: Effect.Effect<ResourceItem[], unknown, unknown>,
  allowFailure = false,
): Effect.Effect<ResourceItem[], never, unknown> {
  return list.pipe(
    Effect.catch((error) => {
      if (allowFailure) {
        totalSkipped++;
        return Console.log(
          `  ${YELLOW}[SKIP]${RESET} List ${label}: ${errorMessage(error)}`,
        ).pipe(Effect.map(() => []));
      }
      totalFailed++;
      return Console.log(
        `  ${RED}[FAILED]${RESET} List ${label}: ${errorMessage(error)}`,
      ).pipe(Effect.map(() => []));
    }),
  );
}

function displayResource(
  type: string,
  id: string,
  name?: string,
  meta?: string,
): string {
  const title = name && name !== id ? `${name} ${DIM}(${id})${RESET}` : id;
  return `${type}: ${title}${meta ? ` ${DIM}${meta}${RESET}` : ""}`;
}

function processResource(options: {
  readonly type: string;
  readonly id: string;
  readonly name?: string;
  readonly meta?: string;
  readonly dryRun: boolean;
  readonly config: NukeConfig;
  readonly action?: string;
  readonly delete?: DeleteOperation;
  readonly deleteInput?: Record<string, unknown>;
  readonly skipReason?: string;
}): Effect.Effect<void, never, unknown> {
  return Effect.gen(function* () {
    totalFound++;
    const excluded = isExcluded(
      options.config,
      options.type,
      options.id,
      options.name,
    );
    const display = displayResource(
      options.type,
      options.id,
      options.name,
      options.meta,
    );

    if (excluded) {
      totalSkipped++;
      yield* Console.log(
        `  ${YELLOW}[SKIP]${RESET} ${display} - ${
          excluded.reason ?? "excluded"
        }`,
      );
      return;
    }

    if (!options.delete) {
      totalSkipped++;
      yield* Console.log(
        `  ${YELLOW}[SKIP]${RESET} ${display} - ${
          options.skipReason ?? "no generated cleanup operation"
        }`,
      );
      return;
    }

    const action = options.action ?? "DELETE";
    yield* Console.log(
      `  ${options.dryRun ? YELLOW : RED}[${action}]${RESET} ${display}`,
    );

    if (options.dryRun) return;

    yield* options.delete(options.deleteInput ?? {}).pipe(
      Effect.map(() => {
        totalDeleted++;
      }),
      Effect.catch((error) => {
        totalFailed++;
        return Console.log(
          `    ${RED}Failed to ${action.toLowerCase()} ${options.type} ${
            options.id
          }: ${errorMessage(error)}${RESET}`,
        );
      }),
    );
  });
}

function itemId(item: ResourceItem): string | undefined {
  return item.id ? String(item.id) : undefined;
}

function nameFrom(
  item: ResourceItem,
  keys: readonly string[],
): string | undefined {
  for (const key of keys) {
    const value = attr(item, key);
    if (value !== null && value !== undefined) return short(value);
  }
  return item.id;
}

const idempotencyKey = (action: string, id: string) =>
  `distilled-persona-nuke-${action}-${id}`;

function nukeCollection(options: {
  readonly label: string;
  readonly type: string;
  readonly list: Effect.Effect<ResourceItem[], unknown, unknown>;
  readonly dryRun: boolean;
  readonly config: NukeConfig;
  readonly action?: string;
  readonly delete?: DeleteOperation;
  readonly deleteInput?: (
    id: string,
    item: ResourceItem,
  ) => Record<string, unknown>;
  readonly id?: (item: ResourceItem, index: number) => string | undefined;
  readonly name?: (item: ResourceItem) => string | undefined;
  readonly meta?: (item: ResourceItem) => string | undefined;
  readonly skipReason?: string;
  readonly allowListFailure?: boolean;
}): Effect.Effect<ResourceItem[], never, unknown> {
  return Effect.gen(function* () {
    yield* Console.log(`\n${BOLD}${CYAN}${options.label}${RESET}`);
    const resources = yield* safeList(
      options.label,
      options.list,
      options.allowListFailure,
    );

    if (resources.length === 0) {
      yield* Console.log(
        `  ${DIM}No ${options.label.toLowerCase()} found${RESET}`,
      );
      return resources;
    }

    for (const [index, resource] of resources.entries()) {
      const id = options.id?.(resource, index) ?? itemId(resource);
      if (!id) {
        totalFailed++;
        yield* Console.log(
          `  ${RED}[FAILED]${RESET} ${options.type}: missing id ${DIM}${short(
            resource,
          )}${RESET}`,
        );
        continue;
      }

      yield* processResource({
        type: options.type,
        id,
        name: options.name?.(resource),
        meta: options.meta?.(resource),
        dryRun: options.dryRun,
        config: options.config,
        action: options.action,
        delete: options.delete,
        deleteInput: options.deleteInput?.(id, resource),
        skipReason: options.skipReason,
      });
    }

    return resources;
  });
}

const readOnlyReason = "list-only resource in the generated Persona SDK";
const listFirstPage = (
  operation: ListOperation,
  input: Record<string, unknown> = {},
) => listAllPages(operation, input, 1);

const nukeReadOnlyResources = (dryRun: boolean, config: NukeConfig) =>
  Effect.gen(function* () {
    yield* nukeCollection({
      label: "Rate Limits",
      type: "RateLimit",
      list: listOnce(listAllRateLimits),
      dryRun,
      config,
      id: (_item, index) => `rate-limit:${index + 1}`,
      name: (item) => short(attr(item, "limit") ?? item.type ?? "rate-limit"),
      meta: (item) =>
        `(remaining: ${short(attr(item, "remaining"))}, reset: ${short(
          attr(item, "seconds-to-reset"),
        )}s)`,
      skipReason: readOnlyReason,
      allowListFailure: true,
    });

    yield* nukeCollection({
      label: "API Logs",
      type: "ApiLog",
      list: listFirstPage(listAllApiLogs),
      dryRun,
      config,
      name: (item) => short(attr(item, "created-at") ?? item.id),
      meta: (item) => {
        const request = attr(item, "request") as
          | { method?: unknown; path?: unknown }
          | undefined;
        return request
          ? `(${short(request.method)} ${short(request.path)})`
          : undefined;
      },
      skipReason: readOnlyReason,
      allowListFailure: true,
    });

    yield* nukeCollection({
      label: "Events",
      type: "Event",
      list: listFirstPage(listAllEvents),
      dryRun,
      config,
      name: (item) => nameFrom(item, ["name", "created-at"]),
      skipReason: readOnlyReason,
      allowListFailure: true,
    });

    yield* nukeCollection({
      label: "Importers",
      type: "Importer",
      list: listFirstPage(listAllImporters),
      dryRun,
      config,
      name: (item) => nameFrom(item, ["name", "created-at"]),
      skipReason: readOnlyReason,
      allowListFailure: true,
    });

    yield* nukeCollection({
      label: "Inquiry Templates",
      type: "InquiryTemplate",
      list: listFirstPage(listAllInquiryTemplates),
      dryRun,
      config,
      name: (item) => nameFrom(item, ["name", "status"]),
      skipReason: readOnlyReason,
      allowListFailure: true,
    });

    yield* nukeCollection({
      label: "User Audit Logs",
      type: "UserAuditLog",
      list: listFirstPage(listAllUserAuditLogs),
      dryRun,
      config,
      name: (item) => nameFrom(item, ["path", "created-at"]),
      meta: (item) =>
        attr(item, "method") ? `(${short(attr(item, "method"))})` : undefined,
      skipReason: readOnlyReason,
      allowListFailure: true,
    });

    yield* nukeCollection({
      label: "Workflow Runs",
      type: "WorkflowRun",
      list: listFirstPage(listAllWorkflowRuns),
      dryRun,
      config,
      name: (item) => nameFrom(item, ["status", "created-at"]),
      skipReason: readOnlyReason,
      allowListFailure: true,
    });
  });

const nukeDevicesForSessions = (
  sessions: readonly ResourceItem[],
  dryRun: boolean,
  config: NukeConfig,
) =>
  Effect.gen(function* () {
    yield* Console.log(`\n${BOLD}${CYAN}Devices${RESET}`);
    let any = false;

    for (const session of sessions) {
      const sessionId = itemId(session);
      if (!sessionId) continue;

      const devices = yield* safeList(
        `devices for inquiry session ${sessionId}`,
        listOnce(listAllDevices, {
          filter: { "inquiry-session-id": sessionId },
        }),
      );

      for (const device of devices) {
        any = true;
        const id = itemId(device);
        if (!id) {
          totalFailed++;
          yield* Console.log(
            `  ${RED}[FAILED]${RESET} Device: missing id ${DIM}${short(
              device,
            )}${RESET}`,
          );
          continue;
        }
        yield* processResource({
          type: "Device",
          id,
          name: nameFrom(device, ["device-fingerprint", "browser-fingerprint"]),
          meta: `(inquiry session: ${sessionId})`,
          dryRun,
          config,
          skipReason: readOnlyReason,
        });
      }
    }

    if (!any) {
      yield* Console.log(`  ${DIM}No devices found${RESET}`);
    }
  });

const nukeReportHistory = (
  reports: readonly ResourceItem[],
  dryRun: boolean,
  config: NukeConfig,
) =>
  Effect.gen(function* () {
    yield* Console.log(`\n${BOLD}${CYAN}Report History${RESET}`);
    let any = false;

    for (const report of reports) {
      const reportId = itemId(report);
      if (!reportId) continue;

      const history = yield* safeList(
        `history for report ${reportId}`,
        listAllPages(listReportHistory, { reportId }),
      );

      for (const entry of history) {
        any = true;
        const id = itemId(entry) ?? `${reportId}:${totalFound}`;
        yield* processResource({
          type: "ReportHistory",
          id,
          name: nameFrom(entry, ["name", "status", "created-at"]),
          meta: `(report: ${reportId})`,
          dryRun,
          config,
          skipReason: readOnlyReason,
        });
      }
    }

    if (!any) {
      yield* Console.log(`  ${DIM}No report history found${RESET}`);
    }
  });

const nukeVerificationsForInquiries = (
  inquiries: readonly ResourceItem[],
  dryRun: boolean,
  config: NukeConfig,
) =>
  Effect.gen(function* () {
    yield* Console.log(`\n${BOLD}${CYAN}Verifications${RESET}`);
    const seen = new Set<string>();

    for (const inquiry of inquiries) {
      for (const verificationId of relationIds(inquiry, "verifications")) {
        if (seen.has(verificationId)) continue;
        seen.add(verificationId);
        yield* processResource({
          type: "Verification",
          id: verificationId,
          meta: `(from inquiry: ${itemId(inquiry) ?? "unknown"})`,
          dryRun,
          config,
          action: "REDACT",
          delete: redactAVerification,
          deleteInput: {
            verificationId,
            idempotencyKey: idempotencyKey(
              "verification-redact",
              verificationId,
            ),
            personaVersion: PERSONA_VERSION,
          },
        });
      }
    }

    if (seen.size === 0) {
      yield* Console.log(
        `  ${DIM}No verifications found from inquiry relationships${RESET}`,
      );
    }
  });

const nuke = Command.make(
  "nuke",
  {
    dryRun: Flag.boolean("dry-run").pipe(
      Flag.withDescription("Only list resources without deleting them"),
      Flag.withDefault(false),
    ),
  },
  (options) =>
    Effect.gen(function* () {
      const config = loadNukeConfig();
      const mode = options.dryRun
        ? `${YELLOW}DRY RUN${RESET}`
        : `${RED}LIVE${RESET}`;

      yield* Console.log(
        `\n${BOLD}Persona Nuke${RESET} ${DIM}(${mode})${RESET}`,
      );
      yield* Console.log(`${DIM}Persona-Version: ${PERSONA_VERSION}${RESET}`);

      if (!options.dryRun) {
        yield* Console.log(
          `${RED}${BOLD}WARNING: This will archive, expire, deactivate, and redact Persona resources. Redactions are irreversible.${RESET}`,
        );
      }

      if (config.exclude && config.exclude.length > 0) {
        yield* Console.log(
          `${DIM}Loaded ${config.exclude.length} exclusion rule(s) from nuke-config.json${RESET}`,
        );
      }

      yield* nukeReadOnlyResources(options.dryRun, config);

      const inquirySessions = yield* nukeCollection({
        label: "Inquiry Sessions",
        type: "InquirySession",
        list: listOnce(listAllInquirySessions),
        dryRun: options.dryRun,
        config,
        action: "EXPIRE",
        delete: expireAnInquirySession,
        deleteInput: (id) => ({
          inquirySessionId: id,
          idempotencyKey: idempotencyKey("inquiry-session-expire", id),
          personaVersion: PERSONA_VERSION,
        }),
        name: (item) => nameFrom(item, ["status", "created-at"]),
      });
      yield* nukeDevicesForSessions(inquirySessions, options.dryRun, config);

      yield* nukeCollection({
        label: "Share Tokens",
        type: "ShareToken",
        list: listAllPages(listAllShareTokens),
        dryRun: options.dryRun,
        config,
        action: "EXPIRE",
        delete: expireShareToken,
        deleteInput: (id) => ({
          shareTokenId: id,
          idempotencyKey: idempotencyKey("share-token-expire", id),
          personaVersion: PERSONA_VERSION,
        }),
        name: (item) => nameFrom(item, ["status", "direction", "created-at"]),
        allowListFailure: true,
      });

      yield* nukeCollection({
        label: "Webhooks",
        type: "Webhook",
        list: listAllPages(listAllWebhooks),
        dryRun: options.dryRun,
        config,
        action: "ARCHIVE",
        delete: archiveAWebhook,
        deleteInput: (id) => ({
          webhookId: id,
          idempotencyKey: idempotencyKey("webhook-archive", id),
          personaVersion: PERSONA_VERSION,
        }),
        name: (item) => nameFrom(item, ["name", "url", "status"]),
      });

      yield* nukeCollection({
        label: "Connect Connections",
        type: "ConnectConnection",
        list: listAllPages(listAllConnectConnections),
        dryRun: options.dryRun,
        config,
        action: "DEACTIVATE",
        delete: deactivateAConnectConnection,
        deleteInput: (id) => ({
          connectionId: id,
          idempotencyKey: idempotencyKey("connect-connection-deactivate", id),
          personaVersion: PERSONA_VERSION,
        }),
        name: (item) =>
          nameFrom(item, ["status", "destination-organization-id"]),
        allowListFailure: true,
      });

      const reports = yield* nukeCollection({
        label: "Reports",
        type: "Report",
        list: listAllPages(listAllReports),
        dryRun: options.dryRun,
        config,
        action: "REDACT",
        delete: redactAReport,
        deleteInput: (id) => ({
          reportId: id,
          idempotencyKey: idempotencyKey("report-redact", id),
          personaVersion: PERSONA_VERSION,
        }),
        name: (item) =>
          nameFrom(item, ["reference-id", "status", "created-at"]),
      });
      yield* nukeReportHistory(reports, options.dryRun, config);

      yield* nukeCollection({
        label: "Transactions",
        type: "Transaction",
        list: listAllPages(listAllTransactions),
        dryRun: options.dryRun,
        config,
        action: "REDACT",
        delete: (input) =>
          redactTransactionBiometrics(input).pipe(
            Effect.catch(() => Effect.void),
            Effect.andThen(redactATransaction(input)),
          ),
        deleteInput: (id) => ({
          transactionId: id,
          idempotencyKey: idempotencyKey("transaction-redact", id),
          personaVersion: PERSONA_VERSION,
        }),
        name: (item) =>
          nameFrom(item, ["reference-id", "status", "created-at"]),
      });

      const inquiries = yield* nukeCollection({
        label: "Inquiries",
        type: "Inquiry",
        list: listAllPages(listAllInquiries),
        dryRun: options.dryRun,
        config,
        action: "EXPIRE+REDACT",
        delete: (input) =>
          expireAnInquiry(input).pipe(
            Effect.catch(() => Effect.void),
            Effect.andThen(redactAnInquiry(input)),
          ),
        deleteInput: (id) => ({
          inquiryId: id,
          idempotencyKey: idempotencyKey("inquiry-redact", id),
          personaVersion: PERSONA_VERSION,
        }),
        name: (item) =>
          nameFrom(item, ["reference-id", "status", "created-at"]),
      });
      yield* nukeVerificationsForInquiries(inquiries, options.dryRun, config);

      yield* nukeCollection({
        label: "Cases",
        type: "Case",
        list: listAllPages(listAllCases),
        dryRun: options.dryRun,
        config,
        action: "REDACT",
        delete: redactACase,
        deleteInput: (id) => ({
          caseId: id,
          idempotencyKey: idempotencyKey("case-redact", id),
          personaVersion: PERSONA_VERSION,
        }),
        name: (item) => nameFrom(item, ["name", "status", "created-at"]),
      });

      yield* nukeCollection({
        label: "Accounts",
        type: "Account",
        list: listAllPages(listAllAccounts),
        dryRun: options.dryRun,
        config,
        action: "REDACT",
        delete: redactAnAccount,
        deleteInput: (id) => ({
          accountId: id,
          idempotencyKey: idempotencyKey("account-redact", id),
          personaVersion: PERSONA_VERSION,
        }),
        name: (item) =>
          nameFrom(item, ["reference-id", "account-status", "created-at"]),
      });

      yield* nukeCollection({
        label: "Lists",
        type: "List",
        list: listAllPages(listAllLists, { filter: { status: "active" } }),
        dryRun: options.dryRun,
        config,
        action: "ARCHIVE",
        delete: archiveAList,
        deleteInput: (id) => ({
          listId: id,
          idempotencyKey: idempotencyKey("list-archive", id),
          personaVersion: PERSONA_VERSION,
        }),
        name: (item) => nameFrom(item, ["name", "status", "created-at"]),
      });

      yield* nukeCollection({
        label: "API Keys",
        type: "ApiKey",
        list: listAllPages(listAllApiKeys),
        dryRun: options.dryRun,
        config,
        action: "EXPIRE",
        delete: expireAnApiKey,
        deleteInput: (id) => ({
          apiKeyId: id,
          idempotencyKey: idempotencyKey("api-key-expire", id),
          personaVersion: PERSONA_VERSION,
        }),
        name: (item) => nameFrom(item, ["name", "note", "created-at"]),
        allowListFailure: true,
      });

      yield* Console.log(`\n${BOLD}Summary${RESET}`);
      yield* Console.log(`  Total found:   ${totalFound}`);
      yield* Console.log(`  ${YELLOW}Skipped:       ${totalSkipped}${RESET}`);
      yield* Console.log(`  ${GREEN}Deleted:       ${totalDeleted}${RESET}`);
      yield* Console.log(`  ${RED}Failed:        ${totalFailed}${RESET}`);
    }).pipe(
      Effect.provide(CredentialsFromEnv),
      Effect.provide(FetchHttpClient.layer),
    ),
).pipe(Command.withDescription("List and delete Persona resources"));

BunRuntime.runMain(
  Effect.provide(
    Command.run(nuke, { version: "1.0.0" }),
    BunServices.layer,
  ) as Effect.Effect<void, unknown, never>,
);
