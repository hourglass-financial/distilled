> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Domestic ACH

ACH (Automated Clearing House) transfers move funds electronically between US bank accounts over the ACH network. ACH is ideal for cost-effective, high-volume payments like payroll, vendor disbursements, and recurring billing.

## Before you start

To send an outbound ACH transfer, you need:

1. A **deposit account** with sufficient funds
2. A **counterparty** with a US bank account linked

If you haven't set up counterparties yet, create one first via the [Counterparties API](/api-reference/counterparties/counterparties/create-counterparty).

## Sending an ACH transfer

Create an outbound ACH transfer by specifying the source account, destination counterparty bank account, amount, direction, SEC code, and a company entry description.

```bash
curl -X POST "https://api.erebor.bank/ach_out" \
  -H "Authorization: test_key_YOUR_API_KEY_HERE" \
  -H "Erebor-Idempotency-Key: unique-ach-request-001" \
  -H "Content-Type: application/json" \
  -d '{
    "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
    "counterparty_us_bank_account_id": "cp_us_bank_acct_01kasd1tthf1ns1pjn1kncctwd",
    "amount": {
      "currency": "USD",
      "value": "150000"
    },
    "direction": "CREDIT",
    "sec_code": "CCD",
    "company_entry_description": "PAYMENT"
  }'
```

The `amount.value` is in the smallest currency unit — cents for USD. A value of `"150000"` represents \$1,500.00.

### Service levels

Erebor supports two ACH service levels:

| Service    | Description                                                   |
| ---------- | ------------------------------------------------------------- |
| `SAME_DAY` | Processed through Same-Day ACH windows for faster settlement. |
| `STANDARD` | Standard next-day ACH processing.                             |

If you omit the `service` field, Erebor automatically selects the fastest available option based on the current time.

### SEC codes

Outbound ACH transfers support the following Standard Entry Class codes:

| SEC Code | Name                                | Use Case                                    |
| -------- | ----------------------------------- | ------------------------------------------- |
| `CCD`    | Cash Concentration and Disbursement | Corporate-to-corporate payments             |
| `PPD`    | Prearranged Payment and Deposit     | Consumer payments (payroll, direct deposit) |
| `WEB`    | Internet-Initiated Entry            | Online consumer payments                    |

## Cutoff times

All times are **Eastern Time (ET)**. Erebor applies a 1-hour processing buffer before Federal Reserve deadlines.

### Same-Day ACH

Same-Day ACH is available on business days only.

| Window    | Last Submission Time | Settlement Time |
| --------- | -------------------- | --------------- |
| Morning   | **9:30 AM ET**       | 1:00 PM ET      |
| Afternoon | **1:45 PM ET**       | 5:00 PM ET      |
| Evening   | **3:45 PM ET**       | 6:00 PM ET      |

### Standard (Next-Day) ACH

Standard ACH settles at **8:30 AM ET** on the effective date.

| Window | Last Submission Time               | Notes                    |
| ------ | ---------------------------------- | ------------------------ |
| 1st    | **9:30 AM ET**                     |                          |
| 2nd    | **1:45 PM ET**                     |                          |
| 3rd    | **3:45 PM ET**                     |                          |
| 4th    | **7:00 PM ET**                     | Not available on Fridays |
| 5th    | **9:45 PM ET**                     |                          |
| 6th    | **1:15 AM ET** (next calendar day) |                          |

ACH transfers submitted after the last processing window or on weekends and federal holidays will be queued and processed on the next business day.

## ACH statuses

ACH transfers progress through the following statuses:

| Status     | Description                                                                               |
| ---------- | ----------------------------------------------------------------------------------------- |
| `CREATED`  | Transfer was created.                                                                     |
| `PENDING`  | Transfer queued for processing.                                                           |
| `SETTLED`  | Funds delivered to the destination account.                                               |
| `FAILED`   | Transfer rejected — insufficient funds, invalid account, or compliance screening failure. |
| `RETURNED` | Receiving institution returned the transfer. Funds credited back to your account.         |

## Receiving inbound ACH transfers

Inbound ACH transfers arrive automatically when another institution sends funds to your customer's account. No action is required on your part — you'll receive a webhook event when the transfer lands.

Retrieve an inbound ACH transfer:

```bash
curl -X GET "https://api.erebor.bank/ach_in/ach_in_01kasd1tthf1ns1pjn1kncctwd" \
  -H "Authorization: test_key_YOUR_API_KEY_HERE"
```

## Webhooks

Subscribe to ACH transfer events to get real-time status updates:

* `ACH_OUT.PENDING` — Outbound ACH submitted
* `ACH_OUT.SETTLED` — Outbound ACH settled
* `ACH_OUT.FAILED` — Outbound ACH failed
* `ACH_OUT.RETURNED` — Outbound ACH returned
* `ACH_IN.PENDING` — Inbound ACH received
* `ACH_IN.SETTLED` — Inbound ACH settled

See [Supported Events](/api-reference/events/supported-events) for the full list.