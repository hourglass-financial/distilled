> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# The Person Applicant Object

A person applicant represents an individual applying for banking services. You create one during onboarding by providing identity information, documents, and compliance details. Once the onboarding is approved, a [Customer](/api-reference/customers/list-customers) is created automatically.

```json title="The Person Applicant Object"
{
  "id": "prsn_app_01kasd1tthf1ns1pjn1kncctwd",
  "type": "PERSON_APPLICANT",
  "url": "https://api.erebor.bank/person_applicants/prsn_app_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T09:30:00Z",
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "first_name": "John",
  "middle_name": "William",
  "last_name": "Smith",
  "citizenship": "US",
  "date_of_birth": "1990-05-15",
  "email_address": "john.smith@example.com",
  "phone_number": "4155551234",
  "physical_address": {
    "street_address": "123 Main Street",
    "city": "San Francisco",
    "country_area": "CA",
    "postal_code": "94105",
    "country": "US"
  },
  "mailing_address": null,
  "tin": "123456789",
  "front_identity_document_id": "doc_01kasd1tthf1ns1pjn1kncctwd",
  "back_identity_document_id": "doc_01kasd1tthf1ns1pjn1kncctwd",
  "source_of_wealth": ["INCOME", "INVESTMENT_INCOME"],
  "source_of_wealth_other_description": null,
  "account_purposes": ["PERSONAL_BANKING", "INVESTMENTS"],
  "account_purposes_other_description": null,
  "source_of_funds": ["INCOME", "SAVINGS"],
  "source_of_funds_other_description": null,
  "expected_counterparty_countries": ["US", "GB", "DE"],
  "expected_fiat_monthly_volume": "5K_TO_50K",
  "expected_crypto_monthly_volume": "NONE",
  "employment_status": "FULL_TIME",
  "annual_income": {
    "value": "12000000",
    "currency": "USD",
    "display_value": "120000.00",
    "exponent": 2
  },
  "custom_ref": "APPLICANT-7821",
  "custom_fields": {
    "referral_source": "partner_program",
    "internal_id": "APPLICANT-7821"
  }
}
```

## Attributes

### Schema (`PersonApplicant`)

