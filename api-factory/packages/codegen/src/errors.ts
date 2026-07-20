export interface CodegenViolation {
  readonly rule: string;
  readonly construct: string;
  readonly message: string;
}

const compare = (left: string, right: string): number =>
  left < right ? -1 : left > right ? 1 : 0;

const compareViolations = (
  left: CodegenViolation,
  right: CodegenViolation,
): number =>
  compare(left.rule, right.rule) ||
  compare(left.construct, right.construct) ||
  compare(left.message, right.message);

export const formatCodegenViolations = (
  violations: ReadonlyArray<CodegenViolation>,
): string => {
  const sorted = [...violations].sort(compareViolations);
  return [
    `Code generation failed with ${sorted.length} violation${sorted.length === 1 ? "" : "s"}:`,
    ...sorted.map(
      ({ rule, construct, message }) => `- [${rule}] ${construct}: ${message}`,
    ),
  ].join("\n");
};

export class CodegenError extends Error {
  readonly violations: ReadonlyArray<CodegenViolation>;

  constructor(violations: ReadonlyArray<CodegenViolation>) {
    const sorted = [...violations].sort(compareViolations);
    super(formatCodegenViolations(sorted));
    this.name = "CodegenError";
    this.violations = sorted;
  }
}
