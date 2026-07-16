/**
 * Persona SDK Code Generator
 *
 * Persona publishes OpenAPI 3.1 snapshots by API version. This package targets
 * the bundled 2025-12-08 snapshot and delegates schema/operation generation to
 * the shared OpenAPI generator after normalizing parameter names that are not
 * valid TypeScript identifiers.
 */
import * as fs from "fs";
import * as path from "path";
import { generateFromOpenAPI } from "@distilled.cloud/core/openapi/generate";

const rootDir = path.join(import.meta.dir, "..");
const sourceSpecPath = path.join(
  rootDir,
  "specs/persona-openapi/2025-12-08/openapi-bundled.json",
);
const tmpDir = path.join(rootDir, ".gen-tmp");
const normalizedSpecPath = path.join(tmpDir, "openapi.json");
const operationsDir = path.join(rootDir, "src/operations");

const HTTP_METHODS = ["get", "post", "put", "patch", "delete"] as const;

type SchemaObject = {
  type?: string | string[];
  $ref?: string;
  enum?: Array<string | number | boolean>;
  properties?: Record<string, SchemaObject>;
  required?: string[];
  items?: SchemaObject;
  additionalProperties?: boolean | SchemaObject;
  nullable?: boolean;
  oneOf?: SchemaObject[];
  anyOf?: SchemaObject[];
  allOf?: SchemaObject[];
};

type ParameterObject = {
  name: string;
  in: "path" | "query" | "header" | "cookie";
  required?: boolean;
  schema?: SchemaObject;
  $ref?: string;
};

type OperationQueryParam = {
  readonly fieldName: string;
  readonly wireName: string;
  readonly required: boolean;
  readonly schema: SchemaObject;
};

const toCamelCase = (value: string): string =>
  value
    .replace(/[-_\s]+([a-zA-Z])/g, (_, c: string) => c.toUpperCase())
    .replace(/[^a-zA-Z0-9$]/g, "");

const operationIdToFunctionName = (operationId: string): string =>
  toCamelCase(operationId);

const toFieldName = (name: string): string => {
  const camel = toCamelCase(name);
  return camel.charAt(0).toLowerCase() + camel.slice(1);
};

const quoteString = (value: string): string =>
  value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

const quotePropKey = (name: string): string =>
  /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name) ? name : `"${quoteString(name)}"`;

const replaceTopLevelInputField = (
  content: string,
  fieldName: string,
  replacement: string,
): string => {
  const marker = `\n  ${quotePropKey(fieldName)}:`;
  const inputSchemaStart = content.indexOf("\nexport const ");
  const outputSchemaStart = content.indexOf("\n// Output Schema");
  const markerIndex = content.indexOf(marker, inputSchemaStart);
  if (
    inputSchemaStart < 0 ||
    outputSchemaStart < 0 ||
    markerIndex < inputSchemaStart ||
    markerIndex >= outputSchemaStart
  ) {
    throw new Error(`Could not replace generated query field: ${fieldName}`);
  }
  const start = markerIndex + 1;
  const valueStart = content.indexOf(":", start) + 1;
  let depth = 0;
  let quote: '"' | "'" | "`" | undefined;
  let escaped = false;

  for (let index = valueStart; index < content.length; index++) {
    const character = content[index];
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === quote) {
        quote = undefined;
      }
      continue;
    }
    if (character === '"' || character === "'" || character === "`") {
      quote = character;
    } else if (character === "(" || character === "[" || character === "{") {
      depth++;
    } else if (character === ")" || character === "]" || character === "}") {
      depth--;
    } else if (character === "," && depth === 0) {
      return `${content.slice(0, start)}${replacement}${content.slice(index + 1)}`;
    }
  }

  throw new Error(`Could not find end of generated query field: ${fieldName}`);
};

const spec = JSON.parse(fs.readFileSync(sourceSpecPath, "utf-8"));

const resolveParameter = (param: ParameterObject): ParameterObject => {
  if (!param.$ref) return param;
  const key = param.$ref.replace("#/components/parameters/", "");
  const resolved = spec.components?.parameters?.[key];
  if (!resolved) {
    throw new Error(`Could not resolve parameter ref: ${param.$ref}`);
  }
  return resolved;
};

const resolveSchemaRef = (schema: SchemaObject): SchemaObject => {
  if (!schema.$ref) return schema;
  const segments = schema.$ref.slice(2).split("/");
  let current: unknown = spec;
  for (const segment of segments) {
    current = (current as Record<string, unknown>)?.[segment];
  }
  if (!current) throw new Error(`Could not resolve schema ref: ${schema.$ref}`);
  return current as SchemaObject;
};

const getBaseType = (schema: SchemaObject): string | undefined => {
  if (Array.isArray(schema.type)) {
    return schema.type.find((type) => type !== "null");
  }
  return schema.type;
};

const renderEnum = (
  values: Array<string | number | boolean>,
  type: string | undefined,
): string => {
  const isNumeric = type === "integer" || type === "number";
  const isBoolean = type === "boolean";
  const literals = values
    .map((value) =>
      isBoolean || isNumeric
        ? String(value)
        : `"${quoteString(String(value))}"`,
    )
    .join(", ");
  return `Schema.Literals([${literals}])`;
};

