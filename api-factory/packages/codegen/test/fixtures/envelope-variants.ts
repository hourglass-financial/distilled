import type { ClientIr } from "../../src/index.ts";
import { fixture, operation, resourceDocs } from "./shared.ts";

const base = fixture({
  slug: "envelope-variants",
  display: "Envelope Variants",
  prefix: "EnvelopeVariants",
  resources: [
    {
      name: "events",
      fileName: "events.ts",
      docs: resourceDocs,
      runtimeBannerConcern: "request execution, error gating",
      operations: [
        operation("events", "get", "GetEventInput", { kind: "void" }),
      ],
    },
  ],
  namedSchemas: [],
});

export const envelopeVariantsFixture: ClientIr = {
  ...base,
  envelope: {
    ...base.envelope,
    discriminatorFields: ["error-code"],
    stringBodyIsMessage: false,
  },
};
