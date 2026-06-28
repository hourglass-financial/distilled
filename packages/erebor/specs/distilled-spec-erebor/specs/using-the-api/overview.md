> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Using the API

Erebor's API is designed for reliable financial workflows across a global customer base. Use the endpoint reference alongside your generated or hand-written clients when building an integration. The OpenAPI specification is the source of truth for request schemas, response schemas, and available endpoints.

API requests require an [Erebor API key](/using-the-api/authentication). Contact Erebor if you need access to a test or live API key for building.

## Core resources

| Resource             | What it does                                                                              |
| -------------------- | ----------------------------------------------------------------------------------------- |
| **Programs**         | Top-level container configured by Erebor. All customers and accounts belong to a program. |
| **Customers**        | People or businesses that have passed onboarding and KYC review.                          |
| **Deposit Accounts** | Bank accounts that hold funds. Created automatically when onboarding is approved.         |
| **Counterparties**   | External parties you send money to or receive money from.                                 |
| **Payments**         | Payment instructions — wires, ACH, book transfers, blockchain, and Rail transfers.        |
| **Transactions**     | Entries in the bank's ledger that represent the movement of funds.                        |
| **Webhooks**         | Real-time notifications for status changes across all resources.                          |

## Request IDs

Every API response includes an `Erebor-Request-ID` header. Include this value when you contact support about a request.

## Getting help

Contact `support@erebor.bank` or your relationship manager for API access and support.