> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Create Counterparty International Bank Account

POST https://api.erebor.bank/counterparty_international_bank_accounts
Content-Type: application/json

Create a new international bank account for a Counterparty

Reference: https://docs.erebor.bank/api-reference/counterparties/international-bank-accounts/create-counterparty-international-bank-account

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /counterparty_international_bank_accounts:
    post:
      operationId: create-counterparty-international-bank-account
      summary: Create Counterparty International Bank Account
      description: Create a new international bank account for a Counterparty
      tags:
        - subpackage_counterpartyInternationalBankAccounts
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
          description: International bank account created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CounterpartyInternationalBankAccount'
        '400':
          description: Bad Request
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
            The destination account belongs to an Erebor customer. Use Rail
            instead.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
      requestBody:
        content:
          application/json:
            schema:
              $ref: >-
                #/components/schemas/CreateCounterpartyInternationalBankAccountRequest
servers:
  - url: https://api.erebor.bank
    description: API server (environment determined by API key)
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
    CreateCounterpartyInternationalBankAccountRequest:
      type: object
      properties:
        counterparty_id:
          type: string
          description: ID of the counterparty to link this bank account to
        description:
          type: string
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
        additional_account_number_data:
          oneOf:
            - $ref: '#/components/schemas/AdditionalAccountNumberData'
            - type: 'null'
          description: >-
            Country-specific additional account number data. Validation is
            applied on a per-country basis, determined by the BIC.
        custom_ref:
          $ref: '#/components/schemas/CustomRef'
        custom_fields:
          $ref: '#/components/schemas/CustomFields'
      required:
        - counterparty_id
        - description
        - account_number
        - bic
      description: Request to create an international bank account.
      title: CreateCounterpartyInternationalBankAccountRequest
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

### Created Counterparty International Bank Account



**Request**

```json
undefined
```

**Response**

```json
{
  "id": "cp_intl_bank_acct_01kasd1tthf1ns1pjn1kncctwd",
  "type": "COUNTERPARTY_INTL_BANK_ACCOUNT",
  "url": "https://api.erebor.bank/counterparty_international_bank_accounts/cp_intl_bank_acct_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T09:30:00Z",
  "description": "Euro Account",
  "account_number": "GB29NWBK60161331926819",
  "bic": "NWBKGB2L",
  "country_code": "DE",
  "archived_at": null,
  "customer_id": "cust_01kasd1tthf1ns1pjn1kncctwd",
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "counterparty_id": "cp_01kasd1tthf1ns1pjn1kncctwd",
  "custom_ref": "CP-IBA-2025-001",
  "custom_fields": {
    "swift_verified": "true",
    "region": "EMEA"
  }
}
```

**SDK Code**

```python Created Counterparty International Bank Account
import requests

url = "https://api.erebor.bank/counterparty_international_bank_accounts"

headers = {
    "Authorization": "<apiKey>",
    "Content-Type": "application/json"
}

response = requests.post(url, headers=headers)

print(response.json())
```

```javascript Created Counterparty International Bank Account
const url = 'https://api.erebor.bank/counterparty_international_bank_accounts';
const options = {
  method: 'POST',
  headers: {Authorization: '<apiKey>', 'Content-Type': 'application/json'},
  body: undefined
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go Created Counterparty International Bank Account
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/counterparty_international_bank_accounts"

	req, _ := http.NewRequest("POST", url, nil)

	req.Header.Add("Authorization", "<apiKey>")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby Created Counterparty International Bank Account
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/counterparty_international_bank_accounts")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Authorization"] = '<apiKey>'
request["Content-Type"] = 'application/json'

response = http.request(request)
puts response.read_body
```

```java Created Counterparty International Bank Account
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.post("https://api.erebor.bank/counterparty_international_bank_accounts")
  .header("Authorization", "<apiKey>")
  .header("Content-Type", "application/json")
  .asString();
```

```php Created Counterparty International Bank Account
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://api.erebor.bank/counterparty_international_bank_accounts', [
  'headers' => [
    'Authorization' => '<apiKey>',
    'Content-Type' => 'application/json',
  ],
]);

echo $response->getBody();
```

```csharp Created Counterparty International Bank Account
using RestSharp;

var client = new RestClient("https://api.erebor.bank/counterparty_international_bank_accounts");
var request = new RestRequest(Method.POST);
request.AddHeader("Authorization", "<apiKey>");
request.AddHeader("Content-Type", "application/json");
IRestResponse response = client.Execute(request);
```

```swift Created Counterparty International Bank Account
import Foundation

let headers = [
  "Authorization": "<apiKey>",
  "Content-Type": "application/json"
]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/counterparty_international_bank_accounts")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "POST"
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

### Create Counterparty International Bank Account



**Request**

```json
{
  "counterparty_id": "cp_01kasd1tthf1ns1pjn1kncctwd",
  "description": "Euro Account",
  "account_number": "GB29NWBK60161331926819",
  "bic": "NWBKGB2L",
  "custom_ref": "CP-IBA-2025-001",
  "custom_fields": {
    "swift_verified": "true",
    "region": "EMEA"
  }
}
```

**Response**

```json
{
  "id": "cp_intl_bank_acct_01kasd1tthf1ns1pjn1kncctwd",
  "type": "COUNTERPARTY_INTL_BANK_ACCOUNT",
  "url": "https://api.erebor.bank/counterparty_international_bank_accounts/cp_intl_bank_acct_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T09:30:00Z",
  "description": "Euro Account",
  "account_number": "GB29NWBK60161331926819",
  "bic": "NWBKGB2L",
  "country_code": "DE",
  "archived_at": null,
  "customer_id": "cust_01kasd1tthf1ns1pjn1kncctwd",
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "counterparty_id": "cp_01kasd1tthf1ns1pjn1kncctwd",
  "custom_ref": "CP-IBA-2025-001",
  "custom_fields": {
    "swift_verified": "true",
    "region": "EMEA"
  }
}
```

**SDK Code**

```python Create Counterparty International Bank Account
import requests

