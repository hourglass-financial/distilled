> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# List Inbound ACH Transfers

GET https://api.erebor.bank/ach_in

Retrieve a paginated list of Inbound ACH Transfers

Reference: https://docs.erebor.bank/api-reference/payments/ach/inbound/list-inbound-ach-transfers

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /ach_in:
    get:
      operationId: list-inbound-ach-transfers
      summary: List Inbound ACH Transfers
      description: Retrieve a paginated list of Inbound ACH Transfers
      tags:
        - subpackage_inboundAchTransfers
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
        - name: deposit_account_id
          in: query
          description: Filter by deposit account ID
          required: false
          schema:
            type: string
        - name: status
          in: query
          description: Filter by transfer status
          required: false
          schema:
            $ref: '#/components/schemas/InboundACHTransferStatus'
        - name: customer_id
          in: query
          description: Filter by customer ID
          required: false
          schema:
            type: string
        - name: program_id
          in: query
          description: Filter by program ID
          required: false
          schema:
            type: string
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
      responses:
        '200':
          description: List of Inbound ACH Transfers
          content:
            application/json:
              schema:
                $ref: >-
                  #/components/schemas/INBOUND_ACH_TRANSFERS_listInboundACHTransfers_Response_200
servers:
  - url: https://api.erebor.bank
    description: API server (environment determined by API key)
components:
  schemas:
    InboundACHTransferStatus:
      type: string
      enum:
        - PENDING
        - SETTLED
        - FAILED
        - RETURNED
      description: |
        Inbound ACH transfer status:
        - PENDING: Transfer is being processed
        - SETTLED: Transfer has been completed
        - FAILED: Transfer failed
        - RETURNED: Transfer was returned
      title: InboundACHTransferStatus
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
    FiatAmount:
      type: object
      properties:
        currency:
          type: string
          enum:
            - USD
          description: USD for fiat transfers
        exponent:
          type: integer
          description: Number of decimal places
        value:
          type: string
          description: Amount in cents
        display_value:
          type: string
          description: Amount in dollars
      required:
        - currency
        - exponent
        - value
        - display_value
      description: >-
        Display amount restricted to USD currency only (for Wire, ACH, and Rails
        transfers)
      title: FiatAmount
    ACHDirection:
      type: string
      enum:
        - CREDIT
        - DEBIT
      description: ACH transfer direction
      title: ACHDirection
    InboundACHSecCode:
      type: string
      enum:
        - PPD
        - CCD
        - WEB
        - TEL
        - CTX
        - IAT
        - ARC
        - BOC
        - POP
        - RCK
        - POS
        - SHR
        - MTE
        - COR
        - CIE
        - DNE
        - ENR
        - ADV
        - ACK
        - ATX
        - PBR
        - TRC
        - TRX
        - XCK
      description: |
        ACH SEC code indicating the transaction type:
        - **Everyday Payment**: PPD, CCD, WEB, TEL, CTX, IAT
        - **Check Conversion**: ARC, BOC, POP, RCK
        - **POS/Debit Card**: POS, SHR, MTE
        - **Administrative**: COR, CIE, DNE, ENR, ADV
        - **Acknowledgment**: ACK, ATX
        - **Cross-Border**: PBR
        - **Legacy**: TRC, TRX, XCK
      title: InboundACHSecCode
    AddendaEntry:
      type: string
      description: >-
        ACH addenda record containing remittance information passed through to
        the recipient (max 80 characters). Must use NACHA-allowed characters
        only.
      title: AddendaEntry
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
    InboundACHTransfer:
      type: object
      properties:
        id:
          type: string
          description: >-
            Unique identifier for the inbound ACH transfer, prefixed with
            `in_ach_`.
        type:
          type: string
          enum:
            - ACH_IN
          description: Object type. Always `ACH_IN`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this inbound ACH transfer.
        created_at:
          type: string
          format: date-time
          description: Timestamp of when the transfer was created, in ISO 8601 format.
        updated_at:
          type: string
          format: date-time
          description: Timestamp of when the transfer was last updated, in ISO 8601 format.
        archived_at:
          type:
            - string
            - 'null'
          format: date-time
        program_id:
          type:
            - string
            - 'null'
          description: Unique identifier for the program this transfer belongs to
        status:
          $ref: '#/components/schemas/InboundACHTransferStatus'
        deposit_account_id:
          type: string
          description: >-
            ID of the internal deposit account receiving the transfer, prefixed
            with `dep_acct_`.
        amount:
          $ref: '#/components/schemas/FiatAmount'
        direction:
          $ref: '#/components/schemas/ACHDirection'
        sec_code:
          $ref: '#/components/schemas/InboundACHSecCode'
        company_entry_description:
          type: string
          description: >-
            Short label describing the transaction purpose, shown on receiver
            statements (max 10 characters).
        originating_company_id:
          type: string
          description: >-
            Tax ID or identifier of the company that initiated the ACH entry
            (max 10 characters).
        originating_company_name:
          type: string
          description: >-
            Name of the originating company, as shown on receiver statements
            (max 16 characters).
        effective_entry_date:
          type: string
          format: date
          description: Effective entry date for the ACH transfer in `YYYY-MM-DD` format.
        addenda:
          type: array
          items:
            $ref: '#/components/schemas/AddendaEntry'
          description: >-
            Addenda records containing remittance information (max 80 characters
            each).
        company_descriptive_date:
          type:
            - string
            - 'null'
          description: >-
            Optional date displayed to receivers for informational purposes (max
            6 characters). Not used for processing.
        company_discretionary_data:
          type:
            - string
            - 'null'
          description: Optional field for originator's internal use (max 20 characters).
        return_code:
          type:
            - string
            - 'null'
          description: NACHA return reason code. Populated when `status` is `RETURNED`.
        returned_at:
          type:
            - string
            - 'null'
          format: date-time
          description: Timestamp of when the return was recorded, in ISO 8601 format.
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
        - status
        - deposit_account_id
        - amount
        - direction
        - sec_code
        - company_entry_description
        - originating_company_id
        - originating_company_name
        - effective_entry_date
        - addenda
      title: InboundACHTransfer
    INBOUND_ACH_TRANSFERS_listInboundACHTransfers_Response_200:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/InboundACHTransfer'
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
      title: INBOUND_ACH_TRANSFERS_listInboundACHTransfers_Response_200
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
  "url": "https://api.erebor.bank/ach_in?page_size=1",
  "data": [
    {
      "id": "in_ach_01kasd1tthf1ns1pjn1kncctwd",
      "type": "ACH_IN",
      "url": "https://api.erebor.bank/ach_in/in_ach_01kasd1tthf1ns1pjn1kncctwd",
      "created_at": "2025-01-15T09:00:00Z",
      "updated_at": "2025-01-15T09:00:00Z",
      "status": "PENDING",
      "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
      "amount": {
        "currency": "USD",
        "exponent": 2,
        "value": "12345",
        "display_value": "123.45"
      },
      "direction": "CREDIT",
      "sec_code": "CCD",
      "company_entry_description": "PAYMENT",
      "originating_company_id": "1234567890",
      "originating_company_name": "ACME CORP",
      "effective_entry_date": "2025-01-15",
      "addenda": [],
      "archived_at": null,
      "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd"
    }
  ],
  "page_next": "https://api.erebor.bank/ach_in?starting_after=in_ach_01kasd1tthf1ns1pjn1kncctwd&page_size=1",
  "page_prev": null
}
```

**SDK Code**

```python List of Inbound ACH Transfers
import requests

