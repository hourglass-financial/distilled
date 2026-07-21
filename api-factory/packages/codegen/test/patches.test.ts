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
type MutableJsonObject = Record<string, JsonValue>;

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

const structuralDocument: JsonValue = {
  ...document,
  paths: {
    "/things": {
      post: {
        operationId: "createThing",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { name: { type: "string" } },
                required: ["name"],
              },
            },
          },
        },
        responses: { "200": { description: "ok" } },
      },
    },
  },
  components: {
    schemas: {
      Free: { type: "object", description: "Labels by name." },
      Patterned: {
        type: "object",
        patternProperties: { "^x-": { type: "string" } },
      },
      Choice: {
        description: "The upstream alternatives.",
        oneOf: [
          {
            type: "object",
            properties: { id: { type: "string" } },
            required: ["id"],
          },
          {
            type: "object",
            properties: {
              id: { type: "string" },
              audience: { type: "string" },
            },
            required: ["id"],
          },
        ],
      },
      Composite: {
        description: "The flattened object.",
        allOf: [
          {
            type: "object",
            properties: {
              id: { type: "string" },
              shared: { type: "boolean" },
            },
            required: ["id", "shared"],
          },
          {
            type: "object",
            properties: {
              name: { type: "string" },
              shared: { type: "boolean" },
            },
            required: ["shared", "name"],
          },
        ],
      },
    },
  },
};

const structuralEntry = (
  id: string,
  fields: JsonObject,
  target: string,
  before: JsonValue,
) =>
  decode(
    patchEntry(id, {
      ...fields,
      precondition: { pointer: target, test: before },
    }),
  );

describe("inline-extract", () => {
  const target =
    "/paths/~1things/post/requestBody/content/application~1json/schema";
  const before = getAtPointer(structuralDocument, target)!;
  const entry = () =>
    structuralEntry(
      "020-inline",
      { kind: "inline-extract", target, componentName: "CreateThingInput" },
      target,
      before,
    );

  it("extracts an allowed inline schema verbatim and reconstructs its redundant post-state", () => {
    const applied = evaluateEntry(structuralDocument, entry());
    expect(applied.classification).toBe("still_needed");
    expect(getAtPointer(applied.result!, target)).toEqual({
      $ref: "#/components/schemas/CreateThingInput",
    });
    expect(
      getAtPointer(applied.result!, "/components/schemas/CreateThingInput"),
    ).toEqual(before);
    expect(evaluateEntry(applied.result!, entry()).classification).toBe(
      "redundant",
    );
  });

  it("classifies an absent target as stale", () => {
    expect(
      evaluateEntry(
        structuralDocument,
        structuralEntry(
          "021-inline-stale",
          {
            kind: "inline-extract",
            target:
              "/paths/~1missing/post/requestBody/content/application~1json/schema",
            componentName: "MissingInput",
          },
          "/paths/~1missing/post/requestBody/content/application~1json/schema",
          before,
        ),
      ).classification,
    ).toBe("stale");
  });

  it("rejects a conflicting component name", () => {
    const conflicted = JSON.parse(
      JSON.stringify(structuralDocument),
    ) as JsonObject;
    ((conflicted["components"] as JsonObject)["schemas"] as MutableJsonObject)[
      "CreateThingInput"
    ] = { type: "string" };
    expect(evaluateEntry(conflicted, entry()).classification).toBe("conflict");
  });

  it("rejects a $ref carrying sibling keys", () => {
    const conflicted = JSON.parse(
      JSON.stringify(structuralDocument),
    ) as JsonObject;
    (
      ((conflicted["paths"] as JsonObject)["/things"] as JsonObject)[
        "post"
      ] as MutableJsonObject
    )["requestBody"] = {
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/Thing",
            description: "A forbidden sibling.",
          },
        },
      },
    };
    expect(evaluateEntry(conflicted, entry()).classification).toBe(
      "unsupported",
    );
  });

  it("uses the mandatory precondition to reject changed inline input", () => {
    const changed = JSON.parse(
      JSON.stringify(structuralDocument),
    ) as JsonObject;
    const schema = getAtPointer(changed, target) as MutableJsonObject;
    schema["required"] = [];
    expect(evaluateEntry(changed, entry()).classification).toBe("conflict");
  });
});

describe("union-collapse", () => {
  const target = "/components/schemas/Choice";
  const before = getAtPointer(structuralDocument, target)!;
  const entry = (keep = 1) =>
    structuralEntry(
      "030-union",
      { kind: "union-collapse", target, keep },
      target,
      before,
    );

  it("keeps one union member verbatim and discards host prose", () => {
    const applied = evaluateEntry(structuralDocument, entry());
    expect(applied.classification).toBe("still_needed");
    expect(getAtPointer(applied.result!, target)).toEqual(
      ((before as JsonObject)["oneOf"] as ReadonlyArray<JsonValue>)[1],
    );
    expect(evaluateEntry(applied.result!, entry()).classification).toBe(
      "redundant",
    );
  });

  it("classifies an absent target as stale", () => {
    const stale = structuralEntry(
      "031-union-stale",
      {
        kind: "union-collapse",
        target: "/components/schemas/Missing",
        keep: 0,
      },
      "/components/schemas/Missing",
      before,
    );
    expect(evaluateEntry(structuralDocument, stale).classification).toBe(
      "stale",
    );
  });

  it("rejects an out-of-range kept-member index", () => {
    expect(evaluateEntry(structuralDocument, entry(2)).classification).toBe(
      "unsupported",
    );
  });

  it("rejects union hosts with sibling shape keywords", () => {
    const changed = JSON.parse(
      JSON.stringify(structuralDocument),
    ) as JsonObject;
    (getAtPointer(changed, target) as MutableJsonObject)["type"] = "object";
    expect(evaluateEntry(changed, entry()).classification).toBe("unsupported");
  });

  it("uses the mandatory precondition to detect changed union members", () => {
    const changed = JSON.parse(
      JSON.stringify(structuralDocument),
    ) as JsonObject;
    const union = (getAtPointer(changed, target) as JsonObject)[
      "oneOf"
    ] as MutableJsonObject[];
    union[1]!["required"] = ["id", "audience"];
    expect(evaluateEntry(changed, entry()).classification).toBe("conflict");
  });
});

