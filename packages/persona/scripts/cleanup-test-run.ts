#!/usr/bin/env bun
import "dotenv/config";
import { Effect } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { CredentialsFromEnv } from "../src/credentials.ts";
import { archiveAList } from "../src/operations/archiveAList.ts";
import { listAllAccounts } from "../src/operations/listAllAccounts.ts";
import { listAllInquiries } from "../src/operations/listAllInquiries.ts";
import { listAllLists } from "../src/operations/listAllLists.ts";
import { redactAnAccount } from "../src/operations/redactAnAccount.ts";
import { redactAnInquiry } from "../src/operations/redactAnInquiry.ts";
import { sanitizeFailure } from "../test/safe-run.ts";
import { PERSONA_VERSION } from "../test/fixtures.ts";

export interface CleanupArguments {
  readonly runId: string;
  readonly execute: boolean;
  readonly confirmation?: string;
}

export interface CleanupMatch {
  readonly kind: "account" | "inquiry" | "list";
  readonly id: string;
  readonly locator: string;
}

export const confirmationToken = (runId: string, count: number): string =>
  `persona-cleanup-${runId}-${count}`;

export const parseCleanupArguments = (
  args: readonly string[],
): CleanupArguments => {
  const valueAfter = (flag: string): string | undefined => {
    const index = args.indexOf(flag);
    return index >= 0 ? args[index + 1] : undefined;
  };
  const runId = valueAfter("--run-id");
  if (!runId || !/^[a-f0-9]{8}$/.test(runId)) {
    throw new Error(
      "--run-id must be exactly eight lowercase hexadecimal characters",
    );
  }
  return {
    runId,
    execute: args.includes("--execute"),
    confirmation: valueAfter("--confirmation"),
  };
};

const TestLayer = Layer.merge(CredentialsFromEnv, FetchHttpClient.layer);

const runEffect = <A, E, R>(effect: Effect.Effect<A, E, R>): Promise<A> =>
  Effect.runPromise(
    effect.pipe(Effect.provide(TestLayer)) as Effect.Effect<A, E, never>,
  );

const nextAfter = (next: string | null): string | undefined => {
  if (!next) return undefined;
  return (
    new URL(next, "https://api.withpersona.com").searchParams.get(
      "page[after]",
    ) ?? undefined
  );
};

const listMatches = async (runId: string): Promise<CleanupMatch[]> => {
  const suffix = `-${runId}`;
  const matches: CleanupMatch[] = [];

  let accountAfter: string | undefined;
  do {
    const page = await runEffect(
      listAllAccounts({
        page: { size: 100, ...(accountAfter ? { after: accountAfter } : {}) },
        personaVersion: PERSONA_VERSION,
      }),
    );
    for (const account of page.data) {
      const id = account.id;
      const locator = account.attributes?.["reference-id"];
      if (
        id &&
        !account.attributes?.["redacted-at"] &&
        locator?.startsWith("distilled-persona-") &&
        locator.endsWith(suffix)
      ) {
        matches.push({ kind: "account", id, locator });
      }
    }
    accountAfter = nextAfter(page.links.next);
  } while (accountAfter);

  let inquiryAfter: string | undefined;
  do {
    const page = await runEffect(
      listAllInquiries({
        page: { size: 100, ...(inquiryAfter ? { after: inquiryAfter } : {}) },
        personaVersion: PERSONA_VERSION,
      }),
    );
    for (const inquiry of page.data) {
      const locator = inquiry.attributes["reference-id"];
      if (
        !inquiry.attributes["redacted-at"] &&
        locator?.startsWith("distilled-persona-") &&
        locator.endsWith(suffix)
      ) {
        matches.push({ kind: "inquiry", id: inquiry.id, locator });
      }
    }
    inquiryAfter = nextAfter(page.links.next);
  } while (inquiryAfter);

  let listAfter: string | undefined;
  do {
    const page = await runEffect(
      listAllLists({
        filter: { status: "active" },
        page: { size: 100, ...(listAfter ? { after: listAfter } : {}) },
        personaVersion: PERSONA_VERSION,
      }),
    );
    for (const list of page.data) {
      const id = list.id;
      const locator = list.attributes?.name;
      if (
        id &&
        locator?.startsWith("distilled-persona-") &&
        locator.endsWith(suffix)
      ) {
        matches.push({ kind: "list", id, locator });
      }
    }
    listAfter = nextAfter(page.links.next);
  } while (listAfter);

  return matches.sort((a, b) =>
    `${a.kind}:${a.id}`.localeCompare(`${b.kind}:${b.id}`),
  );
};

const clean = async (match: CleanupMatch, runId: string): Promise<void> => {
  const common = {
    idempotencyKey: `distilled-persona-recovery-${match.kind}-${runId}`,
    personaVersion: PERSONA_VERSION,
  } as const;
  switch (match.kind) {
    case "account":
      await runEffect(redactAnAccount({ accountId: match.id, ...common }));
      break;
    case "inquiry":
      await runEffect(redactAnInquiry({ inquiryId: match.id, ...common }));
      break;
    case "list":
      await runEffect(archiveAList({ listId: match.id, ...common }));
      break;
  }
};

export const main = async (args: readonly string[]): Promise<void> => {
  const parsed = parseCleanupArguments(args);
  const matches = await listMatches(parsed.runId);
  const token = confirmationToken(parsed.runId, matches.length);

  console.info(
    `Persona recovery preview for ${parsed.runId}: ${matches.length} match(es)`,
  );
  for (const match of matches) {
    console.info(`${match.kind} ${match.id} ${match.locator}`);
  }
  console.info(`Confirmation: ${token}`);

  if (!parsed.execute) return;
  if (parsed.confirmation !== token) {
    throw new Error(
      "--confirmation must exactly match the current preview token",
    );
  }
  for (const match of matches) await clean(match, parsed.runId);
  console.info(`Cleaned ${matches.length} Persona resource(s)`);
};

if (import.meta.main) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(sanitizeFailure(error).message);
    process.exitCode = 1;
  });
}
