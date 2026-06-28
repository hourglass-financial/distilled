> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Create Onboarding

POST https://api.erebor.bank/onboardings
Content-Type: application/json

Start a new Onboarding for a person or business applicant. A successful Onboarding produces a new Customer, linked in the result.

At least one of `deposit_account_template_id` or `program_id` must be provided:

- **`deposit_account_template_id` only** — on approval, we create the Customer **and** open an initial deposit account from the template. The customer is placed in the template's program. Use this when you want a turnkey approve→account flow.
- **`program_id` only** — on approval, we create only the Customer in the given program. No initial deposit account is opened; open accounts later by calling `POST /deposit_accounts` when the customer is ready to transact.
- **Both** — equivalent to providing only `deposit_account_template_id`; the supplied `program_id` is treated as a confirming assertion. Returns `400` if the supplied `program_id` does not match the program the template belongs to.

Supplying neither field returns `400`. An unrecognised `program_id` (or one you do not manage) returns `404`.

On approval the `ONBOARDING.APPROVED` event always fires. The `DEPOSIT_ACCOUNT.PENDING` / `DEPOSIT_ACCOUNT.OPEN` events only fire when the Onboarding was created with `deposit_account_template_id` (either alone or alongside a matching `program_id`).


Reference: https://docs.erebor.bank/api-reference/onboarding/onboarding/create-onboarding

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /onboardings:
    post:
      operationId: create-onboarding
      summary: Create Onboarding
      description: >
        Start a new Onboarding for a person or business applicant. A successful
        Onboarding produces a new Customer, linked in the result.


        At least one of `deposit_account_template_id` or `program_id` must be
        provided:


        - **`deposit_account_template_id` only** — on approval, we create the
        Customer **and** open an initial deposit account from the template. The
        customer is placed in the template's program. Use this when you want a
        turnkey approve→account flow.

        - **`program_id` only** — on approval, we create only the Customer in
        the given program. No initial deposit account is opened; open accounts
        later by calling `POST /deposit_accounts` when the customer is ready to
        transact.

        - **Both** — equivalent to providing only `deposit_account_template_id`;
        the supplied `program_id` is treated as a confirming assertion. Returns
        `400` if the supplied `program_id` does not match the program the
        template belongs to.


        Supplying neither field returns `400`. An unrecognised `program_id` (or
        one you do not manage) returns `404`.


        On approval the `ONBOARDING.APPROVED` event always fires. The
        `DEPOSIT_ACCOUNT.PENDING` / `DEPOSIT_ACCOUNT.OPEN` events only fire when
        the Onboarding was created with `deposit_account_template_id` (either
        alone or alongside a matching `program_id`).
      tags:
        - subpackage_onboarding
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
        - name: Erebor-Simulation-Scenario
          in: header
          description: >
            **Sandbox only.** Forces a simulated onboarding outcome so you can
            exercise success and failure paths. Ignored in production, where
            onboardings always go through real review.


            | Value | Outcome |

            |-------|---------|

            | `ONBOARDING_REJECTED` | The Onboarding status is set to
            `REJECTED`. No Customer or Deposit Account is created. |

            | `ONBOARDING_UNDER_REVIEW` | The Onboarding status is set to
            `UNDER_REVIEW`. |

            | _(omitted)_ | The Onboarding status is set to `APPROVED` (and
            opens the initial Deposit Account when `deposit_account_template_id`
            was supplied). |


            An unrecognized value is rejected with `400`. The header name aligns
            with the platform's `/simulation/` endpoints.
          required: false
          schema:
            $ref: >-
              #/components/schemas/OnboardingsPostParametersEreborSimulationScenario
      responses:
        '200':
          description: Onboarding created successfully
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
        '409':
          description: Conflict
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '422':
          description: Unprocessable Content
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateOnboardingRequest'
servers:
  - url: https://api.erebor.bank
    description: API server (environment determined by API key)
