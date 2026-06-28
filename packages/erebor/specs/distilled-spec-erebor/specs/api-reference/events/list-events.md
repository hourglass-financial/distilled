> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# List Events

GET https://api.erebor.bank/events

Retrieve a paginated list of Webhook Events

Reference: https://docs.erebor.bank/api-reference/events/list-events

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /events:
    get:
      operationId: list-events
      summary: List Events
      description: Retrieve a paginated list of Webhook Events
      tags:
        - subpackage_events
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
        - name: event_type
          in: query
          description: >-
            Filter by event type. See [Supported
            Events](/api-reference/events/supported-events) for a list of
            available event types.
          required: false
          schema:
            $ref: '#/components/schemas/EventType'
        - name: program_id
          in: query
          description: Filter by program ID
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
          description: List of events
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/EVENTS_listEvents_Response_200'
servers:
  - url: https://api.erebor.bank
    description: API server (environment determined by API key)
components:
  schemas:
    EventType:
      type: string
      enum:
        - DEPOSIT_ACCOUNT.CREATED
        - DEPOSIT_ACCOUNT.PENDING
        - DEPOSIT_ACCOUNT.OPEN
        - DEPOSIT_ACCOUNT.CLOSED
        - DEPOSIT_ACCOUNT.FROZEN
        - ACH_IN.CREATED
        - ACH_IN.PENDING
        - ACH_IN.SETTLED
        - ACH_IN.FAILED
        - ACH_IN.RETURNED
        - ACH_OUT.CREATED
        - ACH_OUT.PENDING
        - ACH_OUT.SETTLED
        - ACH_OUT.FAILED
        - ACH_OUT.RETURNED
        - WIRE_IN.CREATED
        - WIRE_IN.PENDING
        - WIRE_IN.SETTLED
        - WIRE_IN.FAILED
        - WIRE_IN.RETURNED
        - WIRE_IN.RESOLVING_FROM_SUSPENSE
        - WIRE_OUT.CREATED
        - WIRE_OUT.PENDING
        - WIRE_OUT.SETTLED
        - WIRE_OUT.FAILED
        - WIRE_OUT.RETURNED
        - INTERNATIONAL_WIRE_IN.PENDING
        - INTERNATIONAL_WIRE_IN.SETTLED
        - INTERNATIONAL_WIRE_IN.FAILED
        - INTERNATIONAL_WIRE_IN.RETURNED
        - INTERNATIONAL_WIRE_OUT.CREATED
        - INTERNATIONAL_WIRE_OUT.PENDING
        - INTERNATIONAL_WIRE_OUT.SETTLED
        - INTERNATIONAL_WIRE_OUT.FAILED
        - INTERNATIONAL_WIRE_OUT.RETURNED
        - BLOCKCHAIN_IN.CREATED
        - BLOCKCHAIN_IN.PENDING
        - BLOCKCHAIN_IN.NEEDS_ATTRIBUTION
        - BLOCKCHAIN_IN.SETTLED
        - BLOCKCHAIN_IN.FAILED
        - BLOCKCHAIN_OUT.CREATED
        - BLOCKCHAIN_OUT.PENDING
        - BLOCKCHAIN_OUT.SETTLED
        - BLOCKCHAIN_OUT.FAILED
        - BOOK_TRANSFER.CREATED
        - BOOK_TRANSFER.PENDING
        - BOOK_TRANSFER.SETTLED
        - BOOK_TRANSFER.FAILED
        - RAIL_IN.CREATED
        - RAIL_IN.PENDING
        - RAIL_IN.SETTLED
        - RAIL_IN.FAILED
        - RAIL_OUT.CREATED
        - RAIL_OUT.PENDING
        - RAIL_OUT.SETTLED
        - RAIL_OUT.FAILED
        - TRANSACTION.CREATED
        - TRANSACTION.PENDING
        - TRANSACTION.POSTED
        - TRANSACTION.SETTLED
        - TRANSACTION.FAILED
        - TRANSACTION.REVERSED
        - ONBOARDING.SUBMITTED
        - ONBOARDING.UNDER_REVIEW
        - ONBOARDING.APPROVED
        - ONBOARDING.REJECTED
        - COUNTERPARTY.CREATED
        - COUNTERPARTY.UPDATED
        - COUNTERPARTY.ARCHIVED
        - COUNTERPARTY_BANK_ACCOUNT.CREATED
        - COUNTERPARTY_BANK_ACCOUNT.ARCHIVED
        - COUNTERPARTY_BLOCKCHAIN_ADDRESS.CREATED
        - COUNTERPARTY_BLOCKCHAIN_ADDRESS.ARCHIVED
        - COUNTERPARTY_BLOCKCHAIN_ADDRESS.ATTRIBUTED.SELF_HOSTED
        - COUNTERPARTY_BLOCKCHAIN_ADDRESS.ATTRIBUTED.CUSTODIAN
        - COUNTERPARTY_BLOCKCHAIN_ADDRESS.ATTRIBUTED.CUSTODIAN_OTHER
        - COUNTERPARTY_INTERNATIONAL_BANK_ACCOUNT.ARCHIVED
        - COUNTERPARTY_RAIL_ADDRESS.ARCHIVED
        - CUSTOMER.CREATED
      description: Event type in `RESOURCE.ACTION` format.
      title: EventType
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
    EventResource:
      type: object
      properties: {}
      description: >-
        A snapshot of the resource at the time the event was created. The shape
        depends on the `event_type` — see [Supported
        Events](/api-reference/events/supported-events) for the resource object
        each event type carries.
      title: EventResource
    EventTrace:
      type: object
      properties:
        request_id:
          type:
            - string
            - 'null'
          description: >-
            Correlation ID for what generated this event. For events triggered
            by an API request, this is the request ID: the value of the
            `X-Request-Id` header if the request supplied one, otherwise a
            server-generated UUID. Events generated by background processing
            carry an internal job identifier instead, and events with no request
            context have a null value.
        request_idempotency_key:
          type:
            - string
            - 'null'
          description: >-
            The idempotency key from the originating request, if one was
            provided. `null` if the event was triggered by a system action
            rather than an API request.
      description: Request tracing information for the API call that triggered this event.
      title: EventTrace
    Event:
      type: object
      properties:
        id:
          type: string
          description: Unique identifier for the event, prefixed with `evt_`.
        type:
          type: string
          enum:
            - EVENT
          description: Object type. Always `EVENT`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this event.
        created_at:
          type: string
          format: date-time
          description: Timestamp of when the event was created, in ISO 8601 format.
        updated_at:
          type: string
          format: date-time
          description: Timestamp of when the event was last updated, in ISO 8601 format.
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
            Unique identifier of the program this event belongs to, prefixed
            with `prgrm_`. `null` if the event is not scoped to a specific
            program.
        event_type:
          $ref: '#/components/schemas/EventType'
          description: >-
            The type of event, in the format `RESOURCE.ACTION`. Determines what
            kind of object is in the `resource` field and what action triggered
            the event.
        resource:
          $ref: '#/components/schemas/EventResource'
          description: >-
            A snapshot of the resource at the time the event was created. The
            shape depends on the `event_type` — see [Supported
            Events](/api-reference/events/supported-events) for the resource
            object each event type carries.
        api_version:
          type: string
          description: >-
            The API version used to render this event's `resource` payload.
            Follows date-based versioning.
        trace:
          $ref: '#/components/schemas/EventTrace'
          description: >-
            Request tracing information for the API call that triggered this
            event.
      required:
        - id
        - type
        - url
        - created_at
        - updated_at
        - event_type
        - resource
        - api_version
      title: Event
    EVENTS_listEvents_Response_200:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/Event'
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
      title: EVENTS_listEvents_Response_200
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
  "url": "https://api.erebor.bank/events?page_size=1",
  "data": [
    {
      "id": "evt_01kasd1tthf1ns1pjn1kncctwd",
      "type": "EVENT",
      "url": "https://api.erebor.bank/events/evt_01kasd1tthf1ns1pjn1kncctwd",
      "created_at": "2025-01-15T09:00:00Z",
      "updated_at": "2025-01-15T09:00:00Z",
      "event_type": "DEPOSIT_ACCOUNT.OPEN",
      "resource": {},
      "api_version": "2025-12-21",
      "archived_at": null,
      "trace": {
        "request_id": "0197b6f0-3f6a-7c3e-9b2a-d41e8c9f5a6b"
      }
    }
  ],
  "page_next": "https://api.erebor.bank/events?starting_after=evt_01kasd1tthf1ns1pjn1kncctwd&page_size=1",
  "page_prev": null
}
```

**SDK Code**

```python List of events
import requests

url = "https://api.erebor.bank/events"

headers = {"Authorization": "<apiKey>"}

response = requests.get(url, headers=headers)

print(response.json())
```

```javascript List of events
const url = 'https://api.erebor.bank/events';
const options = {method: 'GET', headers: {Authorization: '<apiKey>'}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go List of events
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/events"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("Authorization", "<apiKey>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby List of events
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/events")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["Authorization"] = '<apiKey>'

response = http.request(request)
puts response.read_body
```

```java List of events
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.get("https://api.erebor.bank/events")
  .header("Authorization", "<apiKey>")
  .asString();
```

```php List of events
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('GET', 'https://api.erebor.bank/events', [
  'headers' => [
    'Authorization' => '<apiKey>',
  ],
]);

echo $response->getBody();
```

```csharp List of events
using RestSharp;

var client = new RestClient("https://api.erebor.bank/events");
var request = new RestRequest(Method.GET);
request.AddHeader("Authorization", "<apiKey>");
IRestResponse response = client.Execute(request);
```

```swift List of events
import Foundation

let headers = ["Authorization": "<apiKey>"]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/events")! as URL,
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