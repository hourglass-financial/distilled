import { describe, expect, it, vi } from "vitest";
import {
  confirmationToken,
  parseCleanupArguments,
} from "../scripts/cleanup-test-run.ts";
import { ownedName } from "./fixtures.ts";
import type { OwnedLocator } from "./recovery.ts";
import { isExactOwnedLocator, reconcileOwnedId } from "./recovery.ts";
import { CleanupStack, sanitizeFailure, withCleanup } from "./safe-run.ts";
import { testRunId } from "./setup.ts";

describe("Persona live-test harness", () => {
  it("creates distinct names scoped to the same run", () => {
    const first = ownedName("account", "first");
    const second = ownedName("account", "second");
    expect(first).not.toBe(second);
    expect(first).toContain(testRunId);
    expect(second).toContain(testRunId);
  });

  it("accepts only exact current-run recovery locators", () => {
    expect(
      isExactOwnedLocator(
        { kind: "account", value: ownedName("account", "owned") },
        testRunId,
      ),
    ).toBe(true);
    expect(
      isExactOwnedLocator(
        { kind: "account", value: "distilled-persona-account-*" },
        testRunId,
      ),
    ).toBe(false);
  });

  it("polls an exact locator without accepting an empty result", async () => {
    const findExact = vi
      .fn<(locator: OwnedLocator) => Promise<string | undefined>>()
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce("act_owned");
    const locator = {
      kind: "account" as const,
      value: ownedName("account", "recovery"),
    };
    await expect(
      reconcileOwnedId(locator, findExact, { attempts: 3, delayMs: 0 }),
    ).resolves.toEqual({ id: "act_owned", locator });
  });

  it("runs cleanup in dependency-safe LIFO order", async () => {
    const order: string[] = [];
    const cleanup = new CleanupStack();
    cleanup.add("list", async () => void order.push("list"));
    cleanup.add("item", async () => void order.push("item"));
    await cleanup.run();
    expect(order).toEqual(["item", "list"]);
  });

  it("keeps primary and cleanup failures visible", async () => {
    await expect(
      withCleanup(async (cleanup) => {
        cleanup.add("owned account", async () => {
          throw new Error("cleanup canary");
        });
        throw new Error("primary canary");
      }),
    ).rejects.toMatchObject({
      name: "AggregateError",
      message: "Persona test and cleanup both failed",
    });
  });

  it("never includes raw error values in safe diagnostics", () => {
    const canary = "persona_sandbox_do_not_print";
    const safe = sanitizeFailure({
      _tag: "PersonaParseError",
      issue: { path: ["data", "attributes", "fields"] },
      body: { token: canary },
      message: canary,
    });
    expect(JSON.stringify(safe)).not.toContain(canary);
    expect(safe).toEqual({
      tag: "PersonaParseError",
      path: "data.attributes.fields",
      message: "PersonaParseError at data.attributes.fields",
    });
  });

  it("requires an exact recovery run id and confirmation token", () => {
    expect(() => parseCleanupArguments(["--run-id", "*"])).toThrow(
      "exactly eight lowercase hexadecimal characters",
    );
    expect(
      parseCleanupArguments([
        "--run-id",
        "0123abcd",
        "--execute",
        "--confirmation",
        confirmationToken("0123abcd", 2),
      ]),
    ).toEqual({
      runId: "0123abcd",
      execute: true,
      confirmation: "persona-cleanup-0123abcd-2",
    });
  });
});
