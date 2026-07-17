import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import * as HttpBody from "effect/unstable/http/HttpBody";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientError from "effect/unstable/http/HttpClientError";
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";
import { describe, expect, expectTypeOf, it } from "vitest";
import { Credentials } from "../src/credentials.ts";
import {
  BadGateway,
  BadRequest,
  GatewayTimeout,
  InternalServerError,
  NotFound,
  ServiceUnavailable,
  TooManyRequests,
  Unauthorized,
  UnknownWorkosError,
  UnprocessableEntity,
  WorkosParseError,
} from "../src/errors.ts";
import { UserlandUserOrganizationMembershipsControllerUpdate } from "../src/operations/UserlandUserOrganizationMembershipsControllerUpdate.ts";

// HOURGLASS PATCH: Typecheck the built-client contract independently of the
// broader legacy WorkOS test suite, which still has unrelated strictness debt.
describe("WorkOS operation type contract", () => {
  it("keeps membership update errors precise while retaining universal failures", () => {
    type DirectEffect = ReturnType<
      typeof UserlandUserOrganizationMembershipsControllerUpdate
    >;
    type DirectErrors = Effect.Error<DirectEffect>;
    type DirectServices = Effect.Services<DirectEffect>;
    type ExpectedErrors =
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

    expectTypeOf<DirectErrors>().toEqualTypeOf<ExpectedErrors>();
    expectTypeOf<BadRequest>().not.toMatchTypeOf<DirectErrors>();
    expectTypeOf<Credentials>().toMatchTypeOf<DirectServices>();
    expectTypeOf<HttpClient.HttpClient>().toMatchTypeOf<DirectServices>();
  });

  it.each([
    { status: 400, tag: "UnknownWorkosError" },
    { status: 401, tag: "Unauthorized" },
  ])(
    "maps HTTP $status to $tag for this operation",
    async ({ status, tag }) => {
      let requests = 0;
      const credentials = Layer.succeed(
        Credentials,
        Effect.succeed({
          apiKey: Redacted.make("sk_test_contract"),
          apiBaseUrl: "https://workos.example",
        }),
      );
      const transport = Layer.succeed(
        HttpClient.HttpClient,
        HttpClient.make((request) => {
          requests += 1;
          return Effect.succeed(
            HttpClientResponse.fromWeb(
              request,
              new Response(JSON.stringify({ message: "bad request" }), {
                status,
                headers: { "content-type": "application/json" },
              }),
            ),
          );
        }),
      );

      const error = await Effect.runPromise(
        UserlandUserOrganizationMembershipsControllerUpdate({
          id: "om_test",
        }).pipe(
          Effect.flip,
          Effect.provide(Layer.merge(credentials, transport)),
        ),
      );

      expect(error._tag).toBe(tag);
      expect(requests).toBe(1);
    },
  );
});
