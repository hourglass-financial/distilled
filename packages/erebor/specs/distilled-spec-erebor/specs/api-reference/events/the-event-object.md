> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# The Event Object

Events are the core unit of Erebor's webhook system. When a significant change occurs — such as an account opening, a transfer settling, or an onboarding approval — Erebor creates an Event object and delivers it via HTTP POST to your registered webhook endpoints.

Events are also available through the [Events API](/api-reference/events), allowing you to list and retrieve events independently of webhook delivery.

```json title="The Event Object"
{
  "id": "evt_01kasd1tthf1ns1pjn1kncctwd",
  "type": "EVENT",
  "url": "https://api.erebor.bank/events/evt_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T09:30:00Z",
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "event_type": "DEPOSIT_ACCOUNT.OPEN",
  "resource": {
    "id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
    "type": "DEPOSIT_ACCOUNT",
    "url": "https://api.erebor.bank/deposit_accounts/dep_acct_01kasd1tthf1ns1pjn1kncctwd",
    "created_at": "2025-01-15T09:30:00Z",
    "updated_at": "2025-01-15T09:30:00Z",
    "name": "Main Business Account",
    "status": "OPEN",
    "deposit_account_type": "DDA",
    "ownership_type": "BUSINESS"
  },
  "api_version": "2025-12-21",
  "trace": {
    "request_id": "req_01kasd1tthf1ns1pjn1kncctwd",
    "request_idempotency_key": null
  }
}
```

## Attributes

### Schema (`Event`)

