import { describe, expect, it } from "vitest";
import {
  applyPatchesReconciling,
  applyPatchesStrict,
  CodegenError,
  decodePatchEntry,
  evaluateEntry,
  getAtPointer,
  type JsonObject,
  type JsonValue,
} from "../src/index.ts";
import { patchEntry } from "./fixtures/openapi.ts";

const document: JsonValue = {
  openapi: "3.1.0",
  paths: {
    "/things": {
      post: {
        operationId: "createThing",
        requestBody: {
          content: {
            "application/x-www-form-urlencoded": {
              schema: { type: "object", properties: {} },
            },
          },
        },
        responses: {
          "200": { description: "ok" },
        },
      },
    },
  },
  components: {
    schemas: {
      Thing: {
        type: "object",
        properties: {
          id: { type: "string" },
          token: { type: "string" },
        },
        required: ["id", "token"],
      },
      Dead: { type: "object", properties: {} },
    },
  },
};

const decode = (raw: JsonValue) => decodePatchEntry(raw, "test");

describe("patch kinds — single-semantics evaluation", () => {
  it("injects an error response and refuses double-application", () => {
    const entry = decode(
      patchEntry("001-conflict", {
        kind: "error-response-injection",
        operationPath: "/paths/~1things/post",
        status: "409",
        response: { description: "Conflict." },
        precondition: {
          pointer: "/paths/~1things/post/responses/409",
          absent: true,
        },
      }),
    );
    const first = evaluateEntry(document, entry);
    expect(first.classification).toBe("still_needed");
    expect(
      getAtPointer(first.result!, "/paths/~1things/post/responses/409"),
    ).toEqual({ description: "Conflict." });
    expect(evaluateEntry(first.result!, entry).classification).toBe(
      "redundant",
    );
  });

  it("marks a string schema sensitive exactly once", () => {
    const entry = decode(
      patchEntry("002-token-secret", {
        kind: "sensitive-marking",
        schemaPath: "/components/schemas/Thing/properties/token",
        precondition: {
          pointer: "/components/schemas/Thing/properties/token",
          test: { type: "string" },
        },
      }),
    );
    const result = evaluateEntry(document, entry);
    expect(result.classification).toBe("still_needed");
    expect(
      getAtPointer(
        result.result!,
        "/components/schemas/Thing/properties/token/format",
      ),
    ).toBe("password");
    expect(evaluateEntry(result.result!, entry).classification).toBe(
      "redundant",
    );
  });

  it("moves a media type and detects the adopted state", () => {
    const entry = decode(
      patchEntry("003-json-body", {
        kind: "media-type-fix",
        contentPath: "/paths/~1things/post/requestBody/content",
        from: "application/x-www-form-urlencoded",
        to: "application/json",
        precondition: {
          pointer: "/paths/~1things/post/requestBody/content/application~1json",
          absent: true,
        },
      }),
    );
    const result = evaluateEntry(document, entry);
    expect(result.classification).toBe("still_needed");
    expect(
      getAtPointer(
        result.result!,
        "/paths/~1things/post/requestBody/content/application~1json/schema/type",
      ),
    ).toBe("object");
    expect(evaluateEntry(result.result!, entry).classification).toBe(
      "redundant",
    );
  });

  it("relaxes a single required entry, never the whole array", () => {
    const entry = decode(
      patchEntry("004-relax-token", {
        kind: "required-relaxation",
        schemaPath: "/components/schemas/Thing",
        property: "token",
        precondition: {
          pointer: "/components/schemas/Thing/required",
          test: ["id", "token"],
        },
      }),
    );
    const result = evaluateEntry(document, entry);
    expect(result.classification).toBe("still_needed");
    expect(
      getAtPointer(result.result!, "/components/schemas/Thing/required"),
    ).toEqual(["id"]);
    expect(evaluateEntry(result.result!, entry).classification).toBe(
      "redundant",
    );
  });

  it("prunes a subtree and treats an already-gone target as redundant", () => {
    const entry = decode(
      patchEntry("005-prune-dead", {
        kind: "spec-pruning",
        target: "/components/schemas/Dead",
        precondition: {
          pointer: "/components/schemas/Dead",
          test: { type: "object", properties: {} },
        },
      }),
    );
    const result = evaluateEntry(document, entry);
    expect(result.classification).toBe("still_needed");
    expect(
      getAtPointer(result.result!, "/components/schemas/Dead"),
    ).toBeUndefined();
    expect(evaluateEntry(result.result!, entry).classification).toBe(
      "redundant",
    );
  });

  it("classifies a failed precondition as conflict and a vanished target as stale", () => {
    const conflicted = decode(
      patchEntry("006-conflict", {
        kind: "required-relaxation",
        schemaPath: "/components/schemas/Thing",
        property: "token",
        precondition: {
          pointer: "/components/schemas/Thing/required",
          test: ["token"],
        },
      }),
    );
    expect(evaluateEntry(document, conflicted).classification).toBe("conflict");
    const stale = decode(
      patchEntry("007-stale", {
        kind: "sensitive-marking",
        schemaPath: "/components/schemas/Vanished/properties/x",
      }),
    );
    expect(evaluateEntry(document, stale).classification).toBe("stale");
  });

  it("applies the raw hatch with test guards and rejects move/copy at decode", () => {
    const raw = decode(
      patchEntry("008-raw", {
        kind: "raw",
        ops: [
          { op: "test", path: "/openapi", value: "3.1.0" },
          {
            op: "replace",
            path: "/components/schemas/Thing/properties/id",
            value: { type: "string", format: "uuid" },
          },
        ],
      }),
    );
    const result = evaluateEntry(document, raw);
    expect(result.classification).toBe("still_needed");
    expect(
      getAtPointer(
        result.result!,
        "/components/schemas/Thing/properties/id/format",
      ),
    ).toBe("uuid");
    expect(() =>
      decode(
        patchEntry("009-move", {
          kind: "raw",
          ops: [{ op: "move", from: "/a", path: "/b" }],
        }),
      ),
    ).toThrow(CodegenError);
  });

  it("evaluates raw ops strictly in sequence (a test guards the state before it)", () => {
    const sequenced = (expected: string) =>
      decode(
        patchEntry("011-sequenced", {
          kind: "raw",
          ops: [
            { op: "replace", path: "/openapi", value: "3.1.9" },
            { op: "test", path: "/openapi", value: expected },
          ],
        }),
      );
    expect(evaluateEntry(document, sequenced("3.1.9")).classification).toBe(
      "still_needed",
    );
    expect(evaluateEntry(document, sequenced("3.1.0")).classification).toBe(
      "conflict",
    );
  });

  it("requires the full structured envelope at decode time", () => {
    const complete = patchEntry("010-full", {
      kind: "spec-pruning",
      target: "/components/schemas/Dead",
    }) as JsonObject;
    for (const missing of [
      "precondition",
      "blastRadius",
      "provenance",
      "rationale",
    ]) {
      const { [missing]: _dropped, ...partial } = complete;
      expect(() => decode(partial), `missing ${missing}`).toThrow(CodegenError);
    }
    const provenance = complete["provenance"] as JsonObject;
    const { evidence: _evidence, ...withoutEvidence } = {
      ...provenance,
      evidenceType: "live-probe",
      endpoint: "POST /things",
      capturedAt: "2026-07-19",
      evidence: "evidence/things-409.json",
    };
    expect(() => decode({ ...complete, provenance: withoutEvidence })).toThrow(
      CodegenError,
    );
  });
});

