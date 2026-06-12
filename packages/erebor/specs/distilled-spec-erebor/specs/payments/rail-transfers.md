> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Rail transfers

Rail transfers move USD funds instantly between accounts on Erebor's rail network. You can address the destination by account ID — for accounts you manage — or by a counterparty's rail address.

## Sending to an account you manage

If you know the destination deposit account ID (e.g., another account in your program), pass `to_deposit_account_id` directly:

```bash
curl -X POST "https://api.erebor.bank/rail_out" \
  -H "Authorization: test_1a2b3c4d5e6f7g8h9i0j" \
  -H "Erebor-Idempotency-Key: unique-rail-request-001" \
  -H "Content-Type: application/json" \
  -d '{
    "from_deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
"to_deposit_account_id": "dep_acct_02kasd1tthf1ns1pjn1kncctwd",
    "amount": {
      "currency": "USD",
      "value": "150000"
    },
    "memo": "Funding sub-account"
  }'
```

The `amount.value` is in the smallest currency unit — cents for USD. A value of `"150000"` represents \$1,500.00.

Program managers can list rail transfers across their program by passing `program_id` as a query parameter:

```bash
curl -X GET "https://api.erebor.bank/rail_out?program_id=prgrm_01kasd1tthf1ns1pjn1kncctwd" \
  -H "Authorization: test_1a2b3c4d5e6f7g8h9i0j"
```

Add `customer_id` to narrow results to a specific customer within the program.

## Sending to a counterparty rail address

To settle with another company on Erebor, use their rail address. You need:

1. A **deposit account** with sufficient funds
2. A **counterparty** with a rail address linked

If you haven't set up counterparties yet, create one first via the [Counterparties API](/api-reference/counterparties/counterparties/create-counterparty).

Create an outbound rail transfer by specifying the source account, destination counterparty rail address, amount, and an optional memo.

```bash
curl -X POST "https://api.erebor.bank/rail_out" \
  -H "Authorization: test_1a2b3c4d5e6f7g8h9i0j" \
  -H "Erebor-Idempotency-Key: unique-rail-request-001" \
  -H "Content-Type: application/json" \
  -d '{
    "from_deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
"counterparty_rail_address_id": "cp_rail_addr_01kasd1tthf1ns1pjn1kncctwd",
    "amount": {
      "currency": "USD",
      "value": "150000"
    },
    "memo": "Invoice payment Q1-2026"
  }'
```

The `amount.value` is in the smallest currency unit — cents for USD. A value of `"150000"` represents \$1,500.00.

## Outbound transfer statuses

Outbound rail transfers progress through the following statuses:

| Status    | Description                                                                                               |
| --------- | --------------------------------------------------------------------------------------------------------- |
| `PENDING` | Transfer submitted and processing.                                                                        |
| `SETTLED` | Funds delivered to the destination. Terminal state.                                                       |
| `FAILED`  | Transfer rejected — insufficient funds, invalid address, or compliance screening failure. Terminal state. |

## Receiving inbound rail transfers

Inbound rail transfers arrive when another Erebor account sends funds to your customer's rail address. You'll receive a webhook event when the transfer lands.

Retrieve an inbound rail transfer:

```bash
curl -X GET "https://api.erebor.bank/rail_in/rail_in_01kasd1tthf1ns1pjn1kncctwd" \
  -H "Authorization: test_1a2b3c4d5e6f7g8h9i0j"
```

### Inbound transfer statuses

Inbound rail transfers settle immediately — there's no intermediate `PENDING` state.

| Status    | Description                                            |
| --------- | ------------------------------------------------------ |
| `SETTLED` | Funds credited to the deposit account. Terminal state. |
| `FAILED`  | Transfer failed. Terminal state.                       |

## Webhooks

Subscribe to rail transfer events for real-time status updates:

* `RAIL_OUT.PENDING` — Outbound rail transfer submitted
* `RAIL_OUT.SETTLED` — Outbound rail transfer settled
* `RAIL_OUT.FAILED` — Outbound rail transfer failed
* `RAIL_IN.SETTLED` — Inbound rail transfer settled

See [Supported Events](/api-reference/events/supported-events) for the full list.