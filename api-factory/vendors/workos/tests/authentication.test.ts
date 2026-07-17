import { userManagement } from "@hourglass-financial/api-factory-workos";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import { describe, expect, it } from "vitest";
import { hasAuthKitClient, run } from "./setup.ts";

describe("userManagement.authenticateWithPassword (live)", () => {
  it.skipIf(!hasAuthKitClient)(
    "rejects bogus credentials with a typed authentication error",
    async () => {
      const error = await run(
        userManagement
          .authenticateWithPassword({
            client_id: process.env.WORKOS_CLIENT_ID!,
            client_secret: Redacted.make(process.env.WORKOS_API_KEY!),
            email: "definitely-not-a-real-user@example.invalid",
            password: Redacted.make("not-a-real-password"),
          })
          .pipe(Effect.flip),
      );

      // The exact code varies by workspace configuration, but it must be one of
      // our distinct typed authentication errors — never an opaque BadRequest.
      expect([
        "InvalidCredentials",
        "InvalidGrant",
        "EmailVerificationRequired",
        "Unauthorized",
        "UnprocessableEntity",
      ]).toContain(error._tag);
    },
    30_000,
  );
});
