> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# List Inbound Wire Transfers

GET https://api.erebor.bank/wire_in

Retrieve a paginated list of Inbound Wire Transfers

Reference: https://docs.erebor.bank/api-reference/payments/wire/inbound/list-inbound-wire-transfers

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /wire_in:
    get:
      operationId: list-inbound-wire-transfers
      summary: List Inbound Wire Transfers
      description: Retrieve a paginated list of Inbound Wire Transfers
      tags:
        - subpackage_inboundWireTransfers
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
            $ref: '#/components/schemas/InboundWireTransferStatus'
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
          description: List of Inbound Wire Transfers
          content:
            application/json:
              schema:
                $ref: >-
                  #/components/schemas/INBOUND_WIRE_TRANSFERS_listInboundWireTransfers_Response_200
servers:
  - url: https://api.erebor.bank
    description: API server (environment determined by API key)
components:
  schemas:
    InboundWireTransferStatus:
      type: string
      enum:
        - CREATED
        - PENDING
        - SETTLED
        - FAILED
        - RETURNED
        - RESOLVING_FROM_SUSPENSE
      description: >
        Inbound wire transfer status:

        - CREATED: Transfer was created

        - PENDING: Transfer received, awaiting settlement

        - SETTLED: Transfer completed successfully

        - FAILED: Transfer failed

        - RETURNED: Transfer was returned

        - RESOLVING_FROM_SUSPENSE: Transfer previously held in suspense
        (unroutable on initial receipt) and is now being resolved to the
        customer account
      title: InboundWireTransferStatus
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
    InboundWireTransfer:
      type: object
      properties:
        id:
          type: string
          description: >-
            Unique identifier for the inbound wire transfer, prefixed with
            `wire_in_`.
        type:
          type: string
          enum:
            - WIRE_IN
          description: Object type. Always `WIRE_IN`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this inbound wire transfer.
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
          $ref: '#/components/schemas/InboundWireTransferStatus'
        counterparty_us_bank_account_id:
          type: string
          description: >-
            ID of the external US bank account that sent the wire, prefixed with
            `cp_us_bank_acct_`.
        deposit_account_id:
          type: string
          description: >-
            ID of the internal deposit account receiving the wire, prefixed with
            `dep_acct_`.
        bank_name:
          type:
            - string
            - 'null'
          description: Bank name associated with the originator's routing number.
        debtor_routing_number:
          type:
            - string
            - 'null'
          description: >-
            Fedwire ABA routing number of the originator's financial
            institution.
        debtor_account_number:
          type:
            - string
            - 'null'
          description: >-
            Account number at the originator's financial institution, as
            received on the incoming wire. Snapshot at receive time — does not
            track later edits to the underlying counterparty record.
        debtor_name:
          type:
            - string
            - 'null'
          description: Name of the originator as received on the incoming wire.
        creditor_name:
          type:
            - string
            - 'null'
          description: >-
            Name of the beneficiary as written on the incoming wire — your
            customer's name as addressed by the sender. Useful for reconciling
            against internal account or contact records and for catching name
            mismatches on legal-entity vs trade-name accounts.
        amount:
          $ref: '#/components/schemas/FiatAmount'
        end_to_end_id:
          type: string
          description: >-
            End-to-end identification assigned by the originating customer.
            Transported unchanged throughout the payment chain for
            reconciliation.
        imad:
          type: string
          description: >-
            Input Message Accountability Data assigned by the Fedwire sender.
            Composed of cycle date, source endpoint, and sequence number.
        uetr:
          type: string
          description: >-
            Unique End-to-End Transaction Reference (UUID v4) for end-to-end
            payment tracking. Remains the same for all hops.
        instruction_id:
          type:
            - string
            - 'null'
          description: >-
            Instruction identification for banking system use. Changes at each
            hop in the wire.
        memo:
          type:
            - string
            - 'null'
          description: Optional message included in the wire transfer (max 140 characters).
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
        - counterparty_us_bank_account_id
        - deposit_account_id
        - amount
        - end_to_end_id
        - imad
        - uetr
        - instruction_id
      title: InboundWireTransfer
    INBOUND_WIRE_TRANSFERS_listInboundWireTransfers_Response_200:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/InboundWireTransfer'
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
      title: INBOUND_WIRE_TRANSFERS_listInboundWireTransfers_Response_200
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
  "url": "https://api.erebor.bank/wire_in?page_size=1",
  "data": [
    {
      "id": "wire_in_01kasd1tthf1ns1pjn1kncctwd",
      "type": "WIRE_IN",
      "url": "https://api.erebor.bank/wire_in/wire_in_01kasd1tthf1ns1pjn1kncctwd",
      "created_at": "2025-01-15T09:00:00Z",
      "updated_at": "2025-01-15T09:00:00Z",
      "status": "PENDING",
      "counterparty_us_bank_account_id": "cp_us_bank_acct_01kasd1tthf1ns1pjn1kncctwd",
      "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
      "amount": {
        "currency": "USD",
        "exponent": 2,
        "value": "12345",
        "display_value": "123.45"
      },
      "end_to_end_id": "E2E-REF-2025-001",
      "imad": "20250115BANKUS33000001",
      "uetr": "4d2e78f9-1fe2-4ffd-8f1e-b85ac6f0c7f2",
      "instruction_id": "INSTR-2025-001",
      "archived_at": null,
      "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
      "bank_name": "Example National Bank",
      "debtor_routing_number": "021000021",
      "debtor_account_number": "987654321",
      "debtor_name": "Acme Suppliers LLC",
      "creditor_name": "Globex Trading Co",
      "memo": "Invoice #12345 - Q4 Services"
    }
  ],
  "page_next": null,
  "page_prev": null
}
```

**SDK Code**

```python List of Inbound Wire Transfers
import requests

url = "https://api.erebor.bank/wire_in"

headers = {"Authorization": "<apiKey>"}

response = requests.get(url, headers=headers)

print(response.json())
```

```javascript List of Inbound Wire Transfers
const url = 'https://api.erebor.bank/wire_in';
const options = {method: 'GET', headers: {Authorization: '<apiKey>'}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go List of Inbound Wire Transfers
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/wire_in"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("Authorization", "<apiKey>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby List of Inbound Wire Transfers
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/wire_in")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["Authorization"] = '<apiKey>'

response = http.request(request)
puts response.read_body
```

```java List of Inbound Wire Transfers
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.get("https://api.erebor.bank/wire_in")
  .header("Authorization", "<apiKey>")
  .asString();
```

```php List of Inbound Wire Transfers
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('GET', 'https://api.erebor.bank/wire_in', [
  'headers' => [
    'Authorization' => '<apiKey>',
  ],
]);

echo $response->getBody();
```

```csharp List of Inbound Wire Transfers
using RestSharp;

var client = new RestClient("https://api.erebor.bank/wire_in");
var request = new RestRequest(Method.GET);
request.AddHeader("Authorization", "<apiKey>");
IRestResponse response = client.Execute(request);
```

```swift List of Inbound Wire Transfers
import Foundation

let headers = ["Authorization": "<apiKey>"]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/wire_in")! as URL,
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