> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Archive Counterparty

POST https://api.erebor.bank/counterparties/{id}/archive

Soft-deletes a Counterparty by setting `archived_at`. In the same transaction, the Counterparty's linked address book entries are archived, and its saved bank accounts and addresses are unlinked rather than deleted: they remain retrievable by ID, but their `counterparty_id` becomes `null` and they no longer match `counterparty_id` list filters. Archiving a Counterparty that is already archived returns `404`. Emits a `COUNTERPARTY.ARCHIVED` event.

Reference: https://docs.erebor.bank/api-reference/counterparties/counterparties/archive-counterparty

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /counterparties/{id}/archive:
    post:
      operationId: archive-counterparty
      summary: Archive Counterparty
      description: >-
        Soft-deletes a Counterparty by setting `archived_at`. In the same
        transaction, the Counterparty's linked address book entries are
        archived, and its saved bank accounts and addresses are unlinked rather
        than deleted: they remain retrievable by ID, but their `counterparty_id`
        becomes `null` and they no longer match `counterparty_id` list filters.
        Archiving a Counterparty that is already archived returns `404`. Emits a
        `COUNTERPARTY.ARCHIVED` event.
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
          description: Counterparty archived successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Counterparty'
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
            addresses. For onboarding applicant addresses with `country: US`,
            this must be a valid uppercase two-letter USPS state, territory, or
            military mail code (e.g. `CA`, `NY`, `DC`, `PR`, `AE`) — full state
            names such as `California` are rejected. Free-form for non-US
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
  "id": "cp_01kasd1tthf1ns1pjn1kncctwd",
  "type": "COUNTERPARTY",
  "url": "https://api.erebor.bank/counterparties/cp_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-22T10:15:00Z",
  "name": "Global Suppliers Ltd",
  "address": {
    "street_address": "456 Commerce Street, Suite 200",
    "city": "London",
    "postal_code": "SW1A 1AA",
    "country": "GB"
  },
  "archived_at": "2025-01-22T10:15:00Z",
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

```python Archived Counterparty
import requests

url = "https://api.erebor.bank/counterparties/cp_01kasd1tthf1ns1pjn1kncctwd/archive"

headers = {"Authorization": "<apiKey>"}

response = requests.post(url, headers=headers)

print(response.json())
```

```javascript Archived Counterparty
const url = 'https://api.erebor.bank/counterparties/cp_01kasd1tthf1ns1pjn1kncctwd/archive';
const options = {method: 'POST', headers: {Authorization: '<apiKey>'}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go Archived Counterparty
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/counterparties/cp_01kasd1tthf1ns1pjn1kncctwd/archive"

	req, _ := http.NewRequest("POST", url, nil)

	req.Header.Add("Authorization", "<apiKey>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby Archived Counterparty
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/counterparties/cp_01kasd1tthf1ns1pjn1kncctwd/archive")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Authorization"] = '<apiKey>'

response = http.request(request)
puts response.read_body
```

```java Archived Counterparty
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.post("https://api.erebor.bank/counterparties/cp_01kasd1tthf1ns1pjn1kncctwd/archive")
  .header("Authorization", "<apiKey>")
  .asString();
```

```php Archived Counterparty
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://api.erebor.bank/counterparties/cp_01kasd1tthf1ns1pjn1kncctwd/archive', [
  'headers' => [
    'Authorization' => '<apiKey>',
  ],
]);

echo $response->getBody();
```

```csharp Archived Counterparty
using RestSharp;

var client = new RestClient("https://api.erebor.bank/counterparties/cp_01kasd1tthf1ns1pjn1kncctwd/archive");
var request = new RestRequest(Method.POST);
request.AddHeader("Authorization", "<apiKey>");
IRestResponse response = client.Execute(request);
```

```swift Archived Counterparty
import Foundation

let headers = ["Authorization": "<apiKey>"]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/counterparties/cp_01kasd1tthf1ns1pjn1kncctwd/archive")! as URL,
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