import { field, fixture, operation, resourceDocs } from "./shared.ts";

export const multiResourceFixture = fixture({
  slug: "mosaic",
  display: "Mosaic",
  prefix: "Mosaic",
  resources: [
    {
      name: "zones",
      fileName: "zones.ts",
      docs: resourceDocs,
      runtimeBannerConcern: "request execution, retry",
      operations: [
        operation(
          "zones",
          "list",
          "ListZonesInput",
          {
            kind: "named-ref",
            name: "ZoneList",
          },
          { docs: "List zones." },
        ),
      ],
    },
    {
      name: "accounts",
      fileName: "accounts.ts",
      docs: resourceDocs,
      runtimeBannerConcern: "request execution, retry",
      operations: [
        operation(
          "accounts",
          "get",
          "GetAccountInput",
          {
            kind: "named-ref",
            name: "Account",
          },
          {
            pathTemplate: "/accounts/{id}",
            pathParams: ["id"],
            input: { kind: "struct", fields: [field("id")] },
            docs: "Fetch an account.",
          },
        ),
        operation(
          "accounts",
          "create",
          "CreateAccountInput",
          {
            kind: "named-ref",
            name: "Account",
          },
          {
            httpMethod: "POST",
            retry: "throttling",
            input: { kind: "struct", fields: [field("name")] },
            docs: "Create an account.",
          },
        ),
      ],
    },
  ],
  namedSchemas: [
    {
      name: "ZoneList",
      group: "Zones",
      docs: "A list of zones.",
      schema: {
        kind: "struct",
        fields: [field("data", { kind: "array", item: { kind: "string" } })],
      },
    },
    {
      name: "Account",
      group: "Accounts",
      docs: "A Mosaic account.",
      schema: { kind: "struct", fields: [field("id"), field("name")] },
    },
  ],
});
