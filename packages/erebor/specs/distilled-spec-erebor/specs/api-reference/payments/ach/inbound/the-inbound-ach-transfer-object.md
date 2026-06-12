> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# The Inbound ACH Transfer Object

An inbound ACH transfer represents funds received via the ACH network from an external originator. Inbound ACH transfers are created automatically when another institution sends an ACH credit or debit to your customer's account.

```json title="The Inbound ACH Transfer Object"
{
  "id": "ach_in_01kasd1tthf1ns1pjn1kncctwd",
  "type": "ACH_IN",
  "url": "https://api.erebor.bank/ach_in/ach_in_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T09:30:00Z",
  "archived_at": null,
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "status": "SETTLED",
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "amount": {
    "currency": "USD",
    "exponent": 2,
    "value": "12345",
    "display_value": "123.45"
  },
  "direction": "CREDIT",
  "sec_code": "PPD",
  "company_entry_description": "PAYMENT",
  "originating_company_id": "1234567890",
  "originating_company_name": "ACME CORP",
  "effective_entry_date": "2025-01-15",
  "addenda": [],
  "company_descriptive_date": null,
  "company_discretionary_data": null
}
```

## Attributes

### Schema (`InboundACHTransfer`)

```yaml
components:
  schemas:
    InboundACHTransferStatus:
      type: string
      enum:
        - PENDING
        - SETTLED
        - FAILED
        - RETURNED
      description: |
        Inbound ACH transfer status:
        - PENDING: Transfer is being processed
        - SETTLED: Transfer has been completed
        - FAILED: Transfer failed
        - RETURNED: Transfer was returned
      title: InboundACHTransferStatus
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
    InboundACHSecCode:
      type: string
      enum:
        - PPD
        - CCD
        - WEB
        - TEL
        - CTX
        - IAT
        - ARC
        - BOC
        - POP
        - RCK
        - POS
        - SHR
        - MTE
        - COR
        - CIE
        - DNE
        - ENR
        - ADV
        - ACK
        - ATX
        - PBR
        - TRC
        - TRX
        - XCK
      description: |
        ACH SEC code indicating the transaction type:
        - **Everyday Payment**: PPD, CCD, WEB, TEL, CTX, IAT
        - **Check Conversion**: ARC, BOC, POP, RCK
        - **POS/Debit Card**: POS, SHR, MTE
        - **Administrative**: COR, CIE, DNE, ENR, ADV
        - **Acknowledgment**: ACK, ATX
        - **Cross-Border**: PBR
        - **Legacy**: TRC, TRX, XCK
      title: InboundACHSecCode
    AddendaEntry:
      type: string
      description: >-
        ACH addenda record containing remittance information passed through to
        the recipient (max 80 characters). Must use NACHA-allowed characters
        only.
      title: AddendaEntry
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
    InboundACHTransfer:
      type: object
      properties:
        id:
          type: string
          description: >-
            Unique identifier for the inbound ACH transfer, prefixed with
            `ach_in_`.
        type:
          type: string
          enum:
            - ACH_IN
          description: Object type. Always `ACH_IN`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this inbound ACH transfer.
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
          $ref: '#/components/schemas/InboundACHTransferStatus'
        deposit_account_id:
          type: string
          description: >-
            ID of the internal deposit account receiving the transfer, prefixed
            with `dep_acct_`.
        amount:
          $ref: '#/components/schemas/FiatAmount'
        direction:
          $ref: '#/components/schemas/ACHDirection'
        sec_code:
          $ref: '#/components/schemas/InboundACHSecCode'
        company_entry_description:
          type: string
          description: >-
            Short label describing the transaction purpose, shown on receiver
            statements (max 10 characters).
        originating_company_id:
          type: string
          description: >-
            Tax ID or identifier of the company that initiated the ACH entry
            (max 10 characters).
        originating_company_name:
          type: string
          description: >-
            Name of the originating company, as shown on receiver statements
            (max 16 characters).
        effective_entry_date:
          type: string
          format: date
          description: Effective entry date for the ACH transfer in `YYYY-MM-DD` format.
        addenda:
          type: array
          items:
            $ref: '#/components/schemas/AddendaEntry'
          description: >-
            Addenda records containing remittance information (max 80 characters
            each).
        company_descriptive_date:
          type:
            - string
            - 'null'
          description: >-
            Optional date displayed to receivers for informational purposes (max
            6 characters). Not used for processing.
        company_discretionary_data:
          type:
            - string
            - 'null'
          description: Optional field for originator's internal use (max 20 characters).
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
        - deposit_account_id
        - amount
        - direction
        - sec_code
        - company_entry_description
        - originating_company_id
        - originating_company_name
        - effective_entry_date
        - addenda
      title: InboundACHTransfer
```