import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";
import type * as HttpBody from "effect/unstable/http/HttpBody";
import type * as HttpClient from "effect/unstable/http/HttpClient";
import type * as HttpClientError from "effect/unstable/http/HttpClientError";

import {
  type Credentials,
  CredentialsFromEnv,
} from "@hourglass-financial/workos/Credentials";
import {
  type BadGateway,
  type GatewayTimeout,
  type InternalServerError,
  type NotFound,
  type ServiceUnavailable,
  type TooManyRequests,
  type Unauthorized,
  type UnknownWorkosError,
  type UnprocessableEntity,
  WorkosParseError,
} from "@hourglass-financial/workos/Errors";
import {
  UserlandUserOrganizationMembershipsControllerUpdate,
  UserlandUserOrganizationMembershipsControllerUpdateInput,
  UserlandUserOrganizationMembershipsControllerUpdateOutput,
} from "@hourglass-financial/workos/Operations";

const acceptEffect = <A, E, R>(
  value: Effect.Effect<A, E, R>,
): Effect.Effect<A, E, R> => value;
const acceptLayer = <A, E, R>(
  value: Layer.Layer<A, E, R>,
): Layer.Layer<A, E, R> => value;
const acceptSchema = <T extends Schema.Top>(value: T): T => value;

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? (<T>() => T extends B ? 1 : 2) extends <T>() => T extends A ? 1 : 2
      ? true
      : false
    : false;
type Expect<T extends true> = T;

const credentials = acceptLayer(CredentialsFromEnv);
const input = acceptSchema(
  UserlandUserOrganizationMembershipsControllerUpdateInput,
);
const output = acceptSchema(
  UserlandUserOrganizationMembershipsControllerUpdateOutput,
);
const parseError = acceptSchema(WorkosParseError);
const operation = acceptEffect(
  UserlandUserOrganizationMembershipsControllerUpdate({
    id: "om_compatibility_fixture",
    role_slug: "member",
    role_slugs: ["member", "admin"],
  }),
);

type MembershipUpdateEffect = typeof operation;
type ExpectedMembershipUpdateErrors =
  | NotFound
  | UnprocessableEntity
  | Unauthorized
  | TooManyRequests
  | InternalServerError
  | BadGateway
  | ServiceUnavailable
  | GatewayTimeout
  | UnknownWorkosError
  | WorkosParseError
  | HttpClientError.HttpClientError
  | HttpBody.HttpBodyError;
type ExpectedMembershipUpdateServices = Credentials | HttpClient.HttpClient;

export type MembershipUpdateOutputContract = Expect<
  Equal<
    Effect.Success<MembershipUpdateEffect>,
    UserlandUserOrganizationMembershipsControllerUpdateOutput
  >
>;
export type MembershipUpdateErrorContract = Expect<
  Equal<Effect.Error<MembershipUpdateEffect>, ExpectedMembershipUpdateErrors>
>;
export type MembershipUpdateServicesContract = Expect<
  Equal<
    Effect.Services<MembershipUpdateEffect>,
    ExpectedMembershipUpdateServices
  >
>;

acceptEffect(operation.pipe(Effect.provide(credentials)));
void [input, output, parseError];
