import { CodegenError, type CodegenViolation } from "../../errors.ts";
import {
  coreReexportNames,
  type ClientIr,
  type CodeErrorIr,
  type CoreReexportIr,
  type ErrorMetaIr,
  type HttpMethodIr,
  type NamedSchemaIr,
  type OperationIr,
  type PaginationIr,
  type ResourceIr,
  type ScaffoldIr,
} from "../../ir/model.ts";
import type {
  FieldIr,
  LiteralValue,
  SchemaNode,
  StructNode,
} from "../../ir/nodes.ts";
import type { VendorConfig } from "../../ir/vendor-config.ts";
import { isValidIdentifier, reservedWords } from "../../ir/invariants.ts";
import {
  formatPointer,
  getAtPointer,
  isJsonArray,
  isJsonObject,
  ownValue,
  type JsonObject,
  type JsonValue,
} from "./json.ts";
import {
  checkNameCollisions,
  deriveOperationNames,
  deriveRawResource,
  humanizeWords,
  kebabWords,
  pascalWords,
  splitWords,
} from "./naming.ts";
import type { ConfigShadow } from "./patches.ts";

/**
 * The OpenAPI normalizer: patched snapshot + vendor config → the fully
 * resolved `ClientIr` (#31 §2). Every spec construct maps into a closed IR
 * node or hard-errors naming the construct's JSON pointer — the fail-closed
 * posture that makes v1's F1 union-collapse impossible by construction.
 * Violations aggregate across the document so one run names every problem.
 *
 * Deliberate normalization rules (not silent drops):
 * - only `paths` produce operations; `info`, `tags`, `security`, and
 *   `webhooks` are metadata with no client surface;
 * - component schemas unreachable from every operation are pruned — an
 *   unreachable schema cannot affect any emitted type;
 * - object-shaped components become named schemas; alias components (enums,
 *   arrays, records, primitives) are inlined at their reference sites.
 */

const supportedMethods = [
  ["get", "GET"],
  ["post", "POST"],
  ["put", "PUT"],
  ["patch", "PATCH"],
  ["delete", "DELETE"],
  ["head", "HEAD"],
] as const satisfies ReadonlyArray<readonly [string, HttpMethodIr]>;

const statusClasses = new Map<string, CoreReexportIr>([
  ["400", "BadRequest"],
  ["401", "Unauthorized"],
  ["403", "Forbidden"],
  ["404", "NotFound"],
  ["409", "Conflict"],
  ["422", "UnprocessableEntity"],
  ["423", "Locked"],
  ["429", "TooManyRequests"],
  ["500", "InternalServerError"],
  ["502", "BadGateway"],
  ["503", "ServiceUnavailable"],
  ["504", "GatewayTimeout"],
]);

const compare = (left: string, right: string): number =>
  left < right ? -1 : left > right ? 1 : 0;

interface MappedSchema {
  readonly node: SchemaNode;
  readonly nullable: boolean;
}

interface CodeErrorSeed {
  readonly code: string;
  readonly className: string;
  readonly docsStatus: number;
  readonly docsProse: string;
  readonly origin: string;
}

class Normalizer {
  private readonly violations: CodegenViolation[] = [];
  private readonly document: JsonObject;
  private readonly config: VendorConfig;
  private readonly componentSchemas: ReadonlyMap<string, JsonValue>;
  private readonly componentSpecNames: ReadonlyMap<string, string>;
  private readonly publicSchemaNames: ReadonlyMap<string, string>;
  private readonly structComponents: ReadonlySet<string>;
  private readonly aliasCache = new Map<string, MappedSchema>();
  private readonly aliasResolving = new Set<string>();
  private readonly codeErrors = new Map<string, CodeErrorSeed>();
  private readonly referencedCoreClasses = new Set<CoreReexportIr>();
  private readonly configShadows: ConfigShadow[] = [];

  constructor(document: JsonValue, config: VendorConfig) {
    if (!isJsonObject(document)) {
      throw this.fatal(
        "openapi.document",
        "document root",
        "the spec snapshot is not a JSON object",
      );
    }
    this.document = document;
    this.config = config;
    const version = document["openapi"];
    if (typeof version !== "string" || !/^3\.[01]\./u.test(version)) {
      throw this.fatal(
        "openapi.version",
        "document root",
        `unsupported openapi version ${JSON.stringify(version)}; expected 3.0.x or 3.1.x`,
      );
    }
    const schemas = getAtPointer(document, "/components/schemas");
    const componentSchemas = new Map<string, JsonValue>();
    const componentSpecNames = new Map<string, string>();
    const publicSchemaNames = new Map<string, string>();
    const schemaRenames = config.naming?.schemas ?? {};
    if (schemas !== undefined) {
      if (!isJsonObject(schemas)) {
        throw this.fatal(
          "openapi.components",
          "/components/schemas",
          "components.schemas is not an object",
        );
      }
      for (const [name, schema] of Object.entries(schemas)) {
        const configuredPublicName = ownValue(schemaRenames, name);
        const publicName = configuredPublicName ?? name;
        publicSchemaNames.set(name, publicName);
        if (
          configuredPublicName !== undefined &&
          !isValidIdentifier(publicName)
        ) {
          const reason = reservedWords.has(publicName)
            ? "is a reserved word"
            : "is not a TypeScript identifier";
          this.add(
            "config.naming.invalid-schema",
            `naming.schemas.${name} -> ${publicName}`,
            `public schema name ${JSON.stringify(publicName)} ${reason}`,
          );
        }
        const existing = componentSpecNames.get(publicName);
        if (existing !== undefined) {
          this.add(
            "config.naming.schema-collision",
            `schema ${publicName}`,
            `components ${JSON.stringify(existing)} and ${JSON.stringify(name)} both resolve to public schema name ${JSON.stringify(publicName)}`,
          );
          continue;
        }
        componentSchemas.set(publicName, schema);
        componentSpecNames.set(publicName, name);
      }
    }
    for (const name of Object.keys(schemaRenames).sort(compare)) {
      if (!publicSchemaNames.has(name)) {
        this.add(
          "config.naming.unknown-schema",
          `naming.schemas.${name}`,
          `no component schema in the spec is named ${JSON.stringify(name)}`,
        );
      }
    }
    this.componentSchemas = componentSchemas;
    this.componentSpecNames = componentSpecNames;
    this.publicSchemaNames = publicSchemaNames;
    const structComponents = new Set<string>();
    for (const [name, schema] of componentSchemas) {
      if (this.isStructShaped(schema)) structComponents.add(name);
    }
    this.structComponents = structComponents;
  }

  private fatal(
    rule: string,
    construct: string,
    message: string,
  ): CodegenError {
    return new CodegenError([...this.violations, { rule, construct, message }]);
  }

  private add(rule: string, construct: string, message: string): void {
    this.violations.push({ rule, construct, message });
  }

  shadows(): ReadonlyArray<ConfigShadow> {
    return [...this.configShadows].sort(
      (left, right) =>
        compare(left.configKey, right.configKey) ||
        compare(left.specPointer, right.specPointer),
    );
  }

  private isStructShaped(schema: JsonValue): boolean {
    if (!isJsonObject(schema)) return false;
    const type = schema["type"];
    if (type !== "object" && type !== undefined) return false;
    if (!isJsonObject(schema["properties"])) return false;
    const additional = schema["additionalProperties"];
    return additional === undefined || additional === false;
  }

