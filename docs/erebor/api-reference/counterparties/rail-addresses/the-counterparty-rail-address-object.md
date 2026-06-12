> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# The Counterparty Rail Address Object

A counterparty rail address stores a rail handle or identifier linked to a counterparty. Used as the destination for outbound rail transfers.

```json title="The Counterparty Rail Address Object"
{
  "id": "cp_rail_addr_01kasd1tthf1ns1pjn1kncctwd",
  "type": "COUNTERPARTY_RAIL_ADDRESS",
  "url": "https://api.erebor.bank/counterparty_rail_addresses/cp_rail_addr_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T09:30:00Z",
  "customer_id": "cust_01kasd1tthf1ns1pjn1kncctwd",
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "counterparty_id": "cp_01kasd1tthf1ns1pjn1kncctwd",
  "description": "Primary Rail Address",
  "address": "@company_handle",
  "custom_ref": "CP-RAIL-2025-001",
  "custom_fields": {
    "verified_at": "2025-01-15",
    "directory_pubkey": "z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH"
  }
}
```

## Attributes

### Schema (`CounterpartyRailAddress`)

```yaml
components:
  schemas:
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
    CounterpartyRailAddress:
      type: object
      properties:
        id:
          type: string
          description: >-
            Unique identifier for the counterparty rail address, prefixed with
            `cp_rail_addr_`.
        type:
          type: string
          enum:
            - COUNTERPARTY_RAIL_ADDRESS
          description: Object type. Always `COUNTERPARTY_RAIL_ADDRESS`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this counterparty rail address.
        created_at:
          type: string
          format: date-time
          description: Timestamp of when the address was created, in ISO 8601 format.
        updated_at:
          type: string
          format: date-time
          description: Timestamp of when the address was last updated, in ISO 8601 format.
        archived_at:
          type:
            - string
            - 'null'
          format: date-time
        customer_id:
          type:
            - string
            - 'null'
          description: ID of the customer this address belongs to, prefixed with `cust_`.
        program_id:
          type:
            - string
            - 'null'
          description: ID of the program this address belongs to, prefixed with `prgrm_`.
        counterparty_id:
          type:
            - string
            - 'null'
          description: >-
            ID of the counterparty this rail address is linked to, prefixed with
            `cp_`.
        description:
          type: string
          description: >-
            User-friendly description for this rail address (max 100
            characters).
        address:
          type: string
          description: Unique rail identifier
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
        - address
      title: CounterpartyRailAddress
```