url = "https://api.erebor.bank/ach_in"

headers = {"Authorization": "<apiKey>"}

response = requests.get(url, headers=headers)

print(response.json())
```

```javascript List of Inbound ACH Transfers
const url = 'https://api.erebor.bank/ach_in';
const options = {method: 'GET', headers: {Authorization: '<apiKey>'}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go List of Inbound ACH Transfers
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/ach_in"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("Authorization", "<apiKey>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby List of Inbound ACH Transfers
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/ach_in")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["Authorization"] = '<apiKey>'

response = http.request(request)
puts response.read_body
```

```java List of Inbound ACH Transfers
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.get("https://api.erebor.bank/ach_in")
  .header("Authorization", "<apiKey>")
  .asString();
```

```php List of Inbound ACH Transfers
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('GET', 'https://api.erebor.bank/ach_in', [
  'headers' => [
    'Authorization' => '<apiKey>',
  ],
]);

echo $response->getBody();
```

```csharp List of Inbound ACH Transfers
using RestSharp;

var client = new RestClient("https://api.erebor.bank/ach_in");
var request = new RestRequest(Method.GET);
request.AddHeader("Authorization", "<apiKey>");
IRestResponse response = client.Execute(request);
```

```swift List of Inbound ACH Transfers
import Foundation

let headers = ["Authorization": "<apiKey>"]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/ach_in")! as URL,
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