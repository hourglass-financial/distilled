import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { createAGraphQuery } from "../src/operations/createAGraphQuery.ts";
import { runEffectWithInvalidCredentials } from "./setup.ts";

const input = {
  data: {
    attributes: {
      "graph-query-template-id": "graph_query_template_id_distilled_missing",
    },
  },
  personaVersion: "2025-12-08",
  idempotencyKey: "distilled-persona-createAGraphQuery",
} as any;

describe("createAGraphQuery", () => {
  describe("errors", () => {
    it("invalid API key -> Unauthorized", async () => {
      const error = await runEffectWithInvalidCredentials(
        createAGraphQuery(input).pipe(Effect.flip),
      );

      expect(error._tag).toBe("Unauthorized");
    }, 30_000);
  });
});