  private refTarget(schema: JsonObject): string | undefined {
    const ref = schema["$ref"];
    if (typeof ref !== "string") return undefined;
    const specName =
      ref.startsWith("#/components/schemas/") &&
      !ref.slice("#/components/schemas/".length).includes("/")
        ? ref.slice("#/components/schemas/".length)
        : undefined;
    return specName === undefined
      ? undefined
      : (this.publicSchemaNames.get(specName) ?? specName);
  }

  private schemaPointer(publicName: string): string {
    return formatPointer([
      "components",
      "schemas",
      this.componentSpecNames.get(publicName) ?? publicName,
    ]);
  }

  /** Map one schema object to an IR node plus field-level nullability. */
  private mapSchema(schema: JsonValue, pointer: string): MappedSchema {
    const fallback: MappedSchema = {
      node: { kind: "string" },
      nullable: false,
    };
    if (!isJsonObject(schema)) {
      this.add("openapi.schema", pointer, "schema is not a JSON object");
      return fallback;
    }
    if (schema["$ref"] !== undefined) {
      const target = this.refTarget(schema);
      if (target === undefined) {
        this.add(
          "openapi.schema.ref",
          pointer,
          `unsupported $ref ${JSON.stringify(schema["$ref"])}; only #/components/schemas/<name> is representable`,
        );
        return fallback;
      }
      if (this.structComponents.has(target)) {
        // A 3.0-style `nullable: true` on the struct component itself is a
        // wire fact; the alias and inline paths already propagate it, and the
        // ref site must too or a legal null fails to decode.
        const component = this.componentSchemas.get(target);
        return {
          node: { kind: "named-ref", name: target },
          nullable: isJsonObject(component) && component["nullable"] === true,
        };
      }
      if (!this.componentSchemas.has(target)) {
        this.add(
          "openapi.schema.ref",
          pointer,
          `$ref target ${JSON.stringify(target)} does not exist in components.schemas`,
        );
        return fallback;
      }
      return this.resolveAlias(target, pointer);
    }
    if (schema["allOf"] !== undefined) {
      this.add(
        "openapi.schema.allof",
        pointer,
        "allOf is not representable; flatten it with a document patch or grow an engine capability",
      );
      return fallback;
    }
    if (schema["not"] !== undefined) {
      this.add("openapi.schema.not", pointer, "not is not representable");
      return fallback;
    }
    const union = schema["oneOf"] ?? schema["anyOf"];
    if (union !== undefined) {
      return this.mapUnion(union, schema, pointer);
    }

    const { type, nullable } = this.baseType(schema, pointer);
    const constValue = schema["const"];
    const enumValues = schema["enum"];

    if (constValue !== undefined) {
      if (!isLiteralValue(constValue)) {
        this.add(
          "openapi.schema.const",
          pointer,
          "const values must be strings, numbers, or booleans",
        );
        return fallback;
      }
      return { node: { kind: "literal", value: constValue }, nullable };
    }
    if (enumValues !== undefined) {
      if (!isJsonArray(enumValues) || enumValues.length === 0) {
        this.add(
          "openapi.schema.enum",
          pointer,
          "enum must be a non-empty array",
        );
        return fallback;
      }
      const literals: LiteralValue[] = [];
      for (const value of enumValues) {
        if (!isLiteralValue(value)) {
          this.add(
            "openapi.schema.enum",
            pointer,
            "enum members must be strings, numbers, or booleans",
          );
          return fallback;
        }
        literals.push(value);
      }
      return literals.length === 1
        ? { node: { kind: "literal", value: literals[0]! }, nullable }
        : { node: { kind: "literals", values: literals }, nullable };
    }

    switch (type) {
      case "string":
        return schema["format"] === "password"
          ? { node: { kind: "secret" }, nullable }
          : { node: { kind: "string" }, nullable };
      case "boolean":
        return { node: { kind: "boolean" }, nullable };
      case "number":
      case "integer":
        return { node: { kind: "number" }, nullable };
      case "array": {
        const items = schema["items"];
        if (items === undefined) {
          this.add(
            "openapi.schema.array",
            pointer,
            "array schemas must declare items",
          );
          return fallback;
        }
        const item = this.mapSchema(items, `${pointer}/items`);
        if (item.nullable) {
          this.add(
            "openapi.nullable.position",
            `${pointer}/items`,
            "nullability is only representable on object properties",
          );
        }
        return { node: { kind: "array", item: item.node }, nullable };
      }
      case "object":
        return this.mapObject(schema, pointer, nullable);
      case undefined:
        if (
          isJsonObject(schema["properties"]) ||
          schema["additionalProperties"] !== undefined
        ) {
          return this.mapObject(schema, pointer, nullable);
        }
        this.add(
          "openapi.schema.type",
          pointer,
          "schema declares no type and no object shape; every construct must map to a closed IR node",
        );
        return fallback;
      default:
        this.add(
          "openapi.schema.type",
          pointer,
          `unsupported type ${JSON.stringify(type)}`,
        );
        return fallback;
    }
  }

  private baseType(
    schema: JsonObject,
    pointer: string,
  ): { readonly type: string | undefined; readonly nullable: boolean } {
    const raw = schema["type"];
    let nullable = schema["nullable"] === true;
    if (typeof raw === "string") {
      if (raw === "null") {
        this.add(
          "openapi.schema.type",
          pointer,
          'a bare "null" type is not representable; nullability belongs on the referencing property',
        );
        return { type: undefined, nullable };
      }
      return { type: raw, nullable };
    }
    if (isJsonArray(raw)) {
      const nonNull = raw.filter((entry) => entry !== "null");
      if (nonNull.length !== 1 || typeof nonNull[0] !== "string") {
        this.add(
          "openapi.schema.type",
          pointer,
          "type arrays must contain exactly one non-null type",
        );
        return { type: undefined, nullable };
      }
      nullable = nullable || nonNull.length !== raw.length;
      return { type: nonNull[0], nullable };
    }
    if (raw !== undefined) {
      this.add(
        "openapi.schema.type",
        pointer,
        "type must be a string or an array of strings",
      );
    }
    return { type: undefined, nullable };
  }

  private mapObject(
    schema: JsonObject,
    pointer: string,
    nullable: boolean,
  ): MappedSchema {
    const properties = schema["properties"];
    const additional = schema["additionalProperties"];
    if (isJsonObject(properties)) {
      if (additional !== undefined && additional !== false) {
        this.add(
          "openapi.schema.mixed-object",
          pointer,
          "an object mixing properties and additionalProperties is not representable",
        );
        return { node: { kind: "string" }, nullable };
      }
      return {
        node: this.mapStruct(schema, pointer),
        nullable,
      };
    }
    if (
      additional === true ||
      (isJsonObject(additional) && Object.keys(additional).length === 0)
    ) {
      return {
        node: {
          kind: "record",
          key: { kind: "string" },
          value: { kind: "json" },
        },
        nullable,
      };
    }
    if (isJsonObject(additional)) {
      const value = this.mapSchema(
        additional,
        `${pointer}/additionalProperties`,
      );
      if (value.nullable) {
        this.add(
          "openapi.nullable.position",
          `${pointer}/additionalProperties`,
          "nullability is only representable on object properties",
        );
      }
      return {
        node: { kind: "record", key: { kind: "string" }, value: value.node },
        nullable,
      };
    }
    this.add(
      "openapi.schema.free-form",
      pointer,
      "a free-form object (no properties, no additionalProperties schema) is not representable",
    );
    return { node: { kind: "string" }, nullable };
  }

