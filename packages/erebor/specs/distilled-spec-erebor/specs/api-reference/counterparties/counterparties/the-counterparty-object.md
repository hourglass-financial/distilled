> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# The Counterparty Object

A counterparty represents an external entity — a person or organization — that your customers send money to or receive money from. Each counterparty has a name and address, and can have one or more linked payment destinations (US bank accounts, international bank accounts, blockchain addresses, or rail addresses).

```json title="The Counterparty Object"
{
  "id": "cp_01kasd1tthf1ns1pjn1kncctwd",
  "type": "COUNTERPARTY",
  "url": "https://api.erebor.bank/counterparties/cp_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T09:30:00Z",
  "customer_id": "cust_01kasd1tthf1ns1pjn1kncctwd",
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "name": "Global Suppliers Ltd",
  "address": {
    "street_address": "456 Market Street",
    "city": "San Francisco",
    "country_area": "CA",
    "postal_code": "94105",
    "country": "US"
  },
  "custom_ref": "CP-2025-7821",
  "custom_fields": {
    "industry": "manufacturing",
    "relationship_owner": "j.smith"
  }
}
```

## Attributes

### Schema (`Counterparty`)

```yaml
components:
  schemas:
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
```