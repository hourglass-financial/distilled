> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Create Outbound Rail Transfer

POST https://api.erebor.bank/rail_out
Content-Type: application/json

Create a new Outbound Rail Transfer

Reference: https://docs.erebor.bank/api-reference/payments/rail/outbound/create-outbound-rail-transfer

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /rail_out:
    post:
      operationId: create-outbound-rail-transfer
      summary: Create Outbound Rail Transfer
      description: Create a new Outbound Rail Transfer
      tags:
        - subpackage_outboundRailTransfers
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
          description: Outbound Rail Transfer created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OutboundRailTransfer'
        '422':
          description: Validation error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OutboundRailTransferValidationError'
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateOutboundRailTransferRequest'
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
    CreateOutboundRailTransferRequest:
      type: object
      properties:
        from_deposit_account_id:
          type: string
          description: Deposit account sending the Outbound Rail transfer
        counterparty_rail_address_id:
          type:
            - string
            - 'null'
          description: >-
            Counterparty Rail address receiving the transfer. Provide this or
            `to_deposit_account_id`, but not both.
        to_deposit_account_id:
          type:
            - string
            - 'null'
          description: >-
            Destination deposit account on Erebor. Provide this or
            `counterparty_rail_address_id`, but not both.
        amount:
          $ref: '#/components/schemas/FiatInAmount'
        memo:
          type:
            - string
            - 'null'
          description: >-
            Optional message included in the Rail transfer, visible to both
            parties
        internal_note:
          type:
            - string
            - 'null'
          description: Private note visible only to the sender
        custom_ref:
          $ref: '#/components/schemas/CustomRef'
        custom_fields:
          $ref: '#/components/schemas/CustomFields'
      required:
        - from_deposit_account_id
        - amount
      title: CreateOutboundRailTransferRequest
    OutboundRailTransferStatus:
      type: string
      enum:
        - PENDING
        - SETTLED
        - FAILED
      description: |
        Outbound Rail transfer status:
        - PENDING: Rail transfer is being processed
        - SETTLED: Rail transfer has been completed
        - FAILED: Rail transfer failed
      title: OutboundRailTransferStatus
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
    OutboundRailTransfer:
      type: object
      properties:
        id:
          type: string
          description: >-
            Unique identifier for the outbound rail transfer, prefixed with
            `rail_out_`.
        type:
          type: string
          enum:
            - RAIL_OUT
          description: Object type. Always `RAIL_OUT`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this outbound rail transfer.
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
          $ref: '#/components/schemas/OutboundRailTransferStatus'
        from_deposit_account_id:
          type: string
          description: >-
            ID of the deposit account sending the transfer, prefixed with
            `dep_acct_`.
        counterparty_rail_address_id:
          type:
            - string
            - 'null'
          description: >-
            ID of the external counterparty rail address receiving the transfer,
            prefixed with `cp_rail_addr_`.
        to_deposit_account_id:
          type:
            - string
            - 'null'
          description: >-
            ID of the destination deposit account if sending to another Erebor
            account, prefixed with `dep_acct_`.
        amount:
          $ref: '#/components/schemas/FiatAmount'
        memo:
          type:
            - string
            - 'null'
          description: Optional message included in the rail transfer.
        internal_note:
          type:
            - string
            - 'null'
          description: Private note visible only to the sender.
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
        - amount
      title: OutboundRailTransfer
    OutboundRailTransferValidationErrorCode:
      type: string
      enum:
        - INVALID_CURRENCY
        - INVALID_REQUEST
      description: Machine-readable error code
      title: OutboundRailTransferValidationErrorCode
    OutboundRailTransferValidationError:
      type: object
      properties:
        error:
          type: string
          description: Human-readable error message
        code:
          $ref: '#/components/schemas/OutboundRailTransferValidationErrorCode'
          description: Machine-readable error code
        field:
          type:
            - string
            - 'null'
          description: The field that caused the validation error
      required:
        - error
        - code
      title: OutboundRailTransferValidationError
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

