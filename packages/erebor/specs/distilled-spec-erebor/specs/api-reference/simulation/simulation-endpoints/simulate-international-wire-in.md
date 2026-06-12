> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Simulate Inbound International Wire Transfer

POST https://api.erebor.bank/simulation/international_wire_in
Content-Type: application/json

Simulate an inbound international wire transfer for testing purposes. This endpoint is only available in the sandbox environment.

You can identify the destination account using either a `deposit_account_id` or an `account_number` + `routing_number` pair — provide exactly one. The originator fields synthesize the sending bank/account; the simulation get-or-creates a counterparty international bank account from these so subsequent counterparty list/get calls observe the new sender. USD-only on day 1.

The response returns the new transfer's customer-facing ID with status `PENDING`. Settlement (`SETTLED`) is asynchronous — typically within seconds. Poll `GET /international_wire_in/{international_wire_in_id}` or listen for the `INTERNATIONAL_WIRE_IN.SETTLED` webhook to observe the transition.

Idempotency: when retrying with the same `Erebor-Idempotency-Key`, the response reflects the existing row's current status (`PENDING` or `SETTLED`). A key reused across customers returns `409 Conflict` — regenerate the key.


Reference: https://docs.erebor.bank/api-reference/simulation/simulation-endpoints/simulate-international-wire-in

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /simulation/international_wire_in:
    post:
      operationId: simulate-international-wire-in
      summary: Simulate Inbound International Wire Transfer
      description: >
        Simulate an inbound international wire transfer for testing purposes.
        This endpoint is only available in the sandbox environment.


        You can identify the destination account using either a
        `deposit_account_id` or an `account_number` + `routing_number` pair —
        provide exactly one. The originator fields synthesize the sending
        bank/account; the simulation get-or-creates a counterparty international
        bank account from these so subsequent counterparty list/get calls
        observe the new sender. USD-only on day 1.


        The response returns the new transfer's customer-facing ID with status
        `PENDING`. Settlement (`SETTLED`) is asynchronous — typically within
        seconds. Poll `GET /international_wire_in/{international_wire_in_id}` or
        listen for the `INTERNATIONAL_WIRE_IN.SETTLED` webhook to observe the
        transition.


        Idempotency: when retrying with the same `Erebor-Idempotency-Key`, the
        response reflects the existing row's current status (`PENDING` or
        `SETTLED`). A key reused across customers returns `409 Conflict` —
        regenerate the key.
      tags:
        - subpackage_simulation
      parameters:
        - name: Authorization
          in: header
          description: |
            Use your API key in the Authorization header.

            Example: `Authorization: your_api_key_here`
          required: true
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
          description: >-
            Inbound international wire transfer simulated successfully. Status
            returns `PENDING`; poll `GET
            /international_wire_in/{international_wire_in_id}` for `SETTLED`.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SimulateInboundInternationalWireResponse'
        '400':
          description: Bad Request
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '403':
          description: Forbidden
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
              $ref: '#/components/schemas/SimulateInternationalWireInRequest'
servers:
  - url: https://api.erebor.bank
    description: API server (environment determined by API key)
