import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as Schema from "effect/Schema";
import { beforeAll, describe, expect, it } from "vitest";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const rootDir = resolve(packageDir, "../..");
const operationName = "UserlandUserOrganizationMembershipsControllerUpdate";
const declarationPath = resolve(
  packageDir,
  `lib/operations/${operationName}.d.ts`,
);
const runtimePath = resolve(packageDir, `lib/operations/${operationName}.js`);

const build = (cwd: string): void => {
  const result = spawnSync(process.execPath, ["run", "build", "--force"], {
    cwd,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    throw new Error(
      `Artifact build failed in ${cwd}:\n${result.stdout}\n${result.stderr}`,
    );
  }
};

beforeAll(() => {
  build(resolve(rootDir, "packages/core"));
  build(packageDir);
}, 60_000);

describe("WorkOS package artifact", () => {
  it("emits the complete membership update declaration and precise contract", () => {
    const declaration = readFileSync(declarationPath, "utf8");

    expect(declaration).toContain("role_slug?: string;");
    expect(declaration).toContain("role_slugs?: ReadonlyArray<string>;");
    expect(declaration).toContain('object: "organization_membership";');
    expect(declaration).not.toContain('object?: "organization_membership";');
    expect(declaration).toContain("user_id: string;");
    expect(declaration).toContain("organization_id: string;");
    expect(declaration).toContain("directory_managed: boolean;");
    expect(declaration).toContain(
      'ClientOperationError<NotFound | UnprocessableEntity, import("../errors.ts").UnknownWorkosError | import("@distilled.cloud/core/errors").DefaultErrors, import("../errors.ts").WorkosParseError>',
    );
    expect(declaration).toContain(
      'import("../credentials.ts").Credentials | import("effect/unstable/http/HttpClient").HttpClient',
    );
  });

  it("emits a runtime codec that serializes both role fields in the JSON body", async () => {
    const operation = await import(
      `${pathToFileURL(runtimePath).href}?artifact=${Date.now()}`
    );
    const traits = await import(
      `${pathToFileURL(resolve(rootDir, "packages/core/lib/traits.js")).href}?artifact=${Date.now()}`
    );
    const inputSchema =
      operation.UserlandUserOrganizationMembershipsControllerUpdateInput;

    const parts = traits.buildRequestParts(
      inputSchema.ast,
      traits.getHttpTrait(inputSchema.ast),
      {
        id: "om_test",
        role_slug: "member",
        role_slugs: ["member", "admin"],
      },
      inputSchema,
    );

    expect(parts.path).toBe(
      "/user_management/organization_memberships/om_test",
    );
    expect(parts.body).toEqual({
      role_slug: "member",
      role_slugs: ["member", "admin"],
    });

    expect(() =>
      Schema.decodeUnknownSync(
        operation.UserlandUserOrganizationMembershipsControllerUpdateOutput,
      )({ object: "organization_membership" }),
    ).toThrow();
  });
});