### Created Outbound Rail Transfer



**Request**

```json
undefined
```

**Response**

```json
{
  "id": "rail_out_01kasd1tthf1ns1pjn1kncctwd",
  "type": "RAIL_OUT",
  "url": "https://api.erebor.bank/rail_out/rail_out_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:00:00Z",
  "updated_at": "2025-01-15T09:00:00Z",
  "status": "SETTLED",
  "from_deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "amount": {
    "currency": "USD",
    "exponent": 2,
    "value": "12345",
    "display_value": "123.45"
  },
  "archived_at": null,
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "counterparty_rail_address_id": "cp_rail_addr_01kasd1tthf1ns1pjn1kncctwd",
  "to_deposit_account_id": null,
  "memo": "Invoice #12345 - Q4 Services",
  "internal_note": null,
  "custom_ref": "RAIL-2025-001",
  "custom_fields": {
    "invoice_id": "INV-RAIL-2025-04812",
    "cycle": "weekly"
  }
}
```

**SDK Code**

```python Created Outbound Rail Transfer
import requests

url = "https://api.erebor.bank/rail_out"

headers = {
    "Authorization": "<apiKey>",
    "Content-Type": "application/json"
}

response = requests.post(url, headers=headers)

print(response.json())
```

```javascript Created Outbound Rail Transfer
const url = 'https://api.erebor.bank/rail_out';
const options = {
  method: 'POST',
  headers: {Authorization: '<apiKey>', 'Content-Type': 'application/json'},
  body: undefined
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go Created Outbound Rail Transfer
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/rail_out"

	req, _ := http.NewRequest("POST", url, nil)

	req.Header.Add("Authorization", "<apiKey>")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby Created Outbound Rail Transfer
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/rail_out")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Authorization"] = '<apiKey>'
request["Content-Type"] = 'application/json'

response = http.request(request)
puts response.read_body
```

```java Created Outbound Rail Transfer
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.post("https://api.erebor.bank/rail_out")
  .header("Authorization", "<apiKey>")
  .header("Content-Type", "application/json")
  .asString();
```

```php Created Outbound Rail Transfer
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://api.erebor.bank/rail_out', [
  'headers' => [
    'Authorization' => '<apiKey>',
    'Content-Type' => 'application/json',
  ],
]);

echo $response->getBody();
```

```csharp Created Outbound Rail Transfer
using RestSharp;

var client = new RestClient("https://api.erebor.bank/rail_out");
var request = new RestRequest(Method.POST);
request.AddHeader("Authorization", "<apiKey>");
request.AddHeader("Content-Type", "application/json");
IRestResponse response = client.Execute(request);
```

```swift Created Outbound Rail Transfer
import Foundation

let headers = [
  "Authorization": "<apiKey>",
  "Content-Type": "application/json"
]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/rail_out")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "POST"
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

### Send to counterparty Rail address



**Request**

```json
{
  "from_deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "amount": {
    "currency": "USD",
    "value": "12345"
  },
  "counterparty_rail_address_id": "cp_rail_addr_01kasd1tthf1ns1pjn1kncctwd",
  "memo": "Invoice #12345 - Q4 Services",
  "custom_ref": "RAIL-2025-001",
  "custom_fields": {
    "invoice_id": "INV-RAIL-2025-04812",
    "cycle": "weekly"
  }
}
```

**Response**

```json
{
  "id": "rail_out_01kasd1tthf1ns1pjn1kncctwd",
  "type": "RAIL_OUT",
  "url": "https://api.erebor.bank/rail_out/rail_out_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:00:00Z",
  "updated_at": "2025-01-15T09:00:00Z",
  "status": "SETTLED",
  "from_deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "amount": {
    "currency": "USD",
    "exponent": 2,
    "value": "12345",
    "display_value": "123.45"
  },
  "archived_at": null,
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "counterparty_rail_address_id": "cp_rail_addr_01kasd1tthf1ns1pjn1kncctwd",
  "to_deposit_account_id": null,
  "memo": "Invoice #12345 - Q4 Services",
  "internal_note": null,
  "custom_ref": "RAIL-2025-001",
  "custom_fields": {
    "invoice_id": "INV-RAIL-2025-04812",
    "cycle": "weekly"
  }
}
```

**SDK Code**

```python Send to counterparty Rail address
import requests

