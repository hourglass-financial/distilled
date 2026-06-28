> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Simulate Inbound ACH Transfer

POST https://api.erebor.bank/simulation/ach_in
Content-Type: application/json

Simulate an inbound ACH transfer for testing purposes. This endpoint is only available in the sandbox environment.

Creates a new inbound ACH transfer that will be processed as if it was received via the ACH network. You can identify the destination account using either a `deposit_account_id` or an `account_number` + `routing_number` pair — provide exactly one.


Reference: https://docs.erebor.bank/api-reference/simulation/simulation-endpoints/simulate-ach-in

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /simulation/ach_in:
    post:
      operationId: simulate-ach-in
      summary: Simulate Inbound ACH Transfer
      description: >
        Simulate an inbound ACH transfer for testing purposes. This endpoint is
        only available in the sandbox environment.


        Creates a new inbound ACH transfer that will be processed as if it was
        received via the ACH network. You can identify the destination account
        using either a `deposit_account_id` or an `account_number` +
        `routing_number` pair — provide exactly one.
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
          description: Inbound ACH transfer simulated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SimulateInboundAchResponse'
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
              $ref: '#/components/schemas/SimulateACHInRequest'
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
    AddendaEntry:
      type: string
      description: >-
        ACH addenda record containing remittance information passed through to
        the recipient (max 80 characters). Must use NACHA-allowed characters
        only.
      title: AddendaEntry
    SimulateACHInRequest:
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
        addenda:
          type:
            - array
            - 'null'
          items:
            $ref: '#/components/schemas/AddendaEntry'
          description: >-
            Optional addenda records to include in the simulated ACH transfer
            (max 80 characters each). Note that only one entry is allowed; reach
            out to support if you'd like to supply multiple. Use this to test
            workflows that rely on addenda for reconciliation.
      required:
        - amount
      description: >
        Request to simulate an inbound ACH transfer.


        Exactly one of `deposit_account_id` OR (`account_number` +
        `routing_number`) must be provided.
      title: SimulateACHInRequest
    SimulateInboundAchResponse:
      type: object
      properties:
        deposit_account_id:
          type: string
          description: ID of the deposit account that received the transfer
        amount:
          $ref: '#/components/schemas/FiatInAmount'
      required:
        - deposit_account_id
        - amount
      description: Response from simulating an inbound ACH transfer
      title: SimulateInboundAchResponse
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

### SIMULATION_simulateACHIn_example



**Request**

```json
undefined
```

**Response**

```json
{
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "amount": {
    "currency": "USD",
    "value": "1000000"
  }
}
```

**SDK Code**

```python SIMULATION_simulateACHIn_example
import requests

url = "https://api.erebor.bank/simulation/ach_in"

headers = {
    "Authorization": "<apiKey>",
    "Content-Type": "application/json"
}

response = requests.post(url, headers=headers)

print(response.json())
```

```javascript SIMULATION_simulateACHIn_example
const url = 'https://api.erebor.bank/simulation/ach_in';
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

```go SIMULATION_simulateACHIn_example
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/simulation/ach_in"

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

```ruby SIMULATION_simulateACHIn_example
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/simulation/ach_in")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Authorization"] = '<apiKey>'
request["Content-Type"] = 'application/json'

response = http.request(request)
puts response.read_body
```

```java SIMULATION_simulateACHIn_example
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.post("https://api.erebor.bank/simulation/ach_in")
  .header("Authorization", "<apiKey>")
  .header("Content-Type", "application/json")
  .asString();
```

```php SIMULATION_simulateACHIn_example
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://api.erebor.bank/simulation/ach_in', [
  'headers' => [
    'Authorization' => '<apiKey>',
    'Content-Type' => 'application/json',
  ],
]);

echo $response->getBody();
```

```csharp SIMULATION_simulateACHIn_example
using RestSharp;

var client = new RestClient("https://api.erebor.bank/simulation/ach_in");
var request = new RestRequest(Method.POST);
request.AddHeader("Authorization", "<apiKey>");
request.AddHeader("Content-Type", "application/json");
IRestResponse response = client.Execute(request);
```

