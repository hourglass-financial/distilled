> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Outbound International Wire Event

POST 

Fired when an outbound international wire transfer changes status.

**Event types:**
- `INTERNATIONAL_WIRE_OUT.PENDING` — Outbound international wire is pending
- `INTERNATIONAL_WIRE_OUT.SETTLED` — Outbound international wire has settled
- `INTERNATIONAL_WIRE_OUT.FAILED` — Outbound international wire has failed
- `INTERNATIONAL_WIRE_OUT.RETURNED` — Outbound international wire has been returned


Reference: https://docs.erebor.bank/api-reference/events/event-schemas/outbound-international-wire-transfer-event

## OpenAPI 3.1 Webhook Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths: {}
webhooks:
  outbound-international-wire-transfer-event:
    post:
      operationId: outbound-international-wire-transfer-event
      summary: Outbound International Wire Event
      description: >
        Fired when an outbound international wire transfer changes status.


        **Event types:**

        - `INTERNATIONAL_WIRE_OUT.PENDING` — Outbound international wire is
        pending

        - `INTERNATIONAL_WIRE_OUT.SETTLED` — Outbound international wire has
        settled

        - `INTERNATIONAL_WIRE_OUT.FAILED` — Outbound international wire has
        failed

        - `INTERNATIONAL_WIRE_OUT.RETURNED` — Outbound international wire has
        been returned
      responses:
        '200':
          description: Webhook received successfully
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/OutboundInternationalWireTransferEvent'
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
    OutboundInternationalWireTransferEventEventType:
      type: string
      enum:
        - INTERNATIONAL_WIRE_OUT.PENDING
        - INTERNATIONAL_WIRE_OUT.SETTLED
        - INTERNATIONAL_WIRE_OUT.FAILED
        - INTERNATIONAL_WIRE_OUT.RETURNED
      description: The specific outbound international wire event action
      title: OutboundInternationalWireTransferEventEventType
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
    OutboundInternationalWireTransfer:
      type: object
      properties:
        id:
          type: string
          description: >-
            Unique identifier for the outbound international wire, prefixed with
            `intl_wire_out_`.
        type:
          type: string
          enum:
            - INTERNATIONAL_WIRE_OUT
          description: Object type. Always `INTERNATIONAL_WIRE_OUT`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this outbound international wire.
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
        deposit_account_id:
          type: string
          description: >-
            ID of the internal deposit account sending the wire, prefixed with
            `dep_acct_`.
        counterparty_international_bank_account_id:
          type: string
          description: >-
            ID of the external international bank account receiving the wire,
            prefixed with `cp_intl_bank_acct_`.
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
        - deposit_account_id
        - counterparty_international_bank_account_id
        - amount
      title: OutboundInternationalWireTransfer
    OutboundInternationalWireTransferEvent:
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
          $ref: '#/components/schemas/OutboundInternationalWireTransferEventEventType'
          description: The specific outbound international wire event action
        resource:
          $ref: '#/components/schemas/OutboundInternationalWireTransfer'
          description: >-
            Snapshot of the outbound international wire transfer at the time of
            the event
      required:
        - id
        - type
        - url
        - created_at
        - updated_at
        - api_version
        - event_type
        - resource
      title: OutboundInternationalWireTransferEvent

```