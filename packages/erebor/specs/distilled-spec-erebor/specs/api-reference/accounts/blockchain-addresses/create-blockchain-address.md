> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Create Blockchain Address

POST https://api.erebor.bank/blockchain_addresses
Content-Type: application/json

Create a new Blockchain Address for a Deposit Account

Reference: https://docs.erebor.bank/api-reference/accounts/blockchain-addresses/create-blockchain-address

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /blockchain_addresses:
    post:
      operationId: create-blockchain-address
      summary: Create Blockchain Address
      description: Create a new Blockchain Address for a Deposit Account
      tags:
        - subpackage_blockchainAddresses
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
          description: Blockchain address created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BlockchainAddress'
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
              $ref: '#/components/schemas/CreateBlockchainAddressRequest'
servers:
  - url: https://api.erebor.bank
    description: API server (environment determined by API key)
components:
  schemas:
    AddressType:
      type: string
      enum:
        - ETHEREUM
        - SOLANA
        - SUI
      description: >
        High-level address family for creation. `ETHEREUM` provisions wallets
        across configured EVM networks

        (e.g. Ethereum, Base). `SOLANA` and `SUI` target a single-network
        family.
      title: AddressType
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
    CreateBlockchainAddressRequest:
      type: object
      properties:
        deposit_account_id:
          type: string
          description: Deposit account that will own the new custodial address resource.
        address_type:
          $ref: '#/components/schemas/AddressType'
        name:
          type:
            - string
            - 'null'
        custom_ref:
          $ref: '#/components/schemas/CustomRef'
        custom_fields:
          $ref: '#/components/schemas/CustomFields'
      required:
        - deposit_account_id
        - address_type
      title: CreateBlockchainAddressRequest
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
    BlockchainAddress:
      type: object
      properties:
        id:
          type: string
          description: >-
            Unique identifier for the blockchain address, prefixed with
            `bc_addr_`.
        type:
          type: string
          enum:
            - BLOCKCHAIN_ADDRESS
          description: Object type. Always `BLOCKCHAIN_ADDRESS`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this blockchain address.
        created_at:
          type: string
          format: date-time
          description: >-
            Timestamp of when the blockchain address was created, in ISO 8601
            format.
        updated_at:
          type: string
          format: date-time
          description: >-
            Timestamp of when the blockchain address was last updated, in ISO
            8601 format.
        archived_at:
          type:
            - string
            - 'null'
          format: date-time
        deposit_account_id:
          type: string
          description: >-
            ID of the deposit account this blockchain address belongs to,
            prefixed with `dep_acct_`.
        name:
          type:
            - string
            - 'null'
          description: Human-readable name for this blockchain address.
        address:
          type: string
          description: >
            On-chain address string. EVM chains use `0x` + 40 hex (checksummed
            mixed case is common in APIs).

            Solana uses base58. Sui uses `0x` + 64 hex.
        address_type:
          $ref: '#/components/schemas/AddressType'
        network:
          type: array
          items:
            $ref: '#/components/schemas/BlockchainNetwork'
          description: >
            Blockchain networks where this custodial address is active. For EVM,
            one logical address is often

            reused on multiple networks (e.g. Ethereum mainnet and Base); each
            network is listed separately.
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
        - deposit_account_id
        - address
        - address_type
        - network
      title: BlockchainAddress
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

### New EVM family address (reused across configured networks)



**Request**

```json
undefined
```

**Response**

```json
{
  "id": "bc_addr_01kasd1tthf1ns1pjn1kncctwg",
  "type": "BLOCKCHAIN_ADDRESS",
  "url": "https://api.erebor.bank/blockchain_addresses/bc_addr_01kasd1tthf1ns1pjn1kncctwg",
  "created_at": "2026-04-06T16:18:42Z",
  "updated_at": "2026-04-06T16:18:42Z",
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "address": "0xf977814e90dA44bFA03b6295A0616a897441aceC",
  "address_type": "ETHEREUM",
  "network": [
    "ETHEREUM",
    "BASE",
    "INK"
  ],
  "archived_at": null,
  "name": "Q1 settlement — EVM",
  "custom_ref": "WALLET-2025-001",
  "custom_fields": {
    "purpose": "treasury",
    "network_tag": "evm-l2"
  }
}
```

