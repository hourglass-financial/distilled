import * as Effect from "effect/Effect";
import * as HttpClient from "effect/unstable/http/HttpClient";
import { Credentials } from "../src/credentials.ts";
import {
  EreborFeatureNotEnabled,
  EreborValidationError,
} from "../src/errors.ts";
import { getProgram } from "../src/operations/getProgram.ts";

type Assert<T extends true> = T;
type Includes<Union, Member> = [Extract<Union, Member>] extends [never]
  ? false
  : true;

type DirectEffect = ReturnType<typeof getProgram>;
type DirectErrors = Effect.Error<DirectEffect>;
type DirectServices = Effect.Services<DirectEffect>;

type _RequiresCredentials = Assert<Includes<DirectServices, Credentials>>;
type _RequiresHttpClient = Assert<
  Includes<DirectServices, HttpClient.HttpClient>
>;
type _IncludesValidationError = Assert<
  Includes<DirectErrors, EreborValidationError>
>;
type _IncludesFeatureError = Assert<
  Includes<DirectErrors, EreborFeatureNotEnabled>
>;
