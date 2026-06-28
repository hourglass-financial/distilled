> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Create Person Applicant

POST https://api.erebor.bank/person_applicants
Content-Type: application/json

Create a new Person Applicant for onboarding

Reference: https://docs.erebor.bank/api-reference/onboarding/person-applicants/create-person-applicant

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /person_applicants:
    post:
      operationId: create-person-applicant
      summary: Create Person Applicant
      description: Create a new Person Applicant for onboarding
      tags:
        - subpackage_personApplicants
      parameters:
        - name: Authorization
          in: header
          description: |
            Use your API key in the Authorization header.

            Example: `Authorization: your_api_key_here`
          required: true
          schema:
            type: string
        - name: Erebor-Version
          in: header
          description: >
            Pins the API version used to process this request. Format is
            `YYYY-MM-DD`. When omitted, the current default version is used.
          required: false
          schema:
            type: string
        - name: Erebor-Idempotency-Key
          in: header
          description: >
            Optional idempotency key to safely retry requests. If provided,
            multiple requests with the same key will only perform the action
            once and return the same result (even if the result was an error).
          required: false
          schema:
            type: string
      responses:
        '200':
          description: Person applicant created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PersonApplicant'
        '400':
          description: Bad request — a field is malformed or fails an individual constraint
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '409':
          description: Conflict
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '422':
          description: >-
            Unprocessable content — the applicant failed validation against your
            program's requirements
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreatePersonApplicantRequest'
servers:
  - url: https://api.erebor.bank
    description: API server (environment determined by API key)
