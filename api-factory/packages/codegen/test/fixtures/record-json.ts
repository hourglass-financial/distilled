import { field, fixture, operation, resourceDocs } from "./shared.ts";

export const recordJsonFixture = fixture({
  slug: "record-json",
  display: "Record JSON",
  prefix: "RecordJson",
  resources: [
    {
      name: "entries",
      fileName: "entries.ts",
      docs: resourceDocs,
      runtimeBannerConcern: "request execution, retry",
      operations: [
        operation(
          "entries",
          "get",
          "GetEntryInput",
          { kind: "named-ref", name: "Entry" },
          {
            pathTemplate: "/entries/{id}",
            pathParams: ["id"],
            input: { kind: "struct", fields: [field("id")] },
            docs: "Fetch an entry by id.",
          },
        ),
      ],
    },
  ],
  namedSchemas: [
    {
      name: "Entry",
      group: "Entries",
      docs: "An entry with arbitrary JSON attributes.",
      schema: {
        kind: "struct",
        fields: [
          field("id"),
          field(
            "raw_attributes",
            {
              kind: "record",
              key: { kind: "string" },
              value: { kind: "json" },
            },
            {
              docs: "Identity-decode any valid JSON; arbitrary JSON is not secret-aware.",
            },
          ),
        ],
      },
    },
  ],
});
