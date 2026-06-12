> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Simulate Outbound Wire Transfer Return

POST https://api.erebor.bank/simulation/wire_out/{id}/return

Force a settled outbound wire transfer to `RETURNED` for testing. This endpoint is only available in the sandbox environment.

The transfer must be in `SETTLED` status when this endpoint is called; non-`SETTLED` transfers return `409 Conflict`.

The response returns immediately. The transfer is still `SETTLED` at response time; the flip to `RETURNED` is asynchronous — usually within a minute. Poll `GET /wire_out/{id}` or listen for the `WIRE_OUT.RETURNED` webhook to observe the transition.


Reference: https://docs.erebor.bank/api-reference/simulation/simulation-endpoints/simulate-wire-out-return

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /simulation/wire_out/{id}/return:
    post:
      operationId: simulate-wire-out-return
      summary: Simulate Outbound Wire Transfer Return
      description: >
        Force a settled outbound wire transfer to `RETURNED` for testing. This
        endpoint is only available in the sandbox environment.


        The transfer must be in `SETTLED` status when this endpoint is called;
        non-`SETTLED` transfers return `409 Conflict`.


        The response returns immediately. The transfer is still `SETTLED` at
        response time; the flip to `RETURNED` is asynchronous — usually within a
        minute. Poll `GET /wire_out/{id}` or listen for the `WIRE_OUT.RETURNED`
        webhook to observe the transition.
      tags:
        - subpackage_simulation
      parameters:
        - name: id
          in: path
          description: >-
            ID of the outbound wire transfer to return. Must be in `SETTLED`
            status.
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
          description: >
            Return accepted. The transfer is still `SETTLED` at response time;
            poll `GET /wire_out/{id}` or listen for the `WIRE_OUT.RETURNED`
            webhook for the flip to `RETURNED`.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SimulateWireOutReturnResponse'
        '400':
          description: Bad Request
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '403':
          description: Forbidden
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
    SimulateWireOutReturnResponse:
      type: object
      properties:
        id:
          type: string
          description: >
            ID of the outbound wire. The transfer is still `SETTLED` at response
            time; poll `GET /wire_out/{id}` or listen for the
            `WIRE_OUT.RETURNED` webhook for the final state.
      required:
        - id
      description: >
        Response from forcing a settled outbound wire transfer to `RETURNED`.
        The transfer is still `SETTLED` at response time; the flip to `RETURNED`
        is asynchronous.
      title: SimulateWireOutReturnResponse
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
  "id": "wire_out_01kasd1tthf1ns1pjn1kncctwd"
}
```

**SDK Code**

```python SIMULATION_simulateWireOutReturn_example
import requests

url = "https://api.erebor.bank/simulation/wire_out/wire_out_01kasd1tthf1ns1pjn1kncctwd/return"

headers = {"Authorization": "<apiKey>"}

response = requests.post(url, headers=headers)

print(response.json())
```

```javascript SIMULATION_simulateWireOutReturn_example
const url = 'https://api.erebor.bank/simulation/wire_out/wire_out_01kasd1tthf1ns1pjn1kncctwd/return';
const options = {method: 'POST', headers: {Authorization: '<apiKey>'}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go SIMULATION_simulateWireOutReturn_example
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/simulation/wire_out/wire_out_01kasd1tthf1ns1pjn1kncctwd/return"

	req, _ := http.NewRequest("POST", url, nil)

	req.Header.Add("Authorization", "<apiKey>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby SIMULATION_simulateWireOutReturn_example
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/simulation/wire_out/wire_out_01kasd1tthf1ns1pjn1kncctwd/return")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Authorization"] = '<apiKey>'

response = http.request(request)
puts response.read_body
```

```java SIMULATION_simulateWireOutReturn_example
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.post("https://api.erebor.bank/simulation/wire_out/wire_out_01kasd1tthf1ns1pjn1kncctwd/return")
  .header("Authorization", "<apiKey>")
  .asString();
```

```php SIMULATION_simulateWireOutReturn_example
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://api.erebor.bank/simulation/wire_out/wire_out_01kasd1tthf1ns1pjn1kncctwd/return', [
  'headers' => [
    'Authorization' => '<apiKey>',
  ],
]);

echo $response->getBody();
```

```csharp SIMULATION_simulateWireOutReturn_example
using RestSharp;

var client = new RestClient("https://api.erebor.bank/simulation/wire_out/wire_out_01kasd1tthf1ns1pjn1kncctwd/return");
var request = new RestRequest(Method.POST);
request.AddHeader("Authorization", "<apiKey>");
IRestResponse response = client.Execute(request);
```

```swift SIMULATION_simulateWireOutReturn_example
import Foundation

let headers = ["Authorization": "<apiKey>"]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/simulation/wire_out/wire_out_01kasd1tthf1ns1pjn1kncctwd/return")! as URL,
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