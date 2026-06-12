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

All requests require an API key in the `Authorization` header. Your key's prefix determines the environment:

* `test_` keys hit the sandbox with simulated data
* `live_` keys hit production with real money

Both environments use the same base URL: `https://api.erebor.bank`.

```bash
curl -X GET "https://api.erebor.bank/programs" \
  -H "Authorization: test_1a2b3c4d5e6f7g8h9i0j"
```

## Core resources

| Resource             | What it does                                                                              |
| -------------------- | ----------------------------------------------------------------------------------------- |
| **Programs**         | Top-level container configured by Erebor. All customers and accounts belong to a program. |
| **Customers**        | People or businesses that have passed onboarding and KYC review.                          |
| **Deposit Accounts** | Bank accounts that hold funds. Created automatically when onboarding is approved.         |
| **Counterparties**   | External parties you send money to or receive money from.                                 |
| **Transfers**        | Payment instructions — wires, ACH, book transfers, blockchain, and rail transfers.        |
| **Webhooks**         | Real-time notifications for status changes across all resources.                          |

## Idempotency

All write operations accept an `Erebor-Idempotency-Key` header. If you retry a request with the same key within 72 hours, we'll return the original response instead of creating a duplicate. Use a unique internal identifier for each request.

```bash
curl -X POST "https://api.erebor.bank/wire_out" \
  -H "Authorization: test_1a2b3c4d5e6f7g8h9i0j" \
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