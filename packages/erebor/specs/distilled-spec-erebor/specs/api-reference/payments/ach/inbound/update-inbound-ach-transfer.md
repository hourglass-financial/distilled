> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Update Inbound ACH Transfer

PATCH https://api.erebor.bank/ach_in/{id}
Content-Type: application/json

Update an inbound ACH transfer's `custom_ref` or `custom_fields` for reconciliation. All other fields are immutable.

Reference: https://docs.erebor.bank/api-reference/payments/ach/inbound/update-inbound-ach-transfer

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /ach_in/{id}:
    patch:
      operationId: update-inbound-ach-transfer
      summary: Update Inbound ACH Transfer
      description: >-
        Update an inbound ACH transfer's `custom_ref` or `custom_fields` for
        reconciliation. All other fields are immutable.
      tags:
        - subpackage_inboundAchTransfers
      parameters:
        - name: id
          in: path
          description: Inbound ACH transfer ID
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
          description: Inbound ACH transfer updated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/InboundACHTransfer'
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
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateInboundACHTransferRequest'
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
    UpdateInboundACHTransferRequest:
      type: object
      properties:
        custom_ref:
          $ref: '#/components/schemas/CustomRef'
        custom_fields:
          $ref: '#/components/schemas/CustomFields'
      title: UpdateInboundACHTransferRequest
    InboundACHTransferStatus:
      type: string
      enum:
        - PENDING
        - SETTLED
        - FAILED
        - RETURNED
      description: |
        Inbound ACH transfer status:
        - PENDING: Transfer is being processed
        - SETTLED: Transfer has been completed
        - FAILED: Transfer failed
        - RETURNED: Transfer was returned
      title: InboundACHTransferStatus
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
    ACHDirection:
      type: string
      enum:
        - CREDIT
        - DEBIT
      description: ACH transfer direction
      title: ACHDirection
    InboundACHSecCode:
      type: string
      enum:
        - PPD
        - CCD
        - WEB
        - TEL
        - CTX
        - IAT
        - ARC
        - BOC
        - POP
        - RCK
        - POS
        - SHR
        - MTE
        - COR
        - CIE
        - DNE
        - ENR
        - ADV
        - ACK
        - ATX
        - PBR
        - TRC
        - TRX
        - XCK
      description: |
        ACH SEC code indicating the transaction type:
        - **Everyday Payment**: PPD, CCD, WEB, TEL, CTX, IAT
        - **Check Conversion**: ARC, BOC, POP, RCK
        - **POS/Debit Card**: POS, SHR, MTE
        - **Administrative**: COR, CIE, DNE, ENR, ADV
        - **Acknowledgment**: ACK, ATX
        - **Cross-Border**: PBR
        - **Legacy**: TRC, TRX, XCK
      title: InboundACHSecCode
    AddendaEntry:
      type: string
      description: >-
        ACH addenda record containing remittance information passed through to
        the recipient (max 80 characters). Must use NACHA-allowed characters
        only.
      title: AddendaEntry
    InboundACHTransfer:
      type: object
      properties:
        id:
          type: string
          description: >-
            Unique identifier for the inbound ACH transfer, prefixed with
            `ach_in_`.
        type:
          type: string
          enum:
            - ACH_IN
          description: Object type. Always `ACH_IN`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this inbound ACH transfer.
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
          $ref: '#/components/schemas/InboundACHTransferStatus'
        deposit_account_id:
          type: string
          description: >-
            ID of the internal deposit account receiving the transfer, prefixed
            with `dep_acct_`.
        amount:
          $ref: '#/components/schemas/FiatAmount'
        direction:
          $ref: '#/components/schemas/ACHDirection'
        sec_code:
          $ref: '#/components/schemas/InboundACHSecCode'
        company_entry_description:
          type: string
          description: >-
            Short label describing the transaction purpose, shown on receiver
            statements (max 10 characters).
        originating_company_id:
          type: string
          description: >-
            Tax ID or identifier of the company that initiated the ACH entry
            (max 10 characters).
        originating_company_name:
          type: string
          description: >-
            Name of the originating company, as shown on receiver statements
            (max 16 characters).
        effective_entry_date:
          type: string
          format: date
          description: Effective entry date for the ACH transfer in `YYYY-MM-DD` format.
        addenda:
          type: array
          items:
            $ref: '#/components/schemas/AddendaEntry'
          description: >-
            Addenda records containing remittance information (max 80 characters
            each).
        company_descriptive_date:
          type:
            - string
            - 'null'
          description: >-
            Optional date displayed to receivers for informational purposes (max
            6 characters). Not used for processing.
        company_discretionary_data:
          type:
            - string
            - 'null'
          description: Optional field for originator's internal use (max 20 characters).
        return_code:
          type:
            - string
            - 'null'
          description: NACHA return reason code. Populated when `status` is `RETURNED`.
        returned_at:
          type:
            - string
            - 'null'
          format: date-time
          description: Timestamp of when the return was recorded, in ISO 8601 format.
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
        - amount
        - direction
        - sec_code
        - company_entry_description
        - originating_company_id
        - originating_company_name
        - effective_entry_date
        - addenda
      title: InboundACHTransfer
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
  "custom_ref": "INBOUND-ACH-2025-04812",
  "custom_fields": {
    "invoice_id": "INV-2025-04812",
    "payer": "Acme Corporation"
  }
}
```

**Response**

```json
{
  "id": "ach_in_01kasd1tthf1ns1pjn1kncctwd",
  "type": "ACH_IN",
  "url": "https://api.erebor.bank/ach_in/ach_in_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T09:30:00Z",
  "status": "PENDING",
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "amount": {
    "currency": "USD",
    "exponent": 2,
    "value": "12345",
    "display_value": "123.45"
  },
  "direction": "CREDIT",
  "sec_code": "PPD",
  "company_entry_description": "PAYMENT",
  "originating_company_id": "1234567890",
  "originating_company_name": "ACME CORP",
  "effective_entry_date": "2025-01-15",
  "addenda": [
    "REF:INV-2025-001 PAYMENT FOR SERVICES"
  ],
  "archived_at": null,
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "company_descriptive_date": null,
  "company_discretionary_data": null,
  "return_code": "R01",
  "returned_at": "2025-01-15T09:30:00Z",
  "custom_ref": "INBOUND-ACH-2025-04812",
  "custom_fields": {
    "invoice_id": "INV-2025-04812",
    "payer": "Acme Corporation"
  }
}
```

**SDK Code**

```python
import requests

