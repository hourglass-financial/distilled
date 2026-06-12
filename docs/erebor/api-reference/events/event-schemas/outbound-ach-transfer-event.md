> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Outbound ACH Transfer Event

POST 

Fired when an outbound ACH transfer changes status.

**Event types:**
- `ACH_OUT.PENDING` — Outbound ACH transfer is pending
- `ACH_OUT.SETTLED` — Outbound ACH transfer has settled
- `ACH_OUT.FAILED` — Outbound ACH transfer has failed
- `ACH_OUT.RETURNED` — Outbound ACH transfer has been returned


Reference: https://docs.erebor.bank/api-reference/events/event-schemas/outbound-ach-transfer-event

## OpenAPI 3.1 Webhook Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths: {}
webhooks:
  outbound-ach-transfer-event:
    post:
      operationId: outbound-ach-transfer-event
      summary: Outbound ACH Transfer Event
      description: |
        Fired when an outbound ACH transfer changes status.

        **Event types:**
        - `ACH_OUT.PENDING` — Outbound ACH transfer is pending
        - `ACH_OUT.SETTLED` — Outbound ACH transfer has settled
        - `ACH_OUT.FAILED` — Outbound ACH transfer has failed
        - `ACH_OUT.RETURNED` — Outbound ACH transfer has been returned
      responses:
        '200':
          description: Webhook received successfully
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/OutboundACHTransferEvent'
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
    OutboundAchTransferEventEventType:
      type: string
      enum:
        - ACH_OUT.PENDING
        - ACH_OUT.SETTLED
        - ACH_OUT.FAILED
        - ACH_OUT.RETURNED
      description: The specific outbound ACH transfer event action
      title: OutboundAchTransferEventEventType
    OutboundACHTransferStatus:
      type: string
      enum:
        - PENDING
        - SETTLED
        - FAILED
        - RETURNED
      description: |
        Outbound ACH transfer status:
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
            with `cp_us_bank_`.
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
    OutboundACHTransferEvent:
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
          $ref: '#/components/schemas/OutboundAchTransferEventEventType'
          description: The specific outbound ACH transfer event action
        resource:
          $ref: '#/components/schemas/OutboundACHTransfer'
          description: Snapshot of the outbound ACH transfer at the time of the event
      required:
        - id
        - type
        - url
        - created_at
        - updated_at
        - api_version
        - event_type
        - resource
      title: OutboundACHTransferEvent

```