components:
  schemas:
    OnboardingsPostParametersEreborSimulationScenario:
      type: string
      enum:
        - ONBOARDING_REJECTED
        - ONBOARDING_UNDER_REVIEW
      title: OnboardingsPostParametersEreborSimulationScenario
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
    CreateOnboardingRequest:
      type: object
      properties:
        program_id:
          type: string
          description: >
            Provide to onboard the customer into this program. If supplied
            alone, no initial deposit account is opened — use `POST
            /deposit_accounts` later to open accounts when the customer is
            ready. May be supplied alongside `deposit_account_template_id` as a
            confirming assertion; if both are set, the supplied `program_id`
            must match the program the template belongs to.
        person_applicant_id:
          type:
            - string
            - 'null'
        business_applicant_id:
          type:
            - string
            - 'null'
        deposit_account_template_id:
          type: string
          description: >
            Provide to onboard the customer **and** open an initial deposit
            account from this template on approval. The customer is placed in
            the template's program. May be supplied alongside `program_id`; if
            both are set, the supplied `program_id` must match the template's
            program.
        disclosures:
          $ref: '#/components/schemas/Disclosures'
        custom_ref:
          $ref: '#/components/schemas/CustomRef'
        custom_fields:
          $ref: '#/components/schemas/CustomFields'
      required:
        - disclosures
      description: >
        At least one of `deposit_account_template_id` or `program_id` must be
        set. Both may be supplied together: the template path is taken (an
        initial deposit account is opened) and the supplied `program_id` is
        verified to match the program the template belongs to. A mismatch
        returns `400`.


        - **`deposit_account_template_id` only** — on approval, we create the
        Customer **and** open an initial deposit account from the template. The
        customer is placed in the template's program.

        - **`program_id` only** — on approval, we create only the Customer in
        the given program. No initial deposit account is opened; open accounts
        later via `POST /deposit_accounts` when the customer is ready to
        transact.

        - **Both** — equivalent to providing only `deposit_account_template_id`;
        the supplied `program_id` is treated as a confirming assertion.
      title: CreateOnboardingRequest
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

### With program only (no initial account on approval)



**Request**

```json
{
  "disclosures": {
    "disclosures_signed_externally": true
  },
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "business_applicant_id": "biz_app_01kasd1tthf1ns1pjn1kncctwd",
  "custom_ref": "ONB-2025-7821",
  "custom_fields": {
    "sales_rep": "j.smith",
    "internal_id": "ONB-2025-7821"
  }
}
```

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

```python With program only (no initial account on approval)
import requests

url = "https://api.erebor.bank/onboardings"

payload = {
    "disclosures": { "disclosures_signed_externally": True },
    "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
    "business_applicant_id": "biz_app_01kasd1tthf1ns1pjn1kncctwd",
    "custom_ref": "ONB-2025-7821",
    "custom_fields": {
        "sales_rep": "j.smith",
        "internal_id": "ONB-2025-7821"
    }
}
headers = {
    "Authorization": "<apiKey>",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.json())
```

```javascript With program only (no initial account on approval)
const url = 'https://api.erebor.bank/onboardings';
const options = {
  method: 'POST',
  headers: {Authorization: '<apiKey>', 'Content-Type': 'application/json'},
  body: '{"disclosures":{"disclosures_signed_externally":true},"program_id":"prgrm_01kasd1tthf1ns1pjn1kncctwd","business_applicant_id":"biz_app_01kasd1tthf1ns1pjn1kncctwd","custom_ref":"ONB-2025-7821","custom_fields":{"sales_rep":"j.smith","internal_id":"ONB-2025-7821"}}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go With program only (no initial account on approval)
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/onboardings"

	payload := strings.NewReader("{\n  \"disclosures\": {\n    \"disclosures_signed_externally\": true\n  },\n  \"program_id\": \"prgrm_01kasd1tthf1ns1pjn1kncctwd\",\n  \"business_applicant_id\": \"biz_app_01kasd1tthf1ns1pjn1kncctwd\",\n  \"custom_ref\": \"ONB-2025-7821\",\n  \"custom_fields\": {\n    \"sales_rep\": \"j.smith\",\n    \"internal_id\": \"ONB-2025-7821\"\n  }\n}")

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

```ruby With program only (no initial account on approval)
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/onboardings")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Authorization"] = '<apiKey>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"disclosures\": {\n    \"disclosures_signed_externally\": true\n  },\n  \"program_id\": \"prgrm_01kasd1tthf1ns1pjn1kncctwd\",\n  \"business_applicant_id\": \"biz_app_01kasd1tthf1ns1pjn1kncctwd\",\n  \"custom_ref\": \"ONB-2025-7821\",\n  \"custom_fields\": {\n    \"sales_rep\": \"j.smith\",\n    \"internal_id\": \"ONB-2025-7821\"\n  }\n}"

