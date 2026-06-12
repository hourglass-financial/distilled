> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# The Customer Object

A customer represents an approved person or business with an active banking relationship. Customers are created automatically when an [Onboarding](/api-reference/onboarding/onboarding/list-onboardings) is approved — you don't create them directly.

```json title="The Customer Object"
{
  "id": "cust_01kasd1tthf1ns1pjn1kncctwd",
  "type": "CUSTOMER",
  "url": "https://api.erebor.bank/customers/cust_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T09:30:00Z",
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "status": "ACTIVE",
  "name": "Acme Corporation Inc.",
  "onboarding_id": "onb_01kasd1tthf1ns1pjn1kncctwd",
  "custom_ref": "CUST-1234-001",
  "custom_fields": {
    "internal_id": "CUST-1234-001",
    "tier": "enterprise"
  }
}
```

## Attributes

### Schema (`Customer`)

```yaml
components:
  schemas:
    CustomerStatus:
      type: string
      enum:
        - ACTIVE
        - OFFBOARDED
      title: CustomerStatus
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
    Customer:
      type: object
      properties:
        id:
          type: string
          description: Unique identifier for the customer, prefixed with `cust_`.
        type:
          type: string
          enum:
            - CUSTOMER
          description: Object type. Always `CUSTOMER`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this customer.
        created_at:
          type: string
          format: date-time
          description: Timestamp of when the customer was created, in ISO 8601 format.
        updated_at:
          type: string
          format: date-time
          description: Timestamp of when the customer was last updated, in ISO 8601 format.
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
            Unique identifier of the program this customer belongs to, prefixed
            with `prgrm_`. `null` if not scoped to a specific program.
        status:
          $ref: '#/components/schemas/CustomerStatus'
        name:
          type: string
          description: Customer's name (person's full name or business legal name).
        onboarding_id:
          type:
            - string
            - 'null'
          description: >-
            ID of the onboarding that created this customer, prefixed with
            `onb_`.
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
        - name
      title: Customer
```