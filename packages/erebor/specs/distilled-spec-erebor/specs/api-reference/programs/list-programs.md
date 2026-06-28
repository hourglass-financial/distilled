> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# List Programs

GET https://api.erebor.bank/programs

Retrieve a paginated list of Programs

Reference: https://docs.erebor.bank/api-reference/programs/list-programs

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /programs:
    get:
      operationId: list-programs
      summary: List Programs
      description: Retrieve a paginated list of Programs
      tags:
        - subpackage_programs
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
          description: List of Programs
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PROGRAMS_listPrograms_Response_200'
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
    Program:
      type: object
      properties:
        id:
          type: string
          description: Unique identifier for the program, prefixed with `prgrm_`.
        type:
          type: string
          enum:
            - PROGRAM
          description: Object type. Always `PROGRAM`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this program.
        created_at:
          type: string
          format: date-time
          description: Timestamp of when the program was created, in ISO 8601 format.
        updated_at:
          type: string
          format: date-time
          description: Timestamp of when the program was last updated, in ISO 8601 format.
        archived_at:
          type:
            - string
            - 'null'
          format: date-time
        name:
          type: string
          description: Human-readable name for the program.
        billing_deposit_account_id:
          type: string
          description: >-
            ID of the deposit account used for billing this program, prefixed
            with `dep_acct_`.
      required:
        - id
        - type
        - url
        - created_at
        - updated_at
        - name
        - billing_deposit_account_id
      title: Program
    PROGRAMS_listPrograms_Response_200:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/Program'
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
      title: PROGRAMS_listPrograms_Response_200
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
  "url": "https://api.erebor.bank/programs?page_size=1",
  "data": [
    {
      "id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
      "type": "PROGRAM",
      "url": "https://api.erebor.bank/programs/prgrm_01kasd1tthf1ns1pjn1kncctwd",
      "created_at": "2025-01-15T09:00:00Z",
      "updated_at": "2025-01-15T09:00:00Z",
      "name": "Enterprise Banking Program",
      "billing_deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
      "archived_at": null
    }
  ],
  "page_next": "https://api.erebor.bank/programs?starting_after=prgrm_01kasd1tthf1ns1pjn1kncctwd&page_size=1",
  "page_prev": null
}
```

**SDK Code**

```python List of Programs
import requests

url = "https://api.erebor.bank/programs"

headers = {"Authorization": "<apiKey>"}

response = requests.get(url, headers=headers)

print(response.json())
```

```javascript List of Programs
const url = 'https://api.erebor.bank/programs';
const options = {method: 'GET', headers: {Authorization: '<apiKey>'}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go List of Programs
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/programs"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("Authorization", "<apiKey>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby List of Programs
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/programs")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["Authorization"] = '<apiKey>'

response = http.request(request)
puts response.read_body
```

```java List of Programs
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.get("https://api.erebor.bank/programs")
  .header("Authorization", "<apiKey>")
  .asString();
```

```php List of Programs
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('GET', 'https://api.erebor.bank/programs', [
  'headers' => [
    'Authorization' => '<apiKey>',
  ],
]);

echo $response->getBody();
```

```csharp List of Programs
using RestSharp;

var client = new RestClient("https://api.erebor.bank/programs");
var request = new RestRequest(Method.GET);
request.AddHeader("Authorization", "<apiKey>");
IRestResponse response = client.Execute(request);
```

```swift List of Programs
import Foundation

let headers = ["Authorization": "<apiKey>"]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/programs")! as URL,
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