describe("allof-flatten", () => {
  const target = "/components/schemas/Composite";
  const before = getAtPointer(structuralDocument, target)!;
  const entry = () =>
    structuralEntry(
      "040-allof",
      { kind: "allof-flatten", target },
      target,
      before,
    );

  it("merges inline object members left-to-right", () => {
    const applied = evaluateEntry(structuralDocument, entry());
    expect(applied.classification).toBe("still_needed");
    expect(getAtPointer(applied.result!, target)).toEqual({
      type: "object",
      description: "The flattened object.",
      properties: {
        id: { type: "string" },
        shared: { type: "boolean" },
        name: { type: "string" },
      },
      required: ["id", "shared", "name"],
    });
    expect(evaluateEntry(applied.result!, entry()).classification).toBe(
      "redundant",
    );
  });

  it("classifies an absent target as stale", () => {
    const stale = structuralEntry(
      "041-allof-stale",
      { kind: "allof-flatten", target: "/components/schemas/Missing" },
      "/components/schemas/Missing",
      before,
    );
    expect(evaluateEntry(structuralDocument, stale).classification).toBe(
      "stale",
    );
  });

  it("rejects allOf hosts with sibling shape keywords", () => {
    const changed = JSON.parse(
      JSON.stringify(structuralDocument),
    ) as JsonObject;
    (getAtPointer(changed, target) as MutableJsonObject)["type"] = "object";
    expect(evaluateEntry(changed, entry()).classification).toBe("unsupported");
  });

  it("rejects non-identical property collisions", () => {
    const changed = JSON.parse(
      JSON.stringify(structuralDocument),
    ) as JsonObject;
    const members = (getAtPointer(changed, target) as JsonObject)[
      "allOf"
    ] as MutableJsonObject[];
    ((members[1]!["properties"] as JsonObject)["shared"] as MutableJsonObject)[
      "type"
    ] = "string";
    const changedEntry = structuralEntry(
      "042-allof-collision",
      { kind: "allof-flatten", target },
      target,
      getAtPointer(changed, target)!,
    );
    expect(evaluateEntry(changed, changedEntry).classification).toBe(
      "conflict",
    );
  });

  it("rejects $ref members", () => {
    const changed = JSON.parse(
      JSON.stringify(structuralDocument),
    ) as JsonObject;
    (getAtPointer(changed, target) as MutableJsonObject)["allOf"] = [
      { $ref: "#/components/schemas/Thing" },
    ];
    const changedEntry = structuralEntry(
      "043-allof-ref",
      { kind: "allof-flatten", target },
      target,
      getAtPointer(changed, target)!,
    );
    expect(evaluateEntry(changed, changedEntry).classification).toBe(
      "unsupported",
    );
  });
});

describe("record-shape", () => {
  const target = "/components/schemas/Free";
  const before = getAtPointer(structuralDocument, target)!;
  const entry = () =>
    structuralEntry(
      "050-record",
      { kind: "record-shape", target, valueSchema: { type: "string" } },
      target,
      before,
    );

  it("converts a free-form object to a typed record", () => {
    const applied = evaluateEntry(structuralDocument, entry());
    expect(applied.classification).toBe("still_needed");
    expect(getAtPointer(applied.result!, target)).toEqual({
      type: "object",
      description: "Labels by name.",
      additionalProperties: { type: "string" },
    });
    expect(evaluateEntry(applied.result!, entry()).classification).toBe(
      "redundant",
    );
  });

  it("converts patternProperties and removes the pattern map", () => {
    const patternTarget = "/components/schemas/Patterned";
    const applied = evaluateEntry(
      structuralDocument,
      structuralEntry(
        "051-record-pattern",
        {
          kind: "record-shape",
          target: patternTarget,
          valueSchema: { type: "string" },
        },
        patternTarget,
        getAtPointer(structuralDocument, patternTarget)!,
      ),
    );
    expect(applied.classification).toBe("still_needed");
    expect(getAtPointer(applied.result!, patternTarget)).toEqual({
      type: "object",
      additionalProperties: { type: "string" },
    });
  });

  it("classifies an absent target as stale", () => {
    const stale = structuralEntry(
      "052-record-stale",
      {
        kind: "record-shape",
        target: "/components/schemas/Missing",
        valueSchema: { type: "string" },
      },
      "/components/schemas/Missing",
      before,
    );
    expect(evaluateEntry(structuralDocument, stale).classification).toBe(
      "stale",
    );
  });

  it("rejects record hosts carrying properties siblings", () => {
    const changed = JSON.parse(
      JSON.stringify(structuralDocument),
    ) as JsonObject;
    (getAtPointer(changed, target) as MutableJsonObject)["properties"] = {};
    expect(evaluateEntry(changed, entry()).classification).toBe("unsupported");
  });

  it("uses the mandatory precondition to detect a changed free-form host", () => {
    const changed = JSON.parse(
      JSON.stringify(structuralDocument),
    ) as JsonObject;
    (getAtPointer(changed, target) as MutableJsonObject)["description"] =
      "Changed upstream.";
    expect(evaluateEntry(changed, entry()).classification).toBe("conflict");
  });
});
