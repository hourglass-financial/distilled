> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# List Counterparty US Bank Accounts

GET https://api.erebor.bank/counterparty_us_bank_accounts

Retrieve a paginated list of Counterparty US Bank Accounts

Reference: https://docs.erebor.bank/api-reference/counterparties/us-bank-accounts/list-counterparty-us-bank-accounts

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /counterparty_us_bank_accounts:
    get:
      operationId: list-counterparty-us-bank-accounts
      summary: List Counterparty US Bank Accounts
      description: Retrieve a paginated list of Counterparty US Bank Accounts
      tags:
        - subpackage_counterpartyUsBankAccounts
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
        - name: counterparty_id
          in: query
          description: Filter by Counterparty ID
          required: false
          schema:
            type: string
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
          description: List of Counterparty US Bank Accounts
          content:
            application/json:
              schema:
                $ref: >-
                  #/components/schemas/COUNTERPARTY_US_BANK_ACCOUNTS_listCounterpartyUSBankAccounts_Response_200
servers:
  - url: https://api.erebor.bank
    description: API server (environment determined by API key)
components:
  schemas:
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
    CounterpartyUSBankAccount:
      type: object
      properties:
        id:
          type: string
          description: >-
            Unique identifier for the counterparty US bank account, prefixed
            with `cp_us_bank_acct_`.
        type:
          type: string
          enum:
            - COUNTERPARTY_US_BANK_ACCOUNT
          description: Object type. Always `COUNTERPARTY_US_BANK_ACCOUNT`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this counterparty US bank account.
        created_at:
          type: string
          format: date-time
          description: Timestamp of when the account was created, in ISO 8601 format.
        updated_at:
          type: string
          format: date-time
          description: Timestamp of when the account was last updated, in ISO 8601 format.
        archived_at:
          type:
            - string
            - 'null'
          format: date-time
        customer_id:
          type:
            - string
            - 'null'
          description: ID of the customer this account belongs to, prefixed with `cust_`.
        program_id:
          type:
            - string
            - 'null'
          description: ID of the program this account belongs to, prefixed with `prgrm_`.
        counterparty_id:
          type:
            - string
            - 'null'
          description: >-
            ID of the counterparty this bank account is linked to, prefixed with
            `cp_`.
        description:
          type: string
          description: >-
            User-friendly description for this bank account (max 100
            characters).
        account_number:
          type: string
          description: Bank account number (max 17 characters).
        routing_number:
          type: string
          description: Nine-digit ABA routing number.
        bank_name:
          type:
            - string
            - 'null'
          description: Bank name associated with the routing number.
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
        - description
        - account_number
        - routing_number
      title: CounterpartyUSBankAccount
    COUNTERPARTY_US_BANK_ACCOUNTS_listCounterpartyUSBankAccounts_Response_200:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/CounterpartyUSBankAccount'
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
        COUNTERPARTY_US_BANK_ACCOUNTS_listCounterpartyUSBankAccounts_Response_200
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
  "url": "https://api.erebor.bank/counterparty_us_bank_accounts?page_size=1",
  "data": [
    {
      "id": "cp_us_bank_acct_01kasd1tthf1ns1pjn1kncctwd",
      "type": "COUNTERPARTY_US_BANK_ACCOUNT",
      "url": "https://api.erebor.bank/counterparty_us_bank_accounts/cp_us_bank_acct_01kasd1tthf1ns1pjn1kncctwd",
      "created_at": "2025-01-15T09:00:00Z",
      "updated_at": "2025-01-15T09:00:00Z",
      "description": "Primary USD Account",
      "account_number": "123456789",
      "routing_number": "125109161",
      "archived_at": null,
      "customer_id": "cust_01kasd1tthf1ns1pjn1kncctwd",
      "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
      "counterparty_id": "cp_01kasd1tthf1ns1pjn1kncctwd",
      "bank_name": "Example National Bank",
      "custom_ref": "CP-USBA-2025-001",
      "custom_fields": {
        "aba_verified": "true",
        "bank_name": "Wells Fargo"
      }
    }
  ],
  "page_next": "https://api.erebor.bank/counterparty_us_bank_accounts?starting_after=cp_us_bank_acct_01kasd1tthf1ns1pjn1kncctwd&page_size=1",
  "page_prev": null
}
```

**SDK Code**

```python List of Counterparty US Bank Accounts
import requests

url = "https://api.erebor.bank/counterparty_us_bank_accounts"

headers = {"Authorization": "<apiKey>"}

response = requests.get(url, headers=headers)

print(response.json())
```

```javascript List of Counterparty US Bank Accounts
const url = 'https://api.erebor.bank/counterparty_us_bank_accounts';
const options = {method: 'GET', headers: {Authorization: '<apiKey>'}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go List of Counterparty US Bank Accounts
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/counterparty_us_bank_accounts"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("Authorization", "<apiKey>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby List of Counterparty US Bank Accounts
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/counterparty_us_bank_accounts")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["Authorization"] = '<apiKey>'

response = http.request(request)
puts response.read_body
```

```java List of Counterparty US Bank Accounts
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.get("https://api.erebor.bank/counterparty_us_bank_accounts")
  .header("Authorization", "<apiKey>")
  .asString();
```

```php List of Counterparty US Bank Accounts
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('GET', 'https://api.erebor.bank/counterparty_us_bank_accounts', [
  'headers' => [
    'Authorization' => '<apiKey>',
  ],
]);

echo $response->getBody();
```

```csharp List of Counterparty US Bank Accounts
using RestSharp;

var client = new RestClient("https://api.erebor.bank/counterparty_us_bank_accounts");
var request = new RestRequest(Method.GET);
request.AddHeader("Authorization", "<apiKey>");
IRestResponse response = client.Execute(request);
```

```swift List of Counterparty US Bank Accounts
import Foundation

let headers = ["Authorization": "<apiKey>"]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/counterparty_us_bank_accounts")! as URL,
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