response = http.request(request)
puts response.read_body
```

```java With program only (no initial account on approval)
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.post("https://api.erebor.bank/onboardings")
  .header("Authorization", "<apiKey>")
  .header("Content-Type", "application/json")
  .body("{\n  \"disclosures\": {\n    \"disclosures_signed_externally\": true\n  },\n  \"program_id\": \"prgrm_01kasd1tthf1ns1pjn1kncctwd\",\n  \"business_applicant_id\": \"biz_app_01kasd1tthf1ns1pjn1kncctwd\",\n  \"custom_ref\": \"ONB-2025-7821\",\n  \"custom_fields\": {\n    \"sales_rep\": \"j.smith\",\n    \"internal_id\": \"ONB-2025-7821\"\n  }\n}")
  .asString();
```

```php With program only (no initial account on approval)
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://api.erebor.bank/onboardings', [
  'body' => '{
  "disclosures": {
    "disclosures_signed_externally": true
  },
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "business_applicant_id": "biz_app_01kasd1tthf1ns1pjn1kncctwd",
  "custom_ref": "ONB-2025-7821",
  "custom_fields": {
    "sales_rep": "j.smith",
    "internal_id": "ONB-2025-7821"
  }
}',
  'headers' => [
    'Authorization' => '<apiKey>',
    'Content-Type' => 'application/json',
  ],
]);

echo $response->getBody();
```

```csharp With program only (no initial account on approval)
using RestSharp;

var client = new RestClient("https://api.erebor.bank/onboardings");
var request = new RestRequest(Method.POST);
request.AddHeader("Authorization", "<apiKey>");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"disclosures\": {\n    \"disclosures_signed_externally\": true\n  },\n  \"program_id\": \"prgrm_01kasd1tthf1ns1pjn1kncctwd\",\n  \"business_applicant_id\": \"biz_app_01kasd1tthf1ns1pjn1kncctwd\",\n  \"custom_ref\": \"ONB-2025-7821\",\n  \"custom_fields\": {\n    \"sales_rep\": \"j.smith\",\n    \"internal_id\": \"ONB-2025-7821\"\n  }\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift With program only (no initial account on approval)
import Foundation

let headers = [
  "Authorization": "<apiKey>",
  "Content-Type": "application/json"
]
let parameters = [
  "disclosures": ["disclosures_signed_externally": true],
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "business_applicant_id": "biz_app_01kasd1tthf1ns1pjn1kncctwd",
  "custom_ref": "ONB-2025-7821",
  "custom_fields": [
    "sales_rep": "j.smith",
    "internal_id": "ONB-2025-7821"
  ]
] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/onboardings")! as URL,
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

### With both (template wins; program_id verified to match)



**Request**

```json
{
  "disclosures": {
    "disclosures_signed_externally": true
  },
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "business_applicant_id": "biz_app_01kasd1tthf1ns1pjn1kncctwd",
  "deposit_account_template_id": "dep_acct_tmpl_01kasd1tthf1ns1pjn1kncctwd",
  "custom_ref": "ONB-2025-7821",
  "custom_fields": {
    "sales_rep": "j.smith",
    "internal_id": "ONB-2025-7821"
  }
}
```

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

