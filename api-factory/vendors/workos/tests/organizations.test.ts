import { organizations } from "@hourglass-financial/api-factory-workos";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { describe, expect, it } from "vitest";
import { hasCredentials, run, testRunId } from "./setup.ts";

describe("organizations (live)", () => {
  it.skipIf(!hasCredentials)(
    "creates, fetches, and deletes an organization",
    async () => {
      const name = `distilled-af-orgs-${testRunId}`;
      const created = await run(
        Effect.gen(function* () {
          const org = yield* organizations.create({ name });
          // Fetch, then always clean up — even if the fetch/assertions throw.
          const fetched = yield* organizations
            .get({ id: org.id })
            .pipe(
              Effect.ensuring(
                organizations.remove({ id: org.id }).pipe(Effect.ignore),
              ),
            );
          return { org, fetched };
        }),
      );

      expect(created.org.id).toMatch(/^org_/);
      expect(created.org.name).toBe(name);
      expect(created.fetched.id).toBe(created.org.id);
    },
    30_000,
  );

  it.skipIf(!hasCredentials)(
    "returns a typed NotFound for a missing organization",
    async () => {
      const error = await run(
        organizations
          .get({ id: "org_does_not_exist_00000000" })
          .pipe(Effect.flip),
      );
      expect(error._tag).toBe("NotFound");
    },
    30_000,
  );

  it.skipIf(!hasCredentials)(
    "lists a page and streams items with the cursor helper",
    async () => {
      const { page, streamed } = await run(
        Effect.gen(function* () {
          const page = yield* organizations.list({ limit: 5 });
          const streamed = yield* Stream.runCollect(
            organizations.listItems({ limit: 5 }).pipe(Stream.take(5)),
          );
          return { page, streamed };
        }),
      );
      expect(page.object).toBe("list");
      expect(Array.isArray(page.data)).toBe(true);
      expect(streamed.length).toBeLessThanOrEqual(5);
    },
    30_000,
  );
});
