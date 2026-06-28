> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# The Outbound Wire Transfer Object

An outbound wire transfer sends funds via the Fedwire network from a deposit account to an external counterparty's US bank account. Domestic wires typically settle same-day when submitted before the cutoff time.

```json title="The Outbound Wire Transfer Object"
{
  "id": "wire_out_01kasd1tthf1ns1pjn1kncctwd",
  "type": "WIRE_OUT",
  "url": "https://api.erebor.bank/wire_out/wire_out_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T09:30:00Z",
  "archived_at": null,
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "status": "PENDING",
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "counterparty_us_bank_account_id": "cp_us_bank_acct_01kasd1tthf1ns1pjn1kncctwd",
  "bank_name": "Example National Bank",
  "amount": {
    "currency": "USD",
    "exponent": 2,
    "value": "150000",
    "display_value": "1500.00"
  },
  "end_to_end_id": "E2E-REF-2025-001",
  "imad": "20250115BANKUS33000001",
  "instruction_id": "INSTR-2025-001",
  "uetr": "4d2e78f9-1fe2-4ffd-8f1e-b85ac6f0c7f2",
  "memo": null,
  "custom_ref": "PO-2025-7821",
  "custom_fields": {
    "po_number": "PO-2025-7821",
    "department": "operations"
  }
}
```

## Attributes

### Schema (`OutboundWireTransfer`)

```yaml
components:
  schemas:
    OutboundWireTransferStatus:
      type: string
      enum:
        - CREATED
        - PENDING
        - SETTLED
        - FAILED
        - RETURNED
      description: |
        Outbound wire transfer status:
        - CREATED: Transfer was created
        - PENDING: Transfer is being processed
        - SETTLED: Transfer has been completed
        - FAILED: Transfer failed
        - RETURNED: Transfer was returned
      title: OutboundWireTransferStatus
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
    OutboundWireTransfer:
      type: object
      properties:
        id:
          type: string
          description: >-
            Unique identifier for the outbound wire transfer, prefixed with
            `wire_out_`.
        type:
          type: string
          enum:
            - WIRE_OUT
          description: Object type. Always `WIRE_OUT`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this outbound wire transfer.
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
          $ref: '#/components/schemas/OutboundWireTransferStatus'
        deposit_account_id:
          type: string
          description: >-
            ID of the internal deposit account sending the wire, prefixed with
            `dep_acct_`.
        counterparty_us_bank_account_id:
          type: string
          description: >-
            ID of the external US bank account receiving the wire, prefixed with
            `cp_us_bank_acct_`.
        bank_name:
          type:
            - string
            - 'null'
          description: Bank name associated with the beneficiary's routing number.
        creditor_routing_number:
          type: string
          description: >-
            Fedwire ABA routing number of the beneficiary's financial
            institution.
        creditor_account_number:
          type: string
          description: >-
            Account number at the beneficiary's financial institution. Snapshot
            at origination — does not track later edits to the underlying
            counterparty record.
        creditor_name:
          type: string
          description: >-
            Name of the beneficiary as transmitted on the wire. Snapshot at
            origination — does not track later edits to the underlying
            counterparty record.
        amount:
          $ref: '#/components/schemas/FiatAmount'
        end_to_end_id:
          type: string
          description: >-
            End-to-end identification assigned by the originating customer.
            Transported unchanged throughout the payment chain for
            reconciliation.
        imad:
          type: string
          description: >-
            Input Message Accountability Data assigned by the Fedwire sender.
            Composed of cycle date, source endpoint, and sequence number.
        instruction_id:
          type: string
          description: >-
            Instruction identification for banking system use. Changes at each
            hop in the wire.
        uetr:
          type: string
          description: >-
            Unique End-to-End Transaction Reference (UUID v4) for end-to-end
            payment tracking. Remains the same for all hops.
        memo:
          type:
            - string
            - 'null'
          description: Optional message included in the wire transfer (max 140 characters).
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
        - counterparty_us_bank_account_id
        - amount
        - end_to_end_id
        - imad
        - instruction_id
        - uetr
      title: OutboundWireTransfer
```