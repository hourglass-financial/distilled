> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Upload Document

POST https://api.erebor.bank/documents
Content-Type: multipart/form-data

Upload a document for Onboarding verification

Reference: https://docs.erebor.bank/api-reference/onboarding/documents/create-document

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /documents:
    post:
      operationId: create-document
      summary: Upload Document
      description: Upload a document for Onboarding verification
      tags:
        - subpackage_documents
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
          description: Document uploaded successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Document'
      requestBody:
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
                  description: The document file to upload
                document_type:
                  $ref: >-
                    #/components/schemas/DocumentsPostRequestBodyContentMultipartFormDataSchemaDocumentType
                  description: Type of document being uploaded
                name:
                  type: string
                  description: Name of the document file
                description:
                  type: string
                  description: Optional description of the document
                program_id:
                  type: string
                  description: Unique identifier for the program this document belongs to
                custom_ref:
                  $ref: '#/components/schemas/CustomRef'
                custom_fields:
                  $ref: '#/components/schemas/CustomFields'
              required:
                - file
                - document_type
                - name
                - program_id
servers:
  - url: https://api.erebor.bank
    description: API server (environment determined by API key)
components:
  schemas:
    DocumentsPostRequestBodyContentMultipartFormDataSchemaDocumentType:
      type: string
      enum:
        - US_DRIVERS_LICENSE
        - PASSPORT
        - FORMATION_DOCUMENT
        - IRS_EIN_CONFIRMATION
        - OTHER
      description: Type of document being uploaded
      title: DocumentsPostRequestBodyContentMultipartFormDataSchemaDocumentType
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



**Request**

```json
{
  "file": "<file: @drivers_license.pdf>",
  "document_type": "US_DRIVERS_LICENSE",
  "name": "drivers_license.pdf",
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "custom_ref": "DOC-2025-7821",
  "custom_fields": {
    "category": "kyc",
    "applicant": "biz_app_01kasd1tthf1ns1pjn1kncctwd"
  }
}
```

**Response**

```json
{
  "id": "doc_01kasd1tthf1ns1pjn1kncctwd",
  "type": "DOCUMENT",
  "url": "https://api.erebor.bank/documents/doc_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T09:30:00Z",
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
```

**SDK Code**

```python
import requests

url = "https://api.erebor.bank/documents"

files = { "file": "open('@drivers_license.pdf', 'rb')" }
payload = {
    "document_type": "US_DRIVERS_LICENSE",
    "name": "drivers_license.pdf",
    "description": ,
    "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
    "custom_ref": "DOC-2025-7821",
    "custom_fields": "{
  \"category\": \"kyc\",
  \"applicant\": \"biz_app_01kasd1tthf1ns1pjn1kncctwd\"
}"
}
headers = {"Authorization": "<apiKey>"}

response = requests.post(url, data=payload, files=files, headers=headers)

print(response.json())
```

```javascript
const url = 'https://api.erebor.bank/documents';
const form = new FormData();
form.append('file', '@drivers_license.pdf');
form.append('document_type', 'US_DRIVERS_LICENSE');
form.append('name', 'drivers_license.pdf');
form.append('description', '');
form.append('program_id', 'prgrm_01kasd1tthf1ns1pjn1kncctwd');
form.append('custom_ref', 'DOC-2025-7821');
form.append('custom_fields', '{
  "category": "kyc",
  "applicant": "biz_app_01kasd1tthf1ns1pjn1kncctwd"
}');

const options = {method: 'POST', headers: {Authorization: '<apiKey>'}};

options.body = form;

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/documents"

	payload := strings.NewReader("-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"file\"; filename=\"@drivers_license.pdf\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"document_type\"\r\n\r\nUS_DRIVERS_LICENSE\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"name\"\r\n\r\ndrivers_license.pdf\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"description\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"program_id\"\r\n\r\nprgrm_01kasd1tthf1ns1pjn1kncctwd\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"custom_ref\"\r\n\r\nDOC-2025-7821\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"custom_fields\"\r\n\r\n{\n  \"category\": \"kyc\",\n  \"applicant\": \"biz_app_01kasd1tthf1ns1pjn1kncctwd\"\n}\r\n-----011000010111000001101001--\r\n")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("Authorization", "<apiKey>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/documents")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Authorization"] = '<apiKey>'
request.body = "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"file\"; filename=\"@drivers_license.pdf\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"document_type\"\r\n\r\nUS_DRIVERS_LICENSE\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"name\"\r\n\r\ndrivers_license.pdf\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"description\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"program_id\"\r\n\r\nprgrm_01kasd1tthf1ns1pjn1kncctwd\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"custom_ref\"\r\n\r\nDOC-2025-7821\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"custom_fields\"\r\n\r\n{\n  \"category\": \"kyc\",\n  \"applicant\": \"biz_app_01kasd1tthf1ns1pjn1kncctwd\"\n}\r\n-----011000010111000001101001--\r\n"

response = http.request(request)
puts response.read_body
```

