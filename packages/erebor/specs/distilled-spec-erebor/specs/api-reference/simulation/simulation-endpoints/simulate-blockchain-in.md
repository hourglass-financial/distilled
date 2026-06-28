> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Simulate Inbound Blockchain Transfer

POST https://api.erebor.bank/simulation/blockchain_in
Content-Type: application/json

Simulate an inbound blockchain transfer for testing purposes. This endpoint is only available in the sandbox environment.

Creates a new inbound blockchain transfer that will be processed as if it was received on-chain.


Reference: https://docs.erebor.bank/api-reference/simulation/simulation-endpoints/simulate-blockchain-in

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /simulation/blockchain_in:
    post:
      operationId: simulate-blockchain-in
      summary: Simulate Inbound Blockchain Transfer
      description: >
        Simulate an inbound blockchain transfer for testing purposes. This
        endpoint is only available in the sandbox environment.


        Creates a new inbound blockchain transfer that will be processed as if
        it was received on-chain.
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
          description: Inbound blockchain transfer simulated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SimulateInboundBlockchainResponse'
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
              $ref: '#/components/schemas/SimulateBlockchainInRequest'
servers:
  - url: https://api.erebor.bank
    description: API server (environment determined by API key)
components:
  schemas:
    CryptoInAmountCurrency:
      type: string
      enum:
        - USAT
        - USDC
        - USDT
      description: Currency code
      title: CryptoInAmountCurrency
    CryptoInAmount:
      type: object
      properties:
        currency:
          $ref: '#/components/schemas/CryptoInAmountCurrency'
          description: Currency code
        value:
          type: string
          description: Stablecoin amount in cents
      required:
        - currency
        - value
      description: Input amount for blockchain transfers (USDC, USAT, or USDT)
      title: CryptoInAmount
    BlockchainNetwork:
      type: string
      enum:
        - BASE
        - ETHEREUM
        - INK
        - SOLANA
        - SUI
      description: Supported blockchain networks
      title: BlockchainNetwork
    SimulateBlockchainInRequest:
      type: object
      properties:
        deposit_account_id:
          type: string
          description: ID of the deposit account to receive the transfer
        amount:
          $ref: '#/components/schemas/CryptoInAmount'
          description: Amount in cents. Must be a positive number not exceeding 100000.
        network:
          $ref: '#/components/schemas/BlockchainNetwork'
      required:
        - deposit_account_id
        - amount
        - network
      description: Request to simulate an inbound blockchain transfer
      title: SimulateBlockchainInRequest
    SimulateInboundBlockchainResponse:
      type: object
      properties:
        deposit_account_id:
          type: string
          description: ID of the deposit account that received the transfer
        amount:
          $ref: '#/components/schemas/CryptoInAmount'
        transaction_hash:
          type: string
          description: The blockchain transaction hash
      required:
        - deposit_account_id
        - amount
        - transaction_hash
      description: Response from simulating an inbound blockchain transfer
      title: SimulateInboundBlockchainResponse
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

### SIMULATION_simulateBlockchainIn_example



**Request**

```json
undefined
```

**Response**

```json
{
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "amount": {
    "currency": "USAT",
    "value": "1000000"
  },
  "transaction_hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
}
```

**SDK Code**

```python SIMULATION_simulateBlockchainIn_example
import requests

url = "https://api.erebor.bank/simulation/blockchain_in"

headers = {
    "Authorization": "<apiKey>",
    "Content-Type": "application/json"
}

response = requests.post(url, headers=headers)

print(response.json())
```

```javascript SIMULATION_simulateBlockchainIn_example
const url = 'https://api.erebor.bank/simulation/blockchain_in';
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

```go SIMULATION_simulateBlockchainIn_example
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/simulation/blockchain_in"

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

```ruby SIMULATION_simulateBlockchainIn_example
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/simulation/blockchain_in")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Authorization"] = '<apiKey>'
request["Content-Type"] = 'application/json'

response = http.request(request)
puts response.read_body
```

```java SIMULATION_simulateBlockchainIn_example
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.post("https://api.erebor.bank/simulation/blockchain_in")
  .header("Authorization", "<apiKey>")
  .header("Content-Type", "application/json")
  .asString();
```