**SDK Code**

```python New EVM family address (reused across configured networks)
import requests

url = "https://api.erebor.bank/blockchain_addresses"

headers = {
    "Authorization": "<apiKey>",
    "Content-Type": "application/json"
}

response = requests.post(url, headers=headers)

print(response.json())
```

```javascript New EVM family address (reused across configured networks)
const url = 'https://api.erebor.bank/blockchain_addresses';
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

```go New EVM family address (reused across configured networks)
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/blockchain_addresses"

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

```ruby New EVM family address (reused across configured networks)
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/blockchain_addresses")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Authorization"] = '<apiKey>'
request["Content-Type"] = 'application/json'

response = http.request(request)
puts response.read_body
```

```java New EVM family address (reused across configured networks)
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.post("https://api.erebor.bank/blockchain_addresses")
  .header("Authorization", "<apiKey>")
  .header("Content-Type", "application/json")
  .asString();
```

```php New EVM family address (reused across configured networks)
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://api.erebor.bank/blockchain_addresses', [
  'headers' => [
    'Authorization' => '<apiKey>',
    'Content-Type' => 'application/json',
  ],
]);

echo $response->getBody();
```

```csharp New EVM family address (reused across configured networks)
using RestSharp;

var client = new RestClient("https://api.erebor.bank/blockchain_addresses");
var request = new RestRequest(Method.POST);
request.AddHeader("Authorization", "<apiKey>");
request.AddHeader("Content-Type", "application/json");
IRestResponse response = client.Execute(request);
```

```swift New EVM family address (reused across configured networks)
import Foundation

let headers = [
  "Authorization": "<apiKey>",
  "Content-Type": "application/json"
]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/blockchain_addresses")! as URL,
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

### Provision EVM deposit wallets (multi-network)



**Request**

```json
{
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "address_type": "ETHEREUM",
  "name": "Q1 settlement — EVM",
  "custom_ref": "WALLET-2025-001",
  "custom_fields": {
    "purpose": "treasury",
    "network_tag": "evm-l2"
  }
}
```

**Response**

```json
{
  "id": "bc_addr_01kasd1tthf1ns1pjn1kncctwg",
  "type": "BLOCKCHAIN_ADDRESS",
  "url": "https://api.erebor.bank/blockchain_addresses/bc_addr_01kasd1tthf1ns1pjn1kncctwg",
  "created_at": "2026-04-06T16:18:42Z",
  "updated_at": "2026-04-06T16:18:42Z",
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "address": "0xf977814e90dA44bFA03b6295A0616a897441aceC",
  "address_type": "ETHEREUM",
  "network": [
    "ETHEREUM",
    "BASE",
    "INK"
  ],
  "archived_at": null,
  "name": "Q1 settlement — EVM",
  "custom_ref": "WALLET-2025-001",
  "custom_fields": {
    "purpose": "treasury",
    "network_tag": "evm-l2"
  }
}
```

**SDK Code**

```python Provision EVM deposit wallets (multi-network)
import requests

url = "https://api.erebor.bank/blockchain_addresses"

payload = {
    "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
    "address_type": "ETHEREUM",
    "name": "Q1 settlement — EVM",
    "custom_ref": "WALLET-2025-001",
    "custom_fields": {
        "purpose": "treasury",
        "network_tag": "evm-l2"
    }
}
headers = {
    "Authorization": "<apiKey>",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.json())