components:
  schemas:
    PersonApplicantType:
      type: string
      enum:
        - LEGACY
        - RETAIL_CUSTOMER
        - HNWI_CUSTOMER
        - ASSOCIATED_PERSON
      description: >-
        Intended use of the person applicant. `LEGACY` represents applicants
        without an assigned classification and is the default when omitted or
        set to `null`.
      title: PersonApplicantType
    CreatePersonApplicantRequestPhysicalAddress:
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
      title: CreatePersonApplicantRequestPhysicalAddress
    CreatePersonApplicantRequestMailingAddress:
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
      title: CreatePersonApplicantRequestMailingAddress
    CreatePersonApplicantRequestSourceOfWealthItems:
      type: string
      enum:
        - CRYPTO
        - SALE_OF_BUSINESS
        - OWNERSHIP_STAKE
        - INVESTMENT_INCOME
        - REAL_ESTATE
        - EXECUTIVE
        - INHERITANCE
        - INCOME
        - INTELLECTUAL
        - OTHER
      title: CreatePersonApplicantRequestSourceOfWealthItems
    CreatePersonApplicantRequestAccountPurposesItems:
      type: string
      enum:
        - PERSONAL_BANKING
        - INVESTMENTS
        - CROSS_BORDER_PAYMENTS
        - STABLECOIN_CONVERSION
        - OTHER
      title: CreatePersonApplicantRequestAccountPurposesItems
    CreatePersonApplicantRequestSourceOfFundsItems:
      type: string
      enum:
        - INCOME
        - ASSET_SALE
        - FINANCING
        - SAVINGS
        - OTHER
      title: CreatePersonApplicantRequestSourceOfFundsItems
    CreatePersonApplicantRequestExpectedFiatMonthlyVolume:
      type: string
      enum:
        - LESS_THAN_5K
        - 5K_TO_50K
        - 50K_TO_500K
        - 500K_TO_5M
        - ABOVE_5M
      title: CreatePersonApplicantRequestExpectedFiatMonthlyVolume
    CreatePersonApplicantRequestExpectedCryptoMonthlyVolume:
      type: string
      enum:
        - LESS_THAN_5K
        - 5K_TO_50K
        - 50K_TO_500K
        - 500K_TO_5M
        - ABOVE_5M
        - NONE
      title: CreatePersonApplicantRequestExpectedCryptoMonthlyVolume
    CreatePersonApplicantRequestEmploymentStatus:
      type: string
      enum:
        - FULL_TIME
        - PART_TIME
        - UNEMPLOYED
      description: Self-reported employment status.
      title: CreatePersonApplicantRequestEmploymentStatus
    InputAmount:
      type: object
      properties:
        currency:
          type: string
          enum:
            - USD
          description: Only `USD` is currently supported.
        value:
          type: string
          description: Amount in the smallest currency unit (cents for USD).
      required:
        - currency
        - value
      description: >-
        Input shape for monetary amounts on write requests. Provide `currency`
        and `value` only — `exponent` and `display_value` are derived and
        returned on responses. Currently only USD is supported.
      title: InputAmount
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
    CreatePersonApplicantRequest:
      type: object
      properties:
        program_id:
          type: string
          description: Unique identifier for the program this person applicant belongs to
        person_applicant_type:
          oneOf:
            - $ref: '#/components/schemas/PersonApplicantType'
            - type: 'null'
        first_name:
          type: string
        middle_name:
          type:
            - string
            - 'null'
        last_name:
          type: string
        citizenship:
          type:
            - string
            - 'null'
          description: Two-letter ISO 3166-1 alpha-2 country code.
        date_of_birth:
          type: string
          format: date
        email_address:
          type:
            - string
            - 'null'
          format: email
        phone_number:
          type:
            - string
            - 'null'
        physical_address:
          $ref: '#/components/schemas/CreatePersonApplicantRequestPhysicalAddress'
        mailing_address:
          $ref: '#/components/schemas/CreatePersonApplicantRequestMailingAddress'
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
            $ref: >-
              #/components/schemas/CreatePersonApplicantRequestSourceOfWealthItems
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
            $ref: >-
              #/components/schemas/CreatePersonApplicantRequestAccountPurposesItems
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
            $ref: >-
              #/components/schemas/CreatePersonApplicantRequestSourceOfFundsItems
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
            - $ref: >-
                #/components/schemas/CreatePersonApplicantRequestExpectedFiatMonthlyVolume
            - type: 'null'
        expected_crypto_monthly_volume:
          oneOf:
            - $ref: >-
                #/components/schemas/CreatePersonApplicantRequestExpectedCryptoMonthlyVolume
            - type: 'null'
        employment_status:
          oneOf:
            - $ref: >-
                #/components/schemas/CreatePersonApplicantRequestEmploymentStatus
            - type: 'null'
          description: Self-reported employment status.
        annual_income:
          oneOf:
            - $ref: '#/components/schemas/InputAmount'
            - type: 'null'
          description: Self-reported annual income.
        custom_ref:
          $ref: '#/components/schemas/CustomRef'
        custom_fields:
          $ref: '#/components/schemas/CustomFields'
      required:
        - program_id
        - first_name
        - last_name
        - date_of_birth
        - physical_address
      title: CreatePersonApplicantRequest
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
        - CRYPTO
        - SALE_OF_BUSINESS
        - OWNERSHIP_STAKE
        - INVESTMENT_INCOME
        - REAL_ESTATE
        - EXECUTIVE
        - INHERITANCE
        - INCOME
        - INTELLECTUAL
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
        - FINANCING
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
        person_applicant_type:
          oneOf:
            - $ref: '#/components/schemas/PersonApplicantType'
            - type: 'null'
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
    ErrorDetail:
      oneOf:
        - type: object
          properties:
            error_detail_type:
              type: string
              description: Discriminator indicating the kind of detail.
            field:
              type: string
              description: Dot-notated path to the field that failed validation.
            message:
              type: string
              description: Human-readable description of the failure.
          required:
            - error_detail_type
            - field
            - message
          description: FIELD_ERROR variant
      discriminator:
        propertyName: error_detail_type
      description: >-
        A structured error detail. Use `error_detail_type` to determine which
        fields are present. New detail types may be added in the future;
        consumers should ignore unrecognized values.
      title: ErrorDetail
    Error:
      type: object
      properties:
        error:
          type: string
        message:
          type: string
        field:
          type:
            - string
            - 'null'
          description: >-
            Deprecated: use error_details instead. Contains the field from the
            first error_details entry for backwards compatibility. May be
            removed in a future API version.
        docs_url:
          type:
            - string
            - 'null'
          format: uri
        error_details:
          type:
            - array
            - 'null'
          items:
            $ref: '#/components/schemas/ErrorDetail'
          description: >-
            Structured error details providing granular information about
            validation failures. Each item includes an `error_detail_type`
            discriminator indicating the kind of detail.
      required:
        - error
        - message
      title: Error
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: Authorization
      description: |
        Use your API key in the Authorization header.

        Example: `Authorization: your_api_key_here`

