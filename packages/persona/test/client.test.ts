import { Effect } from "effect";
import { beforeAll, describe, expect, it } from "vitest";
import { listAllAccounts } from "../src/operations/listAllAccounts.ts";
import { PERSONA_VERSION } from "./fixtures.ts";
import { runLiveEffect } from "./safe-run.ts";
import { beginLiveTestRun, runEffectWithInvalidCredentials } from "./setup.ts";

describe("Persona client authentication", () => {
  beforeAll(beginLiveTestRun);

  it("maps an invalid credential to Unauthorized", async () => {
    const error = await runEffectWithInvalidCredentials(
      listAllAccounts({
        page: { size: 1 },
        personaVersion: PERSONA_VERSION,
      }).pipe(Effect.flip),
    );
    expect(error._tag).toBe("Unauthorized");
  }, 30_000);

  it("accepts the configured sandbox credential on the same endpoint", async () => {
    const result = await runLiveEffect(
      listAllAccounts({
        page: { size: 1 },
        personaVersion: PERSONA_VERSION,
      }),
    );
    expect(Array.isArray(result.data)).toBe(true);
  }, 30_000);
});
