import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { StructWithAdditionalProperties } from "@distilled.cloud/core/openapi/additional-properties";
import {
  BadRequest,
  Forbidden,
  Conflict,
  UnprocessableEntity,
} from "../errors.ts";
import { SensitiveString, SensitiveOutputString } from "../sensitive.ts";
import * as Redacted from "effect/Redacted";

// Input Schema
export interface CreateAWebhookInput {
  include?: string;
  fields?: Record<string, string>;
  keyInflection?: "camel" | "kebab" | "snake";
  idempotencyKey?: string;
  personaVersion?:
    | "2025-12-08"
    | "2025-10-27"
    | "2023-01-05"
    | "2022-09-01"
    | "2021-08-18"
    | "2021-07-05"
    | "2021-02-21"
    | "2020-05-18";
  data: {
    attributes: {
      name?: string;
      description?: string | null;
      url?: string;
      "enabled-events"?: ReadonlyArray<
        | "*"
        | "account-property.redacted"
        | "account-type.deleted-field"
        | "account.added-relation"
        | "account.archived"
        | "account.consolidated"
        | "account.consolidated-with"
        | "account.created"
        | "account.redacted"
        | "account.removed-relation"
        | "account.restored"
        | "account.status-updated"
        | "account.tag-added"
        | "account.tag-removed"
        | "account.updated-fields"
        | "account.updated-tags"
        | "agent-conversation.created"
        | "agent-conversation.errored"
        | "agent-conversation.message-added"
        | "authentication.completed"
        | "authentication.created"
        | "authentication.expired"
        | "authentication.failed"
        | "authentication.redacted"
        | "case-comment.created"
        | "case-message.received"
        | "case-message.sent"
        | "case-template.deleted-field"
        | "case.assigned"
        | "case.created"
        | "case.exported"
        | "case.print-initiated"
        | "case.queue-updated"
        | "case.redacted"
        | "case.reopened"
        | "case.resolved"
        | "case.sla-expired"
        | "case.status-updated"
        | "case.updated"
        | "case.updated-fields"
        | "case.updated-tags"
        | "checkpoint.completed"
        | "checkpoint.created"
        | "checkpoint.expired"
        | "checkpoint.failed"
        | "checkpoint.reusable-persona-used"
        | "checkpoint.started"
        | "connect/share-token.inbound-created"
        | "connect/share-token.inbound-redeemed"
        | "connect/share-token.outbound-created"
        | "connect/share-token.outbound-redeemed"
        | "document.created"
        | "document.errored"
        | "document.extracted"
        | "document.pending"
        | "document.processed"
        | "document.submitted"
        | "filing.created"
        | "filing.filed"
        | "graph-query.cancelled"
        | "graph-query.completed"
        | "graph-query.errored"
        | "graph-query.reran"
        | "graph-query.submitted"
        | "graph-query.timed-out"
        | "importer-pipeline-run.canceled"
        | "importer-pipeline-run.completed"
        | "importer-pipeline-run.errored"
        | "importer-pipeline-run.paused"
        | "importer-pipeline-run.resumed"
        | "importer-pipeline-run.started"
        | "inquiry-session.canceled"
        | "inquiry-session.expired"
        | "inquiry-session.started"
        | "inquiry-template-version.created"
        | "inquiry-template-version.published"
        | "inquiry.approved"
        | "inquiry.completed"
        | "inquiry.created"
        | "inquiry.declined"
        | "inquiry.expired"
        | "inquiry.failed"
        | "inquiry.marked-for-review"
        | "inquiry.redacted"
        | "inquiry.reusable-persona-assurance-failed"
        | "inquiry.reusable-persona-created"
        | "inquiry.reusable-persona-updated"
        | "inquiry.reusable-persona-used"
        | "inquiry.started"
        | "inquiry.transitioned"
        | "inquiry.updated-tags"
        | "integration-log.created"
        | "report/address-lookup.errored"
        | "report/address-lookup.ready"
        | "report/address-lookup.submitted"
        | "report/adverse-media.dismissed"
        | "report/adverse-media.errored"
        | "report/adverse-media.matched"
        | "report/adverse-media.ready"
        | "report/background-check.ready"
        | "report/better-business-bureau.errored"
        | "report/better-business-bureau.ready"
        | "report/business-adverse-media.dismissed"
        | "report/business-adverse-media.errored"
        | "report/business-adverse-media.matched"
        | "report/business-adverse-media.ready"
        | "report/business-associated-persons.errored"
        | "report/business-associated-persons.ready"
        | "report/business-classification.errored"
        | "report/business-classification.ready"
        | "report/business-classification.submitted"
        | "report/business-enforcement-action.errored"
        | "report/business-enforcement-action.ready"
        | "report/business-enforcement-action.submitted"
        | "report/business-industry-classification.errored"
        | "report/business-industry-classification.ready"
        | "report/business-industry-classification.submitted"
        | "report/business-liens-lookup.errored"
        | "report/business-liens-lookup.ready"
        | "report/business-lookup-eu.errored"
        | "report/business-lookup-eu.ready"
        | "report/business-lookup.errored"
        | "report/business-lookup.ready"
        | "report/business-media-coverage.errored"
        | "report/business-media-coverage.matched"
        | "report/business-media-coverage.ready"
        | "report/business-media-coverage.submitted"
        | "report/business-nonprofit.changed"
        | "report/business-nonprofit.errored"
        | "report/business-nonprofit.ready"
        | "report/business-online-presence.errored"
        | "report/business-online-presence.ready"
        | "report/business-online-presence.submitted"
        | "report/business-personnel-insights.errored"
        | "report/business-personnel-insights.ready"
        | "report/business-personnel-insights.submitted"
        | "report/business-registrations-lookup.errored"
        | "report/business-registrations-lookup.ready"
        | "report/business-social-media.errored"
        | "report/business-social-media.ready"
        | "report/business-watchlist.dismissed"
        | "report/business-watchlist.errored"
        | "report/business-watchlist.matched"
        | "report/business-watchlist.ready"
        | "report/business-website.errored"
        | "report/business-website.ready"
        | "report/chainalysis-address-screening.errored"
        | "report/chainalysis-address-screening.ready"
        | "report/clearbit-business-lookup.errored"
        | "report/clearbit-business-lookup.ready"
        | "report/coinbase-check-crypto-risk.errored"
        | "report/coinbase-check-crypto-risk.ready"
        | "report/community-safety.errored"
        | "report/community-safety.matched"
        | "report/community-safety.ready"
        | "report/comply-advantage-search.ready"
        | "report/comprehensive-profile.ready"
        | "report/crypto-address-watchlist.errored"
        | "report/crypto-address-watchlist.matched"
        | "report/crypto-address-watchlist.ready"
        | "report/crypto_address.matched"
        | "report/crypto_address.ready"
        | "report/custom-list.dismissed"
        | "report/custom-list.errored"
        | "report/custom-list.matched"
        | "report/custom-list.ready"
        | "report/email-address.errored"
        | "report/email-address.ready"
        | "report/employer-lookup.ready"
        | "report/equifax-oneview.errored"
        | "report/equifax-oneview.ready"
        | "report/finra-broker-check.errored"
        | "report/finra-broker-check.ready"
        | "report/kyckr-business-lookup.errored"
        | "report/kyckr-business-lookup.ready"
        | "report/middesk.errored"
        | "report/middesk.ready"
        | "report/middesk.submitted"
        | "report/mx-account.errored"
        | "report/mx-account.ready"
        | "report/nces.errored"
        | "report/nces.ready"
        | "report/novacredit-cash-atlas.errored"
        | "report/novacredit-cash-atlas.ready"
        | "report/novacredit-cash-atlas.submitted"
        | "report/novacredit-credit-passport.errored"
        | "report/novacredit-credit-passport.ready"
        | "report/novacredit-credit-passport.submitted"
        | "report/phone-number.errored"
        | "report/phone-number.ready"
        | "report/politically-exposed-person.dismissed"
        | "report/politically-exposed-person.errored"
        | "report/politically-exposed-person.matched"
        | "report/politically-exposed-person.ready"
        | "report/profile-non-authoritative.errored"
        | "report/profile-non-authoritative.ready"
        | "report/profile.errored"
        | "report/profile.ready"
        | "report/screening.errored"
        | "report/screening.matched"
        | "report/screening.ready"
        | "report/sec-action-lookup.errored"
        | "report/sec-action-lookup.ready"
        | "report/sentilink-application-risk.errored"
        | "report/sentilink-application-risk.ready"
        | "report/sentilink-scores.errored"
        | "report/sentilink-scores.ready"
        | "report/social-media.errored"
        | "report/social-media.ready"
        | "report/synthetic.errored"
        | "report/synthetic.ready"
        | "report/trm-wallet-screening.errored"
        | "report/trm-wallet-screening.ready"
        | "report/watchlist.dismissed"
        | "report/watchlist.errored"
        | "report/watchlist.matched"
        | "report/watchlist.ready"
        | "sar.created"
        | "sar.filed"
        | "selfie.created"
        | "selfie.errored"
        | "selfie.processed"
        | "selfie.submitted"
        | "session.created"
        | "session.expired"
        | "transaction-type.deleted-field"
        | "transaction.added-relation"
        | "transaction.created"
        | "transaction.labeled"
        | "transaction.redacted"
        | "transaction.removed-relation"
        | "transaction.sentinel-session-processed"
        | "transaction.status-updated"
        | "transaction.updated-fields"
        | "user.availability-updated"
        | "verification.canceled"
        | "verification.created"
        | "verification.escalated"
        | "verification.failed"
        | "verification.passed"
        | "verification.requires-retry"
        | "verification.skipped"
        | "verification.submitted"
        | "verification.tentatively-failed"
        | "verification.tentatively-passed"
        | "verification.updated-tags"
        | "workflow-run.created"
        | "workflow-run.errored"
        | "workflow-run.resumed"
        | "workflow.published"
      >;
      "api-version"?:
        | "2025-12-08"
        | "2025-10-27"
        | "2023-01-05"
        | "2022-09-01"
        | "2021-08-18"
        | "2021-07-05"
        | "2021-02-21"
        | "2020-05-18";
      "api-key-inflection"?: "camel" | "kebab" | "snake";
      "api-attributes-blocklist"?: ReadonlyArray<string>;
      "file-access-token-expires-in"?: number;
      "payload-filter"?: { data?: Record<string, unknown> };
      "included-allowlist"?:
        | { state: string }
        | {
            state: string;
            "event-types": ReadonlyArray<{
              "event-type": string;
              relationships: ReadonlyArray<string>;
            }>;
          };
      "relationship-allowlist"?: { state: string };
      "custom-http-headers"?: {
        Authorization?: string;
        "Calling-Application"?: string;
        "CF-Access-Client-Id"?: string;
        "CF-Access-Client-Secret"?: string | Redacted.Redacted<string>;
        "X-API-Key"?: string;
      } & Record<string, unknown>;
    };
  };
}
export const CreateAWebhookInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  include: Schema.optional(Schema.String).pipe(T.HttpQuery("include")),
  fields: Schema.optional(Schema.Record(Schema.String, Schema.String)).pipe(
    T.HttpQuery("fields"),
  ),
  keyInflection: Schema.optional(
    Schema.Literals(["camel", "kebab", "snake"]),
  ).pipe(T.HttpHeader("Key-Inflection")),
  idempotencyKey: Schema.optional(Schema.String).pipe(
    T.HttpHeader("Idempotency-Key"),
  ),
  personaVersion: Schema.optional(
    Schema.Literals([
      "2025-12-08",
      "2025-10-27",
      "2023-01-05",
      "2022-09-01",
      "2021-08-18",
      "2021-07-05",
      "2021-02-21",
      "2020-05-18",
    ]),
  ).pipe(T.HttpHeader("Persona-Version")),
  data: Schema.Struct({
    attributes: Schema.Struct({
      name: Schema.optional(Schema.String),
      description: Schema.optional(Schema.NullOr(Schema.String)),
      url: Schema.optional(Schema.String),
      "enabled-events": Schema.optional(
        Schema.Array(
          Schema.Literals([
            "*",
            "account-property.redacted",
            "account-type.deleted-field",
            "account.added-relation",
            "account.archived",
            "account.consolidated",
            "account.consolidated-with",
            "account.created",
            "account.redacted",
            "account.removed-relation",
            "account.restored",
            "account.status-updated",
            "account.tag-added",
            "account.tag-removed",
            "account.updated-fields",
            "account.updated-tags",
            "agent-conversation.created",
            "agent-conversation.errored",
            "agent-conversation.message-added",
            "authentication.completed",
            "authentication.created",
            "authentication.expired",
            "authentication.failed",
            "authentication.redacted",
            "case-comment.created",
            "case-message.received",
            "case-message.sent",
            "case-template.deleted-field",
            "case.assigned",
            "case.created",
            "case.exported",
            "case.print-initiated",
            "case.queue-updated",
            "case.redacted",
            "case.reopened",
            "case.resolved",
            "case.sla-expired",
            "case.status-updated",
            "case.updated",
            "case.updated-fields",
            "case.updated-tags",
            "checkpoint.completed",
            "checkpoint.created",
            "checkpoint.expired",
            "checkpoint.failed",
            "checkpoint.reusable-persona-used",
            "checkpoint.started",
            "connect/share-token.inbound-created",
            "connect/share-token.inbound-redeemed",
            "connect/share-token.outbound-created",
            "connect/share-token.outbound-redeemed",
            "document.created",
            "document.errored",
            "document.extracted",
            "document.pending",
            "document.processed",
            "document.submitted",
            "filing.created",
            "filing.filed",
            "graph-query.cancelled",
            "graph-query.completed",
            "graph-query.errored",
            "graph-query.reran",
            "graph-query.submitted",
            "graph-query.timed-out",
            "importer-pipeline-run.canceled",
            "importer-pipeline-run.completed",
            "importer-pipeline-run.errored",
            "importer-pipeline-run.paused",
            "importer-pipeline-run.resumed",
            "importer-pipeline-run.started",
            "inquiry-session.canceled",
            "inquiry-session.expired",
            "inquiry-session.started",
            "inquiry-template-version.created",
            "inquiry-template-version.published",
            "inquiry.approved",
            "inquiry.completed",
            "inquiry.created",
            "inquiry.declined",
            "inquiry.expired",
            "inquiry.failed",
            "inquiry.marked-for-review",
            "inquiry.redacted",
            "inquiry.reusable-persona-assurance-failed",
            "inquiry.reusable-persona-created",
            "inquiry.reusable-persona-updated",
            "inquiry.reusable-persona-used",
            "inquiry.started",
            "inquiry.transitioned",
            "inquiry.updated-tags",
            "integration-log.created",
            "report/address-lookup.errored",
            "report/address-lookup.ready",
            "report/address-lookup.submitted",
            "report/adverse-media.dismissed",
            "report/adverse-media.errored",
            "report/adverse-media.matched",
            "report/adverse-media.ready",
            "report/background-check.ready",
            "report/better-business-bureau.errored",
            "report/better-business-bureau.ready",
            "report/business-adverse-media.dismissed",
            "report/business-adverse-media.errored",
            "report/business-adverse-media.matched",
            "report/business-adverse-media.ready",
            "report/business-associated-persons.errored",
            "report/business-associated-persons.ready",
            "report/business-classification.errored",
            "report/business-classification.ready",
            "report/business-classification.submitted",
            "report/business-enforcement-action.errored",
            "report/business-enforcement-action.ready",
            "report/business-enforcement-action.submitted",
            "report/business-industry-classification.errored",
            "report/business-industry-classification.ready",
            "report/business-industry-classification.submitted",
            "report/business-liens-lookup.errored",
            "report/business-liens-lookup.ready",
            "report/business-lookup-eu.errored",
            "report/business-lookup-eu.ready",
            "report/business-lookup.errored",
            "report/business-lookup.ready",
            "report/business-media-coverage.errored",
            "report/business-media-coverage.matched",
            "report/business-media-coverage.ready",
            "report/business-media-coverage.submitted",
            "report/business-nonprofit.changed",
            "report/business-nonprofit.errored",
            "report/business-nonprofit.ready",
            "report/business-online-presence.errored",
            "report/business-online-presence.ready",
            "report/business-online-presence.submitted",
            "report/business-personnel-insights.errored",
            "report/business-personnel-insights.ready",
            "report/business-personnel-insights.submitted",
            "report/business-registrations-lookup.errored",
            "report/business-registrations-lookup.ready",
            "report/business-social-media.errored",
            "report/business-social-media.ready",
            "report/business-watchlist.dismissed",
            "report/business-watchlist.errored",
            "report/business-watchlist.matched",
            "report/business-watchlist.ready",
            "report/business-website.errored",
            "report/business-website.ready",
            "report/chainalysis-address-screening.errored",
            "report/chainalysis-address-screening.ready",
            "report/clearbit-business-lookup.errored",
            "report/clearbit-business-lookup.ready",
            "report/coinbase-check-crypto-risk.errored",
            "report/coinbase-check-crypto-risk.ready",
            "report/community-safety.errored",
            "report/community-safety.matched",
            "report/community-safety.ready",
            "report/comply-advantage-search.ready",
            "report/comprehensive-profile.ready",
            "report/crypto-address-watchlist.errored",
            "report/crypto-address-watchlist.matched",
            "report/crypto-address-watchlist.ready",
            "report/crypto_address.matched",
            "report/crypto_address.ready",
            "report/custom-list.dismissed",
            "report/custom-list.errored",
            "report/custom-list.matched",
            "report/custom-list.ready",
            "report/email-address.errored",
            "report/email-address.ready",
            "report/employer-lookup.ready",
            "report/equifax-oneview.errored",
            "report/equifax-oneview.ready",
            "report/finra-broker-check.errored",
            "report/finra-broker-check.ready",
            "report/kyckr-business-lookup.errored",
            "report/kyckr-business-lookup.ready",
            "report/middesk.errored",
            "report/middesk.ready",
            "report/middesk.submitted",
            "report/mx-account.errored",
            "report/mx-account.ready",
            "report/nces.errored",
            "report/nces.ready",
            "report/novacredit-cash-atlas.errored",
            "report/novacredit-cash-atlas.ready",
            "report/novacredit-cash-atlas.submitted",
            "report/novacredit-credit-passport.errored",
            "report/novacredit-credit-passport.ready",
            "report/novacredit-credit-passport.submitted",
            "report/phone-number.errored",
            "report/phone-number.ready",
            "report/politically-exposed-person.dismissed",
            "report/politically-exposed-person.errored",
            "report/politically-exposed-person.matched",
            "report/politically-exposed-person.ready",
            "report/profile-non-authoritative.errored",
            "report/profile-non-authoritative.ready",
            "report/profile.errored",
            "report/profile.ready",
            "report/screening.errored",
            "report/screening.matched",
            "report/screening.ready",
            "report/sec-action-lookup.errored",
            "report/sec-action-lookup.ready",
            "report/sentilink-application-risk.errored",
            "report/sentilink-application-risk.ready",
            "report/sentilink-scores.errored",
            "report/sentilink-scores.ready",
            "report/social-media.errored",
            "report/social-media.ready",
            "report/synthetic.errored",
            "report/synthetic.ready",
            "report/trm-wallet-screening.errored",
            "report/trm-wallet-screening.ready",
            "report/watchlist.dismissed",
            "report/watchlist.errored",
            "report/watchlist.matched",
            "report/watchlist.ready",
            "sar.created",
            "sar.filed",
            "selfie.created",
            "selfie.errored",
            "selfie.processed",
            "selfie.submitted",
            "session.created",
            "session.expired",
            "transaction-type.deleted-field",
            "transaction.added-relation",
            "transaction.created",
            "transaction.labeled",
            "transaction.redacted",
            "transaction.removed-relation",
            "transaction.sentinel-session-processed",
            "transaction.status-updated",
            "transaction.updated-fields",
            "user.availability-updated",
            "verification.canceled",
            "verification.created",
            "verification.escalated",
            "verification.failed",
            "verification.passed",
            "verification.requires-retry",
            "verification.skipped",
            "verification.submitted",
            "verification.tentatively-failed",
            "verification.tentatively-passed",
            "verification.updated-tags",
            "workflow-run.created",
            "workflow-run.errored",
            "workflow-run.resumed",
            "workflow.published",
          ]),
        ),
      ),
      "api-version": Schema.optional(
        Schema.Literals([
          "2025-12-08",
          "2025-10-27",
          "2023-01-05",
          "2022-09-01",
          "2021-08-18",
          "2021-07-05",
          "2021-02-21",
          "2020-05-18",
        ]),
      ),
      "api-key-inflection": Schema.optional(
        Schema.Literals(["camel", "kebab", "snake"]),
      ),
      "api-attributes-blocklist": Schema.optional(Schema.Array(Schema.String)),
      "file-access-token-expires-in": Schema.optional(Schema.Number),
      "payload-filter": Schema.optional(
        Schema.Struct({
          data: Schema.optional(Schema.Record(Schema.String, Schema.Unknown)),
        }),
      ),
      "included-allowlist": Schema.optional(
        Schema.Union([
          Schema.Struct({
            state: Schema.String,
          }),
          Schema.Struct({
            state: Schema.String,
            "event-types": Schema.Array(
              Schema.Struct({
                "event-type": Schema.String,
                relationships: Schema.Array(Schema.String),
              }),
            ),
          }),
        ]),
      ),
      "relationship-allowlist": Schema.optional(
        Schema.Struct({
          state: Schema.String,
        }),
      ),
      "custom-http-headers": Schema.optional(
        StructWithAdditionalProperties(
          Schema.Struct({
            Authorization: Schema.optional(Schema.String),
            "Calling-Application": Schema.optional(Schema.String),
            "CF-Access-Client-Id": Schema.optional(Schema.String),
            "CF-Access-Client-Secret": Schema.optional(SensitiveString),
            "X-API-Key": Schema.optional(Schema.String),
          }),
          Schema.Unknown,
        ),
      ),
    }),
  }),
}).pipe(
  T.Http({ method: "POST", path: "/webhooks" }),
) as unknown as Schema.Codec<CreateAWebhookInput>;