```

## Examples



**Request**

```json
{
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "first_name": "John",
  "last_name": "Smith",
  "date_of_birth": "1990-05-15",
  "physical_address": {
    "city": "San Francisco",
    "country": "US",
    "postal_code": "94105",
    "street_address": "123 Main Street, Apt 4B"
  },
  "person_applicant_type": "RETAIL_CUSTOMER",
  "custom_ref": "APPLICANT-7821",
  "custom_fields": {
    "referral_source": "partner_program",
    "internal_id": "APPLICANT-7821"
  }
}
```

**Response**

```json
{
  "id": "prsn_app_01kasd1tthf1ns1pjn1kncctwd",
  "type": "PERSON_APPLICANT",
  "url": "https://api.erebor.bank/person_applicants/prsn_app_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T09:30:00Z",
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "first_name": "John",
  "last_name": "Smith",
  "date_of_birth": "1990-05-15",
  "physical_address": {
    "city": "San Francisco",
    "country": "US",
    "postal_code": "94105",
    "street_address": "123 Main Street, Suite 100",
    "country_area": "CA"
  },
  "archived_at": null,
  "person_applicant_type": "RETAIL_CUSTOMER",
  "middle_name": "William",
  "citizenship": "US",
  "email_address": "john.smith@example.com",
  "phone_number": "4155551234",
  "mailing_address": {
    "city": "San Francisco",
    "country": "US",
    "postal_code": "94105",
    "street_address": "123 Main Street, Suite 100",
    "country_area": "CA"
  },
  "tin": "123456789",
  "front_identity_document_id": "doc_01kasd1tthf1ns1pjn1kncctwd",
  "back_identity_document_id": "doc_01kasd1tthf1ns1pjn1kncctwd",
  "source_of_wealth": [
    "INCOME",
    "INVESTMENT_INCOME"
  ],
  "source_of_wealth_other_description": null,
  "account_purposes": [
    "PERSONAL_BANKING",
    "INVESTMENTS"
  ],
  "account_purposes_other_description": null,
  "source_of_funds": [
    "INCOME",
    "SAVINGS"
  ],
  "source_of_funds_other_description": null,
  "expected_counterparty_countries": [
    "US",
    "GB",
    "DE"
  ],
  "expected_fiat_monthly_volume": "5K_TO_50K",
  "expected_crypto_monthly_volume": "NONE",
  "employment_status": "FULL_TIME",
  "annual_income": {
    "currency": "USD",
    "value": "100000",
    "exponent": 2,
    "display_value": "1000.00"
  },
  "custom_ref": "APPLICANT-7821",
  "custom_fields": {
    "referral_source": "partner_program",
    "internal_id": "APPLICANT-7821"
  }
}
```

**SDK Code**

```python
import requests

url = "https://api.erebor.bank/person_applicants"

payload = {
    "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
    "first_name": "John",
    "last_name": "Smith",
    "date_of_birth": "1990-05-15",
    "physical_address": {
        "city": "San Francisco",
        "country": "US",
        "postal_code": "94105",
        "street_address": "123 Main Street, Apt 4B"
    },
    "person_applicant_type": "RETAIL_CUSTOMER",
    "custom_ref": "APPLICANT-7821",
    "custom_fields": {
        "referral_source": "partner_program",
        "internal_id": "APPLICANT-7821"
    }
}
headers = {
    "Authorization": "<apiKey>",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.json())
```

```javascript
const url = 'https://api.erebor.bank/person_applicants';
const options = {
  method: 'POST',
  headers: {Authorization: '<apiKey>', 'Content-Type': 'application/json'},
  body: '{"program_id":"prgrm_01kasd1tthf1ns1pjn1kncctwd","first_name":"John","last_name":"Smith","date_of_birth":"1990-05-15","physical_address":{"city":"San Francisco","country":"US","postal_code":"94105","street_address":"123 Main Street, Apt 4B"},"person_applicant_type":"RETAIL_CUSTOMER","custom_ref":"APPLICANT-7821","custom_fields":{"referral_source":"partner_program","internal_id":"APPLICANT-7821"}}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/person_applicants"

	payload := strings.NewReader("{\n  \"program_id\": \"prgrm_01kasd1tthf1ns1pjn1kncctwd\",\n  \"first_name\": \"John\",\n  \"last_name\": \"Smith\",\n  \"date_of_birth\": \"1990-05-15\",\n  \"physical_address\": {\n    \"city\": \"San Francisco\",\n    \"country\": \"US\",\n    \"postal_code\": \"94105\",\n    \"street_address\": \"123 Main Street, Apt 4B\"\n  },\n  \"person_applicant_type\": \"RETAIL_CUSTOMER\",\n  \"custom_ref\": \"APPLICANT-7821\",\n  \"custom_fields\": {\n    \"referral_source\": \"partner_program\",\n    \"internal_id\": \"APPLICANT-7821\"\n  }\n}")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("Authorization", "<apiKey>")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/person_applicants")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Authorization"] = '<apiKey>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"program_id\": \"prgrm_01kasd1tthf1ns1pjn1kncctwd\",\n  \"first_name\": \"John\",\n  \"last_name\": \"Smith\",\n  \"date_of_birth\": \"1990-05-15\",\n  \"physical_address\": {\n    \"city\": \"San Francisco\",\n    \"country\": \"US\",\n    \"postal_code\": \"94105\",\n    \"street_address\": \"123 Main Street, Apt 4B\"\n  },\n  \"person_applicant_type\": \"RETAIL_CUSTOMER\",\n  \"custom_ref\": \"APPLICANT-7821\",\n  \"custom_fields\": {\n    \"referral_source\": \"partner_program\",\n    \"internal_id\": \"APPLICANT-7821\"\n  }\n}"

