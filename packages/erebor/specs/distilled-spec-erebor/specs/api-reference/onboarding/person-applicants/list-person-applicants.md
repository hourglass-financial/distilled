> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# List Person Applicants

GET https://api.erebor.bank/person_applicants

Retrieve a list of Person Applicants

Reference: https://docs.erebor.bank/api-reference/onboarding/person-applicants/list-person-applicants

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /person_applicants:
    get:
      operationId: list-person-applicants
      summary: List Person Applicants
      description: Retrieve a list of Person Applicants
      tags:
        - subpackage_personApplicants
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
      responses:
        '200':
          description: List of Person Applicants
          content:
            application/json:
              schema:
                $ref: >-
                  #/components/schemas/PERSON_APPLICANTS_listPersonApplicants_Response_200
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
    PERSON_APPLICANTS_listPersonApplicants_Response_200:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/PersonApplicant'
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
      title: PERSON_APPLICANTS_listPersonApplicants_Response_200
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
  "url": "https://api.erebor.bank/person_applicants?page_size=1",
  "data": [
    {
      "id": "prsn_app_01kasd1tthf1ns1pjn1kncctwd",
      "type": "PERSON_APPLICANT",
      "url": "https://api.erebor.bank/person_applicants/prsn_app_01kasd1tthf1ns1pjn1kncctwd",
      "created_at": "2025-01-15T09:00:00Z",
      "updated_at": "2025-01-15T09:00:00Z",
      "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
      "first_name": "John",
      "last_name": "Smith",
      "date_of_birth": "1990-05-15",
      "physical_address": {
        "city": "San Francisco",
        "country": "US",
        "postal_code": "94105",
        "street_address": "123 Main Street",
        "country_area": "CA"
      },
      "archived_at": null,
      "middle_name": "William",
      "citizenship": "US",
      "email_address": "john.smith@example.com",
      "phone_number": "4155551234",
      "tin": "123456789",
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
        "value": "12000000",
        "exponent": 2,
        "display_value": "120000.00"
      },
      "custom_ref": "APPLICANT-7821",
      "custom_fields": {
        "referral_source": "partner_program",
        "internal_id": "APPLICANT-7821"
      }
    }
  ],
  "page_next": "https://api.erebor.bank/person_applicants?starting_after=prsn_app_01kasd1tthf1ns1pjn1kncctwd&page_size=1",
  "page_prev": null
}
```

**SDK Code**

```python List of Person Applicants
import requests

url = "https://api.erebor.bank/person_applicants"

headers = {"Authorization": "<apiKey>"}

response = requests.get(url, headers=headers)

print(response.json())
```

```javascript List of Person Applicants
const url = 'https://api.erebor.bank/person_applicants';
const options = {method: 'GET', headers: {Authorization: '<apiKey>'}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go List of Person Applicants
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/person_applicants"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("Authorization", "<apiKey>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby List of Person Applicants
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/person_applicants")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["Authorization"] = '<apiKey>'

response = http.request(request)
puts response.read_body
```

```java List of Person Applicants
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.get("https://api.erebor.bank/person_applicants")
  .header("Authorization", "<apiKey>")
  .asString();
```

```php List of Person Applicants
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('GET', 'https://api.erebor.bank/person_applicants', [
  'headers' => [
    'Authorization' => '<apiKey>',
  ],
]);

echo $response->getBody();
```

```csharp List of Person Applicants
using RestSharp;

var client = new RestClient("https://api.erebor.bank/person_applicants");
var request = new RestRequest(Method.GET);
request.AddHeader("Authorization", "<apiKey>");
IRestResponse response = client.Execute(request);
```

```swift List of Person Applicants
import Foundation

let headers = ["Authorization": "<apiKey>"]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/person_applicants")! as URL,
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