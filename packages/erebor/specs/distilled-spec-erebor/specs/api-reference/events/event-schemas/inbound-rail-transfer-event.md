> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Inbound Rail Transfer Event

POST 

Fired when an inbound rail transfer changes status.

**Event types:**
- `RAIL_IN.SETTLED` — Inbound rail transfer has settled


Reference: https://docs.erebor.bank/api-reference/events/event-schemas/inbound-rail-transfer-event

## OpenAPI 3.1 Webhook Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths: {}
webhooks:
  inbound-rail-transfer-event:
    post:
      operationId: inbound-rail-transfer-event
      summary: Inbound Rail Transfer Event
      description: |
        Fired when an inbound rail transfer changes status.

        **Event types:**
        - `RAIL_IN.SETTLED` — Inbound rail transfer has settled
      responses:
        '200':
          description: Webhook received successfully
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/InboundRailTransferEvent'
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
    InboundRailTransferEventEventType:
      type: string
      enum:
        - RAIL_IN.SETTLED
      description: The specific inbound rail transfer event action
      title: InboundRailTransferEventEventType
    InboundRailTransferStatus:
      type: string
      enum:
        - SETTLED
        - FAILED
      description: |
        Inbound Rail transfer status:
        - SETTLED: Rail transfer completed successfully
        - FAILED: Rail transfer failed
      title: InboundRailTransferStatus
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
    InboundRailTransfer:
      type: object
      properties:
        id:
          type: string
          description: >-
            Unique identifier for the inbound rail transfer, prefixed with
            `rail_in_`.
        type:
          type: string
          enum:
            - RAIL_IN
          description: Object type. Always `RAIL_IN`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this inbound rail transfer.
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
          $ref: '#/components/schemas/InboundRailTransferStatus'
        to_deposit_account_id:
          type: string
          description: >-
            ID of the deposit account receiving the transfer, prefixed with
            `dep_acct_`.
        from_deposit_account_id:
          type:
            - string
            - 'null'
          description: >-
            ID of the sender's deposit account if the transfer originated from
            another Erebor account, prefixed with `dep_acct_`.
        counterparty_rail_address_id:
          type:
            - string
            - 'null'
          description: >-
            ID of the external counterparty rail address that sent the transfer,
            prefixed with `cp_rail_addr_`.
        amount:
          $ref: '#/components/schemas/FiatAmount'
        memo:
          type:
            - string
            - 'null'
          description: Optional message included in the rail transfer.
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
        - to_deposit_account_id
        - amount
      title: InboundRailTransfer
    InboundRailTransferEvent:
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
          $ref: '#/components/schemas/InboundRailTransferEventEventType'
          description: The specific inbound rail transfer event action
        resource:
          $ref: '#/components/schemas/InboundRailTransfer'
          description: Snapshot of the inbound rail transfer at the time of the event
      required:
        - id
        - type
        - url
        - created_at
        - updated_at
        - api_version
        - event_type
        - resource
      title: InboundRailTransferEvent

```