```python With both (template wins; program_id verified to match)
import requests

url = "https://api.erebor.bank/onboardings"

payload = {
    "disclosures": { "disclosures_signed_externally": True },
    "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
    "business_applicant_id": "biz_app_01kasd1tthf1ns1pjn1kncctwd",
    "deposit_account_template_id": "dep_acct_tmpl_01kasd1tthf1ns1pjn1kncctwd",
    "custom_ref": "ONB-2025-7821",
    "custom_fields": {
        "sales_rep": "j.smith",
        "internal_id": "ONB-2025-7821"
    }
}
headers = {
    "Authorization": "<apiKey>",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.json())
```

```javascript With both (template wins; program_id verified to match)
const url = 'https://api.erebor.bank/onboardings';
const options = {
  method: 'POST',
  headers: {Authorization: '<apiKey>', 'Content-Type': 'application/json'},
  body: '{"disclosures":{"disclosures_signed_externally":true},"program_id":"prgrm_01kasd1tthf1ns1pjn1kncctwd","business_applicant_id":"biz_app_01kasd1tthf1ns1pjn1kncctwd","deposit_account_template_id":"dep_acct_tmpl_01kasd1tthf1ns1pjn1kncctwd","custom_ref":"ONB-2025-7821","custom_fields":{"sales_rep":"j.smith","internal_id":"ONB-2025-7821"}}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go With both (template wins; program_id verified to match)
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/onboardings"

	payload := strings.NewReader("{\n  \"disclosures\": {\n    \"disclosures_signed_externally\": true\n  },\n  \"program_id\": \"prgrm_01kasd1tthf1ns1pjn1kncctwd\",\n  \"business_applicant_id\": \"biz_app_01kasd1tthf1ns1pjn1kncctwd\",\n  \"deposit_account_template_id\": \"dep_acct_tmpl_01kasd1tthf1ns1pjn1kncctwd\",\n  \"custom_ref\": \"ONB-2025-7821\",\n  \"custom_fields\": {\n    \"sales_rep\": \"j.smith\",\n    \"internal_id\": \"ONB-2025-7821\"\n  }\n}")

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

```ruby With both (template wins; program_id verified to match)
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/onboardings")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Authorization"] = '<apiKey>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"disclosures\": {\n    \"disclosures_signed_externally\": true\n  },\n  \"program_id\": \"prgrm_01kasd1tthf1ns1pjn1kncctwd\",\n  \"business_applicant_id\": \"biz_app_01kasd1tthf1ns1pjn1kncctwd\",\n  \"deposit_account_template_id\": \"dep_acct_tmpl_01kasd1tthf1ns1pjn1kncctwd\",\n  \"custom_ref\": \"ONB-2025-7821\",\n  \"custom_fields\": {\n    \"sales_rep\": \"j.smith\",\n    \"internal_id\": \"ONB-2025-7821\"\n  }\n}"

response = http.request(request)
puts response.read_body
```

```java With both (template wins; program_id verified to match)
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.post("https://api.erebor.bank/onboardings")
  .header("Authorization", "<apiKey>")
  .header("Content-Type", "application/json")
  .body("{\n  \"disclosures\": {\n    \"disclosures_signed_externally\": true\n  },\n  \"program_id\": \"prgrm_01kasd1tthf1ns1pjn1kncctwd\",\n  \"business_applicant_id\": \"biz_app_01kasd1tthf1ns1pjn1kncctwd\",\n  \"deposit_account_template_id\": \"dep_acct_tmpl_01kasd1tthf1ns1pjn1kncctwd\",\n  \"custom_ref\": \"ONB-2025-7821\",\n  \"custom_fields\": {\n    \"sales_rep\": \"j.smith\",\n    \"internal_id\": \"ONB-2025-7821\"\n  }\n}")
  .asString();
