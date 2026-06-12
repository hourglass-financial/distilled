import { Effect, Redacted } from "effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import { describe, expect, it } from "vitest";
import { Credentials, DEFAULT_API_BASE_URL } from "../src/credentials.ts";
import { listOutboundInternationalWireTransfers } from "../src/operations/listOutboundInternationalWireTransfers.ts";
import { simulateInternationalWireOutReturn } from "../src/operations/simulateInternationalWireOutReturn.ts";
import { runEffect, unknownId } from "./setup.ts";

describe("simulateInternationalWireOutReturn", () => {
  describe("happy path", () => {
    it("simulates a return on a settled outbound international wire transfer", async () => {
      const list = await runEffect(
        listOutboundInternationalWireTransfers({
          page_size: 100,
          status: "SETTLED",
        }),
      );
      const settled = list.data.find((t) => t.status === "SETTLED");
      if (!settled) return;
      const result = await runEffect(
        simulateInternationalWireOutReturn({ id: settled.id }),
      );
      expect(result.international_wire_out_id).toBe(settled.id);
    }, 30_000);
  });

  describe("errors", () => {
    it("returns Unauthorized when credentials are invalid", async () => {
      const BadCreds = Layer.succeed(Credentials, {
        apiKey: Redacted.make("not-a-real-key"),
        apiBaseUrl: DEFAULT_API_BASE_URL,
      });
      const error = await Effect.runPromise(
        simulateInternationalWireOutReturn({
          id: unknownId("intl_wire_out"),
        }).pipe(
          Effect.flip,
          Effect.provide(Layer.merge(BadCreds, FetchHttpClient.layer)),
        ),
      );
      expect(error._tag).toBe("Unauthorized");
    }, 30_000);

    it("returns NotFound for a non-existent id", async () => {
      const error = await runEffect(
        simulateInternationalWireOutReturn({
          id: unknownId("intl_wire_out"),
        }).pipe(Effect.flip),
      );
      expect(error._tag).toBe("NotFound");
    }, 30_000);

    it("returns BadRequest for a malformed id", async () => {
      const error = await runEffect(
        simulateInternationalWireOutReturn({ id: "!!!invalid!!!" }).pipe(
          Effect.flip,
        ),
      );
      expect(error._tag).toBe("BadRequest");
    }, 30_000);

    it("returns Conflict when the transfer is not in SETTLED status", async () => {
      const list = await runEffect(
        listOutboundInternationalWireTransfers({ page_size: 100 }),
      );
      const nonSettled = list.data.find((t) => t.status !== "SETTLED");
      if (!nonSettled) return;
      const error = await runEffect(
        simulateInternationalWireOutReturn({ id: nonSettled.id }).pipe(
          Effect.flip,
        ),
      );
      expect(error._tag).toBe("Conflict");
    }, 30_000);
  });
});
