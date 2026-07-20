import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  printJson,
  sha256,
  type JsonObject,
  type JsonValue,
} from "../../src/index.ts";

/**
 * Synthetic OpenAPI vendor-dir fixtures. Each builder returns plain JSON;
 * `writeVendorDir` lays a complete `vendors/<vendor>/` tree into a temp
 * directory with a provenance record whose content hash matches the written
 * snapshot (tests tamper afterwards to exercise attestation failures).
 */

export interface VendorDirFixture {
  readonly spec: JsonValue;
  readonly config: JsonValue;
  readonly patches?: Readonly<Record<string, JsonValue>>;
}

export const writeVendorDir = (
  dir: string,
  fixture: VendorDirFixture,
): void => {
  mkdirSync(dir, { recursive: true });
  const specContents = printJson(fixture.spec);
  writeFileSync(join(dir, "spec.json"), specContents);
  writeFileSync(
    join(dir, "spec.provenance.json"),
    printJson({
      sourceUrl: "https://specs.example.test/openapi.json",
      upstreamRef: "v1.2.3",
      fetchedAt: "2026-07-20T00:00:00.000Z",
      contentHash: sha256(specContents),
      sourceFormat: "json",
    }),
  );
  writeFileSync(join(dir, "config.json"), printJson(fixture.config));
  const patches = fixture.patches ?? {};
  if (Object.keys(patches).length > 0) {
    mkdirSync(join(dir, "patches"), { recursive: true });
    for (const [name, entry] of Object.entries(patches)) {
      writeFileSync(join(dir, "patches", name), printJson(entry));
    }
  }
};

export const baseConfig = (
  slug: string,
  display: string,
  prefix: string,
  overrides: JsonObject = {},
): JsonValue => ({
  vendor: { slug, display, prefix },
  baseUrl: `https://api.${slug}.example`,
  auth: { scheme: "bearer" },
  retry: {
    GET: "transient",
    POST: "throttling",
    PUT: "throttling",
    PATCH: "throttling",
    DELETE: "throttling",
    HEAD: "transient",
  },
  envelope: {
    messageFields: ["message", "error_description", "error"],
    discriminatorFields: ["code", "error"],
    stringBodyIsMessage: true,
    decodeDocs: `Normalize ${display}'s two error envelopes into one shape. \`code\` and the\nOAuth-style \`error\` collapse to a single discriminator; \`message\` prefers the\nhuman field of whichever envelope is present.`,
  },
  pagination: { mode: "none" },
  errors: { coreReexports: "referenced", codeMeta: {} },
  ...overrides,
});

/** Normalizes to the `minimal` engine fixture (northstar / widgets.get). */
export const northstarSpec: JsonValue = {
  openapi: "3.1.0",
  info: { title: "Northstar", version: "1.0.0" },
  paths: {
    "/widgets/{id}": {
      get: {
        operationId: "getWidget",
        tags: ["Widgets"],
        description: "Fetch a widget by id.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "The widget.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Widget" },
              },
            },
          },
          "404": { description: "No such widget." },
        },
      },
    },
  },
  components: {
    schemas: {
      Widget: {
        type: "object",
        description: "A Northstar widget.",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
        },
        required: ["id", "name"],
      },
    },
  },
};

export const northstarConfig: JsonValue = baseConfig(
  "northstar",
  "Northstar",
  "Northstar",
);

