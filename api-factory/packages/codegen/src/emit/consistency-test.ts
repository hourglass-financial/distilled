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
  imports.use(CORE_PACKAGE, "Category");
  imports.use(CORE_PACKAGE, "ClassifiedErrorClass", { typeOnly: true });
  imports.use("effect/Redacted", "Redacted", { namespace: true });
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
    writer.writeLine(
      'it("every status-mapped class produces classified instances", () => {',
    );
    writer.indent(() => {
      writer.writeLine(
        "for (const [status, Cls] of Object.entries(STATUS_ERRORS)) {",
      );
      writer.indent(() => {
        writer.writeLine(
          'const meta = Category.metaOf(new Cls({ message: "boom" }));',
        );
        writer.writeLine("expect(meta, status).toBeDefined();");
      });
      writer.writeLine("}");
    });
    writer.writeLine("});").blankLine();
    writer.writeLine(
      'it("every universal default is one of the status-mapped classes", () => {',
    );
    writer.indent(() => {
      writer.writeLine(
        "const statusClasses = new Set<unknown>(Object.values(STATUS_ERRORS));",
      );
      writer.writeLine("for (const Cls of DEFAULT_ERRORS) {");
      writer.indent(() =>
        writer.writeLine("expect(statusClasses.has(Cls)).toBe(true);"),
      );
      writer.writeLine("}");
    });
    writer.writeLine("});").blankLine();
    writer.writeLine(
      'it("every code-mapped class accepts its own wire code and is never retried", () => {',
    );
    writer.indent(() => {
      writer.writeLine(
        "const table: ReadonlyArray<readonly [string, ClassifiedErrorClass]> =",
      );
      writer.indent(() => writer.writeLine("Object.entries(CODE_ERRORS);"));
      writer.writeLine("for (const [code, Cls] of table) {");
      writer.indent(() => {
        writer.writeLine(
          'const instance = new Cls({ message: "boom", code });',
        );
        writer.writeLine("const shaped = instance as {");
        writer.indent(() => {
          writer.writeLine("readonly code?: string;");
          writer.writeLine("readonly message: string;");
        });
        writer.writeLine("};");
        writer.writeLine("expect(shaped.code, code).toBe(code);");
        writer.writeLine('expect(shaped.message).toBe("boom");');
        writer.writeLine(
          'expect(Category.metaOf(instance)?.retry, code).toBe("none");',
        );
      });
      writer.writeLine("}");
    });
    writer.writeLine("});").blankLine();
    writer.writeLine(
      'it("the fallback and wrapper errors are classified", () => {',
    );
    writer.indent(() => {
      writer.writeLine("expect(");
      writer.indent(() => {
        writer.writeLine("Category.metaOf(");
        writer.indent(() =>
          writer.writeLine(
            `new Unknown${prefix}Error({ message: "x", body: Redacted.make(null) }),`,
          ),
        );
        writer.writeLine("),");
      });
      writer.writeLine(').toEqual({ category: "unknown", retry: "none" });');
      writer.writeLine("expect(");
      writer.indent(() =>
        writer.writeLine(
          `Category.metaOf(new ${prefix}TransportError({ message: "x", cause: null })),`,
        ),
      );
      writer.writeLine(
        ').toEqual({ category: "transport", retry: "transient" });',
      );
      writer.writeLine("expect(");
      writer.indent(() => {
        writer.writeLine("Category.metaOf(");
        writer.indent(() =>
          writer.writeLine(
            `new ${prefix}DecodeError({ message: "x", cause: Redacted.make(null) }),`,
          ),
        );
        writer.writeLine("),");
      });
      writer.writeLine(').toEqual({ category: "parse", retry: "none" });');
    });
    writer.writeLine("});");
  });
  writer.writeLine("});");
  return emitted("test/errors.test.ts", finishWriter(writer));
};
