import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";

// Input Schema
export interface ListEventsInput {
  page_size?: number;
  starting_after?: string;
  ending_before?: string;
  event_type?:
    | "DEPOSIT_ACCOUNT.CREATED"
    | "DEPOSIT_ACCOUNT.PENDING"
    | "DEPOSIT_ACCOUNT.OPEN"
    | "DEPOSIT_ACCOUNT.CLOSED"
    | "DEPOSIT_ACCOUNT.FROZEN"
    | "ACH_IN.CREATED"
    | "ACH_IN.PENDING"
    | "ACH_IN.SETTLED"
    | "ACH_IN.FAILED"
    | "ACH_IN.RETURNED"
    | "ACH_OUT.CREATED"
    | "ACH_OUT.PENDING"
    | "ACH_OUT.SETTLED"
    | "ACH_OUT.FAILED"
    | "ACH_OUT.RETURNED"
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
    | "CUSTOMER.CREATED";
  program_id?: string;
  ereborVersion?: string;
}
export const ListEventsInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  page_size: Schema.optional(Schema.Number).pipe(T.HttpQuery("page_size")),
  starting_after: Schema.optional(Schema.String).pipe(
    T.HttpQuery("starting_after"),
  ),
  ending_before: Schema.optional(Schema.String).pipe(
    T.HttpQuery("ending_before"),
  ),
  event_type: Schema.optional(
    Schema.Literals([
      "DEPOSIT_ACCOUNT.CREATED",
      "DEPOSIT_ACCOUNT.PENDING",
      "DEPOSIT_ACCOUNT.OPEN",
      "DEPOSIT_ACCOUNT.CLOSED",
      "DEPOSIT_ACCOUNT.FROZEN",
      "ACH_IN.CREATED",
      "ACH_IN.PENDING",
      "ACH_IN.SETTLED",
      "ACH_IN.FAILED",
      "ACH_IN.RETURNED",
      "ACH_OUT.CREATED",
      "ACH_OUT.PENDING",
      "ACH_OUT.SETTLED",
      "ACH_OUT.FAILED",
      "ACH_OUT.RETURNED",
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
    ]),
  ).pipe(T.HttpQuery("event_type")),
  program_id: Schema.optional(Schema.String).pipe(T.HttpQuery("program_id")),
  ereborVersion: Schema.optional(Schema.String).pipe(
    T.HttpHeader("Erebor-Version"),
  ),
}).pipe(
  T.Http({ method: "GET", path: "/events" }),
) as unknown as GeneratedStructCodec<ListEventsInput>;

// Output Schema
export interface ListEventsOutput {
  data: ReadonlyArray<{
    id: string;
    type: "EVENT";
    url: string;
    created_at: string;
    updated_at: string;
    archived_at?: string | null;
    program_id?: string | null;
    event_type:
      | "DEPOSIT_ACCOUNT.CREATED"
      | "DEPOSIT_ACCOUNT.PENDING"
      | "DEPOSIT_ACCOUNT.OPEN"
      | "DEPOSIT_ACCOUNT.CLOSED"
      | "DEPOSIT_ACCOUNT.FROZEN"
      | "ACH_IN.CREATED"
      | "ACH_IN.PENDING"
      | "ACH_IN.SETTLED"
      | "ACH_IN.FAILED"
      | "ACH_IN.RETURNED"
      | "ACH_OUT.CREATED"
      | "ACH_OUT.PENDING"
      | "ACH_OUT.SETTLED"
      | "ACH_OUT.FAILED"
      | "ACH_OUT.RETURNED"
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
      | "CUSTOMER.CREATED";
    resource: {};
    api_version: string;
    trace?: {
      request_id?: string | null;
      request_idempotency_key?: string | null;
    };
  }>;
  has_more: boolean;
  page_size: number;
  page_next?: string | null;
  page_prev?: string | null;
  url: string;
}
export const ListEventsOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  data: Schema.Array(
    Schema.Struct({
      id: Schema.String,
      type: Schema.Literals(["EVENT"]),
      url: Schema.String,
      created_at: Schema.String,
      updated_at: Schema.String,
      archived_at: Schema.optional(Schema.NullOr(Schema.String)),
      program_id: Schema.optional(Schema.NullOr(Schema.String)),
      event_type: Schema.Literals([
        "DEPOSIT_ACCOUNT.CREATED",
        "DEPOSIT_ACCOUNT.PENDING",
        "DEPOSIT_ACCOUNT.OPEN",
        "DEPOSIT_ACCOUNT.CLOSED",
        "DEPOSIT_ACCOUNT.FROZEN",
        "ACH_IN.CREATED",
        "ACH_IN.PENDING",
        "ACH_IN.SETTLED",
        "ACH_IN.FAILED",
        "ACH_IN.RETURNED",
        "ACH_OUT.CREATED",
        "ACH_OUT.PENDING",
        "ACH_OUT.SETTLED",
        "ACH_OUT.FAILED",
        "ACH_OUT.RETURNED",
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
      ]),
      resource: Schema.Struct({}),
      api_version: Schema.String,
      trace: Schema.optional(
        Schema.Struct({
          request_id: Schema.optional(Schema.NullOr(Schema.String)),
          request_idempotency_key: Schema.optional(
            Schema.NullOr(Schema.String),
          ),
        }),
      ),
    }),
  ),
  has_more: Schema.Boolean,
  page_size: Schema.Number,
  page_next: Schema.optional(Schema.NullOr(Schema.String)),
  page_prev: Schema.optional(Schema.NullOr(Schema.String)),
  url: Schema.String,
}) as unknown as GeneratedStructCodec<ListEventsOutput>;

// The operation
/**
 * List Events
 *
 * Retrieve a paginated list of Webhook Events
 *
 * @param page_size - Number of items per page (max 100)
 * @param starting_after - Cursor for pagination (exclusive start)
 * @param ending_before - Cursor for pagination (exclusive end)
 * @param event_type - Filter by event type. See [Supported Events](/api-reference/events/supported-events) for a list of available event types.
 * @param program_id - Filter by program ID
 * @param ereborVersion - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const listEvents = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: ListEventsInput,
  outputSchema: ListEventsOutput,
}));
