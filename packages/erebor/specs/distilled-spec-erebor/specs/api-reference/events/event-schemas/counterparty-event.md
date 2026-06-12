> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Counterparty Event

POST 

Fired when a counterparty is created, updated, or archived.

**Event types:**
- `COUNTERPARTY.CREATED` — A new counterparty has been created
- `COUNTERPARTY.UPDATED` — A counterparty has been updated
- `COUNTERPARTY.ARCHIVED` — A counterparty has been archived


Reference: https://docs.erebor.bank/api-reference/events/event-schemas/counterparty-event

## OpenAPI 3.1 Webhook Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths: {}
webhooks:
  counterparty-event:
    post:
      operationId: counterparty-event
      summary: Counterparty Event
      description: |
        Fired when a counterparty is created, updated, or archived.

        **Event types:**
        - `COUNTERPARTY.CREATED` — A new counterparty has been created
        - `COUNTERPARTY.UPDATED` — A counterparty has been updated
        - `COUNTERPARTY.ARCHIVED` — A counterparty has been archived
      responses:
        '200':
          description: Webhook received successfully
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CounterpartyEvent'
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
    CounterpartyEventEventType:
      type: string
      enum:
        - COUNTERPARTY.CREATED
        - COUNTERPARTY.UPDATED
        - COUNTERPARTY.ARCHIVED
      description: The specific counterparty event action
      title: CounterpartyEventEventType
    Address:
      type: object
      properties:
        street_address:
          type: string
        city:
          type: string
        country_area:
          type:
            - string
            - 'null'
          description: >-
            Designation of a region, province, or state. Required for US
            addresses. For onboarding applicant addresses with `country: US`,
            this must be a valid uppercase two-letter USPS state, territory, or
            military mail code (e.g. `CA`, `NY`, `DC`, `PR`, `AE`) — full state
            names such as `California` are rejected. Free-form for non-US
            addresses.
        postal_code:
          type: string
        country:
          type: string
          description: Two-letter ISO 3166-1 alpha-2 country code.
      required:
        - street_address
        - city
        - postal_code
        - country
      title: Address
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
    Counterparty:
      type: object
      properties:
        id:
          type: string
          description: Unique identifier for the counterparty, prefixed with `cp_`.
        type:
          type: string
          enum:
            - COUNTERPARTY
          description: Object type. Always `COUNTERPARTY`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this counterparty.
        created_at:
          type: string
          format: date-time
          description: Timestamp of when the counterparty was created, in ISO 8601 format.
        updated_at:
          type: string
          format: date-time
          description: >-
            Timestamp of when the counterparty was last updated, in ISO 8601
            format.
        archived_at:
          type:
            - string
            - 'null'
          format: date-time
        customer_id:
          type:
            - string
            - 'null'
          description: >-
            ID of the customer this counterparty belongs to, prefixed with
            `cust_`.
        program_id:
          type:
            - string
            - 'null'
          description: >-
            ID of the program this counterparty belongs to, prefixed with
            `prgrm_`.
        name:
          type: string
          description: Name of the counterparty (max 140 characters).
        address:
          $ref: '#/components/schemas/Address'
          description: Physical address of the counterparty
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
        - name
        - address
      title: Counterparty
    CounterpartyEvent:
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
          $ref: '#/components/schemas/CounterpartyEventEventType'
          description: The specific counterparty event action
        resource:
          $ref: '#/components/schemas/Counterparty'
          description: Snapshot of the counterparty at the time of the event
      required:
        - id
        - type
        - url
        - created_at
        - updated_at
        - api_version
        - event_type
        - resource
      title: CounterpartyEvent

```