```swift SIMULATION_simulateACHIn_example
import Foundation

let headers = [
  "Authorization": "<apiKey>",
  "Content-Type": "application/json"
]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/simulation/ach_in")! as URL,
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

### Simulate inbound ACH by deposit account ID



**Request**

```json
{
  "amount": {
    "currency": "USD",
    "value": "25000"
  },
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd"
}
```

**Response**

```json
{
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "amount": {
    "currency": "USD",
    "value": "1000000"
  }
}
```

**SDK Code**

```python Simulate inbound ACH by deposit account ID
import requests

url = "https://api.erebor.bank/simulation/ach_in"

payload = {
    "amount": {
        "currency": "USD",
        "value": "25000"
    },
    "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd"
}
headers = {
    "Authorization": "<apiKey>",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.json())
```

```javascript Simulate inbound ACH by deposit account ID
const url = 'https://api.erebor.bank/simulation/ach_in';
const options = {
  method: 'POST',
  headers: {Authorization: '<apiKey>', 'Content-Type': 'application/json'},
  body: '{"amount":{"currency":"USD","value":"25000"},"deposit_account_id":"dep_acct_01kasd1tthf1ns1pjn1kncctwd"}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go Simulate inbound ACH by deposit account ID
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/simulation/ach_in"

	payload := strings.NewReader("{\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"25000\"\n  },\n  \"deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\"\n}")

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

```ruby Simulate inbound ACH by deposit account ID
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/simulation/ach_in")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Authorization"] = '<apiKey>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"25000\"\n  },\n  \"deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\"\n}"

response = http.request(request)
puts response.read_body
```

```java Simulate inbound ACH by deposit account ID
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.post("https://api.erebor.bank/simulation/ach_in")
  .header("Authorization", "<apiKey>")
  .header("Content-Type", "application/json")
  .body("{\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"25000\"\n  },\n  \"deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\"\n}")
  .asString();
```

```php Simulate inbound ACH by deposit account ID
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://api.erebor.bank/simulation/ach_in', [
  'body' => '{
  "amount": {
    "currency": "USD",
    "value": "25000"
  },
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd"
}',
  'headers' => [
    'Authorization' => '<apiKey>',
    'Content-Type' => 'application/json',
  ],
]);

echo $response->getBody();
```

```csharp Simulate inbound ACH by deposit account ID
using RestSharp;

var client = new RestClient("https://api.erebor.bank/simulation/ach_in");
var request = new RestRequest(Method.POST);
request.AddHeader("Authorization", "<apiKey>");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"25000\"\n  },\n  \"deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\"\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift Simulate inbound ACH by deposit account ID
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
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd"
] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/simulation/ach_in")! as URL,
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

### Simulate inbound ACH by account and routing number



**Request**

```json
{
  "amount": {
    "currency": "USD",
    "value": "25000"
  },
  "account_number": "123456789",
  "routing_number": "021000021"
}
```

**Response**

```json
{
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "amount": {
    "currency": "USD",
    "value": "1000000"
  }
}
```

**SDK Code**

```python Simulate inbound ACH by account and routing number
import requests

url = "https://api.erebor.bank/simulation/ach_in"

payload = {
    "amount": {
        "currency": "USD",
        "value": "25000"
    },
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

```javascript Simulate inbound ACH by account and routing number
const url = 'https://api.erebor.bank/simulation/ach_in';
const options = {
  method: 'POST',
  headers: {Authorization: '<apiKey>', 'Content-Type': 'application/json'},
  body: '{"amount":{"currency":"USD","value":"25000"},"account_number":"123456789","routing_number":"021000021"}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go Simulate inbound ACH by account and routing number
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/simulation/ach_in"

	payload := strings.NewReader("{\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"25000\"\n  },\n  \"account_number\": \"123456789\",\n  \"routing_number\": \"021000021\"\n}")

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

```ruby Simulate inbound ACH by account and routing number
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/simulation/ach_in")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Authorization"] = '<apiKey>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"25000\"\n  },\n  \"account_number\": \"123456789\",\n  \"routing_number\": \"021000021\"\n}"

response = http.request(request)
puts response.read_body
```

```java Simulate inbound ACH by account and routing number
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.post("https://api.erebor.bank/simulation/ach_in")
  .header("Authorization", "<apiKey>")
  .header("Content-Type", "application/json")
  .body("{\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"25000\"\n  },\n  \"account_number\": \"123456789\",\n  \"routing_number\": \"021000021\"\n}")
  .asString();
```

```php Simulate inbound ACH by account and routing number
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://api.erebor.bank/simulation/ach_in', [
  'body' => '{
  "amount": {
    "currency": "USD",
    "value": "25000"
  },
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

```csharp Simulate inbound ACH by account and routing number
using RestSharp;

var client = new RestClient("https://api.erebor.bank/simulation/ach_in");
var request = new RestRequest(Method.POST);
request.AddHeader("Authorization", "<apiKey>");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"25000\"\n  },\n  \"account_number\": \"123456789\",\n  \"routing_number\": \"021000021\"\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift Simulate inbound ACH by account and routing number
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
  "account_number": "123456789",
  "routing_number": "021000021"
] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/simulation/ach_in")! as URL,
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

### Simulate inbound ACH transfer with addenda



**Request**

```json
{
  "amount": {
    "currency": "USD",
    "value": "25000"
  },
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "addenda": [
    "REF:UID-2025-00123 PAYMENT FOR SERVICES"
  ]
}
```

**Response**

```json
{
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "amount": {
    "currency": "USD",
    "value": "1000000"
  }
}
```

**SDK Code**

```python Simulate inbound ACH transfer with addenda
import requests

url = "https://api.erebor.bank/simulation/ach_in"

payload = {
    "amount": {
        "currency": "USD",
        "value": "25000"
    },
    "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
    "addenda": ["REF:UID-2025-00123 PAYMENT FOR SERVICES"]
}
headers = {
    "Authorization": "<apiKey>",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.json())
```

```javascript Simulate inbound ACH transfer with addenda
const url = 'https://api.erebor.bank/simulation/ach_in';
const options = {
  method: 'POST',
  headers: {Authorization: '<apiKey>', 'Content-Type': 'application/json'},
  body: '{"amount":{"currency":"USD","value":"25000"},"deposit_account_id":"dep_acct_01kasd1tthf1ns1pjn1kncctwd","addenda":["REF:UID-2025-00123 PAYMENT FOR SERVICES"]}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go Simulate inbound ACH transfer with addenda
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/simulation/ach_in"

	payload := strings.NewReader("{\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"25000\"\n  },\n  \"deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\",\n  \"addenda\": [\n    \"REF:UID-2025-00123 PAYMENT FOR SERVICES\"\n  ]\n}")

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

```ruby Simulate inbound ACH transfer with addenda
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/simulation/ach_in")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Authorization"] = '<apiKey>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"25000\"\n  },\n  \"deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\",\n  \"addenda\": [\n    \"REF:UID-2025-00123 PAYMENT FOR SERVICES\"\n  ]\n}"

response = http.request(request)
puts response.read_body
```

```java Simulate inbound ACH transfer with addenda
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.post("https://api.erebor.bank/simulation/ach_in")
  .header("Authorization", "<apiKey>")
  .header("Content-Type", "application/json")
  .body("{\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"25000\"\n  },\n  \"deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\",\n  \"addenda\": [\n    \"REF:UID-2025-00123 PAYMENT FOR SERVICES\"\n  ]\n}")
  .asString();
```

```php Simulate inbound ACH transfer with addenda
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://api.erebor.bank/simulation/ach_in', [
  'body' => '{
  "amount": {
    "currency": "USD",
    "value": "25000"
  },
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "addenda": [
    "REF:UID-2025-00123 PAYMENT FOR SERVICES"
  ]
}',
  'headers' => [
    'Authorization' => '<apiKey>',
    'Content-Type' => 'application/json',
  ],
]);

echo $response->getBody();
```

```csharp Simulate inbound ACH transfer with addenda
using RestSharp;

var client = new RestClient("https://api.erebor.bank/simulation/ach_in");
var request = new RestRequest(Method.POST);
request.AddHeader("Authorization", "<apiKey>");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"25000\"\n  },\n  \"deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\",\n  \"addenda\": [\n    \"REF:UID-2025-00123 PAYMENT FOR SERVICES\"\n  ]\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift Simulate inbound ACH transfer with addenda
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
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "addenda": ["REF:UID-2025-00123 PAYMENT FOR SERVICES"]
] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/simulation/ach_in")! as URL,
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