url = "https://api.erebor.bank/rail_out"

payload = {
    "from_deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
    "amount": {
        "currency": "USD",
        "value": "12345"
    },
    "counterparty_rail_address_id": "cp_rail_addr_01kasd1tthf1ns1pjn1kncctwd",
    "memo": "Invoice #12345 - Q4 Services",
    "custom_ref": "RAIL-2025-001",
    "custom_fields": {
        "invoice_id": "INV-RAIL-2025-04812",
        "cycle": "weekly"
    }
}
headers = {
    "Authorization": "<apiKey>",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.json())
```

```javascript Send to counterparty Rail address
const url = 'https://api.erebor.bank/rail_out';
const options = {
  method: 'POST',
  headers: {Authorization: '<apiKey>', 'Content-Type': 'application/json'},
  body: '{"from_deposit_account_id":"dep_acct_01kasd1tthf1ns1pjn1kncctwd","amount":{"currency":"USD","value":"12345"},"counterparty_rail_address_id":"cp_rail_addr_01kasd1tthf1ns1pjn1kncctwd","memo":"Invoice #12345 - Q4 Services","custom_ref":"RAIL-2025-001","custom_fields":{"invoice_id":"INV-RAIL-2025-04812","cycle":"weekly"}}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go Send to counterparty Rail address
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/rail_out"

	payload := strings.NewReader("{\n  \"from_deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\",\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"12345\"\n  },\n  \"counterparty_rail_address_id\": \"cp_rail_addr_01kasd1tthf1ns1pjn1kncctwd\",\n  \"memo\": \"Invoice #12345 - Q4 Services\",\n  \"custom_ref\": \"RAIL-2025-001\",\n  \"custom_fields\": {\n    \"invoice_id\": \"INV-RAIL-2025-04812\",\n    \"cycle\": \"weekly\"\n  }\n}")

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

```ruby Send to counterparty Rail address
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/rail_out")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Authorization"] = '<apiKey>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"from_deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\",\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"12345\"\n  },\n  \"counterparty_rail_address_id\": \"cp_rail_addr_01kasd1tthf1ns1pjn1kncctwd\",\n  \"memo\": \"Invoice #12345 - Q4 Services\",\n  \"custom_ref\": \"RAIL-2025-001\",\n  \"custom_fields\": {\n    \"invoice_id\": \"INV-RAIL-2025-04812\",\n    \"cycle\": \"weekly\"\n  }\n}"

response = http.request(request)
puts response.read_body
```

```java Send to counterparty Rail address
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.post("https://api.erebor.bank/rail_out")
  .header("Authorization", "<apiKey>")
  .header("Content-Type", "application/json")
  .body("{\n  \"from_deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\",\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"12345\"\n  },\n  \"counterparty_rail_address_id\": \"cp_rail_addr_01kasd1tthf1ns1pjn1kncctwd\",\n  \"memo\": \"Invoice #12345 - Q4 Services\",\n  \"custom_ref\": \"RAIL-2025-001\",\n  \"custom_fields\": {\n    \"invoice_id\": \"INV-RAIL-2025-04812\",\n    \"cycle\": \"weekly\"\n  }\n}")
  .asString();
```

```php Send to counterparty Rail address
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://api.erebor.bank/rail_out', [
  'body' => '{
  "from_deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "amount": {
    "currency": "USD",
    "value": "12345"
  },
  "counterparty_rail_address_id": "cp_rail_addr_01kasd1tthf1ns1pjn1kncctwd",
  "memo": "Invoice #12345 - Q4 Services",
  "custom_ref": "RAIL-2025-001",
  "custom_fields": {
    "invoice_id": "INV-RAIL-2025-04812",
    "cycle": "weekly"
  }
}',
  'headers' => [
    'Authorization' => '<apiKey>',
    'Content-Type' => 'application/json',
  ],
]);

echo $response->getBody();
```

```csharp Send to counterparty Rail address
using RestSharp;

var client = new RestClient("https://api.erebor.bank/rail_out");
var request = new RestRequest(Method.POST);
request.AddHeader("Authorization", "<apiKey>");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"from_deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\",\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"12345\"\n  },\n  \"counterparty_rail_address_id\": \"cp_rail_addr_01kasd1tthf1ns1pjn1kncctwd\",\n  \"memo\": \"Invoice #12345 - Q4 Services\",\n  \"custom_ref\": \"RAIL-2025-001\",\n  \"custom_fields\": {\n    \"invoice_id\": \"INV-RAIL-2025-04812\",\n    \"cycle\": \"weekly\"\n  }\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift Send to counterparty Rail address
import Foundation

let headers = [
  "Authorization": "<apiKey>",
  "Content-Type": "application/json"
]
let parameters = [
  "from_deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "amount": [
    "currency": "USD",
    "value": "12345"
  ],
  "counterparty_rail_address_id": "cp_rail_addr_01kasd1tthf1ns1pjn1kncctwd",
  "memo": "Invoice #12345 - Q4 Services",
  "custom_ref": "RAIL-2025-001",
  "custom_fields": [
    "invoice_id": "INV-RAIL-2025-04812",
    "cycle": "weekly"
  ]
] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/rail_out")! as URL,
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

### Send to deposit account



**Request**

```json
{
  "from_deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "amount": {
    "currency": "USD",
    "value": "150000"
  },
  "to_deposit_account_id": "dep_acct_02kasd1tthf1ns1pjn1kncctwd",
  "memo": "Funding sub-account",
  "custom_ref": "RAIL-2025-001",
  "custom_fields": {
    "invoice_id": "INV-RAIL-2025-04812",
    "cycle": "weekly"
  }
}
```

**Response**

```json
{
  "id": "rail_out_01kasd1tthf1ns1pjn1kncctwd",
  "type": "RAIL_OUT",
  "url": "https://api.erebor.bank/rail_out/rail_out_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:00:00Z",
  "updated_at": "2025-01-15T09:00:00Z",
  "status": "SETTLED",
  "from_deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "amount": {
    "currency": "USD",
    "exponent": 2,
    "value": "12345",
    "display_value": "123.45"
  },
  "archived_at": null,
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "counterparty_rail_address_id": "cp_rail_addr_01kasd1tthf1ns1pjn1kncctwd",
  "to_deposit_account_id": null,
  "memo": "Invoice #12345 - Q4 Services",
  "internal_note": null,
  "custom_ref": "RAIL-2025-001",
  "custom_fields": {
    "invoice_id": "INV-RAIL-2025-04812",
    "cycle": "weekly"
  }
}
```

**SDK Code**

```python Send to deposit account
import requests