  private mapStruct(schema: JsonObject, pointer: string): StructNode {
    const properties = schema["properties"] as JsonObject;
    const requiredRaw = schema["required"];
    const required = new Set<string>();
    if (requiredRaw !== undefined) {
      if (
        !isJsonArray(requiredRaw) ||
        requiredRaw.some((entry) => typeof entry !== "string")
      ) {
        this.add(
          "openapi.schema.required",
          `${pointer}/required`,
          "required must be an array of property names",
        );
      } else {
        for (const name of requiredRaw) required.add(name as string);
      }
    }
    const fields: FieldIr[] = [];
    for (const [name, property] of Object.entries(properties)) {
      const propertyPointer = `${pointer}/properties/${name}`;
      const mapped = this.mapSchema(property, propertyPointer);
      const docs = isJsonObject(property) ? property["description"] : undefined;
      fields.push({
        name,
        schema: mapped.node,
        optional: !required.has(name),
        nullable: mapped.nullable,
        ...(typeof docs === "string" ? { docs } : {}),
      });
    }
    return { kind: "struct", fields };
  }

  private mapUnion(
    members: JsonValue,
    schema: JsonObject,
    pointer: string,
  ): MappedSchema {
    const keyword = schema["oneOf"] !== undefined ? "oneOf" : "anyOf";
    if (!isJsonArray(members) || members.length === 0) {
      this.add(
        "openapi.schema.union",
        pointer,
        `${keyword} must be a non-empty array`,
      );
      return { node: { kind: "string" }, nullable: false };
    }
    let nullable = schema["nullable"] === true;
    const nodes: SchemaNode[] = [];
    members.forEach((member, index) => {
      if (isJsonObject(member) && member["type"] === "null") {
        nullable = true;
        return;
      }
      const mapped = this.mapSchema(member, `${pointer}/${keyword}/${index}`);
      nullable = nullable || mapped.nullable;
      nodes.push(mapped.node);
    });
    if (nodes.length === 0) {
      this.add(
        "openapi.schema.union",
        pointer,
        `${keyword} contains only null members`,
      );
      return { node: { kind: "string" }, nullable };
    }
    if (nodes.length === 1) return { node: nodes[0]!, nullable };
    return { node: { kind: "union", members: nodes }, nullable };
  }

  private resolveAlias(name: string, pointer: string): MappedSchema {
    const cached = this.aliasCache.get(name);
    if (cached !== undefined) return cached;
    if (this.aliasResolving.has(name)) {
      this.add(
        "openapi.schema.cycle",
        pointer,
        `alias component ${JSON.stringify(name)} participates in a reference cycle`,
      );
      return { node: { kind: "string" }, nullable: false };
    }
    this.aliasResolving.add(name);
    const mapped = this.mapSchema(
      this.componentSchemas.get(name)!,
      this.schemaPointer(name),
    );
    this.aliasResolving.delete(name);
    this.aliasCache.set(name, mapped);
    return mapped;
  }

  private resolveComponentRef(
    value: JsonValue,
    kind: "parameters" | "responses",
    pointer: string,
  ): JsonValue | undefined {
    if (!isJsonObject(value) || value["$ref"] === undefined) return value;
    const ref = value["$ref"];
    const prefix = `#/components/${kind}/`;
    if (typeof ref !== "string" || !ref.startsWith(prefix)) {
      this.add(
        `openapi.${kind === "parameters" ? "parameter" : "response"}.ref`,
        pointer,
        `unsupported $ref ${JSON.stringify(ref)}`,
      );
      return undefined;
    }
    const target = getAtPointer(
      this.document,
      `/components/${kind}/${ref.slice(prefix.length)}`,
    );
    if (target === undefined) {
      this.add(
        `openapi.${kind === "parameters" ? "parameter" : "response"}.ref`,
        pointer,
        `$ref target ${JSON.stringify(ref)} does not exist`,
      );
      return undefined;
    }
    return target;
  }

  normalize(): ClientIr {
    const paths = this.document["paths"];
    if (!isJsonObject(paths)) {
      throw this.fatal(
        "openapi.paths",
        "/paths",
        "the document has no paths object",
      );
    }

    const operations: Array<{
      readonly operationId: string;
      readonly qualified: string;
      readonly ir: OperationIr;
    }> = [];
    const operationIds = new Set<string>();
    const derivedResourceNames = new Set<string>();
    const rawResourceNames = new Set<string>();

    for (const [path, item] of Object.entries(paths)) {
      if (path.startsWith("x-")) continue;
      const itemPointer = formatPointer(["paths", path]);
      if (!path.startsWith("/")) {
        this.add(
          "openapi.path-item",
          itemPointer,
          `path key ${JSON.stringify(path)} does not start with "/"; its operations cannot be silently dropped`,
        );
        continue;
      }
      if (!isJsonObject(item)) {
        this.add(
          "openapi.path-item",
          itemPointer,
          "path item is not an object",
        );
        continue;
      }
      if (item["$ref"] !== undefined) {
        this.add(
          "openapi.path-item",
          itemPointer,
          "$ref path items are not supported",
        );
        continue;
      }
      for (const banned of ["options", "trace"]) {
        if (item[banned] !== undefined) {
          this.add(
            "openapi.method",
            `${itemPointer}/${banned}`,
            `the ${banned.toUpperCase()} method is not representable`,
          );
        }
      }
      const itemParameters = item["parameters"] ?? [];
      for (const [key, httpMethod] of supportedMethods) {
        const operation = item[key];
        if (operation === undefined) continue;
        const pointer = `${itemPointer}/${key}`;
        if (!isJsonObject(operation)) {
          this.add("openapi.operation", pointer, "operation is not an object");
          continue;
        }
        this.normalizeOperation(
          path,
          httpMethod,
          operation,
          itemParameters,
          pointer,
          operations,
          operationIds,
          derivedResourceNames,
          rawResourceNames,
        );
      }
    }

    checkNameCollisions(operations, this.violations);
    this.checkConfigReferences(
      operations,
      operationIds,
      derivedResourceNames,
      rawResourceNames,
    );

    const resources = this.assembleResources(operations);
    const namedSchemas = this.assembleNamedSchemas(resources);
    const errors = this.assembleErrors();
    this.checkUnusedCodeMeta();

    if (this.violations.length > 0) {
      throw new CodegenError(this.violations);
    }

    const slug = this.config.vendor.slug;
    const display = this.config.vendor.display;
    const packageName = `@hourglass-financial/api-factory-${slug}`;
    const envPrefix = slug.replaceAll("-", "_").toUpperCase();
    const apiKeyVar = `${envPrefix}_API_KEY`;

    return {
      vendor: {
        slug,
        display,
        prefix: this.config.vendor.prefix,
      },
      packageName,
      baseUrl: this.config.baseUrl,
      envVars: { apiKey: apiKeyVar, baseUrl: `${envPrefix}_API_URL` },
      configErrorMessage: `${display} credentials are not configured (set ${apiKeyVar}).`,
      serviceTags: {
        client: `${packageName}/${this.config.vendor.prefix}Client`,
        credentials: `${packageName}/Credentials`,
      },
      resources,
      namedSchemas,
      errors,
      envelope: {
        decodeDocs:
          this.config.envelope.decodeDocs ??
          `Normalize ${display}'s error envelope into one shape before the generated\nmatcher selects a typed class.`,
        messageFields: this.config.envelope.messageFields,
        discriminatorFields: this.config.envelope.discriminatorFields,
        stringBodyIsMessage: this.config.envelope.stringBodyIsMessage,
      },
      behavioralCoverageLocation: `vendors/${slug}`,
      scaffold: this.assembleScaffold(slug),
    };
  }

