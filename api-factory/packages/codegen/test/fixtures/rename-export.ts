import { field, fixture, operation, resourceDocs } from "./shared.ts";

export const renameExportFixture = fixture({
  slug: "quarry",
  display: "Quarry",
  prefix: "Quarry",
  resources: [
    {
      name: "artifacts",
      fileName: "artifacts.ts",
      docs: resourceDocs,
      runtimeBannerConcern: "request execution, retry",
      operations: [
        operation(
          "artifacts",
          "delete",
          "DeleteArtifactInput",
          {
            kind: "void",
          },
          {
            bindingName: "deleteArtifact",
            exportName: "delete",
            httpMethod: "DELETE",
            retry: "throttling",
            pathTemplate: "/artifacts/{id}",
            pathParams: ["id"],
            input: { kind: "struct", fields: [field("id")] },
            docs: "Permanently delete an artifact.",
          },
        ),
      ],
    },
  ],
  namedSchemas: [],
});
