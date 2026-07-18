import { field, fixture, operation, resourceDocs } from "./shared.ts";

export const paginationFixture = fixture({
  slug: "orbit",
  display: "Orbit",
  prefix: "Orbit",
  resources: [
    {
      name: "satellites",
      fileName: "satellites.ts",
      docs: resourceDocs,
      runtimeBannerConcern: "request execution, retry, pagination",
      operations: [
        operation(
          "satellites",
          "list",
          "ListSatellitesInput",
          {
            kind: "named-ref",
            name: "SatellitePage",
          },
          {
            pathTemplate: "/satellites",
            queryParams: ["before", "after", "limit"],
            input: {
              kind: "struct",
              fields: [
                field("before", undefined, { optional: true }),
                field("after", undefined, { optional: true }),
                field("limit", { kind: "number" }, { optional: true }),
              ],
            },
            docs: "Fetch a single page of satellites.",
            pagination: {
              cursorParam: "after",
              clear: ["before"],
              nextCursorPath: ["meta", "after"],
              itemsPath: ["data"],
              pageSchema: { kind: "named-ref", name: "SatellitePage" },
              itemSchema: { kind: "named-ref", name: "Satellite" },
              pagesDocs:
                "Stream every page of satellites, following the `after` cursor.",
              itemsDocs: "Stream every satellite across every page.",
            },
          },
        ),
      ],
    },
  ],
  namedSchemas: [
    {
      name: "PageMeta",
      group: "Satellites",
      docs: "Cursor metadata.",
      schema: {
        kind: "struct",
        fields: [field("after", undefined, { nullable: true })],
      },
    },
    {
      name: "Satellite",
      group: "Satellites",
      docs: "An Orbit satellite.",
      schema: { kind: "struct", fields: [field("id"), field("name")] },
    },
    {
      name: "SatellitePage",
      group: "Satellites",
      docs: "A page of satellites.",
      schema: {
        kind: "struct",
        fields: [
          field("data", {
            kind: "array",
            item: { kind: "named-ref", name: "Satellite" },
          }),
          field("meta", { kind: "named-ref", name: "PageMeta" }),
        ],
      },
    },
  ],
});
