> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Book transfers

Book transfers move funds instantly between two deposit accounts on Erebor. They're ideal for internal movements like funding sub-accounts, sweeping balances, or transferring between customer accounts within your program.

## Before you start

To create a book transfer, you need:

1. A **source deposit account** with sufficient funds
2. A **destination deposit account** to receive the funds

Both accounts must be on the Erebor platform. For transfers to external parties, use [Domestic Wires](/payments/domestic-wires), [Domestic ACH](/payments/domestic-ach), or another payment rail.

## Creating a book transfer

Specify the source account, destination account, amount, and an optional memo.

```bash
curl -X POST "https://api.erebor.bank/book_transfers" \
  -H "Authorization: test_1a2b3c4d5e6f7g8h9i0j" \
  -H "Erebor-Idempotency-Key: unique-book-transfer-001" \
  -H "Content-Type: application/json" \
  -d '{
    "from_deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
    "to_deposit_account_id": "dep_acct_02kasd1tthf1ns1pjn1kncctwd",
    "amount": {
      "currency": "USD",
      "value": "150000"
    },
    "memo": "Monthly sweep to operating account"
  }'
```

The `amount.value` is in the smallest currency unit — cents for USD. A value of `"150000"` represents \$1,500.00.

## Book transfer statuses

Book transfers progress through the following statuses:

| Status    | Description                                                                   |
| --------- | ----------------------------------------------------------------------------- |
| `PENDING` | Transfer submitted and processing.                                            |
| `SETTLED` | Funds moved to the destination account. Terminal state.                       |
| `FAILED`  | Transfer rejected — insufficient funds or validation failure. Terminal state. |

## Retrieving a book transfer

```bash
curl -X GET "https://api.erebor.bank/book_transfers/bk_01kasd1tthf1ns1pjn1kncctwd" \
  -H "Authorization: test_1a2b3c4d5e6f7g8h9i0j"
```

## Webhooks

Subscribe to book transfer events for real-time status updates:

* `BOOK_TRANSFER.PENDING` — Book transfer submitted
* `BOOK_TRANSFER.SETTLED` — Book transfer settled
* `BOOK_TRANSFER.FAILED` — Book transfer failed

See [Supported Events](/api-reference/events/supported-events) for the full list.