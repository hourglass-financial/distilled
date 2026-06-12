> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Retrieve Account Number

GET https://api.erebor.bank/account_numbers/{id}

Retrieve a specific Account Number by ID

Reference: https://docs.erebor.bank/api-reference/accounts/account-numbers/get-account-number

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /account_numbers/{id}:
    get:
      operationId: get-account-number
      summary: Retrieve Account Number
      description: Retrieve a specific Account Number by ID
      tags:
        - subpackage_accountNumbers
      parameters:
        - name: id
          in: path
          description: Account number ID
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
          description: Account number details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AccountNumber'
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
    AccountNumber:
      type: object
      properties:
        id:
          type: string
          description: Unique identifier for the account number, prefixed with `acct_num_`.
        type:
          type: string
          enum:
            - ACCOUNT_NUMBER
          description: Object type. Always `ACCOUNT_NUMBER`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this account number.
        created_at:
          type: string
          format: date-time
          description: >-
            Timestamp of when the account number was created, in ISO 8601
            format.
        updated_at:
          type: string
          format: date-time
          description: >-
            Timestamp of when the account number was last updated, in ISO 8601
            format.
        archived_at:
          type:
            - string
            - 'null'
          format: date-time
        program_id:
          type:
            - string
            - 'null'
          description: >-
            Unique identifier of the program this account number belongs to,
            prefixed with `prgrm_`.
        deposit_account_id:
          type: string
          description: >-
            ID of the deposit account this account number belongs to, prefixed
            with `dep_acct_`.
        name:
          type:
            - string
            - 'null'
          description: Human-readable name for this account number.
        account_number:
          type: string
          description: Bank account number (up to 17 characters).
        routing_number:
          type: string
          description: Nine-digit ABA routing number.
        default:
          type: boolean
          description: Whether this is the default account number for the deposit account.
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
        - deposit_account_id
        - account_number
        - routing_number
        - default
      title: AccountNumber
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
  "id": "acct_num_01kasd1tthf1ns1pjn1kncctwd",
  "type": "ACCOUNT_NUMBER",
  "url": "https://api.erebor.bank/account_numbers/acct_num_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T09:30:00Z",
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "account_number": "1234567890",
  "routing_number": "125108405",
  "default": true,
  "archived_at": null,
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "name": "Primary Account Number",
  "custom_ref": "ACCT-NUM-2025-001",
  "custom_fields": {
    "purpose": "operating",
    "routing_destination": "ach_payroll"
  }
}
```

**SDK Code**

```python
import requests

url = "https://api.erebor.bank/account_numbers/acct_num_01kasd1tthf1ns1pjn1kncctwd"

headers = {"Authorization": "<apiKey>"}

response = requests.get(url, headers=headers)

print(response.json())
```

```javascript
const url = 'https://api.erebor.bank/account_numbers/acct_num_01kasd1tthf1ns1pjn1kncctwd';
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

	url := "https://api.erebor.bank/account_numbers/acct_num_01kasd1tthf1ns1pjn1kncctwd"

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

url = URI("https://api.erebor.bank/account_numbers/acct_num_01kasd1tthf1ns1pjn1kncctwd")

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

HttpResponse<String> response = Unirest.get("https://api.erebor.bank/account_numbers/acct_num_01kasd1tthf1ns1pjn1kncctwd")
  .header("Authorization", "<apiKey>")
  .asString();
```

```php
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('GET', 'https://api.erebor.bank/account_numbers/acct_num_01kasd1tthf1ns1pjn1kncctwd', [
  'headers' => [
    'Authorization' => '<apiKey>',
  ],
]);

echo $response->getBody();
```

```csharp
using RestSharp;

var client = new RestClient("https://api.erebor.bank/account_numbers/acct_num_01kasd1tthf1ns1pjn1kncctwd");
var request = new RestRequest(Method.GET);
request.AddHeader("Authorization", "<apiKey>");
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = ["Authorization": "<apiKey>"]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/account_numbers/acct_num_01kasd1tthf1ns1pjn1kncctwd")! as URL,
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