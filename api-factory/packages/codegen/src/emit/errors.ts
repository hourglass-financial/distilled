import type { ClientIr, CodeErrorIr } from "../ir/model.ts";
import { ImportCollector } from "./imports.ts";
import {
  banner,
  CORE_PACKAGE,
  createWriter,
  emitted,
  type EmittedFile,
  finishWriter,
  section,
  stringLiteral,
  writeDoc,
} from "./shared.ts";

const errorsBanner = (ir: ClientIr): string =>
  banner(
    [
      `error codes / status table → the ${ir.vendor.display} OpenAPI spec + generator mapping`,
      `error base classes, retry classification → ${CORE_PACKAGE}`,
    ],
    ir.errors.docs,
  );

const emitCodeError = (
  writer: ReturnType<typeof createWriter>,
  error: CodeErrorIr,
): void => {
  writeDoc(
    writer,
    `${error.docsStatus} \`${error.code}\` — ${error.docsProse}`,
  );
  writer.writeLine(
    `export class ${error.className} extends Schema.TaggedErrorClass<${error.className}>()(`,
  );
  writer.indent(() => {
    writer.writeLine(`${stringLiteral(error.tag)},`);
    writer.writeLine(
      `{ message: Schema.String, code: Schema.Literal(${stringLiteral(error.code)}) },`,
    );
  });
  writer.writeLine(") {");
  writer.indent(() =>
    writer.writeLine(`readonly [MetaKey] = Meta.${error.meta};`),
  );
  writer.writeLine("}");
};

const emitCoreReexports = (
  writer: ReturnType<typeof createWriter>,
  names: ReadonlyArray<string>,
): void => {
  writer.writeLine(
    "// Universal status-mapped errors, re-exported so consumers import them from the",
  );
  writer.writeLine("// client package rather than reaching into core.");
  writer.writeLine("export {");
  writer.indent(() => {
    for (const name of names) writer.writeLine(`${name},`);
  });
  writer.writeLine(`} from ${stringLiteral(CORE_PACKAGE)};`);
};

const emitWrappers = (
  writer: ReturnType<typeof createWriter>,
  ir: ClientIr,
): void => {
  const { display, prefix } = ir.vendor;
  writeDoc(
    writer,
    `A ${display} error the SDK does not (yet) model — an unmapped status or an\nunknown discriminator code. Its presence signals a spec gap to be patched.\nThe raw body is preserved for diagnosis behind \`Redacted\` — validation\nenvelopes can echo submitted values, so it must not print from a logged\nerror; unwrap deliberately with \`Redacted.value(error.body)\`. The \`message\`\nis the API's own human-facing text and stays printable.`,
  );
  writer.writeLine(
    `export class Unknown${prefix}Error extends Schema.TaggedErrorClass<Unknown${prefix}Error>()(`,
  );
  writer.indent(() => {
    writer.writeLine(`${stringLiteral(`Unknown${prefix}Error`)},`);
    writer.writeLine("{");
    writer.indent(() => {
      writer.writeLine("status: Schema.optional(Schema.Number),");
      writer.writeLine("code: Schema.optional(Schema.String),");
      writer.writeLine("message: Schema.String,");
      writer.writeLine("body: RedactedValue,");
    });
    writer.writeLine("},");
  });
  writer.writeLine(") {");
  writer.indent(() => writer.writeLine("readonly [MetaKey] = Meta.unknown;"));
  writer.writeLine("}").blankLine();

  writeDoc(
    writer,
    `A wire-level transport failure (DNS, connect/read timeout, socket reset).\n\`cause\` is core's secret-free \`TransportFailure\` summary — never the raw\n\`HttpClientError\`, whose \`reason\` carries the full request (encoded body\nand auth header included).`,
  );
  writer.writeLine(
    `export class ${prefix}TransportError extends Schema.TaggedErrorClass<${prefix}TransportError>()(`,
  );
  writer.indent(() => {
    writer.writeLine(`${stringLiteral(`${prefix}TransportError`)},`);
    writer.writeLine("{ message: Schema.String, cause: Schema.Unknown },");
  });
  writer.writeLine(") {");
  writer.indent(() => writer.writeLine("readonly [MetaKey] = Meta.transport;"));
  writer.writeLine("}").blankLine();

  writeDoc(
    writer,
    `A request or response the SDK could not encode, read, or decode against its\nschema. The offending value and the underlying issue are preserved for\ndiagnosis but wrapped in \`Redacted\` — a token-bearing response that fails\ndecode on an unrelated field must not leak secrets through a logged error.\nUnwrap deliberately: \`Redacted.value(error.body)\` / \`Redacted.value(error.cause)\`.`,
  );
  writer.writeLine(
    `export class ${prefix}DecodeError extends Schema.TaggedErrorClass<${prefix}DecodeError>()(`,
  );
  writer.indent(() => {
    writer.writeLine(`${stringLiteral(`${prefix}DecodeError`)},`);
    writer.writeLine("{");
    writer.indent(() => {
      writer.writeLine("message: Schema.String,");
      writer.writeLine("body: Schema.optional(RedactedValue),");
      writer.writeLine("cause: RedactedValue,");
    });
    writer.writeLine("},");
  });
  writer.writeLine(") {");
  writer.indent(() => writer.writeLine("readonly [MetaKey] = Meta.parse;"));
  writer.writeLine("}");
};

