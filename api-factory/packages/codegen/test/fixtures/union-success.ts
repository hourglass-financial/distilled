import { field, fixture, operation, resourceDocs } from "./shared.ts";

export const unionSuccessFixture = fixture({
  slug: "union-success",
  display: "Union Success",
  prefix: "UnionSuccess",
  resources: [
    {
      name: "jobs",
      fileName: "jobs.ts",
      docs: resourceDocs,
      runtimeBannerConcern: "request execution, retry",
      operations: [
        operation(
          "jobs",
          "get",
          "GetJobInput",
          {
            kind: "union",
            members: [
              { kind: "named-ref", name: "PendingJob" },
              { kind: "named-ref", name: "CompletedJob" },
            ],
          },
          { docs: "Get a job in either success state." },
        ),
      ],
    },
  ],
  namedSchemas: [
    {
      name: "CompletedJob",
      group: "Jobs",
      docs: "A completed job.",
      schema: {
        kind: "struct",
        fields: [field("id"), field("result")],
      },
    },
    {
      name: "PendingJob",
      group: "Jobs",
      docs: "A pending job.",
      schema: {
        kind: "struct",
        fields: [field("id"), field("status")],
      },
    },
  ],
});
