> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Retrieve Counterparty Rail Address

GET https://api.erebor.bank/counterparty_rail_addresses/{id}

Retrieve a specific Counterparty Rail Address by ID

Reference: https://docs.erebor.bank/api-reference/counterparties/rail-addresses/get-counterparty-rail-address

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /counterparty_rail_addresses/{id}:
    get:
      operationId: get-counterparty-rail-address
      summary: Retrieve Counterparty Rail Address
      description: Retrieve a specific Counterparty Rail Address by ID
      tags:
        - subpackage_counterpartyRailAddresses
      parameters:
        - name: id
          in: path
          description: Rail address ID
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
      responses:
        '200':
          description: Rail address details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CounterpartyRailAddress'
servers:
  - url: https://api.erebor.bank
    description: API server (environment determined by API key)
components:
  schemas:
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
  "id": "cp_rail_addr_01kasd1tthf1ns1pjn1kncctwd",
  "type": "COUNTERPARTY_RAIL_ADDRESS",
  "url": "https://api.erebor.bank/counterparty_rail_addresses/cp_rail_addr_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T09:30:00Z",
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
```

**SDK Code**

```python Counterparty Rail Address details
import requests

url = "https://api.erebor.bank/counterparty_rail_addresses/cp_rail_addr_01kasd1tthf1ns1pjn1kncctwd"

headers = {"Authorization": "<apiKey>"}

response = requests.get(url, headers=headers)

print(response.json())
```

```javascript Counterparty Rail Address details
const url = 'https://api.erebor.bank/counterparty_rail_addresses/cp_rail_addr_01kasd1tthf1ns1pjn1kncctwd';
const options = {method: 'GET', headers: {Authorization: '<apiKey>'}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go Counterparty Rail Address details
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/counterparty_rail_addresses/cp_rail_addr_01kasd1tthf1ns1pjn1kncctwd"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("Authorization", "<apiKey>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby Counterparty Rail Address details
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/counterparty_rail_addresses/cp_rail_addr_01kasd1tthf1ns1pjn1kncctwd")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["Authorization"] = '<apiKey>'

response = http.request(request)
puts response.read_body
```

```java Counterparty Rail Address details
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.get("https://api.erebor.bank/counterparty_rail_addresses/cp_rail_addr_01kasd1tthf1ns1pjn1kncctwd")
  .header("Authorization", "<apiKey>")
  .asString();
```

```php Counterparty Rail Address details
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('GET', 'https://api.erebor.bank/counterparty_rail_addresses/cp_rail_addr_01kasd1tthf1ns1pjn1kncctwd', [
  'headers' => [
    'Authorization' => '<apiKey>',
  ],
]);

echo $response->getBody();
```

```csharp Counterparty Rail Address details
using RestSharp;

var client = new RestClient("https://api.erebor.bank/counterparty_rail_addresses/cp_rail_addr_01kasd1tthf1ns1pjn1kncctwd");
var request = new RestRequest(Method.GET);
request.AddHeader("Authorization", "<apiKey>");
IRestResponse response = client.Execute(request);
```

```swift Counterparty Rail Address details
import Foundation

let headers = ["Authorization": "<apiKey>"]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/counterparty_rail_addresses/cp_rail_addr_01kasd1tthf1ns1pjn1kncctwd")! as URL,
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