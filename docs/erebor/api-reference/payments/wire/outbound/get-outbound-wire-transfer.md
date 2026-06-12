> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Retrieve Outbound Wire Transfer

GET https://api.erebor.bank/wire_out/{id}

Retrieve a specific Outbound Wire Transfer by ID

Reference: https://docs.erebor.bank/api-reference/payments/wire/outbound/get-outbound-wire-transfer

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /wire_out/{id}:
    get:
      operationId: get-outbound-wire-transfer
      summary: Retrieve Outbound Wire Transfer
      description: Retrieve a specific Outbound Wire Transfer by ID
      tags:
        - subpackage_outboundWireTransfers
      parameters:
        - name: id
          in: path
          description: Outbound wire transfer ID
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
          description: Outbound wire transfer details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OutboundWireTransfer'
servers:
  - url: https://api.erebor.bank
    description: API server (environment determined by API key)
components:
  schemas:
    OutboundWireTransferStatus:
      type: string
      enum:
        - PENDING
        - SETTLED
        - FAILED
        - RETURNED
      description: |
        Outbound wire transfer status:
        - PENDING: Transfer is being processed
        - SETTLED: Transfer has been completed
        - FAILED: Transfer failed
        - RETURNED: Transfer was returned
      title: OutboundWireTransferStatus
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
    OutboundWireTransfer:
      type: object
      properties:
        id:
          type: string
          description: >-
            Unique identifier for the outbound wire transfer, prefixed with
            `wire_out_`.
        type:
          type: string
          enum:
            - WIRE_OUT
          description: Object type. Always `WIRE_OUT`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this outbound wire transfer.
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
          $ref: '#/components/schemas/OutboundWireTransferStatus'
        deposit_account_id:
          type: string
          description: >-
            ID of the internal deposit account sending the wire, prefixed with
            `dep_acct_`.
        counterparty_us_bank_account_id:
          type: string
          description: >-
            ID of the external US bank account receiving the wire, prefixed with
            `cp_us_bank_`.
        bank_name:
          type:
            - string
            - 'null'
          description: Bank name associated with the beneficiary's routing number.
        creditor_routing_number:
          type: string
          description: >-
            Fedwire ABA routing number of the beneficiary's financial
            institution.
        creditor_account_number:
          type: string
          description: >-
            Account number at the beneficiary's financial institution. Snapshot
            at origination — does not track later edits to the underlying
            counterparty record.
        creditor_name:
          type: string
          description: >-
            Name of the beneficiary as transmitted on the wire. Snapshot at
            origination — does not track later edits to the underlying
            counterparty record.
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
        instruction_id:
          type: string
          description: >-
            Instruction identification for banking system use. Changes at each
            hop in the wire.
        uetr:
          type: string
          description: >-
            Unique End-to-End Transaction Reference (UUID v4) for end-to-end
            payment tracking. Remains the same for all hops.
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
        - deposit_account_id
        - counterparty_us_bank_account_id
        - amount
        - end_to_end_id
        - imad
        - instruction_id
        - uetr
      title: OutboundWireTransfer
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
  "id": "wire_out_01kasd1tthf1ns1pjn1kncctwd",
  "type": "WIRE_OUT",
  "url": "https://api.erebor.bank/wire_out/wire_out_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T09:30:00Z",
  "status": "PENDING",
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "counterparty_us_bank_account_id": "cp_us_bank_01kasd1tthf1ns1pjn1kncctwd",
  "amount": {
    "currency": "USD",
    "exponent": 2,
    "value": "12345",
    "display_value": "123.45"
  },
  "end_to_end_id": "E2E-REF-2025-001",
  "imad": "20250115BANKUS33000001",
  "instruction_id": "INSTR-2025-001",
  "uetr": "4d2e78f9-1fe2-4ffd-8f1e-b85ac6f0c7f2",
  "archived_at": null,
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "bank_name": "Example National Bank",
  "creditor_routing_number": "121000248",
  "creditor_account_number": "555000123",
  "creditor_name": "Acme Suppliers LLC",
  "memo": null,
  "custom_ref": "PO-2025-7821",
  "custom_fields": {
    "po_number": "PO-2025-7821",
    "department": "operations"
  }
}
```

**SDK Code**

```python
import requests

url = "https://api.erebor.bank/wire_out/wire_out_01kasd1tthf1ns1pjn1kncctwd"

headers = {"Authorization": "<apiKey>"}

response = requests.get(url, headers=headers)

print(response.json())
```

```javascript
const url = 'https://api.erebor.bank/wire_out/wire_out_01kasd1tthf1ns1pjn1kncctwd';
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

	url := "https://api.erebor.bank/wire_out/wire_out_01kasd1tthf1ns1pjn1kncctwd"

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

url = URI("https://api.erebor.bank/wire_out/wire_out_01kasd1tthf1ns1pjn1kncctwd")

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

HttpResponse<String> response = Unirest.get("https://api.erebor.bank/wire_out/wire_out_01kasd1tthf1ns1pjn1kncctwd")
  .header("Authorization", "<apiKey>")
  .asString();
```

```php
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('GET', 'https://api.erebor.bank/wire_out/wire_out_01kasd1tthf1ns1pjn1kncctwd', [
  'headers' => [
    'Authorization' => '<apiKey>',
  ],
]);

echo $response->getBody();
```

```csharp
using RestSharp;

var client = new RestClient("https://api.erebor.bank/wire_out/wire_out_01kasd1tthf1ns1pjn1kncctwd");
var request = new RestRequest(Method.GET);
request.AddHeader("Authorization", "<apiKey>");
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = ["Authorization": "<apiKey>"]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/wire_out/wire_out_01kasd1tthf1ns1pjn1kncctwd")! as URL,
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