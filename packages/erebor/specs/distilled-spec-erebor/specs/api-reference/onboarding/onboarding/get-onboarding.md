> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Retrieve Onboarding

GET https://api.erebor.bank/onboardings/{id}

Retrieve a specific Onboarding process by ID

Reference: https://docs.erebor.bank/api-reference/onboarding/onboarding/get-onboarding

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /onboardings/{id}:
    get:
      operationId: get-onboarding
      summary: Retrieve Onboarding
      description: Retrieve a specific Onboarding process by ID
      tags:
        - subpackage_onboarding
      parameters:
        - name: id
          in: path
          description: Onboarding ID
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
          description: Onboarding details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Onboarding'
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
    OnboardingStatus:
      type: string
      enum:
        - SUBMITTED
        - UNDER_REVIEW
        - APPROVED
        - REJECTED
      description: Current status of the onboarding.
      title: OnboardingStatus
    OnboardingApplicantType:
      type: string
      enum:
        - PERSON
        - BUSINESS
      description: Indicates whether the onboarding is for a person or business applicant.
      title: OnboardingApplicantType
    Disclosures:
      type: object
      properties:
        disclosures_signed_externally:
          type: boolean
          description: >-
            Set to true to indicate that your customer has been shown and has
            signed Erebor's disclosures prior to creating this account.
            Currently, this field is required and must be set to true in order
            for the request to succeed.
      required:
        - disclosures_signed_externally
      description: >-
        Contains information related to bank disclosures. You are responsible
        for presenting Erebor's required disclosures to your customers and
        obtaining their acknowledgment before account creation.
      title: Disclosures
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
    Onboarding:
      type: object
      properties:
        id:
          type: string
          description: Unique identifier for the onboarding, prefixed with `onb_`.
        type:
          type: string
          enum:
            - ONBOARDING
          description: Object type. Always `ONBOARDING`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this onboarding.
        created_at:
          type: string
          format: date-time
          description: Timestamp of when the onboarding was created, in ISO 8601 format.
        updated_at:
          type: string
          format: date-time
          description: >-
            Timestamp of when the onboarding was last updated, in ISO 8601
            format.
        archived_at:
          type:
            - string
            - 'null'
          format: date-time
        program_id:
          type: string
          description: >-
            Unique identifier of the program this onboarding belongs to,
            prefixed with `prgrm_`. Always set: echoed from the request when the
            Onboarding was created with `program_id`, or derived from the
            template's program when it was created with
            `deposit_account_template_id`.
        status:
          $ref: '#/components/schemas/OnboardingStatus'
          description: Current status of the onboarding.
        applicant_type:
          $ref: '#/components/schemas/OnboardingApplicantType'
          description: >-
            Indicates whether the onboarding is for a person or business
            applicant.
        person_applicant_id:
          type:
            - string
            - 'null'
          description: >-
            ID of the person applicant, prefixed with `prsn_app_`. Set when
            `applicant_type` is `PERSON`.
        business_applicant_id:
          type:
            - string
            - 'null'
          description: >-
            ID of the business applicant, prefixed with `biz_app_`. Set when
            `applicant_type` is `BUSINESS`.
        deposit_account_template_id:
          type:
            - string
            - 'null'
          description: >-
            ID of the deposit account template used to open the initial deposit
            account on approval, prefixed with `dep_acct_tmpl_`. `null` when the
            onboarding was created with `program_id` instead — in that case no
            initial account is opened and accounts must be opened later via
            `POST /deposit_accounts`.
        disclosures:
          $ref: '#/components/schemas/Disclosures'
        customer_id:
          type:
            - string
            - 'null'
          description: >-
            ID of the customer created on approval, prefixed with `cust_`.
            `null` until the onboarding is approved.
        deposit_account_id:
          type:
            - string
            - 'null'
          description: >-
            ID of the deposit account created on approval, prefixed with
            `dep_acct_`. `null` until the onboarding is approved.
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
        - status
        - applicant_type
        - disclosures
      title: Onboarding
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
  "id": "onb_01kasd1tthf1ns1pjn1kncctwd",
  "type": "ONBOARDING",
  "url": "https://api.erebor.bank/onboardings/onb_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T09:30:00Z",
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "status": "SUBMITTED",
  "applicant_type": "BUSINESS",
  "disclosures": {
    "disclosures_signed_externally": true
  },
  "archived_at": null,
  "person_applicant_id": null,
  "business_applicant_id": "biz_app_01kasd1tthf1ns1pjn1kncctwd",
  "deposit_account_template_id": "dep_acct_tmpl_01kasd1tthf1ns1pjn1kncctwd",
  "customer_id": "cust_01kasd1tthf1ns1pjn1kncctwd",
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "custom_ref": "ONB-2025-7821",
  "custom_fields": {
    "sales_rep": "j.smith",
    "internal_id": "ONB-2025-7821"
  }
}
```

**SDK Code**

```python
import requests

url = "https://api.erebor.bank/onboardings/onb_01kasd1tthf1ns1pjn1kncctwd"

headers = {"Authorization": "<apiKey>"}

response = requests.get(url, headers=headers)

print(response.json())
```

```javascript
const url = 'https://api.erebor.bank/onboardings/onb_01kasd1tthf1ns1pjn1kncctwd';
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

	url := "https://api.erebor.bank/onboardings/onb_01kasd1tthf1ns1pjn1kncctwd"

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

url = URI("https://api.erebor.bank/onboardings/onb_01kasd1tthf1ns1pjn1kncctwd")

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

HttpResponse<String> response = Unirest.get("https://api.erebor.bank/onboardings/onb_01kasd1tthf1ns1pjn1kncctwd")
  .header("Authorization", "<apiKey>")
  .asString();
```

```php
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('GET', 'https://api.erebor.bank/onboardings/onb_01kasd1tthf1ns1pjn1kncctwd', [
  'headers' => [
    'Authorization' => '<apiKey>',
  ],
]);

echo $response->getBody();
```

```csharp
using RestSharp;

var client = new RestClient("https://api.erebor.bank/onboardings/onb_01kasd1tthf1ns1pjn1kncctwd");
var request = new RestRequest(Method.GET);
request.AddHeader("Authorization", "<apiKey>");
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = ["Authorization": "<apiKey>"]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/onboardings/onb_01kasd1tthf1ns1pjn1kncctwd")! as URL,
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