> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# The Business Applicant Object

A business applicant represents a company applying for banking services. It includes business details, formation documents, and an `associated_persons` array linking the control persons, beneficial owners, and signers (each a [Person Applicant](/api-reference/onboarding/person-applicants/list-person-applicants)) to the business.

```json title="The Business Applicant Object"
{
  "id": "biz_app_01kasd1tthf1ns1pjn1kncctwd",
  "type": "BUSINESS_APPLICANT",
  "url": "https://api.erebor.bank/business_applicants/biz_app_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T09:30:00Z",
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "name": "Acme Corporation Inc",
  "dba_name": "Acme Corp",
  "legal_entity_type": "CORPORATION",
  "incorporation_address": {
    "street_address": "123 Main Street",
    "city": "Wilmington",
    "country_area": "DE",
    "postal_code": "19801",
    "country": "US"
  },
  "incorporation_date": "2020-06-30",
  "tin": "987654321",
  "description": "Acme Corporation provides enterprise technology solutions, including cloud infrastructure and software services for businesses worldwide.",
  "industry": "TECHNOLOGY",
  "industry_financial_services_subtype": null,
  "industry_crypto_subtype": null,
  "industry_other_description": null,
  "website_url": "https://www.acme-corp.com",
  "phone_number": "4155551000",
  "physical_address": {
    "street_address": "456 Market Street",
    "city": "San Francisco",
    "country_area": "CA",
    "postal_code": "94105",
    "country": "US"
  },
  "expected_counterparty_countries": ["US", "GB", "DE"],
  "source_of_funds": ["REVENUE", "INVESTMENT"],
  "source_of_funds_other_description": null,
  "associated_persons": [
    {
      "person_applicant_id": "prsn_app_01kasd1tthf1ns1pjn1kncctwd",
      "title": "CEO",
      "roles": ["CONTROL_PERSON", "BENEFICIAL_OWNER", "SIGNER"],
      "ownership_percentage": 60
    }
  ],
  "formation_document_id": "doc_01kasd1tthf1ns1pjn1kncctwd",
  "tin_verification_document_id": "doc_01kasd1tthf1ns1pjn1kncctwd",
  "authorization_document_id": null,
  "is_msb": false,
  "account_purposes": ["BUSINESS_OPERATIONS", "CROSS_BORDER_PAYMENTS"],
  "account_purposes_other_description": null,
  "primary_target_market": "COMMERCIAL",
  "primary_target_market_other_description": null,
  "expected_fiat_monthly_volume": "50K_TO_500K",
  "expected_crypto_monthly_volume": "NONE",
  "custom_ref": "APPLICANT-7821",
  "custom_fields": {
    "referral_source": "partner_program",
    "internal_id": "APPLICANT-7821"
  }
}
```

## Attributes

### Schema (`BusinessApplicant`)

