> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Create Book Transfer

POST https://api.erebor.bank/book_transfers
Content-Type: application/json

Create a new Book Transfer between two accounts

Reference: https://docs.erebor.bank/api-reference/payments/book-transfers/create-book-transfer

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /book_transfers:
    post:
      operationId: create-book-transfer
      summary: Create Book Transfer
      description: Create a new Book Transfer between two accounts
      tags:
        - subpackage_bookTransfers
      parameters:
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
          description: Book transfer created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BookTransfer'
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
              $ref: '#/components/schemas/CreateBookTransferRequest'
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
    CreateBookTransferRequest:
      type: object
      properties:
        from_deposit_account_id:
          type: string
        to_deposit_account_id:
          type: string
        amount:
          $ref: '#/components/schemas/FiatInAmount'
        memo:
          type:
            - string
            - 'null'
        custom_ref:
          $ref: '#/components/schemas/CustomRef'
        custom_fields:
          $ref: '#/components/schemas/CustomFields'
      required:
        - from_deposit_account_id
        - to_deposit_account_id
        - amount
      title: CreateBookTransferRequest
    BookTransferStatus:
      type: string
      enum:
        - PENDING
        - FAILED
        - SETTLED
      description: |
        - PENDING: Transfer submitted and processing
        - FAILED: Transfer failed
        - SETTLED: Transfer complete and settled
      title: BookTransferStatus
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
    BookTransfer:
      type: object
      properties:
        id:
          type: string
          description: Unique identifier for the book transfer, prefixed with `bk_`.
        type:
          type: string
          enum:
            - BOOK_TRANSFER
          description: Object type. Always `BOOK_TRANSFER`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this book transfer.
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
          $ref: '#/components/schemas/BookTransferStatus'
        from_deposit_account_id:
          type: string
          description: >-
            ID of the deposit account sending the funds, prefixed with
            `dep_acct_`.
        to_deposit_account_id:
          type: string
          description: >-
            ID of the deposit account receiving the funds, prefixed with
            `dep_acct_`.
        amount:
          $ref: '#/components/schemas/FiatAmount'
        memo:
          type:
            - string
            - 'null'
          description: Optional memo for the transfer (max 255 characters).
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
        - from_deposit_account_id
        - to_deposit_account_id
        - amount
      title: BookTransfer
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
  "from_deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "to_deposit_account_id": "dep_acct_01jasd2tthf2ns2pjn2kncctwd",
  "amount": {
    "currency": "USD",
    "value": "100000"
  },
  "memo": "Monthly allocation transfer",
  "custom_ref": "INTERNAL-2025-001",
  "custom_fields": {
    "allocation_type": "monthly_sweep",
    "fiscal_period": "2025-Q1"
  }
}
```

**Response**

```json
{
  "id": "bk_01kasd1tthf1ns1pjn1kncctwd",
  "type": "BOOK_TRANSFER",
  "url": "https://api.erebor.bank/book_transfers/bk_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T09:30:00Z",
  "status": "PENDING",
  "from_deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "to_deposit_account_id": "dep_acct_01jasd2tthf2ns2pjn2kncctwd",
  "amount": {
    "currency": "USD",
    "exponent": 2,
    "value": "12345",
    "display_value": "123.45"
  },
  "archived_at": null,
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "memo": "Monthly allocation transfer",
  "custom_ref": "INTERNAL-2025-001",
  "custom_fields": {
    "allocation_type": "monthly_sweep",
    "fiscal_period": "2025-Q1"
  }
}
```

**SDK Code**

```python
import requests

url = "https://api.erebor.bank/book_transfers"