const renderQuerySchema = (
  schema: SchemaObject,
  seenRefs: Set<string> = new Set(),
  indent = "  ",
): string => {
  if (schema.$ref) {
    if (seenRefs.has(schema.$ref)) return "Schema.Unknown";
    return renderQuerySchema(
      resolveSchemaRef(schema),
      new Set([...seenRefs, schema.$ref]),
      indent,
    );
  }

  if (schema.allOf?.length) {
    const properties: Record<string, SchemaObject> = {};
    const required: string[] = [];
    for (const member of schema.allOf) {
      const resolved = member.$ref ? resolveSchemaRef(member) : member;
      Object.assign(properties, resolved.properties ?? {});
      required.push(...(resolved.required ?? []));
    }
    return renderQuerySchema({
      type: "object",
      properties,
      required: [...new Set(required)],
    });
  }

  if (schema.oneOf || schema.anyOf) return "Schema.Unknown";

  if (schema.enum?.length) {
    return renderEnum(schema.enum, getBaseType(schema));
  }

  const baseType = getBaseType(schema);
  switch (baseType) {
    case "integer":
    case "number":
      return "Schema.Number";
    case "boolean":
      return "Schema.Boolean";
    case "array":
      return schema.items
        ? `Schema.Array(${renderQuerySchema(schema.items, seenRefs, indent)})`
        : "Schema.Array(Schema.Unknown)";
    case "object": {
      if (schema.properties) {
        const required = new Set(schema.required ?? []);
        const lines = Object.entries(schema.properties).map(([key, value]) => {
          const rendered = renderQuerySchema(value, seenRefs, `${indent}  `);
          const fieldSchema = required.has(key)
            ? rendered
            : `Schema.optional(${rendered})`;
          return `${indent}  ${quotePropKey(key)}: ${fieldSchema},`;
        });
        return `Schema.Struct({\n${lines.join("\n")}\n${indent}})`;
      }
      if (schema.additionalProperties) {
        if (typeof schema.additionalProperties === "boolean") {
          return "Schema.Record(Schema.String, Schema.Unknown)";
        }
        return `Schema.Record(Schema.String, ${renderQuerySchema(
          schema.additionalProperties,
          seenRefs,
          indent,
        )})`;
      }
      return "Schema.Unknown";
    }
    default:
      return "Schema.String";
  }
};

const operationQueries = new Map<string, OperationQueryParam[]>();
const pathRename = new Map<string, string>();

for (const [pathTemplate, pathItem] of Object.entries(
  spec.paths ?? {},
) as Array<[string, any]>) {
  const normalizedPath = pathTemplate.replace(
    /\{([^}]+)\}/g,
    (_match, name) => {
      const fieldName = toFieldName(name);
      pathRename.set(name, fieldName);
      return `{${fieldName}}`;
    },
  );

  if (normalizedPath !== pathTemplate) {
    delete spec.paths[pathTemplate];
    spec.paths[normalizedPath] = pathItem;
  }

  for (const method of HTTP_METHODS) {
    const operation = pathItem[method];
    if (!operation) continue;

    const queryParams: OperationQueryParam[] = [];
    for (const rawParam of [
      ...(pathItem.parameters ?? []),
      ...(operation.parameters ?? []),
    ] as ParameterObject[]) {
      const param = resolveParameter(rawParam);
      if (param.in === "path") {
        param.name = pathRename.get(param.name) ?? toFieldName(param.name);
      }
      if (param.in === "query") {
        const fieldName = toFieldName(param.name);
        queryParams.push({
          fieldName,
          wireName: param.name,
          required: param.required === true,
          schema: param.schema ?? { type: "string" },
        });
        param.name = fieldName;
      }
    }

    if (queryParams.length > 0) {
      operationQueries.set(
        operationIdToFunctionName(operation.operationId),
        queryParams,
      );
    }
  }
}

fs.mkdirSync(tmpDir, { recursive: true });
fs.writeFileSync(normalizedSpecPath, JSON.stringify(spec));

generateFromOpenAPI({
  specPath: normalizedSpecPath,
  patchDir: path.join(rootDir, "patches"),
  outputDir: operationsDir,
  importPrefix: "..",
  clientImport: "../client",
  traitsImport: "../traits",
  sensitiveImport: "../sensitive",
  errorsImport: "../errors",
  includeOperationErrors: true,
  skipDeprecated: true,
  statusToErrorClass: {
    "400": "BadRequest",
    "403": "Forbidden",
    "404": "NotFound",
    "408": "RequestTimeout",
    "409": "Conflict",
    "422": "UnprocessableEntity",
  },
});

for (const [functionName, queryParams] of operationQueries) {
  const filePath = path.join(operationsDir, `${functionName}.ts`);
  let content = fs.readFileSync(filePath, "utf-8");

  for (const queryParam of queryParams) {
    const schemaCode = renderQuerySchema(queryParam.schema);
    const wrappedSchema = queryParam.required
      ? schemaCode
      : `Schema.optional(${schemaCode})`;
    const replacement = `  ${quotePropKey(
      queryParam.fieldName,
    )}: ${wrappedSchema}.pipe(T.HttpQuery("${quoteString(
      queryParam.wireName,
    )}")),`;
    content = replaceTopLevelInputField(
      content,
      queryParam.fieldName,
      replacement,
    );
  }

  fs.writeFileSync(filePath, content);
}

fs.rmSync(tmpDir, { recursive: true, force: true });
