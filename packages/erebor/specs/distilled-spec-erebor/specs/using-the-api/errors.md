> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Errors

Use error responses to decide whether to fix a request, retry it, or contact support.

## Error response shape

All errors return structured JSON.

```json
{
  "error": "INSUFFICIENT_FUNDS",
  "message": "The originating account has insufficient funds to cover the transfer.",
  "field": null,
  "docs_url": null,
  "error_details": null
}
```

Branch on `error` in your integration. It is the stable, machine-readable error code. Use `message` for display or logs, not control flow.

| Field           | Description                                                                          |
| --------------- | ------------------------------------------------------------------------------------ |
| `error`         | Machine-readable error code. Required.                                               |
| `message`       | Human-readable description. Required.                                                |
| `field`         | Deprecated field path kept for backwards compatibility. Use `error_details` instead. |
| `docs_url`      | Link to relevant docs when available. May be `null`.                                 |
| `error_details` | Structured details for validation failures. May be `null`.                           |

## Field errors

When fields fail validation, the response includes `error_details`.

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Person applicant validation failed.",
  "field": "citizenship",
  "docs_url": null,
  "error_details": [
    {
      "error_detail_type": "FIELD_ERROR",
      "field": "citizenship",
      "message": "citizenship is required."
    },
    {
      "error_detail_type": "FIELD_ERROR",
      "field": "tin",
      "message": "tin is required."
    }
  ]
}
```

Each detail includes an `error_detail_type`. `FIELD_ERROR` means a specific request field failed validation. New detail types may be added later; ignore unknown `error_detail_type` values you do not understand.

## Common error codes

| HTTP status | `error`               | What to do                                                                                                            |
| ----------- | --------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `400`       | `INVALID_REQUEST`     | Fix the request shape, parameter, or body.                                                                            |
| `401`       | `UNAUTHORIZED`        | Check that the `Authorization` header contains a valid API key.                                                       |
| `403`       | `FORBIDDEN`           | Check API key permissions and enabled product access.                                                                 |
| `404`       | `NOT_FOUND`           | Check the resource ID and whether the resource is available to your customer.                                         |
| `409`       | `CONFLICT`            | Resolve the conflicting request state before retrying.                                                                |
| `422`       | `VALIDATION_ERROR`    | Fix the fields listed in `error_details`.                                                                             |
| `422`       | `INSUFFICIENT_FUNDS`  | Fund the account or lower the transfer amount.                                                                        |
| `429`       | `RATE_LIMITED`        | Back off if the message describes a transient limit. Some 429s are capability gates and will not succeed by retrying. |
| `500`       | `INTERNAL_ERROR`      | Retry with backoff. Contact support if the error persists.                                                            |
| `503`       | `SERVICE_UNAVAILABLE` | Retry with backoff.                                                                                                   |

Some endpoints return more specific codes, such as `CUSTOMER_OUTBOUND_BLOCKED` or `USE_RAIL`. Handle known codes explicitly and fall back to the HTTP status for unknown codes.

## Retry guidance

| Failure                                                                       | Retry?                                                                                       |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `INVALID_REQUEST` or `VALIDATION_ERROR`                                       | No. Change the request first.                                                                |
| `CONFLICT`                                                                    | Usually no. For idempotency conflicts, use a unique idempotency key for a different request. |
| Transient `RATE_LIMITED`                                                      | Yes, with exponential backoff and jitter.                                                    |
| Capability-gate `RATE_LIMITED`                                                | No. Change the request or contact Erebor.                                                    |
| `INTERNAL_ERROR`, `SERVICE_UNAVAILABLE`, network timeout, or connection reset | Yes, with exponential backoff and jitter. Use `Erebor-Idempotency-Key` when retrying writes. |
| External dependency failure                                                   | Usually yes, with backoff. If the error persists, contact support with the request ID.       |

## Debugging

Every API response includes an `Erebor-Request-ID` header. Include this value when you contact `support@erebor.bank`.

See [Using the API](/using-the-api/overview) for the request ID overview.