> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# List Inbound International Wire

GET https://api.erebor.bank/international_wire_in

Retrieve a paginated list of Inbound International Wire


Reference: https://docs.erebor.bank/api-reference/payments/international-wire/inbound/list-inbound-international-wire-transfers

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /international_wire_in:
    get:
      operationId: list-inbound-international-wire-transfers
      summary: List Inbound International Wire
      description: |
        Retrieve a paginated list of Inbound International Wire
      tags:
        - subpackage_inboundInternationalWireTransfers
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
            $ref: '#/components/schemas/InternationalWireTransferStatus'
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
          description: List of Inbound International Wire
          content:
            application/json:
              schema:
                $ref: >-
                  #/components/schemas/INBOUND_INTERNATIONAL_WIRE_TRANSFERS_listInboundInternationalWireTransfers_Response_200
servers:
  - url: https://api.erebor.bank
    description: API server (environment determined by API key)
components:
  schemas:
    InternationalWireTransferStatus:
      type: string
      enum:
        - PENDING
        - SETTLED
        - FAILED
        - RETURNED
      description: |
        International wire transfer status:
        - PENDING: Transfer is being processed
        - SETTLED: Transfer has been completed
        - FAILED: Transfer failed
        - RETURNED: Transfer was returned
      title: InternationalWireTransferStatus
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
    FiatAmount:
      type: object
      properties:
        currency:
          type: string
          enum:
            - USD
          description: USD for fiat transfers
        exponent:
          type: integer
          description: Number of decimal places
        value:
          type: string
          description: Amount in cents
        display_value:
          type: string
          description: Amount in dollars
      required:
        - currency
        - exponent
        - value
        - display_value
      description: >-
        Display amount restricted to USD currency only (for Wire, ACH, and Rails
        transfers)
      title: FiatAmount
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
    InboundInternationalWireTransfer:
      type: object
      properties:
        id:
          type: string
          description: >-
            Unique identifier for the inbound international wire, prefixed with
            `intl_wire_in_`.
        type:
          type: string
          enum:
            - INTERNATIONAL_WIRE_IN
          description: Object type. Always `INTERNATIONAL_WIRE_IN`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this inbound international wire.
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
          $ref: '#/components/schemas/InternationalWireTransferStatus'
        counterparty_international_bank_account_id:
          type: string
          description: >-
            ID of the external international bank account that sent the wire,
            prefixed with `cp_intl_bank_acct_`.
        deposit_account_id:
          type: string
          description: >-
            ID of the internal deposit account receiving the wire, prefixed with
            `dep_acct_`.
        amount:
          $ref: '#/components/schemas/FiatAmount'
        memo:
          type:
            - string
            - 'null'
          description: >-
            Optional memo for additional transfer information (max 140
            characters).
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
        - counterparty_international_bank_account_id
        - deposit_account_id
        - amount
      title: InboundInternationalWireTransfer
    INBOUND_INTERNATIONAL_WIRE_TRANSFERS_listInboundInternationalWireTransfers_Response_200:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/InboundInternationalWireTransfer'
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
      title: >-
        INBOUND_INTERNATIONAL_WIRE_TRANSFERS_listInboundInternationalWireTransfers_Response_200
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
  "url": "https://api.erebor.bank/international_wire_in?page_size=1",
  "data": [
    {
      "id": "intl_wire_in_01kasd1tthf1ns1pjn1kncctwd",
      "type": "INTERNATIONAL_WIRE_IN",
      "url": "https://api.erebor.bank/international_wire_in/intl_wire_in_01kasd1tthf1ns1pjn1kncctwd",
      "created_at": "2025-01-15T09:00:00Z",
      "updated_at": "2025-01-15T09:00:00Z",
      "status": "PENDING",
      "counterparty_international_bank_account_id": "cp_intl_bank_acct_01kasd1tthf1ns1pjn1kncctwd",
      "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
      "amount": {
        "currency": "USD",
        "exponent": 2,
        "value": "12345",
        "display_value": "123.45"
      },
      "archived_at": null,
      "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd"
    }
  ],
  "page_next": "https://api.erebor.bank/international_wire_in?starting_after=intl_wire_in_01kasd1tthf1ns1pjn1kncctwd&page_size=1",
  "page_prev": null
}
```

**SDK Code**

```python List of Inbound International Wire
import requests

url = "https://api.erebor.bank/international_wire_in"

headers = {"Authorization": "<apiKey>"}

response = requests.get(url, headers=headers)

print(response.json())
```

```javascript List of Inbound International Wire
const url = 'https://api.erebor.bank/international_wire_in';
const options = {method: 'GET', headers: {Authorization: '<apiKey>'}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go List of Inbound International Wire
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/international_wire_in"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("Authorization", "<apiKey>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby List of Inbound International Wire
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/international_wire_in")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["Authorization"] = '<apiKey>'

response = http.request(request)
puts response.read_body
```

```java List of Inbound International Wire
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.get("https://api.erebor.bank/international_wire_in")
  .header("Authorization", "<apiKey>")
  .asString();
```

```php List of Inbound International Wire
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('GET', 'https://api.erebor.bank/international_wire_in', [
  'headers' => [
    'Authorization' => '<apiKey>',
  ],
]);

echo $response->getBody();
```

```csharp List of Inbound International Wire
using RestSharp;

var client = new RestClient("https://api.erebor.bank/international_wire_in");
var request = new RestRequest(Method.GET);
request.AddHeader("Authorization", "<apiKey>");
IRestResponse response = client.Execute(request);
```

```swift List of Inbound International Wire
import Foundation

let headers = ["Authorization": "<apiKey>"]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/international_wire_in")! as URL,
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