payload = {
    "from_deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
    "to_deposit_account_id": "dep_acct_01jasd2tthf2ns2pjn2kncctwd",
    "amount": {
        "currency": "USD",
        "value": "100000"
    },
    "memo": "Monthly allocation transfer",
    "custom_ref": "INTERNAL-2025-001",
    "custom_fields": {
        "allocation_type": "monthly_sweep",
        "fiscal_period": "2025-Q1"
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
const url = 'https://api.erebor.bank/book_transfers';
const options = {
  method: 'POST',
  headers: {Authorization: '<apiKey>', 'Content-Type': 'application/json'},
  body: '{"from_deposit_account_id":"dep_acct_01kasd1tthf1ns1pjn1kncctwd","to_deposit_account_id":"dep_acct_01jasd2tthf2ns2pjn2kncctwd","amount":{"currency":"USD","value":"100000"},"memo":"Monthly allocation transfer","custom_ref":"INTERNAL-2025-001","custom_fields":{"allocation_type":"monthly_sweep","fiscal_period":"2025-Q1"}}'
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

	url := "https://api.erebor.bank/book_transfers"

	payload := strings.NewReader("{\n  \"from_deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\",\n  \"to_deposit_account_id\": \"dep_acct_01jasd2tthf2ns2pjn2kncctwd\",\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"100000\"\n  },\n  \"memo\": \"Monthly allocation transfer\",\n  \"custom_ref\": \"INTERNAL-2025-001\",\n  \"custom_fields\": {\n    \"allocation_type\": \"monthly_sweep\",\n    \"fiscal_period\": \"2025-Q1\"\n  }\n}")

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

url = URI("https://api.erebor.bank/book_transfers")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Authorization"] = '<apiKey>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"from_deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\",\n  \"to_deposit_account_id\": \"dep_acct_01jasd2tthf2ns2pjn2kncctwd\",\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"100000\"\n  },\n  \"memo\": \"Monthly allocation transfer\",\n  \"custom_ref\": \"INTERNAL-2025-001\",\n  \"custom_fields\": {\n    \"allocation_type\": \"monthly_sweep\",\n    \"fiscal_period\": \"2025-Q1\"\n  }\n}"

response = http.request(request)
puts response.read_body
```

```java
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.post("https://api.erebor.bank/book_transfers")
  .header("Authorization", "<apiKey>")
  .header("Content-Type", "application/json")
  .body("{\n  \"from_deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\",\n  \"to_deposit_account_id\": \"dep_acct_01jasd2tthf2ns2pjn2kncctwd\",\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"100000\"\n  },\n  \"memo\": \"Monthly allocation transfer\",\n  \"custom_ref\": \"INTERNAL-2025-001\",\n  \"custom_fields\": {\n    \"allocation_type\": \"monthly_sweep\",\n    \"fiscal_period\": \"2025-Q1\"\n  }\n}")
  .asString();
```

```php
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://api.erebor.bank/book_transfers', [
  'body' => '{
  "from_deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "to_deposit_account_id": "dep_acct_01jasd2tthf2ns2pjn2kncctwd",
  "amount": {
    "currency": "USD",
    "value": "100000"
  },
  "memo": "Monthly allocation transfer",
  "custom_ref": "INTERNAL-2025-001",
  "custom_fields": {
    "allocation_type": "monthly_sweep",
    "fiscal_period": "2025-Q1"
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

var client = new RestClient("https://api.erebor.bank/book_transfers");
var request = new RestRequest(Method.POST);
request.AddHeader("Authorization", "<apiKey>");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"from_deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\",\n  \"to_deposit_account_id\": \"dep_acct_01jasd2tthf2ns2pjn2kncctwd\",\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"100000\"\n  },\n  \"memo\": \"Monthly allocation transfer\",\n  \"custom_ref\": \"INTERNAL-2025-001\",\n  \"custom_fields\": {\n    \"allocation_type\": \"monthly_sweep\",\n    \"fiscal_period\": \"2025-Q1\"\n  }\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = [
  "Authorization": "<apiKey>",
  "Content-Type": "application/json"
]
let parameters = [
  "from_deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "to_deposit_account_id": "dep_acct_01jasd2tthf2ns2pjn2kncctwd",
  "amount": [
    "currency": "USD",
    "value": "100000"
  ],
  "memo": "Monthly allocation transfer",
  "custom_ref": "INTERNAL-2025-001",
  "custom_fields": [
    "allocation_type": "monthly_sweep",
    "fiscal_period": "2025-Q1"
  ]
] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/book_transfers")! as URL,
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