```yaml
components:
  schemas:
    PersonApplicantPhysicalAddress:
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
      title: PersonApplicantPhysicalAddress
    PersonApplicantMailingAddress:
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
      title: PersonApplicantMailingAddress
    PersonApplicantSourceOfWealthItems:
      type: string
      enum:
        - INCOME
        - OWNERSHIP_STAKE
        - INVESTMENT_INCOME
        - INHERITANCE
        - OTHER
      title: PersonApplicantSourceOfWealthItems
    PersonApplicantAccountPurposesItems:
      type: string
      enum:
        - PERSONAL_BANKING
        - INVESTMENTS
        - CROSS_BORDER_PAYMENTS
        - STABLECOIN_CONVERSION
        - OTHER
      title: PersonApplicantAccountPurposesItems
    PersonApplicantSourceOfFundsItems:
      type: string
      enum:
        - INCOME
        - ASSET_SALE
        - SAVINGS
        - OTHER
      title: PersonApplicantSourceOfFundsItems
    PersonApplicantExpectedFiatMonthlyVolume:
      type: string
      enum:
        - LESS_THAN_5K
        - 5K_TO_50K
        - 50K_TO_500K
        - 500K_TO_5M
        - ABOVE_5M
      description: Expected monthly fiat transaction volume.
      title: PersonApplicantExpectedFiatMonthlyVolume
    PersonApplicantExpectedCryptoMonthlyVolume:
      type: string
      enum:
        - LESS_THAN_5K
        - 5K_TO_50K
        - 50K_TO_500K
        - 500K_TO_5M
        - ABOVE_5M
        - NONE
      description: Expected monthly crypto transaction volume.
      title: PersonApplicantExpectedCryptoMonthlyVolume
    PersonApplicantEmploymentStatus:
      type: string
      enum:
        - FULL_TIME
        - PART_TIME
        - UNEMPLOYED
      description: Self-reported employment status.
      title: PersonApplicantEmploymentStatus
    Amount:
      type: object
      properties:
        currency:
          type: string
        exponent:
          type: integer
          description: Number of decimal places for display
        value:
          type: string
          description: Amount in smallest currency unit (e.g., cents)
        display_value:
          type: string
          description: Human-readable amount
      required:
        - currency
        - value
      title: Amount
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
    PersonApplicant:
      type: object
      properties:
        id:
          type: string
          description: >-
            Unique identifier for the person applicant, prefixed with
            `prsn_app_`.
        type:
          type: string
          enum:
            - PERSON_APPLICANT
          description: Object type. Always `PERSON_APPLICANT`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this person applicant.
        created_at:
          type: string
          format: date-time
          description: >-
            Timestamp of when the person applicant was created, in ISO 8601
            format.
        updated_at:
          type: string
          format: date-time
          description: >-
            Timestamp of when the person applicant was last updated, in ISO 8601
            format.
        archived_at:
          type:
            - string
            - 'null'
          format: date-time
        program_id:
          type: string
          description: >-
            Unique identifier of the program this person applicant belongs to,
            prefixed with `prgrm_`.
        first_name:
          type: string
          description: Applicant's first name.
        middle_name:
          type:
            - string
            - 'null'
          description: Applicant's middle name.
        last_name:
          type: string
          description: Applicant's last name.
        citizenship:
          type:
            - string
            - 'null'
          description: Two-letter ISO 3166-1 alpha-2 country code.
        date_of_birth:
          type: string
          format: date
          description: Applicant's date of birth in `YYYY-MM-DD` format.
        email_address:
          type:
            - string
            - 'null'
          format: email
          description: Applicant's email address.
        phone_number:
          type:
            - string
            - 'null'
          description: Applicant's phone number.
        physical_address:
          $ref: '#/components/schemas/PersonApplicantPhysicalAddress'
        mailing_address:
          $ref: '#/components/schemas/PersonApplicantMailingAddress'
        tin:
          type:
            - string
            - 'null'
          description: Tax identification number (SSN or ITIN).
        front_identity_document_id:
          type:
            - string
            - 'null'
          description: >-
            Front of the applicant's government-issued ID (driver's license or
            passport).
        back_identity_document_id:
          type:
            - string
            - 'null'
          description: >-
            Back of the applicant's government-issued ID. Required for driver's
            licenses, not needed for passports.
        source_of_wealth:
          type:
            - array
            - 'null'
          items:
            $ref: '#/components/schemas/PersonApplicantSourceOfWealthItems'
          description: Sources of the applicant's wealth.
        source_of_wealth_other_description:
          type:
            - string
            - 'null'
          description: Required when source_of_wealth includes OTHER.
        account_purposes:
          type:
            - array
            - 'null'
          items:
            $ref: '#/components/schemas/PersonApplicantAccountPurposesItems'
          description: Intended purposes for the account.
        account_purposes_other_description:
          type:
            - string
            - 'null'
          description: Required when account_purposes includes OTHER.
        source_of_funds:
          type:
            - array
            - 'null'
          items:
            $ref: '#/components/schemas/PersonApplicantSourceOfFundsItems'
          description: Sources of funds for the account.
        source_of_funds_other_description:
          type:
            - string
            - 'null'
          description: Required when source_of_funds includes OTHER.
        expected_counterparty_countries:
          type:
            - array
            - 'null'
          items:
            type: string
          description: >-
            List of countries where the applicant expects to send or receive
            funds. Each country code must be a two-letter ISO 3166-1 alpha-2
            country code.
        expected_fiat_monthly_volume:
          oneOf:
            - $ref: '#/components/schemas/PersonApplicantExpectedFiatMonthlyVolume'
            - type: 'null'
          description: Expected monthly fiat transaction volume.
        expected_crypto_monthly_volume:
          oneOf:
            - $ref: '#/components/schemas/PersonApplicantExpectedCryptoMonthlyVolume'
            - type: 'null'
          description: Expected monthly crypto transaction volume.
        employment_status:
          oneOf:
            - $ref: '#/components/schemas/PersonApplicantEmploymentStatus'
            - type: 'null'
          description: Self-reported employment status.
        annual_income:
          oneOf:
            - $ref: '#/components/schemas/Amount'
            - type: 'null'
          description: Self-reported annual income.
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
        - program_id
        - first_name
        - last_name
        - date_of_birth
        - physical_address
      title: PersonApplicant
```