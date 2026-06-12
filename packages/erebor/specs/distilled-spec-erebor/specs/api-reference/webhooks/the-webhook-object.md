> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# The Webhook Object

A webhook is an endpoint configuration that receives event notifications from Erebor. When events matching your subscribed types occur, Erebor sends HTTP POST requests to your webhook URL with the event payload.

```json title="The Webhook Object"
{
  "id": "whk_01kasd1tthf1ns1pjn1kncctwd",
  "type": "WEBHOOK",
  "url": "https://api.erebor.bank/webhooks/whk_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T09:30:00Z",
  "archived_at": null,
  "name": "Account notifications",
  "status": "ENABLED",
  "webhook_url": "https://api.myapp.com/webhooks/erebor",
  "webhook_secret": null,
  "event_types": ["DEPOSIT_ACCOUNT.OPEN", "TRANSACTION.SETTLED"],
  "idempotency_key": "user-key-123",
  "custom_ref": "WHK-PROD-NOTIFICATIONS",
  "custom_fields": {
    "environment": "production",
    "team": "platform"
  }
}
```

## Attributes

### Schema (`Webhook`)

```yaml
components:
  schemas:
    WebhookType:
      type: string
      enum:
        - WEBHOOK
      description: Object type. Always `WEBHOOK`.
      title: WebhookType
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
```