/** Normalizes to the `pagination` engine fixture (orbit / satellites.list). */
export const orbitSpec: JsonValue = {
  openapi: "3.1.0",
  info: { title: "Orbit", version: "1.0.0" },
  paths: {
    "/satellites": {
      get: {
        operationId: "listSatellites",
        tags: ["Satellites"],
        description: "Fetch a single page of satellites.",
        parameters: [
          {
            name: "before",
            in: "query",
            required: false,
            schema: { type: "string" },
          },
          {
            name: "after",
            in: "query",
            required: false,
            schema: { type: "string" },
          },
          {
            name: "limit",
            in: "query",
            required: false,
            schema: { type: "number" },
          },
        ],
        responses: {
          "200": {
            description: "One page.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SatellitePage" },
              },
            },
          },
          "404": { description: "No such page." },
        },
      },
    },
  },
  components: {
    schemas: {
      PageMeta: {
        type: "object",
        description: "Cursor metadata.",
        properties: {
          after: { type: ["string", "null"] },
        },
        required: ["after"],
      },
      Satellite: {
        type: "object",
        description: "An Orbit satellite.",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
        },
        required: ["id", "name"],
      },
      SatellitePage: {
        type: "object",
        description: "A page of satellites.",
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Satellite" },
          },
          meta: { $ref: "#/components/schemas/PageMeta" },
        },
        required: ["data", "meta"],
      },
    },
  },
};

export const orbitConfig: JsonValue = baseConfig("orbit", "Orbit", "Orbit", {
  pagination: {
    mode: "cursor",
    cursorParam: "after",
    clearParams: ["before"],
    nextCursorPath: ["meta", "after"],
    itemsPath: ["data"],
  },
});

/** Error-rich fixture: discriminated tables, secrets, constant body. */
export const bastionSpec: JsonValue = {
  openapi: "3.1.0",
  info: { title: "Bastion", version: "1.0.0" },
  paths: {
    "/sessions/authenticate": {
      post: {
        operationId: "authenticateSession",
        tags: ["Sessions"],
        description: "Authenticate a Bastion session.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  grant_type: { type: "string", const: "password" },
                  interactive: { type: "boolean", const: true },
                  email: { type: "string" },
                  password: { type: "string", format: "password" },
                },
                required: ["grant_type", "interactive", "email", "password"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "The session.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Session" },
              },
            },
          },
          "400": {
            description: "Bad request.",
            content: {
              "application/json": {
                schema: {
                  oneOf: [
                    {
                      type: "object",
                      description: "the supplied token was rejected.",
                      properties: {
                        code: { type: "string", const: "invalid_token" },
                        message: { type: "string" },
                      },
                    },
                  ],
                },
              },
            },
          },
          "403": {
            description: "Challenge required.",
            content: {
              "application/json": {
                schema: {
                  oneOf: [
                    {
                      type: "object",
                      description: "an additional challenge is required.",
                      properties: {
                        code: { type: "string", const: "alpha_challenge" },
                        message: { type: "string" },
                      },
                    },
                  ],
                },
              },
            },
          },
          "404": { description: "No such session." },
          "429": { description: "Slow down." },
        },
      },
    },
  },
  components: {
    schemas: {
      Session: {
        type: "object",
        description: "An authenticated session.",
        properties: {
          id: { type: "string" },
          token: { type: "string", format: "password" },
        },
        required: ["id", "token"],
      },
    },
  },
};

export const bastionConfig: JsonValue = baseConfig(
  "bastion",
  "Bastion",
  "Bastion",
  {
    errors: {
      coreReexports: "referenced",
      codeMeta: {
        invalid_token: "auth",
        alpha_challenge: "challenge",
      },
      sectionTitle:
        "Code-discriminated authentication errors (POST /sessions/authenticate)",
    },
    operations: {
      "sessions.authenticate": {
        errorsDocs: "The endpoint returns typed discriminator errors.",
      },
    },
  },
);

/** A full patch entry with sensible defaults; spread to override. */
export const patchEntry = (
  id: string,
  kindFields: JsonObject,
  overrides: JsonObject = {},
): JsonValue => ({
  id,
  rationale: "Live call observed a wire fact the spec omits.",
  precondition: { pointer: "/openapi", test: "3.1.0" },
  blastRadius: { role: "error", expectedFiles: [] },
  provenance: {
    evidenceType: "vendor-docs-citation",
    url: "https://docs.example.test/errors",
    fetchedAt: "2026-07-19",
    observed: "the wire returns a 409 conflict envelope",
    specd: "the spec declares no 409 for this operation",
    authoredAgainstSpecHash: "sha256-authored",
    reporter: "wayfinder-48",
  },
  ...kindFields,
  ...overrides,
});
