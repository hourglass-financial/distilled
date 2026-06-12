> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Retrieve Program

GET https://api.erebor.bank/programs/{id}

Retrieve a specific Program by ID

Reference: https://docs.erebor.bank/api-reference/programs/get-program

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /programs/{id}:
    get:
      operationId: get-program
      summary: Retrieve Program
      description: Retrieve a specific Program by ID
      tags:
        - subpackage_programs
      parameters:
        - name: id
          in: path
          description: Program ID
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
          description: Program details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Program'
servers:
  - url: https://api.erebor.bank
    description: API server (environment determined by API key)
components:
  schemas:
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
  "id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "type": "PROGRAM",
  "url": "https://api.erebor.bank/programs/prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:00:00Z",
  "updated_at": "2025-01-15T09:00:00Z",
  "name": "Enterprise Banking Program",
  "billing_deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "archived_at": null
}
```

**SDK Code**

```python Program details
import requests

url = "https://api.erebor.bank/programs/prgrm_01kasd1tthf1ns1pjn1kncctwd"

headers = {"Authorization": "<apiKey>"}

response = requests.get(url, headers=headers)

print(response.json())
```

```javascript Program details
const url = 'https://api.erebor.bank/programs/prgrm_01kasd1tthf1ns1pjn1kncctwd';
const options = {method: 'GET', headers: {Authorization: '<apiKey>'}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go Program details
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/programs/prgrm_01kasd1tthf1ns1pjn1kncctwd"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("Authorization", "<apiKey>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby Program details
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/programs/prgrm_01kasd1tthf1ns1pjn1kncctwd")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["Authorization"] = '<apiKey>'

response = http.request(request)
puts response.read_body
```

```java Program details
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.get("https://api.erebor.bank/programs/prgrm_01kasd1tthf1ns1pjn1kncctwd")
  .header("Authorization", "<apiKey>")
  .asString();
```

```php Program details
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('GET', 'https://api.erebor.bank/programs/prgrm_01kasd1tthf1ns1pjn1kncctwd', [
  'headers' => [
    'Authorization' => '<apiKey>',
  ],
]);

echo $response->getBody();
```

```csharp Program details
using RestSharp;

var client = new RestClient("https://api.erebor.bank/programs/prgrm_01kasd1tthf1ns1pjn1kncctwd");
var request = new RestRequest(Method.GET);
request.AddHeader("Authorization", "<apiKey>");
IRestResponse response = client.Execute(request);
```

```swift Program details
import Foundation

let headers = ["Authorization": "<apiKey>"]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/programs/prgrm_01kasd1tthf1ns1pjn1kncctwd")! as URL,
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