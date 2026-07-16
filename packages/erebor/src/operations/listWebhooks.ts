import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { BadRequest, NotFound } from "../errors.ts";
import { SensitiveOutputNullableString } from "../sensitive.ts";
import * as Redacted from "effect/Redacted";

// Input Schema
export interface ListWebhooksInput {
  page_size?: number;
  starting_after?: string;
  ending_before?: string;
  status?: ReadonlyArray<"ENABLED" | "DISABLED" | "ARCHIVED">;
  webhook_url?: ReadonlyArray<string>;
  custom_ref?: string;
  ereborVersion?: string;
}
export const ListWebhooksInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  page_size: Schema.optional(Schema.Number),
  starting_after: Schema.optional(Schema.String),
  ending_before: Schema.optional(Schema.String),
  status: Schema.optional(
    Schema.Array(Schema.Literals(["ENABLED", "DISABLED", "ARCHIVED"])),
  ),
  webhook_url: Schema.optional(Schema.Array(Schema.String)),
  custom_ref: Schema.optional(Schema.String),
  ereborVersion: Schema.optional(Schema.String).pipe(
    T.HttpHeader("Erebor-Version"),
  ),
}).pipe(
  T.Http({ method: "GET", path: "/webhooks" }),
) as unknown as Schema.Codec<ListWebhooksInput>;

