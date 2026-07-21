import { field, fixture, operation, resourceDocs } from "./shared.ts";

export const arraySuccessFixture = fixture({
  slug: "array-success",
  display: "Array Success",
  prefix: "ArraySuccess",
  resources: [
    {
      name: "identities",
      fileName: "identities.ts",
      docs: resourceDocs,
      runtimeBannerConcern: "request execution, retry",
      operations: [
        operation(
          "identities",
          "list",
          "ListIdentitiesInput",
          {
            kind: "array",
            item: { kind: "named-ref", name: "Identity" },
          },
          { docs: "List identities." },
        ),
      ],
    },
  ],
  namedSchemas: [
    {
      name: "Identity",
      group: "Identities",
      docs: "A connected identity.",
      schema: { kind: "struct", fields: [field("id"), field("type")] },
    },
  ],
});
