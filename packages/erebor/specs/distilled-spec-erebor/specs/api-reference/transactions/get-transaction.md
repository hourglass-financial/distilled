> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Retrieve Transaction

GET https://api.erebor.bank/transactions/{id}

Transactions represent the complete history of balance changes across all accounts. Unlike Payments, which are instructions to move money, transactions are records that represent balance movements in the bank's ledger. This endpoint retrieves a specific Transaction by its ID.


Reference: https://docs.erebor.bank/api-reference/transactions/get-transaction

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /transactions/{id}:
    get:
      operationId: get-transaction
      summary: Retrieve Transaction
      description: >
        Transactions represent the complete history of balance changes across
        all accounts. Unlike Payments, which are instructions to move money,
        transactions are records that represent balance movements in the bank's
        ledger. This endpoint retrieves a specific Transaction by its ID.
      tags:
        - subpackage_transactions
      parameters:
        - name: id
          in: path
          description: Transaction ID
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
      responses:
        '200':
          description: Transaction details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Transaction'
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
servers:
  - url: https://api.erebor.bank
    description: API server (environment determined by API key)
components:
  schemas:
    TransactionStatus:
      type: string
      enum:
        - CREATED
        - PENDING
        - SETTLED
        - FAILED
        - REVERSED
      description: |
        - CREATED: Transaction created but not yet processed
        - PENDING: Transaction processing in progress
        - SETTLED: Transaction successfully completed (terminal state)
        - FAILED: Transaction failed to process (terminal state)
        - REVERSED: Transaction was reversed/refunded (terminal state)
      title: TransactionStatus
    TransactionType:
      type: string
      enum:
        - ACH_IN
        - ACH_OUT
        - WIRE_IN
        - WIRE_OUT
        - INTERNATIONAL_WIRE_IN
        - INTERNATIONAL_WIRE_OUT
        - BLOCKCHAIN_IN
        - BLOCKCHAIN_OUT
        - RAIL_IN
        - RAIL_OUT
        - BOOK_TRANSFER
        - INTEREST
        - FEE
        - ADJUSTMENT
      description: >
        Type of transaction indicating the payment method and direction.

        - ACH_IN/ACH_OUT: ACH transfers

        - WIRE_IN/WIRE_OUT: Domestic wire transfers

        - INTERNATIONAL_WIRE_IN/INTERNATIONAL_WIRE_OUT: International Wire
        transfers

        - BLOCKCHAIN_IN/BLOCKCHAIN_OUT: Cryptocurrency transfers

        - RAIL_IN/RAIL_OUT: Rail transfers

        - BOOK_TRANSFER: Internal account-to-account transfers

        - INTEREST: Interest credited to account

        - FEE: Fee charged to account

        - ADJUSTMENT: Manual adjustment
      title: TransactionType
    Amount:
      type: object
      properties:
        currency:
          type: string
        exponent:
          type: integer
          description: Number of decimal places for display
        value:
          type: string
          description: Amount in smallest currency unit (e.g., cents)
        display_value:
          type: string
          description: Human-readable amount
      required:
        - currency
        - value
      title: Amount
    ResourceReference:
      type: object
      properties:
        type:
          type: string
          description: The type of the referenced resource
        id:
          type: string
          description: The ID of the referenced resource
        url:
          type: string
          format: uri
          description: The URL of the referenced resource
      required:
        - type
        - id
        - url
      title: ResourceReference
    TransactionFrom:
      type: object
      properties:
        type:
          type: string
          description: The type of the referenced resource
        id:
          type: string
          description: The ID of the referenced resource
        url:
          type: string
          format: uri
          description: The URL of the referenced resource
        description:
          type:
            - string
            - 'null'
          description: Optional description for the source
      required:
        - type
        - id
        - url
      description: >-
        Source account or resource for this transaction. `null` for interest
        payments and fees.
      title: TransactionFrom
    TransactionTo:
      type: object
      properties:
        type:
          type: string
          description: The type of the referenced resource
        id:
          type: string
          description: The ID of the referenced resource
        url:
          type: string
          format: uri
          description: The URL of the referenced resource
        description:
          type:
            - string
            - 'null'
          description: Optional description for the destination
      required:
        - type
        - id
        - url
      description: >-
        Destination account or resource for this transaction. `null` for
        interest payments and fees.
      title: TransactionTo
    Transaction:
      type: object
      properties:
        id:
          type: string
          description: Unique identifier for the transaction, prefixed with `txn_`.
        type:
          type: string
          enum:
            - TRANSACTION
          description: Object type. Always `TRANSACTION`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this transaction.
        created_at:
          type: string
          format: date-time
          description: Timestamp of when the transaction was created, in ISO 8601 format.
        updated_at:
          type: string
          format: date-time
          description: >-
            Timestamp of when the transaction was last updated, in ISO 8601
            format.
        archived_at:
          type:
            - string
            - 'null'
          format: date-time
        status:
          $ref: '#/components/schemas/TransactionStatus'
        transaction_type:
          $ref: '#/components/schemas/TransactionType'
        amount:
          $ref: '#/components/schemas/Amount'
        description:
          type: string
          description: Description of the transaction (max 255 characters).
        associated_payments:
          type:
            - array
            - 'null'
          items:
            $ref: '#/components/schemas/ResourceReference'
          description: >-
            Payment resources associated with this transaction. Each entry
            contains the payment's `type`, `id`, and `url`.
        from:
          oneOf:
            - $ref: '#/components/schemas/TransactionFrom'
            - type: 'null'
          description: >-
            Source account or resource for this transaction. `null` for interest
            payments and fees.
        to:
          oneOf:
            - $ref: '#/components/schemas/TransactionTo'
            - type: 'null'
          description: >-
            Destination account or resource for this transaction. `null` for
            interest payments and fees.
      required:
        - id
        - type
        - url
        - created_at
        - updated_at
        - status
        - transaction_type
        - amount
        - description
      title: Transaction
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