  private normalizeOperation(
    path: string,
    httpMethod: HttpMethodIr,
    operation: JsonObject,
    itemParameters: JsonValue,
    pointer: string,
    operations: Array<{
      readonly operationId: string;
      readonly qualified: string;
      readonly ir: OperationIr;
    }>,
    operationIds: Set<string>,
    derivedResourceNames: Set<string>,
    rawResourceNames: Set<string>,
  ): void {
    const operationIdRaw = operation["operationId"];
    if (typeof operationIdRaw !== "string" || operationIdRaw.length === 0) {
      this.add(
        "naming.operation-id",
        pointer,
        "the operation declares no operationId, so no public name is derivable",
      );
      return;
    }
    const operationId = operationIdRaw;
    if (operationIds.has(operationId)) {
      this.add(
        "openapi.operation-id.unique",
        pointer,
        `operationId ${JSON.stringify(operationId)} occurs more than once`,
      );
      return;
    }
    operationIds.add(operationId);

    const tagsRaw = operation["tags"];
    const tags =
      isJsonArray(tagsRaw) === false
        ? []
        : tagsRaw.filter((tag): tag is string => typeof tag === "string");
    const pathSegments = path
      .split("/")
      .filter((segment) => segment.length > 0 && !segment.startsWith("{"));

    const naming = this.config.naming ?? {};
    rawResourceNames.add(deriveRawResource(tags, pathSegments));
    const names = deriveOperationNames(
      {
        operationId,
        pointer,
        tags,
        pathSegments,
        resourceRenames: naming.resources ?? {},
        override: ownValue(naming.operations, operationId),
      },
      this.violations,
    );
    if (names === undefined) return;
    derivedResourceNames.add(names.resource);
    const qualified = `${names.resource}.${names.method}`;
    const overrides = ownValue(this.config.operations, qualified);

    const {
      fields: parameterFields,
      pathParams,
      queryParams,
    } = this.normalizeParameters(operation, itemParameters, pointer);
    const body = this.normalizeRequestBody(operation, pointer);
    const fieldNames = new Set(parameterFields.map((field) => field.name));
    for (const field of body.fields) {
      if (fieldNames.has(field.name)) {
        this.add(
          "openapi.parameter.body-collision",
          `${pointer}/requestBody`,
          `body property ${JSON.stringify(field.name)} collides with a parameter of the same name`,
        );
      }
    }

    const { output, errors, errorsFromCodes } = this.normalizeResponses(
      operation,
      pointer,
    );

    const description = operation["description"];
    const summary = operation["summary"];
    const specDocs =
      typeof description === "string" && description.length > 0
        ? description
        : typeof summary === "string" && summary.length > 0
          ? summary
          : undefined;
    if (
      overrides?.docs !== undefined &&
      typeof description === "string" &&
      description.length > 0
    ) {
      this.configShadows.push({
        kind: "operation.docs",
        configKey: `operations.${qualified}.docs`,
        specPointer: `${pointer}/description`,
      });
    }
    const docs = overrides?.docs ?? specDocs;
    if (docs === undefined) {
      this.add(
        "openapi.operation.docs",
        pointer,
        "the operation has no description or summary; add one via a metadata patch or an operations override",
      );
      return;
    }

    const pagination = this.detectPagination(
      qualified,
      queryParams,
      [...parameterFields, ...body.fields],
      output,
      pointer,
    );

    const ir: OperationIr = {
      publicName: { resource: names.resource, method: names.method },
      bindingName: names.bindingName,
      exportName: names.method,
      inputName: names.inputName,
      errorsName: names.errorsName,
      descriptorName: names.descriptorName,
      opId: qualified,
      httpMethod,
      retry: this.config.retry[httpMethod],
      pathTemplate: path,
      pathParams,
      queryParams,
      input: { kind: "struct", fields: [...parameterFields, ...body.fields] },
      output,
      errors: [...new Set([...errors, ...errorsFromCodes])],
      ...(overrides?.errorsDocs === undefined
        ? {}
        : { errorsDocs: overrides.errorsDocs }),
      ...(Object.keys(body.constantBody).length === 0
        ? {}
        : { constantBody: body.constantBody }),
      docs,
      ...(pagination === undefined ? {} : { pagination }),
    };
    operations.push({ operationId, qualified, ir });
  }

  private normalizeParameters(
    operation: JsonObject,
    itemParameters: JsonValue,
    pointer: string,
  ): {
    readonly fields: ReadonlyArray<FieldIr>;
    readonly pathParams: ReadonlyArray<string>;
    readonly queryParams: ReadonlyArray<string>;
  } {
    const merged: JsonValue[] = [];
    const seen = new Set<string>();
    const opParameters = operation["parameters"] ?? [];
    for (const source of [opParameters, itemParameters]) {
      if (!isJsonArray(source)) {
        this.add(
          "openapi.parameter",
          `${pointer}/parameters`,
          "parameters must be an array",
        );
        continue;
      }
      for (const raw of source) {
        const resolved = this.resolveComponentRef(
          raw,
          "parameters",
          `${pointer}/parameters`,
        );
        if (resolved === undefined) continue;
        if (!isJsonObject(resolved)) {
          this.add(
            "openapi.parameter",
            `${pointer}/parameters`,
            "a parameter entry is not an object",
          );
          continue;
        }
        const name = resolved["name"];
        const where = resolved["in"];
        if (typeof name !== "string" || typeof where !== "string") {
          this.add(
            "openapi.parameter",
            `${pointer}/parameters`,
            "every parameter must declare name and in",
          );
          continue;
        }
        const key = `${where}:${name}`;
        if (seen.has(key)) continue;
        seen.add(key);
        merged.push(resolved);
      }
    }

    const fields: FieldIr[] = [];
    const pathParams: string[] = [];
    const queryParams: string[] = [];
    for (const parameter of merged as ReadonlyArray<JsonObject>) {
      const name = parameter["name"] as string;
      const where = parameter["in"] as string;
      const parameterPointer = `${pointer}/parameters (${where} ${name})`;
      if (where !== "path" && where !== "query") {
        this.add(
          "openapi.parameter.in",
          parameterPointer,
          `parameter location ${JSON.stringify(where)} is not representable`,
        );
        continue;
      }
      if (parameter["content"] !== undefined) {
        this.add(
          "openapi.parameter",
          parameterPointer,
          "content-typed parameters are not representable",
        );
        continue;
      }
      const schema = parameter["schema"];
      if (schema === undefined) {
        this.add(
          "openapi.parameter",
          parameterPointer,
          "parameter declares no schema",
        );
        continue;
      }
      const required = parameter["required"] === true;
      if (where === "path" && !required) {
        this.add(
          "openapi.parameter",
          parameterPointer,
          "path parameters must be required",
        );
        continue;
      }
      const mapped = this.mapSchema(schema, `${parameterPointer} schema`);
      const docs = parameter["description"];
      fields.push({
        name,
        schema: mapped.node,
        optional: !required,
        nullable: mapped.nullable,
        ...(typeof docs === "string" ? { docs } : {}),
      });
      if (where === "path") pathParams.push(name);
      else queryParams.push(name);
    }
    return { fields, pathParams, queryParams };
  }

