> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# The Counterparty US Bank Account Object

A counterparty US bank account stores the routing and account number for a domestic bank account linked to a counterparty. Used as the destination for outbound ACH and wire transfers.

```json title="The Counterparty US Bank Account Object"
{
  "id": "cp_us_bank_01kasd1tthf1ns1pjn1kncctwd",
  "type": "COUNTERPARTY_US_BANK_ACCOUNT",
  "url": "https://api.erebor.bank/counterparty_us_bank_accounts/cp_us_bank_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T09:30:00Z",
  "customer_id": "cust_01kasd1tthf1ns1pjn1kncctwd",
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "counterparty_id": "cp_01kasd1tthf1ns1pjn1kncctwd",
  "description": "Primary USD Account",
  "account_number": "123456789",
  "routing_number": "125109161",
  "bank_name": "Example National Bank",
  "custom_ref": "CP-USBA-2025-001",
  "custom_fields": {
    "aba_verified": "true",
    "bank_name": "Wells Fargo"
  }
}
```

If the routing number and account number belong to an existing Erebor customer, the API will return a `422` error with code `USE_RAIL`. Use a [counterparty rail address](/api-reference/counterparties/counterparty-rail-addresses/create-counterparty-rail-address) to send to Erebor customers instead. See [Rail Transfers](/payments/rail-transfers) for details.

## Attributes

### Schema (`CounterpartyUSBankAccount`)

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
    CounterpartyUSBankAccount:
      type: object
      properties:
        id:
          type: string
          description: >-
            Unique identifier for the counterparty US bank account, prefixed
            with `cp_us_bank_`.
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
```