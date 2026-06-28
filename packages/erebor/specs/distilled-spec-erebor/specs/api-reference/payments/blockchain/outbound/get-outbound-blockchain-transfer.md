> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Retrieve Outbound Blockchain Transfer

GET https://api.erebor.bank/blockchain_out/{id}

Retrieve a specific Outbound Blockchain Transfer by ID

Reference: https://docs.erebor.bank/api-reference/payments/blockchain/outbound/get-outbound-blockchain-transfer

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /blockchain_out/{id}:
    get:
      operationId: get-outbound-blockchain-transfer
      summary: Retrieve Outbound Blockchain Transfer
      description: Retrieve a specific Outbound Blockchain Transfer by ID
      tags:
        - subpackage_outboundBlockchainTransfers
      parameters:
        - name: id
          in: path
          description: Outbound blockchain transfer ID
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
          description: Outbound blockchain transfer details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OutboundBlockchainTransfer'
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
    OutboundBlockchainTransferStatus:
      type: string
      enum:
        - CREATED
        - PENDING
        - SETTLED
        - FAILED
      description: |
        Outbound blockchain transfer status:
        - CREATED: Transfer was created
        - PENDING: Transfer is being processed
        - SETTLED: Transfer completed successfully (terminal)
        - FAILED: Transfer failed (terminal)
      title: OutboundBlockchainTransferStatus
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
    OutboundBlockchainTransfer:
      type: object
      properties:
        id:
          type: string
          description: >-
            Unique identifier for the outbound blockchain transfer, prefixed
            with `bc_out_`.
        type:
          type: string
          enum:
            - BLOCKCHAIN_OUT
          description: Object type. Always `BLOCKCHAIN_OUT`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this outbound blockchain transfer.
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
          $ref: '#/components/schemas/OutboundBlockchainTransferStatus'
        deposit_account_id:
          type: string
          description: >-
            ID of the internal deposit account sending the transfer, prefixed
            with `dep_acct_`.
        counterparty_blockchain_address_id:
          type: string
          description: >-
            ID of the external blockchain address receiving the transfer,
            prefixed with `cp_bc_addr_`.
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
        - counterparty_blockchain_address_id
        - amount
        - network
      title: OutboundBlockchainTransfer
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
  "id": "bc_out_01kasd1tthf1ns1pjn1kncctwd",
  "type": "BLOCKCHAIN_OUT",
  "url": "https://api.erebor.bank/blockchain_out/bc_out_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T09:30:00Z",
  "status": "CREATED",
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "counterparty_blockchain_address_id": "cp_bc_addr_01kasd1tthf1ns1pjn1kncctwd",
  "amount": {
    "currency": "USAT",
    "exponent": 2,
    "value": "12345",
    "display_value": "123.45"
  },
  "network": "BASE",
  "archived_at": null,
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "transaction_hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "from_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f8fE0C",
  "to_address": "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
  "custom_ref": "PAYOUT-2025-04812",
  "custom_fields": {
    "payout_batch": "B-2025-04-15",
    "recipient_id": "u_abc123"
  }
}
```

**SDK Code**

```python
import requests

url = "https://api.erebor.bank/blockchain_out/bc_out_01kasd1tthf1ns1pjn1kncctwd"

headers = {"Authorization": "<apiKey>"}

response = requests.get(url, headers=headers)

print(response.json())
```

```javascript
const url = 'https://api.erebor.bank/blockchain_out/bc_out_01kasd1tthf1ns1pjn1kncctwd';
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

	url := "https://api.erebor.bank/blockchain_out/bc_out_01kasd1tthf1ns1pjn1kncctwd"

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

url = URI("https://api.erebor.bank/blockchain_out/bc_out_01kasd1tthf1ns1pjn1kncctwd")

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

HttpResponse<String> response = Unirest.get("https://api.erebor.bank/blockchain_out/bc_out_01kasd1tthf1ns1pjn1kncctwd")
  .header("Authorization", "<apiKey>")
  .asString();
```

```php
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('GET', 'https://api.erebor.bank/blockchain_out/bc_out_01kasd1tthf1ns1pjn1kncctwd', [
  'headers' => [
    'Authorization' => '<apiKey>',
  ],
]);

echo $response->getBody();
```

```csharp
using RestSharp;

var client = new RestClient("https://api.erebor.bank/blockchain_out/bc_out_01kasd1tthf1ns1pjn1kncctwd");
var request = new RestRequest(Method.GET);
request.AddHeader("Authorization", "<apiKey>");
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = ["Authorization": "<apiKey>"]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/blockchain_out/bc_out_01kasd1tthf1ns1pjn1kncctwd")! as URL,
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