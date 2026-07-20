import { describe, expect, it } from "vitest";
import {
  canonicalize,
  checkInvariants,
  CodegenError,
  decodeVendorConfig,
  normalizeOpenApi,
  type JsonObject,
  type JsonValue,
} from "../src/index.ts";
import { minimalFixture } from "./fixtures/minimal.ts";
import {
  bastionConfig,
  bastionSpec,
  northstarConfig,
  northstarSpec,
  orbitConfig,
  orbitSpec,
} from "./fixtures/openapi.ts";
import { paginationFixture } from "./fixtures/pagination.ts";

const normalize = (spec: JsonValue, config: JsonValue) =>
  normalizeOpenApi(spec, decodeVendorConfig(config));

const expectViolation = (
  fn: () => unknown,
  rule: string,
  constructFragment: string,
): void => {
  try {
    fn();
    throw new Error(`expected a CodegenError with rule ${rule}`);
  } catch (error) {
    expect(error).toBeInstanceOf(CodegenError);
    const violations = (error as CodegenError).violations;
    const match = violations.find(
      (violation) =>
        violation.rule === rule &&
        violation.construct.includes(constructFragment),
    );
    expect(
      match,
      `no violation [${rule}] naming ${JSON.stringify(constructFragment)} in:\n${(error as CodegenError).message}`,
    ).toBeDefined();
  }
};

const patchSpec = (
  spec: JsonValue,
  patch: (draft: JsonObject) => void,
): JsonValue => {
  const draft = JSON.parse(JSON.stringify(spec)) as JsonObject;
  patch(draft);
  return draft;
};

