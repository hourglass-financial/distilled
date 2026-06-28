> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Retrieve Business Applicant

GET https://api.erebor.bank/business_applicants/{id}

Retrieve a specific Business Applicant by ID

Reference: https://docs.erebor.bank/api-reference/onboarding/business-applicants/get-business-applicant

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /business_applicants/{id}:
    get:
      operationId: get-business-applicant
      summary: Retrieve Business Applicant
      description: Retrieve a specific Business Applicant by ID
      tags:
        - subpackage_businessApplicants
      parameters:
        - name: id
          in: path
          description: Business applicant ID
          required: true
          schema:
            type: string
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
      responses:
        '200':
          description: Business applicant details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BusinessApplicant'
        '400':
          description: Bad Request
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '404':
          description: Not Found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
servers:
  - url: https://api.erebor.bank
    description: API server (environment determined by API key)
components:
  schemas:
    BusinessApplicantLegalEntityType:
      type: string
      enum:
        - CORPORATION
        - JOINT_VENTURE
        - LLC
        - LLP
        - LP
        - NON_PROFIT
        - PARTNERSHIP
        - TRUST
        - SOLE_PROPRIETORSHIP
        - PRIVATE_LIMITED_COMPANY
        - SPV
        - GOVERNMENT_ENTITY
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
    BusinessApplicantIndustry:
      type: string
      enum:
        - BANK
        - CONSTRUCTION
        - CRYPTO
        - DEFENSE
        - E_COMMERCE
        - ENERGY
        - ENTERTAINMENT
        - FINANCIAL_SERVICES
        - FINANCIAL_TRADING
        - GAMBLING
        - HEALTH
        - HOLDING_COMPANY
        - MANUFACTURING
        - NONPROFIT
        - OPERATING_COMPANY
        - PAYMENTS
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
      title: BusinessApplicantPhysicalAddress
    BusinessApplicantSourceOfFundsItems:
      type: string
      enum:
        - REVENUE
        - INVESTMENT
        - INHERITANCE
        - GIFT
        - OTHER
      title: BusinessApplicantSourceOfFundsItems
    AssociatedPersonRolesItems:
      type: string
      enum:
        - CONTROL_PERSON
        - BENEFICIAL_OWNER
        - SIGNER
        - APPLICANT
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
            at least one must have the SIGNER role. The APPLICANT role
            identifies the person who submitted the application; it may appear
            on applicants onboarded through Erebor-hosted onboarding.
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



**Response**

```json
{
  "id": "biz_app_01kasd1tthf1ns1pjn1kncctwd",
  "type": "BUSINESS_APPLICANT",
  "url": "https://api.erebor.bank/business_applicants/biz_app_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T09:30:00Z",
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "name": "Acme Corporation Inc",
  "incorporation_address": {
    "street_address": "123 Main Street, Suite 100",
    "city": "San Francisco",
    "postal_code": "94105",
    "country": "US",
    "country_area": "CA"
  },
  "physical_address": {
    "city": "San Francisco",
    "country": "US",
    "postal_code": "94105",
    "street_address": "123 Main Street, Suite 100",
    "country_area": "CA"
  },
  "archived_at": null,
  "dba_name": "Acme Corp",
  "legal_entity_type": "CORPORATION",
  "incorporation_date": "2020-06-30",
  "tin": "987654321",
  "description": "Acme Corporation provides enterprise technology solutions, including cloud infrastructure and software services for businesses worldwide.",
  "industry": "TECHNOLOGY",
  "industry_financial_services_subtype": "BANK",
  "industry_crypto_subtype": "EXCHANGE",
  "industry_other_description": null,
  "website_url": "https://www.acme-corp.com",
  "phone_number": "4155551000",
  "expected_counterparty_countries": [
    "US",
    "GB",
    "DE"
  ],
  "source_of_funds": [
    "REVENUE",
    "INVESTMENT"
  ],
  "source_of_funds_other_description": null,
  "associated_persons": [
    {
      "person_applicant_id": "prsn_app_01kasd1tthf1ns1pjn1kncctwd",
      "title": "CEO",
      "roles": [
        "CONTROL_PERSON",
        "BENEFICIAL_OWNER",
        "SIGNER"
      ],
      "ownership_percentage": 60
    }
  ],
  "formation_document_id": "doc_01kasd1tthf1ns1pjn1kncctwd",
  "tin_verification_document_id": "doc_01kasd1tthf1ns1pjn1kncctwd",
  "authorization_document_id": "doc_01kasd1tthf1ns1pjn1kncctwd",
  "is_msb": false,
  "account_purposes": [
    "BUSINESS_OPERATIONS",
    "CROSS_BORDER_PAYMENTS"
  ],
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

**SDK Code**

```python
import requests

url = "https://api.erebor.bank/business_applicants/id"

headers = {"Authorization": "<apiKey>"}

response = requests.get(url, headers=headers)

print(response.json())
```

```javascript
const url = 'https://api.erebor.bank/business_applicants/id';
const options = {method: 'GET', headers: {Authorization: '<apiKey>'}};

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
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/business_applicants/id"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("Authorization", "<apiKey>")

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

url = URI("https://api.erebor.bank/business_applicants/id")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["Authorization"] = '<apiKey>'

response = http.request(request)
puts response.read_body
```

```java
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.get("https://api.erebor.bank/business_applicants/id")
  .header("Authorization", "<apiKey>")
  .asString();
```

```php
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('GET', 'https://api.erebor.bank/business_applicants/id', [
  'headers' => [
    'Authorization' => '<apiKey>',
  ],
]);

echo $response->getBody();
```

```csharp
using RestSharp;

var client = new RestClient("https://api.erebor.bank/business_applicants/id");
var request = new RestRequest(Method.GET);
request.AddHeader("Authorization", "<apiKey>");
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = ["Authorization": "<apiKey>"]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/business_applicants/id")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "GET"
request.allHTTPHeaderFields = headers

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