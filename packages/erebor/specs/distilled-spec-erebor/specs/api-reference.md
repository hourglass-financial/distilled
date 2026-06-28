> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Erebor API Reference

The Erebor API lets you onboard customers, open accounts, and move money, 24/7/365. 

## Making Requests

### Authentication

All API requests require an API key in the `Authorization` header. See [Authentication](/using-the-api/authentication) for key management, test and live environments, IP allowlisting, and mTLS.

```bash
curl -H "Authorization: test_key_..." ...
```

Use `test_key_` keys for sandbox data and `live_key_` keys for production data and real money.

### REST URL Patterns

All resources follow standard RESTful patterns.

* `GET /resources` returns a list of resources.
* `POST /resources` creates a new resource.
* `GET /resources/{id}` retrieves a specific resource.
* `PATCH /resources/{id}` updates a specific resource.
* `POST /resources/{id}/{action}` performs an action on a resource (e.g., `/close`, `/archive`, `/ping`).

### API Versioning

Specify your desired API version in requests:

```bash
curl -H "Erebor-Version: 2025-12-21" ...
```

Responses echo the version served. Breaking changes create new versions (date-based).

### Idempotency

`POST`, `PATCH`, and `PUT` requests support safe retries using the `Erebor-Idempotency-Key` header. If this header is present, multiple requests including the same key will only perform the action once, and successful responses can be replayed for 72 hours. We recommend using an internal identifier unique to the request. Idempotency keys sent to requests that are inherently idempotent like `GET` will be ignored.

```bash
curl -H "Erebor-Idempotency-Key: transfer-abc-123" ...
```

If a response was previously processed and is being replayed based on the idempotency key, the server will return a response header:

```json
Erebor-Idempotent-Replayed: true
```

If a request is submitted with an idempotency key set, and then is later repeated with the same idempotency key set but with differing parameters, then we will return a failure response with `409 CONFLICT`.

### Request IDs

Every response includes a unique `Erebor-Request-ID` header for debugging.

```bash
# Response headers
Erebor-Request-ID: 0197b6f0-3f6a-7c3e-9b2a-d41e8c9f5a6b
```

Use this ID when contacting support or viewing request logs in the Developer Portal.

## Understanding Responses

### Response Types

The API uses three response patterns based on the operation.

* **Object** responses return a single resource (`GET /deposit_accounts/dep_acct_01kasd1tthf1ns1pjn1kncctwd`, `POST /deposit_accounts`).
* **List** responses return a collection of resources with pagination (`GET /deposit_accounts`).
* **Action** responses return the updated resource after performing an action (`POST /deposit_accounts/dep_acct_01kasd1tthf1ns1pjn1kncctwd/close`).

### Pagination

List endpoints use cursor-based pagination. See [Pagination](/using-the-api/pagination) for request fields, response fields, and examples.

### Error Handling

All errors return structured JSON responses with actionable error codes. See [Errors](/using-the-api/errors) for response fields, validation details, common codes, and retry guidance.

## Working with Data

### Object IDs

All resources have typed IDs.

| Resource      | Example ID                        |
| ------------- | --------------------------------- |
| Book Transfer | `bk_01kasd1tthf1ns1pjn1kncctwd`   |
| Transaction   | `txn_01kasd1tthf1ns1pjn1kncctwd`  |
| Customer      | `cust_01kasd1tthf1ns1pjn1kncctwd` |

IDs are temporally sortable and globally unique.

### Common Fields

All resources include these standard fields:

| Field         | Type      | Description                                   | Example                                                                 |
| ------------- | --------- | --------------------------------------------- | ----------------------------------------------------------------------- |
| `id`          | string    | Unique identifier for the resource            | `"txn_01kasd1tthf1ns1pjn1kncctwd"`                                      |
| `type`        | string    | The type of resource                          | `"TRANSACTION"`                                                         |
| `url`         | string    | API URL to fetch this resource                | `"https://api.erebor.bank/transactions/txn_01kasd1tthf1ns1pjn1kncctwd"` |
| `created_at`  | timestamp | When the resource was created                 | `"2025-11-15T00:46:06Z"`                                                |
| `updated_at`  | timestamp | When the resource was last updated            | `"2025-11-15T00:46:06Z"`                                                |
| `archived_at` | timestamp | When the resource was archived, or `null`     | `null`                                                                  |
| `custom_ref`  | string    | Your reference ID (255 chars max)             | `"external-id-123"`                                                     |
| `status`      | enum      | Current workflow state (async resources only) | `"SETTLED"`                                                             |

### Archival (Soft Deletes)

Resources are archived rather than deleted.

```bash
# Archive a counterparty
POST /counterparties/cp_01kasd1tthf1ns1pjn1kncctwd/archive
```

Archived objects have `archived_at` set and are excluded from responses by default.

## Standards & Conventions

### Naming Conventions

All API elements follow consistent naming conventions.

* **Fields** use `snake_case` (e.g., `account_number`, `created_at`).
* **Headers** use `Title-Case` (e.g., `Erebor-Request-ID`, `Erebor-Version`).
* **Enums** use `SCREAMING_CASE` (e.g., `ACTIVE`, `PENDING_APPROVAL`).

### Common Types

All data types use consistent formatting across endpoints.

* **Countries** use ISO 3166 alpha-2 codes (e.g., `"US"`).
* **Currencies** use ISO 4217 for fiat (e.g., `"USD"`) and ticker symbols for crypto (e.g., `"USDC"`).
* **Dates** use ISO 8601 format (e.g., `"2025-11-15"`).
* **Timestamps** use ISO 8601 UTC format with fields ending in `_at` (e.g., `"2025-11-15T00:46:06Z"`).
* **URLs** are fully qualified (e.g., `"https://api.erebor.bank/transactions/txn_9f8e7d6c"`).

### Money Representation

All monetary values are represented as strings to avoid floating-point errors.

```json
{
  "currency": "USD",
  "exponent": 2,
  "value": "125050",          // $1,250.50 in cents
  "display_value": "1250.50"
}
```

## OpenAPI

Erebor's API is OpenAPI 3.1 compatible and a full download is available below.

Download OpenAPI Spec