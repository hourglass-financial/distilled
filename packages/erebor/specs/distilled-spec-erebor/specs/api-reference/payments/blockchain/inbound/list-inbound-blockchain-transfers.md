> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# List Inbound Blockchain Transfers

GET https://api.erebor.bank/blockchain_in

Retrieve a paginated list of Inbound Blockchain Transfers

Reference: https://docs.erebor.bank/api-reference/payments/blockchain/inbound/list-inbound-blockchain-transfers

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /blockchain_in:
    get:
      operationId: list-inbound-blockchain-transfers
      summary: List Inbound Blockchain Transfers
      description: Retrieve a paginated list of Inbound Blockchain Transfers
      tags:
        - subpackage_inboundBlockchainTransfers
      parameters:
        - name: page_size
          in: query
          description: Number of items per page (max 100)
          required: false
          schema:
            type: integer
            default: 25
        - name: starting_after
          in: query
          description: Cursor for pagination (exclusive start)
          required: false
          schema:
            type: string
        - name: ending_before
          in: query
          description: Cursor for pagination (exclusive end)
          required: false
          schema:
            type: string
        - name: deposit_account_id
          in: query
          description: Filter by deposit account ID
          required: false
          schema:
            type: string
        - name: status
          in: query
          description: Filter by transfer status
          required: false
          schema:
            $ref: '#/components/schemas/InboundBlockchainTransferStatus'
        - name: customer_id
          in: query
          description: Filter by customer ID
          required: false
          schema:
            type: string
        - name: network
          in: query
          description: Filter by blockchain network
          required: false
          schema:
            $ref: '#/components/schemas/BlockchainNetwork'
        - name: program_id
          in: query
          description: Filter by program ID
          required: false
          schema:
            type: string
        - name: custom_ref
          in: query
          description: >-
            Filter by exact `custom_ref` match (case-sensitive, up to 255
            characters).
          required: false
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
      responses:
        '200':
          description: List of Inbound Blockchain Transfers
          content:
            application/json:
              schema:
                $ref: >-
                  #/components/schemas/INBOUND_BLOCKCHAIN_TRANSFERS_listInboundBlockchainTransfers_Response_200
servers:
  - url: https://api.erebor.bank
    description: API server (environment determined by API key)
components:
  schemas:
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
    BaseObject:
      type: object
      properties:
        id:
          type: string
          description: Unique identifier for the object
        type:
          type: string
          description: The type of the object
        url:
          type: string
          format: uri
          description: The URL for the object
        created_at:
          type: string
          format: date-time
          description: When the object was created
        updated_at:
          type: string
          format: date-time
          description: When the object was last updated
      required:
        - id
        - type
        - url
        - created_at
        - updated_at
      title: BaseObject
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
    INBOUND_BLOCKCHAIN_TRANSFERS_listInboundBlockchainTransfers_Response_200:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/InboundBlockchainTransfer'
        has_more:
          type: boolean
        page_size:
          type: integer
        page_next:
          type:
            - string
            - 'null'
          format: uri
        page_prev:
          type:
            - string
            - 'null'
          format: uri
        url:
          type: string
          format: uri
      required:
        - data
        - has_more
        - page_size
        - url
      title: INBOUND_BLOCKCHAIN_TRANSFERS_listInboundBlockchainTransfers_Response_200
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
  "has_more": true,
  "page_size": 2,
  "url": "https://api.erebor.bank/blockchain_in?page_size=2",
  "data": [
    {
      "id": "bc_in_01kasd1tthf1ns1pjn1kncctwd",
      "type": "BLOCKCHAIN_IN",
      "url": "https://api.erebor.bank/blockchain_in/bc_in_01kasd1tthf1ns1pjn1kncctwd",
      "created_at": "2025-01-15T09:00:00Z",
      "updated_at": "2025-01-15T09:00:00Z",
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
      "transaction_hash": null,
      "from_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f8fE0C",
      "to_address": "0x8ba1f109551bD432803012645Ac136ddd64DBA72"
    },
    {
      "id": "bc_in_01kasd2tthf1ns1pjn1knddtxe",
      "type": "BLOCKCHAIN_IN",
      "url": "https://api.erebor.bank/blockchain_in/bc_in_01kasd2tthf1ns1pjn1knddtxe",
      "created_at": "2025-01-15T08:30:00Z",
      "updated_at": "2025-01-15T08:30:00Z",
      "status": "NEEDS_ATTRIBUTION",
      "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
      "amount": {
        "currency": "USDC",
        "exponent": 2,
        "value": "50000",
        "display_value": "500.00"
      },
      "network": "BASE",
      "archived_at": null,
      "counterparty_blockchain_address_id": null,
      "transaction_hash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      "from_address": "0x9abc45Dd7745D1643914356Bc247eae132FfA90D",
      "to_address": "0x8ba1f109551bD432803012645Ac136ddd64DBA72"
    }
  ],
  "page_next": "https://api.erebor.bank/blockchain_in?starting_after=bc_in_01kasd2tthf1ns1pjn1knddtxe&page_size=2",
  "page_prev": null
}
```

**SDK Code**

```python List of Inbound Blockchain Transfers
import requests

url = "https://api.erebor.bank/blockchain_in"

headers = {"Authorization": "<apiKey>"}

response = requests.get(url, headers=headers)

print(response.json())
```

```javascript List of Inbound Blockchain Transfers
const url = 'https://api.erebor.bank/blockchain_in';
const options = {method: 'GET', headers: {Authorization: '<apiKey>'}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go List of Inbound Blockchain Transfers
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/blockchain_in"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("Authorization", "<apiKey>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby List of Inbound Blockchain Transfers
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/blockchain_in")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["Authorization"] = '<apiKey>'

response = http.request(request)
puts response.read_body
```

```java List of Inbound Blockchain Transfers
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.get("https://api.erebor.bank/blockchain_in")
  .header("Authorization", "<apiKey>")
  .asString();
```

```php List of Inbound Blockchain Transfers
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('GET', 'https://api.erebor.bank/blockchain_in', [
  'headers' => [
    'Authorization' => '<apiKey>',
  ],
]);

echo $response->getBody();
```

```csharp List of Inbound Blockchain Transfers
using RestSharp;

var client = new RestClient("https://api.erebor.bank/blockchain_in");
var request = new RestRequest(Method.GET);
request.AddHeader("Authorization", "<apiKey>");
IRestResponse response = client.Execute(request);
```

```swift List of Inbound Blockchain Transfers
import Foundation

let headers = ["Authorization": "<apiKey>"]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/blockchain_in")! as URL,
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