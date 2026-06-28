> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Update Inbound Rail Transfer

PATCH https://api.erebor.bank/rail_in/{id}
Content-Type: application/json

Update an inbound rail transfer's `custom_ref` or `custom_fields` for reconciliation. All other fields are immutable.

Reference: https://docs.erebor.bank/api-reference/payments/rail/inbound/update-inbound-rail-transfer

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /rail_in/{id}:
    patch:
      operationId: update-inbound-rail-transfer
      summary: Update Inbound Rail Transfer
      description: >-
        Update an inbound rail transfer's `custom_ref` or `custom_fields` for
        reconciliation. All other fields are immutable.
      tags:
        - subpackage_inboundRailTransfers
      parameters:
        - name: id
          in: path
          description: Inbound Rail transfer ID
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
          description: Inbound Rail transfer updated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/InboundRailTransfer'
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
        '409':
          description: Conflict
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateInboundRailTransferRequest'
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
    UpdateInboundRailTransferRequest:
      type: object
      properties:
        custom_ref:
          $ref: '#/components/schemas/CustomRef'
        custom_fields:
          $ref: '#/components/schemas/CustomFields'
      title: UpdateInboundRailTransferRequest
    InboundRailTransferStatus:
      type: string
      enum:
        - CREATED
        - PENDING
        - SETTLED
        - FAILED
      description: |
        Inbound Rail transfer status:
        - CREATED: Rail transfer was created
        - PENDING: Rail transfer is being processed
        - SETTLED: Rail transfer completed successfully
        - FAILED: Rail transfer failed
      title: InboundRailTransferStatus
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
    InboundRailTransfer:
      type: object
      properties:
        id:
          type: string
          description: >-
            Unique identifier for the inbound rail transfer, prefixed with
            `rail_in_`.
        type:
          type: string
          enum:
            - RAIL_IN
          description: Object type. Always `RAIL_IN`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this inbound rail transfer.
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
          $ref: '#/components/schemas/InboundRailTransferStatus'
        to_deposit_account_id:
          type: string
          description: >-
            ID of the deposit account receiving the transfer, prefixed with
            `dep_acct_`.
        from_deposit_account_id:
          type:
            - string
            - 'null'
          description: >-
            ID of the sender's deposit account if the transfer originated from
            another Erebor account, prefixed with `dep_acct_`.
        counterparty_rail_address_id:
          type:
            - string
            - 'null'
          description: >-
            ID of the external counterparty rail address that sent the transfer,
            prefixed with `cp_rail_addr_`.
        amount:
          $ref: '#/components/schemas/FiatAmount'
        memo:
          type:
            - string
            - 'null'
          description: Optional message included in the rail transfer.
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
        - to_deposit_account_id
        - amount
      title: InboundRailTransfer
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



**Request**

```json
{
  "custom_ref": "INBOUND-RAIL-2025-001",
  "custom_fields": {
    "invoice_id": "INV-RAIL-2025-04812",
    "payer": "Acme Corporation"
  }
}
```

**Response**

```json
{
  "id": "rail_in_01kasd1tthf1ns1pjn1kncctwd",
  "type": "RAIL_IN",
  "url": "https://api.erebor.bank/rail_in/rail_in_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T09:30:00Z",
  "status": "CREATED",
  "to_deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "amount": {
    "currency": "USD",
    "exponent": 2,
    "value": "12345",
    "display_value": "123.45"
  },
  "archived_at": null,
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "from_deposit_account_id": "dep_acct_02kasd1tthf1ns1pjn1kncctwd",
  "counterparty_rail_address_id": "cp_rail_addr_01kasd1tthf1ns1pjn1kncctwd",
  "memo": null,
  "custom_ref": "INBOUND-RAIL-2025-001",
  "custom_fields": {
    "invoice_id": "INV-RAIL-2025-04812",
    "payer": "Acme Corporation"
  }
}
```

**SDK Code**

```python
import requests

url = "https://api.erebor.bank/rail_in/rail_in_01kasd1tthf1ns1pjn1kncctwd"

payload = {
    "custom_ref": "INBOUND-RAIL-2025-001",
    "custom_fields": {
        "invoice_id": "INV-RAIL-2025-04812",
        "payer": "Acme Corporation"
    }
}
headers = {
    "Authorization": "<apiKey>",
    "Content-Type": "application/json"
}

response = requests.patch(url, json=payload, headers=headers)

print(response.json())
```

```javascript
const url = 'https://api.erebor.bank/rail_in/rail_in_01kasd1tthf1ns1pjn1kncctwd';
const options = {
  method: 'PATCH',
  headers: {Authorization: '<apiKey>', 'Content-Type': 'application/json'},
  body: '{"custom_ref":"INBOUND-RAIL-2025-001","custom_fields":{"invoice_id":"INV-RAIL-2025-04812","payer":"Acme Corporation"}}'
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

	url := "https://api.erebor.bank/rail_in/rail_in_01kasd1tthf1ns1pjn1kncctwd"

	payload := strings.NewReader("{\n  \"custom_ref\": \"INBOUND-RAIL-2025-001\",\n  \"custom_fields\": {\n    \"invoice_id\": \"INV-RAIL-2025-04812\",\n    \"payer\": \"Acme Corporation\"\n  }\n}")

	req, _ := http.NewRequest("PATCH", url, payload)

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

url = URI("https://api.erebor.bank/rail_in/rail_in_01kasd1tthf1ns1pjn1kncctwd")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Patch.new(url)
request["Authorization"] = '<apiKey>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"custom_ref\": \"INBOUND-RAIL-2025-001\",\n  \"custom_fields\": {\n    \"invoice_id\": \"INV-RAIL-2025-04812\",\n    \"payer\": \"Acme Corporation\"\n  }\n}"

response = http.request(request)
puts response.read_body
```

```java
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.patch("https://api.erebor.bank/rail_in/rail_in_01kasd1tthf1ns1pjn1kncctwd")
  .header("Authorization", "<apiKey>")
  .header("Content-Type", "application/json")
  .body("{\n  \"custom_ref\": \"INBOUND-RAIL-2025-001\",\n  \"custom_fields\": {\n    \"invoice_id\": \"INV-RAIL-2025-04812\",\n    \"payer\": \"Acme Corporation\"\n  }\n}")
  .asString();
```

```php
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('PATCH', 'https://api.erebor.bank/rail_in/rail_in_01kasd1tthf1ns1pjn1kncctwd', [
  'body' => '{
  "custom_ref": "INBOUND-RAIL-2025-001",
  "custom_fields": {
    "invoice_id": "INV-RAIL-2025-04812",
    "payer": "Acme Corporation"
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

var client = new RestClient("https://api.erebor.bank/rail_in/rail_in_01kasd1tthf1ns1pjn1kncctwd");
var request = new RestRequest(Method.PATCH);
request.AddHeader("Authorization", "<apiKey>");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"custom_ref\": \"INBOUND-RAIL-2025-001\",\n  \"custom_fields\": {\n    \"invoice_id\": \"INV-RAIL-2025-04812\",\n    \"payer\": \"Acme Corporation\"\n  }\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = [
  "Authorization": "<apiKey>",
  "Content-Type": "application/json"
]
let parameters = [
  "custom_ref": "INBOUND-RAIL-2025-001",
  "custom_fields": [
    "invoice_id": "INV-RAIL-2025-04812",
    "payer": "Acme Corporation"
  ]
] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/rail_in/rail_in_01kasd1tthf1ns1pjn1kncctwd")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "PATCH"
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