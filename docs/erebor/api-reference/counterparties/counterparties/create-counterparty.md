> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Create Counterparty

POST https://api.erebor.bank/counterparties
Content-Type: application/json

Create a new Counterparty

Reference: https://docs.erebor.bank/api-reference/counterparties/counterparties/create-counterparty

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /counterparties:
    post:
      operationId: create-counterparty
      summary: Create Counterparty
      description: Create a new Counterparty
      tags:
        - subpackage_counterparties
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
          description: Counterparty created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Counterparty'
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateCounterpartyRequest'
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
    CreateCounterpartyRequest:
      type: object
      properties:
        customer_id:
          type:
            - string
            - 'null'
          description: Unique identifier for the customer this counterparty belongs to
        name:
          type: string
        address:
          $ref: '#/components/schemas/Address'
          description: Physical address of the counterparty
        custom_ref:
          $ref: '#/components/schemas/CustomRef'
        custom_fields:
          $ref: '#/components/schemas/CustomFields'
      required:
        - name
        - address
      title: CreateCounterpartyRequest
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

### Created Counterparty



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
  "updated_at": "2025-01-15T09:30:00Z",
  "name": "Global Suppliers Ltd",
  "address": {
    "street_address": "456 Commerce Street, Suite 200",
    "city": "London",
    "postal_code": "SW1A 1AA",
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

```python Created Counterparty
import requests

url = "https://api.erebor.bank/counterparties"

headers = {
    "Authorization": "<apiKey>",
    "Content-Type": "application/json"
}

response = requests.post(url, headers=headers)

print(response.json())
```

```javascript Created Counterparty
const url = 'https://api.erebor.bank/counterparties';
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

```go Created Counterparty
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/counterparties"

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

```ruby Created Counterparty
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/counterparties")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Authorization"] = '<apiKey>'
request["Content-Type"] = 'application/json'

response = http.request(request)
puts response.read_body
```

```java Created Counterparty
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.post("https://api.erebor.bank/counterparties")
  .header("Authorization", "<apiKey>")
  .header("Content-Type", "application/json")
  .asString();
```

```php Created Counterparty
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://api.erebor.bank/counterparties', [
  'headers' => [
    'Authorization' => '<apiKey>',
    'Content-Type' => 'application/json',
  ],
]);

echo $response->getBody();
```

```csharp Created Counterparty
using RestSharp;

var client = new RestClient("https://api.erebor.bank/counterparties");
var request = new RestRequest(Method.POST);
request.AddHeader("Authorization", "<apiKey>");
request.AddHeader("Content-Type", "application/json");
IRestResponse response = client.Execute(request);
```

```swift Created Counterparty
import Foundation

let headers = [
  "Authorization": "<apiKey>",
  "Content-Type": "application/json"
]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/counterparties")! as URL,
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

### Create Counterparty



**Request**

```json
{
  "name": "Global Suppliers Ltd",
  "address": {
    "street_address": "456 Commerce Street, Suite 200",
    "city": "London",
    "postal_code": "SW1A 1AA",
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
  "updated_at": "2025-01-15T09:30:00Z",
  "name": "Global Suppliers Ltd",
  "address": {
    "street_address": "456 Commerce Street, Suite 200",
    "city": "London",
    "postal_code": "SW1A 1AA",
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

```python Create Counterparty
import requests

url = "https://api.erebor.bank/counterparties"

payload = {
    "name": "Global Suppliers Ltd",
    "address": {
        "street_address": "456 Commerce Street, Suite 200",
        "city": "London",
        "postal_code": "SW1A 1AA",
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

response = requests.post(url, json=payload, headers=headers)

print(response.json())
```

```javascript Create Counterparty
const url = 'https://api.erebor.bank/counterparties';
const options = {
  method: 'POST',
  headers: {Authorization: '<apiKey>', 'Content-Type': 'application/json'},
  body: '{"name":"Global Suppliers Ltd","address":{"street_address":"456 Commerce Street, Suite 200","city":"London","postal_code":"SW1A 1AA","country":"GB"},"custom_ref":"CP-2025-7821","custom_fields":{"industry":"manufacturing","relationship_owner":"j.smith"}}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go Create Counterparty
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/counterparties"

	payload := strings.NewReader("{\n  \"name\": \"Global Suppliers Ltd\",\n  \"address\": {\n    \"street_address\": \"456 Commerce Street, Suite 200\",\n    \"city\": \"London\",\n    \"postal_code\": \"SW1A 1AA\",\n    \"country\": \"GB\"\n  },\n  \"custom_ref\": \"CP-2025-7821\",\n  \"custom_fields\": {\n    \"industry\": \"manufacturing\",\n    \"relationship_owner\": \"j.smith\"\n  }\n}")

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

```ruby Create Counterparty
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/counterparties")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Authorization"] = '<apiKey>'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"name\": \"Global Suppliers Ltd\",\n  \"address\": {\n    \"street_address\": \"456 Commerce Street, Suite 200\",\n    \"city\": \"London\",\n    \"postal_code\": \"SW1A 1AA\",\n    \"country\": \"GB\"\n  },\n  \"custom_ref\": \"CP-2025-7821\",\n  \"custom_fields\": {\n    \"industry\": \"manufacturing\",\n    \"relationship_owner\": \"j.smith\"\n  }\n}"

response = http.request(request)
puts response.read_body
```

```java Create Counterparty
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.post("https://api.erebor.bank/counterparties")
  .header("Authorization", "<apiKey>")
  .header("Content-Type", "application/json")
  .body("{\n  \"name\": \"Global Suppliers Ltd\",\n  \"address\": {\n    \"street_address\": \"456 Commerce Street, Suite 200\",\n    \"city\": \"London\",\n    \"postal_code\": \"SW1A 1AA\",\n    \"country\": \"GB\"\n  },\n  \"custom_ref\": \"CP-2025-7821\",\n  \"custom_fields\": {\n    \"industry\": \"manufacturing\",\n    \"relationship_owner\": \"j.smith\"\n  }\n}")
  .asString();
```

```php Create Counterparty
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://api.erebor.bank/counterparties', [
  'body' => '{
  "name": "Global Suppliers Ltd",
  "address": {
    "street_address": "456 Commerce Street, Suite 200",
    "city": "London",
    "postal_code": "SW1A 1AA",
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

```csharp Create Counterparty
using RestSharp;

var client = new RestClient("https://api.erebor.bank/counterparties");
var request = new RestRequest(Method.POST);
request.AddHeader("Authorization", "<apiKey>");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"name\": \"Global Suppliers Ltd\",\n  \"address\": {\n    \"street_address\": \"456 Commerce Street, Suite 200\",\n    \"city\": \"London\",\n    \"postal_code\": \"SW1A 1AA\",\n    \"country\": \"GB\"\n  },\n  \"custom_ref\": \"CP-2025-7821\",\n  \"custom_fields\": {\n    \"industry\": \"manufacturing\",\n    \"relationship_owner\": \"j.smith\"\n  }\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift Create Counterparty
import Foundation

let headers = [
  "Authorization": "<apiKey>",
  "Content-Type": "application/json"
]
let parameters = [
  "name": "Global Suppliers Ltd",
  "address": [
    "street_address": "456 Commerce Street, Suite 200",
    "city": "London",
    "postal_code": "SW1A 1AA",
    "country": "GB"
  ],
  "custom_ref": "CP-2025-7821",
  "custom_fields": [
    "industry": "manufacturing",
    "relationship_owner": "j.smith"
  ]
] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/counterparties")! as URL,
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