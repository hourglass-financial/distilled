import { describe, expect, it } from "vitest";
import {
  canonicalize,
  buildVendorIrFrom,
  checkInvariants,
  CodegenError,
  decodeVendorConfig,
  normalizeOpenApi,
  type JsonObject,
  type JsonValue,
  type VendorDir,
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

const reconcile = (spec: JsonValue, config: JsonValue) =>
  buildVendorIrFrom(
    {
      dir: "synthetic-vendor",
      spec,
      provenance: {
        sourceUrl: "https://specs.example.test/openapi.json",
        upstreamRef: "v1",
        fetchedAt: "2026-07-21T00:00:00.000Z",
        contentHash: "synthetic",
        sourceFormat: "json",
      },
      config: decodeVendorConfig(config),
      patches: [],
      specHash: "synthetic",
      configHash: "synthetic",
      patchesHash: "synthetic",
    } satisfies VendorDir,
    "reconcile",
  ).reconciliation!;

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

  it("maps exact free-form record values to closed json nodes", () => {
    const spec = patchSpec(northstarSpec, (draft) => {
      const components = draft["components"] as {
        schemas: Record<string, { properties: Record<string, unknown> }>;
      };
      components.schemas["Widget"]!.properties["raw_attributes"] = {
        type: "object",
        additionalProperties: {},
      };
      components.schemas["Widget"]!.properties["custom_attributes"] = {
        type: "object",
        additionalProperties: true,
      };
    });

    const ir = normalize(spec, northstarConfig);
    const fields = ir.namedSchemas.find((schema) => schema.name === "Widget")!
      .schema.fields;
    for (const name of ["raw_attributes", "custom_attributes"]) {
      expect(fields.find((field) => field.name === name)?.schema).toEqual({
        kind: "record",
        key: { kind: "string" },
        value: { kind: "json" },
      });
    }
  });

  it("keeps a bare empty schema outside record-value position fatal", () => {
    const spec = patchSpec(northstarSpec, (draft) => {
      const components = draft["components"] as {
        schemas: Record<string, { properties: Record<string, unknown> }>;
      };
      components.schemas["Widget"]!.properties["blob"] = {};
    });
    expectViolation(
      () => normalize(spec, northstarConfig),
      "openapi.schema.type",
      "/components/schemas/Widget/properties/blob",
    );
  });

  it("hard-errors instead of collapsing an unrepresentable union member", () => {
    const spec = patchSpec(northstarSpec, (draft) => {
      const components = draft["components"] as {
        schemas: Record<string, { properties: Record<string, unknown> }>;
      };
      components.schemas["Widget"]!.properties["blob"] = {
        oneOf: [{ type: "string" }, {}],
      };
    });
    expectViolation(
      () => normalize(spec, northstarConfig),
      "openapi.schema.type",
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

  it("applies schema renames at every named-ref site and orders by public name", () => {
    const spec = patchSpec(northstarSpec, (draft) => {
      const schemas = (draft["components"] as JsonObject)["schemas"] as Record<
        string,
        JsonObject
      >;
      schemas["InternalOwner"] = {
        type: "object",
        description: "The widget owner.",
        properties: { id: { type: "string" } },
        required: ["id"],
      };
      (schemas["Widget"]!["properties"] as Record<string, unknown>)["owner"] = {
        $ref: "#/components/schemas/InternalOwner",
      };
    });
    const ir = canonicalize(
      normalize(spec, {
        ...(northstarConfig as JsonObject),
        naming: {
          schemas: { Widget: "PublicWidget", InternalOwner: "AccountOwner" },
        },
        schemas: {
          PublicWidget: { docs: "Configured public widget prose." },
        },
      }),
    );
    expect(ir.resources[0]!.operations[0]!.output).toEqual({
      kind: "named-ref",
      name: "PublicWidget",
    });
    expect(ir.namedSchemas.map((schema) => schema.name)).toEqual([
      "AccountOwner",
      "PublicWidget",
    ]);
    expect(
      ir.namedSchemas
        .find((schema) => schema.name === "PublicWidget")!
        .schema.fields.find((field) => field.name === "owner")!.schema,
    ).toEqual({ kind: "named-ref", name: "AccountOwner" });
    expect(
      ir.namedSchemas.find((schema) => schema.name === "PublicWidget")!.docs,
    ).toBe("Configured public widget prose.");
  });

  it("hard-errors on colliding schema public names", () => {
    const spec = patchSpec(northstarSpec, (draft) => {
      const schemas = (draft["components"] as JsonObject)["schemas"] as Record<
        string,
        JsonObject
      >;
      schemas["Owner"] = {
        type: "object",
        description: "The owner.",
        properties: { id: { type: "string" } },
      };
    });
    expectViolation(
      () =>
        normalize(spec, {
          ...(northstarConfig as JsonObject),
          naming: { schemas: { Widget: "Owner" } },
        }),
      "config.naming.schema-collision",
      "Owner",
    );
  });

  it("hard-errors on unknown, invalid, and reserved schema renames", () => {
    expectViolation(
      () =>
        normalize(northstarSpec, {
          ...(northstarConfig as JsonObject),
          naming: { schemas: { Ghost: "Specter" } },
        }),
      "config.naming.unknown-schema",
      "Ghost",
    );
    for (const target of ["not-valid", "class"]) {
      expectViolation(
        () =>
          normalize(northstarSpec, {
            ...(northstarConfig as JsonObject),
            naming: { schemas: { Widget: target } },
          }),
        "config.naming.invalid-schema",
        target,
      );
    }
  });

  it("hard-errors when a schema rename collides in the unified export namespace", () => {
    const ir = canonicalize(
      normalize(northstarSpec, {
        ...(northstarConfig as JsonObject),
        naming: { schemas: { Widget: "BadRequest" } },
        errors: {
          coreReexports: "all",
          codeMeta: {},
        },
      }),
    );
    expectViolation(
      () => checkInvariants(ir),
      "identifier.export-collision",
      "BadRequest",
    );
  });

  it("uses schema docs and code prose from config when the spec omits them", () => {
    const schemaSpec = patchSpec(northstarSpec, (draft) => {
      const widget = (
        (draft["components"] as JsonObject)["schemas"] as Record<
          string,
          JsonObject
        >
      )["Widget"]!;
      delete (widget as Record<string, unknown>)["description"];
    });
    const schemaIr = normalize(schemaSpec, {
      ...(northstarConfig as JsonObject),
      schemas: { Widget: { docs: "A documented public widget." } },
    });
    expect(schemaIr.namedSchemas[0]!.docs).toBe("A documented public widget.");

    const errorSpec = patchSpec(bastionSpec, (draft) => {
      const member = (
        (draft["paths"] as JsonObject)["/sessions/authenticate"] as {
          post: {
            responses: Record<
              string,
              {
                content: {
                  "application/json": {
                    schema: { oneOf: Array<Record<string, unknown>> };
                  };
                };
              }
            >;
          };
        }
      ).post.responses["400"]!.content["application/json"].schema.oneOf[0]!;
      delete member["description"];
    });
    const errorIr = normalize(errorSpec, {
      ...(bastionConfig as JsonObject),
      errors: {
        ...((bastionConfig as JsonObject)["errors"] as JsonObject),
        codeProse: { invalid_token: "the configured token prose." },
      },
    });
    expect(
      errorIr.errors.codeErrors.find((error) => error.code === "invalid_token")
        ?.docsProse,
    ).toBe("the configured token prose.");
  });

  it("retains missing-prose hard errors when neither spec nor config supplies prose", () => {
    const schemaSpec = patchSpec(northstarSpec, (draft) => {
      const widget = (
        (draft["components"] as JsonObject)["schemas"] as Record<
          string,
          JsonObject
        >
      )["Widget"]!;
      delete (widget as Record<string, unknown>)["description"];
    });
    expectViolation(
      () => normalize(schemaSpec, northstarConfig),
      "openapi.schema.docs",
      "/components/schemas/Widget",
    );

    const errorSpec = patchSpec(bastionSpec, (draft) => {
      const member = (
        (draft["paths"] as JsonObject)["/sessions/authenticate"] as {
          post: {
            responses: Record<
              string,
              {
                content: {
                  "application/json": {
                    schema: { oneOf: Array<Record<string, unknown>> };
                  };
                };
              }
            >;
          };
        }
      ).post.responses["400"]!.content["application/json"].schema.oneOf[0]!;
      delete member["description"];
    });
    expectViolation(
      () => normalize(errorSpec, bastionConfig),
      "openapi.error.member",
      "/responses/400/",
    );
  });

  it("gives config prose precedence over existing spec descriptions", () => {
    const ir = normalize(bastionSpec, {
      ...(bastionConfig as JsonObject),
      schemas: { Session: { docs: "Configured session prose." } },
      errors: {
        ...((bastionConfig as JsonObject)["errors"] as JsonObject),
        codeProse: { invalid_token: "configured invalid-token prose." },
      },
    });
    expect(ir.namedSchemas[0]!.docs).toBe("Configured session prose.");
    expect(
      ir.errors.codeErrors.find((error) => error.code === "invalid_token")
        ?.docsProse,
    ).toBe("configured invalid-token prose.");
  });

  it("hard-errors on schema config keys that do not resolve to emitted schemas", () => {
    const spec = patchSpec(northstarSpec, (draft) => {
      const schemas = (draft["components"] as JsonObject)["schemas"] as Record<
        string,
        JsonObject
      >;
      schemas["Unreachable"] = {
        type: "object",
        properties: { id: { type: "string" } },
      };
    });
    expectViolation(
      () =>
        normalize(spec, {
          ...(northstarConfig as JsonObject),
          naming: { schemas: { Unreachable: "Hidden" } },
        }),
      "config.naming.unused-schema",
      "Unreachable",
    );
    expectViolation(
      () =>
        normalize(spec, {
          ...(northstarConfig as JsonObject),
          schemas: { Unreachable: { docs: "Never emitted." } },
        }),
      "config.schema-override.unknown",
      "Unreachable",
    );
  });

  it("hard-errors on codeProse for a code that was not lifted", () => {
    expectViolation(
      () =>
        normalize(bastionSpec, {
          ...(bastionConfig as JsonObject),
          errors: {
            ...((bastionConfig as JsonObject)["errors"] as JsonObject),
            codeProse: { never_lifted: "Unknown prose." },
          },
        }),
      "config.error-prose.unused",
      "never_lifted",
    );
  });

  it("reports prose overrides that shadow spec descriptions during reconciliation", () => {
    const report = reconcile(bastionSpec, {
      ...(bastionConfig as JsonObject),
      schemas: { Session: { docs: "Configured session prose." } },
      errors: {
        ...((bastionConfig as JsonObject)["errors"] as JsonObject),
        codeProse: { invalid_token: "Configured error prose." },
      },
      operations: {
        ...((bastionConfig as JsonObject)["operations"] as JsonObject),
        "sessions.authenticate": {
          docs: "Configured operation prose.",
          errorsDocs: "The endpoint returns typed discriminator errors.",
        },
      },
    });
    expect(report.configShadows).toEqual([
      {
        kind: "error.codeProse",
        configKey: "errors.codeProse.invalid_token",
        specPointer:
          "/paths/~1sessions~1authenticate/post/responses/400/content/application~1json/schema/oneOf/0/description",
      },
      {
        kind: "operation.docs",
        configKey: "operations.sessions.authenticate.docs",
        specPointer: "/paths/~1sessions~1authenticate/post/description",
      },
      {
        kind: "schema.docs",
        configKey: "schemas.Session.docs",
        specPointer: "/components/schemas/Session/description",
      },
    ]);
  });

  it("reports an empty configShadows section when config shadows nothing", () => {
    expect(reconcile(bastionSpec, bastionConfig).configShadows).toEqual([]);
  });

  it("hard-errors on an empty error-response union instead of dropping the status", () => {
    const spec = patchSpec(bastionSpec, (draft) => {
      const responses = (
        (draft["paths"] as JsonObject)["/sessions/authenticate"] as {
          post: { responses: Record<string, unknown> };
        }
      ).post.responses;
      responses["400"] = {
        description: "Bad request.",
        content: { "application/json": { schema: { oneOf: [] } } },
      };
    });
    expectViolation(
      () => normalize(spec, bastionConfig),
      "openapi.error.member",
      "~1sessions~1authenticate/post/responses/400",
    );
  });

  it("hard-errors on a path key that does not start with a slash", () => {
    const spec = patchSpec(northstarSpec, (draft) => {
      const paths = draft["paths"] as Record<string, unknown>;
      paths["widgets-broken"] = { get: { operationId: "broken" } };
    });
    expectViolation(
      () => normalize(spec, northstarConfig),
      "openapi.path-item",
      "widgets-broken",
    );
  });

  it("lifts a discriminated error table referenced through a component $ref", () => {
    const spec = patchSpec(bastionSpec, (draft) => {
      const components = (draft["components"] as JsonObject)[
        "schemas"
      ] as Record<string, unknown>;
      const post = (
        (draft["paths"] as JsonObject)["/sessions/authenticate"] as {
          post: {
            responses: Record<
              string,
              { content: { "application/json": { schema: unknown } } }
            >;
          };
        }
      ).post;
      components["BadRequestTable"] =
        post.responses["400"]!.content["application/json"].schema;
      post.responses["400"]!.content["application/json"].schema = {
        $ref: "#/components/schemas/BadRequestTable",
      };
    });
    const ir = normalize(spec, bastionConfig);
    expect(ir.errors.codeErrors.map((error) => error.code).sort()).toEqual([
      "alpha_challenge",
      "invalid_token",
    ]);
  });

  it("cannot be bypassed by prototype-key discriminator codes", () => {
    const spec = patchSpec(bastionSpec, (draft) => {
      const member = (
        (draft["paths"] as JsonObject)["/sessions/authenticate"] as {
          post: {
            responses: Record<
              string,
              {
                content: {
                  "application/json": {
                    schema: {
                      oneOf: Array<{
                        properties: { code: { const: string } };
                      }>;
                    };
                  };
                };
              }
            >;
          };
        }
      ).post.responses["400"]!.content["application/json"].schema.oneOf[0]!;
      member.properties.code.const = "constructor";
    });
    const config = JSON.parse(JSON.stringify(bastionConfig)) as {
      errors: { codeMeta: Record<string, string> };
    };
    delete config.errors.codeMeta["invalid_token"];
    expectViolation(
      () => normalize(spec, config as JsonValue),
      "config.error-meta.missing",
      "constructor",
    );
  });

  it("propagates a component-level nullable through struct refs", () => {
    const spec = patchSpec(northstarSpec, (draft) => {
      const components = (draft["components"] as JsonObject)[
        "schemas"
      ] as Record<string, unknown>;
      components["Owner"] = {
        type: "object",
        nullable: true,
        description: "The widget's owner, when assigned.",
        properties: { id: { type: "string" } },
        required: ["id"],
      };
      (
        components["Widget"] as {
          properties: Record<string, unknown>;
          required: string[];
        }
      ).properties["owner"] = { $ref: "#/components/schemas/Owner" };
      (components["Widget"] as { required: string[] }).required.push("owner");
    });
    const ir = normalize(spec, northstarConfig);
    const owner = ir.namedSchemas
      .find((schema) => schema.name === "Widget")!
      .schema.fields.find((field) => field.name === "owner")!;
    expect(owner.schema).toEqual({ kind: "named-ref", name: "Owner" });
    expect(owner.nullable).toBe(true);
    expect(owner.optional).toBe(false);
  });

  it("hard-errors on a nullable success output (unrepresentable position)", () => {
    const spec = patchSpec(northstarSpec, (draft) => {
      const components = (draft["components"] as JsonObject)[
        "schemas"
      ] as Record<string, { nullable?: boolean }>;
      components["Widget"]!.nullable = true;
    });
    expectViolation(
      () => normalize(spec, northstarConfig),
      "openapi.nullable.position",
      "~1widgets~1{id}/get/responses/200",
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
