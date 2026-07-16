import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";

import { CredentialsFromEnv } from "@hourglass-financial/erebor/Credentials";
import { EreborValidationError } from "@hourglass-financial/erebor/Errors";
import {
  ListProgramsOutput,
  listPrograms,
} from "@hourglass-financial/erebor/Operations";

const acceptEffect = <A, E, R>(
  value: Effect.Effect<A, E, R>,
): Effect.Effect<A, E, R> => value;
const acceptLayer = <A, E, R>(
  value: Layer.Layer<A, E, R>,
): Layer.Layer<A, E, R> => value;
const acceptSchema = <T extends Schema.Top>(value: T): T => value;

const credentials = acceptLayer(CredentialsFromEnv);
const output = acceptSchema(ListProgramsOutput);
const validationError = acceptSchema(EreborValidationError);
const operation = acceptEffect(listPrograms({ page_size: 1 }));

acceptEffect(operation.pipe(Effect.provide(credentials)));
void [output, validationError];
