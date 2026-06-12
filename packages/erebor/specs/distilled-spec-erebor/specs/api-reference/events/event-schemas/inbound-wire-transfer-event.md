> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Inbound Wire Transfer Event

POST 

Fired when an inbound wire transfer changes status.

**Event types:**
- `WIRE_IN.PENDING` — Inbound wire transfer is pending
- `WIRE_IN.SETTLED` — Inbound wire transfer has settled
- `WIRE_IN.FAILED` — Inbound wire transfer has failed
- `WIRE_IN.RETURNED` — Inbound wire transfer has been returned
- `WIRE_IN.RESOLVING_FROM_SUSPENSE` — Wire was previously held in suspense (unroutable on initial receipt) and is being resolved to the customer account


Reference: https://docs.erebor.bank/api-reference/events/event-schemas/inbound-wire-transfer-event

## OpenAPI 3.1 Webhook Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths: {}
webhooks:
  inbound-wire-transfer-event:
    post:
      operationId: inbound-wire-transfer-event
      summary: Inbound Wire Transfer Event
      description: >
        Fired when an inbound wire transfer changes status.


        **Event types:**

        - `WIRE_IN.PENDING` — Inbound wire transfer is pending

        - `WIRE_IN.SETTLED` — Inbound wire transfer has settled

        - `WIRE_IN.FAILED` — Inbound wire transfer has failed

        - `WIRE_IN.RETURNED` — Inbound wire transfer has been returned

        - `WIRE_IN.RESOLVING_FROM_SUSPENSE` — Wire was previously held in
        suspense (unroutable on initial receipt) and is being resolved to the
        customer account
      responses:
        '200':
          description: Webhook received successfully
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/InboundWireTransferEvent'
components:
  schemas:
    EventBaseTrace:
      type: object
      properties:
        request_id:
          type: string
        request_idempotency_key:
          type:
            - string
            - 'null'
      title: EventBaseTrace
    InboundWireTransferEventEventType:
      type: string
      enum:
        - WIRE_IN.PENDING
        - WIRE_IN.SETTLED
        - WIRE_IN.FAILED
        - WIRE_IN.RETURNED
        - WIRE_IN.RESOLVING_FROM_SUSPENSE
      description: The specific inbound wire transfer event action
      title: InboundWireTransferEventEventType
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
    InboundWireTransferEvent:
      type: object
      properties:
        id:
          type: string
          description: Unique identifier for the event
        type:
          type: string
          enum:
            - EVENT
        url:
          type: string
          format: uri
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time
        archived_at:
          type:
            - string
            - 'null'
          format: date-time
        program_id:
          type:
            - string
            - 'null'
          description: Unique identifier for the program this event belongs to
        api_version:
          type: string
        trace:
          $ref: '#/components/schemas/EventBaseTrace'
        event_type:
          $ref: '#/components/schemas/InboundWireTransferEventEventType'
          description: The specific inbound wire transfer event action
        resource:
          $ref: '#/components/schemas/InboundWireTransfer'
          description: Snapshot of the inbound wire transfer at the time of the event
      required:
        - id
        - type
        - url
        - created_at
        - updated_at
        - api_version
        - event_type
        - resource
      title: InboundWireTransferEvent

```