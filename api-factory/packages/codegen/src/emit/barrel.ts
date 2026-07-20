import type { ClientIr } from "../ir/model.ts";
import {
  barrelBanner,
  CORE_PACKAGE,
  createWriter,
  emitted,
  type EmittedFile,
  finishWriter,
  stringLiteral,
} from "./shared.ts";

const exampleFor = (ir: ClientIr): string => {
  const organizations = ir.resources.find(
    (resource) => resource.name === "organizations",
  );
  const methods = new Set(
    organizations?.operations.map((operation) => operation.publicName.method),
  );
  if (
    organizations !== undefined &&
    methods.has("create") &&
    methods.has("delete") &&
    organizations.operations.some(
      (operation) =>
        operation.publicName.method === "list" &&
        operation.pagination !== undefined,
    )
  ) {
    return `import { organizations, layerFromEnv } from ${stringLiteral(ir.packageName)};
import { Effect, Stream } from "effect";

const program = Effect.gen(function* () {
  const org = yield* organizations.create({ name: "Acme" });
  const all = yield* organizations.listItems().pipe(Stream.runCollect);
  yield* organizations.delete({ id: org.id });
  return all;
});

program.pipe(Effect.provide(layerFromEnv));`;
  }
  const resource = ir.resources[0];
  const operation = resource?.operations[0];
  if (resource === undefined || operation === undefined) {
    return `import { layerFromEnv } from ${stringLiteral(ir.packageName)};`;
  }
  return `import { ${resource.name}, layerFromEnv } from ${stringLiteral(ir.packageName)};
import { Effect } from "effect";

const program = ${resource.name}.${operation.publicName.method}({});
program.pipe(Effect.provide(layerFromEnv));`;
};

export const emitBarrel = (ir: ClientIr): EmittedFile => {
  const writer = createWriter();
  writer
    .writeLine(barrelBanner(ir.packageName, ir.vendor.display, exampleFor(ir)))
    .blankLine();
  writer.writeLine("// Resource operation namespaces.");
  for (const resource of ir.resources) {
    writer.writeLine(
      `export * as ${resource.name} from ${stringLiteral(`./resources/${resource.fileName}`)};`,
    );
  }
  writer.blankLine();
  writer.writeLine("// Credentials service + credential layers.");
  writer.writeLine("export {");
  writer.indent(() => {
    writer.writeLine("Credentials,");
    writer.writeLine("credentialsFromEnv,");
    writer.writeLine("credentialsOf,");
    writer.writeLine("DEFAULT_BASE_URL,");
    writer.writeLine(`type ${ir.vendor.prefix}Config,`);
  });
  writer.writeLine('} from "./config.ts";').blankLine();
  writer.writeLine(
    "// Client service, layers, dispatch helper, and error-channel helper.",
  );
  writer.writeLine("export {");
  writer.indent(() => {
    writer.writeLine("layer,");
    writer.writeLine("layerFromEnv,");
    writer.writeLine("layerWith,");
    writer.writeLine("run,");
    writer.writeLine(`type ${ir.vendor.prefix}ClientOptions,`);
    writer.writeLine(`type ${ir.vendor.prefix}ClientShape,`);
    writer.writeLine(`${ir.vendor.prefix}Client,`);
    writer.writeLine(`type ${ir.vendor.prefix}Error,`);
  });
  writer.writeLine('} from "./client.ts";').blankLine();
  writer.writeLine(
    "// Errors — status-mapped, code-discriminated, and client-owned wrappers.",
  );
  writer.writeLine('export * from "./errors.ts";').blankLine();
  writer.writeLine(
    "// Wire schemas (values double as types for consumers who want them).",
  );
  writer.writeLine('export * from "./schemas.ts";').blankLine();
  writer
    .writeLine(
      'export { operations, type OperationName } from "./registry.ts";',
    )
    .blankLine();
  writer.writeLine(
    "// Core re-exports so consumers never import core directly: `Secret` to wrap",
  );
  writer.writeLine(
    "// request secrets, `Category` for classification helpers (`Category.hasCategory`",
  );
  writer.writeLine("// narrows the error union inside `Effect.catchIf`).");
  writer.writeLine(
    `export { Category, Secret } from ${stringLiteral(CORE_PACKAGE)};`,
  );
  return emitted("src/index.ts", finishWriter(writer));
};
