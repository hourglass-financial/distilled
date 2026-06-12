> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Update Counterparty

PATCH https://api.erebor.bank/counterparties/{id}
Content-Type: application/json

Update a counterparty's name and/or address.

Reference: https://docs.erebor.bank/api-reference/counterparties/counterparties/update-counterparty

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /counterparties/{id}:
    patch:
      operationId: update-counterparty
      summary: Update Counterparty
      description: Update a counterparty's name and/or address.
      tags:
        - subpackage_counterparties
      parameters:
        - name: id
          in: path
          description: Counterparty ID
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
          description: Counterparty updated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Counterparty'
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateCounterpartyRequest'
servers:
  - url: https://api.erebor.bank
    description: API server (environment determined by API key)
components:
  schemas:
    Address:
      type: object
      properties:
        street_address:
          type: string
        city:
          type: string
        country_area:
          type:
            - string
            - 'null'
          description: >-
            Designation of a region, province, or state. Required for US
            addresses.
        postal_code:
          type: string
        country:
          type: string
          description: Two-letter ISO 3166-1 alpha-2 country code.
      required:
        - street_address
        - city
        - postal_code
        - country
      title: Address
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
    UpdateCounterpartyRequest:
      type: object
      properties:
        name:
          type:
            - string
            - 'null'
          description: Updated name of the counterparty
        address:
          oneOf:
            - $ref: '#/components/schemas/Address'
            - type: 'null'
          description: Updated address of the counterparty
        custom_ref:
          $ref: '#/components/schemas/CustomRef'
        custom_fields:
          $ref: '#/components/schemas/CustomFields'
      title: UpdateCounterpartyRequest
    Counterparty:
      type: object
      properties:
        id:
          type: string
          description: Unique identifier for the counterparty, prefixed with `cp_`.
        type:
          type: string
          enum:
            - COUNTERPARTY
          description: Object type. Always `COUNTERPARTY`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this counterparty.
        created_at:
          type: string
          format: date-time
          description: Timestamp of when the counterparty was created, in ISO 8601 format.
        updated_at:
          type: string
          format: date-time
          description: >-
            Timestamp of when the counterparty was last updated, in ISO 8601
            format.
        archived_at:
          type:
            - string
            - 'null'
          format: date-time
        customer_id:
          type:
            - string
            - 'null'
          description: >-
            ID of the customer this counterparty belongs to, prefixed with
            `cust_`.
        program_id:
          type:
            - string
            - 'null'
          description: >-
            ID of the program this counterparty belongs to, prefixed with
            `prgrm_`.
        name:
          type: string
          description: Name of the counterparty (max 140 characters).
        address:
          $ref: '#/components/schemas/Address'
          description: Physical address of the counterparty
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
        - name
        - address
      title: Counterparty
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

### Updated Counterparty



**Request**

```json
undefined
```

**Response**

```json
{
  "id": "cp_01kasd1tthf1ns1pjn1kncctwd",
  "type": "COUNTERPARTY",
  "url": "https://api.erebor.bank/counterparties/cp_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-20T14:00:00Z",
  "name": "Updated Suppliers Ltd",
  "address": {
    "street_address": "789 New Commerce Ave",
    "city": "Manchester",
    "postal_code": "M1 1AA",
    "country": "GB"
  },
  "archived_at": null,
  "customer_id": "cust_01kasd1tthf1ns1pjn1kncctwd",
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "custom_ref": "CP-2025-7821",
  "custom_fields": {
    "industry": "manufacturing",
    "relationship_owner": "j.smith"
  }
}
```

**SDK Code**

```python Updated Counterparty
import requests

url = "https://api.erebor.bank/counterparties/cp_01kasd1tthf1ns1pjn1kncctwd"

headers = {
    "Authorization": "<apiKey>",
    "Content-Type": "application/json"
}

response = requests.patch(url, headers=headers)

print(response.json())
```

