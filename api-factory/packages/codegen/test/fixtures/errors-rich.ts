import { field, fixture, operation, resourceDocs } from "./shared.ts";

export const errorsRichFixture = fixture({
  slug: "bastion",
  display: "Bastion",
  prefix: "Bastion",
  resources: [
    {
      name: "sessions",
      fileName: "sessions.ts",
      docs: resourceDocs,
      runtimeBannerConcern: "redaction, error gating, request execution",
      operations: [
        operation(
          "sessions",
          "authenticate",
          "AuthenticateInput",
          {
            kind: "named-ref",
            name: "Session",
          },
          {
            httpMethod: "POST",
            retry: "throttling",
            pathTemplate: "/sessions/authenticate",
            input: {
              kind: "struct",
              fields: [field("email"), field("password", { kind: "secret" })],
            },
            errors: ["InvalidToken", "BadRequest", "AlphaChallenge"],
            errorsDocs: "The endpoint returns typed discriminator errors.",
            constantBody: { grant_type: "password", interactive: true },
            docs: "Authenticate a Bastion session.",
          },
        ),
      ],
    },
  ],
  namedSchemas: [
    {
      name: "Session",
      group: "Sessions",
      docs: "An authenticated session.",
      schema: {
        kind: "struct",
        fields: [field("id"), field("token", { kind: "secret" })],
      },
    },
  ],
  errors: {
    docs: "Bastion error envelopes are normalized to one discriminator before\nthe generated matcher selects a typed class.",
    codeErrorsSectionTitle:
      "Code-discriminated authentication errors (POST /sessions/authenticate)",
    codeErrorsDocs:
      "The endpoint returns typed discriminator errors.\nClasses are ordered alphabetically by discriminator code.",
    codeErrors: [
      {
        className: "AlphaChallenge",
        tag: "AlphaChallenge",
        code: "alpha_challenge",
        meta: "challenge",
        docsStatus: 403,
        docsProse: "an additional challenge is required.",
      },
      {
        className: "InvalidToken",
        tag: "InvalidToken",
        code: "invalid_token",
        meta: "auth",
        docsStatus: 400,
        docsProse: "the supplied token was rejected.",
      },
    ],
    coreReexports: ["BadRequest", "NotFound", "TooManyRequests"],
  },
});
