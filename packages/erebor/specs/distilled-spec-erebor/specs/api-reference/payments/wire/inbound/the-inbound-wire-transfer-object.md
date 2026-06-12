> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# The Inbound Wire Transfer Object

An inbound wire transfer represents funds received via the Fedwire network from an external institution. Inbound wires are created automatically when another bank sends a domestic wire to your customer's account.

```json title="The Inbound Wire Transfer Object"
{
  "id": "wire_in_01kasd1tthf1ns1pjn1kncctwd",
  "type": "WIRE_IN",
  "url": "https://api.erebor.bank/wire_in/wire_in_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T09:30:00Z",
  "archived_at": null,
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "status": "SETTLED",
  "counterparty_us_bank_account_id": "cp_us_bank_01kasd1tthf1ns1pjn1kncctwd",
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "bank_name": "Example National Bank",
  "amount": {
    "currency": "USD",
    "exponent": 2,
    "value": "150000",
    "display_value": "1500.00"
  },
  "end_to_end_id": "E2E-REF-2025-001",
  "imad": "20250115BANKUS33000001",
  "uetr": "4d2e78f9-1fe2-4ffd-8f1e-b85ac6f0c7f2",
  "instruction_id": "INSTR-2025-001",
  "memo": null
}
```

## Attributes

### Schema (`InboundWireTransfer`)

```yaml
components:
  schemas:
    InboundWireTransferStatus:
      type: string
      enum:
        - PENDING
        - SETTLED
        - FAILED
        - RETURNED
        - RESOLVING_FROM_SUSPENSE
      description: >
        Inbound wire transfer status:

        - PENDING: Transfer received, awaiting settlement

        - SETTLED: Transfer completed successfully

        - FAILED: Transfer failed

        - RETURNED: Transfer was returned

        - RESOLVING_FROM_SUSPENSE: Transfer previously held in suspense
        (unroutable on initial receipt) and is now being resolved to the
        customer account
      title: InboundWireTransferStatus
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
    InboundWireTransfer:
      type: object
      properties:
        id:
          type: string
          description: >-
            Unique identifier for the inbound wire transfer, prefixed with
            `wire_in_`.
        type:
          type: string
          enum:
            - WIRE_IN
          description: Object type. Always `WIRE_IN`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this inbound wire transfer.
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
          $ref: '#/components/schemas/InboundWireTransferStatus'
        counterparty_us_bank_account_id:
          type: string
          description: >-
            ID of the external US bank account that sent the wire, prefixed with
            `cp_us_bank_`.
        deposit_account_id:
          type: string
          description: >-
            ID of the internal deposit account receiving the wire, prefixed with
            `dep_acct_`.
        bank_name:
          type:
            - string
            - 'null'
          description: Bank name associated with the originator's routing number.
        debtor_routing_number:
          type:
            - string
            - 'null'
          description: >-
            Fedwire ABA routing number of the originator's financial
            institution.
        debtor_account_number:
          type:
            - string
            - 'null'
          description: >-
            Account number at the originator's financial institution, as
            received on the incoming wire. Snapshot at receive time — does not
            track later edits to the underlying counterparty record.
        debtor_name:
          type:
            - string
            - 'null'
          description: Name of the originator as received on the incoming wire.
        creditor_name:
          type:
            - string
            - 'null'
          description: >-
            Name of the beneficiary as written on the incoming wire — your
            customer's name as addressed by the sender. Useful for reconciling
            against internal account or contact records and for catching name
            mismatches on legal-entity vs trade-name accounts.
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
        uetr:
          type: string
          description: >-
            Unique End-to-End Transaction Reference (UUID v4) for end-to-end
            payment tracking. Remains the same for all hops.
        instruction_id:
          type:
            - string
            - 'null'
          description: >-
            Instruction identification for banking system use. Changes at each
            hop in the wire.
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
        - counterparty_us_bank_account_id
        - deposit_account_id
        - amount
        - end_to_end_id
        - imad
        - uetr
        - instruction_id
      title: InboundWireTransfer
```