describe("OpenAPI frontend normalization", () => {
  it("normalizes the northstar spec to the minimal engine fixture", () => {
    const ir = canonicalize(normalize(northstarSpec, northstarConfig));
    checkInvariants(ir);
    expect(ir).toEqual(
      canonicalize({
        ...minimalFixture,
        configErrorMessage:
          "Northstar credentials are not configured (set NORTHSTAR_API_KEY).",
      }),
    );
  });

  it("normalizes the orbit spec to the pagination engine fixture", () => {
    const ir = canonicalize(normalize(orbitSpec, orbitConfig));
    checkInvariants(ir);
    expect(ir).toEqual(
      canonicalize({
        ...paginationFixture,
        configErrorMessage:
          "Orbit credentials are not configured (set ORBIT_API_KEY).",
      }),
    );
  });

  it("lifts discriminated error tables, secrets, and constant bodies", () => {
    const ir = canonicalize(normalize(bastionSpec, bastionConfig));
    checkInvariants(ir);
    const op = ir.resources[0]!.operations[0]!;
    expect(op.publicName).toEqual({
      resource: "sessions",
      method: "authenticate",
    });
    expect(op.inputName).toBe("AuthenticateSessionInput");
    expect(op.constantBody).toEqual({
      grant_type: "password",
      interactive: true,
    });
    expect(op.errors).toEqual([
      "AlphaChallenge",
      "InvalidToken",
      "NotFound",
      "TooManyRequests",
    ]);
    expect(op.errorsDocs).toBe(
      "The endpoint returns typed discriminator errors.",
    );
    expect(
      op.input.fields.find((field) => field.name === "password")?.schema.kind,
    ).toBe("secret");
    expect(ir.errors.codeErrors).toEqual([
      {
        className: "AlphaChallenge",
        tag: "AlphaChallenge",
        code: "alpha_challenge",
        meta: "challenge",
        docsStatus: 403,
        docsProse: "an additional challenge is required.",
      },
      {
        className: "InvalidToken",
        tag: "InvalidToken",
        code: "invalid_token",
        meta: "auth",
        docsStatus: 400,
        docsProse: "the supplied token was rejected.",
      },
    ]);
    expect(ir.errors.coreReexports).toEqual(["NotFound", "TooManyRequests"]);
    expect(
      ir.namedSchemas
        .find((schema) => schema.name === "Session")
        ?.schema.fields.find((field) => field.name === "token")?.schema.kind,
    ).toBe("secret");
  });

  it("hard-errors on an unrepresentable construct (allOf), naming the pointer", () => {
    const spec = patchSpec(northstarSpec, (draft) => {
      const components = draft["components"] as {
        schemas: Record<string, { properties: Record<string, unknown> }>;
      };
      components.schemas["Widget"]!.properties["name"] = {
        allOf: [{ type: "string" }, { minLength: 1 }],
      };
    });
    expectViolation(
      () => normalize(spec, northstarConfig),
      "openapi.schema.allof",
      "/components/schemas/Widget/properties/name",
    );
  });

  it("hard-errors instead of collapsing an unrepresentable union member", () => {
    const spec = patchSpec(northstarSpec, (draft) => {
      const components = draft["components"] as {
        schemas: Record<string, { properties: Record<string, unknown> }>;
      };
      components.schemas["Widget"]!.properties["blob"] = {
        oneOf: [
          { type: "string" },
          { type: "object", additionalProperties: true },
        ],
      };
    });
    expectViolation(
      () => normalize(spec, northstarConfig),
      "openapi.schema.free-form",
      "/components/schemas/Widget/properties/blob/oneOf/1",
    );
  });

  it("hard-errors on a partially discriminated error table", () => {
    const spec = patchSpec(bastionSpec, (draft) => {
      const responses = (
        (draft["paths"] as JsonObject)["/sessions/authenticate"] as {
          post: { responses: Record<string, unknown> };
        }
      ).post.responses;
      responses["400"] = {
        description: "Bad request.",
        content: {
          "application/json": {
            schema: {
              oneOf: [
                {
                  type: "object",
                  description: "a member with no discriminator.",
                  properties: { message: { type: "string" } },
                },
              ],
            },
          },
        },
      };
    });
    expectViolation(
      () => normalize(spec, bastionConfig),
      "openapi.error.member",
      "~1sessions~1authenticate/post/responses/400",
    );
  });

  it("hard-errors on an inline success schema", () => {
    const spec = patchSpec(northstarSpec, (draft) => {
      const get = (
        (draft["paths"] as JsonObject)["/widgets/{id}"] as {
          get: { responses: Record<string, unknown> };
        }
      ).get;
      get.responses["200"] = {
        description: "The widget.",
        content: {
          "application/json": {
            schema: { type: "object", properties: { id: { type: "string" } } },
          },
        },
      };
    });
    expectViolation(
      () => normalize(spec, northstarConfig),
      "openapi.response.success",
      "~1widgets~1{id}/get/responses/200",
    );
  });

  it("hard-errors when the cursor parameter is present but pagination paths do not resolve", () => {
    const spec = patchSpec(orbitSpec, (draft) => {
      const components = draft["components"] as {
        schemas: Record<string, { properties: Record<string, unknown> }>;
      };
      components.schemas["PageMeta"]!.properties["after"] = {
        type: ["number", "null"],
      };
    });
    expectViolation(
      () => normalize(spec, orbitConfig),
      "pagination.detect",
      "operation satellites.list",
    );
  });

  it("hard-errors on a derived-name collision, naming both operationIds", () => {
    const spec = patchSpec(northstarSpec, (draft) => {
      const paths = draft["paths"] as Record<string, unknown>;
      const operation = (verb: string, operationId: string) => ({
        [verb]: {
          operationId,
          tags: ["Widgets"],
          description: "Create a widget.",
          responses: {
            "200": {
              description: "The widget.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Widget" },
                },
              },
            },
          },
        },
      });
      paths["/widgets"] = operation("post", "createWidget");
      paths["/widgets/batch"] = operation("post", "createWidgets");
    });
    expectViolation(
      () => normalize(spec, northstarConfig),
      "naming.collision",
      "operation widgets.create",
    );
    const resolved = normalize(spec, {
      ...(northstarConfig as JsonObject),
      naming: {
        operations: { createWidgets: { method: "createBatch" } },
      },
    });
    const methods = resolved.resources[0]!.operations.map(
      (operation) => operation.publicName.method,
    ).sort();
    expect(methods).toEqual(["create", "createBatch", "get"]);
  });

  it("refuses digit-bearing derived names (the leaked-codename signature)", () => {
    const spec = patchSpec(northstarSpec, (draft) => {
      const paths = draft["paths"] as Record<string, JsonObject>;
      const item = paths["/widgets/{id}"] as {
        get: { operationId: string };
      };
      item.get.operationId = "Create0";
    });
    expectViolation(
      () => normalize(spec, northstarConfig),
      "naming.method.underivable",
      "Create0",
    );
  });

  it("hard-errors on a missing operationId", () => {
    const spec = patchSpec(northstarSpec, (draft) => {
      const paths = draft["paths"] as Record<string, JsonObject>;
      const item = paths["/widgets/{id}"] as { get: JsonObject };
      delete (item.get as Record<string, unknown>)["operationId"];
    });
    expectViolation(
      () => normalize(spec, northstarConfig),
      "naming.operation-id",
      "/paths/~1widgets~1{id}/get",
    );
  });

  it("hard-errors on a lifted code with no codeMeta assignment", () => {
    const config = JSON.parse(JSON.stringify(bastionConfig)) as {
      errors: { codeMeta: Record<string, string> };
    };
    delete config.errors.codeMeta["invalid_token"];
    expectViolation(
      () => normalize(bastionSpec, config as JsonValue),
      "config.error-meta.missing",
      "invalid_token",
    );
  });

  it("hard-errors on an unused codeMeta assignment", () => {
    const config = JSON.parse(JSON.stringify(bastionConfig)) as {
      errors: { codeMeta: Record<string, string> };
    };
    config.errors.codeMeta["never_lifted"] = "auth";
    expectViolation(
      () => normalize(bastionSpec, config as JsonValue),
      "config.error-meta.unused",
      "never_lifted",
    );
  });

  it("hard-errors on config overrides naming unknown constructs", () => {
    expectViolation(
      () =>
        normalize(northstarSpec, {
          ...(northstarConfig as JsonObject),
          naming: { operations: { doesNotExist: { method: "nope" } } },
        }),
      "config.naming.unknown-operation",
      "doesNotExist",
    );
    expectViolation(
      () =>
        normalize(northstarSpec, {
          ...(northstarConfig as JsonObject),
          resources: { ghosts: { docs: "Boo." } },
        }),
      "config.resource-override.unknown",
      "ghosts",
    );
  });

  it("rejects a stray key in the vendor config (fail-closed decode)", () => {
    expect(() =>
      decodeVendorConfig({
        ...(northstarConfig as JsonObject),
        hooks: { onEmit: "nope" },
      }),
    ).toThrow(/config\.decode|hooks/u);
  });

  it("rejects a codeMeta value outside core's closed Meta vocabulary", () => {
    expect(() =>
      decodeVendorConfig({
        ...(northstarConfig as JsonObject),
        errors: { coreReexports: "referenced", codeMeta: { x: "vendorish" } },
      }),
    ).toThrow(CodegenError);
  });
});