  private normalizeRequestBody(
    operation: JsonObject,
    pointer: string,
  ): {
    readonly fields: ReadonlyArray<FieldIr>;
    readonly constantBody: Record<string, LiteralValue>;
  } {
    const empty = { fields: [], constantBody: {} };
    const requestBody = operation["requestBody"];
    if (requestBody === undefined) return empty;
    const bodyPointer = `${pointer}/requestBody`;
    if (!isJsonObject(requestBody)) {
      this.add(
        "openapi.request-body",
        bodyPointer,
        "requestBody is not an object",
      );
      return empty;
    }
    if (requestBody["$ref"] !== undefined) {
      this.add(
        "openapi.request-body.ref",
        bodyPointer,
        "$ref request bodies are not supported; inline the body with a document patch",
      );
      return empty;
    }
    const content = requestBody["content"];
    if (!isJsonObject(content)) {
      this.add(
        "openapi.request-body",
        bodyPointer,
        "requestBody declares no content",
      );
      return empty;
    }
    const mediaTypes = Object.keys(content);
    if (mediaTypes.length !== 1 || mediaTypes[0] !== "application/json") {
      this.add(
        "openapi.media-type",
        `${bodyPointer}/content`,
        `only application/json request bodies are representable (found ${mediaTypes
          .map((type) => JSON.stringify(type))
          .join(", ")}); a media-type-fix patch is the sanctioned fix`,
      );
      return empty;
    }
    const media = content["application/json"];
    const schemaRaw = isJsonObject(media) ? media["schema"] : undefined;
    if (schemaRaw === undefined) {
      this.add(
        "openapi.request-body",
        `${bodyPointer}/content/application~1json`,
        "the request body declares no schema",
      );
      return empty;
    }
    const schemaPointer = `${bodyPointer}/content/application~1json/schema`;
    let bodySchema = schemaRaw;
    if (isJsonObject(schemaRaw) && schemaRaw["$ref"] !== undefined) {
      const target = this.refTarget(schemaRaw);
      if (target === undefined || !this.componentSchemas.has(target)) {
        this.add(
          "openapi.request-body",
          schemaPointer,
          `unsupported request-body $ref ${JSON.stringify(schemaRaw["$ref"])}`,
        );
        return empty;
      }
      bodySchema = this.componentSchemas.get(target)!;
    }
    if (!isJsonObject(bodySchema) || !this.isStructShaped(bodySchema)) {
      this.add(
        "openapi.request-body",
        schemaPointer,
        "request bodies must be object schemas with properties",
      );
      return empty;
    }
    const struct = this.mapStruct(bodySchema, schemaPointer);
    const requiredRaw = bodySchema["required"];
    const required = new Set<string>(
      isJsonArray(requiredRaw)
        ? requiredRaw.filter(
            (entry): entry is string => typeof entry === "string",
          )
        : [],
    );
    const fields: FieldIr[] = [];
    const constantBody: Record<string, LiteralValue> = {};
    for (const field of struct.fields) {
      if (
        required.has(field.name) &&
        field.schema.kind === "literal" &&
        !field.nullable
      ) {
        constantBody[field.name] = field.schema.value;
        continue;
      }
      fields.push(field);
    }
    return { fields, constantBody };
  }

  private normalizeResponses(
    operation: JsonObject,
    pointer: string,
  ): {
    readonly output: OperationIr["output"];
    readonly errors: ReadonlyArray<string>;
    readonly errorsFromCodes: ReadonlyArray<string>;
  } {
    const fallback = {
      output: { kind: "void" } as const,
      errors: [],
      errorsFromCodes: [],
    };
    const responses = operation["responses"];
    const responsesPointer = `${pointer}/responses`;
    if (!isJsonObject(responses)) {
      this.add(
        "openapi.responses",
        responsesPointer,
        "the operation declares no responses object",
      );
      return fallback;
    }

    let output: OperationIr["output"] = { kind: "void" };
    let sawSuccess = false;
    let outputSource: string | undefined;
    const errors: string[] = [];
    const errorsFromCodes: string[] = [];

    for (const [status, responseRaw] of Object.entries(responses)) {
      const statusPointer = `${responsesPointer}/${status}`;
      if (!/^\d{3}$/u.test(status)) {
        this.add(
          "openapi.response.status",
          statusPointer,
          `response key ${JSON.stringify(status)} is not a concrete status code; ranges and default are not representable`,
        );
        continue;
      }
      const response = this.resolveComponentRef(
        responseRaw,
        "responses",
        statusPointer,
      );
      if (response === undefined) continue;
      if (!isJsonObject(response)) {
        this.add(
          "openapi.response",
          statusPointer,
          "the response is not an object; a declared status cannot be silently dropped",
        );
        continue;
      }
      const statusNumber = Number(status);

      if (statusNumber >= 200 && statusNumber < 300) {
        sawSuccess = true;
        const successOutput = this.successOutput(response, statusPointer);
        if (successOutput === undefined) continue;
        const source =
          successOutput.kind === "array"
            ? `${successOutput.item.name}[]`
            : successOutput.name;
        if (outputSource !== undefined && outputSource !== source) {
          this.add(
            "openapi.response.success",
            statusPointer,
            `multiple success responses declare different schemas (${JSON.stringify(outputSource)} vs ${JSON.stringify(source)})`,
          );
          continue;
        }
        outputSource = source;
        output = successOutput;
        continue;
      }
      if (statusNumber >= 400 && statusNumber < 600) {
        const lifted = this.liftErrorResponse(
          response,
          statusNumber,
          statusPointer,
        );
        if (lifted === undefined) {
          const coreClass = statusClasses.get(status);
          if (coreClass === undefined) {
            this.add(
              "openapi.response.status",
              statusPointer,
              `status ${status} has no core error class; a document patch or a reviewed core addition is the sanctioned fix`,
            );
            continue;
          }
          this.referencedCoreClasses.add(coreClass);
          errors.push(coreClass);
        } else {
          errorsFromCodes.push(...lifted);
        }
        continue;
      }
      this.add(
        "openapi.response.status",
        statusPointer,
        `status ${status} is neither a success nor an error the IR can represent`,
      );
    }

    if (!sawSuccess) {
      this.add(
        "openapi.response.success",
        responsesPointer,
        "the operation declares no 2xx response",
      );
    }
    return { output, errors, errorsFromCodes };
  }

  private successOutput(
    response: JsonObject,
    pointer: string,
  ): Exclude<OperationIr["output"], { readonly kind: "void" }> | undefined {
    const content = response["content"];
    if (content === undefined) return undefined;
    if (!isJsonObject(content)) {
      this.add("openapi.response.success", pointer, "content is not an object");
      return undefined;
    }
    const mediaTypes = Object.keys(content);
    if (mediaTypes.length === 0) return undefined;
    if (mediaTypes.length !== 1 || mediaTypes[0] !== "application/json") {
      this.add(
        "openapi.media-type",
        `${pointer}/content`,
        `only application/json success responses are representable (found ${mediaTypes
          .map((type) => JSON.stringify(type))
          .join(", ")})`,
      );
      return undefined;
    }
    const media = content["application/json"];
    const schema = isJsonObject(media) ? media["schema"] : undefined;
    if (schema === undefined) {
      this.add(
        "openapi.response.success",
        pointer,
        "the success response declares application/json content without a schema; the body cannot be silently typed away",
      );
      return undefined;
    }
    if (!isJsonObject(schema)) {
      this.add("openapi.response.success", pointer, "schema is not an object");
      return undefined;
    }
    const schemaPointer = `${pointer}/content/application~1json/schema`;
    if (schema["type"] === "array") {
      if (schema["nullable"] === true) {
        this.add(
          "openapi.nullable.position",
          schemaPointer,
          "an array operation output cannot be nullable",
        );
        return undefined;
      }
      const itemsPointer = `${schemaPointer}/items`;
      const items = schema["items"];
      const target = isJsonObject(items) ? this.refTarget(items) : undefined;
      if (target === undefined || !this.structComponents.has(target)) {
        this.add(
          "openapi.response.success",
          itemsPointer,
          "array success items must be a $ref to an object-shaped component schema; extract the item shape into components.schemas via a patch",
        );
        return undefined;
      }
      const component = this.componentSchemas.get(target);
      if (isJsonObject(component) && component["nullable"] === true) {
        this.add(
          "openapi.nullable.position",
          itemsPointer,
          `array success item schema ${JSON.stringify(target)} declares nullable: true, which is not representable as an operation output`,
        );
        return undefined;
      }
      return {
        kind: "array",
        item: { kind: "named-ref", name: target },
      };
    }
    const target = this.refTarget(schema);
    if (target === undefined || !this.structComponents.has(target)) {
      this.add(
        "openapi.response.success",
        schemaPointer,
        "success schemas must be a $ref to an object-shaped component schema; name the shape in components.schemas (via a patch when the spec inlines it)",
      );
      return undefined;
    }
    const component = this.componentSchemas.get(target);
    if (isJsonObject(component) && component["nullable"] === true) {
      this.add(
        "openapi.nullable.position",
        schemaPointer,
        `success schema ${JSON.stringify(target)} declares nullable: true, which is not representable as an operation output`,
      );
      return undefined;
    }
    return { kind: "named-ref", name: target };
  }

