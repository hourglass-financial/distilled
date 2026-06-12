> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Inbound International Wire Event

POST 

Fired when an inbound international wire transfer changes status.

**Event types:**
- `INTERNATIONAL_WIRE_IN.PENDING` — Inbound international wire is pending
- `INTERNATIONAL_WIRE_IN.SETTLED` — Inbound international wire has settled
- `INTERNATIONAL_WIRE_IN.FAILED` — Inbound international wire has failed
- `INTERNATIONAL_WIRE_IN.RETURNED` — Inbound international wire has been returned


Reference: https://docs.erebor.bank/api-reference/events/event-schemas/inbound-international-wire-transfer-event

## OpenAPI 3.1 Webhook Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths: {}
webhooks:
  inbound-international-wire-transfer-event:
    post:
      operationId: inbound-international-wire-transfer-event
      summary: Inbound International Wire Event
      description: >
        Fired when an inbound international wire transfer changes status.


        **Event types:**

        - `INTERNATIONAL_WIRE_IN.PENDING` — Inbound international wire is
        pending

        - `INTERNATIONAL_WIRE_IN.SETTLED` — Inbound international wire has
        settled

        - `INTERNATIONAL_WIRE_IN.FAILED` — Inbound international wire has failed

        - `INTERNATIONAL_WIRE_IN.RETURNED` — Inbound international wire has been
        returned
      responses:
        '200':
          description: Webhook received successfully
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/InboundInternationalWireTransferEvent'
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
    InboundInternationalWireTransferEventEventType:
      type: string
      enum:
        - INTERNATIONAL_WIRE_IN.PENDING
        - INTERNATIONAL_WIRE_IN.SETTLED
        - INTERNATIONAL_WIRE_IN.FAILED
        - INTERNATIONAL_WIRE_IN.RETURNED
      description: The specific inbound international wire event action
      title: InboundInternationalWireTransferEventEventType
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
    InboundInternationalWireTransferEvent:
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
          $ref: '#/components/schemas/InboundInternationalWireTransferEventEventType'
          description: The specific inbound international wire event action
        resource:
          $ref: '#/components/schemas/InboundInternationalWireTransfer'
          description: >-
            Snapshot of the inbound international wire transfer at the time of
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
      title: InboundInternationalWireTransferEvent

```