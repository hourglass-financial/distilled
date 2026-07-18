export {
  CodegenError,
  type CodegenViolation,
  formatCodegenViolations,
} from "./errors.ts";
export { canonicalize } from "./ir/canonical.ts";
export { decodeIr, dumpIr } from "./ir/dump.ts";
export { checkInvariants } from "./ir/invariants.ts";
export {
  formatWithOxfmt,
  generate,
  generateToDir,
  type Formatter,
  type GenerateOptions,
  type VerifyResult,
  verifyAgainstDir,
} from "./pipeline.ts";
export type { EmittedFile } from "./emit/shared.ts";
export {
  type ClientIr,
  ClientIrSchema,
  type CodeErrorIr,
  type CompilerOptionsIr,
  type DependencyIr,
  type EnvelopeIr,
  type EnvVarsIr,
  type ErrorMetaIr,
  type ErrorsIr,
  type HttpMethodIr,
  type NamedSchemaIr,
  type OperationIr,
  type PackageExportsIr,
  type PackageScriptsIr,
  type PaginationIr,
  type PublicNameIr,
  type RepositoryIr,
  type ResourceIr,
  type RetryIr,
  type ScaffoldIr,
  type ServiceTagsIr,
  type TsconfigIr,
  type VendorIr,
} from "./ir/model.ts";
export {
  type ArrayNode,
  type BooleanNode,
  type FieldIr,
  FieldIrSchema,
  type LiteralNode,
  type LiteralsNode,
  type LiteralValue,
  type NamedRefNode,
  type NumberNode,
  type RecordNode,
  type SchemaNode,
  SchemaNodeSchema,
  type SecretNode,
  type StringNode,
  type StructNode,
  type UnionNode,
  type VoidNode,
} from "./ir/nodes.ts";
