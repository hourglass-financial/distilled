import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { listEvents } from "../src/operations/listEvents.ts";
import { runEffect } from "./setup.ts";

describe("listEvents", () => {
  describe("happy path", () => {
    it("returns a paginated list of events", async () => {
      const result = await runEffect(listEvents({ page_size: 5 }));
      expect(Array.isArray(result.data)).toBe(true);
      expect(typeof result.has_more).toBe("boolean");
      expect(typeof result.page_size).toBe("number");
      expect(result.page_size).toBeLessThanOrEqual(5);
      for (const event of result.data) {
        expect(event.type).toBe("EVENT");
        expect(typeof event.id).toBe("string");
        expect(typeof event.event_type).toBe("string");
        expect(typeof event.api_version).toBe("string");
      }
    }, 30_000);
  });

  describe("errors", () => {
    it("returns Unauthorized when credentials are invalid", async () => {
      const BadCreds = Layer.succeed(Credentials, {
        apiKey: Redacted.make("not-a-real-key"),
        apiBaseUrl: DEFAULT_API_BASE_URL,
      });
      const error = await Effect.runPromise(
        listEvents({ page_size: 1 }).pipe(
          Effect.flip,
          Effect.provide(Layer.merge(BadCreds, FetchHttpClient.layer)),
        ),
      );
      expect(error._tag).toBe("Unauthorized");
    }, 30_000);

    it("returns BadRequest for an invalid page_size", async () => {
      const error = await runEffect(
        listEvents({ page_size: -1 }).pipe(Effect.flip),
      );
      expect(error._tag).toBe("BadRequest");
    }, 30_000);
  });
});