url = "https://api.erebor.bank/counterparty_international_bank_accounts"

payload = {
    "counterparty_id": "cp_01kasd1tthf1ns1pjn1kncctwd",
    "description": "Euro Account",
    "account_number": "GB29NWBK60161331926819",
    "bic": "NWBKGB2L",
    "custom_ref": "CP-IBA-2025-001",
    "custom_fields": {
        "swift_verified": "true",
        "region": "EMEA"
    }
}
headers = {
    "Authorization": "<apiKey>",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.json())
```

```javascript Create Counterparty International Bank Account
const url = 'https://api.erebor.bank/counterparty_international_bank_accounts';
const options = {
  method: 'POST',
  headers: {Authorization: '<apiKey>', 'Content-Type': 'application/json'},
  body: '{"counterparty_id":"cp_01kasd1tthf1ns1pjn1kncctwd","description":"Euro Account","account_number":"GB29NWBK60161331926819","bic":"NWBKGB2L","custom_ref":"CP-IBA-2025-001","custom_fields":{"swift_verified":"true","region":"EMEA"}}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go Create Counterparty International Bank Account
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/counterparty_international_bank_accounts"

	payload := strings.NewReader("{\n  \"counterparty_id\": \"cp_01kasd1tthf1ns1pjn1kncctwd\",\n  \"description\": \"Euro Account\",\n  \"account_number\": \"GB29NWBK60161331926819\",\n  \"bic\": \"NWBKGB2L\",\n  \"custom_ref\": \"CP-IBA-2025-001\",\n  \"custom_fields\": {\n    \"swift_verified\": \"true\",\n    \"region\": \"EMEA\"\n  }\n}")

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

```ruby Create Counterparty International Bank Account
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/counterparty_international_bank_accounts")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Authorization"] = '<apiKey>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"counterparty_id\": \"cp_01kasd1tthf1ns1pjn1kncctwd\",\n  \"description\": \"Euro Account\",\n  \"account_number\": \"GB29NWBK60161331926819\",\n  \"bic\": \"NWBKGB2L\",\n  \"custom_ref\": \"CP-IBA-2025-001\",\n  \"custom_fields\": {\n    \"swift_verified\": \"true\",\n    \"region\": \"EMEA\"\n  }\n}"

response = http.request(request)
puts response.read_body
```

```java Create Counterparty International Bank Account
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.post("https://api.erebor.bank/counterparty_international_bank_accounts")
  .header("Authorization", "<apiKey>")
  .header("Content-Type", "application/json")
  .body("{\n  \"counterparty_id\": \"cp_01kasd1tthf1ns1pjn1kncctwd\",\n  \"description\": \"Euro Account\",\n  \"account_number\": \"GB29NWBK60161331926819\",\n  \"bic\": \"NWBKGB2L\",\n  \"custom_ref\": \"CP-IBA-2025-001\",\n  \"custom_fields\": {\n    \"swift_verified\": \"true\",\n    \"region\": \"EMEA\"\n  }\n}")
  .asString();
```

```php Create Counterparty International Bank Account
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://api.erebor.bank/counterparty_international_bank_accounts', [
  'body' => '{
  "counterparty_id": "cp_01kasd1tthf1ns1pjn1kncctwd",
  "description": "Euro Account",
  "account_number": "GB29NWBK60161331926819",
  "bic": "NWBKGB2L",
  "custom_ref": "CP-IBA-2025-001",
  "custom_fields": {
    "swift_verified": "true",
    "region": "EMEA"
  }
}',
  'headers' => [
    'Authorization' => '<apiKey>',
    'Content-Type' => 'application/json',
  ],
]);

echo $response->getBody();
```

```csharp Create Counterparty International Bank Account
using RestSharp;

var client = new RestClient("https://api.erebor.bank/counterparty_international_bank_accounts");
var request = new RestRequest(Method.POST);
request.AddHeader("Authorization", "<apiKey>");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"counterparty_id\": \"cp_01kasd1tthf1ns1pjn1kncctwd\",\n  \"description\": \"Euro Account\",\n  \"account_number\": \"GB29NWBK60161331926819\",\n  \"bic\": \"NWBKGB2L\",\n  \"custom_ref\": \"CP-IBA-2025-001\",\n  \"custom_fields\": {\n    \"swift_verified\": \"true\",\n    \"region\": \"EMEA\"\n  }\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift Create Counterparty International Bank Account
import Foundation

let headers = [
  "Authorization": "<apiKey>",
  "Content-Type": "application/json"
]
let parameters = [
  "counterparty_id": "cp_01kasd1tthf1ns1pjn1kncctwd",
  "description": "Euro Account",
  "account_number": "GB29NWBK60161331926819",
  "bic": "NWBKGB2L",
  "custom_ref": "CP-IBA-2025-001",
  "custom_fields": [
    "swift_verified": "true",
    "region": "EMEA"
  ]
] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/counterparty_international_bank_accounts")! as URL,
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