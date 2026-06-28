> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# List Webhooks

GET https://api.erebor.bank/webhooks

Retrieve a paginated list of Webhook endpoints.

Reference: https://docs.erebor.bank/api-reference/webhooks/list-webhooks

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /webhooks:
    get:
      operationId: list-webhooks
      summary: List Webhooks
      description: Retrieve a paginated list of Webhook endpoints.
      tags:
        - subpackage_webhooks
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
        - name: status
          in: query
          description: >-
            Filter by webhook status. Repeat the param to filter on multiple
            statuses (ORed together).
          required: false
          schema:
            type: array
            items:
              $ref: '#/components/schemas/WebhookStatus'
        - name: webhook_url
          in: query
          description: >-
            Filter by exact webhook URL. Repeat the param to match on multiple
            URLs (ORed together).
          required: false
          schema:
            type: array
            items:
              type: string
              format: uri
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
          description: List of Webhooks
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WEBHOOKS_listWebhooks_Response_200'
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
servers:
  - url: https://api.erebor.bank
    description: API server (environment determined by API key)
components:
  schemas:
    WebhookStatus:
      type: string
      enum:
        - ENABLED
        - DISABLED
        - ARCHIVED
      description: >
        - ENABLED: Webhook is active and will deliver events

        - DISABLED: Webhook is inactive and will not deliver events

        - ARCHIVED: Webhook was archived via `POST /webhooks/{id}/archive` and
        will no longer deliver events. Archiving is irreversible and can't be
        set via the update endpoint.
      title: WebhookStatus
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
    WebhookType:
      type: string
      enum:
        - WEBHOOK
      description: Object type. Always `WEBHOOK`.
      title: WebhookType
    WebhookEventType:
      type: string
      enum:
        - DEPOSIT_ACCOUNT.CREATED
        - DEPOSIT_ACCOUNT.PENDING
        - DEPOSIT_ACCOUNT.OPEN
        - DEPOSIT_ACCOUNT.UPDATED
        - DEPOSIT_ACCOUNT.CLOSED
        - DEPOSIT_ACCOUNT.FROZEN
        - TRANSFER.PENDING
        - TRANSFER.SETTLED
        - TRANSFER.FAILED
        - ACH_IN.CREATED
        - ACH_IN.PENDING
        - ACH_IN.SETTLED
        - ACH_IN.FAILED
        - ACH_IN.RETURNED
        - ACH_OUT.CREATED
        - ACH_OUT.PENDING
        - ACH_OUT.SENT
        - ACH_OUT.SETTLED
        - ACH_OUT.FAILED
        - ACH_OUT.RETURNED
        - ACH_OUT.CANCELLED
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
        - CUSTOMER.UPDATED
        - '*'
      description: >-
        The type of event a webhook can subscribe to. Use `*` to subscribe to
        all events.
      title: WebhookEventType
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
    Webhook:
      type: object
      properties:
        id:
          type: string
          description: Unique identifier for the webhook, prefixed with `whk_`.
        type:
          $ref: '#/components/schemas/WebhookType'
          description: Object type. Always `WEBHOOK`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this webhook.
        created_at:
          type: string
          format: date-time
          description: Timestamp of when the webhook was created, in ISO 8601 format.
        updated_at:
          type: string
          format: date-time
          description: Timestamp of when the webhook was last updated, in ISO 8601 format.
        archived_at:
          type:
            - string
            - 'null'
          format: date-time
        name:
          type: string
          description: Human-readable name for the webhook.
        status:
          $ref: '#/components/schemas/WebhookStatus'
        webhook_url:
          type: string
          format: uri
          description: The URL where event payloads are delivered via HTTP POST.
        webhook_secret:
          type:
            - string
            - 'null'
          description: >-
            Secret used to verify webhook signatures. Only returned on creation
            for security — subsequent reads return `null`.
        event_types:
          type:
            - array
            - 'null'
          items:
            $ref: '#/components/schemas/WebhookEventType'
          description: >-
            Event types this webhook subscribes to. `null` means all event
            types.
        idempotency_key:
          type: string
          description: >-
            The idempotency key from the create request, or an auto-generated
            one if no key was provided.
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
        - status
        - webhook_url
        - idempotency_key
      title: Webhook
    WEBHOOKS_listWebhooks_Response_200:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/Webhook'
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
      title: WEBHOOKS_listWebhooks_Response_200
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
  "has_more": true,
  "page_size": 1,
  "url": "https://api.erebor.bank/webhooks?page_size=1",
  "data": [
    {
      "id": "whk_01kasd1tthf1ns1pjn1kncctwd",
      "type": "WEBHOOK",
      "url": "https://api.erebor.bank/webhooks/whk_01kasd1tthf1ns1pjn1kncctwd",
      "created_at": "2025-01-15T09:00:00Z",
      "updated_at": "2025-01-15T09:00:00Z",
      "name": "Account notifications",
      "status": "ENABLED",
      "webhook_url": "https://api.myapp.com/webhooks/erebor",
      "idempotency_key": "user-key-123",
      "archived_at": null,
      "event_types": [
        "DEPOSIT_ACCOUNT.OPEN",
        "TRANSACTION.SETTLED"
      ],
      "custom_ref": "WHK-PROD-NOTIFICATIONS",
      "custom_fields": {
        "environment": "production",
        "team": "platform"
      }
    }
  ],
  "page_next": "https://api.erebor.bank/webhooks?starting_after=whk_01kasd1tthf1ns1pjn1kncctwd&page_size=1",
  "page_prev": null
}
```

**SDK Code**

```python List of Webhooks
import requests

url = "https://api.erebor.bank/webhooks"

querystring = {"status":"[\"ENABLED\",\"DISABLED\"]"}

headers = {"Authorization": "<apiKey>"}

response = requests.get(url, headers=headers, params=querystring)

print(response.json())
```

```javascript List of Webhooks
const url = 'https://api.erebor.bank/webhooks?status=%5B%22ENABLED%22%2C%22DISABLED%22%5D';
const options = {method: 'GET', headers: {Authorization: '<apiKey>'}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go List of Webhooks
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/webhooks?status=%5B%22ENABLED%22%2C%22DISABLED%22%5D"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("Authorization", "<apiKey>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby List of Webhooks
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/webhooks?status=%5B%22ENABLED%22%2C%22DISABLED%22%5D")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["Authorization"] = '<apiKey>'

response = http.request(request)
puts response.read_body
```

```java List of Webhooks
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.get("https://api.erebor.bank/webhooks?status=%5B%22ENABLED%22%2C%22DISABLED%22%5D")
  .header("Authorization", "<apiKey>")
  .asString();
```

```php List of Webhooks
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('GET', 'https://api.erebor.bank/webhooks?status=%5B%22ENABLED%22%2C%22DISABLED%22%5D', [
  'headers' => [
    'Authorization' => '<apiKey>',
  ],
]);

echo $response->getBody();
```

```csharp List of Webhooks
using RestSharp;

var client = new RestClient("https://api.erebor.bank/webhooks?status=%5B%22ENABLED%22%2C%22DISABLED%22%5D");
var request = new RestRequest(Method.GET);
request.AddHeader("Authorization", "<apiKey>");
IRestResponse response = client.Execute(request);
```

```swift List of Webhooks
import Foundation

let headers = ["Authorization": "<apiKey>"]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/webhooks?status=%5B%22ENABLED%22%2C%22DISABLED%22%5D")! as URL,
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