import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import * as HttpClientModule from "effect/unstable/http/HttpClient";
import type * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";
import { describe, expect, it } from "vitest";
import { makeRunner, type MatchError } from "../src/client.ts";
import type { Operation } from "../src/operation.ts";
import { disabled } from "../src/retry.ts";

describe("makeRunner", () => {
  it("decodes a top-level JSON array through an array output schema", async () => {
    const http = HttpClientModule.make(
      (request: HttpClientRequest.HttpClientRequest) =>
        Effect.succeed(
          HttpClientResponse.fromWeb(
            request,
            new Response(JSON.stringify([{ id: "widget_1" }])),
          ),
        ),
    );
    const Widget = Schema.Struct({ id: Schema.String });
    const Input = Schema.Struct({});
    const Output = Schema.Array(Widget);
    const errors = [] as const;
    const operation: Operation<typeof Input, typeof Output, typeof errors> = {
      id: "widgets.list",
      method: "GET",
      retry: "transient",
      pathTemplate: "/widgets",
      pathParams: [],
      queryParams: [],
      input: Input,
      output: Output,
      errors,
    };
    const matchError: MatchError<Error> = () =>
      Effect.fail(new Error("unexpected non-success response"));
    const runner = makeRunner({
      http,
      baseUrl: "https://api.vendor.test",
      apiKey: Redacted.make("sk_test"),
      retry: disabled,
      matchError,
      toTransport: () => new Error("unexpected transport error"),
      toDecode: () => new Error("unexpected decode error"),
    });

    await expect(Effect.runPromise(runner(operation, {}))).resolves.toEqual([
      { id: "widget_1" },
    ]);
  });
});
