import { setTimeout as delay } from "node:timers/promises";
import { DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { PERSONA_VERSION } from "./fixtures.ts";

export interface OwnedLocator {
  readonly kind: "account" | "inquiry" | "list";
  readonly value: string;
}

export interface RecoveredResource {
  readonly id: string;
  readonly locator: OwnedLocator;
}

export const isExactOwnedLocator = (
  locator: OwnedLocator,
  runId: string,
): boolean =>
  /^[a-f0-9]{8}$/.test(runId) &&
  locator.value.startsWith("distilled-persona-") &&
  locator.value.endsWith(`-${runId}`);

export const reconcileOwnedId = async (
  locator: OwnedLocator,
  findExact: (locator: OwnedLocator) => Promise<string | undefined>,
  options: { readonly attempts?: number; readonly delayMs?: number } = {},
): Promise<RecoveredResource | undefined> => {
  const attempts = options.attempts ?? 5;
  const delayMs = options.delayMs ?? 250;
  for (let attempt = 0; attempt < attempts; attempt++) {
    const id = await findExact(locator);
    if (id) return { id, locator };
    if (attempt + 1 < attempts) await delay(delayMs);
  }
  return undefined;
};

const record = (value: unknown): Record<string, unknown> | undefined =>
  value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)
    : undefined;

const locatorAttribute = (kind: OwnedLocator["kind"]): string => {
  switch (kind) {
    case "account":
      return "reference-id";
    case "inquiry":
      return "reference-id";
    case "list":
      return "name";
  }
};

export const findOwnedResourceId = async (
  locator: OwnedLocator,
  runId: string,
): Promise<string | undefined> => {
  if (!isExactOwnedLocator(locator, runId)) {
    throw new Error("Recovery refused a locator outside the exact test run");
  }
  const apiKey = process.env.PERSONA_API_KEY;
  if (!apiKey) {
    throw new Error("PERSONA_API_KEY is required for recovery");
  }

  const path =
    locator.kind === "account"
      ? "/accounts"
      : locator.kind === "inquiry"
        ? "/inquiries"
        : "/lists";
  const url = new URL(`${DEFAULT_API_BASE_URL}${path}`);
  url.searchParams.set("page[size]", "100");
  if (locator.kind !== "list") {
    url.searchParams.set(
      `filter[${locatorAttribute(locator.kind)}]`,
      locator.value,
    );
  }

  const attribute = locatorAttribute(locator.kind);
  const matches: string[] = [];
  const visited = new Set<string>();
  let pageUrl: URL | undefined = url;
  while (pageUrl) {
    if (visited.has(pageUrl.href)) {
      throw new Error("Recovery read returned a pagination cycle");
    }
    visited.add(pageUrl.href);

    const response = await fetch(pageUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Persona-Version": PERSONA_VERSION,
      },
    });
    if (!response.ok) {
      throw new Error(`Recovery read failed with HTTP ${response.status}`);
    }
    const body = record(await response.json());
    if (!Array.isArray(body?.data)) {
      throw new Error("Recovery read returned an invalid resource collection");
    }

    for (const value of body.data) {
      const item = record(value);
      const attributes = record(item?.attributes);
      if (
        typeof item?.id === "string" &&
        attributes?.[attribute] === locator.value
      ) {
        matches.push(item.id);
      }
    }

    const links = record(body.links);
    const next = typeof links?.next === "string" ? links.next : undefined;
    pageUrl = next ? new URL(next, pageUrl) : undefined;
  }
  if (matches.length > 1) {
    throw new Error("Recovery locator matched more than one Persona resource");
  }
  return matches[0];
};