```java
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.post("https://api.erebor.bank/documents")
  .header("Authorization", "<apiKey>")
  .body("-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"file\"; filename=\"@drivers_license.pdf\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"document_type\"\r\n\r\nUS_DRIVERS_LICENSE\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"name\"\r\n\r\ndrivers_license.pdf\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"description\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"program_id\"\r\n\r\nprgrm_01kasd1tthf1ns1pjn1kncctwd\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"custom_ref\"\r\n\r\nDOC-2025-7821\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"custom_fields\"\r\n\r\n{\n  \"category\": \"kyc\",\n  \"applicant\": \"biz_app_01kasd1tthf1ns1pjn1kncctwd\"\n}\r\n-----011000010111000001101001--\r\n")
  .asString();
```

```php
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://api.erebor.bank/documents', [
  'multipart' => [
    [
        'name' => 'file',
        'filename' => '@drivers_license.pdf',
        'contents' => null
    ],
    [
        'name' => 'document_type',
        'contents' => 'US_DRIVERS_LICENSE'
    ],
    [
        'name' => 'name',
        'contents' => 'drivers_license.pdf'
    ],
    [
        'name' => 'program_id',
        'contents' => 'prgrm_01kasd1tthf1ns1pjn1kncctwd'
    ],
    [
        'name' => 'custom_ref',
        'contents' => 'DOC-2025-7821'
    ],
    [
        'name' => 'custom_fields',
        'contents' => '{
  "category": "kyc",
  "applicant": "biz_app_01kasd1tthf1ns1pjn1kncctwd"
}'
    ]
  ]
  'headers' => [
    'Authorization' => '<apiKey>',
  ],
]);

echo $response->getBody();
```

```csharp
using RestSharp;

var client = new RestClient("https://api.erebor.bank/documents");
var request = new RestRequest(Method.POST);
request.AddHeader("Authorization", "<apiKey>");
request.AddParameter("undefined", "-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"file\"; filename=\"@drivers_license.pdf\"\r\nContent-Type: application/octet-stream\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"document_type\"\r\n\r\nUS_DRIVERS_LICENSE\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"name\"\r\n\r\ndrivers_license.pdf\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"description\"\r\n\r\n\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"program_id\"\r\n\r\nprgrm_01kasd1tthf1ns1pjn1kncctwd\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"custom_ref\"\r\n\r\nDOC-2025-7821\r\n-----011000010111000001101001\r\nContent-Disposition: form-data; name=\"custom_fields\"\r\n\r\n{\n  \"category\": \"kyc\",\n  \"applicant\": \"biz_app_01kasd1tthf1ns1pjn1kncctwd\"\n}\r\n-----011000010111000001101001--\r\n", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = ["Authorization": "<apiKey>"]
let parameters = [
  [
    "name": "file",
    "fileName": "@drivers_license.pdf"
  ],
  [
    "name": "document_type",
    "value": "US_DRIVERS_LICENSE"
  ],
  [
    "name": "name",
    "value": "drivers_license.pdf"
  ],
  [
    "name": "description",
    "value": 
  ],
  [
    "name": "program_id",
    "value": "prgrm_01kasd1tthf1ns1pjn1kncctwd"
  ],
  [
    "name": "custom_ref",
    "value": "DOC-2025-7821"
  ],
  [
    "name": "custom_fields",
    "value": "{
  \"category\": \"kyc\",
  \"applicant\": \"biz_app_01kasd1tthf1ns1pjn1kncctwd\"
}"
  ]
]

let boundary = "---011000010111000001101001"

var body = ""
var error: NSError? = nil
for param in parameters {
  let paramName = param["name"]!
  body += "--\(boundary)\r\n"
  body += "Content-Disposition:form-data; name=\"\(paramName)\""
  if let filename = param["fileName"] {
    let contentType = param["content-type"]!
    let fileContent = String(contentsOfFile: filename, encoding: String.Encoding.utf8)
    if (error != nil) {
      print(error as Any)
    }
    body += "; filename=\"\(filename)\"\r\n"
    body += "Content-Type: \(contentType)\r\n\r\n"
    body += fileContent
  } else if let paramValue = param["value"] {
    body += "\r\n\r\n\(paramValue)"
  }
}

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/documents")! as URL,
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