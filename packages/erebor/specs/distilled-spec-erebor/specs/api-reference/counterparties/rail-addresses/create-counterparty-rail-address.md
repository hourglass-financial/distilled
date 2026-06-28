> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Create Counterparty Rail Address

POST https://api.erebor.bank/counterparty_rail_addresses
Content-Type: application/json

Create a new Rail Address for a Counterparty

Reference: https://docs.erebor.bank/api-reference/counterparties/rail-addresses/create-counterparty-rail-address

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /counterparty_rail_addresses:
    post:
      operationId: create-counterparty-rail-address
      summary: Create Counterparty Rail Address
      description: Create a new Rail Address for a Counterparty
      tags:
        - subpackage_counterpartyRailAddresses
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
          description: Rail address created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CounterpartyRailAddress'
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
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateCounterpartyRailAddressRequest'
servers:
  - url: https://api.erebor.bank
    description: API server (environment determined by API key)
components:
  schemas:
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
    CreateCounterpartyRailAddressRequest:
      type: object
      properties:
        counterparty_id:
          type: string
          description: ID of the counterparty to link this rail address to
        description:
          type: string
        address:
          type: string
          description: Unique rail identifier
        custom_ref:
          $ref: '#/components/schemas/CustomRef'
        custom_fields:
          $ref: '#/components/schemas/CustomFields'
      required:
        - counterparty_id
        - address
      title: CreateCounterpartyRailAddressRequest
    CounterpartyRailAddress:
      type: object
      properties:
        id:
          type: string
          description: >-
            Unique identifier for the counterparty rail address, prefixed with
            `cp_rail_addr_`.
        type:
          type: string
          enum:
            - COUNTERPARTY_RAIL_ADDRESS
          description: Object type. Always `COUNTERPARTY_RAIL_ADDRESS`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this counterparty rail address.
        created_at:
          type: string
          format: date-time
          description: Timestamp of when the address was created, in ISO 8601 format.
        updated_at:
          type: string
          format: date-time
          description: Timestamp of when the address was last updated, in ISO 8601 format.
        archived_at:
          type:
            - string
            - 'null'
          format: date-time
        customer_id:
          type:
            - string
            - 'null'
          description: ID of the customer this address belongs to, prefixed with `cust_`.
        program_id:
          type:
            - string
            - 'null'
          description: ID of the program this address belongs to, prefixed with `prgrm_`.
        counterparty_id:
          type:
            - string
            - 'null'
          description: >-
            ID of the counterparty this rail address is linked to, prefixed with
            `cp_`.
        description:
          type: string
          description: >-
            User-friendly description for this rail address (max 100
            characters).
        address:
          type: string
          description: Unique rail identifier
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
        - address
      title: CounterpartyRailAddress
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

### Created Counterparty Rail Address



**Request**

```json
undefined
```

**Response**

```json
{
  "id": "cp_rail_addr_01kasd1tthf1ns1pjn1kncctwd",
  "type": "COUNTERPARTY_RAIL_ADDRESS",
  "url": "https://api.erebor.bank/counterparty_rail_addresses/cp_rail_addr_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T09:30:00Z",
  "address": "@company_handle",
  "archived_at": null,
  "customer_id": "cust_01kasd1tthf1ns1pjn1kncctwd",
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "counterparty_id": "cp_01kasd1tthf1ns1pjn1kncctwd",
  "description": "Primary Rail Address",
  "custom_ref": "CP-RAIL-2025-001",
  "custom_fields": {
    "verified_at": "2025-01-15",
    "directory_pubkey": "z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH"
  }
}
```

**SDK Code**

```python Created Counterparty Rail Address
import requests

url = "https://api.erebor.bank/counterparty_rail_addresses"

headers = {
    "Authorization": "<apiKey>",
    "Content-Type": "application/json"
}

response = requests.post(url, headers=headers)

print(response.json())
```

```javascript Created Counterparty Rail Address
const url = 'https://api.erebor.bank/counterparty_rail_addresses';
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

```go Created Counterparty Rail Address
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/counterparty_rail_addresses"

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

```ruby Created Counterparty Rail Address
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/counterparty_rail_addresses")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Authorization"] = '<apiKey>'
request["Content-Type"] = 'application/json'

response = http.request(request)
puts response.read_body
```

```java Created Counterparty Rail Address
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.post("https://api.erebor.bank/counterparty_rail_addresses")
  .header("Authorization", "<apiKey>")
  .header("Content-Type", "application/json")
  .asString();
```

```php Created Counterparty Rail Address
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://api.erebor.bank/counterparty_rail_addresses', [
  'headers' => [
    'Authorization' => '<apiKey>',
    'Content-Type' => 'application/json',
  ],
]);

echo $response->getBody();
```

```csharp Created Counterparty Rail Address
using RestSharp;

var client = new RestClient("https://api.erebor.bank/counterparty_rail_addresses");
var request = new RestRequest(Method.POST);
request.AddHeader("Authorization", "<apiKey>");
request.AddHeader("Content-Type", "application/json");
IRestResponse response = client.Execute(request);
```

