import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";
import { describe, expect, expectTypeOf, it } from "vitest";
import { Credentials } from "../../src/credentials.ts";
import {
  AccountsListAllRelationsOutput,
  accountsListAllRelations,
  type AccountsListAllRelationsOutput as AccountsListAllRelationsResult,
} from "../../src/operations/accountsListAllRelations.ts";

// Coverage: fixture-dependent
describe("accountsListAllRelations", () => {
  it("serializes filters and pagination and preserves relation resource fields", async () => {
    let requestUrl: string | undefined;
    const credentials = Layer.succeed(Credentials, {
      apiKey: Redacted.make("persona_test_contract"),
      apiBaseUrl: "https://persona.example/api/v1",
    });
    const transport = Layer.succeed(
      HttpClient.HttpClient,
      HttpClient.make((request) => {
        requestUrl = Option.getOrThrow(HttpClientRequest.toUrl(request)).href;
        return Effect.succeed(
          HttpClientResponse.fromWeb(
            request,
            new Response(
              JSON.stringify({
                data: [
                  {
                    type: "account",
                    id: "act_related",
                    attributes: {
                      "reference-id": "related-account",
                      fields: {
                        "tenant-score": { type: "number", value: 42 },
                      },
                    },
                  },
                ],
                links: { prev: null, next: null },
              }),
              {
                status: 200,
                headers: { "content-type": "application/json" },
              },
            ),
          ),
        );
      }),
    );

    const output = await Effect.runPromise(
      accountsListAllRelations({
        accountId: "act_source",
        filter: {
          key: "owners",
          "created-at-start": "2026-01-01",
        },
        page: { after: "act_cursor", size: 25 },
      }).pipe(Effect.provide(Layer.merge(credentials, transport))),
    );

    const url = new URL(requestUrl!);
    expect(url.pathname).toBe("/api/v1/accounts/act_source/relations");
    expect(url.searchParams.get("filter[key]")).toBe("owners");
    expect(url.searchParams.get("filter[created-at-start]")).toBe("2026-01-01");
    expect(url.searchParams.get("page[after]")).toBe("act_cursor");
    expect(url.searchParams.get("page[size]")).toBe("25");
    expect(url.searchParams.has("filter.key")).toBe(false);
    expect(output.data[0]).toMatchObject({
      type: "account",
      id: "act_related",
      attributes: {
        "reference-id": "related-account",
        fields: {
          "tenant-score": { type: "number", value: 42 },
        },
      },
    });
  });

  it("retains documented relation types in both TypeScript and runtime schemas", () => {
    type Relation = AccountsListAllRelationsResult["data"][number];
    type AccountRelation = Extract<Relation, { type: "account" }>;

    expectTypeOf<AccountRelation["attributes"]>().toMatchTypeOf<
      | {
          "reference-id"?: string | null;
          fields?: Record<string, unknown>;
        }
      | undefined
    >();

    expect(() =>
      Schema.decodeUnknownSync(AccountsListAllRelationsOutput)({
        data: [
          {
            type: "account",
            id: "act_related",
            attributes: { "reference-id": 42 },
          },
        ],
        links: { prev: null, next: null },
      }),
    ).toThrow();
  });

  it.todo(
    "live success requires a configured account relation schema plus two disposable owned accounts",
  );
});