```

```php With both (template wins; program_id verified to match)
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://api.erebor.bank/onboardings', [
  'body' => '{
  "disclosures": {
    "disclosures_signed_externally": true
  },
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "business_applicant_id": "biz_app_01kasd1tthf1ns1pjn1kncctwd",
  "deposit_account_template_id": "dep_acct_tmpl_01kasd1tthf1ns1pjn1kncctwd",
  "custom_ref": "ONB-2025-7821",
  "custom_fields": {
    "sales_rep": "j.smith",
    "internal_id": "ONB-2025-7821"
  }
}',
  'headers' => [
    'Authorization' => '<apiKey>',
    'Content-Type' => 'application/json',
  ],
]);

echo $response->getBody();
```

```csharp With both (template wins; program_id verified to match)
using RestSharp;

var client = new RestClient("https://api.erebor.bank/onboardings");
var request = new RestRequest(Method.POST);
request.AddHeader("Authorization", "<apiKey>");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"disclosures\": {\n    \"disclosures_signed_externally\": true\n  },\n  \"program_id\": \"prgrm_01kasd1tthf1ns1pjn1kncctwd\",\n  \"business_applicant_id\": \"biz_app_01kasd1tthf1ns1pjn1kncctwd\",\n  \"deposit_account_template_id\": \"dep_acct_tmpl_01kasd1tthf1ns1pjn1kncctwd\",\n  \"custom_ref\": \"ONB-2025-7821\",\n  \"custom_fields\": {\n    \"sales_rep\": \"j.smith\",\n    \"internal_id\": \"ONB-2025-7821\"\n  }\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift With both (template wins; program_id verified to match)
import Foundation

let headers = [
  "Authorization": "<apiKey>",
  "Content-Type": "application/json"
]
let parameters = [
  "disclosures": ["disclosures_signed_externally": true],
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "business_applicant_id": "biz_app_01kasd1tthf1ns1pjn1kncctwd",
  "deposit_account_template_id": "dep_acct_tmpl_01kasd1tthf1ns1pjn1kncctwd",
  "custom_ref": "ONB-2025-7821",
  "custom_fields": [
    "sales_rep": "j.smith",
    "internal_id": "ONB-2025-7821"
  ]
] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/onboardings")! as URL,
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

### Example 3



**Request**

```json
{
  "disclosures": {
    "disclosures_signed_externally": true
  },
  "business_applicant_id": "biz_app_01kasd1tthf1ns1pjn1kncctwd",
  "deposit_account_template_id": "dep_acct_tmpl_01kasd1tthf1ns1pjn1kncctwd",
  "custom_ref": "ONB-2025-7821",
  "custom_fields": {
    "sales_rep": "j.smith",
    "internal_id": "ONB-2025-7821"
  }
}
```

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

url = "https://api.erebor.bank/onboardings"

