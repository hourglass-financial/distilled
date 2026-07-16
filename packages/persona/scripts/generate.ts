/**
 * Persona SDK Code Generator
 *
 * Persona publishes OpenAPI 3.1 snapshots by API version. This package targets
 * the bundled 2025-12-08 snapshot and delegates schema/operation generation to
 * the shared OpenAPI generator after normalizing parameter names that are not
 * valid TypeScript identifiers.
 */
import * as fs from "fs";
import * as path from "path";
import { generateFromOpenAPI } from "@distilled.cloud/core/openapi/generate";

const rootDir = path.join(import.meta.dir, "..");
const sourceSpecPath = path.join(
  rootDir,
  "specs/persona-openapi/2025-12-08/openapi-bundled.json",
);
const tmpDir = path.join(rootDir, ".gen-tmp");
const normalizedSpecPath = path.join(tmpDir, "openapi.json");
const operationsDir = path.join(rootDir, "src/operations");

const HTTP_METHODS = ["get", "post", "put", "patch", "delete"] as const;

type ParameterObject = {
  name: string;
  in: "path" | "query" | "header" | "cookie";
  $ref?: string;
};

const toCamelCase = (value: string): string =>
  value
    .replace(/[-_\s]+([a-zA-Z])/g, (_, c: string) => c.toUpperCase())
    .replace(/[^a-zA-Z0-9$]/g, "");

const toFieldName = (name: string): string => {
  const camel = toCamelCase(name);
  return camel.charAt(0).toLowerCase() + camel.slice(1);
};

const spec = JSON.parse(fs.readFileSync(sourceSpecPath, "utf-8"));

const resolveParameter = (param: ParameterObject): ParameterObject => {
  if (!param.$ref) return param;
  const key = param.$ref.replace("#/components/parameters/", "");
  const resolved = spec.components?.parameters?.[key];
  if (!resolved) {
    throw new Error(`Could not resolve parameter ref: ${param.$ref}`);
  }
  return resolved;
};

const pathRename = new Map<string, string>();

for (const [pathTemplate, pathItem] of Object.entries(
  spec.paths ?? {},
) as Array<[string, any]>) {
  const normalizedPath = pathTemplate.replace(
    /\{([^}]+)\}/g,
    (_match, name) => {
      const fieldName = toFieldName(name);
      pathRename.set(name, fieldName);
      return `{${fieldName}}`;
    },
  );

  if (normalizedPath !== pathTemplate) {
    delete spec.paths[pathTemplate];
    spec.paths[normalizedPath] = pathItem;
  }

  for (const method of HTTP_METHODS) {
    const operation = pathItem[method];
    if (!operation) continue;

    for (const rawParam of [
      ...(pathItem.parameters ?? []),
      ...(operation.parameters ?? []),
    ] as ParameterObject[]) {
      const param = resolveParameter(rawParam);
      if (param.in === "path") {
        param.name = pathRename.get(param.name) ?? toFieldName(param.name);
      }
    }
  }
}

fs.mkdirSync(tmpDir, { recursive: true });
fs.writeFileSync(normalizedSpecPath, JSON.stringify(spec));

generateFromOpenAPI({
  specPath: normalizedSpecPath,
  patchDir: path.join(rootDir, "patches"),
  outputDir: operationsDir,
  importPrefix: "..",
  clientImport: "../client",
  traitsImport: "../traits",
  sensitiveImport: "../sensitive",
  errorsImport: "../errors",
  includeOperationErrors: true,
  skipDeprecated: true,
  statusToErrorClass: {
    "400": "BadRequest",
    "403": "Forbidden",
    "404": "NotFound",
    "408": "RequestTimeout",
    "409": "Conflict",
    "422": "UnprocessableEntity",
  },
});

fs.rmSync(tmpDir, { recursive: true, force: true });
