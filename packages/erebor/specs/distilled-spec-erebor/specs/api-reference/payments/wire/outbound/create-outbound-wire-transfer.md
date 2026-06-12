> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Create Outbound Wire Transfer

POST https://api.erebor.bank/wire_out
Content-Type: application/json

Create a new Outbound Wire Transfer

Reference: https://docs.erebor.bank/api-reference/payments/wire/outbound/create-outbound-wire-transfer

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /wire_out:
    post:
      operationId: create-outbound-wire-transfer
      summary: Create Outbound Wire Transfer
      description: Create a new Outbound Wire Transfer
      tags:
        - subpackage_outboundWireTransfers
      parameters:
        - name: Authorization
          in: header
          description: |
            Use your API key in the Authorization header.

            Example: `Authorization: your_api_key_here`
          required: true
          schema:
            type: string
        - name: Erebor-Idempotency-Key
          in: header
          description: >
            Optional idempotency key to safely retry requests. If provided,
            multiple requests with the same key will only perform the action
            once and return the same result (even if the result was an error).
          required: false
          schema:
            type: string
      responses:
        '200':
          description: Outbound wire transfer created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OutboundWireTransfer'
        '422':
          description: Validation error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OutboundWireTransferValidationError'
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateOutboundWireTransferRequest'
servers:
  - url: https://api.erebor.bank
    description: API server (environment determined by API key)
components:
  schemas:
    FiatInAmount:
      type: object
      properties:
        currency:
          type: string
          enum:
            - USD
          description: USD for fiat payments
        value:
          type: string
          description: Amount in cents
      required:
        - currency
        - value
      description: >-
        Input amount restricted to USD currency only (for Wire, ACH, and Rails
        transfers)
      title: FiatInAmount
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
    CreateOutboundWireTransferRequest:
      type: object
      properties:
        deposit_account_id:
          type: string
          description: Internal deposit account sending the outbound wire
        counterparty_us_bank_account_id:
          type: string
          description: External US bank account receiving the outbound wire
        amount:
          $ref: '#/components/schemas/FiatInAmount'
        memo:
          type:
            - string
            - 'null'
          description: >-
            Optional message included in the wire transfer and passed through to
            the recipient's bank statement (max 140 chars). Must use ISO
            20022-allowed characters only.
        custom_ref:
          $ref: '#/components/schemas/CustomRef'
        custom_fields:
          $ref: '#/components/schemas/CustomFields'
      required:
        - deposit_account_id
        - counterparty_us_bank_account_id
        - amount
      title: CreateOutboundWireTransferRequest
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
    OutboundWireTransferValidationErrorCode:
      type: string
      enum:
        - INVALID_CURRENCY
        - INVALID_REQUEST
      description: Machine-readable error code
      title: OutboundWireTransferValidationErrorCode
    OutboundWireTransferValidationError:
      type: object
      properties:
        error:
          type: string
          description: Human-readable error message
        code:
          $ref: '#/components/schemas/OutboundWireTransferValidationErrorCode'
          description: Machine-readable error code
        field:
          type:
            - string
            - 'null'
          description: The field that caused the validation error
      required:
        - error
        - code
      title: OutboundWireTransferValidationError
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



**Request**

```json
{
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "counterparty_us_bank_account_id": "cp_us_bank_01kasd1tthf1ns1pjn1kncctwd",
  "amount": {
    "currency": "USD",
    "value": "12345"
  },
  "memo": "Invoice #12345 - Q4 Services",
  "custom_ref": "PO-2025-7821",
  "custom_fields": {
    "po_number": "PO-2025-7821",
    "department": "operations"
  }
}
```

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

url = "https://api.erebor.bank/wire_out"

payload = {
    "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
    "counterparty_us_bank_account_id": "cp_us_bank_01kasd1tthf1ns1pjn1kncctwd",
    "amount": {
        "currency": "USD",
        "value": "12345"
    },
    "memo": "Invoice #12345 - Q4 Services",
    "custom_ref": "PO-2025-7821",
    "custom_fields": {
        "po_number": "PO-2025-7821",
        "department": "operations"
    }
}
headers = {
    "Authorization": "<apiKey>",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.json())
