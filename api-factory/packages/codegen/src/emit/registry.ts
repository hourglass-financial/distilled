import type { ClientIr } from "../ir/model.ts";
import {
  banner,
  createWriter,
  emitted,
  type EmittedFile,
  finishWriter,
  stringLiteral,
} from "./shared.ts";

export const emitRegistry = (ir: ClientIr): EmittedFile => {
  const operations = ir.resources.flatMap((resource) =>
    resource.operations.map(
      (operation) =>
        `${operation.publicName.resource}.${operation.publicName.method}`,
    ),
  );
  const writer = createWriter();
  writer.writeLine(
    banner(
      [
        `operation surface → the ${ir.vendor.display} OpenAPI spec`,
        "public operation names → the generator's resolved mapping",
      ],
      "Canonical public operation names used by coverage and regeneration audits.",
    ),
  );
  writer.writeLine("export const operations = [");
  writer.indent(() => {
    for (const operation of operations)
      writer.writeLine(`${stringLiteral(operation)},`);
  });
  writer.writeLine("] as const;").blankLine();
  writer.writeLine("export type OperationName = (typeof operations)[number];");
  return emitted("src/registry.ts", finishWriter(writer), {
    registryOps: operations,
  });
};
