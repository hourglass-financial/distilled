import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";

import { CredentialsFromEnv } from "@hourglass-financial/persona/Credentials";
import { PersonaParseError } from "@hourglass-financial/persona/Errors";
import {
  RetrieveAnInquiryOutput,
  retrieveAnInquiry,
} from "@hourglass-financial/persona/Operations";

const acceptEffect = <A, E, R>(
  value: Effect.Effect<A, E, R>,
): Effect.Effect<A, E, R> => value;
const acceptLayer = <A, E, R>(
  value: Layer.Layer<A, E, R>,
): Layer.Layer<A, E, R> => value;
const acceptSchema = <T extends Schema.Top>(value: T): T => value;

const credentials = acceptLayer(CredentialsFromEnv);
const output = acceptSchema(RetrieveAnInquiryOutput);
const parseError = acceptSchema(PersonaParseError);
const operation = acceptEffect(
  retrieveAnInquiry({ inquiryId: "inq_compatibility_fixture" }),
);

acceptEffect(operation.pipe(Effect.provide(credentials)));
void [output, parseError];
