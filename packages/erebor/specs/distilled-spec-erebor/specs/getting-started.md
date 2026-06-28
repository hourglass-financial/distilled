> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Getting started

Erebor's API lets you onboard customers, open deposit accounts, and move money — all through a single REST integration. This guide walks you through the core concepts and points you to the right resources to start building.

## How it works

A typical integration follows three stages:

1. **Onboard customers** — Collect identity documents, submit applicants for KYC review, and get approved customers.
2. **Manage accounts** — Open deposit accounts, issue account numbers, and track balances.
3. **Move money** — Send and receive payments via ACH, wire, blockchain, and book transfers.

```mermaid
flowchart LR
    A[Onboard Customer] --> B[Open Accounts]
    B --> C[Move Money]
```

## Authentication

All requests require an API key in the `Authorization` header. Use a `test_key_` key while building, and use a `live_key_` key only when you are ready to operate in production with real money.

See [Authentication](/using-the-api/authentication) for API key management, test and live environments, IP allowlisting, and mTLS.

```bash
curl -X GET "https://api.erebor.bank/programs" \
  -H "Authorization: test_key_YOUR_API_KEY_HERE"
```

## Idempotency

All write operations accept an `Erebor-Idempotency-Key` header. If you retry a request with the same key within 72 hours, we'll return the original response instead of creating a duplicate. Use a unique internal identifier for each request.

```bash
curl -X POST "https://api.erebor.bank/wire_out" \
  -H "Authorization: test_key_YOUR_API_KEY_HERE" \
  -H "Erebor-Idempotency-Key: transfer-abc-123" \
  -H "Content-Type: application/json" \
  -d '{ ... }'
```

## Next steps

* [Onboarding overview](/onboarding/overview) — Learn how to turn applicants into approved customers
* [Domestic wires](/payments/domestic-wires) — Send and receive wire transfers
* [Domestic ACH](/payments/domestic-ach) — Move money via ACH
* [Book transfers](/payments/book-transfers) — Transfer between Erebor accounts instantly
* [Webhooks](/webhooks/webhooks) — Set up real-time event notifications
* [API reference](/api-reference) — Explore all available endpoints