  /**
   * Lift a discriminated error table (a union whose every member carries a
   * single-valued discriminator among the envelope's discriminator fields)
   * into code-discriminated error classes. A partially-discriminated union
   * is the F1 signature and hard-errors; a plain schema returns undefined
   * and the status maps to its core class.
   */
  private liftErrorResponse(
    response: JsonObject,
    status: number,
    pointer: string,
  ): ReadonlyArray<string> | undefined {
    const content = response["content"];
    if (!isJsonObject(content)) return undefined;
    const media = content["application/json"];
    if (!isJsonObject(media)) return undefined;
    let schema = media["schema"];
    if (!isJsonObject(schema)) return undefined;
    let schemaPointer = `${pointer}/content/application~1json/schema`;
    if (schema["$ref"] !== undefined) {
      const target = this.refTarget(schema);
      if (target === undefined) return undefined;
      const resolved = this.componentSchemas.get(target);
      if (!isJsonObject(resolved)) return undefined;
      schema = resolved;
      schemaPointer = this.schemaPointer(target);
    }
    const keyword = schema["oneOf"] !== undefined ? "oneOf" : "anyOf";
    const members = schema[keyword];
    if (!isJsonArray(members)) return undefined;
    if (members.length === 0) {
      this.add(
        "openapi.error.member",
        pointer,
        "the error response declares an empty union; a declared status cannot be silently dropped",
      );
      return [];
    }

    const classNames: string[] = [];
    let lifted = true;
    members.forEach((memberRaw, index) => {
      const memberPointer = `${schemaPointer}/${keyword}/${index}`;
      let descriptionPointer = `${memberPointer}/description`;
      let member = memberRaw;
      if (isJsonObject(memberRaw) && memberRaw["$ref"] !== undefined) {
        const target = this.refTarget(memberRaw);
        if (target === undefined || !this.componentSchemas.has(target)) {
          this.add(
            "openapi.error.member",
            memberPointer,
            `unsupported member $ref ${JSON.stringify(memberRaw["$ref"])}`,
          );
          lifted = false;
          return;
        }
        member = this.componentSchemas.get(target)!;
        descriptionPointer = `${this.schemaPointer(target)}/description`;
      }
      if (!isJsonObject(member) || !isJsonObject(member["properties"])) {
        this.add(
          "openapi.error.member",
          memberPointer,
          "every member of a discriminated error table must be an object schema; a partially-discriminated union cannot be represented",
        );
        lifted = false;
        return;
      }
      const code = this.memberDiscriminator(member["properties"]);
      if (code === undefined) {
        this.add(
          "openapi.error.member",
          memberPointer,
          `no discriminator property among ${JSON.stringify(this.config.envelope.discriminatorFields)} carries a single string value; a partially-discriminated union cannot be represented`,
        );
        lifted = false;
        return;
      }
      const description = member["description"];
      const codeProse = ownValue(this.config.errors.codeProse, code);
      const specProse =
        typeof description === "string" && description.length > 0
          ? description
          : undefined;
      const docsProse = codeProse ?? specProse;
      if (docsProse === undefined) {
        this.add(
          "openapi.error.member",
          memberPointer,
          `error member ${JSON.stringify(code)} has no description; add one via a metadata patch or errors.codeProse`,
        );
        lifted = false;
        return;
      }
      if (codeProse !== undefined && specProse !== undefined) {
        this.configShadows.push({
          kind: "error.codeProse",
          configKey: `errors.codeProse.${code}`,
          specPointer: descriptionPointer,
        });
      }
      const className =
        ownValue(this.config.errors.codeClassNames, code) ??
        pascalWords(splitWords(code));
      const existing = this.codeErrors.get(code);
      if (existing !== undefined) {
        if (existing.docsProse !== docsProse) {
          this.add(
            "openapi.error.code-conflict",
            memberPointer,
            `code ${JSON.stringify(code)} was already lifted at ${existing.origin} with different effective prose (${JSON.stringify(existing.docsProse)} vs ${JSON.stringify(docsProse)})`,
          );
          lifted = false;
          return;
        }
        // Codes match before status, so status is documentation rather than
        // identity. Keep the lowest occurrence for deterministic docs.
        this.codeErrors.set(code, {
          ...existing,
          docsStatus: Math.min(existing.docsStatus, status),
        });
      } else {
        this.codeErrors.set(code, {
          code,
          className,
          docsStatus: status,
          docsProse,
          origin: memberPointer,
        });
      }
      classNames.push(className);
    });
    return lifted ? classNames : [];
  }

  private memberDiscriminator(properties: JsonObject): string | undefined {
    for (const field of this.config.envelope.discriminatorFields) {
      const property = ownValue(properties, field);
      if (!isJsonObject(property)) continue;
      const constValue = property["const"];
      if (typeof constValue === "string") return constValue;
      const enumValues = property["enum"];
      if (
        isJsonArray(enumValues) &&
        enumValues.length === 1 &&
        typeof enumValues[0] === "string"
      ) {
        return enumValues[0];
      }
    }
    return undefined;
  }