components:
  schemas:
    FiatInAmount:
      type: object
      properties:
        currency:
          type: string
          enum:
            - USD
          description: USD for fiat payments
        value:
          type: string
          description: Amount in cents
      required:
        - currency
        - value
      description: >-
        Input amount restricted to USD currency only (for Wire, ACH, and Rails
        transfers)
      title: FiatInAmount
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
    SimulateInternationalWireInRequest:
      type: object
      properties:
        deposit_account_id:
          type: string
          description: >-
            ID of the deposit account to receive the transfer. Mutually
            exclusive with `account_number` and `routing_number`.
        account_number:
          type: string
          description: >-
            Account number. Must be provided together with `routing_number`.
            Mutually exclusive with `deposit_account_id`.
        routing_number:
          type: string
          description: >-
            9-digit ABA routing number. Must be provided together with
            `account_number`. Mutually exclusive with `deposit_account_id`.
        amount:
          $ref: '#/components/schemas/FiatInAmount'
        originator_name:
          type: string
          description: Name of the originator (sender) on the simulated wire.
        originator_account_number:
          type: string
          description: >-
            Originator's IBAN or bank account number (max 34 characters,
            IBAN-compatible).
        originator_bic:
          type: string
          description: >
            Originator's bank BIC/SWIFT code. Exactly 8 characters (institution
            + country + location) or 11 characters (with the 3-char branch
            suffix). Case-insensitive; normalized to uppercase server-side.
        originator_additional_account_number_data:
          $ref: '#/components/schemas/AdditionalAccountNumberData'
        memo:
          type:
            - string
            - 'null'
          description: >-
            Optional memo to include in the simulated wire transfer (max 140
            characters). Restricted to the SWIFT MT field-allowed character set;
            characters outside this set are rejected by the production wire
            workflow. Use this to test workflows that rely on memo fields for
            reconciliation.
      required:
        - amount
        - originator_name
        - originator_account_number
        - originator_bic
      description: >
        Request to simulate an inbound international wire transfer.


        Exactly one of `deposit_account_id` OR (`account_number` +
        `routing_number`) must be provided. The originator fields synthesize the
        sending bank/account; the simulation get-or-creates a counterparty
        international bank account from these so subsequent counterparty
        list/get calls observe the new sender.
      title: SimulateInternationalWireInRequest
    InternationalWireTransferStatus:
      type: string
      enum:
        - PENDING
        - SETTLED
        - FAILED
        - RETURNED
      description: |
        International wire transfer status:
        - PENDING: Transfer is being processed
        - SETTLED: Transfer has been completed
        - FAILED: Transfer failed
        - RETURNED: Transfer was returned
      title: InternationalWireTransferStatus
    SimulateInboundInternationalWireResponse:
      type: object
      properties:
        international_wire_in_id:
          type: string
          description: >-
            ID of the simulated transfer. Use this directly in `GET
            /international_wire_in/{id}` to read it back.
        deposit_account_id:
          type: string
          description: ID of the deposit account that received the transfer
        amount:
          $ref: '#/components/schemas/FiatInAmount'
        status:
          $ref: '#/components/schemas/InternationalWireTransferStatus'
      required:
        - international_wire_in_id
        - deposit_account_id
        - amount
        - status
      description: >
        Response from simulating an inbound international wire transfer.


        Status returns `PENDING` immediately after creation; settlement is
        asynchronous. Poll `GET
        /international_wire_in/{international_wire_in_id}` for the `SETTLED`
        transition. Idempotent retries reflect the existing row's current status
        — a retry hitting an already-settled row returns `SETTLED`.
      title: SimulateInboundInternationalWireResponse
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

### SIMULATION_simulateInternationalWireIn_example



**Request**

```json
undefined
```

**Response**

```json
{
  "international_wire_in_id": "intl_wire_in_01kasd1tthf1ns1pjn1kncctwd",
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "amount": {
    "currency": "USD",
    "value": "25000"
  },
  "status": "PENDING"
}
```

**SDK Code**

```python SIMULATION_simulateInternationalWireIn_example
import requests

url = "https://api.erebor.bank/simulation/international_wire_in"

headers = {
    "Authorization": "<apiKey>",
    "Content-Type": "application/json"
}

response = requests.post(url, headers=headers)

print(response.json())
```

```javascript SIMULATION_simulateInternationalWireIn_example
const url = 'https://api.erebor.bank/simulation/international_wire_in';
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

```go SIMULATION_simulateInternationalWireIn_example
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/simulation/international_wire_in"

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

```ruby SIMULATION_simulateInternationalWireIn_example
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/simulation/international_wire_in")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Authorization"] = '<apiKey>'
request["Content-Type"] = 'application/json'

response = http.request(request)
puts response.read_body
```

```java SIMULATION_simulateInternationalWireIn_example
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.post("https://api.erebor.bank/simulation/international_wire_in")
  .header("Authorization", "<apiKey>")
  .header("Content-Type", "application/json")
  .asString();
```

