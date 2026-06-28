> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# The Outbound ACH Transfer Object

An outbound ACH transfer sends funds via the ACH network from a deposit account to an external counterparty's US bank account. You can choose between same-day and standard processing.

```json title="The Outbound ACH Transfer Object"
{
  "id": "ach_out_01kasd1tthf1ns1pjn1kncctwd",
  "type": "ACH_OUT",
  "url": "https://api.erebor.bank/ach_out/ach_out_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T09:30:00Z",
  "archived_at": null,
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "status": "PENDING",
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "counterparty_us_bank_account_id": "cp_us_bank_acct_01kasd1tthf1ns1pjn1kncctwd",
  "amount": {
    "currency": "USD",
    "exponent": 2,
    "value": "12345",
    "display_value": "123.45"
  },
  "direction": "CREDIT",
  "sec_code": "CCD",
  "company_entry_description": "PAYMENT",
  "effective_entry_date": null,
  "addenda": [],
  "company_discretionary_data": null,
  "service": "SAME_DAY",
  "custom_ref": "INV-2025-04812",
  "custom_fields": {
    "invoice_id": "INV-2025-04812",
    "vendor": "Acme Supplies"
  }
}
```

## Attributes

### Schema (`OutboundACHTransfer`)

```yaml
components:
  schemas:
    OutboundACHTransferStatus:
      type: string
      enum:
        - CREATED
        - PENDING
        - SETTLED
        - FAILED
        - RETURNED
      description: |
        Outbound ACH transfer status:
        - CREATED: Transfer was created
        - PENDING: Transfer created, awaiting submission
        - SETTLED: Transfer has been completed
        - FAILED: Transfer failed
        - RETURNED: Transfer was returned
      title: OutboundACHTransferStatus
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
    ACHDirection:
      type: string
      enum:
        - CREDIT
        - DEBIT
      description: ACH transfer direction
      title: ACHDirection
    ACHSecCode:
      type: string
      enum:
        - CCD
        - PPD
        - WEB
      description: Supported ACH SEC codes
      title: ACHSecCode
    AddendaEntry:
      type: string
      description: >-
        ACH addenda record containing remittance information passed through to
        the recipient (max 80 characters). Must use NACHA-allowed characters
        only.
      title: AddendaEntry
    ACHService:
      type: string
      enum:
        - SAME_DAY
        - STANDARD
      description: ACH service level
      title: ACHService
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
    OutboundACHTransfer:
      type: object
      properties:
        id:
          type: string
          description: >-
            Unique identifier for the outbound ACH transfer, prefixed with
            `ach_out_`.
        type:
          type: string
          enum:
            - ACH_OUT
          description: Object type. Always `ACH_OUT`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this outbound ACH transfer.
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
          $ref: '#/components/schemas/OutboundACHTransferStatus'
        deposit_account_id:
          type: string
          description: >-
            ID of the internal deposit account originating the transfer,
            prefixed with `dep_acct_`.
        counterparty_us_bank_account_id:
          type: string
          description: >-
            ID of the external US bank account receiving the transfer, prefixed
            with `cp_us_bank_acct_`.
        amount:
          $ref: '#/components/schemas/FiatAmount'
        direction:
          $ref: '#/components/schemas/ACHDirection'
        sec_code:
          $ref: '#/components/schemas/ACHSecCode'
        company_entry_description:
          type: string
          description: >-
            Short label describing the transaction purpose, shown on receiver
            statements (max 10 characters).
        effective_entry_date:
          type:
            - string
            - 'null'
          format: date
          description: Effective entry date for the ACH transfer in `YYYY-MM-DD` format.
        addenda:
          type: array
          items:
            $ref: '#/components/schemas/AddendaEntry'
          description: >-
            Addenda records containing remittance information (max 80 characters
            each).
        company_discretionary_data:
          type:
            - string
            - 'null'
          description: Optional field for originator's internal use (max 20 characters).
        service:
          $ref: '#/components/schemas/ACHService'
        custom_ref:
          oneOf:
            - $ref: '#/components/schemas/CustomRef'
            - type: 'null'
        custom_fields:
          oneOf:
            - $ref: '#/components/schemas/CustomFields'
            - type: 'null'
        return_code:
          type:
            - string
            - 'null'
          description: NACHA return reason code. Populated when `status` is `RETURNED`.
        returned_at:
          type:
            - string
            - 'null'
          format: date-time
          description: Timestamp of when the return was recorded, in ISO 8601 format.
      required:
        - id
        - type
        - url
        - created_at
        - updated_at
        - status
        - deposit_account_id
        - counterparty_us_bank_account_id
        - amount
        - direction
        - sec_code
        - company_entry_description
        - addenda
        - service
      title: OutboundACHTransfer
```