  private detectPagination(
    qualified: string,
    queryParams: ReadonlyArray<string>,
    fields: ReadonlyArray<FieldIr>,
    output: OperationIr["output"],
    pointer: string,
  ): PaginationIr | undefined {
    const pagination = this.config.pagination;
    if (pagination.mode !== "cursor") return undefined;
    if (!queryParams.includes(pagination.cursorParam)) return undefined;
    const construct = `operation ${qualified} pagination`;
    if (output.kind === "array") {
      this.add(
        "pagination.detect",
        construct,
        "array output cannot use cursor pagination; cursor pagination requires a struct envelope",
      );
      return undefined;
    }
    if (output.kind !== "named-ref") {
      this.add(
        "pagination.detect",
        construct,
        `the ${JSON.stringify(pagination.cursorParam)} cursor parameter is present but the operation has no named output schema (${pointer})`,
      );
      return undefined;
    }
    const pageStruct = this.structNodeFor(output.name);
    if (pageStruct === undefined) return undefined;
    const nextCursor = this.resolveFieldPath(
      pageStruct,
      pagination.nextCursorPath,
    );
    if (nextCursor === undefined || nextCursor.kind !== "string") {
      this.add(
        "pagination.detect",
        construct,
        `next cursor path ${pagination.nextCursorPath.join(".")} does not resolve to a string on ${output.name}; a silently unpaginated operation is not permitted`,
      );
      return undefined;
    }
    const items = this.resolveFieldPath(pageStruct, pagination.itemsPath);
    if (
      items === undefined ||
      items.kind !== "array" ||
      items.item.kind !== "named-ref"
    ) {
      this.add(
        "pagination.detect",
        construct,
        `items path ${pagination.itemsPath.join(".")} does not resolve to an array of a named schema on ${output.name}`,
      );
      return undefined;
    }
    const fieldNames = new Set(fields.map((field) => field.name));
    const resourceWords = splitWords(qualified.split(".")[0]!);
    const itemWords = splitWords(items.item.name);
    return {
      cursorParam: pagination.cursorParam,
      clear: pagination.clearParams.filter((name) => fieldNames.has(name)),
      nextCursorPath: pagination.nextCursorPath,
      itemsPath: pagination.itemsPath,
      pageSchema: { kind: "named-ref", name: output.name },
      itemSchema: { kind: "named-ref", name: items.item.name },
      pagesDocs: `Stream every page of ${humanizeWords(resourceWords).toLowerCase()}, following the \`${pagination.cursorParam}\` cursor.`,
      itemsDocs: `Stream every ${humanizeWords(itemWords).toLowerCase()} across every page.`,
    };
  }

  private structNodeFor(name: string): StructNode | undefined {
    if (!this.structComponents.has(name)) return undefined;
    const schema = this.componentSchemas.get(name)!;
    if (!isJsonObject(schema)) return undefined;
    return this.mapStruct(schema, this.schemaPointer(name));
  }

  private resolveFieldPath(
    start: StructNode,
    path: ReadonlyArray<string>,
  ): SchemaNode | undefined {
    let current: SchemaNode = start;
    for (const segment of path) {
      if (current.kind === "named-ref") {
        const next = this.structNodeFor(current.name);
        if (next === undefined) return undefined;
        current = next;
      }
      if (current.kind !== "struct") return undefined;
      const field: FieldIr | undefined = current.fields.find(
        (entry) => entry.name === segment,
      );
      if (field === undefined) return undefined;
      current = field.schema;
    }
    if (current.kind === "named-ref") {
      const resolved = this.structNodeFor(current.name);
      return resolved ?? current;
    }
    return current;
  }

  private assembleResources(
    operations: ReadonlyArray<{
      readonly operationId: string;
      readonly qualified: string;
      readonly ir: OperationIr;
    }>,
  ): ReadonlyArray<ResourceIr> {
    const byResource = new Map<string, OperationIr[]>();
    for (const { ir } of operations) {
      const list = byResource.get(ir.publicName.resource) ?? [];
      list.push(ir);
      byResource.set(ir.publicName.resource, list);
    }
    const resources: ResourceIr[] = [];
    for (const [name, ops] of byResource) {
      const override = ownValue(this.config.resources, name);
      const paginated = ops.some((op) => op.pagination !== undefined);
      resources.push({
        name,
        fileName: `${kebabWords(splitWords(name))}.ts`,
        docs:
          override?.docs ??
          "Uniform per-operation blocks: input schema + type, a declarative descriptor,\nand a thin exported function that dispatches through `run`.",
        runtimeBannerConcern:
          override?.runtimeBannerConcern ??
          (paginated
            ? "request execution, retry, pagination"
            : "request execution, retry"),
        operations: ops,
      });
    }
    return resources;
  }

