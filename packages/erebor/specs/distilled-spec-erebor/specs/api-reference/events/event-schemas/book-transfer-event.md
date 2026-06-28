> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Book Transfer Event

POST 

Fired when a book transfer changes status.

**Event types:**
- `BOOK_TRANSFER.PENDING` — Book transfer is pending
- `BOOK_TRANSFER.SETTLED` — Book transfer has settled
- `BOOK_TRANSFER.FAILED` — Book transfer has failed


Reference: https://docs.erebor.bank/api-reference/events/event-schemas/book-transfer-event

## OpenAPI 3.1 Webhook Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths: {}
webhooks:
  book-transfer-event:
    post:
      operationId: book-transfer-event
      summary: Book Transfer Event
      description: |
        Fired when a book transfer changes status.

        **Event types:**
        - `BOOK_TRANSFER.PENDING` — Book transfer is pending
        - `BOOK_TRANSFER.SETTLED` — Book transfer has settled
        - `BOOK_TRANSFER.FAILED` — Book transfer has failed
      responses:
        '200':
          description: Webhook received successfully
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/BookTransferEvent'
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
    BookTransferEventEventType:
      type: string
      enum:
        - BOOK_TRANSFER.PENDING
        - BOOK_TRANSFER.SETTLED
        - BOOK_TRANSFER.FAILED
      description: The specific book transfer event action
      title: BookTransferEventEventType
    BookTransferStatus:
      type: string
      enum:
        - PENDING
        - FAILED
        - SETTLED
      description: |
        - PENDING: Transfer submitted and processing
        - FAILED: Transfer failed
        - SETTLED: Transfer complete and settled
      title: BookTransferStatus
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
    BookTransfer:
      type: object
      properties:
        id:
          type: string
          description: Unique identifier for the book transfer, prefixed with `bk_`.
        type:
          type: string
          enum:
            - BOOK_TRANSFER
          description: Object type. Always `BOOK_TRANSFER`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this book transfer.
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
          $ref: '#/components/schemas/BookTransferStatus'
        from_deposit_account_id:
          type: string
          description: >-
            ID of the deposit account sending the funds, prefixed with
            `dep_acct_`.
        to_deposit_account_id:
          type: string
          description: >-
            ID of the deposit account receiving the funds, prefixed with
            `dep_acct_`.
        amount:
          $ref: '#/components/schemas/FiatAmount'
        memo:
          type:
            - string
            - 'null'
          description: Optional memo for the transfer (max 255 characters).
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
        - from_deposit_account_id
        - to_deposit_account_id
        - amount
      title: BookTransfer
    BookTransferEvent:
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
          $ref: '#/components/schemas/BookTransferEventEventType'
          description: The specific book transfer event action
        resource:
          $ref: '#/components/schemas/BookTransfer'
          description: Snapshot of the book transfer at the time of the event
      required:
        - id
        - type
        - url
        - created_at
        - updated_at
        - api_version
        - event_type
        - resource
      title: BookTransferEvent

```