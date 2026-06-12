> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Attribute Inbound Blockchain Transfer

POST https://api.erebor.bank/blockchain_in/{id}/attribute
Content-Type: application/json

Attribute an Inbound Blockchain Transfer to a counterparty with custodian information

Reference: https://docs.erebor.bank/api-reference/payments/blockchain/inbound/attribute-inbound-blockchain-transfer

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /blockchain_in/{id}/attribute:
    post:
      operationId: attribute-inbound-blockchain-transfer
      summary: Attribute Inbound Blockchain Transfer
      description: >-
        Attribute an Inbound Blockchain Transfer to a counterparty with
        custodian information
      tags:
        - subpackage_inboundBlockchainTransfers
      parameters:
        - name: id
          in: path
          description: Inbound blockchain transfer ID
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
          description: Inbound blockchain transfer attributed successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/InboundBlockchainTransfer'
        '400':
          description: Invalid request
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AttributeInboundBlockchainTransferRequest'
servers:
  - url: https://api.erebor.bank
    description: API server (environment determined by API key)
components:
  schemas:
    Custodian:
      type: string
      enum:
        - ANCHORAGE_SG
        - ANCHORAGE_US
        - AQUANOW_CA
        - B2C2_UK
        - B2C2_US
        - BITGO_SG
        - BITGO_US
        - BITSTAMP_US
        - BVNK_US
        - CIRCLE_FR
        - CIRCLE_US
        - CITIBANK_US
        - COINBASE_US
        - COINSMART_CA
        - COPPER_CH
        - COPPER_UK
        - CUMBERLAND_DRW_LLC_US
        - CUMBERLAND_SG
        - EREBOR_BANK_US
        - FALCONX_US
        - FIDELITY_UK
        - FIDELITY_US
        - FIREBLOCKS_APAC
        - FIREBLOCKS_US
        - GALAXY_KY
        - GEMINI_US
        - KRAKEN_BVI
        - KRAKEN_EU_IE
        - KRAKEN_UK
        - KRAKEN_US
        - NUBANK_BR
        - PAXOS_US
        - RAMP_NETWORK_US
        - ROBINHOOD_US
        - WINTERMUTE_GB
        - SELF_HOSTED
        - OTHER
      description: >-
        Supported VASPs (Virtual Asset Service Providers) and custodians for
        blockchain addresses. Use SELF_HOSTED if the address is self-custodied,
        or OTHER if the custodian is not in this list.
      title: Custodian
    AttributeInboundBlockchainTransferRequest:
      type: object
      properties:
        counterparty_id:
          type: string
          description: >-
            ID of the counterparty this inbound blockchain transfer should be
            attributed to
        custodian:
          $ref: '#/components/schemas/Custodian'
          description: >-
            Custodian holding the blockchain address. Set to SELF_HOSTED if
            self-custodied, or OTHER if the custodian is not in the supported
            list.
        custodian_other:
          type:
            - string
            - 'null'
          description: Name of the custodian (required when custodian is set to OTHER)
      required:
        - counterparty_id
        - custodian
      description: >-
        Request to attribute an inbound blockchain transfer to a counterparty
        with custodian information
      title: AttributeInboundBlockchainTransferRequest
    InboundBlockchainTransferStatus:
      type: string
      enum:
        - PENDING
        - NEEDS_ATTRIBUTION
        - SETTLED
        - FAILED
      description: >
        Inbound blockchain transfer status:

        - PENDING: Transfer is being processed

        - NEEDS_ATTRIBUTION: Inbound transfer requires attribution to a
        counterparty

        - SETTLED: Transfer completed successfully (terminal)

        - FAILED: Transfer failed (terminal)
      title: InboundBlockchainTransferStatus
    CryptoAmountCurrency:
      type: string
      enum:
        - USAT
        - USDC
        - USDT
      description: Currency code
      title: CryptoAmountCurrency
    CryptoAmount:
      type: object
      properties:
        currency:
          $ref: '#/components/schemas/CryptoAmountCurrency'
          description: Currency code
        exponent:
          type: integer
          description: Number of decimal places
        value:
          type: string
          description: Stablecoin amount in cents
        display_value:
          type: string
          description: Stablecoin amount in dollars
      required:
        - currency
        - exponent
        - value
        - display_value
      description: Display amount for blockchain transfers (USDC, USAT, or USDT)
      title: CryptoAmount
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
    InboundBlockchainTransfer:
      type: object
      properties:
        id:
          type: string
          description: >-
            Unique identifier for the inbound blockchain transfer, prefixed with
            `bc_in_`.
        type:
          type: string
          enum:
            - BLOCKCHAIN_IN
          description: Object type. Always `BLOCKCHAIN_IN`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this inbound blockchain transfer.
        created_at:
          type: string
          format: date-time
          description: Timestamp of when the transfer was created, in ISO 8601 format.
        updated_at:
          type: string
          format: date-time
          description: Timestamp of when the transfer was last updated, in ISO 8601 format.
        archived_at:
          type:
            - string
            - 'null'
          format: date-time
        program_id:
          type:
            - string
            - 'null'
          description: Unique identifier for the program this transfer belongs to
        status:
          $ref: '#/components/schemas/InboundBlockchainTransferStatus'
        deposit_account_id:
          type: string
          description: >-
            ID of the internal deposit account receiving the transfer, prefixed
            with `dep_acct_`.
        counterparty_blockchain_address_id:
          type:
            - string
            - 'null'
          description: >-
            ID of the external blockchain address that sent the transfer,
            prefixed with `cp_bc_addr_`. `null` if the sender has not been
            identified yet.
        amount:
          $ref: '#/components/schemas/CryptoAmount'
        network:
          $ref: '#/components/schemas/BlockchainNetwork'
        transaction_hash:
          type:
            - string
            - 'null'
          description: On-chain transaction hash for the transfer.
        from_address:
          type:
            - string
            - 'null'
          description: Source blockchain address
        to_address:
          type:
            - string
            - 'null'
          description: Destination blockchain address
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
        - status
        - deposit_account_id
        - amount
        - network
      title: InboundBlockchainTransfer
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

