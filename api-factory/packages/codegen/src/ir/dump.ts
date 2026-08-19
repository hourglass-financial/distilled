import * as Schema from "effect/Schema";
import { CodegenError } from "../errors.ts";
import { canonicalize } from "./canonical.ts";
import { checkJsonRecordValueOnly } from "./invariants.ts";
import { type ClientIr, ClientIrSchema } from "./model.ts";

const parseOptions = {
  errors: "all",
  onExcessProperty: "error",
} as const;

export const decodeIr = (input: unknown): ClientIr => {
  let decoded: ClientIr;
  try {
    decoded = Schema.decodeUnknownSync(ClientIrSchema, parseOptions)(input);
  } catch (cause) {
    throw new CodegenError([
      {
        rule: "ir.decode",
        construct: "ClientIr",
        message: cause instanceof Error ? cause.message : String(cause),
      },
    ]);
  }
  checkJsonRecordValueOnly(decoded);
  return decoded;
};

export const dumpIr = (ir: ClientIr): string => {
  const encoded = Schema.encodeSync(ClientIrSchema)(canonicalize(ir));
  return `${JSON.stringify(encoded, null, 2)}\n`;
};
