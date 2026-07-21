import type { ClientIr, OperationIr, ResourceIr } from "../ir/model.ts";
import type { SchemaNode } from "../ir/nodes.ts";
import { ImportCollector } from "./imports.ts";
import { emitField, emitSchemaNode, hasSecret } from "./schemas.ts";
import {
  banner,
  CORE_PACKAGE,
  createWriter,
  emitted,
  type EmittedFile,
  finishWriter,
  operationSection,
  stringLiteral,
  writeDoc,
  writeLineComment,
} from "./shared.ts";

const collectRefs = (node: SchemaNode, refs: Set<string>): void => {
  switch (node.kind) {
    case "named-ref":
      refs.add(node.name);
      return;
    case "array":
      collectRefs(node.item, refs);
      return;
    case "struct":
      for (const field of node.fields) collectRefs(field.schema, refs);
      return;
    case "record":
      collectRefs(node.key, refs);
      collectRefs(node.value, refs);
      return;
    case "union":
      for (const member of node.members) collectRefs(member, refs);
      return;
    case "string":
    case "boolean":
    case "number":
    case "json":
    case "literal":
    case "literals":
    case "secret":
    case "void":
      return;
  }
};

const qualified = (operation: OperationIr): string =>
  `${operation.publicName.resource}.${operation.publicName.method}`;

const outputName = (operation: OperationIr): string =>
  emitSchemaNode(operation.output);

const outputSchemaType = (operation: OperationIr): string =>
  operation.output.kind === "array"
    ? `Schema.$Array<typeof ${operation.output.item.name}>`
    : operation.output.kind === "union"
      ? `Schema.Union<readonly [${operation.output.members
          .map((member) => `typeof ${member.name}`)
          .join(", ")}]>`
      : `typeof ${outputName(operation)}`;

const outputType = (operation: OperationIr): string =>
  operation.output.kind === "void"
    ? "void"
    : operation.output.kind === "array"
      ? `ReadonlyArray<${operation.output.item.name}>`
      : operation.output.kind === "union"
        ? operation.output.members.map((member) => member.name).join(" | ")
        : operation.output.name;

const allOptional = (operation: OperationIr): boolean =>
  operation.input.fields.every((field) => field.optional);

const accessPath = (root: string, path: ReadonlyArray<string>): string =>
  path.reduce(
    (value, segment) =>
      /^[$A-Z_a-z][$\w]*$/u.test(segment)
        ? `${value}.${segment}`
        : `${value}[${stringLiteral(segment)}]`,
    root,
  );

const emitOperation = (
  writer: ReturnType<typeof createWriter>,
  operation: OperationIr,
  prefix: string,
): string => {
  writer
    .writeLine(
      operationSection(
        qualified(operation),
        operation.httpMethod,
        operation.pathTemplate,
        operation.pagination !== undefined,
      ),
    )
    .blankLine();
  writer.writeLine(`export const ${operation.inputName} = Schema.Struct({`);
  writer.indent(() => {
    for (const field of operation.input.fields) {
      writer.writeLine(`${emitField(field)},`);
    }
  });
  writer.writeLine("});");
  writer.writeLine(
    `export interface ${operation.inputName} extends Schema.Schema.Type<typeof ${operation.inputName}> {}`,
  );
  writer.blankLine();
  if (operation.errorsDocs !== undefined) {
    writeLineComment(writer, operation.errorsDocs);
  }
  writer
    .writeLine(
      `const ${operation.errorsName} = [${operation.errors.join(", ")}] as const;`,
    )
    .blankLine();
  writer.writeLine(`const ${operation.descriptorName}: Operation<`);
  writer.indent(() => {
    writer.writeLine(`typeof ${operation.inputName},`);
    writer.writeLine(`${outputSchemaType(operation)},`);
    writer.writeLine(`typeof ${operation.errorsName}`);
  });
  writer.writeLine("> = {");
  writer.indent(() => {
    writer.writeLine(`id: ${stringLiteral(operation.opId)},`);
    writer.writeLine(`method: ${stringLiteral(operation.httpMethod)},`);
    writer.writeLine(`retry: ${stringLiteral(operation.retry)},`);
    writer.writeLine(`pathTemplate: ${stringLiteral(operation.pathTemplate)},`);
    writer.writeLine(
      `pathParams: [${operation.pathParams.map(stringLiteral).join(", ")}],`,
    );
    writer.writeLine(
      `queryParams: [${operation.queryParams.map(stringLiteral).join(", ")}],`,
    );
    writer.writeLine(`input: ${operation.inputName},`);
    writer.writeLine(`output: ${outputName(operation)},`);
    writer.writeLine(`errors: ${operation.errorsName},`);
    if (operation.constantBody !== undefined) {
      const values = Object.entries(operation.constantBody).map(
        ([key, value]) => {
          const emittedValue =
            typeof value === "string" ? stringLiteral(value) : String(value);
          return `${stringLiteral(key)}: ${emittedValue}`;
        },
      );
      writer.writeLine(`constantBody: { ${values.join(", ")} },`);
    }
  });
  writer.writeLine("};").blankLine();
  writeDoc(writer, operation.docs);
  const declaration =
    operation.bindingName === operation.exportName ? "export const" : "const";
  writer.writeLine(`${declaration} ${operation.bindingName} = (`);
  writer.indent(() => {
    writer.writeLine(
      `input: ${operation.inputName}${allOptional(operation) ? " = {}" : ""},`,
    );
  });
  writer.writeLine(
    `): Effect.Effect<${outputType(operation)}, ${prefix}Error<typeof ${operation.errorsName}>, ${prefix}Client> =>`,
  );
  writer.indent(() =>
    writer.writeLine(`run(${operation.descriptorName}, input);`),
  );

  if (operation.bindingName !== operation.exportName) {
    writer.blankLine();
    writer.writeLine(
      `// \`${operation.exportName}\` is a reserved word as a declaration name but a legal export name;`,
    );
    writer.writeLine(
      "// the rename-export keeps the public surface on the API's own verb.",
    );
    writer.writeLine(
      `export { ${operation.bindingName} as ${operation.exportName} };`,
    );
  }

  if (operation.pagination !== undefined) {
    const pagination = operation.pagination;
    const method = operation.publicName.method;
    writer.blankLine();
    writer.writeLine(`const ${method}Pagination: Pagination.CursorPagination<`);
    writer.indent(() => {
      writer.writeLine(`${operation.inputName},`);
      writer.writeLine(`${pagination.pageSchema.name},`);
      writer.writeLine(`${pagination.itemSchema.name}`);
    });
    writer.writeLine("> = {");
    writer.indent(() => {
      writer.writeLine(
        `cursorParam: ${stringLiteral(pagination.cursorParam)},`,
      );
      writer.writeLine(
        `clear: [${pagination.clear.map(stringLiteral).join(", ")}],`,
      );
      writer.writeLine(
        `nextCursor: (page) => ${accessPath("page", pagination.nextCursorPath)},`,
      );
      writer.writeLine(
        `items: (page) => ${accessPath("page", pagination.itemsPath)},`,
      );
    });
    writer.writeLine("};").blankLine();
    writeDoc(writer, pagination.pagesDocs);
    writer.writeLine(`export const ${method}Pages = (`);
    writer.indent(() => {
      writer.writeLine(
        `input: ${operation.inputName}${allOptional(operation) ? " = {}" : ""},`,
      );
    });
    writer.writeLine(
      `): Stream.Stream<${pagination.pageSchema.name}, ${prefix}Error<typeof ${operation.errorsName}>, ${prefix}Client> =>`,
    );
    writer.indent(() =>
      writer.writeLine(
        `Pagination.pages(${operation.bindingName}, input, ${method}Pagination);`,
      ),
    );
    writer.blankLine();
    writeDoc(writer, pagination.itemsDocs);
    writer.writeLine(`export const ${method}Items = (`);
    writer.indent(() => {
      writer.writeLine(
        `input: ${operation.inputName}${allOptional(operation) ? " = {}" : ""},`,
      );
    });
    writer.writeLine(
      `): Stream.Stream<${pagination.itemSchema.name}, ${prefix}Error<typeof ${operation.errorsName}>, ${prefix}Client> =>`,
    );
    writer.indent(() =>
      writer.writeLine(
        `Pagination.items(${operation.bindingName}, input, ${method}Pagination);`,
      ),
    );
  }
  return qualified(operation);
};

