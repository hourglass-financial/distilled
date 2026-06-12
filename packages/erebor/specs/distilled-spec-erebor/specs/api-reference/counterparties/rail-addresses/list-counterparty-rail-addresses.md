> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# List Counterparty Rail Addresses

GET https://api.erebor.bank/counterparty_rail_addresses

Retrieve a paginated list of Counterparty Rail Addresses

Reference: https://docs.erebor.bank/api-reference/counterparties/rail-addresses/list-counterparty-rail-addresses

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /counterparty_rail_addresses:
    get:
      operationId: list-counterparty-rail-addresses
      summary: List Counterparty Rail Addresses
      description: Retrieve a paginated list of Counterparty Rail Addresses
      tags:
        - subpackage_counterpartyRailAddresses
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
        - name: counterparty_id
          in: query
          description: Filter by Counterparty ID
          required: false
          schema:
            type: string
        - name: customer_id
          in: query
          description: Filter by customer ID
          required: false
          schema:
            type: string
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
          description: List of Counterparty Rail Addresses
          content:
            application/json:
              schema:
                $ref: >-
                  #/components/schemas/COUNTERPARTY_RAIL_ADDRESSES_listCounterpartyRailAddresses_Response_200
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
    COUNTERPARTY_RAIL_ADDRESSES_listCounterpartyRailAddresses_Response_200:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/CounterpartyRailAddress'
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
      title: COUNTERPARTY_RAIL_ADDRESSES_listCounterpartyRailAddresses_Response_200
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
  "page_size": 1,
  "url": "https://api.erebor.bank/counterparty_rail_addresses?page_size=1",
  "data": [
    {
      "id": "cp_rail_addr_01kasd1tthf1ns1pjn1kncctwd",
      "type": "COUNTERPARTY_RAIL_ADDRESS",
      "url": "https://api.erebor.bank/counterparty_rail_addresses/cp_rail_addr_01kasd1tthf1ns1pjn1kncctwd",
      "created_at": "2025-01-15T09:00:00Z",
      "updated_at": "2025-01-15T09:00:00Z",
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
  ],
  "page_next": "https://api.erebor.bank/counterparty_rail_addresses?starting_after=cp_rail_addr_01kasd1tthf1ns1pjn1kncctwd&page_size=1",
  "page_prev": null
}
```

**SDK Code**

```python List of Counterparty Rail Addresses
import requests

url = "https://api.erebor.bank/counterparty_rail_addresses"

headers = {"Authorization": "<apiKey>"}

response = requests.get(url, headers=headers)

print(response.json())
```

```javascript List of Counterparty Rail Addresses
const url = 'https://api.erebor.bank/counterparty_rail_addresses';
const options = {method: 'GET', headers: {Authorization: '<apiKey>'}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go List of Counterparty Rail Addresses
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/counterparty_rail_addresses"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("Authorization", "<apiKey>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby List of Counterparty Rail Addresses
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/counterparty_rail_addresses")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["Authorization"] = '<apiKey>'

response = http.request(request)
puts response.read_body
```

```java List of Counterparty Rail Addresses
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.get("https://api.erebor.bank/counterparty_rail_addresses")
  .header("Authorization", "<apiKey>")
  .asString();
```

```php List of Counterparty Rail Addresses
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('GET', 'https://api.erebor.bank/counterparty_rail_addresses', [
  'headers' => [
    'Authorization' => '<apiKey>',
  ],
]);

echo $response->getBody();
```

```csharp List of Counterparty Rail Addresses
using RestSharp;

var client = new RestClient("https://api.erebor.bank/counterparty_rail_addresses");
var request = new RestRequest(Method.GET);
request.AddHeader("Authorization", "<apiKey>");
IRestResponse response = client.Execute(request);
```

```swift List of Counterparty Rail Addresses
import Foundation

let headers = ["Authorization": "<apiKey>"]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/counterparty_rail_addresses")! as URL,
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