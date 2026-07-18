import * as Schema from "effect/Schema";
import { CodegenError } from "../errors.ts";
import { canonicalize } from "./canonical.ts";
import { type ClientIr, ClientIrSchema } from "./model.ts";

const parseOptions = {
  errors: "all",
  onExcessProperty: "error",
} as const;

export const decodeIr = (input: unknown): ClientIr => {
  try {
    return Schema.decodeUnknownSync(ClientIrSchema, parseOptions)(input);
  } catch (cause) {
    throw new CodegenError([
      {
        rule: "ir.decode",
        construct: "ClientIr",
        message: cause instanceof Error ? cause.message : String(cause),
      },
    ]);
  }
};

export const dumpIr = (ir: ClientIr): string => {
  const encoded = Schema.encodeSync(ClientIrSchema)(canonicalize(ir));
  return `${JSON.stringify(encoded, null, 2)}\n`;
};