```yaml
components:
  schemas:
    BusinessApplicantLegalEntityType:
      type: string
      enum:
        - CORPORATION
        - LLC
        - NON_PROFIT
        - PARTNERSHIP
        - SOLE_PROPRIETORSHIP
        - TRUST
      description: Type of legal entity.
      title: BusinessApplicantLegalEntityType
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
    BusinessApplicantIndustry:
      type: string
      enum:
        - BANK
        - CONSTRUCTION
        - CRYPTO
        - E_COMMERCE
        - ENERGY
        - ENTERTAINMENT
        - FINANCIAL_SERVICES
        - GAMBLING
        - HEALTH
        - OPERATING_COMPANY
        - PROFESSIONAL_SERVICES
        - REAL_ESTATE
        - TECHNOLOGY
        - TRADE
        - OTHER
      description: Business industry.
      title: BusinessApplicantIndustry
    BusinessApplicantIndustryFinancialServicesSubtype:
      type: string
      enum:
        - GAMING
        - CROWD_FUNDING
        - BANK
        - FUND
        - INSURANCE
        - RIA
        - INVESTMENT_MANAGER
        - MSB
        - NBFI
        - PAYMENT_PROCESSOR
        - VASP
      description: Required if industry is FINANCIAL_SERVICES.
      title: BusinessApplicantIndustryFinancialServicesSubtype
    BusinessApplicantIndustryCryptoSubtype:
      type: string
      enum:
        - PROTOCOL
        - EXCHANGE
        - INVESTMENT
        - LENDER
        - MARKET_MAKER
        - SAAS
        - MINER
      description: Required if industry is CRYPTO.
      title: BusinessApplicantIndustryCryptoSubtype
    BusinessApplicantPhysicalAddress:
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
      title: BusinessApplicantPhysicalAddress
    BusinessApplicantSourceOfFundsItems:
      type: string
      enum:
        - REVENUE
        - INVESTMENT
        - OTHER
      title: BusinessApplicantSourceOfFundsItems
    AssociatedPersonRolesItems:
      type: string
      enum:
        - CONTROL_PERSON
        - BENEFICIAL_OWNER
        - SIGNER
      title: AssociatedPersonRolesItems
    AssociatedPerson:
      type: object
      properties:
        person_applicant_id:
          type: string
        title:
          type: string
        roles:
          type: array
          items:
            $ref: '#/components/schemas/AssociatedPersonRolesItems'
          description: >-
            At least one associated person must have the CONTROL_PERSON role and
            at least one must have the SIGNER role.
        ownership_percentage:
          type: number
          format: double
      required:
        - person_applicant_id
        - title
        - roles
        - ownership_percentage
      title: AssociatedPerson
    BusinessApplicantAccountPurposesItems:
      type: string
      enum:
        - BUSINESS_OPERATIONS
        - CAPITAL_DEPLOYMENT
        - CROSS_BORDER_PAYMENTS
        - STABLECOIN_CONVERSION
        - OTHER
      title: BusinessApplicantAccountPurposesItems
    BusinessApplicantPrimaryTargetMarket:
      type: string
      enum:
        - COMMERCIAL
        - RETAIL
        - GOVERNMENT
        - OTHER
      description: Primary target market for the business.
      title: BusinessApplicantPrimaryTargetMarket
    BusinessApplicantExpectedFiatMonthlyVolume:
      type: string
      enum:
        - LESS_THAN_5K
        - 5K_TO_50K
        - 50K_TO_500K
        - 500K_TO_5M
        - ABOVE_5M
      description: Expected monthly fiat transaction volume.
      title: BusinessApplicantExpectedFiatMonthlyVolume
    BusinessApplicantExpectedCryptoMonthlyVolume:
      type: string
      enum:
        - LESS_THAN_5K
        - 5K_TO_50K
        - 50K_TO_500K
        - 500K_TO_5M
        - ABOVE_5M
        - NONE
      description: Expected monthly crypto transaction volume.
      title: BusinessApplicantExpectedCryptoMonthlyVolume
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
    BusinessApplicant:
      type: object
      properties:
        id:
          type: string
          description: >-
            Unique identifier for the business applicant, prefixed with
            `biz_app_`.
        type:
          type: string
          enum:
            - BUSINESS_APPLICANT
          description: Object type. Always `BUSINESS_APPLICANT`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this business applicant.
        created_at:
          type: string
          format: date-time
          description: >-
            Timestamp of when the business applicant was created, in ISO 8601
            format.
        updated_at:
          type: string
          format: date-time
          description: >-
            Timestamp of when the business applicant was last updated, in ISO
            8601 format.
        archived_at:
          type:
            - string
            - 'null'
          format: date-time
        program_id:
          type: string
          description: >-
            Unique identifier of the program this business applicant belongs to,
            prefixed with `prgrm_`.
        name:
          type: string
          description: Legal name of the business.
        dba_name:
          type:
            - string
            - 'null'
          description: '''Doing business as'' name, if different from the legal name.'
        legal_entity_type:
          oneOf:
            - $ref: '#/components/schemas/BusinessApplicantLegalEntityType'
            - type: 'null'
          description: Type of legal entity.
        incorporation_address:
          $ref: '#/components/schemas/Address'
        incorporation_date:
          type:
            - string
            - 'null'
          format: date
          description: >-
            If the specific day is unavailable, please default to the last day
            of the month.
        tin:
          type:
            - string
            - 'null'
          description: Business tax identification number (EIN).
        description:
          type:
            - string
            - 'null'
          description: Brief description of the business.
        industry:
          oneOf:
            - $ref: '#/components/schemas/BusinessApplicantIndustry'
            - type: 'null'
          description: Business industry.
        industry_financial_services_subtype:
          oneOf:
            - $ref: >-
                #/components/schemas/BusinessApplicantIndustryFinancialServicesSubtype
            - type: 'null'
          description: Required if industry is FINANCIAL_SERVICES.
        industry_crypto_subtype:
          oneOf:
            - $ref: '#/components/schemas/BusinessApplicantIndustryCryptoSubtype'
            - type: 'null'
          description: Required if industry is CRYPTO.
        industry_other_description:
          type:
            - string
            - 'null'
          description: Required when industry is OTHER.
        website_url:
          type:
            - string
            - 'null'
          format: uri
          description: Business website URL.
        phone_number:
          type:
            - string
            - 'null'
          description: Business phone number.
        physical_address:
          $ref: '#/components/schemas/BusinessApplicantPhysicalAddress'
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
        source_of_funds:
          type:
            - array
            - 'null'
          items:
            $ref: '#/components/schemas/BusinessApplicantSourceOfFundsItems'
          description: Sources of funds for the account.
        source_of_funds_other_description:
          type:
            - string
            - 'null'
          description: Required when source_of_funds includes OTHER.
        associated_persons:
          type: array
          items:
            $ref: '#/components/schemas/AssociatedPerson'
          description: >-
            All ultimate beneficial owners with 25% or more ownership in the
            entity and one control person.
        formation_document_id:
          type:
            - string
            - 'null'
          description: >-
            Formation document (e.g., articles of incorporation, certificate of
            formation, or operating agreement).
        tin_verification_document_id:
          type:
            - string
            - 'null'
          description: >-
            IRS EIN confirmation letter (CP 575 or 147C) verifying the business
            tax identification number.
        authorization_document_id:
          type:
            - string
            - 'null'
          description: >-
            ID of an uploaded document authorizing a non-owner to act on behalf
            of the business (e.g., board resolution or power of attorney).
            Required when the control person is not a beneficial owner.
        is_msb:
          type:
            - boolean
            - 'null'
          description: Whether the business is a Money Services Business.
        account_purposes:
          type:
            - array
            - 'null'
          items:
            $ref: '#/components/schemas/BusinessApplicantAccountPurposesItems'
          description: Intended purposes for the account.
        account_purposes_other_description:
          type:
            - string
            - 'null'
          description: Required when account_purposes includes OTHER.
        primary_target_market:
          oneOf:
            - $ref: '#/components/schemas/BusinessApplicantPrimaryTargetMarket'
            - type: 'null'
          description: Primary target market for the business.
        primary_target_market_other_description:
          type:
            - string
            - 'null'
          description: Required when primary_target_market is OTHER.
        expected_fiat_monthly_volume:
          oneOf:
            - $ref: '#/components/schemas/BusinessApplicantExpectedFiatMonthlyVolume'
            - type: 'null'
          description: Expected monthly fiat transaction volume.
        expected_crypto_monthly_volume:
          oneOf:
            - $ref: >-
                #/components/schemas/BusinessApplicantExpectedCryptoMonthlyVolume
            - type: 'null'
          description: Expected monthly crypto transaction volume.
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
        - name
        - incorporation_address
        - physical_address
      title: BusinessApplicant
```