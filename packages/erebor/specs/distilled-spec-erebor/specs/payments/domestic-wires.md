> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Domestic wires

Domestic wire transfers move funds between US financial institutions over the Fedwire network. Wires are ideal for high-value, time-sensitive payments that need same-day settlement.

## Before you start

To send a domestic wire, you need:

1. A **deposit account** with sufficient funds
2. A **counterparty** with a US bank account linked

If you haven't set up counterparties yet, create one first via the [Counterparties API](/api-reference/counterparties/counterparties/create-counterparty).

## Sending a wire

Create an outbound wire transfer by specifying the source account, destination counterparty US bank account, amount, and an optional memo.

```bash
curl -X POST "https://api.erebor.bank/wire_out" \
  -H "Authorization: test_key_YOUR_API_KEY_HERE" \
  -H "Erebor-Idempotency-Key: unique-wire-request-001" \
  -H "Content-Type: application/json" \
  -d '{
    "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
    "counterparty_us_bank_account_id": "cp_us_bank_acct_01kasd1tthf1ns1pjn1kncctwd",
    "amount": {
      "currency": "USD",
      "value": "150000"
    },
    "memo": "Invoice INV-2025-001 payment"
  }'
```

The `amount.value` is in the smallest currency unit — cents for USD. A value of `"150000"` represents \$1,500.00.

## Cutoff times

All times are **Eastern Time (ET)**.

| If you submit...              | Your wire will process... |
| ----------------------------- | ------------------------- |
| Mon–Fri, **by 5:30 PM ET**    | Same business day         |
| Mon–Fri, **after 5:30 PM ET** | Next business day         |
| Weekends and federal holidays | Next business day         |

The submission window opens at **9:00 PM ET the previous business day**.

The Fedwire network's official customer credit cutoff is 6:45 PM ET, but Erebor's submission deadline is **5:30 PM ET** to allow for processing before the Fed window closes.

## Wire statuses

Domestic wires progress through the following statuses:

| Status                    | Description                                                                                                             |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `CREATED`                 | Wire was created.                                                                                                       |
| `PENDING`                 | Wire submitted and queued for processing.                                                                               |
| `SETTLED`                 | Funds delivered to the beneficiary.                                                                                     |
| `FAILED`                  | Wire rejected — insufficient funds, invalid account, or compliance screening failure.                                   |
| `RETURNED`                | Receiving institution returned the wire. Funds credited back to your account.                                           |
| `RESOLVING_FROM_SUSPENSE` | Inbound only — wire was held in suspense (unroutable on initial receipt) and is being resolved to the customer account. |

## Receiving inbound wires

Inbound wires arrive automatically when another institution sends funds to your customer's account. No action is required on your part — you'll receive a webhook event when the wire lands.

Retrieve an inbound wire:

```bash
curl -X GET "https://api.erebor.bank/wire_in/wire_in_01kasd1tthf1ns1pjn1kncctwd" \
  -H "Authorization: test_key_YOUR_API_KEY_HERE"
```

## Webhooks

Subscribe to wire transfer events to get real-time status updates:

* `WIRE_OUT.PENDING` — Outbound wire submitted
* `WIRE_OUT.SETTLED` — Outbound wire settled
* `WIRE_OUT.FAILED` — Outbound wire failed
* `WIRE_OUT.RETURNED` — Outbound wire returned
* `WIRE_IN.PENDING` — Inbound wire received
* `WIRE_IN.SETTLED` — Inbound wire settled

See [Supported Events](/api-reference/events/supported-events) for the full list.