response = http.request(request)
puts response.read_body
```

```java
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.post("https://api.erebor.bank/person_applicants")
  .header("Authorization", "<apiKey>")
  .header("Content-Type", "application/json")
  .body("{\n  \"program_id\": \"prgrm_01kasd1tthf1ns1pjn1kncctwd\",\n  \"first_name\": \"John\",\n  \"last_name\": \"Smith\",\n  \"date_of_birth\": \"1990-05-15\",\n  \"physical_address\": {\n    \"city\": \"San Francisco\",\n    \"country\": \"US\",\n    \"postal_code\": \"94105\",\n    \"street_address\": \"123 Main Street, Apt 4B\"\n  },\n  \"person_applicant_type\": \"RETAIL_CUSTOMER\",\n  \"custom_ref\": \"APPLICANT-7821\",\n  \"custom_fields\": {\n    \"referral_source\": \"partner_program\",\n    \"internal_id\": \"APPLICANT-7821\"\n  }\n}")
  .asString();
```

```php
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://api.erebor.bank/person_applicants', [
  'body' => '{
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "first_name": "John",
  "last_name": "Smith",
  "date_of_birth": "1990-05-15",
  "physical_address": {
    "city": "San Francisco",
    "country": "US",
    "postal_code": "94105",
    "street_address": "123 Main Street, Apt 4B"
  },
  "person_applicant_type": "RETAIL_CUSTOMER",
  "custom_ref": "APPLICANT-7821",
  "custom_fields": {
    "referral_source": "partner_program",
    "internal_id": "APPLICANT-7821"
  }
}',
  'headers' => [
    'Authorization' => '<apiKey>',
    'Content-Type' => 'application/json',
  ],
]);

echo $response->getBody();
```

```csharp
using RestSharp;

var client = new RestClient("https://api.erebor.bank/person_applicants");
var request = new RestRequest(Method.POST);
request.AddHeader("Authorization", "<apiKey>");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"program_id\": \"prgrm_01kasd1tthf1ns1pjn1kncctwd\",\n  \"first_name\": \"John\",\n  \"last_name\": \"Smith\",\n  \"date_of_birth\": \"1990-05-15\",\n  \"physical_address\": {\n    \"city\": \"San Francisco\",\n    \"country\": \"US\",\n    \"postal_code\": \"94105\",\n    \"street_address\": \"123 Main Street, Apt 4B\"\n  },\n  \"person_applicant_type\": \"RETAIL_CUSTOMER\",\n  \"custom_ref\": \"APPLICANT-7821\",\n  \"custom_fields\": {\n    \"referral_source\": \"partner_program\",\n    \"internal_id\": \"APPLICANT-7821\"\n  }\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = [
  "Authorization": "<apiKey>",
  "Content-Type": "application/json"
]
let parameters = [
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "first_name": "John",
  "last_name": "Smith",
  "date_of_birth": "1990-05-15",
  "physical_address": [
    "city": "San Francisco",
    "country": "US",
    "postal_code": "94105",
    "street_address": "123 Main Street, Apt 4B"
  ],
  "person_applicant_type": "RETAIL_CUSTOMER",
  "custom_ref": "APPLICANT-7821",
  "custom_fields": [
    "referral_source": "partner_program",
    "internal_id": "APPLICANT-7821"
  ]
] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/person_applicants")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```