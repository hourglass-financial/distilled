> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Inbound ACH Transfer Event

POST 

Fired when an inbound ACH transfer changes status.

**Event types:**
- `ACH_IN.PENDING` — Inbound ACH transfer is pending
- `ACH_IN.SETTLED` — Inbound ACH transfer has settled
- `ACH_IN.FAILED` — Inbound ACH transfer has failed
- `ACH_IN.RETURNED` — Inbound ACH transfer has been returned


Reference: https://docs.erebor.bank/api-reference/events/event-schemas/inbound-ach-transfer-event

## OpenAPI 3.1 Webhook Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths: {}
webhooks:
  inbound-ach-transfer-event:
    post:
      operationId: inbound-ach-transfer-event
      summary: Inbound ACH Transfer Event
      description: |
        Fired when an inbound ACH transfer changes status.

        **Event types:**
        - `ACH_IN.PENDING` — Inbound ACH transfer is pending
        - `ACH_IN.SETTLED` — Inbound ACH transfer has settled
        - `ACH_IN.FAILED` — Inbound ACH transfer has failed
        - `ACH_IN.RETURNED` — Inbound ACH transfer has been returned
      responses:
        '200':
          description: Webhook received successfully
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/InboundACHTransferEvent'
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
    InboundAchTransferEventEventType:
      type: string
      enum:
        - ACH_IN.PENDING
        - ACH_IN.SETTLED
        - ACH_IN.FAILED
        - ACH_IN.RETURNED
      description: The specific inbound ACH transfer event action
      title: InboundAchTransferEventEventType
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
            `in_ach_`.
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
    InboundACHTransferEvent:
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
          $ref: '#/components/schemas/InboundAchTransferEventEventType'
          description: The specific inbound ACH transfer event action
        resource:
          $ref: '#/components/schemas/InboundACHTransfer'
          description: Snapshot of the inbound ACH transfer at the time of the event
      required:
        - id
        - type
        - url
        - created_at
        - updated_at
        - api_version
        - event_type
        - resource
      title: InboundACHTransferEvent

```