**Response**

```json
{
  "id": "txn_01kasd1tthf1ns1pjn1kncctwd",
  "type": "TRANSACTION",
  "url": "https://api.erebor.bank/transactions/txn_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:00:00Z",
  "updated_at": "2025-01-15T09:00:00Z",
  "status": "SETTLED",
  "transaction_type": "WIRE_IN",
  "amount": {
    "currency": "USD",
    "value": "100000",
    "exponent": 2,
    "display_value": "1000.00"
  },
  "description": "Wire transfer from client",
  "archived_at": null,
  "associated_payments": [
    {
      "type": "WIRE_IN",
      "id": "wire_in_01kasd1tthf1ns1pjn1kncctwd",
      "url": "https://api.erebor.bank/wire_in/wire_in_01kasd1tthf1ns1pjn1kncctwd"
    }
  ],
  "from": {
    "id": "cp_us_bank_acct_01kasd1tthf1ns1pjn1kncctwd",
    "type": "COUNTERPARTY_US_BANK_ACCOUNT",
    "url": "https://api.erebor.bank/counterparty_us_bank_accounts/cp_us_bank_acct_01kasd1tthf1ns1pjn1kncctwd",
    "description": "Client wire account"
  },
  "to": {
    "id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
    "type": "DEPOSIT_ACCOUNT",
    "url": "https://api.erebor.bank/deposit_accounts/dep_acct_01kasd1tthf1ns1pjn1kncctwd",
    "description": "Main operating account"
  }
}
```

**SDK Code**

```python Wire transfer incoming
import requests

url = "https://api.erebor.bank/transactions/txn_01kasd1tthf1ns1pjn1kncctwd"

headers = {"Authorization": "<apiKey>"}

response = requests.get(url, headers=headers)

print(response.json())
```

```javascript Wire transfer incoming
const url = 'https://api.erebor.bank/transactions/txn_01kasd1tthf1ns1pjn1kncctwd';
const options = {method: 'GET', headers: {Authorization: '<apiKey>'}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go Wire transfer incoming
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/transactions/txn_01kasd1tthf1ns1pjn1kncctwd"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("Authorization", "<apiKey>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby Wire transfer incoming
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/transactions/txn_01kasd1tthf1ns1pjn1kncctwd")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["Authorization"] = '<apiKey>'

response = http.request(request)
puts response.read_body
```

```java Wire transfer incoming
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.get("https://api.erebor.bank/transactions/txn_01kasd1tthf1ns1pjn1kncctwd")
  .header("Authorization", "<apiKey>")
  .asString();
```

```php Wire transfer incoming
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('GET', 'https://api.erebor.bank/transactions/txn_01kasd1tthf1ns1pjn1kncctwd', [
  'headers' => [
    'Authorization' => '<apiKey>',
  ],
]);

echo $response->getBody();
```

```csharp Wire transfer incoming
using RestSharp;

var client = new RestClient("https://api.erebor.bank/transactions/txn_01kasd1tthf1ns1pjn1kncctwd");
var request = new RestRequest(Method.GET);
request.AddHeader("Authorization", "<apiKey>");
IRestResponse response = client.Execute(request);
```

```swift Wire transfer incoming
import Foundation

let headers = ["Authorization": "<apiKey>"]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/transactions/txn_01kasd1tthf1ns1pjn1kncctwd")! as URL,
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