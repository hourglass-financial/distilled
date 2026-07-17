import * as Schema from "effect/Schema";
import { describe, expect, expectTypeOf, it } from "vitest";
import type { GeneratedStructCodec } from "../src/generated-schema.ts";

interface Base {
  name: string;
  nickname?: string;
}

const BaseSchema = Schema.Struct({
  name: Schema.String,
  nickname: Schema.optional(Schema.String),
}) as unknown as GeneratedStructCodec<Base>;

const ExtendedSchema = Schema.Struct({
  ...BaseSchema.fields,
  age: Schema.Number,
});

describe("GeneratedStructCodec", () => {
  it("keeps generated fields available for runtime composition", () => {
    expect(
      Schema.decodeUnknownSync(ExtendedSchema)({
        name: "Ada",
        age: 36,
      }),
    ).toEqual({ name: "Ada", age: 36 });
    expect(Object.keys(BaseSchema.fields)).toEqual(["name", "nickname"]);
  });

  it("preserves required and optional decoded fields", () => {
    expectTypeOf<typeof ExtendedSchema.Type>().toEqualTypeOf<{
      readonly name: string;
      readonly nickname?: string;
      readonly age: number;
    }>();
  });
});