### INBOUND_BLOCKCHAIN_TRANSFERS_attributeInboundBlockchainTransfer_example



**Request**

```json
undefined
```

**Response**

```json
{
  "id": "bc_in_01kasd1tthf1ns1pjn1kncctwd",
  "type": "BLOCKCHAIN_IN",
  "url": "https://api.erebor.bank/blockchain_in/bc_in_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T10:00:00Z",
  "status": "PENDING",
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "amount": {
    "currency": "USDC",
    "exponent": 2,
    "value": "12345",
    "display_value": "123.45"
  },
  "network": "ETHEREUM",
  "archived_at": null,
  "counterparty_blockchain_address_id": "cp_bc_addr_01kasd1tthf1ns1pjn1kncctwd",
  "transaction_hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "from_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f8fE0C",
  "to_address": "0x8ba1f109551bD432803012645Ac136ddd64DBA72"
}
```

**SDK Code**

```python INBOUND_BLOCKCHAIN_TRANSFERS_attributeInboundBlockchainTransfer_example
import requests

url = "https://api.erebor.bank/blockchain_in/bc_in_01kasd1tthf1ns1pjn1kncctwd/attribute"

headers = {
    "Authorization": "<apiKey>",
    "Content-Type": "application/json"
}

response = requests.post(url, headers=headers)

print(response.json())
```

```javascript INBOUND_BLOCKCHAIN_TRANSFERS_attributeInboundBlockchainTransfer_example
const url = 'https://api.erebor.bank/blockchain_in/bc_in_01kasd1tthf1ns1pjn1kncctwd/attribute';
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

```go INBOUND_BLOCKCHAIN_TRANSFERS_attributeInboundBlockchainTransfer_example
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/blockchain_in/bc_in_01kasd1tthf1ns1pjn1kncctwd/attribute"

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

```ruby INBOUND_BLOCKCHAIN_TRANSFERS_attributeInboundBlockchainTransfer_example
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/blockchain_in/bc_in_01kasd1tthf1ns1pjn1kncctwd/attribute")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Authorization"] = '<apiKey>'
request["Content-Type"] = 'application/json'

response = http.request(request)
puts response.read_body
```

```java INBOUND_BLOCKCHAIN_TRANSFERS_attributeInboundBlockchainTransfer_example
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.post("https://api.erebor.bank/blockchain_in/bc_in_01kasd1tthf1ns1pjn1kncctwd/attribute")
  .header("Authorization", "<apiKey>")
  .header("Content-Type", "application/json")
  .asString();
```

```php INBOUND_BLOCKCHAIN_TRANSFERS_attributeInboundBlockchainTransfer_example
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://api.erebor.bank/blockchain_in/bc_in_01kasd1tthf1ns1pjn1kncctwd/attribute', [
  'headers' => [
    'Authorization' => '<apiKey>',
    'Content-Type' => 'application/json',
  ],
]);

echo $response->getBody();
```

```csharp INBOUND_BLOCKCHAIN_TRANSFERS_attributeInboundBlockchainTransfer_example
using RestSharp;

var client = new RestClient("https://api.erebor.bank/blockchain_in/bc_in_01kasd1tthf1ns1pjn1kncctwd/attribute");
var request = new RestRequest(Method.POST);
request.AddHeader("Authorization", "<apiKey>");
request.AddHeader("Content-Type", "application/json");
IRestResponse response = client.Execute(request);
```