payload = {
    "disclosures": { "disclosures_signed_externally": True },
    "business_applicant_id": "biz_app_01kasd1tthf1ns1pjn1kncctwd",
    "deposit_account_template_id": "dep_acct_tmpl_01kasd1tthf1ns1pjn1kncctwd",
    "custom_ref": "ONB-2025-7821",
    "custom_fields": {
        "sales_rep": "j.smith",
        "internal_id": "ONB-2025-7821"
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
const url = 'https://api.erebor.bank/onboardings';
const options = {
  method: 'POST',
  headers: {Authorization: '<apiKey>', 'Content-Type': 'application/json'},
  body: '{"disclosures":{"disclosures_signed_externally":true},"business_applicant_id":"biz_app_01kasd1tthf1ns1pjn1kncctwd","deposit_account_template_id":"dep_acct_tmpl_01kasd1tthf1ns1pjn1kncctwd","custom_ref":"ONB-2025-7821","custom_fields":{"sales_rep":"j.smith","internal_id":"ONB-2025-7821"}}'
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

	url := "https://api.erebor.bank/onboardings"

	payload := strings.NewReader("{\n  \"disclosures\": {\n    \"disclosures_signed_externally\": true\n  },\n  \"business_applicant_id\": \"biz_app_01kasd1tthf1ns1pjn1kncctwd\",\n  \"deposit_account_template_id\": \"dep_acct_tmpl_01kasd1tthf1ns1pjn1kncctwd\",\n  \"custom_ref\": \"ONB-2025-7821\",\n  \"custom_fields\": {\n    \"sales_rep\": \"j.smith\",\n    \"internal_id\": \"ONB-2025-7821\"\n  }\n}")

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

url = URI("https://api.erebor.bank/onboardings")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Authorization"] = '<apiKey>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"disclosures\": {\n    \"disclosures_signed_externally\": true\n  },\n  \"business_applicant_id\": \"biz_app_01kasd1tthf1ns1pjn1kncctwd\",\n  \"deposit_account_template_id\": \"dep_acct_tmpl_01kasd1tthf1ns1pjn1kncctwd\",\n  \"custom_ref\": \"ONB-2025-7821\",\n  \"custom_fields\": {\n    \"sales_rep\": \"j.smith\",\n    \"internal_id\": \"ONB-2025-7821\"\n  }\n}"

response = http.request(request)
puts response.read_body
```

```java
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.post("https://api.erebor.bank/onboardings")
  .header("Authorization", "<apiKey>")
  .header("Content-Type", "application/json")
  .body("{\n  \"disclosures\": {\n    \"disclosures_signed_externally\": true\n  },\n  \"business_applicant_id\": \"biz_app_01kasd1tthf1ns1pjn1kncctwd\",\n  \"deposit_account_template_id\": \"dep_acct_tmpl_01kasd1tthf1ns1pjn1kncctwd\",\n  \"custom_ref\": \"ONB-2025-7821\",\n  \"custom_fields\": {\n    \"sales_rep\": \"j.smith\",\n    \"internal_id\": \"ONB-2025-7821\"\n  }\n}")
  .asString();
```

```php
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://api.erebor.bank/onboardings', [
  'body' => '{
  "disclosures": {
    "disclosures_signed_externally": true
  },
  "business_applicant_id": "biz_app_01kasd1tthf1ns1pjn1kncctwd",
  "deposit_account_template_id": "dep_acct_tmpl_01kasd1tthf1ns1pjn1kncctwd",
  "custom_ref": "ONB-2025-7821",
  "custom_fields": {
    "sales_rep": "j.smith",
    "internal_id": "ONB-2025-7821"
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

var client = new RestClient("https://api.erebor.bank/onboardings");
var request = new RestRequest(Method.POST);
request.AddHeader("Authorization", "<apiKey>");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"disclosures\": {\n    \"disclosures_signed_externally\": true\n  },\n  \"business_applicant_id\": \"biz_app_01kasd1tthf1ns1pjn1kncctwd\",\n  \"deposit_account_template_id\": \"dep_acct_tmpl_01kasd1tthf1ns1pjn1kncctwd\",\n  \"custom_ref\": \"ONB-2025-7821\",\n  \"custom_fields\": {\n    \"sales_rep\": \"j.smith\",\n    \"internal_id\": \"ONB-2025-7821\"\n  }\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = [
  "Authorization": "<apiKey>",
  "Content-Type": "application/json"
]
let parameters = [
  "disclosures": ["disclosures_signed_externally": true],
  "business_applicant_id": "biz_app_01kasd1tthf1ns1pjn1kncctwd",
  "deposit_account_template_id": "dep_acct_tmpl_01kasd1tthf1ns1pjn1kncctwd",
  "custom_ref": "ONB-2025-7821",
  "custom_fields": [
    "sales_rep": "j.smith",
    "internal_id": "ONB-2025-7821"
  ]
] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/onboardings")! as URL,
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