// Output Schema
export interface CreateAWebhookOutput {
  data: {
    type?: string;
    id?: string;
    attributes?: {
      status?: string;
      url?: string;
      name?: string | null;
      description?: string | null;
      secret?: Redacted.Redacted<string>;
      secrets?: ReadonlyArray<{ value?: string; "expires-at"?: string | null }>;
      "api-version"?:
        | "2025-12-08"
        | "2025-10-27"
        | "2023-01-05"
        | "2022-09-01"
        | "2021-08-18"
        | "2021-07-05"
        | "2021-02-21"
        | "2020-05-18";
      "api-key-inflection"?: string;
      "api-attributes-blocklist"?: ReadonlyArray<string | null>;
      "file-access-token-expires-in"?: number;
      "enabled-events"?: ReadonlyArray<string>;
      "payload-filter"?: unknown | null;
      "included-allowlist"?:
        | { state: string }
        | {
            state: string;
            "event-types": ReadonlyArray<{
              "event-type": string;
              relationships: ReadonlyArray<string>;
            }>;
          }
        | null;
      "relationship-allowlist"?: { state: string };
      "created-at"?: string;
    };
  };
  included?: ReadonlyArray<unknown>;
}
export const CreateAWebhookOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  data: Schema.Struct({
    type: Schema.optional(Schema.String),
    id: Schema.optional(Schema.String),
    attributes: Schema.optional(
      Schema.Struct({
        status: Schema.optional(Schema.String),
        url: Schema.optional(Schema.String),
        name: Schema.optional(Schema.NullOr(Schema.String)),
        description: Schema.optional(Schema.NullOr(Schema.String)),
        secret: Schema.optional(SensitiveOutputString),
        secrets: Schema.optional(
          Schema.Array(
            Schema.Struct({
              value: Schema.optional(Schema.String),
              "expires-at": Schema.optional(Schema.NullOr(Schema.String)),
            }),
          ),
        ),
        "api-version": Schema.optional(
          Schema.Literals([
            "2025-12-08",
            "2025-10-27",
            "2023-01-05",
            "2022-09-01",
            "2021-08-18",
            "2021-07-05",
            "2021-02-21",
            "2020-05-18",
          ]),
        ),
        "api-key-inflection": Schema.optional(Schema.String),
        "api-attributes-blocklist": Schema.optional(
          Schema.Array(Schema.NullOr(Schema.String)),
        ),
        "file-access-token-expires-in": Schema.optional(Schema.Number),
        "enabled-events": Schema.optional(Schema.Array(Schema.String)),
        "payload-filter": Schema.optional(Schema.NullOr(Schema.Unknown)),
        "included-allowlist": Schema.optional(
          Schema.NullOr(
            Schema.Union([
              Schema.Struct({
                state: Schema.String,
              }),
              Schema.Struct({
                state: Schema.String,
                "event-types": Schema.Array(
                  Schema.Struct({
                    "event-type": Schema.String,
                    relationships: Schema.Array(Schema.String),
                  }),
                ),
              }),
            ]),
          ),
        ),
        "relationship-allowlist": Schema.optional(
          Schema.Struct({
            state: Schema.String,
          }),
        ),
        "created-at": Schema.optional(Schema.String),
      }),
    ),
  }),
  included: Schema.optional(Schema.Array(Schema.Unknown)),
}) as unknown as Schema.Codec<CreateAWebhookOutput>;

// The operation
/**
 * Create a Webhook
 *
 * Creates a new webhook with response defaults.
 *
 * @param Key-Inflection - Determines casing for the API response.
 * @param Idempotency-Key - Ensures the request is idempotent.
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const createAWebhook = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: CreateAWebhookInput,
  outputSchema: CreateAWebhookOutput,
  errors: [BadRequest, Forbidden, Conflict, UnprocessableEntity] as const,
}));