url = "https://api.erebor.bank/ach_in/ach_in_01kasd1tthf1ns1pjn1kncctwd"

payload = {
    "custom_ref": "INBOUND-ACH-2025-04812",
    "custom_fields": {
        "invoice_id": "INV-2025-04812",
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
const url = 'https://api.erebor.bank/ach_in/ach_in_01kasd1tthf1ns1pjn1kncctwd';
const options = {
  method: 'PATCH',
  headers: {Authorization: '<apiKey>', 'Content-Type': 'application/json'},
  body: '{"custom_ref":"INBOUND-ACH-2025-04812","custom_fields":{"invoice_id":"INV-2025-04812","payer":"Acme Corporation"}}'
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

	url := "https://api.erebor.bank/ach_in/ach_in_01kasd1tthf1ns1pjn1kncctwd"

	payload := strings.NewReader("{\n  \"custom_ref\": \"INBOUND-ACH-2025-04812\",\n  \"custom_fields\": {\n    \"invoice_id\": \"INV-2025-04812\",\n    \"payer\": \"Acme Corporation\"\n  }\n}")

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

url = URI("https://api.erebor.bank/ach_in/ach_in_01kasd1tthf1ns1pjn1kncctwd")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Patch.new(url)
request["Authorization"] = '<apiKey>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"custom_ref\": \"INBOUND-ACH-2025-04812\",\n  \"custom_fields\": {\n    \"invoice_id\": \"INV-2025-04812\",\n    \"payer\": \"Acme Corporation\"\n  }\n}"

response = http.request(request)
puts response.read_body
```

```java
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.patch("https://api.erebor.bank/ach_in/ach_in_01kasd1tthf1ns1pjn1kncctwd")
  .header("Authorization", "<apiKey>")
  .header("Content-Type", "application/json")
  .body("{\n  \"custom_ref\": \"INBOUND-ACH-2025-04812\",\n  \"custom_fields\": {\n    \"invoice_id\": \"INV-2025-04812\",\n    \"payer\": \"Acme Corporation\"\n  }\n}")
  .asString();
```

```php
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('PATCH', 'https://api.erebor.bank/ach_in/ach_in_01kasd1tthf1ns1pjn1kncctwd', [
  'body' => '{
  "custom_ref": "INBOUND-ACH-2025-04812",
  "custom_fields": {
    "invoice_id": "INV-2025-04812",
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

var client = new RestClient("https://api.erebor.bank/ach_in/ach_in_01kasd1tthf1ns1pjn1kncctwd");
var request = new RestRequest(Method.PATCH);
request.AddHeader("Authorization", "<apiKey>");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"custom_ref\": \"INBOUND-ACH-2025-04812\",\n  \"custom_fields\": {\n    \"invoice_id\": \"INV-2025-04812\",\n    \"payer\": \"Acme Corporation\"\n  }\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = [
  "Authorization": "<apiKey>",
  "Content-Type": "application/json"
]
let parameters = [
  "custom_ref": "INBOUND-ACH-2025-04812",
  "custom_fields": [
    "invoice_id": "INV-2025-04812",
    "payer": "Acme Corporation"
  ]
] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/ach_in/ach_in_01kasd1tthf1ns1pjn1kncctwd")! as URL,
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