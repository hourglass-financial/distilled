import { createAnAccount } from "../src/operations/createAnAccount.ts";
import { redactAnAccount } from "../src/operations/redactAnAccount.ts";
import {
  idempotencyKey,
  ownedName,
  PERSONA_VERSION,
  syntheticIdentity,
} from "./fixtures.ts";
import { findOwnedResourceId, reconcileOwnedId } from "./recovery.ts";
import { runLiveEffect, SafeApiError, withCleanup } from "./safe-run.ts";
import { testRunId } from "./setup.ts";

export interface AccountCleanupContext {
  readonly referenceId: string;
  readonly registerCreatedId: (id: string) => void;
  readonly markTerminal: () => void;
}

export interface OwnedAccount {
  readonly id: string;
  readonly referenceId: string;
  readonly markTerminal: () => void;
}

export const withAccountCleanup = async <A>(
  scenario: string,
  body: (context: AccountCleanupContext) => Promise<A>,
): Promise<A> =>
  withCleanup(async (cleanup) => {
    const referenceId = ownedName("account", scenario);
    const locator = { kind: "account" as const, value: referenceId };
    let id: string | undefined;
    let terminal = false;

    cleanup.add(`account ${referenceId}`, async () => {
      if (terminal) return;
      const recovered = id
        ? { id }
        : await reconcileOwnedId(locator, (candidate) =>
            findOwnedResourceId(candidate, testRunId),
          );
      if (!recovered) return;
      try {
        await runLiveEffect(
          redactAnAccount({
            accountId: recovered.id,
            idempotencyKey: idempotencyKey("redact-account", scenario),
            personaVersion: PERSONA_VERSION,
          }),
        );
      } catch (error) {
        if (!(error instanceof SafeApiError && error._tag === "NotFound")) {
          throw error;
        }
      }
    });

    return body({
      referenceId,
      registerCreatedId: (createdId) => {
        id = createdId;
      },
      markTerminal: () => {
        terminal = true;
      },
    });
  });

export const withOwnedAccount = async <A>(
  scenario: string,
  body: (account: OwnedAccount) => Promise<A>,
): Promise<A> =>
  withAccountCleanup(scenario, async (context) => {
    const created = await runLiveEffect(
      createAnAccount({
        idempotencyKey: idempotencyKey("create-account", scenario),
        personaVersion: PERSONA_VERSION,
        data: {
          attributes: {
            "reference-id": context.referenceId,
            "name-first": syntheticIdentity.firstName,
            "name-last": syntheticIdentity.lastName,
          },
        },
      }),
    );
    const id = created.data.id;
    if (!id) throw new Error("Persona created an account without an id");
    context.registerCreatedId(id);
    return body({
      id,
      referenceId: context.referenceId,
      markTerminal: context.markTerminal,
    });
  });
