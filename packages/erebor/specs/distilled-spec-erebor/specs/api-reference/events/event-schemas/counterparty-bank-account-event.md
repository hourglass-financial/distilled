> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Counterparty Bank Account Event

POST 

Fired when a counterparty bank account is created.

**Event types:**
- `COUNTERPARTY_BANK_ACCOUNT.CREATED` — A new counterparty bank account has been created


Reference: https://docs.erebor.bank/api-reference/events/event-schemas/counterparty-bank-account-event

## OpenAPI 3.1 Webhook Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths: {}
webhooks:
  counterparty-bank-account-event:
    post:
      operationId: counterparty-bank-account-event
      summary: Counterparty Bank Account Event
      description: >
        Fired when a counterparty bank account is created.


        **Event types:**

        - `COUNTERPARTY_BANK_ACCOUNT.CREATED` — A new counterparty bank account
        has been created
      responses:
        '200':
          description: Webhook received successfully
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CounterpartyBankAccountEvent'
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
    CounterpartyBankAccountEventEventType:
      type: string
      enum:
        - COUNTERPARTY_BANK_ACCOUNT.CREATED
      description: The specific counterparty bank account event action
      title: CounterpartyBankAccountEventEventType
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
    CounterpartyUSBankAccount:
      type: object
      properties:
        id:
          type: string
          description: >-
            Unique identifier for the counterparty US bank account, prefixed
            with `cp_us_bank_acct_`.
        type:
          type: string
          enum:
            - COUNTERPARTY_US_BANK_ACCOUNT
          description: Object type. Always `COUNTERPARTY_US_BANK_ACCOUNT`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this counterparty US bank account.
        created_at:
          type: string
          format: date-time
          description: Timestamp of when the account was created, in ISO 8601 format.
        updated_at:
          type: string
          format: date-time
          description: Timestamp of when the account was last updated, in ISO 8601 format.
        archived_at:
          type:
            - string
            - 'null'
          format: date-time
        customer_id:
          type:
            - string
            - 'null'
          description: ID of the customer this account belongs to, prefixed with `cust_`.
        program_id:
          type:
            - string
            - 'null'
          description: ID of the program this account belongs to, prefixed with `prgrm_`.
        counterparty_id:
          type:
            - string
            - 'null'
          description: >-
            ID of the counterparty this bank account is linked to, prefixed with
            `cp_`.
        description:
          type: string
          description: >-
            User-friendly description for this bank account (max 100
            characters).
        account_number:
          type: string
          description: Bank account number (max 17 characters).
        routing_number:
          type: string
          description: Nine-digit ABA routing number.
        bank_name:
          type:
            - string
            - 'null'
          description: Bank name associated with the routing number.
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
        - description
        - account_number
        - routing_number
      title: CounterpartyUSBankAccount
    CounterpartyBankAccountEvent:
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
          $ref: '#/components/schemas/CounterpartyBankAccountEventEventType'
          description: The specific counterparty bank account event action
        resource:
          $ref: '#/components/schemas/CounterpartyUSBankAccount'
          description: Snapshot of the counterparty bank account at the time of the event
      required:
        - id
        - type
        - url
        - created_at
        - updated_at
        - api_version
        - event_type
        - resource
      title: CounterpartyBankAccountEvent

```