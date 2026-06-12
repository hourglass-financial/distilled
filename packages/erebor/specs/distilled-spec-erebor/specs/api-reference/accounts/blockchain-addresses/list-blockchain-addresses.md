> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# List Blockchain Addresses

GET https://api.erebor.bank/blockchain_addresses

Retrieve a paginated list of Blockchain Addresses

Reference: https://docs.erebor.bank/api-reference/accounts/blockchain-addresses/list-blockchain-addresses

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /blockchain_addresses:
    get:
      operationId: list-blockchain-addresses
      summary: List Blockchain Addresses
      description: Retrieve a paginated list of Blockchain Addresses
      tags:
        - subpackage_blockchainAddresses
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
          description: Filter by Deposit Account ID
          required: false
          schema:
            type: string
        - name: address
          in: query
          description: >-
            Filter by on-chain address (EVM addresses are often matched
            case-insensitively)
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
          description: List of Blockchain Addresses
          content:
            application/json:
              schema:
                $ref: >-
                  #/components/schemas/BLOCKCHAIN_ADDRESSES_listBlockchainAddresses_Response_200
servers:
  - url: https://api.erebor.bank
    description: API server (environment determined by API key)
components:
  schemas:
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
    BLOCKCHAIN_ADDRESSES_listBlockchainAddresses_Response_200:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/BlockchainAddress'
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
      title: BLOCKCHAIN_ADDRESSES_listBlockchainAddresses_Response_200
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
  "has_more": false,
  "page_size": 25,
  "url": "https://api.erebor.bank/blockchain_addresses?deposit_account_id=dep_acct_01kasd1tthf1ns1pjn1kncctwd&page_size=25",
  "data": [
    {
      "id": "bc_addr_01kasd1tthf1ns1pjn1kncctwd",
      "type": "BLOCKCHAIN_ADDRESS",
      "url": "https://api.erebor.bank/blockchain_addresses/bc_addr_01kasd1tthf1ns1pjn1kncctwd",
      "created_at": "2026-03-12T14:22:11Z",
      "updated_at": "2026-03-12T14:22:11Z",
      "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
      "address": "0x4B20993Bc481177ec8E8f57036379b2A45C01e44",
      "address_type": "ETHEREUM",
      "network": [
        "ETHEREUM",
        "BASE",
        "INK"
      ],
      "archived_at": null,
      "name": "Operating — EVM deposits",
      "custom_ref": "WALLET-2025-001",
      "custom_fields": {
        "purpose": "treasury",
        "network_tag": "evm-l2"
      }
    },
    {
      "id": "bc_addr_01kasd1tthf1ns1pjn1kncctwe",
      "type": "BLOCKCHAIN_ADDRESS",
      "url": "https://api.erebor.bank/blockchain_addresses/bc_addr_01kasd1tthf1ns1pjn1kncctwe",
      "created_at": "2026-03-10T11:05:00Z",
      "updated_at": "2026-03-10T11:05:00Z",
      "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
      "address": "7EqQdExmChMdsg3DLBJDbNozbpTmCKLVXCDBWPDVxaZY",
      "address_type": "SOLANA",
      "network": [
        "SOLANA"
      ],
      "archived_at": null,
      "name": "Solana treasury",
      "custom_ref": "WALLET-2025-001",
      "custom_fields": {
        "purpose": "treasury",
        "network_tag": "evm-l2"
      }
    },
    {
      "id": "bc_addr_01kasd1tthf1ns1pjn1kncctwf",
      "type": "BLOCKCHAIN_ADDRESS",
      "url": "https://api.erebor.bank/blockchain_addresses/bc_addr_01kasd1tthf1ns1pjn1kncctwf",
      "created_at": "2026-02-28T09:41:33Z",
      "updated_at": "2026-02-28T09:41:33Z",
      "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
      "address": "0xb57ed1e8639db514bc858b195f616fcb512205248c1666dcd2475193cf35bd4f",
      "address_type": "SUI",
      "network": [
        "SUI"
      ],
      "archived_at": null,
      "name": null,
      "custom_ref": "WALLET-2025-001",
      "custom_fields": {
        "purpose": "treasury",
        "network_tag": "evm-l2"
      }
    }
  ],
  "page_next": null,
  "page_prev": null
}
```

**SDK Code**

```python Mixed EVM, Solana, and Sui custodial addresses
import requests

url = "https://api.erebor.bank/blockchain_addresses"

headers = {"Authorization": "<apiKey>"}

response = requests.get(url, headers=headers)

print(response.json())
```

```javascript Mixed EVM, Solana, and Sui custodial addresses
const url = 'https://api.erebor.bank/blockchain_addresses';
const options = {method: 'GET', headers: {Authorization: '<apiKey>'}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go Mixed EVM, Solana, and Sui custodial addresses
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/blockchain_addresses"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("Authorization", "<apiKey>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby Mixed EVM, Solana, and Sui custodial addresses
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/blockchain_addresses")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["Authorization"] = '<apiKey>'

response = http.request(request)
puts response.read_body
```

```java Mixed EVM, Solana, and Sui custodial addresses
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.get("https://api.erebor.bank/blockchain_addresses")
  .header("Authorization", "<apiKey>")
  .asString();
```

```php Mixed EVM, Solana, and Sui custodial addresses
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('GET', 'https://api.erebor.bank/blockchain_addresses', [
  'headers' => [
    'Authorization' => '<apiKey>',
  ],
]);

echo $response->getBody();
```

```csharp Mixed EVM, Solana, and Sui custodial addresses
using RestSharp;

var client = new RestClient("https://api.erebor.bank/blockchain_addresses");
var request = new RestRequest(Method.GET);
request.AddHeader("Authorization", "<apiKey>");
IRestResponse response = client.Execute(request);
```

```swift Mixed EVM, Solana, and Sui custodial addresses
import Foundation

let headers = ["Authorization": "<apiKey>"]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/blockchain_addresses")! as URL,
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