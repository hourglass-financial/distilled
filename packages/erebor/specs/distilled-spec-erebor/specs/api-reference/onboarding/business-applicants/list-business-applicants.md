> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# List Business Applicants

GET https://api.erebor.bank/business_applicants

Retrieve a list of Business Applicants

Reference: https://docs.erebor.bank/api-reference/onboarding/business-applicants/list-business-applicants

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /business_applicants:
    get:
      operationId: list-business-applicants
      summary: List Business Applicants
      description: Retrieve a list of Business Applicants
      tags:
        - subpackage_businessApplicants
      parameters:
        - name: page_size
          in: query
          description: Number of items per page (max 100)
          required: false
          schema:
            type: integer
            default: 25
        - name: starting_after
          in: query
          description: Cursor for pagination (exclusive start)
          required: false
          schema:
            type: string
        - name: ending_before
          in: query
          description: Cursor for pagination (exclusive end)
          required: false
          schema:
            type: string
        - name: program_id
          in: query
          description: Filter by program ID
          required: false
          schema:
            type: string
        - name: custom_ref
          in: query
          description: >-
            Filter by exact `custom_ref` match (case-sensitive, up to 255
            characters).
          required: false
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
          description: List of Business Applicants
          content:
            application/json:
              schema:
                $ref: >-
                  #/components/schemas/BUSINESS_APPLICANTS_listBusinessApplicants_Response_200
servers:
  - url: https://api.erebor.bank
    description: API server (environment determined by API key)
components:
  schemas:
    BaseObject:
      type: object
      properties:
        id:
          type: string
          description: Unique identifier for the object
        type:
          type: string
          description: The type of the object
        url:
          type: string
          format: uri
          description: The URL for the object
        created_at:
          type: string
          format: date-time
          description: When the object was created
        updated_at:
          type: string
          format: date-time
          description: When the object was last updated
      required:
        - id
        - type
        - url
        - created_at
        - updated_at
      title: BaseObject
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
    BUSINESS_APPLICANTS_listBusinessApplicants_Response_200:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/BusinessApplicant'
        has_more:
          type: boolean
        page_size:
          type: integer
        page_next:
          type:
            - string
            - 'null'
          format: uri
        page_prev:
          type:
            - string
            - 'null'
          format: uri
        url:
          type: string
          format: uri
      required:
        - data
        - has_more
        - page_size
        - url
      title: BUSINESS_APPLICANTS_listBusinessApplicants_Response_200
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
  "has_more": true,
  "page_size": 1,
  "url": "https://api.erebor.bank/business_applicants?page_size=1",
  "data": [
    {
      "id": "biz_app_01kasd1tthf1ns1pjn1kncctwd",
      "type": "BUSINESS_APPLICANT",
      "url": "https://api.erebor.bank/business_applicants/biz_app_01kasd1tthf1ns1pjn1kncctwd",
      "created_at": "2025-01-15T09:00:00Z",
      "updated_at": "2025-01-15T09:00:00Z",
      "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
      "name": "Acme Corporation Inc",
      "incorporation_address": {
        "street_address": "123 Main Street",
        "city": "Wilmington",
        "postal_code": "19801",
        "country": "US",
        "country_area": "DE"
      },
      "physical_address": {
        "city": "San Francisco",
        "country": "US",
        "postal_code": "94105",
        "street_address": "123 Main Street",
        "country_area": "CA"
      },
      "archived_at": null,
      "dba_name": "Acme Corp",
      "legal_entity_type": "CORPORATION",
      "incorporation_date": "2020-06-30",
      "tin": "987654321",
      "description": "Acme Corporation provides enterprise technology solutions, including cloud infrastructure and software services for businesses worldwide.",
      "industry": "TECHNOLOGY",
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
      "formation_document_id": "doc_01kasd1tthf1ns1pjn1kncctwd",
      "tin_verification_document_id": "doc_01kasd1tthf1ns1pjn1kncctwd",
      "is_msb": false,
      "account_purposes": [
        "BUSINESS_OPERATIONS",
        "CROSS_BORDER_PAYMENTS"
      ],
      "primary_target_market": "COMMERCIAL",
      "expected_fiat_monthly_volume": "50K_TO_500K",
      "expected_crypto_monthly_volume": "NONE",
      "custom_ref": "APPLICANT-7821",
      "custom_fields": {
        "referral_source": "partner_program",
        "internal_id": "APPLICANT-7821"
      }
    }
  ],
  "page_next": "https://api.erebor.bank/business_applicants?starting_after=biz_app_01kasd1tthf1ns1pjn1kncctwd&page_size=1",
  "page_prev": null
}
```

**SDK Code**

```python List of Business Applicants
import requests

url = "https://api.erebor.bank/business_applicants"

headers = {"Authorization": "<apiKey>"}

response = requests.get(url, headers=headers)

print(response.json())
```

```javascript List of Business Applicants
const url = 'https://api.erebor.bank/business_applicants';
const options = {method: 'GET', headers: {Authorization: '<apiKey>'}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go List of Business Applicants
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/business_applicants"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("Authorization", "<apiKey>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby List of Business Applicants
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/business_applicants")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["Authorization"] = '<apiKey>'

response = http.request(request)
puts response.read_body
```

```java List of Business Applicants
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.get("https://api.erebor.bank/business_applicants")
  .header("Authorization", "<apiKey>")
  .asString();
```

```php List of Business Applicants
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('GET', 'https://api.erebor.bank/business_applicants', [
  'headers' => [
    'Authorization' => '<apiKey>',
  ],
]);

echo $response->getBody();
```

```csharp List of Business Applicants
using RestSharp;

var client = new RestClient("https://api.erebor.bank/business_applicants");
var request = new RestRequest(Method.GET);
request.AddHeader("Authorization", "<apiKey>");
IRestResponse response = client.Execute(request);
```

```swift List of Business Applicants
import Foundation

let headers = ["Authorization": "<apiKey>"]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/business_applicants")! as URL,
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