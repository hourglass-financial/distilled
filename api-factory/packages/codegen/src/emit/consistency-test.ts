import type { ClientIr } from "../ir/model.ts";
import { ImportCollector } from "./imports.ts";
import {
  banner,
  CORE_PACKAGE,
  createWriter,
  emitted,
  type EmittedFile,
  finishWriter,
} from "./shared.ts";

export const emitConsistencyTest = (ir: ClientIr): EmittedFile => {
  const prefix = ir.vendor.prefix;
  const imports = new ImportCollector();
  imports.use(CORE_PACKAGE, "checkMatcherConsistency");
  for (const symbol of ["describe", "expect", "it"]) {
    imports.use("vitest", symbol);
  }
  for (const symbol of [
    "CODE_ERRORS",
    "DEFAULT_ERRORS",
    "STATUS_ERRORS",
    `Unknown${prefix}Error`,
    `${prefix}DecodeError`,
    `${prefix}TransportError`,
  ]) {
    imports.use("../src/errors.ts", symbol);
  }
  const writer = createWriter();
  writer.writeLine(
    banner(
      [
        `error codes / tables → the ${ir.vendor.display} OpenAPI spec + generator mapping`,
      ],
      `Table-driven consistency checks emitted alongside the client, so the\nmachine-owned package always carries a real test suite: every matcher-table\nentry must be a classified error class, and every code-mapped class must\naccept its own wire code. Behavioral coverage lives in \`${ir.behavioralCoverageLocation}\`.`,
    ),
  );
  writer.writeLine(imports.render()).blankLine();
  writer.writeLine('describe("matcher tables", () => {');
  writer.indent(() => {
    writer.writeLine('it("is internally consistent", () => {');
    writer.indent(() => {
      writer.writeLine("expect(");
      writer.indent(() => {
        writer.writeLine("checkMatcherConsistency({");
        writer.indent(() => {
          writer.writeLine("statusErrors: STATUS_ERRORS,");
          writer.writeLine("codeErrors: CODE_ERRORS,");
          writer.writeLine("universalErrors: DEFAULT_ERRORS,");
          writer.writeLine(`UnknownError: Unknown${prefix}Error,`);
          writer.writeLine(`TransportError: ${prefix}TransportError,`);
          writer.writeLine(`DecodeError: ${prefix}DecodeError,`);
        });
        writer.writeLine("}),");
      });
      writer.writeLine(").toEqual([]);");
    });
    writer.writeLine("});");
  });
  writer.writeLine("});");
  return emitted("test/errors.test.ts", finishWriter(writer));
};
