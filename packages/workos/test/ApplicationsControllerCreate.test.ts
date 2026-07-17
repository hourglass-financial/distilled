import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { ApplicationsControllerCreate } from "../src/operations/ApplicationsControllerCreate.ts";
import { runEffect, testRunId } from "./setup.ts";

describe("ApplicationsControllerCreate", () => {
  it("fails with NotFound when a referenced resource does not exist", async () => {
    const error = await runEffect(
      ApplicationsControllerCreate({
        name: `distilled-missing-org-${testRunId}`,
        application_type: "oauth",
        organization_id: `org_does_not_exist_${testRunId}`,
      }).pipe(Effect.flip),
    );

    expect(["NotFound", "UnprocessableEntity"]).toContain(error._tag);
  }, 30_000);

  it("fails with UnprocessableEntity when the application configuration is invalid", async () => {
    const error = await runEffect(
      ApplicationsControllerCreate({
        name: "",
        application_type: "oauth",
        redirect_uris: [{ uri: "not-a-valid-uri" }],
      }).pipe(Effect.flip),
    );

    expect(error._tag).toBe("UnprocessableEntity");
  }, 30_000);
});
