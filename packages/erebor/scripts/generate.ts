/**
 * Erebor SDK Code Generator
 *
 * Loads the Erebor OpenAPI 3.1 spec from the package-local specs snapshot,
 * strips the vendor-defined `Authorization` header parameter from every
 * operation (the runtime client injects auth headers from credentials), adds
 * prose-documented request headers that are missing from the OpenAPI snapshot,
 * then delegates to the shared OpenAPI generator from sdk-core.
 */
import * as fs from "fs";
import * as path from "path";
import { generateFromOpenAPI } from "@distilled.cloud/core/openapi/generate";

const rootDir = path.join(import.meta.dir, "..");

const sourceSpecPath = path.join(
  rootDir,
  "specs/distilled-spec-erebor/specs/openapi.json",
);
const tmpDir = path.join(rootDir, ".gen-tmp");
const cleanedSpecPath = path.join(tmpDir, "openapi.json");

const spec = JSON.parse(fs.readFileSync(sourceSpecPath, "utf-8"));

const HTTP_METHODS = ["get", "post", "put", "patch", "delete"] as const;

for (const pathItem of Object.values(spec.paths ?? {}) as any[]) {
  for (const method of HTTP_METHODS) {
    const op = pathItem?.[method];
    if (!op) continue;
    op.parameters ??= [];
    op.parameters = op.parameters.filter(
      (p: { in?: string; name?: string }) =>
        !(p.in === "header" && p.name === "Authorization"),
    );

    // Erebor's prose docs document `Erebor-Version` as a request header, but
    // the current OpenAPI snapshot omits it from operation parameters. Keep the
    // generated client aligned with the docs until the upstream spec includes it.
    if (
      !op.parameters.some(
        (p: { in?: string; name?: string }) =>
          p.in === "header" && p.name === "Erebor-Version",
      )
    ) {
      op.parameters.push({
        name: "Erebor-Version",
        in: "header",
        required: false,
        description:
          "Optional API version header. Use a date-based Erebor API version when you need to pin request behavior.",
        schema: { type: "string" },
      });
    }
  }
}

fs.mkdirSync(tmpDir, { recursive: true });
fs.writeFileSync(cleanedSpecPath, JSON.stringify(spec));

generateFromOpenAPI({
  specPath: cleanedSpecPath,
  patchDir: path.join(rootDir, "patches"),
  outputDir: path.join(rootDir, "src/operations"),
  importPrefix: "..",
  clientImport: "../client",
  traitsImport: "../traits",
  sensitiveImport: "../sensitive",
  errorsImport: "../errors",
  // Preserve the existing Erebor SDK's snake_case query contract while
  // retaining its established camelCase header fields.
  parameterFieldNaming: { query: "preserve", header: "camelCase" },
  includeOperationErrors: true,
  skipDeprecated: true,
  statusToErrorClass: {
    "400": "BadRequest",
    "403": "Forbidden",
    "404": "NotFound",
    "409": "Conflict",
    "422": ["UnprocessableEntity", "EreborValidationError"],
  },
});