describe("patch application modes", () => {
  it("strict application aborts on the first non-applying entry, naming it", () => {
    const good = decode(
      patchEntry("001-good", {
        kind: "spec-pruning",
        target: "/components/schemas/Dead",
      }),
    );
    const bad = decode(
      patchEntry("002-bad", {
        kind: "spec-pruning",
        target: "/components/schemas/Missing",
      }),
    );
    try {
      applyPatchesStrict(document, [good, bad]);
      throw new Error("expected strict application to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(CodegenError);
      expect((error as CodegenError).message).toContain("patch 002-bad");
      expect((error as CodegenError).message).toContain("redundant");
    }
  });

  it("reconciliation applies what it can and reports the rest against the incrementally-patched document", () => {
    const inject = decode(
      patchEntry("001-inject", {
        kind: "error-response-injection",
        operationPath: "/paths/~1things/post",
        status: "409",
        response: { description: "Conflict." },
        precondition: {
          pointer: "/paths/~1things/post/responses/409",
          absent: true,
        },
      }),
    );
    const duplicate = decode(
      patchEntry("002-duplicate", {
        kind: "error-response-injection",
        operationPath: "/paths/~1things/post",
        status: "409",
        response: { description: "Conflict." },
        precondition: {
          pointer: "/paths/~1things/post/responses/409",
          absent: true,
        },
      }),
    );
    const stale = decode(
      patchEntry("003-stale", {
        kind: "sensitive-marking",
        schemaPath: "/components/schemas/Vanished/properties/x",
        provenance: {
          evidenceType: "vendor-docs-citation",
          url: "https://docs.example.test",
          fetchedAt: "2026-07-19",
          observed: "o",
          specd: "s",
          authoredAgainstSpecHash: "sha256-current",
          reporter: "r",
        },
      }),
    );
    const report = applyPatchesReconciling(
      document,
      [inject, duplicate, stale],
      "sha256-current",
    );
    expect(report.clean).toBe(false);
    expect(
      report.entries.map((entry) => [entry.id, entry.classification]),
    ).toEqual([
      ["001-inject", "still_needed"],
      ["002-duplicate", "redundant"],
      ["003-stale", "stale"],
    ]);
    expect(report.entries[0]!.authoredAgainstCurrent).toBe(false);
    expect(report.entries[2]!.authoredAgainstCurrent).toBe(true);
    expect(
      getAtPointer(report.document, "/paths/~1things/post/responses/409"),
    ).toEqual({ description: "Conflict." });
  });
});