```javascript Updated Counterparty
const url = 'https://api.erebor.bank/counterparties/cp_01kasd1tthf1ns1pjn1kncctwd';
const options = {
  method: 'PATCH',
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

```go Updated Counterparty
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/counterparties/cp_01kasd1tthf1ns1pjn1kncctwd"

	req, _ := http.NewRequest("PATCH", url, nil)

	req.Header.Add("Authorization", "<apiKey>")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby Updated Counterparty
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/counterparties/cp_01kasd1tthf1ns1pjn1kncctwd")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Patch.new(url)
request["Authorization"] = '<apiKey>'
request["Content-Type"] = 'application/json'

response = http.request(request)
puts response.read_body
```

```java Updated Counterparty
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.patch("https://api.erebor.bank/counterparties/cp_01kasd1tthf1ns1pjn1kncctwd")
  .header("Authorization", "<apiKey>")
  .header("Content-Type", "application/json")
  .asString();
```

```php Updated Counterparty
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('PATCH', 'https://api.erebor.bank/counterparties/cp_01kasd1tthf1ns1pjn1kncctwd', [
  'headers' => [
    'Authorization' => '<apiKey>',
    'Content-Type' => 'application/json',
  ],
]);

echo $response->getBody();
```

```csharp Updated Counterparty
using RestSharp;

var client = new RestClient("https://api.erebor.bank/counterparties/cp_01kasd1tthf1ns1pjn1kncctwd");
var request = new RestRequest(Method.PATCH);
request.AddHeader("Authorization", "<apiKey>");
request.AddHeader("Content-Type", "application/json");
IRestResponse response = client.Execute(request);
```

```swift Updated Counterparty
import Foundation

let headers = [
  "Authorization": "<apiKey>",
  "Content-Type": "application/json"
]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/counterparties/cp_01kasd1tthf1ns1pjn1kncctwd")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "PATCH"
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

### Update Counterparty



**Request**

```json
{
  "name": "Updated Suppliers Ltd",
  "address": {
    "street_address": "789 New Commerce Ave",
    "city": "Manchester",
    "postal_code": "M1 1AA",
    "country": "GB"
  },
  "custom_ref": "CP-2025-7821",
  "custom_fields": {
    "industry": "manufacturing",
    "relationship_owner": "j.smith"
  }
}
```

**Response**

```json
{
  "id": "cp_01kasd1tthf1ns1pjn1kncctwd",
  "type": "COUNTERPARTY",
  "url": "https://api.erebor.bank/counterparties/cp_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-20T14:00:00Z",
  "name": "Updated Suppliers Ltd",
  "address": {
    "street_address": "789 New Commerce Ave",
    "city": "Manchester",
    "postal_code": "M1 1AA",
    "country": "GB"
  },
  "archived_at": null,
  "customer_id": "cust_01kasd1tthf1ns1pjn1kncctwd",
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "custom_ref": "CP-2025-7821",
  "custom_fields": {
    "industry": "manufacturing",
    "relationship_owner": "j.smith"
  }
}
```

**SDK Code**

```python Update Counterparty
import requests

url = "https://api.erebor.bank/counterparties/cp_01kasd1tthf1ns1pjn1kncctwd"

payload = {
    "name": "Updated Suppliers Ltd",
    "address": {
        "street_address": "789 New Commerce Ave",
        "city": "Manchester",
        "postal_code": "M1 1AA",
        "country": "GB"
    },
    "custom_ref": "CP-2025-7821",
    "custom_fields": {
        "industry": "manufacturing",
        "relationship_owner": "j.smith"
    }
}
headers = {
    "Authorization": "<apiKey>",
    "Content-Type": "application/json"
}

response = requests.patch(url, json=payload, headers=headers)

print(response.json())
```

