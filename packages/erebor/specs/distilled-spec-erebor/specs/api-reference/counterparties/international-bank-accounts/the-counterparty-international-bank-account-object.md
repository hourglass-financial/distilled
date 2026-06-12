> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# The Counterparty International Bank Account Object

A counterparty international bank account stores account number and BIC details for an international bank account linked to a counterparty. Used as the destination for outbound international wire transfers.

```json title="The Counterparty International Bank Account Object"
{
  "id": "cp_intl_bank_acct_01kasd1tthf1ns1pjn1kncctwd",
  "type": "COUNTERPARTY_INTERNATIONAL_BANK_ACCOUNT",
  "url": "https://api.erebor.bank/counterparty_international_bank_accounts/cp_intl_bank_acct_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T09:30:00Z",
  "customer_id": "cust_01kasd1tthf1ns1pjn1kncctwd",
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "counterparty_id": "cp_01kasd1tthf1ns1pjn1kncctwd",
  "description": "Euro Account",
  "account_number": "GB29NWBK60161331926819",
  "bic": "NWBKGB2L",
  "additional_account_number_data": null,
  "custom_ref": "CP-IBA-2025-001",
  "custom_fields": {
    "swift_verified": "true",
    "region": "EMEA"
  }
}
```

## Attributes

### Schema (`CounterpartyInternationalBankAccount`)

```yaml
components:
  schemas:
    CanadaAdditionalAccountNumberData:
      type: object
      properties:
        institution_number:
          type: string
          description: 3-digit bank institution number.
        transit_number:
          type: string
          description: 5-digit branch transit number.
        account_number:
          type: string
          description: >-
            Deprecated and optional. Instead use the top-level `account_number`,
            which is a 7-12 digit number (`^[0-9]{7,12}$`).
      required:
        - institution_number
        - transit_number
      title: CanadaAdditionalAccountNumberData
    AdditionalAccountNumberData:
      type: object
      properties:
        canada:
          oneOf:
            - $ref: '#/components/schemas/CanadaAdditionalAccountNumberData'
            - type: 'null'
      description: >-
        Per-country additional account data. Exactly one country property will
        be populated.
      title: AdditionalAccountNumberData
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
    CounterpartyInternationalBankAccount:
      type: object
      properties:
        id:
          type: string
          description: >-
            Unique identifier for the international bank account, prefixed with
            `cp_intl_bank_acct_`.
        type:
          type: string
          enum:
            - COUNTERPARTY_INTERNATIONAL_BANK_ACCOUNT
          description: Object type. Always `COUNTERPARTY_INTERNATIONAL_BANK_ACCOUNT`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this international bank account.
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
          description: User-friendly description for this bank account
        account_number:
          type: string
          description: >-
            Account number (e.g., IBAN, international account number, or other
            type of account number). Max 34 characters. For IBAN countries the
            IBAN format is applied (`^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$`). For
            non-IBAN countries the format is country-specific — for Canada, see
            `additional_account_number_data.canada`.
        bic:
          type: string
          description: >-
            Bank Identifier Code (SWIFT code). Currently supported countries: AU
            (Australia), BM (Bermuda), BR (Brazil), CA (Canada), DE (Germany),
            FR (France), GB (United Kingdom), HK (Hong Kong), NL (Netherlands),
            PT (Portugal).
        country_code:
          type: string
          description: ISO 3166-1 alpha-2 country code
        additional_account_number_data:
          oneOf:
            - $ref: '#/components/schemas/AdditionalAccountNumberData'
            - type: 'null'
          description: >-
            Country-specific additional account number data. Validation is
            applied on a per-country basis, determined by the BIC.
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
        - bic
        - country_code
      title: CounterpartyInternationalBankAccount
```