```php SIMULATION_simulateBlockchainIn_example
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://api.erebor.bank/simulation/blockchain_in', [
  'headers' => [
    'Authorization' => '<apiKey>',
    'Content-Type' => 'application/json',
  ],
]);

echo $response->getBody();
```

```csharp SIMULATION_simulateBlockchainIn_example
using RestSharp;

var client = new RestClient("https://api.erebor.bank/simulation/blockchain_in");
var request = new RestRequest(Method.POST);
request.AddHeader("Authorization", "<apiKey>");
request.AddHeader("Content-Type", "application/json");
IRestResponse response = client.Execute(request);
```

```swift SIMULATION_simulateBlockchainIn_example
import Foundation

let headers = [
  "Authorization": "<apiKey>",
  "Content-Type": "application/json"
]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/simulation/blockchain_in")! as URL,
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

### Simulate inbound blockchain transfer



**Request**

```json
{
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "amount": {
    "currency": "USDC",
    "value": "100000"
  },
  "network": "BASE"
}
```

**Response**

```json
{
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "amount": {
    "currency": "USAT",
    "value": "1000000"
  },
  "transaction_hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
}
```

**SDK Code**

```python Simulate inbound blockchain transfer
import requests

url = "https://api.erebor.bank/simulation/blockchain_in"

payload = {
    "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
    "amount": {
        "currency": "USDC",
        "value": "100000"
    },
    "network": "BASE"
}
headers = {
    "Authorization": "<apiKey>",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.json())
```

```javascript Simulate inbound blockchain transfer
const url = 'https://api.erebor.bank/simulation/blockchain_in';
const options = {
  method: 'POST',
  headers: {Authorization: '<apiKey>', 'Content-Type': 'application/json'},
  body: '{"deposit_account_id":"dep_acct_01kasd1tthf1ns1pjn1kncctwd","amount":{"currency":"USDC","value":"100000"},"network":"BASE"}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go Simulate inbound blockchain transfer
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/simulation/blockchain_in"

	payload := strings.NewReader("{\n  \"deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\",\n  \"amount\": {\n    \"currency\": \"USDC\",\n    \"value\": \"100000\"\n  },\n  \"network\": \"BASE\"\n}")

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

```ruby Simulate inbound blockchain transfer
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/simulation/blockchain_in")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Authorization"] = '<apiKey>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\",\n  \"amount\": {\n    \"currency\": \"USDC\",\n    \"value\": \"100000\"\n  },\n  \"network\": \"BASE\"\n}"

response = http.request(request)
puts response.read_body
```

```java Simulate inbound blockchain transfer
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.post("https://api.erebor.bank/simulation/blockchain_in")
  .header("Authorization", "<apiKey>")
  .header("Content-Type", "application/json")
  .body("{\n  \"deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\",\n  \"amount\": {\n    \"currency\": \"USDC\",\n    \"value\": \"100000\"\n  },\n  \"network\": \"BASE\"\n}")
  .asString();
```

```php Simulate inbound blockchain transfer
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://api.erebor.bank/simulation/blockchain_in', [
  'body' => '{
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "amount": {
    "currency": "USDC",
    "value": "100000"
  },
  "network": "BASE"
}',
  'headers' => [
    'Authorization' => '<apiKey>',
    'Content-Type' => 'application/json',
  ],
]);

echo $response->getBody();
```

```csharp Simulate inbound blockchain transfer
using RestSharp;

var client = new RestClient("https://api.erebor.bank/simulation/blockchain_in");
var request = new RestRequest(Method.POST);
request.AddHeader("Authorization", "<apiKey>");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\",\n  \"amount\": {\n    \"currency\": \"USDC\",\n    \"value\": \"100000\"\n  },\n  \"network\": \"BASE\"\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift Simulate inbound blockchain transfer
import Foundation

let headers = [
  "Authorization": "<apiKey>",
  "Content-Type": "application/json"
]
let parameters = [
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "amount": [
    "currency": "USDC",
    "value": "100000"
  ],
  "network": "BASE"
] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/simulation/blockchain_in")! as URL,
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