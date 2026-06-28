> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Outbound Wire Transfer Event

POST 

Fired when an outbound wire transfer changes status.

**Event types:**
- `WIRE_OUT.PENDING` — Outbound wire transfer is pending
- `WIRE_OUT.SETTLED` — Outbound wire transfer has settled
- `WIRE_OUT.FAILED` — Outbound wire transfer has failed
- `WIRE_OUT.RETURNED` — Outbound wire transfer has been returned


Reference: https://docs.erebor.bank/api-reference/events/event-schemas/outbound-wire-transfer-event

## OpenAPI 3.1 Webhook Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths: {}
webhooks:
  outbound-wire-transfer-event:
    post:
      operationId: outbound-wire-transfer-event
      summary: Outbound Wire Transfer Event
      description: |
        Fired when an outbound wire transfer changes status.

        **Event types:**
        - `WIRE_OUT.PENDING` — Outbound wire transfer is pending
        - `WIRE_OUT.SETTLED` — Outbound wire transfer has settled
        - `WIRE_OUT.FAILED` — Outbound wire transfer has failed
        - `WIRE_OUT.RETURNED` — Outbound wire transfer has been returned
      responses:
        '200':
          description: Webhook received successfully
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/OutboundWireTransferEvent'
components:
  schemas:
    EventBaseTrace:
      type: object
      properties:
        request_id:
          type:
            - string
            - 'null'
        request_idempotency_key:
          type:
            - string
            - 'null'
      title: EventBaseTrace
    OutboundWireTransferEventEventType:
      type: string
      enum:
        - WIRE_OUT.PENDING
        - WIRE_OUT.SETTLED
        - WIRE_OUT.FAILED
        - WIRE_OUT.RETURNED
      description: The specific outbound wire transfer event action
      title: OutboundWireTransferEventEventType
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
    OutboundWireTransferEvent:
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
          $ref: '#/components/schemas/OutboundWireTransferEventEventType'
          description: The specific outbound wire transfer event action
        resource:
          $ref: '#/components/schemas/OutboundWireTransfer'
          description: Snapshot of the outbound wire transfer at the time of the event
      required:
        - id
        - type
        - url
        - created_at
        - updated_at
        - api_version
        - event_type
        - resource
      title: OutboundWireTransferEvent

```