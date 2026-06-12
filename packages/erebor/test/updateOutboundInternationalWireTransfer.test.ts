import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { listOutboundInternationalWireTransfers } from "../src/operations/listOutboundInternationalWireTransfers.ts";
import { updateOutboundInternationalWireTransfer } from "../src/operations/updateOutboundInternationalWireTransfer.ts";
import { runEffect, testRunId, unknownId } from "./setup.ts";

describe("updateOutboundInternationalWireTransfer", () => {
  describe("happy path", () => {
    it("patches custom_ref and custom_fields on an existing outbound international wire transfer", async () => {
      const list = await runEffect(
        listOutboundInternationalWireTransfers({ page_size: 1 }),
      );
      if (list.data.length === 0) return;
      const target = list.data[0]!;
      const newRef = `distilled-erebor-${testRunId}`;
      const newFields = { test_run_id: testRunId, source: "distilled" };
      const result = await runEffect(
        updateOutboundInternationalWireTransfer({
          id: target.id,
          custom_ref: newRef,
          custom_fields: newFields,
        }),
      );
      expect(result.type).toBe("INTERNATIONAL_WIRE_OUT");
      expect(result.id).toBe(target.id);
      expect(result.custom_ref).toBe(newRef);
      expect(result.custom_fields).toMatchObject(newFields);
    }, 30_000);
  });

  describe("errors", () => {
    it("returns Unauthorized when credentials are invalid", async () => {
      const BadCreds = Layer.succeed(Credentials, {
        apiKey: Redacted.make("not-a-real-key"),
        apiBaseUrl: DEFAULT_API_BASE_URL,
      });
      const error = await Effect.runPromise(
        updateOutboundInternationalWireTransfer({
          id: unknownId("international_wire_out"),
          custom_ref: `distilled-erebor-${testRunId}`,
        }).pipe(
          Effect.flip,
          Effect.provide(Layer.merge(BadCreds, FetchHttpClient.layer)),
        ),
      );
      expect(error._tag).toBe("Unauthorized");
    }, 30_000);

    it("returns NotFound for a non-existent id", async () => {
      const error = await runEffect(
        updateOutboundInternationalWireTransfer({
          id: unknownId("international_wire_out"),
          custom_ref: `distilled-erebor-${testRunId}`,
        }).pipe(Effect.flip),
      );
      expect(error._tag).toBe("NotFound");
    }, 30_000);

    it("returns BadRequest for a malformed id", async () => {
      const error = await runEffect(
        updateOutboundInternationalWireTransfer({
          id: "!!!invalid!!!",
          custom_ref: `distilled-erebor-${testRunId}`,
        }).pipe(Effect.flip),
      );
      expect(error._tag).toBe("BadRequest");
    }, 30_000);
  });
});
