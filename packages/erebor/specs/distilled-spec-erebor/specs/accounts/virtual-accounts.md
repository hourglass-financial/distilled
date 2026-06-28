> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Virtual accounts

Virtual accounts (`VIRTUAL_DDA`) are deposit sub-accounts that sit under a shared parent **FBO** account. Each one keeps its own balance and transaction history — complete subledgering — so you can hold and segregate funds for many entities under a single FBO, without opening a separate bank account per entity.

Virtual accounts are one of Erebor's account types. For how they compare to standard, managed, and FBO accounts, see [Deposit accounts](/accounts/deposit-accounts#fbo-and-virtual-accounts).

This guide covers how virtual accounts work, common use cases, and how to create and manage them through the API.

## How virtual accounts work

A virtual account is a `VIRTUAL_DDA` that sits underneath a parent **FBO** account within a program. The FBO holds the aggregate balance; each virtual account underneath it tracks its own balance separately, giving you complete subledgering on top of a single bank account.

* **You are the legal customer.** Account holders go through lightweight KYC and are *not* legal customers of Erebor. You — the program manager — are the legal customer and hold funds on their behalf through the parent FBO.
* **Each virtual account has its own balance ledger.** A `VIRTUAL_DDA` has the same balance and transaction properties as a regular DDA, so you can reconcile per sub-account.
* **The FBO balance is always the sum of its virtual accounts.** You cannot transact directly in or out of the parent FBO — all activity flows through the virtual accounts underneath it.
* **Each virtual account has its own account number,** so external senders can route ACH and wire deposits to a specific sub-account (using that account number with the account's routing number).

**Licensing considerations.** Because you hold and move funds on behalf of your account holders, money transmitter licenses (MTLs) or equivalent authorization may apply depending on where you operate. Confirm your licensing requirements with Erebor's team before launching virtual accounts.

## When to use them

Virtual accounts are ideal for platforms managing pooled funds:

* **Marketplaces** holding per-seller balances under one program
* **Payroll platforms** segregating funds per employer
* **Treasury operations** splitting funds across business units, departments, or purposes

Use them when you need to segregate funds for accounting or reconciliation without opening a separate bank account per entity, and you don't need full KYC for each individual account holder.

## How virtual accounts are created

Whether your program uses virtual accounts (versus managed `DDA`s) is decided at the program level during setup with Erebor's team. The account type and configuration come from the [deposit account template](/accounts/deposit-account-templates) assigned to your program. There are two ways a virtual account comes into existence:

* **Automatically on onboarding** — when an account holder's [onboarding](/onboarding/overview) is approved within the program, the approval yields a `VIRTUAL_DDA` linked to your parent FBO.
* **Directly via the API** — call [Create Deposit Account](/api-reference/accounts/deposit-accounts/create-deposit-account) with a valid `deposit_account_template_id` and `customer_id`. If the template provisions virtual accounts, the new account is created as a `VIRTUAL_DDA` under your program's FBO.

## Working with virtual accounts

Virtual accounts are returned by the same [Deposit Accounts API](/api-reference/accounts/deposit-accounts/the-deposit-account-object) as every other account. An account is virtual when its `deposit_account_type` is `VIRTUAL_DDA` — that's the only field that determines it. On a virtual account, `parent_account_id` then holds the ID of its parent FBO; it's `null` on non-virtual accounts.

### List the virtual accounts in your program

Filter [List Deposit Accounts](/api-reference/accounts/deposit-accounts/list-deposit-accounts) by `deposit_account_type`:

```bash
curl -X GET "https://api.erebor.bank/deposit_accounts?deposit_account_type=VIRTUAL_DDA" \
  -H "Authorization: test_key_YOUR_API_KEY_HERE"
```

### List the virtual accounts under one FBO

Filter by `parent_account_id` to retrieve just the sub-accounts of a specific FBO:

```bash
curl -X GET "https://api.erebor.bank/deposit_accounts?parent_account_id=dep_acct_01kasd1tthf1ns1pjn1kncctwd" \
  -H "Authorization: test_key_YOUR_API_KEY_HERE"
```

### Retrieve a single virtual account

Pass a `VIRTUAL_DDA`'s own ID (not the FBO's) as the path parameter:

```bash
curl -X GET "https://api.erebor.bank/deposit_accounts/dep_acct_01h2xcejqtf2r6pbea6zzp3q5m" \
  -H "Authorization: test_key_YOUR_API_KEY_HERE"
```

The response carries the account's own `balances`, its `deposit_account_type` (`VIRTUAL_DDA`), and the `parent_account_id` pointing at its FBO (here, `dep_acct_01kasd1tthf1ns1pjn1kncctwd`).

### Move funds between virtual accounts

Moving funds between virtual accounts works just like any other Erebor account. See [Paying other Erebor accounts](https://docs.erebor.bank/payments/paying-other-erebor-accounts) for how to choose between a book transfer and a Rail transfer.

Because every virtual account sits under the same parent FBO, a book transfer between two siblings nets to zero at the FBO level — it only shifts the subledger.

## Balances and lifecycle

Each virtual account tracks the same balance types and moves through the same statuses (`PENDING`, `OPEN`, `FROZEN`, `CLOSED`) as any deposit account. See [Deposit accounts → Balances](/accounts/deposit-accounts#balances) and [Account lifecycle](/accounts/deposit-accounts#account-lifecycle) for the full reference.