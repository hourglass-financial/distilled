> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Retrieve Inbound Wire Transfer

GET https://api.erebor.bank/wire_in/{id}

Retrieve a specific Inbound Wire Transfer by ID

Reference: https://docs.erebor.bank/api-reference/payments/wire/inbound/get-inbound-wire-transfer

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /wire_in/{id}:
    get:
      operationId: get-inbound-wire-transfer
      summary: Retrieve Inbound Wire Transfer
      description: Retrieve a specific Inbound Wire Transfer by ID
      tags:
        - subpackage_inboundWireTransfers
      parameters:
        - name: id
          in: path
          description: Inbound wire transfer ID
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
          description: Inbound wire transfer details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/InboundWireTransfer'
servers:
  - url: https://api.erebor.bank
    description: API server (environment determined by API key)
components:
  schemas:
    InboundWireTransferStatus:
      type: string
      enum:
        - PENDING
        - SETTLED
        - FAILED
        - RETURNED
        - RESOLVING_FROM_SUSPENSE
      description: >
        Inbound wire transfer status:

        - PENDING: Transfer received, awaiting settlement

        - SETTLED: Transfer completed successfully

        - FAILED: Transfer failed

        - RETURNED: Transfer was returned

        - RESOLVING_FROM_SUSPENSE: Transfer previously held in suspense
        (unroutable on initial receipt) and is now being resolved to the
        customer account
      title: InboundWireTransferStatus
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
            `cp_us_bank_`.
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
  "id": "wire_in_01kasd1tthf1ns1pjn1kncctwd",
  "type": "WIRE_IN",
  "url": "https://api.erebor.bank/wire_in/wire_in_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T09:30:00Z",
  "status": "PENDING",
  "counterparty_us_bank_account_id": "cp_us_bank_01kasd1tthf1ns1pjn1kncctwd",
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
  "memo": null,
  "custom_ref": "INBOUND-WIRE-2025-001",
  "custom_fields": {
    "invoice_id": "INV-2025-04812",
    "payer": "Acme Corporation"
  }
}
```

**SDK Code**

```python
import requests

url = "https://api.erebor.bank/wire_in/wire_in_01kasd1tthf1ns1pjn1kncctwd"

headers = {"Authorization": "<apiKey>"}

response = requests.get(url, headers=headers)

print(response.json())
```

```javascript
const url = 'https://api.erebor.bank/wire_in/wire_in_01kasd1tthf1ns1pjn1kncctwd';
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

	url := "https://api.erebor.bank/wire_in/wire_in_01kasd1tthf1ns1pjn1kncctwd"

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

url = URI("https://api.erebor.bank/wire_in/wire_in_01kasd1tthf1ns1pjn1kncctwd")

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

HttpResponse<String> response = Unirest.get("https://api.erebor.bank/wire_in/wire_in_01kasd1tthf1ns1pjn1kncctwd")
  .header("Authorization", "<apiKey>")
  .asString();
```

```php
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('GET', 'https://api.erebor.bank/wire_in/wire_in_01kasd1tthf1ns1pjn1kncctwd', [
  'headers' => [
    'Authorization' => '<apiKey>',
  ],
]);

echo $response->getBody();
```

```csharp
using RestSharp;

var client = new RestClient("https://api.erebor.bank/wire_in/wire_in_01kasd1tthf1ns1pjn1kncctwd");
var request = new RestRequest(Method.GET);
request.AddHeader("Authorization", "<apiKey>");
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = ["Authorization": "<apiKey>"]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/wire_in/wire_in_01kasd1tthf1ns1pjn1kncctwd")! as URL,
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