```yaml
components:
  schemas:
    EventType:
      type: string
      enum:
        - DEPOSIT_ACCOUNT.CREATED
        - DEPOSIT_ACCOUNT.PENDING
        - DEPOSIT_ACCOUNT.OPEN
        - DEPOSIT_ACCOUNT.CLOSED
        - DEPOSIT_ACCOUNT.FROZEN
        - ACH_IN.CREATED
        - ACH_IN.PENDING
        - ACH_IN.SETTLED
        - ACH_IN.FAILED
        - ACH_IN.RETURNED
        - ACH_OUT.CREATED
        - ACH_OUT.PENDING
        - ACH_OUT.SETTLED
        - ACH_OUT.FAILED
        - ACH_OUT.RETURNED
        - WIRE_IN.CREATED
        - WIRE_IN.PENDING
        - WIRE_IN.SETTLED
        - WIRE_IN.FAILED
        - WIRE_IN.RETURNED
        - WIRE_IN.RESOLVING_FROM_SUSPENSE
        - WIRE_OUT.CREATED
        - WIRE_OUT.PENDING
        - WIRE_OUT.SETTLED
        - WIRE_OUT.FAILED
        - WIRE_OUT.RETURNED
        - INTERNATIONAL_WIRE_IN.PENDING
        - INTERNATIONAL_WIRE_IN.SETTLED
        - INTERNATIONAL_WIRE_IN.FAILED
        - INTERNATIONAL_WIRE_IN.RETURNED
        - INTERNATIONAL_WIRE_OUT.CREATED
        - INTERNATIONAL_WIRE_OUT.PENDING
        - INTERNATIONAL_WIRE_OUT.SETTLED
        - INTERNATIONAL_WIRE_OUT.FAILED
        - INTERNATIONAL_WIRE_OUT.RETURNED
        - BLOCKCHAIN_IN.CREATED
        - BLOCKCHAIN_IN.PENDING
        - BLOCKCHAIN_IN.NEEDS_ATTRIBUTION
        - BLOCKCHAIN_IN.SETTLED
        - BLOCKCHAIN_IN.FAILED
        - BLOCKCHAIN_OUT.CREATED
        - BLOCKCHAIN_OUT.PENDING
        - BLOCKCHAIN_OUT.SETTLED
        - BLOCKCHAIN_OUT.FAILED
        - BOOK_TRANSFER.CREATED
        - BOOK_TRANSFER.PENDING
        - BOOK_TRANSFER.SETTLED
        - BOOK_TRANSFER.FAILED
        - RAIL_IN.CREATED
        - RAIL_IN.PENDING
        - RAIL_IN.SETTLED
        - RAIL_IN.FAILED
        - RAIL_OUT.CREATED
        - RAIL_OUT.PENDING
        - RAIL_OUT.SETTLED
        - RAIL_OUT.FAILED
        - TRANSACTION.CREATED
        - TRANSACTION.PENDING
        - TRANSACTION.POSTED
        - TRANSACTION.SETTLED
        - TRANSACTION.FAILED
        - TRANSACTION.REVERSED
        - ONBOARDING.SUBMITTED
        - ONBOARDING.UNDER_REVIEW
        - ONBOARDING.APPROVED
        - ONBOARDING.REJECTED
        - COUNTERPARTY.CREATED
        - COUNTERPARTY.UPDATED
        - COUNTERPARTY.ARCHIVED
        - COUNTERPARTY_BANK_ACCOUNT.CREATED
        - COUNTERPARTY_BANK_ACCOUNT.ARCHIVED
        - COUNTERPARTY_BLOCKCHAIN_ADDRESS.CREATED
        - COUNTERPARTY_BLOCKCHAIN_ADDRESS.ARCHIVED
        - COUNTERPARTY_BLOCKCHAIN_ADDRESS.ATTRIBUTED.SELF_HOSTED
        - COUNTERPARTY_BLOCKCHAIN_ADDRESS.ATTRIBUTED.CUSTODIAN
        - COUNTERPARTY_BLOCKCHAIN_ADDRESS.ATTRIBUTED.CUSTODIAN_OTHER
        - COUNTERPARTY_INTERNATIONAL_BANK_ACCOUNT.ARCHIVED
        - COUNTERPARTY_RAIL_ADDRESS.ARCHIVED
        - CUSTOMER.CREATED
      description: Event type in `RESOURCE.ACTION` format.
      title: EventType
    EventResource:
      type: object
      properties: {}
      description: >-
        A snapshot of the resource at the time the event was created. The shape
        depends on the `event_type`.
      title: EventResource
    EventTrace:
      type: object
      properties:
        request_id:
          type: string
          description: >-
            Unique identifier for the originating API request, prefixed with
            `req_`.
        request_idempotency_key:
          type:
            - string
            - 'null'
          description: >-
            The idempotency key from the originating request, if one was
            provided. `null` if the event was triggered by a system action
            rather than an API request.
      description: Request tracing information for the API call that triggered this event.
      title: EventTrace
    Event:
      type: object
      properties:
        id:
          type: string
          description: Unique identifier for the event, prefixed with `evt_`.
        type:
          type: string
          enum:
            - EVENT
          description: Object type. Always `EVENT`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this event.
        created_at:
          type: string
          format: date-time
          description: Timestamp of when the event was created, in ISO 8601 format.
        updated_at:
          type: string
          format: date-time
          description: Timestamp of when the event was last updated, in ISO 8601 format.
        archived_at:
          type:
            - string
            - 'null'
          format: date-time
        program_id:
          type:
            - string
            - 'null'
          description: >-
            Unique identifier of the program this event belongs to, prefixed
            with `prgrm_`. `null` if the event is not scoped to a specific
            program.
        event_type:
          $ref: '#/components/schemas/EventType'
          description: >-
            The type of event, in the format `RESOURCE.ACTION`. Determines what
            kind of object is in the `resource` field and what action triggered
            the event.
        resource:
          $ref: '#/components/schemas/EventResource'
          description: >-
            A snapshot of the resource at the time the event was created. The
            shape depends on the `event_type`.
        api_version:
          type: string
          description: >-
            The API version used to render this event's `resource` payload.
            Follows date-based versioning.
        trace:
          $ref: '#/components/schemas/EventTrace'
          description: >-
            Request tracing information for the API call that triggered this
            event.
      required:
        - id
        - type
        - url
        - created_at
        - updated_at
        - event_type
        - resource
        - api_version
      title: Event
```