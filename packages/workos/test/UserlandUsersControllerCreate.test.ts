import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { UserlandUsersControllerCreate } from "../src/operations/UserlandUsersControllerCreate.ts";
import { UserlandUsersControllerDelete } from "../src/operations/UserlandUsersControllerDelete.ts";
import { runEffect, testRunId } from "./setup.ts";

const typedErrorTags = [
  "BadRequest",
  "NotFound",
  "UnprocessableEntity",
] as const;

describe("UserlandUsersControllerCreate", () => {
  it("creates and cleans up a user", async () => {
    const result = await runEffect(
      Effect.gen(function* () {
        const user = yield* UserlandUsersControllerCreate({
          email: `distilled-user-create-${testRunId}@example.com`,
        });
        return yield* Effect.succeed(user).pipe(
          Effect.ensuring(
            user.id
              ? UserlandUsersControllerDelete({ id: user.id }).pipe(
                  Effect.ignore,
                )
              : Effect.void,
          ),
        );
      }),
    );

    expect(result).toBeDefined();
    expect(typeof result.id).toBe("string");
    expect(typeof result.email).toBe("string");
    expect(typeof result.email_verified).toBe("boolean");
    expect(typeof result.created_at).toBe("string");
    expect(typeof result.updated_at).toBe("string");
  }, 30_000);

  it("fails with a typed error for an invalid email", async () => {
    const error = await runEffect(
      UserlandUsersControllerCreate({
        email: `not-an-email-${testRunId}`,
      }).pipe(Effect.flip),
    );
    expect(typedErrorTags).toContain(error._tag);
  }, 30_000);
});
