import * as Schema from "effect/Schema";

export type LiteralValue = string | number | boolean;

export interface StringNode {
  readonly kind: "string";
}

export interface BooleanNode {
  readonly kind: "boolean";
}

export interface NumberNode {
  readonly kind: "number";
}

/**
 * An arbitrary JSON value. It identity-decodes any valid JSON and is not
 * secret-aware: non-JSON values such as Redacted are rejected during encode.
 */
export interface JsonNode {
  readonly kind: "json";
}

export interface LiteralNode {
  readonly kind: "literal";
  readonly value: LiteralValue;
}

export interface LiteralsNode {
  readonly kind: "literals";
  readonly values: ReadonlyArray<LiteralValue>;
}

export interface ArrayNode {
  readonly kind: "array";
  readonly item: SchemaNode;
}

export interface FieldIr {
  readonly name: string;
  readonly schema: SchemaNode;
  readonly optional: boolean;
  readonly nullable: boolean;
  readonly docs?: string | undefined;
}

export interface StructNode {
  readonly kind: "struct";
  readonly fields: ReadonlyArray<FieldIr>;
}

export interface RecordNode {
  readonly kind: "record";
  readonly key: SchemaNode;
  readonly value: SchemaNode;
}

export interface UnionNode {
  readonly kind: "union";
  readonly members: ReadonlyArray<SchemaNode>;
}

export interface SecretNode {
  readonly kind: "secret";
}

export interface VoidNode {
  readonly kind: "void";
}

export interface NamedRefNode {
  readonly kind: "named-ref";
  readonly name: string;
}

export type SchemaNode =
  | StringNode
  | BooleanNode
  | NumberNode
  | JsonNode
  | LiteralNode
  | LiteralsNode
  | ArrayNode
  | StructNode
  | RecordNode
  | UnionNode
  | SecretNode
  | VoidNode
  | NamedRefNode;

export const LiteralValueSchema: Schema.Codec<LiteralValue> = Schema.Union([
  Schema.String,
  Schema.Number,
  Schema.Boolean,
]);

export const FieldIrSchema: Schema.Codec<FieldIr> = Schema.suspend(
  (): Schema.Codec<FieldIr> =>
    Schema.Struct({
      name: Schema.String,
      schema: SchemaNodeSchema,
      optional: Schema.Boolean,
      nullable: Schema.Boolean,
      docs: Schema.optional(Schema.String),
    }),
);

export const NamedRefNodeSchema: Schema.Codec<NamedRefNode> = Schema.Struct({
  kind: Schema.Literal("named-ref"),
  name: Schema.String,
});

export const VoidNodeSchema: Schema.Codec<VoidNode> = Schema.Struct({
  kind: Schema.Literal("void"),
});

export const StructNodeSchema: Schema.Codec<StructNode> = Schema.suspend(
  (): Schema.Codec<StructNode> =>
    Schema.Struct({
      kind: Schema.Literal("struct"),
      fields: Schema.Array(FieldIrSchema),
    }),
);

export const SchemaNodeSchema: Schema.Codec<SchemaNode> = Schema.suspend(
  (): Schema.Codec<SchemaNode> =>
    Schema.Union([
      Schema.Struct({ kind: Schema.Literal("string") }),
      Schema.Struct({ kind: Schema.Literal("boolean") }),
      Schema.Struct({ kind: Schema.Literal("number") }),
      Schema.Struct({ kind: Schema.Literal("json") }),
      Schema.Struct({
        kind: Schema.Literal("literal"),
        value: LiteralValueSchema,
      }),
      Schema.Struct({
        kind: Schema.Literal("literals"),
        values: Schema.Array(LiteralValueSchema),
      }),
      Schema.Struct({
        kind: Schema.Literal("array"),
        item: SchemaNodeSchema,
      }),
      StructNodeSchema,
      Schema.Struct({
        kind: Schema.Literal("record"),
        key: SchemaNodeSchema,
        value: SchemaNodeSchema,
      }),
      Schema.Struct({
        kind: Schema.Literal("union"),
        members: Schema.Array(SchemaNodeSchema),
      }),
      Schema.Struct({ kind: Schema.Literal("secret") }),
      VoidNodeSchema,
      NamedRefNodeSchema,
    ]),
);