export const emitResource = (
  ir: ClientIr,
  resource: ResourceIr,
): EmittedFile => {
  const imports = new ImportCollector();
  imports.use(CORE_PACKAGE, "Operation", { typeOnly: true });
  if (
    resource.operations.some((operation) => operation.pagination !== undefined)
  ) {
    imports.use(CORE_PACKAGE, "Pagination");
  }
  if (resource.operations.some((operation) => hasSecret(operation.input))) {
    imports.use(CORE_PACKAGE, "Secret");
  }
  const codeErrors = new Set(
    ir.errors.codeErrors.map((error) => error.className),
  );
  for (const error of new Set(
    resource.operations.flatMap((operation) => operation.errors),
  )) {
    imports.use(codeErrors.has(error) ? "../errors.ts" : CORE_PACKAGE, error);
  }
  imports.use("effect/Effect", "Effect", { namespace: true, typeOnly: true });
  imports.use("effect/Schema", "Schema", { namespace: true });
  if (
    resource.operations.some((operation) => operation.pagination !== undefined)
  ) {
    imports.use("effect/Stream", "Stream", { namespace: true, typeOnly: true });
  }
  imports.use("../client.ts", "run");
  imports.use("../client.ts", `${ir.vendor.prefix}Client`, { typeOnly: true });
  imports.use("../client.ts", `${ir.vendor.prefix}Error`, { typeOnly: true });
  const refs = new Set<string>();
  for (const operation of resource.operations) {
    collectRefs(operation.input, refs);
    collectRefs(operation.output, refs);
    if (operation.pagination !== undefined) {
      refs.add(operation.pagination.pageSchema.name);
      refs.add(operation.pagination.itemSchema.name);
    }
  }
  for (const ref of refs) imports.use("../schemas.ts", ref);

  const writer = createWriter();
  writer.writeLine(
    banner(
      [
        `operation surface / wire shapes / errors → the ${ir.vendor.display} OpenAPI spec`,
        `${resource.runtimeBannerConcern} → ${CORE_PACKAGE}`,
      ],
      resource.docs,
    ),
  );
  writer.writeLine(imports.render());
  const dispatchOps: string[] = [];
  for (const operation of resource.operations) {
    writer.blankLine();
    dispatchOps.push(emitOperation(writer, operation, ir.vendor.prefix));
  }
  return emitted(`src/resources/${resource.fileName}`, finishWriter(writer), {
    dispatchOps,
  });
};

export const emitResources = (ir: ClientIr): ReadonlyArray<EmittedFile> =>
  ir.resources.map((resource) => emitResource(ir, resource));