  /**
   * Collect the reachable named-schema graph, assign display groups from the
   * first referencing resource in canonical order, and hard-error on
   * reference cycles (the IR's declaration order is topological).
   */
  private assembleNamedSchemas(
    resources: ReadonlyArray<ResourceIr>,
  ): ReadonlyArray<NamedSchemaIr> {
    const groups = new Map<string, string>();
    const structs = new Map<string, StructNode>();

    const visit = (node: SchemaNode, group: string): void => {
      switch (node.kind) {
        case "array":
          visit(node.item, group);
          return;
        case "struct":
          for (const field of node.fields) visit(field.schema, group);
          return;
        case "record":
          visit(node.key, group);
          visit(node.value, group);
          return;
        case "union":
          for (const member of node.members) visit(member, group);
          return;
        case "named-ref": {
          if (groups.has(node.name)) return;
          if (!this.structComponents.has(node.name)) {
            this.add(
              "reference.schema",
              `schema ${node.name}`,
              `named reference ${JSON.stringify(node.name)} does not resolve to an object-shaped component`,
            );
            return;
          }
          groups.set(node.name, group);
          const struct = this.mapStruct(
            this.componentSchemas.get(node.name) as JsonObject,
            this.schemaPointer(node.name),
          );
          structs.set(node.name, struct);
          visit(struct, group);
          return;
        }
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

    const sortedResources = [...resources].sort((left, right) =>
      compare(left.name, right.name),
    );
    for (const resource of sortedResources) {
      const group = humanizeWords(splitWords(resource.name));
      const ops = [...resource.operations].sort((left, right) =>
        compare(left.publicName.method, right.publicName.method),
      );
      for (const op of ops) {
        visit(op.input, group);
        visit(op.output, group);
      }
    }

    this.checkSchemaCycles(structs);

    for (const specName of Object.keys(this.config.naming?.schemas ?? {}).sort(
      compare,
    )) {
      const publicName = this.publicSchemaNames.get(specName);
      if (publicName !== undefined && !structs.has(publicName)) {
        this.add(
          "config.naming.unused-schema",
          `naming.schemas.${specName}`,
          `component ${JSON.stringify(specName)} resolves to ${JSON.stringify(publicName)}, but it is not an emitted named schema`,
        );
      }
    }
    for (const publicName of Object.keys(this.config.schemas ?? {}).sort(
      compare,
    )) {
      if (!structs.has(publicName)) {
        this.add(
          "config.schema-override.unknown",
          `schemas.${publicName}`,
          `no emitted named schema is named ${JSON.stringify(publicName)}`,
        );
      }
    }

    const named: NamedSchemaIr[] = [];
    for (const [name, schema] of structs) {
      const component = this.componentSchemas.get(name);
      const description = isJsonObject(component)
        ? component["description"]
        : undefined;
      const specDocs =
        typeof description === "string" && description.length > 0
          ? description
          : undefined;
      const override = ownValue(this.config.schemas, name);
      const docs = override?.docs ?? specDocs;
      if (docs === undefined) {
        this.add(
          "openapi.schema.docs",
          this.schemaPointer(name),
          "the component schema has no description; add one via a metadata patch or schemas override",
        );
        continue;
      }
      if (override !== undefined && specDocs !== undefined) {
        this.configShadows.push({
          kind: "schema.docs",
          configKey: `schemas.${name}.docs`,
          specPointer: `${this.schemaPointer(name)}/description`,
        });
      }
      named.push({
        name,
        group: groups.get(name)!,
        docs,
        schema,
      });
    }
    return named;
  }

  private checkSchemaCycles(structs: ReadonlyMap<string, StructNode>): void {
    const visiting = new Set<string>();
    const done = new Set<string>();
    const refs = (node: SchemaNode, into: Set<string>): void => {
      switch (node.kind) {
        case "array":
          refs(node.item, into);
          return;
        case "struct":
          for (const field of node.fields) refs(field.schema, into);
          return;
        case "record":
          refs(node.key, into);
          refs(node.value, into);
          return;
        case "union":
          for (const member of node.members) refs(member, into);
          return;
        case "named-ref":
          into.add(node.name);
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
    const walk = (name: string, trail: ReadonlyArray<string>): void => {
      if (done.has(name)) return;
      if (visiting.has(name)) {
        this.add(
          "openapi.schema.cycle",
          `schema ${name}`,
          `schema reference cycle: ${[...trail, name].join(" -> ")}`,
        );
        return;
      }
      visiting.add(name);
      const struct = structs.get(name);
      if (struct !== undefined) {
        const targets = new Set<string>();
        refs(struct, targets);
        for (const target of [...targets].sort(compare)) {
          walk(target, [...trail, name]);
        }
      }
      visiting.delete(name);
      done.add(name);
    };
    for (const name of [...structs.keys()].sort(compare)) walk(name, []);
  }

  private assembleErrors(): ClientIr["errors"] {
    const codeErrors: CodeErrorIr[] = [];
    const codeMeta = this.config.errors.codeMeta;
    for (const seed of this.codeErrors.values()) {
      const meta = ownValue(codeMeta, seed.code) as ErrorMetaIr | undefined;
      if (meta === undefined) {
        this.add(
          "config.error-meta.missing",
          `error code ${seed.code}`,
          `lifted code ${JSON.stringify(seed.code)} has no errors.codeMeta assignment in the vendor config`,
        );
        continue;
      }
      codeErrors.push({
        className: seed.className,
        tag: seed.className,
        code: seed.code,
        meta,
        docsStatus: seed.docsStatus,
        docsProse: seed.docsProse,
      });
    }
    const coreReexports =
      this.config.errors.coreReexports === "all"
        ? [...coreReexportNames].sort(compare)
        : [...this.referencedCoreClasses].sort(compare);
    return {
      ...(this.config.errors.docs === undefined
        ? {}
        : { docs: this.config.errors.docs }),
      codeErrorsSectionTitle:
        this.config.errors.sectionTitle ?? "Code-discriminated errors",
      ...(this.config.errors.codeDocs === undefined
        ? {}
        : { codeErrorsDocs: this.config.errors.codeDocs }),
      codeErrors,
      coreReexports,
    };
  }

  private checkUnusedCodeMeta(): void {
    for (const code of Object.keys(this.config.errors.codeMeta).sort(compare)) {
      if (!this.codeErrors.has(code)) {
        this.add(
          "config.error-meta.unused",
          `error code ${code}`,
          `errors.codeMeta assigns ${JSON.stringify(code)}, but no lifted error carries that code`,
        );
      }
    }
    for (const code of Object.keys(this.config.errors.codeProse ?? {}).sort(
      compare,
    )) {
      if (!this.codeErrors.has(code)) {
        this.add(
          "config.error-prose.unused",
          `error code ${code}`,
          `errors.codeProse assigns ${JSON.stringify(code)}, but no lifted error carries that code`,
        );
      }
    }
    for (const code of Object.keys(
      this.config.errors.codeClassNames ?? {},
    ).sort(compare)) {
      if (!this.codeErrors.has(code)) {
        this.add(
          "config.error-class-name.unused",
          `error code ${code}`,
          `errors.codeClassNames assigns ${JSON.stringify(code)}, but no lifted error carries that code`,
        );
      }
    }
  }

  private checkConfigReferences(
    operations: ReadonlyArray<{
      readonly operationId: string;
      readonly qualified: string;
    }>,
    operationIds: ReadonlySet<string>,
    derivedResourceNames: ReadonlySet<string>,
    rawResourceNames: ReadonlySet<string>,
  ): void {
    const qualifiedNames = new Set(operations.map((entry) => entry.qualified));
    const naming = this.config.naming ?? {};
    for (const key of Object.keys(naming.operations ?? {}).sort(compare)) {
      if (!operationIds.has(key)) {
        this.add(
          "config.naming.unknown-operation",
          `naming.operations.${key}`,
          `no operation in the spec has operationId ${JSON.stringify(key)}`,
        );
      }
    }
    for (const key of Object.keys(naming.resources ?? {}).sort(compare)) {
      if (!rawResourceNames.has(key)) {
        this.add(
          "config.naming.unknown-resource",
          `naming.resources.${key}`,
          `no operation derives the resource name ${JSON.stringify(key)}`,
        );
      }
    }
    for (const key of Object.keys(this.config.resources ?? {}).sort(compare)) {
      if (!derivedResourceNames.has(key)) {
        this.add(
          "config.resource-override.unknown",
          `resources.${key}`,
          `no resolved resource is named ${JSON.stringify(key)}`,
        );
      }
    }
    for (const key of Object.keys(this.config.operations ?? {}).sort(compare)) {
      if (!qualifiedNames.has(key)) {
        this.add(
          "config.operation-override.unknown",
          `operations.${key}`,
          `no resolved operation is named ${JSON.stringify(key)}`,
        );
      }
    }
  }

  private assembleScaffold(slug: string): ScaffoldIr {
    return {
      version: this.config.packageVersion ?? "0.0.0",
      private: true,
      repository: {
        type: "git",
        url: "https://github.com/hourglass-financial/distilled",
        directory: `api-factory/clients/${slug}`,
      },
      type: "module",
      sideEffects: false,
      module: "src/index.ts",
      files: ["lib", "src"],
      exports: {
        types: "./lib/index.d.ts",
        bun: "./src/index.ts",
        default: "./lib/index.js",
      },
      scripts: {
        typecheck: "tsc && tsc -p tsconfig.test.json",
        build: "tsc -b",
        fmt: "oxfmt --write src test",
        lint: "oxlint --fix src test",
        check: "bun run typecheck && oxlint src test && oxfmt --check src test",
        test: "bunx vitest run test",
      },
      dependencies: [
        {
          name: "@hourglass-financial/api-factory-core",
          version: "workspace:*",
        },
      ],
      peerDependencies: [{ name: "effect", version: "catalog:" }],
      devDependencies: [
        { name: "@types/bun", version: "catalog:" },
        { name: "@types/node", version: "catalog:" },
        { name: "effect", version: "catalog:" },
        { name: "vitest", version: "catalog:" },
      ],
      tsconfig: {
        extends: "../../tsconfig.base.json",
        include: ["src/**/*.ts"],
        compilerOptions: { outDir: "./lib", rootDir: "./src" },
        references: ["../../packages/core"],
      },
      testTsconfig: {
        extends: "../../tsconfig.base.json",
        include: ["src/**/*.ts", "test/**/*.ts"],
        compilerOptions: {
          rootDir: ".",
          noEmit: true,
          paths: [{ alias: "~/*", targets: ["./src/*"] }],
        },
        references: [],
      },
    };
  }
}

const isLiteralValue = (value: JsonValue): value is LiteralValue =>
  typeof value === "string" ||
  typeof value === "number" ||
  typeof value === "boolean";

/**
 * Normalize a patched OpenAPI document into the fully-resolved `ClientIr`.
 * Throws an aggregating `CodegenError` naming every unrepresentable
 * construct by JSON pointer.
 */
export const normalizeOpenApi = (
  document: JsonValue,
  config: VendorConfig,
): ClientIr => normalizeOpenApiWithConfigShadows(document, config).ir;

export const normalizeOpenApiWithConfigShadows = (
  document: JsonValue,
  config: VendorConfig,
): {
  readonly ir: ClientIr;
  readonly configShadows: ReadonlyArray<ConfigShadow>;
} => {
  const normalizer = new Normalizer(document, config);
  const ir = normalizer.normalize();
  return { ir, configShadows: normalizer.shadows() };
};