```php SIMULATION_simulateInternationalWireIn_example
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://api.erebor.bank/simulation/international_wire_in', [
  'headers' => [
    'Authorization' => '<apiKey>',
    'Content-Type' => 'application/json',
  ],
]);

echo $response->getBody();
```

```csharp SIMULATION_simulateInternationalWireIn_example
using RestSharp;

var client = new RestClient("https://api.erebor.bank/simulation/international_wire_in");
var request = new RestRequest(Method.POST);
request.AddHeader("Authorization", "<apiKey>");
request.AddHeader("Content-Type", "application/json");
IRestResponse response = client.Execute(request);
```

```swift SIMULATION_simulateInternationalWireIn_example
import Foundation

let headers = [
  "Authorization": "<apiKey>",
  "Content-Type": "application/json"
]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/simulation/international_wire_in")! as URL,
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

### Simulate inbound international wire by deposit account ID



**Request**

```json
{
  "amount": {
    "currency": "USD",
    "value": "25000"
  },
  "originator_name": "Acme GmbH",
  "originator_account_number": "DE89370400440532013000",
  "originator_bic": "COBADEFFXXX",
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd"
}
```

**Response**

```json
{
  "international_wire_in_id": "intl_wire_in_01kasd1tthf1ns1pjn1kncctwd",
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "amount": {
    "currency": "USD",
    "value": "25000"
  },
  "status": "PENDING"
}
```

**SDK Code**

```python Simulate inbound international wire by deposit account ID
import requests

url = "https://api.erebor.bank/simulation/international_wire_in"

payload = {
    "amount": {
        "currency": "USD",
        "value": "25000"
    },
    "originator_name": "Acme GmbH",
    "originator_account_number": "DE89370400440532013000",
    "originator_bic": "COBADEFFXXX",
    "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd"
}
headers = {
    "Authorization": "<apiKey>",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.json())