```javascript Update Counterparty
const url = 'https://api.erebor.bank/counterparties/cp_01kasd1tthf1ns1pjn1kncctwd';
const options = {
  method: 'PATCH',
  headers: {Authorization: '<apiKey>', 'Content-Type': 'application/json'},
  body: '{"name":"Updated Suppliers Ltd","address":{"street_address":"789 New Commerce Ave","city":"Manchester","postal_code":"M1 1AA","country":"GB"},"custom_ref":"CP-2025-7821","custom_fields":{"industry":"manufacturing","relationship_owner":"j.smith"}}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go Update Counterparty
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/counterparties/cp_01kasd1tthf1ns1pjn1kncctwd"

	payload := strings.NewReader("{\n  \"name\": \"Updated Suppliers Ltd\",\n  \"address\": {\n    \"street_address\": \"789 New Commerce Ave\",\n    \"city\": \"Manchester\",\n    \"postal_code\": \"M1 1AA\",\n    \"country\": \"GB\"\n  },\n  \"custom_ref\": \"CP-2025-7821\",\n  \"custom_fields\": {\n    \"industry\": \"manufacturing\",\n    \"relationship_owner\": \"j.smith\"\n  }\n}")

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

```ruby Update Counterparty
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/counterparties/cp_01kasd1tthf1ns1pjn1kncctwd")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Patch.new(url)
request["Authorization"] = '<apiKey>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"name\": \"Updated Suppliers Ltd\",\n  \"address\": {\n    \"street_address\": \"789 New Commerce Ave\",\n    \"city\": \"Manchester\",\n    \"postal_code\": \"M1 1AA\",\n    \"country\": \"GB\"\n  },\n  \"custom_ref\": \"CP-2025-7821\",\n  \"custom_fields\": {\n    \"industry\": \"manufacturing\",\n    \"relationship_owner\": \"j.smith\"\n  }\n}"

response = http.request(request)
puts response.read_body
```

```java Update Counterparty
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.patch("https://api.erebor.bank/counterparties/cp_01kasd1tthf1ns1pjn1kncctwd")
  .header("Authorization", "<apiKey>")
  .header("Content-Type", "application/json")
  .body("{\n  \"name\": \"Updated Suppliers Ltd\",\n  \"address\": {\n    \"street_address\": \"789 New Commerce Ave\",\n    \"city\": \"Manchester\",\n    \"postal_code\": \"M1 1AA\",\n    \"country\": \"GB\"\n  },\n  \"custom_ref\": \"CP-2025-7821\",\n  \"custom_fields\": {\n    \"industry\": \"manufacturing\",\n    \"relationship_owner\": \"j.smith\"\n  }\n}")
  .asString();
```

```php Update Counterparty
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('PATCH', 'https://api.erebor.bank/counterparties/cp_01kasd1tthf1ns1pjn1kncctwd', [
  'body' => '{
  "name": "Updated Suppliers Ltd",
  "address": {
    "street_address": "789 New Commerce Ave",
    "city": "Manchester",
    "postal_code": "M1 1AA",
    "country": "GB"
  },
  "custom_ref": "CP-2025-7821",
  "custom_fields": {
    "industry": "manufacturing",
    "relationship_owner": "j.smith"
  }
}',
  'headers' => [
    'Authorization' => '<apiKey>',
    'Content-Type' => 'application/json',
  ],
]);

echo $response->getBody();
```

```csharp Update Counterparty
using RestSharp;

var client = new RestClient("https://api.erebor.bank/counterparties/cp_01kasd1tthf1ns1pjn1kncctwd");
var request = new RestRequest(Method.PATCH);
request.AddHeader("Authorization", "<apiKey>");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"name\": \"Updated Suppliers Ltd\",\n  \"address\": {\n    \"street_address\": \"789 New Commerce Ave\",\n    \"city\": \"Manchester\",\n    \"postal_code\": \"M1 1AA\",\n    \"country\": \"GB\"\n  },\n  \"custom_ref\": \"CP-2025-7821\",\n  \"custom_fields\": {\n    \"industry\": \"manufacturing\",\n    \"relationship_owner\": \"j.smith\"\n  }\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift Update Counterparty
import Foundation

let headers = [
  "Authorization": "<apiKey>",
  "Content-Type": "application/json"
]
let parameters = [
  "name": "Updated Suppliers Ltd",
  "address": [
    "street_address": "789 New Commerce Ave",
    "city": "Manchester",
    "postal_code": "M1 1AA",
    "country": "GB"
  ],
  "custom_ref": "CP-2025-7821",
  "custom_fields": [
    "industry": "manufacturing",
    "relationship_owner": "j.smith"
  ]
] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/counterparties/cp_01kasd1tthf1ns1pjn1kncctwd")! as URL,
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