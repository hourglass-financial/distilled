import { field, fixture, operation, resourceDocs } from "./shared.ts";

export const minimalFixture = fixture({
  slug: "northstar",
  display: "Northstar",
  prefix: "Northstar",
  resources: [
    {
      name: "widgets",
      fileName: "widgets.ts",
      docs: resourceDocs,
      runtimeBannerConcern: "request execution, retry",
      operations: [
        operation(
          "widgets",
          "get",
          "GetWidgetInput",
          {
            kind: "named-ref",
            name: "Widget",
          },
          {
            pathTemplate: "/widgets/{id}",
            pathParams: ["id"],
            input: { kind: "struct", fields: [field("id")] },
            docs: "Fetch a widget by id.",
          },
        ),
      ],
    },
  ],
  namedSchemas: [
    {
      name: "Widget",
      group: "Widgets",
      docs: "A Northstar widget.",
      schema: { kind: "struct", fields: [field("id"), field("name")] },
    },
  ],
});