```

```javascript Simulate inbound international wire by deposit account ID
const url = 'https://api.erebor.bank/simulation/international_wire_in';
const options = {
  method: 'POST',
  headers: {Authorization: '<apiKey>', 'Content-Type': 'application/json'},
  body: '{"amount":{"currency":"USD","value":"25000"},"originator_name":"Acme GmbH","originator_account_number":"DE89370400440532013000","originator_bic":"COBADEFFXXX","deposit_account_id":"dep_acct_01kasd1tthf1ns1pjn1kncctwd"}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go Simulate inbound international wire by deposit account ID
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/simulation/international_wire_in"

	payload := strings.NewReader("{\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"25000\"\n  },\n  \"originator_name\": \"Acme GmbH\",\n  \"originator_account_number\": \"DE89370400440532013000\",\n  \"originator_bic\": \"COBADEFFXXX\",\n  \"deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\"\n}")

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

```ruby Simulate inbound international wire by deposit account ID
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/simulation/international_wire_in")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Authorization"] = '<apiKey>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"25000\"\n  },\n  \"originator_name\": \"Acme GmbH\",\n  \"originator_account_number\": \"DE89370400440532013000\",\n  \"originator_bic\": \"COBADEFFXXX\",\n  \"deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\"\n}"

response = http.request(request)
puts response.read_body
```

```java Simulate inbound international wire by deposit account ID
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.post("https://api.erebor.bank/simulation/international_wire_in")
  .header("Authorization", "<apiKey>")
  .header("Content-Type", "application/json")
  .body("{\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"25000\"\n  },\n  \"originator_name\": \"Acme GmbH\",\n  \"originator_account_number\": \"DE89370400440532013000\",\n  \"originator_bic\": \"COBADEFFXXX\",\n  \"deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\"\n}")
  .asString();
```

```php Simulate inbound international wire by deposit account ID
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://api.erebor.bank/simulation/international_wire_in', [
  'body' => '{
  "amount": {
    "currency": "USD",
    "value": "25000"
  },
  "originator_name": "Acme GmbH",
  "originator_account_number": "DE89370400440532013000",
  "originator_bic": "COBADEFFXXX",
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd"
}',
  'headers' => [
    'Authorization' => '<apiKey>',
    'Content-Type' => 'application/json',
  ],
]);

echo $response->getBody();
```

```csharp Simulate inbound international wire by deposit account ID
using RestSharp;

var client = new RestClient("https://api.erebor.bank/simulation/international_wire_in");
var request = new RestRequest(Method.POST);
request.AddHeader("Authorization", "<apiKey>");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"25000\"\n  },\n  \"originator_name\": \"Acme GmbH\",\n  \"originator_account_number\": \"DE89370400440532013000\",\n  \"originator_bic\": \"COBADEFFXXX\",\n  \"deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\"\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift Simulate inbound international wire by deposit account ID
import Foundation

let headers = [
  "Authorization": "<apiKey>",
  "Content-Type": "application/json"
]
let parameters = [
  "amount": [
    "currency": "USD",
    "value": "25000"
  ],
  "originator_name": "Acme GmbH",
  "originator_account_number": "DE89370400440532013000",
  "originator_bic": "COBADEFFXXX",
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd"
] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/simulation/international_wire_in")! as URL,
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

### Simulate inbound international wire by account and routing number



**Request**

```json
{
  "amount": {
    "currency": "USD",
    "value": "25000"
  },
  "originator_name": "Acme GmbH",
  "originator_account_number": "DE89370400440532013000",
  "originator_bic": "COBADEFFXXX",
  "account_number": "123456789",
  "routing_number": "021000021"
}
```

**Response**

```json
{
  "international_wire_in_id": "intl_wire_in_01kasd1tthf1ns1pjn1kncctwd",
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "amount": {
    "currency": "USD",
    "value": "25000"
  },
  "status": "PENDING"
}
```

**SDK Code**

```python Simulate inbound international wire by account and routing number
import requests

url = "https://api.erebor.bank/simulation/international_wire_in"

payload = {
    "amount": {
        "currency": "USD",
        "value": "25000"
    },
    "originator_name": "Acme GmbH",
    "originator_account_number": "DE89370400440532013000",
    "originator_bic": "COBADEFFXXX",
    "account_number": "123456789",
    "routing_number": "021000021"
}
headers = {
    "Authorization": "<apiKey>",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.json())
```

```javascript Simulate inbound international wire by account and routing number
const url = 'https://api.erebor.bank/simulation/international_wire_in';
const options = {
  method: 'POST',
  headers: {Authorization: '<apiKey>', 'Content-Type': 'application/json'},
  body: '{"amount":{"currency":"USD","value":"25000"},"originator_name":"Acme GmbH","originator_account_number":"DE89370400440532013000","originator_bic":"COBADEFFXXX","account_number":"123456789","routing_number":"021000021"}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go Simulate inbound international wire by account and routing number
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/simulation/international_wire_in"

	payload := strings.NewReader("{\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"25000\"\n  },\n  \"originator_name\": \"Acme GmbH\",\n  \"originator_account_number\": \"DE89370400440532013000\",\n  \"originator_bic\": \"COBADEFFXXX\",\n  \"account_number\": \"123456789\",\n  \"routing_number\": \"021000021\"\n}")

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

```ruby Simulate inbound international wire by account and routing number
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/simulation/international_wire_in")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Authorization"] = '<apiKey>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"25000\"\n  },\n  \"originator_name\": \"Acme GmbH\",\n  \"originator_account_number\": \"DE89370400440532013000\",\n  \"originator_bic\": \"COBADEFFXXX\",\n  \"account_number\": \"123456789\",\n  \"routing_number\": \"021000021\"\n}"

response = http.request(request)
puts response.read_body
```

```java Simulate inbound international wire by account and routing number
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.post("https://api.erebor.bank/simulation/international_wire_in")
  .header("Authorization", "<apiKey>")
  .header("Content-Type", "application/json")
  .body("{\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"25000\"\n  },\n  \"originator_name\": \"Acme GmbH\",\n  \"originator_account_number\": \"DE89370400440532013000\",\n  \"originator_bic\": \"COBADEFFXXX\",\n  \"account_number\": \"123456789\",\n  \"routing_number\": \"021000021\"\n}")
  .asString();
```

```php Simulate inbound international wire by account and routing number
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://api.erebor.bank/simulation/international_wire_in', [
  'body' => '{
  "amount": {
    "currency": "USD",
    "value": "25000"
  },
  "originator_name": "Acme GmbH",
  "originator_account_number": "DE89370400440532013000",
  "originator_bic": "COBADEFFXXX",
  "account_number": "123456789",
  "routing_number": "021000021"
}',
  'headers' => [
    'Authorization' => '<apiKey>',
    'Content-Type' => 'application/json',
  ],
]);

echo $response->getBody();
```

```csharp Simulate inbound international wire by account and routing number
using RestSharp;

var client = new RestClient("https://api.erebor.bank/simulation/international_wire_in");
var request = new RestRequest(Method.POST);
request.AddHeader("Authorization", "<apiKey>");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"25000\"\n  },\n  \"originator_name\": \"Acme GmbH\",\n  \"originator_account_number\": \"DE89370400440532013000\",\n  \"originator_bic\": \"COBADEFFXXX\",\n  \"account_number\": \"123456789\",\n  \"routing_number\": \"021000021\"\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift Simulate inbound international wire by account and routing number
import Foundation

let headers = [
  "Authorization": "<apiKey>",
  "Content-Type": "application/json"
]
let parameters = [
  "amount": [
    "currency": "USD",
    "value": "25000"
  ],
  "originator_name": "Acme GmbH",
  "originator_account_number": "DE89370400440532013000",
  "originator_bic": "COBADEFFXXX",
  "account_number": "123456789",
  "routing_number": "021000021"
] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/simulation/international_wire_in")! as URL,
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

### Simulate inbound international wire with memo



**Request**

```json
{
  "amount": {
    "currency": "USD",
    "value": "25000"
  },
  "originator_name": "Acme GmbH",
  "originator_account_number": "DE89370400440532013000",
  "originator_bic": "COBADEFFXXX",
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "memo": "INV-2025-00123 PAYMENT"
}
```

**Response**

```json
{
  "international_wire_in_id": "intl_wire_in_01kasd1tthf1ns1pjn1kncctwd",
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "amount": {
    "currency": "USD",
    "value": "25000"
  },
  "status": "PENDING"
}
```

**SDK Code**

```python Simulate inbound international wire with memo
import requests

url = "https://api.erebor.bank/simulation/international_wire_in"

payload = {
    "amount": {
        "currency": "USD",
        "value": "25000"
    },
    "originator_name": "Acme GmbH",
    "originator_account_number": "DE89370400440532013000",
    "originator_bic": "COBADEFFXXX",
    "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
    "memo": "INV-2025-00123 PAYMENT"
}
headers = {
    "Authorization": "<apiKey>",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.json())
```

```javascript Simulate inbound international wire with memo
const url = 'https://api.erebor.bank/simulation/international_wire_in';
const options = {
  method: 'POST',
  headers: {Authorization: '<apiKey>', 'Content-Type': 'application/json'},
  body: '{"amount":{"currency":"USD","value":"25000"},"originator_name":"Acme GmbH","originator_account_number":"DE89370400440532013000","originator_bic":"COBADEFFXXX","deposit_account_id":"dep_acct_01kasd1tthf1ns1pjn1kncctwd","memo":"INV-2025-00123 PAYMENT"}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go Simulate inbound international wire with memo
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/simulation/international_wire_in"

	payload := strings.NewReader("{\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"25000\"\n  },\n  \"originator_name\": \"Acme GmbH\",\n  \"originator_account_number\": \"DE89370400440532013000\",\n  \"originator_bic\": \"COBADEFFXXX\",\n  \"deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\",\n  \"memo\": \"INV-2025-00123 PAYMENT\"\n}")

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

```ruby Simulate inbound international wire with memo
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/simulation/international_wire_in")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Authorization"] = '<apiKey>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"25000\"\n  },\n  \"originator_name\": \"Acme GmbH\",\n  \"originator_account_number\": \"DE89370400440532013000\",\n  \"originator_bic\": \"COBADEFFXXX\",\n  \"deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\",\n  \"memo\": \"INV-2025-00123 PAYMENT\"\n}"

response = http.request(request)
puts response.read_body
```

```java Simulate inbound international wire with memo
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.post("https://api.erebor.bank/simulation/international_wire_in")
  .header("Authorization", "<apiKey>")
  .header("Content-Type", "application/json")
  .body("{\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"25000\"\n  },\n  \"originator_name\": \"Acme GmbH\",\n  \"originator_account_number\": \"DE89370400440532013000\",\n  \"originator_bic\": \"COBADEFFXXX\",\n  \"deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\",\n  \"memo\": \"INV-2025-00123 PAYMENT\"\n}")
  .asString();
```

```php Simulate inbound international wire with memo
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://api.erebor.bank/simulation/international_wire_in', [
  'body' => '{
  "amount": {
    "currency": "USD",
    "value": "25000"
  },
  "originator_name": "Acme GmbH",
  "originator_account_number": "DE89370400440532013000",
  "originator_bic": "COBADEFFXXX",
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "memo": "INV-2025-00123 PAYMENT"
}',
  'headers' => [
    'Authorization' => '<apiKey>',
    'Content-Type' => 'application/json',
  ],
]);

echo $response->getBody();
```

```csharp Simulate inbound international wire with memo
using RestSharp;

var client = new RestClient("https://api.erebor.bank/simulation/international_wire_in");
var request = new RestRequest(Method.POST);
request.AddHeader("Authorization", "<apiKey>");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"25000\"\n  },\n  \"originator_name\": \"Acme GmbH\",\n  \"originator_account_number\": \"DE89370400440532013000\",\n  \"originator_bic\": \"COBADEFFXXX\",\n  \"deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\",\n  \"memo\": \"INV-2025-00123 PAYMENT\"\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift Simulate inbound international wire with memo
import Foundation

let headers = [
  "Authorization": "<apiKey>",
  "Content-Type": "application/json"
]
let parameters = [
  "amount": [
    "currency": "USD",
    "value": "25000"
  ],
  "originator_name": "Acme GmbH",
  "originator_account_number": "DE89370400440532013000",
  "originator_bic": "COBADEFFXXX",
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "memo": "INV-2025-00123 PAYMENT"
] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/simulation/international_wire_in")! as URL,
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

### Simulate inbound international wire with country-specific originator data



**Request**

```json
{
  "amount": {
    "currency": "USD",
    "value": "25000"
  },
  "originator_name": "Maple Holdings Inc.",
  "originator_account_number": "1234567",
  "originator_bic": "ROYCCAT2XXX",
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "originator_additional_account_number_data": {
    "canada": {
      "institution_number": "003",
      "transit_number": "12345",
      "account_number": "1234567"
    }
  }
}
```

**Response**

```json
{
  "international_wire_in_id": "intl_wire_in_01kasd1tthf1ns1pjn1kncctwd",
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "amount": {
    "currency": "USD",
    "value": "25000"
  },
  "status": "PENDING"
}
```

**SDK Code**

```python Simulate inbound international wire with country-specific originator data
import requests

url = "https://api.erebor.bank/simulation/international_wire_in"

payload = {
    "amount": {
        "currency": "USD",
        "value": "25000"
    },
    "originator_name": "Maple Holdings Inc.",
    "originator_account_number": "1234567",
    "originator_bic": "ROYCCAT2XXX",
    "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
    "originator_additional_account_number_data": { "canada": {
            "institution_number": "003",
            "transit_number": "12345",
            "account_number": "1234567"
        } }
}
headers = {
    "Authorization": "<apiKey>",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.json())
```

```javascript Simulate inbound international wire with country-specific originator data
const url = 'https://api.erebor.bank/simulation/international_wire_in';
const options = {
  method: 'POST',
  headers: {Authorization: '<apiKey>', 'Content-Type': 'application/json'},
  body: '{"amount":{"currency":"USD","value":"25000"},"originator_name":"Maple Holdings Inc.","originator_account_number":"1234567","originator_bic":"ROYCCAT2XXX","deposit_account_id":"dep_acct_01kasd1tthf1ns1pjn1kncctwd","originator_additional_account_number_data":{"canada":{"institution_number":"003","transit_number":"12345","account_number":"1234567"}}}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go Simulate inbound international wire with country-specific originator data
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/simulation/international_wire_in"

	payload := strings.NewReader("{\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"25000\"\n  },\n  \"originator_name\": \"Maple Holdings Inc.\",\n  \"originator_account_number\": \"1234567\",\n  \"originator_bic\": \"ROYCCAT2XXX\",\n  \"deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\",\n  \"originator_additional_account_number_data\": {\n    \"canada\": {\n      \"institution_number\": \"003\",\n      \"transit_number\": \"12345\",\n      \"account_number\": \"1234567\"\n    }\n  }\n}")

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

```ruby Simulate inbound international wire with country-specific originator data
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/simulation/international_wire_in")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Authorization"] = '<apiKey>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"25000\"\n  },\n  \"originator_name\": \"Maple Holdings Inc.\",\n  \"originator_account_number\": \"1234567\",\n  \"originator_bic\": \"ROYCCAT2XXX\",\n  \"deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\",\n  \"originator_additional_account_number_data\": {\n    \"canada\": {\n      \"institution_number\": \"003\",\n      \"transit_number\": \"12345\",\n      \"account_number\": \"1234567\"\n    }\n  }\n}"

response = http.request(request)
puts response.read_body
```

```java Simulate inbound international wire with country-specific originator data
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.post("https://api.erebor.bank/simulation/international_wire_in")
  .header("Authorization", "<apiKey>")
  .header("Content-Type", "application/json")
  .body("{\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"25000\"\n  },\n  \"originator_name\": \"Maple Holdings Inc.\",\n  \"originator_account_number\": \"1234567\",\n  \"originator_bic\": \"ROYCCAT2XXX\",\n  \"deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\",\n  \"originator_additional_account_number_data\": {\n    \"canada\": {\n      \"institution_number\": \"003\",\n      \"transit_number\": \"12345\",\n      \"account_number\": \"1234567\"\n    }\n  }\n}")
  .asString();
```

```php Simulate inbound international wire with country-specific originator data
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://api.erebor.bank/simulation/international_wire_in', [
  'body' => '{
  "amount": {
    "currency": "USD",
    "value": "25000"
  },
  "originator_name": "Maple Holdings Inc.",
  "originator_account_number": "1234567",
  "originator_bic": "ROYCCAT2XXX",
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "originator_additional_account_number_data": {
    "canada": {
      "institution_number": "003",
      "transit_number": "12345",
      "account_number": "1234567"
    }
  }
}',
  'headers' => [
    'Authorization' => '<apiKey>',
    'Content-Type' => 'application/json',
  ],
]);

echo $response->getBody();
```

```csharp Simulate inbound international wire with country-specific originator data
using RestSharp;

var client = new RestClient("https://api.erebor.bank/simulation/international_wire_in");
var request = new RestRequest(Method.POST);
request.AddHeader("Authorization", "<apiKey>");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"25000\"\n  },\n  \"originator_name\": \"Maple Holdings Inc.\",\n  \"originator_account_number\": \"1234567\",\n  \"originator_bic\": \"ROYCCAT2XXX\",\n  \"deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\",\n  \"originator_additional_account_number_data\": {\n    \"canada\": {\n      \"institution_number\": \"003\",\n      \"transit_number\": \"12345\",\n      \"account_number\": \"1234567\"\n    }\n  }\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift Simulate inbound international wire with country-specific originator data
import Foundation

let headers = [
  "Authorization": "<apiKey>",
  "Content-Type": "application/json"
]
let parameters = [
  "amount": [
    "currency": "USD",
    "value": "25000"
  ],
  "originator_name": "Maple Holdings Inc.",
  "originator_account_number": "1234567",
  "originator_bic": "ROYCCAT2XXX",
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "originator_additional_account_number_data": ["canada": [
      "institution_number": "003",
      "transit_number": "12345",
      "account_number": "1234567"
    ]]
] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/simulation/international_wire_in")! as URL,
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