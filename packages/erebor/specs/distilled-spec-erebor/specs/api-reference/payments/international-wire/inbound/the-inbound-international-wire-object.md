> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# The Inbound International Wire Object

An inbound international wire represents funds received via the SWIFT network from an international institution. These are created automatically when a foreign bank sends an international wire to your customer's account.

```json title="The Inbound International Wire Object"
{
  "id": "intl_wire_in_01kasd1tthf1ns1pjn1kncctwd",
  "type": "INTERNATIONAL_WIRE_IN",
  "url": "https://api.erebor.bank/international_wire_in/intl_wire_in_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T09:30:00Z",
  "archived_at": null,
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "status": "SETTLED",
  "counterparty_international_bank_account_id": "cp_intl_bank_acct_01kasd1tthf1ns1pjn1kncctwd",
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "amount": {
    "currency": "USD",
    "exponent": 2,
    "value": "500000",
    "display_value": "5000.00"
  },
  "memo": "Payment for Invoice #12345"
}
```

## Attributes

### Schema (`InboundInternationalWireTransfer`)

```yaml
components:
  schemas:
    InternationalWireTransferStatus:
      type: string
      enum:
        - PENDING
        - SETTLED
        - FAILED
        - RETURNED
      description: |
        International wire transfer status:
        - PENDING: Transfer is being processed
        - SETTLED: Transfer has been completed
        - FAILED: Transfer failed
        - RETURNED: Transfer was returned
      title: InternationalWireTransferStatus
    FiatAmount:
      type: object
      properties:
        currency:
          type: string
          enum:
            - USD
          description: USD for fiat transfers
        exponent:
          type: integer
          description: Number of decimal places
        value:
          type: string
          description: Amount in cents
        display_value:
          type: string
          description: Amount in dollars
      required:
        - currency
        - exponent
        - value
        - display_value
      description: >-
        Display amount restricted to USD currency only (for Wire, ACH, and Rails
        transfers)
      title: FiatAmount
    CustomRef:
      type: string
      description: >
        Free-text reference you can attach to a resource for your own
        bookkeeping (max 255 unicode characters). Echoed back unchanged on read.
        Distinct from `Erebor-Idempotency-Key` — not used for de-duplication.
      title: CustomRef
    CustomFields:
      type: object
      additionalProperties:
        description: Any type
      description: >
        JSON metadata you can attach to a resource for your own bookkeeping (max
        4096 bytes when JSON-encoded). Echoed back unchanged on read. The empty
        object `{}` is a valid stored value.
      title: CustomFields
    InboundInternationalWireTransfer:
      type: object
      properties:
        id:
          type: string
          description: >-
            Unique identifier for the inbound international wire, prefixed with
            `intl_wire_in_`.
        type:
          type: string
          enum:
            - INTERNATIONAL_WIRE_IN
          description: Object type. Always `INTERNATIONAL_WIRE_IN`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this inbound international wire.
        created_at:
          type: string
          format: date-time
          description: Timestamp of when the transfer was created, in ISO 8601 format.
        updated_at:
          type: string
          format: date-time
          description: Timestamp of when the transfer was last updated, in ISO 8601 format.
        archived_at:
          type:
            - string
            - 'null'
          format: date-time
        program_id:
          type:
            - string
            - 'null'
          description: Unique identifier for the program this transfer belongs to
        status:
          $ref: '#/components/schemas/InternationalWireTransferStatus'
        counterparty_international_bank_account_id:
          type: string
          description: >-
            ID of the external international bank account that sent the wire,
            prefixed with `cp_intl_bank_acct_`.
        deposit_account_id:
          type: string
          description: >-
            ID of the internal deposit account receiving the wire, prefixed with
            `dep_acct_`.
        amount:
          $ref: '#/components/schemas/FiatAmount'
        memo:
          type:
            - string
            - 'null'
          description: >-
            Optional memo for additional transfer information (max 140
            characters).
        custom_ref:
          oneOf:
            - $ref: '#/components/schemas/CustomRef'
            - type: 'null'
        custom_fields:
          oneOf:
            - $ref: '#/components/schemas/CustomFields'
            - type: 'null'
      required:
        - id
        - type
        - url
        - created_at
        - updated_at
        - status
        - counterparty_international_bank_account_id
        - deposit_account_id
        - amount
      title: InboundInternationalWireTransfer
```