// Output Schema
export interface ListWebhooksOutput {
  data: ReadonlyArray<{
    id: string;
    type: "WEBHOOK";
    url: string;
    created_at: string;
    updated_at: string;
    archived_at?: string | null;
    name: string;
    status: "ENABLED" | "DISABLED" | "ARCHIVED";
    webhook_url: string;
    webhook_secret?: Redacted.Redacted<string> | null;
    event_types?: ReadonlyArray<
      | "DEPOSIT_ACCOUNT.CREATED"
      | "DEPOSIT_ACCOUNT.PENDING"
      | "DEPOSIT_ACCOUNT.OPEN"
      | "DEPOSIT_ACCOUNT.UPDATED"
      | "DEPOSIT_ACCOUNT.CLOSED"
      | "DEPOSIT_ACCOUNT.FROZEN"
      | "TRANSFER.PENDING"
      | "TRANSFER.SETTLED"
      | "TRANSFER.FAILED"
      | "ACH_IN.CREATED"
      | "ACH_IN.PENDING"
      | "ACH_IN.SETTLED"
      | "ACH_IN.FAILED"
      | "ACH_IN.RETURNED"
      | "ACH_OUT.CREATED"
      | "ACH_OUT.PENDING"
      | "ACH_OUT.SENT"
      | "ACH_OUT.SETTLED"
      | "ACH_OUT.FAILED"
      | "ACH_OUT.RETURNED"
      | "ACH_OUT.CANCELLED"
      | "WIRE_IN.CREATED"
      | "WIRE_IN.PENDING"
      | "WIRE_IN.SETTLED"
      | "WIRE_IN.FAILED"
      | "WIRE_IN.RETURNED"
      | "WIRE_IN.RESOLVING_FROM_SUSPENSE"
      | "WIRE_OUT.CREATED"
      | "WIRE_OUT.PENDING"
      | "WIRE_OUT.SETTLED"
      | "WIRE_OUT.FAILED"
      | "WIRE_OUT.RETURNED"
      | "INTERNATIONAL_WIRE_IN.PENDING"
      | "INTERNATIONAL_WIRE_IN.SETTLED"
      | "INTERNATIONAL_WIRE_IN.FAILED"
      | "INTERNATIONAL_WIRE_IN.RETURNED"
      | "INTERNATIONAL_WIRE_OUT.CREATED"
      | "INTERNATIONAL_WIRE_OUT.PENDING"
      | "INTERNATIONAL_WIRE_OUT.SETTLED"
      | "INTERNATIONAL_WIRE_OUT.FAILED"
      | "INTERNATIONAL_WIRE_OUT.RETURNED"
      | "BLOCKCHAIN_IN.CREATED"
      | "BLOCKCHAIN_IN.PENDING"
      | "BLOCKCHAIN_IN.NEEDS_ATTRIBUTION"
      | "BLOCKCHAIN_IN.SETTLED"
      | "BLOCKCHAIN_IN.FAILED"
      | "BLOCKCHAIN_OUT.CREATED"
      | "BLOCKCHAIN_OUT.PENDING"
      | "BLOCKCHAIN_OUT.SETTLED"
      | "BLOCKCHAIN_OUT.FAILED"
      | "BOOK_TRANSFER.CREATED"
      | "BOOK_TRANSFER.PENDING"
      | "BOOK_TRANSFER.SETTLED"
      | "BOOK_TRANSFER.FAILED"
      | "RAIL_IN.CREATED"
      | "RAIL_IN.PENDING"
      | "RAIL_IN.SETTLED"
      | "RAIL_IN.FAILED"
      | "RAIL_OUT.CREATED"
      | "RAIL_OUT.PENDING"
      | "RAIL_OUT.SETTLED"
      | "RAIL_OUT.FAILED"
      | "TRANSACTION.CREATED"
      | "TRANSACTION.PENDING"
      | "TRANSACTION.POSTED"
      | "TRANSACTION.SETTLED"
      | "TRANSACTION.FAILED"
      | "TRANSACTION.REVERSED"
      | "ONBOARDING.SUBMITTED"
      | "ONBOARDING.UNDER_REVIEW"
      | "ONBOARDING.APPROVED"
      | "ONBOARDING.REJECTED"
      | "COUNTERPARTY.CREATED"
      | "COUNTERPARTY.UPDATED"
      | "COUNTERPARTY.ARCHIVED"
      | "COUNTERPARTY_BANK_ACCOUNT.CREATED"
      | "COUNTERPARTY_BANK_ACCOUNT.ARCHIVED"
      | "COUNTERPARTY_BLOCKCHAIN_ADDRESS.CREATED"
      | "COUNTERPARTY_BLOCKCHAIN_ADDRESS.ARCHIVED"
      | "COUNTERPARTY_BLOCKCHAIN_ADDRESS.ATTRIBUTED.SELF_HOSTED"
      | "COUNTERPARTY_BLOCKCHAIN_ADDRESS.ATTRIBUTED.CUSTODIAN"
      | "COUNTERPARTY_BLOCKCHAIN_ADDRESS.ATTRIBUTED.CUSTODIAN_OTHER"
      | "COUNTERPARTY_INTERNATIONAL_BANK_ACCOUNT.ARCHIVED"
      | "COUNTERPARTY_RAIL_ADDRESS.ARCHIVED"
      | "CUSTOMER.CREATED"
      | "CUSTOMER.UPDATED"
      | "*"
    > | null;
    idempotency_key: string;
    custom_ref?: string | null;
    custom_fields?: Record<string, unknown> | null;
  }>;
  has_more: boolean;
  page_size: number;
  page_next?: string | null;
  page_prev?: string | null;
  url: string;
}
export const ListWebhooksOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  data: Schema.Array(
    Schema.Struct({
      id: Schema.String,
      type: Schema.Literals(["WEBHOOK"]),
      url: Schema.String,
      created_at: Schema.String,
      updated_at: Schema.String,
      archived_at: Schema.optional(Schema.NullOr(Schema.String)),
      name: Schema.String,
      status: Schema.Literals(["ENABLED", "DISABLED", "ARCHIVED"]),
      webhook_url: Schema.String,
      webhook_secret: Schema.optional(SensitiveOutputNullableString),
      event_types: Schema.optional(
        Schema.NullOr(
          Schema.Array(
            Schema.Literals([
              "DEPOSIT_ACCOUNT.CREATED",
              "DEPOSIT_ACCOUNT.PENDING",
              "DEPOSIT_ACCOUNT.OPEN",
              "DEPOSIT_ACCOUNT.UPDATED",
              "DEPOSIT_ACCOUNT.CLOSED",
              "DEPOSIT_ACCOUNT.FROZEN",
              "TRANSFER.PENDING",
              "TRANSFER.SETTLED",
              "TRANSFER.FAILED",
              "ACH_IN.CREATED",
              "ACH_IN.PENDING",
              "ACH_IN.SETTLED",
              "ACH_IN.FAILED",
              "ACH_IN.RETURNED",
              "ACH_OUT.CREATED",
              "ACH_OUT.PENDING",
              "ACH_OUT.SENT",
              "ACH_OUT.SETTLED",
              "ACH_OUT.FAILED",
              "ACH_OUT.RETURNED",
              "ACH_OUT.CANCELLED",
              "WIRE_IN.CREATED",
              "WIRE_IN.PENDING",
              "WIRE_IN.SETTLED",
              "WIRE_IN.FAILED",
              "WIRE_IN.RETURNED",
              "WIRE_IN.RESOLVING_FROM_SUSPENSE",
              "WIRE_OUT.CREATED",
              "WIRE_OUT.PENDING",
              "WIRE_OUT.SETTLED",
              "WIRE_OUT.FAILED",
              "WIRE_OUT.RETURNED",
              "INTERNATIONAL_WIRE_IN.PENDING",
              "INTERNATIONAL_WIRE_IN.SETTLED",
              "INTERNATIONAL_WIRE_IN.FAILED",
              "INTERNATIONAL_WIRE_IN.RETURNED",
              "INTERNATIONAL_WIRE_OUT.CREATED",
              "INTERNATIONAL_WIRE_OUT.PENDING",
              "INTERNATIONAL_WIRE_OUT.SETTLED",
              "INTERNATIONAL_WIRE_OUT.FAILED",
              "INTERNATIONAL_WIRE_OUT.RETURNED",
              "BLOCKCHAIN_IN.CREATED",
              "BLOCKCHAIN_IN.PENDING",
              "BLOCKCHAIN_IN.NEEDS_ATTRIBUTION",
              "BLOCKCHAIN_IN.SETTLED",
              "BLOCKCHAIN_IN.FAILED",
              "BLOCKCHAIN_OUT.CREATED",
              "BLOCKCHAIN_OUT.PENDING",
              "BLOCKCHAIN_OUT.SETTLED",
              "BLOCKCHAIN_OUT.FAILED",
              "BOOK_TRANSFER.CREATED",
              "BOOK_TRANSFER.PENDING",
              "BOOK_TRANSFER.SETTLED",
              "BOOK_TRANSFER.FAILED",
              "RAIL_IN.CREATED",
              "RAIL_IN.PENDING",
              "RAIL_IN.SETTLED",
              "RAIL_IN.FAILED",
              "RAIL_OUT.CREATED",
              "RAIL_OUT.PENDING",
              "RAIL_OUT.SETTLED",
              "RAIL_OUT.FAILED",
              "TRANSACTION.CREATED",
              "TRANSACTION.PENDING",
              "TRANSACTION.POSTED",
              "TRANSACTION.SETTLED",
              "TRANSACTION.FAILED",
              "TRANSACTION.REVERSED",
              "ONBOARDING.SUBMITTED",
              "ONBOARDING.UNDER_REVIEW",
              "ONBOARDING.APPROVED",
              "ONBOARDING.REJECTED",
              "COUNTERPARTY.CREATED",
              "COUNTERPARTY.UPDATED",
              "COUNTERPARTY.ARCHIVED",
              "COUNTERPARTY_BANK_ACCOUNT.CREATED",
              "COUNTERPARTY_BANK_ACCOUNT.ARCHIVED",
              "COUNTERPARTY_BLOCKCHAIN_ADDRESS.CREATED",
              "COUNTERPARTY_BLOCKCHAIN_ADDRESS.ARCHIVED",
              "COUNTERPARTY_BLOCKCHAIN_ADDRESS.ATTRIBUTED.SELF_HOSTED",
              "COUNTERPARTY_BLOCKCHAIN_ADDRESS.ATTRIBUTED.CUSTODIAN",
              "COUNTERPARTY_BLOCKCHAIN_ADDRESS.ATTRIBUTED.CUSTODIAN_OTHER",
              "COUNTERPARTY_INTERNATIONAL_BANK_ACCOUNT.ARCHIVED",
              "COUNTERPARTY_RAIL_ADDRESS.ARCHIVED",
              "CUSTOMER.CREATED",
              "CUSTOMER.UPDATED",
              "*",
            ]),
          ),
        ),
      ),
      idempotency_key: Schema.String,
      custom_ref: Schema.optional(Schema.NullOr(Schema.String)),
      custom_fields: Schema.optional(
        Schema.NullOr(Schema.Record(Schema.String, Schema.Unknown)),
      ),
    }),
  ),
  has_more: Schema.Boolean,
  page_size: Schema.Number,
  page_next: Schema.optional(Schema.NullOr(Schema.String)),
  page_prev: Schema.optional(Schema.NullOr(Schema.String)),
  url: Schema.String,
}) as unknown as Schema.Codec<ListWebhooksOutput>;

// The operation
/**
 * List Webhooks
 *
 * Retrieve a paginated list of Webhook endpoints.
 *
 * @param page_size - Number of items per page (max 100)
 * @param starting_after - Cursor for pagination (exclusive start)
 * @param ending_before - Cursor for pagination (exclusive end)
 * @param status - Filter by webhook status. Repeat the param to filter on multiple statuses (ORed together).
 * @param webhook_url - Filter by exact webhook URL. Repeat the param to match on multiple URLs (ORed together).
 * @param custom_ref - Filter by exact `custom_ref` match (case-sensitive, up to 255 characters).
 * @param Erebor-Version - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const listWebhooks = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListWebhooksInput,
  outputSchema: ListWebhooksOutput,
  errors: [BadRequest, NotFound] as const,
}));
