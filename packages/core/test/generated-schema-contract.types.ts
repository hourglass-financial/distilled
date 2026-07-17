import * as Schema from "effect/Schema";
import type { GeneratedStructCodec } from "../src/generated-schema.ts";

interface Base {
  name: string;
  nickname?: string;
}

declare const BaseSchema: GeneratedStructCodec<Base>;

const ExtendedSchema = Schema.Struct({
  ...BaseSchema.fields,
  age: Schema.Number,
});

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
type Assert<T extends true> = T;

type _ExtendedType = Assert<
  Equal<
    typeof ExtendedSchema.Type,
    { readonly name: string; readonly nickname?: string; readonly age: number }
  >
>;