url = "https://api.erebor.bank/rail_out"

payload = {
    "from_deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
    "amount": {
        "currency": "USD",
        "value": "150000"
    },
    "to_deposit_account_id": "dep_acct_02kasd1tthf1ns1pjn1kncctwd",
    "memo": "Funding sub-account",
    "custom_ref": "RAIL-2025-001",
    "custom_fields": {
        "invoice_id": "INV-RAIL-2025-04812",
        "cycle": "weekly"
    }
}
headers = {
    "Authorization": "<apiKey>",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.json())
```

```javascript Send to deposit account
const url = 'https://api.erebor.bank/rail_out';
const options = {
  method: 'POST',
  headers: {Authorization: '<apiKey>', 'Content-Type': 'application/json'},
  body: '{"from_deposit_account_id":"dep_acct_01kasd1tthf1ns1pjn1kncctwd","amount":{"currency":"USD","value":"150000"},"to_deposit_account_id":"dep_acct_02kasd1tthf1ns1pjn1kncctwd","memo":"Funding sub-account","custom_ref":"RAIL-2025-001","custom_fields":{"invoice_id":"INV-RAIL-2025-04812","cycle":"weekly"}}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go Send to deposit account
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/rail_out"

	payload := strings.NewReader("{\n  \"from_deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\",\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"150000\"\n  },\n  \"to_deposit_account_id\": \"dep_acct_02kasd1tthf1ns1pjn1kncctwd\",\n  \"memo\": \"Funding sub-account\",\n  \"custom_ref\": \"RAIL-2025-001\",\n  \"custom_fields\": {\n    \"invoice_id\": \"INV-RAIL-2025-04812\",\n    \"cycle\": \"weekly\"\n  }\n}")

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

```ruby Send to deposit account
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/rail_out")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Authorization"] = '<apiKey>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"from_deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\",\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"150000\"\n  },\n  \"to_deposit_account_id\": \"dep_acct_02kasd1tthf1ns1pjn1kncctwd\",\n  \"memo\": \"Funding sub-account\",\n  \"custom_ref\": \"RAIL-2025-001\",\n  \"custom_fields\": {\n    \"invoice_id\": \"INV-RAIL-2025-04812\",\n    \"cycle\": \"weekly\"\n  }\n}"

response = http.request(request)
puts response.read_body
```

```java Send to deposit account
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.post("https://api.erebor.bank/rail_out")
  .header("Authorization", "<apiKey>")
  .header("Content-Type", "application/json")
  .body("{\n  \"from_deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\",\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"150000\"\n  },\n  \"to_deposit_account_id\": \"dep_acct_02kasd1tthf1ns1pjn1kncctwd\",\n  \"memo\": \"Funding sub-account\",\n  \"custom_ref\": \"RAIL-2025-001\",\n  \"custom_fields\": {\n    \"invoice_id\": \"INV-RAIL-2025-04812\",\n    \"cycle\": \"weekly\"\n  }\n}")
  .asString();
```

```php Send to deposit account
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://api.erebor.bank/rail_out', [
  'body' => '{
  "from_deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "amount": {
    "currency": "USD",
    "value": "150000"
  },
  "to_deposit_account_id": "dep_acct_02kasd1tthf1ns1pjn1kncctwd",
  "memo": "Funding sub-account",
  "custom_ref": "RAIL-2025-001",
  "custom_fields": {
    "invoice_id": "INV-RAIL-2025-04812",
    "cycle": "weekly"
  }
}',
  'headers' => [
    'Authorization' => '<apiKey>',
    'Content-Type' => 'application/json',
  ],
]);

echo $response->getBody();
```

```csharp Send to deposit account
using RestSharp;

var client = new RestClient("https://api.erebor.bank/rail_out");
var request = new RestRequest(Method.POST);
request.AddHeader("Authorization", "<apiKey>");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"from_deposit_account_id\": \"dep_acct_01kasd1tthf1ns1pjn1kncctwd\",\n  \"amount\": {\n    \"currency\": \"USD\",\n    \"value\": \"150000\"\n  },\n  \"to_deposit_account_id\": \"dep_acct_02kasd1tthf1ns1pjn1kncctwd\",\n  \"memo\": \"Funding sub-account\",\n  \"custom_ref\": \"RAIL-2025-001\",\n  \"custom_fields\": {\n    \"invoice_id\": \"INV-RAIL-2025-04812\",\n    \"cycle\": \"weekly\"\n  }\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift Send to deposit account
import Foundation

let headers = [
  "Authorization": "<apiKey>",
  "Content-Type": "application/json"
]
let parameters = [
  "from_deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "amount": [
    "currency": "USD",
    "value": "150000"
  ],
  "to_deposit_account_id": "dep_acct_02kasd1tthf1ns1pjn1kncctwd",
  "memo": "Funding sub-account",
  "custom_ref": "RAIL-2025-001",
  "custom_fields": [
    "invoice_id": "INV-RAIL-2025-04812",
    "cycle": "weekly"
  ]
] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/rail_out")! as URL,
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