```swift INBOUND_BLOCKCHAIN_TRANSFERS_attributeInboundBlockchainTransfer_example
import Foundation

let headers = [
  "Authorization": "<apiKey>",
  "Content-Type": "application/json"
]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/blockchain_in/bc_in_01kasd1tthf1ns1pjn1kncctwd/attribute")! as URL,
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

### Known custodian



**Request**

```json
{
  "counterparty_id": "cp_01kasd1tthf1ns1pjn1kncctwd",
  "custodian": "ANCHORAGE_SG"
}
```

**Response**

```json
{
  "id": "bc_in_01kasd1tthf1ns1pjn1kncctwd",
  "type": "BLOCKCHAIN_IN",
  "url": "https://api.erebor.bank/blockchain_in/bc_in_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T10:00:00Z",
  "status": "PENDING",
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "amount": {
    "currency": "USDC",
    "exponent": 2,
    "value": "12345",
    "display_value": "123.45"
  },
  "network": "ETHEREUM",
  "archived_at": null,
  "counterparty_blockchain_address_id": "cp_bc_addr_01kasd1tthf1ns1pjn1kncctwd",
  "transaction_hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "from_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f8fE0C",
  "to_address": "0x8ba1f109551bD432803012645Ac136ddd64DBA72"
}
```

**SDK Code**

```python Known custodian
import requests

url = "https://api.erebor.bank/blockchain_in/bc_in_01kasd1tthf1ns1pjn1kncctwd/attribute"

payload = {
    "counterparty_id": "cp_01kasd1tthf1ns1pjn1kncctwd",
    "custodian": "ANCHORAGE_SG"
}
headers = {
    "Authorization": "<apiKey>",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.json())
