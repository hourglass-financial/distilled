/**
 * Erebor SDK Code Generator
 *
 * Loads the Erebor OpenAPI 3.1 spec from the package-local specs snapshot,
 * strips the vendor-defined `Authorization` header parameter from every
 * operation (the runtime client injects auth headers from credentials), then
 * delegates to the shared OpenAPI generator from sdk-core.
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
    if (!op?.parameters) continue;
    op.parameters = op.parameters.filter(
      (p: { in?: string; name?: string }) =>
        !(p.in === "header" && p.name === "Authorization"),
    );
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
  includeOperationErrors: true,
  skipDeprecated: true,
});
