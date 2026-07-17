import * as Effect from "effect/Effect";
import * as HttpClient from "effect/unstable/http/HttpClient";
import { describe, expectTypeOf, it } from "vitest";
import { Credentials } from "../src/credentials.ts";
import {
  EreborFeatureNotEnabled,
  EreborValidationError,
} from "../src/errors.ts";
import { getProgram } from "../src/operations/getProgram.ts";

describe("Erebor operation type contract", () => {
  it("advertises provider errors and runtime services", () => {
    type DirectEffect = ReturnType<typeof getProgram>;
    type DirectErrors = Effect.Error<DirectEffect>;
    type DirectServices = Effect.Services<DirectEffect>;

    expectTypeOf<Credentials>().toMatchTypeOf<DirectServices>();
    expectTypeOf<HttpClient.HttpClient>().toMatchTypeOf<DirectServices>();
    expectTypeOf<EreborValidationError>().toMatchTypeOf<DirectErrors>();
    expectTypeOf<EreborFeatureNotEnabled>().toMatchTypeOf<DirectErrors>();
    expectTypeOf<unknown>().not.toMatchTypeOf<DirectErrors>();
  });
});
