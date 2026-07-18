import { field, fixture, operation, resourceDocs } from "./shared.ts";

export const schemaKindsFixture = fixture({
  slug: "glyph",
  display: "Glyph",
  prefix: "Glyph",
  resources: [
    {
      name: "documents",
      fileName: "documents.ts",
      docs: resourceDocs,
      runtimeBannerConcern: "request execution, retry, redaction",
      operations: [
        operation(
          "documents",
          "get",
          "GetDocumentInput",
          {
            kind: "named-ref",
            name: "DocumentEnvelope",
          },
          {
            pathTemplate: "/documents/{id}",
            pathParams: ["id"],
            input: {
              kind: "struct",
              fields: [
                field("id"),
                field(
                  "filter",
                  {
                    kind: "union",
                    members: [{ kind: "string" }, { kind: "number" }],
                  },
                  { optional: true },
                ),
              ],
            },
            docs: "Fetch a document.",
          },
        ),
        operation(
          "documents",
          "remove",
          "RemoveDocumentInput",
          {
            kind: "void",
          },
          {
            httpMethod: "DELETE",
            retry: "throttling",
            pathTemplate: "/documents/{id}",
            pathParams: ["id"],
            input: { kind: "struct", fields: [field("id")] },
            docs: "Remove a document.",
          },
        ),
      ],
    },
  ],
  namedSchemas: [
    {
      name: "DocumentCore",
      group: "Documents",
      docs: "Every closed schema kind in one wire shape.",
      schema: {
        kind: "struct",
        fields: [
          field("title"),
          field("published", { kind: "boolean" }),
          field("revision", { kind: "number" }),
          field("kind", { kind: "literal", value: "document" }),
          field("state", {
            kind: "literals",
            values: ["draft", 'quoted"value', "line\nbreak", "back\\slash"],
          }),
          field("tags", { kind: "array", item: { kind: "string" } }),
          field("owner", {
            kind: "struct",
            fields: [field("name"), field("active", { kind: "boolean" })],
          }),
          field("metadata", {
            kind: "record",
            key: { kind: "string" },
            value: { kind: "string" },
          }),
          field("selector", {
            kind: "union",
            members: [
              { kind: "literal", value: false },
              { kind: "array", item: { kind: "number" } },
            ],
          }),
          field("token", { kind: "secret" }),
          field("summary", { kind: "string" }, { nullable: true }),
          field(
            "locale",
            { kind: "string" },
            { optional: true, nullable: true },
          ),
        ],
      },
    },
    {
      name: "DocumentEnvelope",
      group: "Documents",
      docs: "A named-reference chain around a document.",
      schema: {
        kind: "struct",
        fields: [
          field("document", { kind: "named-ref", name: "DocumentCore" }),
        ],
      },
    },
  ],
});
