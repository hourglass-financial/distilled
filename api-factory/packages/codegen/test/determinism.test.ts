import { describe, expect, it } from "vitest";
import { generate, type ClientIr } from "../src/index.ts";
import { minimalFixture } from "./fixtures/minimal.ts";
import { multiResourceFixture } from "./fixtures/multi-resource.ts";

const bytes = (ir: ClientIr): ReadonlyArray<readonly [string, string]> =>
  generate(ir).map((file) => [file.path, file.contents] as const);

describe("generation determinism", () => {
  it("emits identical bytes for repeated generation", () => {
    expect(bytes(minimalFixture)).toEqual(bytes(minimalFixture));
  });

  it("normalizes every shuffled declaration-level collection", () => {
    const shuffled: ClientIr = {
      ...multiResourceFixture,
      resources: [...multiResourceFixture.resources]
        .reverse()
        .map((resource) => ({
          ...resource,
          operations: [...resource.operations].reverse().map((operation) => ({
            ...operation,
            errors: [...operation.errors].reverse(),
          })),
        })),
      namedSchemas: [...multiResourceFixture.namedSchemas].reverse(),
      errors: {
        ...multiResourceFixture.errors,
        codeErrors: [...multiResourceFixture.errors.codeErrors].reverse(),
      },
    };
    expect(bytes(shuffled)).toEqual(bytes(multiResourceFixture));
  });

  it("preserves struct field order as a semantic boundary", () => {
    const shuffled: ClientIr = {
      ...minimalFixture,
      namedSchemas: [
        {
          ...minimalFixture.namedSchemas[0]!,
          schema: {
            ...minimalFixture.namedSchemas[0]!.schema,
            fields: [
              ...minimalFixture.namedSchemas[0]!.schema.fields,
            ].reverse(),
          },
        },
      ],
    };
    expect(bytes(shuffled)).not.toEqual(bytes(minimalFixture));
  });

  it("sorts punctuation, case, and non-ASCII names by UTF-16 code unit", () => {
    const sourceOperation = minimalFixture.resources[0]!.operations[0]!;
    const ir: ClientIr = {
      ...minimalFixture,
      resources: ["éclair", "alpha", "_under", "Zulu", "$cash"].map((name) => ({
        name,
        fileName: `${name}.ts`,
        docs: `${name} operations.`,
        runtimeBannerConcern: "request execution",
        operations: [
          {
            ...sourceOperation,
            publicName: { ...sourceOperation.publicName, resource: name },
            opId: `${name}.${sourceOperation.publicName.method}`,
            pathTemplate: `/${name}/{id}`,
          },
        ],
      })),
    };
    const index = generate(ir).find((file) => file.path === "src/index.ts")!;
    const positions = ["$cash", "Zulu", "_under", "alpha", "éclair"].map(
      (name) => index.contents.indexOf(`export * as ${name}`),
    );
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual(
      [...positions].sort((left, right) => left - right),
    );
  });
});