```swift Created Counterparty Rail Address
import Foundation

let headers = [
  "Authorization": "<apiKey>",
  "Content-Type": "application/json"
]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/counterparty_rail_addresses")! as URL,
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

### Create Counterparty Rail Address



**Request**

```json
{
  "counterparty_id": "cp_01kasd1tthf1ns1pjn1kncctwd",
  "address": "@company_handle",
  "custom_ref": "CP-RAIL-2025-001",
  "custom_fields": {
    "verified_at": "2025-01-15",
    "directory_pubkey": "z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH"
  }
}
```

**Response**

```json
{
  "id": "cp_rail_addr_01kasd1tthf1ns1pjn1kncctwd",
  "type": "COUNTERPARTY_RAIL_ADDRESS",
  "url": "https://api.erebor.bank/counterparty_rail_addresses/cp_rail_addr_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T09:30:00Z",
  "address": "@company_handle",
  "archived_at": null,
  "customer_id": "cust_01kasd1tthf1ns1pjn1kncctwd",
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "counterparty_id": "cp_01kasd1tthf1ns1pjn1kncctwd",
  "description": "Primary Rail Address",
  "custom_ref": "CP-RAIL-2025-001",
  "custom_fields": {
    "verified_at": "2025-01-15",
    "directory_pubkey": "z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH"
  }
}
```

**SDK Code**

```python Create Counterparty Rail Address
import requests

url = "https://api.erebor.bank/counterparty_rail_addresses"

payload = {
    "counterparty_id": "cp_01kasd1tthf1ns1pjn1kncctwd",
    "address": "@company_handle",
    "custom_ref": "CP-RAIL-2025-001",
    "custom_fields": {
        "verified_at": "2025-01-15",
        "directory_pubkey": "z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH"
    }
}
headers = {
    "Authorization": "<apiKey>",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.json())
```

```javascript Create Counterparty Rail Address
const url = 'https://api.erebor.bank/counterparty_rail_addresses';
const options = {
  method: 'POST',
  headers: {Authorization: '<apiKey>', 'Content-Type': 'application/json'},
  body: '{"counterparty_id":"cp_01kasd1tthf1ns1pjn1kncctwd","address":"@company_handle","custom_ref":"CP-RAIL-2025-001","custom_fields":{"verified_at":"2025-01-15","directory_pubkey":"z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH"}}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go Create Counterparty Rail Address
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/counterparty_rail_addresses"

	payload := strings.NewReader("{\n  \"counterparty_id\": \"cp_01kasd1tthf1ns1pjn1kncctwd\",\n  \"address\": \"@company_handle\",\n  \"custom_ref\": \"CP-RAIL-2025-001\",\n  \"custom_fields\": {\n    \"verified_at\": \"2025-01-15\",\n    \"directory_pubkey\": \"z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH\"\n  }\n}")

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

```ruby Create Counterparty Rail Address
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/counterparty_rail_addresses")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Authorization"] = '<apiKey>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"counterparty_id\": \"cp_01kasd1tthf1ns1pjn1kncctwd\",\n  \"address\": \"@company_handle\",\n  \"custom_ref\": \"CP-RAIL-2025-001\",\n  \"custom_fields\": {\n    \"verified_at\": \"2025-01-15\",\n    \"directory_pubkey\": \"z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH\"\n  }\n}"

response = http.request(request)
puts response.read_body
```

```java Create Counterparty Rail Address
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.post("https://api.erebor.bank/counterparty_rail_addresses")
  .header("Authorization", "<apiKey>")
  .header("Content-Type", "application/json")
  .body("{\n  \"counterparty_id\": \"cp_01kasd1tthf1ns1pjn1kncctwd\",\n  \"address\": \"@company_handle\",\n  \"custom_ref\": \"CP-RAIL-2025-001\",\n  \"custom_fields\": {\n    \"verified_at\": \"2025-01-15\",\n    \"directory_pubkey\": \"z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH\"\n  }\n}")
  .asString();
```

```php Create Counterparty Rail Address
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://api.erebor.bank/counterparty_rail_addresses', [
  'body' => '{
  "counterparty_id": "cp_01kasd1tthf1ns1pjn1kncctwd",
  "address": "@company_handle",
  "custom_ref": "CP-RAIL-2025-001",
  "custom_fields": {
    "verified_at": "2025-01-15",
    "directory_pubkey": "z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH"
  }
}',
  'headers' => [
    'Authorization' => '<apiKey>',
    'Content-Type' => 'application/json',
  ],
]);

echo $response->getBody();
```

```csharp Create Counterparty Rail Address
using RestSharp;

var client = new RestClient("https://api.erebor.bank/counterparty_rail_addresses");
var request = new RestRequest(Method.POST);
request.AddHeader("Authorization", "<apiKey>");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"counterparty_id\": \"cp_01kasd1tthf1ns1pjn1kncctwd\",\n  \"address\": \"@company_handle\",\n  \"custom_ref\": \"CP-RAIL-2025-001\",\n  \"custom_fields\": {\n    \"verified_at\": \"2025-01-15\",\n    \"directory_pubkey\": \"z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH\"\n  }\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift Create Counterparty Rail Address
import Foundation

let headers = [
  "Authorization": "<apiKey>",
  "Content-Type": "application/json"
]
let parameters = [
  "counterparty_id": "cp_01kasd1tthf1ns1pjn1kncctwd",
  "address": "@company_handle",
  "custom_ref": "CP-RAIL-2025-001",
  "custom_fields": [
    "verified_at": "2025-01-15",
    "directory_pubkey": "z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH"
  ]
] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/counterparty_rail_addresses")! as URL,
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