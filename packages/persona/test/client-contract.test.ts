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
  Forbidden,
  GatewayTimeout,
  InternalServerError,
  NotFound,
  PersonaParseError,
  ServiceUnavailable,
  TooManyRequests,
  Unauthorized,
  UnknownPersonaError,
} from "../src/errors.ts";
import { listAllApiKeys } from "../src/operations/listAllApiKeys.ts";

describe("Persona operation type contract", () => {
  it("keeps declared API errors precise while retaining universal failures", () => {
    type DirectEffect = ReturnType<typeof listAllApiKeys>;
    type DirectErrors = Effect.Error<DirectEffect>;
    type DirectServices = Effect.Services<DirectEffect>;
    type ExpectedErrors =
      | BadRequest
      | Forbidden
      | Unauthorized
      | TooManyRequests
      | InternalServerError
      | BadGateway
      | ServiceUnavailable
      | GatewayTimeout
      | UnknownPersonaError
      | PersonaParseError
      | HttpClientError.HttpClientError
      | HttpBody.HttpBodyError;

    expectTypeOf<DirectErrors>().toEqualTypeOf<ExpectedErrors>();
    expectTypeOf<NotFound>().not.toMatchTypeOf<DirectErrors>();
    expectTypeOf<Credentials>().toMatchTypeOf<DirectServices>();
    expectTypeOf<HttpClient.HttpClient>().toMatchTypeOf<DirectServices>();
  });

  it.each([
    { status: 404, tag: "UnknownPersonaError" },
    { status: 401, tag: "Unauthorized" },
  ])(
    "maps HTTP $status to $tag for this operation",
    async ({ status, tag }) => {
      let requests = 0;
      const credentials = Layer.succeed(Credentials, {
        apiKey: Redacted.make("persona_sandbox_contract"),
        apiBaseUrl: "https://persona.example",
      });
      const transport = Layer.succeed(
        HttpClient.HttpClient,
        HttpClient.make((request) => {
          requests += 1;
          return Effect.succeed(
            HttpClientResponse.fromWeb(
              request,
              new Response(
                JSON.stringify({
                  errors: [{ title: "contract error", details: "test" }],
                }),
                {
                  status,
                  headers: { "content-type": "application/json" },
                },
              ),
            ),
          );
        }),
      );

      const error = await Effect.runPromise(
        listAllApiKeys({}).pipe(
          Effect.flip,
          Effect.provide(Layer.merge(credentials, transport)),
        ),
      );

      expect(error._tag).toBe(tag);
      expect(requests).toBe(1);
    },
  );
});