export const emitErrors = (ir: ClientIr): EmittedFile => {
  const imports = new ImportCollector();
  imports.use(CORE_PACKAGE, "byCode");
  imports.use(CORE_PACKAGE, "ClassifiedErrorClass", { typeOnly: true });
  imports.use(CORE_PACKAGE, "DEFAULT_ERRORS", { alias: "CORE_DEFAULT_ERRORS" });
  imports.use(CORE_PACKAGE, "Meta");
  imports.use(CORE_PACKAGE, "MetaKey");
  imports.use(CORE_PACKAGE, "RedactedValue");
  imports.use(CORE_PACKAGE, "STATUS_ERRORS", { alias: "CORE_STATUS_ERRORS" });
  imports.use("effect/Schema", "Schema", { namespace: true });

  const writer = createWriter();
  writer.writeLine(errorsBanner(ir));
  writer.writeLine(imports.render()).blankLine();
  emitCoreReexports(writer, ir.errors.coreReexports);

  if (ir.errors.codeErrors.length > 0) {
    writer
      .blankLine()
      .writeLine(
        section(ir.errors.codeErrorsSectionTitle, ir.errors.codeErrorsDocs),
      )
      .blankLine();
    for (const [index, error] of ir.errors.codeErrors.entries()) {
      if (index > 0) writer.blankLine();
      emitCodeError(writer, error);
    }
  }

  writer
    .blankLine()
    .writeLine(section("Client-owned fallback / wrapper errors"))
    .blankLine();
  emitWrappers(writer, ir);
  writer
    .blankLine()
    .writeLine(
      section(
        "Matcher tables (consumed by client.ts via core's makeMatchError)",
      ),
    )
    .blankLine();
  writer.writeLine(
    "/** HTTP status → shared error class (core's table, re-exported). */",
  );
  writer
    .writeLine("export const STATUS_ERRORS = CORE_STATUS_ERRORS;")
    .blankLine();
  writeDoc(
    writer,
    `${ir.vendor.display} discriminator code → typed error class, derived from each class's\nown \`code\` schema literal — a map key can never disagree with the literal\nthe class validates.`,
  );
  writer.writeLine(
    "export const CODE_ERRORS: Readonly<Record<string, ClassifiedErrorClass>> =",
  );
  writer.indent(() => {
    writer.writeLine("byCode([");
    writer.indent(() => {
      for (const error of ir.errors.codeErrors)
        writer.writeLine(`${error.className},`);
    });
    writer.writeLine("]);");
  });
  writer.blankLine();
  writeDoc(
    writer,
    `Errors that can arise on any ${ir.vendor.display} operation (401/429/5xx).`,
  );
  writer
    .writeLine("export const DEFAULT_ERRORS = CORE_DEFAULT_ERRORS;")
    .blankLine();
  writer.writeLine("/** Instance union of {@link DEFAULT_ERRORS}. */");
  writer.writeLine(
    `export type ${ir.vendor.prefix}UniversalError = InstanceType<(typeof DEFAULT_ERRORS)[number]>;`,
  );
  writer.blankLine();
  writeDoc(
    writer,
    `Everything a ${ir.vendor.display} operation can fail with *beyond* its own declared typed\nerrors: the universal defaults, the unknown fallback, and the transport /\ndecode wrappers. This is the \`Extra\` union threaded into core's runner.`,
  );
  writer.writeLine(`export type ${ir.vendor.prefix}ExtraError =`);
  writer.indent(() => {
    writer.writeLine(`| ${ir.vendor.prefix}UniversalError`);
    writer.writeLine(`| Unknown${ir.vendor.prefix}Error`);
    writer.writeLine(`| ${ir.vendor.prefix}TransportError`);
    writer.writeLine(`| ${ir.vendor.prefix}DecodeError;`);
  });
  return emitted("src/errors.ts", finishWriter(writer));
};
