> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Blockchain transfers

Blockchain transfers move stablecoin funds on-chain between Erebor accounts and external blockchain addresses. Erebor supports multiple networks and stablecoin currencies for both sending and receiving.

## Before you start

To send an outbound blockchain transfer, you need:

1. A **deposit account** with sufficient funds
2. A **counterparty** with a blockchain address linked

If you haven't set up counterparties yet, create one first via the [Counterparties API](/api-reference/counterparties/counterparties/create-counterparty).

## Supported networks and stablecoins

Not every stablecoin is available on every network. The table below shows which combinations are supported for deposits (inbound) and withdrawals (outbound).

Sending to an unsupported network or an incorrect address may result in permanent loss, and Erebor cannot recover these funds. Deposits originating from smart contracts, including multi-signature wallets, are only supported on **Ethereum** — on all other networks these deposits are not supported and may be lost.

| Network    | Currency | Deposits | Withdrawals |
| ---------- | -------- | -------- | ----------- |
| `SOLANA`   | `USDC`   | Yes      | Yes         |
| `ETHEREUM` | `USAT`   | Yes      | Yes         |
| `ETHEREUM` | `USDC`   | Yes      | Yes         |
| `ETHEREUM` | `USDT`   | Yes      | Yes         |
| `BASE`     | `USDC`   | Yes      | Yes         |
| `INK`      | `USDC`   | Yes      | Yes         |
| `SUI`      | `USDC`   | Yes      | Yes         |

## Sending a blockchain transfer

Create an outbound blockchain transfer by specifying the source account, destination counterparty blockchain address, amount, and network.

```bash
curl -X POST "https://api.erebor.bank/blockchain_out" \
  -H "Authorization: test_1a2b3c4d5e6f7g8h9i0j" \
  -H "Erebor-Idempotency-Key: unique-blockchain-request-001" \
  -H "Content-Type: application/json" \
  -d '{
    "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
    "counterparty_blockchain_address_id": "cp_bc_addr_01kasd1tthf1ns1pjn1kncctwd",
    "amount": {
      "currency": "USDC",
      "value": "150000"
    },
    "network": "ETHEREUM"
  }'
```

The `amount.value` is in the smallest currency unit — cents for stablecoins. A value of `"150000"` represents 1,500.00 USDC.

## Outbound transfer statuses

Outbound blockchain transfers progress through the following statuses:

| Status    | Description                                                                                               |
| --------- | --------------------------------------------------------------------------------------------------------- |
| `PENDING` | Transfer submitted and processing on-chain.                                                               |
| `SETTLED` | Funds delivered to the destination address. Terminal state.                                               |
| `FAILED`  | Transfer rejected — insufficient funds, invalid address, or compliance screening failure. Terminal state. |

## Receiving inbound blockchain transfers

Inbound blockchain transfers arrive when an external address sends stablecoins to your customer's on-chain address. You'll receive a webhook event when the transfer lands.

Retrieve an inbound blockchain transfer:

```bash
curl -X GET "https://api.erebor.bank/blockchain_in/bc_in_01kasd1tthf1ns1pjn1kncctwd" \
  -H "Authorization: test_1a2b3c4d5e6f7g8h9i0j"
```

### Inbound transfer statuses

| Status              | Description                                                                         |
| ------------------- | ----------------------------------------------------------------------------------- |
| `PENDING`           | Transfer detected on-chain and processing.                                          |
| `NEEDS_ATTRIBUTION` | Transfer requires attribution to a counterparty and custodian before it can settle. |
| `SETTLED`           | Funds credited to the deposit account. Terminal state.                              |
| `FAILED`            | Transfer failed. Terminal state.                                                    |

### Attributing inbound transfers

When an inbound blockchain transfer enters `NEEDS_ATTRIBUTION` status, you must identify the sender by providing a counterparty and custodian before the transfer can settle.

```bash
curl -X POST "https://api.erebor.bank/blockchain_in/bc_in_01kasd1tthf1ns1pjn1kncctwd/attribute" \
  -H "Authorization: test_1a2b3c4d5e6f7g8h9i0j" \
  -H "Erebor-Idempotency-Key: unique-attribution-001" \
  -H "Content-Type: application/json" \
  -d '{
    "counterparty_id": "cp_01kasd1tthf1ns1pjn1kncctwd",
    "custodian": "COINBASE_US"
  }'
```

The `custodian` field identifies where the sender holds their funds. Common values include `COINBASE_US`, `GEMINI_US`, `FIREBLOCKS_US`, `CIRCLE_US`, and `SELF_HOSTED`. If the custodian isn't in the predefined list, use `OTHER` and provide a `custodian_other` field with the name.

Inbound transfers in `NEEDS_ATTRIBUTION` status won't settle until you attribute them. Monitor for this status and attribute promptly to avoid delays.

## Webhooks

Subscribe to blockchain transfer events for real-time status updates:

* `BLOCKCHAIN_OUT.PENDING` — Outbound transfer submitted
* `BLOCKCHAIN_OUT.SETTLED` — Outbound transfer settled
* `BLOCKCHAIN_OUT.FAILED` — Outbound transfer failed
* `BLOCKCHAIN_IN.PENDING` — Inbound transfer detected
* `BLOCKCHAIN_IN.SETTLED` — Inbound transfer settled
* `BLOCKCHAIN_IN.NEEDS_ATTRIBUTION` — Inbound transfer requires attribution

See [Supported Events](/api-reference/events/supported-events) for the full list.