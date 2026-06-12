> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Erebor API Reference

The Erebor API lets you onboard customers, open accounts, and move money, 24/7/365. 

## Making Requests

### Authentication

All API requests require an API key in the Authorization header. Keys can be created, managed, and revoked in the [Developer Dashboard](https://developer.erebor.bank/)

```bash
curl -H "Authorization: your_api_key_here" ...
```

**Environment-Specific Keys:**

* **Live keys** (`live_`): Access production data and real money
* **Test keys** (`test_`): Access sandbox data with fake money for development

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

Write operations support safe retries using the `Erebor-Idempotency-Key` header. If this header is present, multiple requests including the same key will only perform the action once, and will return the same result (even if the result was an error). We recommend using an internal identifier unique to the request, and uniqueness across the Erebor API will be guaranteed for 72 hours. Idempotency keys sent to requests that are inherently idempotent like `GET` and `PATCH` will be ignored.

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
Erebor-Request-ID: req_01kasd1tthf1ns1pjn1kncctwd
```

Use this ID when contacting support or viewing request logs in the Developer Portal.

## Understanding Responses

### Response Types

The API uses three response patterns based on the operation.

* **Object** responses return a single resource (`GET /deposit_accounts/dep_acct_01kasd1tthf1ns1pjn1kncctwd`, `POST /deposit_accounts`).
* **List** responses return a collection of resources with pagination (`GET /deposit_accounts`).
* **Action** responses return the updated resource after performing an action (`POST /deposit_accounts/dep_acct_01kasd1tthf1ns1pjn1kncctwd/close`).

### Pagination

List endpoints use cursor-based pagination for performance.

```json
{
  "data": [...],
  "has_more": true,
  "page_size": 25,
  "page_next": "https://api.erebor.bank/deposit_accounts?starting_after=dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "page_prev": "https://api.erebor.bank/deposit_accounts?ending_before=dep_acct_01hbsd2ughf2ns2pjn2kncctxe"
}
```

Navigate pages using `starting_after` and `ending_before` cursors, or follow the `page_next` and `page_prev` URLs.

### Error Handling

All errors return structured JSON responses with actionable error codes.

```json
{
  "error": "INSUFFICIENT_FUNDS",
  "message": "The originating account has insufficient funds to cover the transfer.",
  "field": null,
  "docs_url": "https://docs.erebor.so/errors/insufficient-funds",
  "error_details": null
}
```

When a specific field causes the error, the response includes `field` (deprecated) and `error_details`:

```json
{
  "error": "INVALID_PARAMETER_VALUE",
  "message": "The value provided for 'amount' is not valid.",
  "field": "amount.raw_value",
  "docs_url": "https://docs.erebor.so/errors/invalid-parameter-value",
  "error_details": null
}
```

When fields fail validation, the response includes `error_details`:

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Person applicant validation failed.",
  "field": "citizenship",
  "error_details": [
    { "error_detail_type": "FIELD_ERROR", "field": "citizenship", "message": "citizenship is required." },
    { "error_detail_type": "FIELD_ERROR", "field": "tin", "message": "tin is required." }
  ],
  "docs_url": null
}
```

**Response Fields:**

* **`error`** *(required)*: Machine-readable error code
* **`message`** *(required)*: Human-readable description of the error
* **`field`** *(deprecated)*: Contains the field from the first `error_details` entry for backwards compatibility. Use `error_details` instead. May be removed in a future API version.
* **`docs_url`**: Link to relevant documentation for additional context
* **`error_details`**: An array of structured detail objects providing granular information about validation failures. Each item includes an `error_detail_type` discriminator (e.g., `FIELD_ERROR`) with per-field `field` and `message` properties.

## Working with Data

### Object IDs

All resources have IDs in the format `{type}_{uuid}` using UUIDv7.

```json
{
  "id": "bk_01kasd1tthf1ns1pjn1kncctwd",  // Book Transfer
  "id": "txn_01kasd1tthf1ns1pjn1kncctwd",  // Transaction
  "id": "cust_01kasd1tthf1ns1pjn1kncctwd"   // Customer
}
```

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
* **Headers** use `Pascal-Case` (e.g., `Erebor-Request-ID`, `Erebor-Version`).
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