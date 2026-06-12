> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# List Documents

GET https://api.erebor.bank/documents

Retrieve a list of Documents

Reference: https://docs.erebor.bank/api-reference/onboarding/documents/list-documents

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /documents:
    get:
      operationId: list-documents
      summary: List Documents
      description: Retrieve a list of Documents
      tags:
        - subpackage_documents
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
          description: List of documents
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DOCUMENTS_listDocuments_Response_200'
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
    DocumentDocumentType:
      type: string
      enum:
        - US_DRIVERS_LICENSE
        - PASSPORT
        - FORMATION_DOCUMENT
        - IRS_EIN_CONFIRMATION
        - OTHER
      description: Type of document.
      title: DocumentDocumentType
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
    Document:
      type: object
      properties:
        id:
          type: string
          description: Unique identifier for the document, prefixed with `doc_`.
        type:
          type: string
          enum:
            - DOCUMENT
          description: Object type. Always `DOCUMENT`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this document.
        created_at:
          type: string
          format: date-time
          description: Timestamp of when the document was created, in ISO 8601 format.
        updated_at:
          type: string
          format: date-time
          description: Timestamp of when the document was last updated, in ISO 8601 format.
        archived_at:
          type:
            - string
            - 'null'
          format: date-time
        program_id:
          type: string
          description: >-
            Unique identifier of the program this document belongs to, prefixed
            with `prgrm_`.
        name:
          type: string
          description: Original filename of the uploaded document.
        description:
          type:
            - string
            - 'null'
          description: Optional description of the document's contents.
        document_type:
          $ref: '#/components/schemas/DocumentDocumentType'
          description: Type of document.
        content_hash:
          type: string
          description: >-
            SHA-256 hash of the file contents, used to verify document
            integrity.
        content_size:
          type: integer
          description: File size in bytes.
        content_type:
          type: string
          description: >-
            MIME type of the uploaded file (e.g., `application/pdf`,
            `image/jpeg`).
        content_url:
          type: string
          format: uri
          description: Pre-signed URL for downloading the document contents.
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
        - program_id
        - name
        - document_type
        - content_hash
        - content_size
        - content_type
        - content_url
      title: Document
    DOCUMENTS_listDocuments_Response_200:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/Document'
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
      title: DOCUMENTS_listDocuments_Response_200
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
  "url": "https://api.erebor.bank/documents?page_size=1",
  "data": [
    {
      "id": "doc_01kasd1tthf1ns1pjn1kncctwd",
      "type": "DOCUMENT",
      "url": "https://api.erebor.bank/documents/doc_01kasd1tthf1ns1pjn1kncctwd",
      "created_at": "2025-01-15T09:00:00Z",
      "updated_at": "2025-01-15T09:00:00Z",
      "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
      "name": "drivers_license.pdf",
      "document_type": "US_DRIVERS_LICENSE",
      "content_hash": "5891b5b522d5df086d0ff0b110fbd9d21bb4fc7163af34d08286a2e846f6be03",
      "content_size": 245760,
      "content_type": "application/pdf",
      "content_url": "https://erebor-documents.s3.amazonaws.com/doc_01kasd1tthf1ns1pjn1kncctwd",
      "archived_at": null,
      "description": "Driver's license for John Doe",
      "custom_ref": "DOC-2025-7821",
      "custom_fields": {
        "category": "kyc",
        "applicant": "biz_app_01kasd1tthf1ns1pjn1kncctwd"
      }
    }
  ],
  "page_next": "https://api.erebor.bank/documents?starting_after=doc_01kasd1tthf1ns1pjn1kncctwd&page_size=1",
  "page_prev": null
}
```

**SDK Code**

```python List of documents
import requests

url = "https://api.erebor.bank/documents"

headers = {"Authorization": "<apiKey>"}

response = requests.get(url, headers=headers)

print(response.json())
```

```javascript List of documents
const url = 'https://api.erebor.bank/documents';
const options = {method: 'GET', headers: {Authorization: '<apiKey>'}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go List of documents
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/documents"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("Authorization", "<apiKey>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby List of documents
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/documents")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["Authorization"] = '<apiKey>'

response = http.request(request)
puts response.read_body
```

```java List of documents
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.get("https://api.erebor.bank/documents")
  .header("Authorization", "<apiKey>")
  .asString();
```

```php List of documents
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('GET', 'https://api.erebor.bank/documents', [
  'headers' => [
    'Authorization' => '<apiKey>',
  ],
]);

echo $response->getBody();
```

```csharp List of documents
using RestSharp;

var client = new RestClient("https://api.erebor.bank/documents");
var request = new RestRequest(Method.GET);
request.AddHeader("Authorization", "<apiKey>");
IRestResponse response = client.Execute(request);
```

```swift List of documents
import Foundation

let headers = ["Authorization": "<apiKey>"]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/documents")! as URL,
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