> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# The Program Object

A program is the top-level organizational unit configured by Erebor. It groups customers, accounts, and transfers, and has a billing deposit account for fees. Programs are created by the Erebor team — you retrieve them via the API.

```json title="The Program Object"
{
  "id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "type": "PROGRAM",
  "url": "https://api.erebor.bank/programs/prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T09:30:00Z",
  "name": "Enterprise Banking Program",
  "billing_deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd"
}
```

## Attributes

### Schema (`Program`)

```yaml
components:
  schemas:
    Program:
      type: object
      properties:
        id:
          type: string
          description: Unique identifier for the program, prefixed with `prgrm_`.
        type:
          type: string
          enum:
            - PROGRAM
          description: Object type. Always `PROGRAM`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this program.
        created_at:
          type: string
          format: date-time
          description: Timestamp of when the program was created, in ISO 8601 format.
        updated_at:
          type: string
          format: date-time
          description: Timestamp of when the program was last updated, in ISO 8601 format.
        archived_at:
          type:
            - string
            - 'null'
          format: date-time
        name:
          type: string
          description: Human-readable name for the program.
        billing_deposit_account_id:
          type: string
          description: >-
            ID of the deposit account used for billing this program, prefixed
            with `dep_acct_`.
      required:
        - id
        - type
        - url
        - created_at
        - updated_at
        - name
        - billing_deposit_account_id
      title: Program
```