```

```javascript Known custodian
const url = 'https://api.erebor.bank/blockchain_in/bc_in_01kasd1tthf1ns1pjn1kncctwd/attribute';
const options = {
  method: 'POST',
  headers: {Authorization: '<apiKey>', 'Content-Type': 'application/json'},
  body: '{"counterparty_id":"cp_01kasd1tthf1ns1pjn1kncctwd","custodian":"ANCHORAGE_SG"}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go Known custodian
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/blockchain_in/bc_in_01kasd1tthf1ns1pjn1kncctwd/attribute"

	payload := strings.NewReader("{\n  \"counterparty_id\": \"cp_01kasd1tthf1ns1pjn1kncctwd\",\n  \"custodian\": \"ANCHORAGE_SG\"\n}")

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

```ruby Known custodian
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/blockchain_in/bc_in_01kasd1tthf1ns1pjn1kncctwd/attribute")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Authorization"] = '<apiKey>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"counterparty_id\": \"cp_01kasd1tthf1ns1pjn1kncctwd\",\n  \"custodian\": \"ANCHORAGE_SG\"\n}"

response = http.request(request)
puts response.read_body
```

```java Known custodian
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.post("https://api.erebor.bank/blockchain_in/bc_in_01kasd1tthf1ns1pjn1kncctwd/attribute")
  .header("Authorization", "<apiKey>")
  .header("Content-Type", "application/json")
  .body("{\n  \"counterparty_id\": \"cp_01kasd1tthf1ns1pjn1kncctwd\",\n  \"custodian\": \"ANCHORAGE_SG\"\n}")
  .asString();
```

```php Known custodian
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://api.erebor.bank/blockchain_in/bc_in_01kasd1tthf1ns1pjn1kncctwd/attribute', [
  'body' => '{
  "counterparty_id": "cp_01kasd1tthf1ns1pjn1kncctwd",
  "custodian": "ANCHORAGE_SG"
}',
  'headers' => [
    'Authorization' => '<apiKey>',
    'Content-Type' => 'application/json',
  ],
]);

echo $response->getBody();
```

```csharp Known custodian
using RestSharp;

var client = new RestClient("https://api.erebor.bank/blockchain_in/bc_in_01kasd1tthf1ns1pjn1kncctwd/attribute");
var request = new RestRequest(Method.POST);
request.AddHeader("Authorization", "<apiKey>");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"counterparty_id\": \"cp_01kasd1tthf1ns1pjn1kncctwd\",\n  \"custodian\": \"ANCHORAGE_SG\"\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift Known custodian
import Foundation

let headers = [
  "Authorization": "<apiKey>",
  "Content-Type": "application/json"
]
let parameters = [
  "counterparty_id": "cp_01kasd1tthf1ns1pjn1kncctwd",
  "custodian": "ANCHORAGE_SG"
] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/blockchain_in/bc_in_01kasd1tthf1ns1pjn1kncctwd/attribute")! as URL,
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

### Other custodian



**Request**

```json
{
  "counterparty_id": "cp_01kasd1tthf1ns1pjn1kncctwd",
  "custodian": "OTHER",
  "custodian_other": "Other Custodian"
}
```

**Response**

```json
{
  "id": "bc_in_01kasd1tthf1ns1pjn1kncctwd",
  "type": "BLOCKCHAIN_IN",
  "url": "https://api.erebor.bank/blockchain_in/bc_in_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T10:00:00Z",
  "status": "PENDING",
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "amount": {
    "currency": "USDC",
    "exponent": 2,
    "value": "12345",
    "display_value": "123.45"
  },
  "network": "ETHEREUM",
  "archived_at": null,
  "counterparty_blockchain_address_id": "cp_bc_addr_01kasd1tthf1ns1pjn1kncctwd",
  "transaction_hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "from_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f8fE0C",
  "to_address": "0x8ba1f109551bD432803012645Ac136ddd64DBA72"
}
```

**SDK Code**

```python Other custodian
import requests

url = "https://api.erebor.bank/blockchain_in/bc_in_01kasd1tthf1ns1pjn1kncctwd/attribute"

payload = {
    "counterparty_id": "cp_01kasd1tthf1ns1pjn1kncctwd",
    "custodian": "OTHER",
    "custodian_other": "Other Custodian"
}
headers = {
    "Authorization": "<apiKey>",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.json())
```

```javascript Other custodian
const url = 'https://api.erebor.bank/blockchain_in/bc_in_01kasd1tthf1ns1pjn1kncctwd/attribute';
const options = {
  method: 'POST',
  headers: {Authorization: '<apiKey>', 'Content-Type': 'application/json'},
  body: '{"counterparty_id":"cp_01kasd1tthf1ns1pjn1kncctwd","custodian":"OTHER","custodian_other":"Other Custodian"}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go Other custodian
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/blockchain_in/bc_in_01kasd1tthf1ns1pjn1kncctwd/attribute"

	payload := strings.NewReader("{\n  \"counterparty_id\": \"cp_01kasd1tthf1ns1pjn1kncctwd\",\n  \"custodian\": \"OTHER\",\n  \"custodian_other\": \"Other Custodian\"\n}")

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

```ruby Other custodian
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/blockchain_in/bc_in_01kasd1tthf1ns1pjn1kncctwd/attribute")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Authorization"] = '<apiKey>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"counterparty_id\": \"cp_01kasd1tthf1ns1pjn1kncctwd\",\n  \"custodian\": \"OTHER\",\n  \"custodian_other\": \"Other Custodian\"\n}"

response = http.request(request)
puts response.read_body
```

```java Other custodian
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.post("https://api.erebor.bank/blockchain_in/bc_in_01kasd1tthf1ns1pjn1kncctwd/attribute")
  .header("Authorization", "<apiKey>")
  .header("Content-Type", "application/json")
  .body("{\n  \"counterparty_id\": \"cp_01kasd1tthf1ns1pjn1kncctwd\",\n  \"custodian\": \"OTHER\",\n  \"custodian_other\": \"Other Custodian\"\n}")
  .asString();
```

```php Other custodian
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://api.erebor.bank/blockchain_in/bc_in_01kasd1tthf1ns1pjn1kncctwd/attribute', [
  'body' => '{
  "counterparty_id": "cp_01kasd1tthf1ns1pjn1kncctwd",
  "custodian": "OTHER",
  "custodian_other": "Other Custodian"
}',
  'headers' => [
    'Authorization' => '<apiKey>',
    'Content-Type' => 'application/json',
  ],
]);

echo $response->getBody();
```

```csharp Other custodian
using RestSharp;

var client = new RestClient("https://api.erebor.bank/blockchain_in/bc_in_01kasd1tthf1ns1pjn1kncctwd/attribute");
var request = new RestRequest(Method.POST);
request.AddHeader("Authorization", "<apiKey>");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"counterparty_id\": \"cp_01kasd1tthf1ns1pjn1kncctwd\",\n  \"custodian\": \"OTHER\",\n  \"custodian_other\": \"Other Custodian\"\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift Other custodian
import Foundation

let headers = [
  "Authorization": "<apiKey>",
  "Content-Type": "application/json"
]
let parameters = [
  "counterparty_id": "cp_01kasd1tthf1ns1pjn1kncctwd",
  "custodian": "OTHER",
  "custodian_other": "Other Custodian"
] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/blockchain_in/bc_in_01kasd1tthf1ns1pjn1kncctwd/attribute")! as URL,
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