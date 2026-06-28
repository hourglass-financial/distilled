> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Retrieve Counterparty Blockchain Address

GET https://api.erebor.bank/counterparty_blockchain_addresses/{id}

Retrieve a specific Counterparty Blockchain Address by ID

Reference: https://docs.erebor.bank/api-reference/counterparties/blockchain-addresses/get-counterparty-blockchain-address

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /counterparty_blockchain_addresses/{id}:
    get:
      operationId: get-counterparty-blockchain-address
      summary: Retrieve Counterparty Blockchain Address
      description: Retrieve a specific Counterparty Blockchain Address by ID
      tags:
        - subpackage_counterpartyBlockchainAddresses
      parameters:
        - name: id
          in: path
          description: Contact Blockchain Address ID
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
          description: Contact Blockchain Address details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CounterpartyBlockchainAddress'
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
    CounterpartyBlockchainAddress:
      type: object
      properties:
        id:
          type: string
          description: >-
            Unique identifier for the counterparty blockchain address, prefixed
            with `cp_bc_addr_`.
        type:
          type: string
          enum:
            - COUNTERPARTY_BLOCKCHAIN_ADDRESS
          description: Object type. Always `COUNTERPARTY_BLOCKCHAIN_ADDRESS`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this counterparty blockchain address.
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
            ID of the counterparty this blockchain address is linked to,
            prefixed with `cp_`.
        description:
          type: string
          description: >-
            User-friendly description for this blockchain address (max 100
            characters).
        address:
          type: string
          description: Blockchain wallet address
        network:
          $ref: '#/components/schemas/BlockchainNetwork'
          description: Blockchain network for this address
        custodian:
          $ref: '#/components/schemas/Custodian'
          description: >-
            Custodian holding this blockchain address. Use `SELF_HOSTED` if
            self-custodied, or `OTHER` if the custodian isn't in the supported
            list.
        custodian_other:
          type:
            - string
            - 'null'
          description: Name of the custodian. Required when `custodian` is `OTHER`.
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
        - address
        - network
        - custodian
      title: CounterpartyBlockchainAddress
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
  "id": "cp_bc_addr_01kasd1tthf1ns1pjn1kncctwd",
  "type": "COUNTERPARTY_BLOCKCHAIN_ADDRESS",
  "url": "https://api.erebor.bank/counterparty_blockchain_addresses/cp_bc_addr_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T09:30:00Z",
  "description": "Primary ETH Wallet",
  "address": "0x8ba1f109551bD432803012645Hac136c",
  "network": "ETHEREUM",
  "custodian": "SELF_HOSTED",
  "archived_at": null,
  "customer_id": "cust_01kasd1tthf1ns1pjn1kncctwd",
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "counterparty_id": "cp_01kasd1tthf1ns1pjn1kncctwd",
  "custodian_other": null,
  "custom_ref": "CP-BC-2025-001",
  "custom_fields": {
    "attestation": "verified",
    "chain_tag": "L1-ETH"
  }
}
```

**SDK Code**

```python Counterparty Blockchain Address details
import requests

url = "https://api.erebor.bank/counterparty_blockchain_addresses/cp_bc_addr_01kasd1tthf1ns1pjn1kncctwd"

headers = {"Authorization": "<apiKey>"}

response = requests.get(url, headers=headers)

print(response.json())
```

```javascript Counterparty Blockchain Address details
const url = 'https://api.erebor.bank/counterparty_blockchain_addresses/cp_bc_addr_01kasd1tthf1ns1pjn1kncctwd';
const options = {method: 'GET', headers: {Authorization: '<apiKey>'}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go Counterparty Blockchain Address details
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/counterparty_blockchain_addresses/cp_bc_addr_01kasd1tthf1ns1pjn1kncctwd"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("Authorization", "<apiKey>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby Counterparty Blockchain Address details
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/counterparty_blockchain_addresses/cp_bc_addr_01kasd1tthf1ns1pjn1kncctwd")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["Authorization"] = '<apiKey>'

response = http.request(request)
puts response.read_body
```

```java Counterparty Blockchain Address details
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.get("https://api.erebor.bank/counterparty_blockchain_addresses/cp_bc_addr_01kasd1tthf1ns1pjn1kncctwd")
  .header("Authorization", "<apiKey>")
  .asString();
```

```php Counterparty Blockchain Address details
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('GET', 'https://api.erebor.bank/counterparty_blockchain_addresses/cp_bc_addr_01kasd1tthf1ns1pjn1kncctwd', [
  'headers' => [
    'Authorization' => '<apiKey>',
  ],
]);

echo $response->getBody();
```

```csharp Counterparty Blockchain Address details
using RestSharp;

var client = new RestClient("https://api.erebor.bank/counterparty_blockchain_addresses/cp_bc_addr_01kasd1tthf1ns1pjn1kncctwd");
var request = new RestRequest(Method.GET);
request.AddHeader("Authorization", "<apiKey>");
IRestResponse response = client.Execute(request);
```

```swift Counterparty Blockchain Address details
import Foundation

let headers = ["Authorization": "<apiKey>"]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/counterparty_blockchain_addresses/cp_bc_addr_01kasd1tthf1ns1pjn1kncctwd")! as URL,
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