```

```javascript
const url = 'https://api.erebor.bank/wire_out';
const options = {
  method: 'POST',
  headers: {Authorization: '<apiKey>', 'Content-Type': 'application/json'},
  body: '{"deposit_account_id":"dep_acct_01kasd1tthf1ns1pjn1kncctwd","counterparty_us_bank_account_id":"cp_us_bank_01kasd1tthf1ns1pjn1kncctwd","amount":{"currency":"USD","value":"12345"},"memo":"Invoice #12345 - Q4 Services","custom_ref":"PO-2025-7821","custom_fields":{"po_number":"PO-2025-7821","department":"operations"}}'
};

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
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/wire_out"

	payload := strings.NewReader("{\n  \"deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\",\n  \"counterparty_us_bank_account_id\": \"cp_us_bank_01kasd1tthf1ns1pjn1kncctwd\",\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"12345\"\n  },\n  \"memo\": \"Invoice #12345 - Q4 Services\",\n  \"custom_ref\": \"PO-2025-7821\",\n  \"custom_fields\": {\n    \"po_number\": \"PO-2025-7821\",\n    \"department\": \"operations\"\n  }\n}")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("Authorization", "<apiKey>")
	req.Header.Add("Content-Type", "application/json")

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

url = URI("https://api.erebor.bank/wire_out")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Authorization"] = '<apiKey>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\",\n  \"counterparty_us_bank_account_id\": \"cp_us_bank_01kasd1tthf1ns1pjn1kncctwd\",\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"12345\"\n  },\n  \"memo\": \"Invoice #12345 - Q4 Services\",\n  \"custom_ref\": \"PO-2025-7821\",\n  \"custom_fields\": {\n    \"po_number\": \"PO-2025-7821\",\n    \"department\": \"operations\"\n  }\n}"

response = http.request(request)
puts response.read_body
```

```java
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.post("https://api.erebor.bank/wire_out")
  .header("Authorization", "<apiKey>")
  .header("Content-Type", "application/json")
  .body("{\n  \"deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\",\n  \"counterparty_us_bank_account_id\": \"cp_us_bank_01kasd1tthf1ns1pjn1kncctwd\",\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"12345\"\n  },\n  \"memo\": \"Invoice #12345 - Q4 Services\",\n  \"custom_ref\": \"PO-2025-7821\",\n  \"custom_fields\": {\n    \"po_number\": \"PO-2025-7821\",\n    \"department\": \"operations\"\n  }\n}")
  .asString();
```

```php
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://api.erebor.bank/wire_out', [
  'body' => '{
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "counterparty_us_bank_account_id": "cp_us_bank_01kasd1tthf1ns1pjn1kncctwd",
  "amount": {
    "currency": "USD",
    "value": "12345"
  },
  "memo": "Invoice #12345 - Q4 Services",
  "custom_ref": "PO-2025-7821",
  "custom_fields": {
    "po_number": "PO-2025-7821",
    "department": "operations"
  }
}',
  'headers' => [
    'Authorization' => '<apiKey>',
    'Content-Type' => 'application/json',
  ],
]);

echo $response->getBody();
```

```csharp
using RestSharp;

var client = new RestClient("https://api.erebor.bank/wire_out");
var request = new RestRequest(Method.POST);
request.AddHeader("Authorization", "<apiKey>");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\",\n  \"counterparty_us_bank_account_id\": \"cp_us_bank_01kasd1tthf1ns1pjn1kncctwd\",\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"12345\"\n  },\n  \"memo\": \"Invoice #12345 - Q4 Services\",\n  \"custom_ref\": \"PO-2025-7821\",\n  \"custom_fields\": {\n    \"po_number\": \"PO-2025-7821\",\n    \"department\": \"operations\"\n  }\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = [
  "Authorization": "<apiKey>",
  "Content-Type": "application/json"
]
let parameters = [
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "counterparty_us_bank_account_id": "cp_us_bank_01kasd1tthf1ns1pjn1kncctwd",
  "amount": [
    "currency": "USD",
    "value": "12345"
  ],
  "memo": "Invoice #12345 - Q4 Services",
  "custom_ref": "PO-2025-7821",
  "custom_fields": [
    "po_number": "PO-2025-7821",
    "department": "operations"
  ]
] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/wire_out")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data

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