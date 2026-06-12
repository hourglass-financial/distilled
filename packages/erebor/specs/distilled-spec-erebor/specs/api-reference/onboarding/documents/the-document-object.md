> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# The Document Object

Documents are files uploaded during the onboarding process. They're used to verify identity (driver's licenses, passports) and business formation (articles of incorporation, EIN confirmation letters).

```json title="The Document Object"
{
  "id": "doc_01kasd1tthf1ns1pjn1kncctwd",
  "type": "DOCUMENT",
  "url": "https://api.erebor.bank/documents/doc_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T09:30:00Z",
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "name": "drivers_license.pdf",
  "description": "Driver's license for John Doe",
  "document_type": "US_DRIVERS_LICENSE",
  "content_hash": "5891b5b522d5df086d0ff0b110fbd9d21bb4fc7163af34d08286a2e846f6be03",
  "content_size": 245760,
  "content_type": "application/pdf",
  "content_url": "https://erebor-documents.s3.amazonaws.com/doc_01kasd1tthf1ns1pjn1kncctwd",
  "custom_ref": "DOC-2025-7821",
  "custom_fields": {
    "category": "kyc",
    "applicant": "biz_app_01kasd1tthf1ns1pjn1kncctwd"
  }
}
```

## Attributes

### Schema (`Document`)

```yaml
components:
  schemas:
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
```