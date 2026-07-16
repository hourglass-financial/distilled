import { Effect, Option } from "effect";
import * as Predicate from "effect/Predicate";
import * as Schema from "effect/Schema";
import * as SchemaIssue from "effect/SchemaIssue";
import * as SchemaParser from "effect/SchemaParser";

// HOURGLASS PATCH: Match OpenAPI additional-property semantics during decoding.
/**
 * Models an OpenAPI object that declares named properties and separately
 * validates only its undeclared properties with `additionalProperties`.
 */
export const StructWithAdditionalProperties = <
  const S extends Schema.Struct<Schema.Struct.Fields>,
  const A extends Schema.Top,
>(
  struct: S,
  additionalProperties: A,
) => {
  type Type = S["Type"] &
    Readonly<Record<string, A["Type"] | S["Type"][keyof S["Type"]]>>;
  type Encoded = S["Encoded"] &
    Readonly<Record<string, A["Encoded"] | S["Encoded"][keyof S["Encoded"]]>>;

  const declaredKeys = new Set(Object.keys(struct.fields));

  return Schema.declareConstructor<Type, Encoded>()(
    [struct, additionalProperties],
    ([structCodec, additionalPropertiesCodec]) => {
      const decodeStruct = SchemaParser.decodeUnknownEffect(structCodec);
      const decodeAdditionalProperties = SchemaParser.decodeUnknownEffect(
        additionalPropertiesCodec,
      );

      return (input, ast, options) => {
        if (!Predicate.isObject(input)) {
          return Effect.fail(
            new SchemaIssue.InvalidType(ast, Option.some(input)),
          );
        }

        return Effect.gen(function* () {
          const declared = yield* decodeStruct(input, options);
          const additional: Record<string, unknown> = {};

          for (const [key, value] of Object.entries(input)) {
            if (declaredKeys.has(key)) continue;

            additional[key] = yield* decodeAdditionalProperties(
              value,
              options,
            ).pipe(
              Effect.mapError((issue) => new SchemaIssue.Pointer([key], issue)),
            );
          }

          return { ...additional, ...declared } as Type;
        });
      };
    },
  );
};
