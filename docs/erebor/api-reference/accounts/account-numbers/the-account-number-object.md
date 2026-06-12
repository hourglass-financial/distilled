> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# The Account Number Object

An account number provides routing and account number details for a deposit account. These are used to receive wire and ACH transfers. Each deposit account can have multiple account numbers, with one marked as the default.

```json title="The Account Number Object"
{
  "id": "acct_num_01kasd1tthf1ns1pjn1kncctwd",
  "type": "ACCOUNT_NUMBER",
  "url": "https://api.erebor.bank/account_numbers/acct_num_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T09:30:00Z",
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "name": "Primary Account Number",
  "account_number": "1234567890",
  "routing_number": "125108405",
  "default": true,
  "custom_ref": "ACCT-NUM-2025-001",
  "custom_fields": {
    "purpose": "operating",
    "routing_destination": "ach_payroll"
  }
}
```

## Attributes

### Schema (`AccountNumber`)

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
    AccountNumber:
      type: object
      properties:
        id:
          type: string
          description: Unique identifier for the account number, prefixed with `acct_num_`.
        type:
          type: string
          enum:
            - ACCOUNT_NUMBER
          description: Object type. Always `ACCOUNT_NUMBER`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this account number.
        created_at:
          type: string
          format: date-time
          description: >-
            Timestamp of when the account number was created, in ISO 8601
            format.
        updated_at:
          type: string
          format: date-time
          description: >-
            Timestamp of when the account number was last updated, in ISO 8601
            format.
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
            Unique identifier of the program this account number belongs to,
            prefixed with `prgrm_`.
        deposit_account_id:
          type: string
          description: >-
            ID of the deposit account this account number belongs to, prefixed
            with `dep_acct_`.
        name:
          type:
            - string
            - 'null'
          description: Human-readable name for this account number.
        account_number:
          type: string
          description: Bank account number (up to 17 characters).
        routing_number:
          type: string
          description: Nine-digit ABA routing number.
        default:
          type: boolean
          description: Whether this is the default account number for the deposit account.
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
        - deposit_account_id
        - account_number
        - routing_number
        - default
      title: AccountNumber
```