> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# The Book Transfer Object

A book transfer moves funds between two deposit accounts within the same program. Book transfers settle instantly since both accounts are held at Erebor.

```json title="The Book Transfer Object"
{
  "id": "bk_01kasd1tthf1ns1pjn1kncctwd",
  "type": "BOOK_TRANSFER",
  "url": "https://api.erebor.bank/book_transfers/bk_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T09:30:00Z",
  "archived_at": null,
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "status": "SETTLED",
  "from_deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "to_deposit_account_id": "dep_acct_01jasd2tthf2ns2pjn2kncctwd",
  "amount": {
    "currency": "USD",
    "exponent": 2,
    "value": "150000",
    "display_value": "1500.00"
  },
  "memo": "Monthly allocation transfer",
  "custom_ref": "INTERNAL-2025-001",
  "custom_fields": {
    "allocation_type": "monthly_sweep",
    "fiscal_period": "2025-Q1"
  }
}
```

## Attributes

### Schema (`BookTransfer`)

```yaml
components:
  schemas:
    BookTransferStatus:
      type: string
      enum:
        - PENDING
        - FAILED
        - SETTLED
      description: |
        - PENDING: Transfer submitted and processing
        - FAILED: Transfer failed
        - SETTLED: Transfer complete and settled
      title: BookTransferStatus
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
    BookTransfer:
      type: object
      properties:
        id:
          type: string
          description: Unique identifier for the book transfer, prefixed with `bk_`.
        type:
          type: string
          enum:
            - BOOK_TRANSFER
          description: Object type. Always `BOOK_TRANSFER`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this book transfer.
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
          $ref: '#/components/schemas/BookTransferStatus'
        from_deposit_account_id:
          type: string
          description: >-
            ID of the deposit account sending the funds, prefixed with
            `dep_acct_`.
        to_deposit_account_id:
          type: string
          description: >-
            ID of the deposit account receiving the funds, prefixed with
            `dep_acct_`.
        amount:
          $ref: '#/components/schemas/FiatAmount'
        memo:
          type:
            - string
            - 'null'
          description: Optional memo for the transfer (max 255 characters).
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
        - from_deposit_account_id
        - to_deposit_account_id
        - amount
      title: BookTransfer
```