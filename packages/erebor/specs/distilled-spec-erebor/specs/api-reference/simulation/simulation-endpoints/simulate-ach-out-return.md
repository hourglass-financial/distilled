> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Simulate Outbound ACH Transfer Return

POST https://api.erebor.bank/simulation/ach_out/{id}/return

Force a settled outbound ACH transfer to `RETURNED` for testing. This endpoint is only available in the sandbox environment.

The transfer must be in `SETTLED` status when this endpoint is called; non-`SETTLED` transfers return `409 Conflict`.

The endpoint returns immediately before the status flips — the transfer is still `SETTLED` at this point. The flip to `RETURNED` is asynchronous, usually within a minute. Poll `GET /ach_out/{id}` or listen for the `ACH_OUT.RETURNED` webhook to observe the transition.

Pass an optional `return_code` query parameter to control the return reason code; defaults to `R01` (Insufficient Funds).


Reference: https://docs.erebor.bank/api-reference/simulation/simulation-endpoints/simulate-ach-out-return

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /simulation/ach_out/{id}/return:
    post:
      operationId: simulate-ach-out-return
      summary: Simulate Outbound ACH Transfer Return
      description: >
        Force a settled outbound ACH transfer to `RETURNED` for testing. This
        endpoint is only available in the sandbox environment.


        The transfer must be in `SETTLED` status when this endpoint is called;
        non-`SETTLED` transfers return `409 Conflict`.


        The endpoint returns immediately before the status flips — the transfer
        is still `SETTLED` at this point. The flip to `RETURNED` is
        asynchronous, usually within a minute. Poll `GET /ach_out/{id}` or
        listen for the `ACH_OUT.RETURNED` webhook to observe the transition.


        Pass an optional `return_code` query parameter to control the return
        reason code; defaults to `R01` (Insufficient Funds).
      tags:
        - subpackage_simulation
      parameters:
        - name: id
          in: path
          description: >-
            ID of the outbound ACH transfer to return. Must be in `SETTLED`
            status.
          required: true
          schema:
            type: string
        - name: return_code
          in: query
          description: >
            NACHA return reason code to apply to the returned transfer. Defaults
            to `R01` (Insufficient Funds) when omitted. Must be a NACHA return
            reason code matching `^R[0-9]{2}$` (R01-R85). Codes that match the
            pattern but are not in the NACHA set return `400`.
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
          description: >
            Return accepted. The transfer is still `SETTLED` at response time;
            poll `GET /ach_out/{id}` or listen for the `ACH_OUT.RETURNED`
            webhook for the flip to `RETURNED`.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SimulateAchOutReturnResponse'
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
    SimulateAchOutReturnResponse:
      type: object
      properties:
        id:
          type: string
          description: >
            ID of outbound ACH. The transfer is still `SETTLED` at response
            time; poll `GET /ach_out/{id}` or listen for the `ACH_OUT.RETURNED`
            webhook for the final state.
        return_code:
          type: string
          description: >-
            NACHA return reason code applied to the return. Echoes the `R01`
            default when `return_code` is omitted from the request.
      required:
        - id
        - return_code
      description: >
        Response from forcing a settled outbound ACH transfer to `RETURNED`. The
        transfer is still `SETTLED` at response time; the flip to `RETURNED` is
        asynchronous.
      title: SimulateAchOutReturnResponse
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
  "id": "ach_out_01kasd1tthf1ns1pjn1kncctwd",
  "return_code": "R01"
}
```

**SDK Code**

```python SIMULATION_simulateACHOutReturn_example
import requests

url = "https://api.erebor.bank/simulation/ach_out/ach_out_01kasd1tthf1ns1pjn1kncctwd/return"

headers = {"Authorization": "<apiKey>"}

response = requests.post(url, headers=headers)

print(response.json())
```

```javascript SIMULATION_simulateACHOutReturn_example
const url = 'https://api.erebor.bank/simulation/ach_out/ach_out_01kasd1tthf1ns1pjn1kncctwd/return';
const options = {method: 'POST', headers: {Authorization: '<apiKey>'}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go SIMULATION_simulateACHOutReturn_example
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/simulation/ach_out/ach_out_01kasd1tthf1ns1pjn1kncctwd/return"

	req, _ := http.NewRequest("POST", url, nil)

	req.Header.Add("Authorization", "<apiKey>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby SIMULATION_simulateACHOutReturn_example
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/simulation/ach_out/ach_out_01kasd1tthf1ns1pjn1kncctwd/return")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Authorization"] = '<apiKey>'

response = http.request(request)
puts response.read_body
```

```java SIMULATION_simulateACHOutReturn_example
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.post("https://api.erebor.bank/simulation/ach_out/ach_out_01kasd1tthf1ns1pjn1kncctwd/return")
  .header("Authorization", "<apiKey>")
  .asString();
```

```php SIMULATION_simulateACHOutReturn_example
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://api.erebor.bank/simulation/ach_out/ach_out_01kasd1tthf1ns1pjn1kncctwd/return', [
  'headers' => [
    'Authorization' => '<apiKey>',
  ],
]);

echo $response->getBody();
```

```csharp SIMULATION_simulateACHOutReturn_example
using RestSharp;

var client = new RestClient("https://api.erebor.bank/simulation/ach_out/ach_out_01kasd1tthf1ns1pjn1kncctwd/return");
var request = new RestRequest(Method.POST);
request.AddHeader("Authorization", "<apiKey>");
IRestResponse response = client.Execute(request);
```

```swift SIMULATION_simulateACHOutReturn_example
import Foundation

let headers = ["Authorization": "<apiKey>"]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/simulation/ach_out/ach_out_01kasd1tthf1ns1pjn1kncctwd/return")! as URL,
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