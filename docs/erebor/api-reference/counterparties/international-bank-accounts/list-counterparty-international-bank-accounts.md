> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# List Counterparty International Bank Accounts

GET https://api.erebor.bank/counterparty_international_bank_accounts

Retrieve a paginated list of Counterparty International Bank Accounts

Reference: https://docs.erebor.bank/api-reference/counterparties/international-bank-accounts/list-counterparty-international-bank-accounts

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /counterparty_international_bank_accounts:
    get:
      operationId: list-counterparty-international-bank-accounts
      summary: List Counterparty International Bank Accounts
      description: Retrieve a paginated list of Counterparty International Bank Accounts
      tags:
        - subpackage_counterpartyInternationalBankAccounts
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
      responses:
        '200':
          description: List of Counterparty International Bank Accounts
          content:
            application/json:
              schema:
                $ref: >-
                  #/components/schemas/COUNTERPARTY_INTERNATIONAL_BANK_ACCOUNTS_listCounterpartyInternationalBankAccounts_Response_200
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
    CanadaAdditionalAccountNumberData:
      type: object
      properties:
        institution_number:
          type: string
          description: 3-digit bank institution number.
        transit_number:
          type: string
          description: 5-digit branch transit number.
        account_number:
          type: string
          description: >-
            Deprecated and optional. Instead use the top-level `account_number`,
            which is a 7-12 digit number (`^[0-9]{7,12}$`).
      required:
        - institution_number
        - transit_number
      title: CanadaAdditionalAccountNumberData
    AdditionalAccountNumberData:
      type: object
      properties:
        canada:
          oneOf:
            - $ref: '#/components/schemas/CanadaAdditionalAccountNumberData'
            - type: 'null'
      description: >-
        Per-country additional account data. Exactly one country property will
        be populated.
      title: AdditionalAccountNumberData
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
    CounterpartyInternationalBankAccount:
      type: object
      properties:
        id:
          type: string
          description: >-
            Unique identifier for the international bank account, prefixed with
            `cp_intl_bank_acct_`.
        type:
          type: string
          enum:
            - COUNTERPARTY_INTERNATIONAL_BANK_ACCOUNT
          description: Object type. Always `COUNTERPARTY_INTERNATIONAL_BANK_ACCOUNT`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this international bank account.
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
          description: User-friendly description for this bank account
        account_number:
          type: string
          description: >-
            Account number (e.g., IBAN, international account number, or other
            type of account number). Max 34 characters. For IBAN countries the
            IBAN format is applied (`^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$`). For
            non-IBAN countries the format is country-specific — for Canada, see
            `additional_account_number_data.canada`.
        bic:
          type: string
          description: >-
            Bank Identifier Code (SWIFT code). Currently supported countries: AU
            (Australia), BM (Bermuda), BR (Brazil), CA (Canada), DE (Germany),
            FR (France), GB (United Kingdom), HK (Hong Kong), NL (Netherlands),
            PT (Portugal).
        country_code:
          type: string
          description: ISO 3166-1 alpha-2 country code
        additional_account_number_data:
          oneOf:
            - $ref: '#/components/schemas/AdditionalAccountNumberData'
            - type: 'null'
          description: >-
            Country-specific additional account number data. Validation is
            applied on a per-country basis, determined by the BIC.
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
        - bic
        - country_code
      title: CounterpartyInternationalBankAccount
    COUNTERPARTY_INTERNATIONAL_BANK_ACCOUNTS_listCounterpartyInternationalBankAccounts_Response_200:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/CounterpartyInternationalBankAccount'
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
        COUNTERPARTY_INTERNATIONAL_BANK_ACCOUNTS_listCounterpartyInternationalBankAccounts_Response_200
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
  "url": "https://api.erebor.bank/counterparty_international_bank_accounts?page_size=1",
  "data": [
    {
      "id": "cp_intl_bank_acct_01kasd1tthf1ns1pjn1kncctwd",
      "type": "COUNTERPARTY_INTERNATIONAL_BANK_ACCOUNT",
      "url": "https://api.erebor.bank/counterparty_international_bank_accounts/cp_intl_bank_acct_01kasd1tthf1ns1pjn1kncctwd",
      "created_at": "2025-01-15T09:00:00Z",
      "updated_at": "2025-01-15T09:00:00Z",
      "description": "Euro Account",
      "account_number": "GB29NWBK60161331926819",
      "bic": "NWBKGB2L",
      "country_code": "DE",
      "archived_at": null,
      "customer_id": "cust_01kasd1tthf1ns1pjn1kncctwd",
      "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
      "counterparty_id": "cp_01kasd1tthf1ns1pjn1kncctwd",
      "custom_ref": "CP-IBA-2025-001",
      "custom_fields": {
        "swift_verified": "true",
        "region": "EMEA"
      }
    }
  ],
  "page_next": "https://api.erebor.bank/counterparty_international_bank_accounts?starting_after=cp_intl_bank_acct_01kasd1tthf1ns1pjn1kncctwd&page_size=1",
  "page_prev": null
}
```

**SDK Code**

```python List of Counterparty International Bank Accounts
import requests

url = "https://api.erebor.bank/counterparty_international_bank_accounts"

headers = {"Authorization": "<apiKey>"}

response = requests.get(url, headers=headers)

print(response.json())
```

```javascript List of Counterparty International Bank Accounts
const url = 'https://api.erebor.bank/counterparty_international_bank_accounts';
const options = {method: 'GET', headers: {Authorization: '<apiKey>'}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go List of Counterparty International Bank Accounts
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/counterparty_international_bank_accounts"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("Authorization", "<apiKey>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby List of Counterparty International Bank Accounts
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/counterparty_international_bank_accounts")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["Authorization"] = '<apiKey>'

response = http.request(request)
puts response.read_body
```

```java List of Counterparty International Bank Accounts
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.get("https://api.erebor.bank/counterparty_international_bank_accounts")
  .header("Authorization", "<apiKey>")
  .asString();
```

```php List of Counterparty International Bank Accounts
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('GET', 'https://api.erebor.bank/counterparty_international_bank_accounts', [
  'headers' => [
    'Authorization' => '<apiKey>',
  ],
]);

echo $response->getBody();
```

```csharp List of Counterparty International Bank Accounts
using RestSharp;

var client = new RestClient("https://api.erebor.bank/counterparty_international_bank_accounts");
var request = new RestRequest(Method.GET);
request.AddHeader("Authorization", "<apiKey>");
IRestResponse response = client.Execute(request);
```

```swift List of Counterparty International Bank Accounts
import Foundation

let headers = ["Authorization": "<apiKey>"]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/counterparty_international_bank_accounts")! as URL,
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