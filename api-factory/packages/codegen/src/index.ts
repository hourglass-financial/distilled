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
  ignoredVerifyTopLevel,
  type Formatter,
  type GenerateOptions,
  type GenerateProvenance,
  type VerifyResult,
  verifyAgainstDir,
} from "./pipeline.ts";
export type { EmittedFile } from "./emit/shared.ts";
export type { ManifestProvenance } from "./emit/manifest.ts";
export {
  type OperationNamingOverride,
  type VendorConfig,
  type VendorConfigMetaName,
  VendorConfigSchema,
} from "./ir/vendor-config.ts";
export {
  buildVendorIr,
  buildVendorIrFrom,
  type FrontendProvenance,
  type PatchMode,
  type VendorBuild,
} from "./frontends/openapi/frontend.ts";
export { normalizeOpenApi } from "./frontends/openapi/normalize.ts";
export {
  applyPatchesReconciling,
  applyPatchesStrict,
  decodePatchEntry,
  entryTargetPointers,
  evaluateEntry,
  type PatchBlastRadius,
  type PatchClassification,
  type ConfigShadow,
  type PatchEntry,
  PatchEntrySchema,
  type PatchEvaluation,
  type PatchKind,
  type PatchPrecondition,
  type PatchProvenance,
  type PatchReconciliation,
  type PatchReportEntry,
  type PatchTargetRole,
  type PatchViolationIdentity,
  type RawPatchOp,
} from "./frontends/openapi/patches.ts";
export {
  auditAttestation,
  type AttestationResult,
  CONFIG_FILE,
  decodeProvenance,
  decodeVendorConfig,
  loadVendorDir,
  PATCHES_DIR,
  PROVENANCE_FILE,
  type ProvenanceRecord,
  ProvenanceSchema,
  sha256,
  SPEC_FILE,
  type VendorDir,
} from "./frontends/openapi/vendor-dir.ts";
export {
  acquire,
  type AcquireOptions,
  type AcquisitionResult,
} from "./frontends/openapi/acquisition.ts";
export {
  auditPatchLocality,
  auditPatchLocalityFrom,
  type PatchLocalityEntryResult,
  type PatchLocalityOptions,
  type PatchLocalityResult,
} from "./frontends/openapi/audit.ts";
export {
  diffSpecs,
  type SpecDiff,
  type SpecDiffChange,
  type SpecDiffClassification,
  type SpecDiffEntry,
} from "./frontends/openapi/spec-diff.ts";
export {
  applyEdit,
  deepEqual,
  escapeSegment,
  formatPointer,
  getAtPointer,
  type JsonEdit,
  JsonEditError,
  type JsonObject,
  type JsonValue,
  parsePointer,
  printJson,
} from "./frontends/openapi/json.ts";
export {
  deriveOperationNames,
  deriveRawResource,
  type DerivedOperationNames,
  humanizeWords,
  kebabWords,
  type NamingContext,
  pascalWords,
  singularizeWord,
  splitWords,
} from "./frontends/openapi/naming.ts";
export {
  type ClientIr,
  ClientIrSchema,
  type CodeErrorIr,
  type CompilerOptionsIr,
  type CoreReexportIr,
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