```

```javascript Provision EVM deposit wallets (multi-network)
const url = 'https://api.erebor.bank/blockchain_addresses';
const options = {
  method: 'POST',
  headers: {Authorization: '<apiKey>', 'Content-Type': 'application/json'},
  body: '{"deposit_account_id":"dep_acct_01kasd1tthf1ns1pjn1kncctwd","address_type":"ETHEREUM","name":"Q1 settlement — EVM","custom_ref":"WALLET-2025-001","custom_fields":{"purpose":"treasury","network_tag":"evm-l2"}}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go Provision EVM deposit wallets (multi-network)
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/blockchain_addresses"

	payload := strings.NewReader("{\n  \"deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\",\n  \"address_type\": \"ETHEREUM\",\n  \"name\": \"Q1 settlement — EVM\",\n  \"custom_ref\": \"WALLET-2025-001\",\n  \"custom_fields\": {\n    \"purpose\": \"treasury\",\n    \"network_tag\": \"evm-l2\"\n  }\n}")

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

```ruby Provision EVM deposit wallets (multi-network)
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/blockchain_addresses")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Authorization"] = '<apiKey>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\",\n  \"address_type\": \"ETHEREUM\",\n  \"name\": \"Q1 settlement — EVM\",\n  \"custom_ref\": \"WALLET-2025-001\",\n  \"custom_fields\": {\n    \"purpose\": \"treasury\",\n    \"network_tag\": \"evm-l2\"\n  }\n}"

response = http.request(request)
puts response.read_body
```

```java Provision EVM deposit wallets (multi-network)
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.post("https://api.erebor.bank/blockchain_addresses")
  .header("Authorization", "<apiKey>")
  .header("Content-Type", "application/json")
  .body("{\n  \"deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\",\n  \"address_type\": \"ETHEREUM\",\n  \"name\": \"Q1 settlement — EVM\",\n  \"custom_ref\": \"WALLET-2025-001\",\n  \"custom_fields\": {\n    \"purpose\": \"treasury\",\n    \"network_tag\": \"evm-l2\"\n  }\n}")
  .asString();
```

```php Provision EVM deposit wallets (multi-network)
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://api.erebor.bank/blockchain_addresses', [
  'body' => '{
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "address_type": "ETHEREUM",
  "name": "Q1 settlement — EVM",
  "custom_ref": "WALLET-2025-001",
  "custom_fields": {
    "purpose": "treasury",
    "network_tag": "evm-l2"
  }
}',
  'headers' => [
    'Authorization' => '<apiKey>',
    'Content-Type' => 'application/json',
  ],
]);

echo $response->getBody();
```

```csharp Provision EVM deposit wallets (multi-network)
using RestSharp;

var client = new RestClient("https://api.erebor.bank/blockchain_addresses");
var request = new RestRequest(Method.POST);
request.AddHeader("Authorization", "<apiKey>");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\",\n  \"address_type\": \"ETHEREUM\",\n  \"name\": \"Q1 settlement — EVM\",\n  \"custom_ref\": \"WALLET-2025-001\",\n  \"custom_fields\": {\n    \"purpose\": \"treasury\",\n    \"network_tag\": \"evm-l2\"\n  }\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift Provision EVM deposit wallets (multi-network)
import Foundation

let headers = [
  "Authorization": "<apiKey>",
  "Content-Type": "application/json"
]
let parameters = [
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "address_type": "ETHEREUM",
  "name": "Q1 settlement — EVM",
  "custom_ref": "WALLET-2025-001",
  "custom_fields": [
    "purpose": "treasury",
    "network_tag": "evm-l2"
  ]
] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/blockchain_addresses")! as URL,
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

### Provision Solana deposit wallet



**Request**

```json
{
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "address_type": "SOLANA",
  "name": "Payroll hot wallet",
  "custom_ref": "WALLET-2025-001",
  "custom_fields": {
    "purpose": "treasury",
    "network_tag": "evm-l2"
  }
}
```

**Response**

```json
{
  "id": "bc_addr_01kasd1tthf1ns1pjn1kncctwg",
  "type": "BLOCKCHAIN_ADDRESS",
  "url": "https://api.erebor.bank/blockchain_addresses/bc_addr_01kasd1tthf1ns1pjn1kncctwg",
  "created_at": "2026-04-06T16:18:42Z",
  "updated_at": "2026-04-06T16:18:42Z",
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "address": "0xf977814e90dA44bFA03b6295A0616a897441aceC",
  "address_type": "ETHEREUM",
  "network": [
    "ETHEREUM",
    "BASE",
    "INK"
  ],
  "archived_at": null,
  "name": "Q1 settlement — EVM",
  "custom_ref": "WALLET-2025-001",
  "custom_fields": {
    "purpose": "treasury",
    "network_tag": "evm-l2"
  }
}
```

**SDK Code**

```python Provision Solana deposit wallet
import requests

url = "https://api.erebor.bank/blockchain_addresses"

payload = {
    "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
    "address_type": "SOLANA",
    "name": "Payroll hot wallet",
    "custom_ref": "WALLET-2025-001",
    "custom_fields": {
        "purpose": "treasury",
        "network_tag": "evm-l2"
    }
}
headers = {
    "Authorization": "<apiKey>",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.json())
```

```javascript Provision Solana deposit wallet
const url = 'https://api.erebor.bank/blockchain_addresses';
const options = {
  method: 'POST',
  headers: {Authorization: '<apiKey>', 'Content-Type': 'application/json'},
  body: '{"deposit_account_id":"dep_acct_01kasd1tthf1ns1pjn1kncctwd","address_type":"SOLANA","name":"Payroll hot wallet","custom_ref":"WALLET-2025-001","custom_fields":{"purpose":"treasury","network_tag":"evm-l2"}}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go Provision Solana deposit wallet
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/blockchain_addresses"

	payload := strings.NewReader("{\n  \"deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\",\n  \"address_type\": \"SOLANA\",\n  \"name\": \"Payroll hot wallet\",\n  \"custom_ref\": \"WALLET-2025-001\",\n  \"custom_fields\": {\n    \"purpose\": \"treasury\",\n    \"network_tag\": \"evm-l2\"\n  }\n}")

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

```ruby Provision Solana deposit wallet
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/blockchain_addresses")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Authorization"] = '<apiKey>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\",\n  \"address_type\": \"SOLANA\",\n  \"name\": \"Payroll hot wallet\",\n  \"custom_ref\": \"WALLET-2025-001\",\n  \"custom_fields\": {\n    \"purpose\": \"treasury\",\n    \"network_tag\": \"evm-l2\"\n  }\n}"

response = http.request(request)
puts response.read_body
```

```java Provision Solana deposit wallet
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.post("https://api.erebor.bank/blockchain_addresses")
  .header("Authorization", "<apiKey>")
  .header("Content-Type", "application/json")
  .body("{\n  \"deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\",\n  \"address_type\": \"SOLANA\",\n  \"name\": \"Payroll hot wallet\",\n  \"custom_ref\": \"WALLET-2025-001\",\n  \"custom_fields\": {\n    \"purpose\": \"treasury\",\n    \"network_tag\": \"evm-l2\"\n  }\n}")
  .asString();
```

```php Provision Solana deposit wallet
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://api.erebor.bank/blockchain_addresses', [
  'body' => '{
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "address_type": "SOLANA",
  "name": "Payroll hot wallet",
  "custom_ref": "WALLET-2025-001",
  "custom_fields": {
    "purpose": "treasury",
    "network_tag": "evm-l2"
  }
}',
  'headers' => [
    'Authorization' => '<apiKey>',
    'Content-Type' => 'application/json',
  ],
]);

echo $response->getBody();
```

```csharp Provision Solana deposit wallet
using RestSharp;

var client = new RestClient("https://api.erebor.bank/blockchain_addresses");
var request = new RestRequest(Method.POST);
request.AddHeader("Authorization", "<apiKey>");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\",\n  \"address_type\": \"SOLANA\",\n  \"name\": \"Payroll hot wallet\",\n  \"custom_ref\": \"WALLET-2025-001\",\n  \"custom_fields\": {\n    \"purpose\": \"treasury\",\n    \"network_tag\": \"evm-l2\"\n  }\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift Provision Solana deposit wallet
import Foundation

let headers = [
  "Authorization": "<apiKey>",
  "Content-Type": "application/json"
]
let parameters = [
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "address_type": "SOLANA",
  "name": "Payroll hot wallet",
  "custom_ref": "WALLET-2025-001",
  "custom_fields": [
    "purpose": "treasury",
    "network_tag": "evm-l2"
  ]
] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/blockchain_addresses")! as URL,
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