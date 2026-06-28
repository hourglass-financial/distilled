> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Deposit accounts

Deposit accounts hold funds at Erebor for you and your customers. They're the source and destination for all payment activity: wires, ACH, book transfers, and blockchain transactions all settle into deposit accounts.

This guide covers account types, how accounts are created, and core account mechanics like balances and lifecycle.

## Account types

Erebor offers multiple account types, each designed for different use cases.

### Standard deposit accounts

Standard deposit accounts are your first-party corporate accounts at Erebor. They aren't part of a program, so they won't have a `program_id`. When you create these through [erebor.bank](https://erebor.bank), they become accessible through this API.

Each standard account has its own account number, routing number, and balance.

**Use when:**

* You want to programmatically interact with your own bank accounts

### Managed accounts

Managed accounts are `DDA`s opened for your end customers as part of a program. Each account holder — individual or business — goes through full KYC and becomes a legal customer of Erebor, with their own individual bank account.

Even though your end customers are legal customers of the bank, you — the program manager — own the relationship. Your customers don't interact with Erebor directly. Your platform orchestrates all account activity through the API, which lets you enforce your own business logic — approval flows, spending limits, scheduled payments — before any funds move.

**Use when:**

* You're building a wallet, stored-value product, or payment orchestration layer
* You need fully KYC'd customers with their own individual bank accounts
* You need to enforce business logic before funds move (approval flows, spending limits, scheduled payments)

**How they differ from standard accounts:**

* They belong to a program and have a `program_id`
* Each account holder is fully KYC'd and a legal customer of the bank, but you retain the customer relationship
* Your platform initiates all transactions on behalf of the end customer, which lets you enforce custom rules and approval workflows before any funds move

### FBO and Virtual accounts

Virtual accounts are `VIRTUAL_DDA`s that sit underneath an `FBO` account in a program. Each one has the same balance and transaction properties as a regular DDA, enabling complete subledgering: the FBO's balance is always the sum of its virtual accounts, and you cannot transact directly on the FBO — all activity flows through the virtual accounts underneath it.

**How they differ from managed accounts:**

* Account holders go through lightweight KYC and are not legal customers of the bank — you (the program manager) are, holding funds on their behalf through the parent FBO
* Virtual accounts share a parent FBO account instead of each being a standalone DDA
* Each virtual account tracks its own balance within the parent FBO's total
* Book transfers between virtual accounts on the same parent settle instantly with no fees

See [Virtual accounts](/accounts/virtual-accounts) for the full guide — use cases, how they're created, routing to a sub-account, and moving funds between sub-accounts.

## How accounts are created

Standard deposit accounts are created through [erebor.bank](https://erebor.bank) as your first-party corporate accounts. They exist outside of any program.

Managed and virtual accounts are created automatically when a customer's onboarding is approved within a program. Whether your program uses managed or virtual accounts is decided at the program level during setup with Erebor's sales team. The account type and configuration come from the deposit account template assigned to your program.

You can add additional account numbers and blockchain addresses to an account after it's created.

* **Account numbers** for fiat transfers (ACH and wire transfers)
* **Blockchain addresses** for on-chain transfers (crypto deposits and withdrawals)

## Balances

Every deposit account tracks four balance types:

| Balance       | What it represents                                  |
| ------------- | --------------------------------------------------- |
| **Current**   | Settled funds in the account                        |
| **Available** | Funds you can spend right now (current minus holds) |
| **Hold**      | Funds temporarily reserved and unavailable          |
| **Pending**   | Incoming funds that haven't settled yet             |

Balances update automatically as transactions process. Accounts can hold multiple currencies — each currency has its own set of balances.

## Account lifecycle

Accounts move through four statuses:

| Status      | Meaning                                                             |
| ----------- | ------------------------------------------------------------------- |
| **PENDING** | Created but not yet active. Awaiting approval or setup.             |
| **OPEN**    | Active and ready for transactions.                                  |
| **FROZEN**  | Temporarily blocked for compliance review. No transactions allowed. |
| **CLOSED**  | Permanently deactivated. No new transactions.                       |

Before closing an account, make sure all pending transactions have settled and the balance is zero.

## Choosing the right account type

| Consideration           | Standard                     | Managed                    | Virtual                           | FBO                                                   |
| ----------------------- | ---------------------------- | -------------------------- | --------------------------------- | ----------------------------------------------------- |
| Part of a program       | No                           | Yes                        | Yes                               | Yes                                                   |
| Account type            | DDA                          | DDA                        | VIRTUAL\_DDA under parent FBO     | FBO                                                   |
| Has `program_id`        | No                           | Yes                        | Yes                               | Yes                                                   |
| KYC in the API          | N/A (first-party)            | Full                       | Lightweight                       | N/A (program manager)                                 |
| Own bank account number | Yes                          | Yes                        | Yes                               | No                                                    |
| Own balance ledger      | Yes                          | Yes                        | Yes                               | Sum of virtual accounts                               |
| Used for                | Corporate operating accounts | Fully banked end customers | Fund segregation without full KYC | Parent container backing a program's virtual accounts |

## Next steps

* [Deposit account templates](/accounts/deposit-account-templates) — understand template configuration
* [Managed accounts](/accounts/managed-accounts) — deep dive into platform-controlled accounts
* [Virtual accounts](/accounts/virtual-accounts) — learn about sub-account partitioning