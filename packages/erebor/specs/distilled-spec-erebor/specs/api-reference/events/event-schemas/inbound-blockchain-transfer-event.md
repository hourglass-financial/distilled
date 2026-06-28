> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Inbound Blockchain Transfer Event

POST 

Fired when an inbound blockchain transfer changes status.

**Event types:**
- `BLOCKCHAIN_IN.PENDING` — Inbound blockchain transfer is pending
- `BLOCKCHAIN_IN.SETTLED` — Inbound blockchain transfer has settled
- `BLOCKCHAIN_IN.FAILED` — Inbound blockchain transfer has failed


Reference: https://docs.erebor.bank/api-reference/events/event-schemas/inbound-blockchain-transfer-event

## OpenAPI 3.1 Webhook Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths: {}
webhooks:
  inbound-blockchain-transfer-event:
    post:
      operationId: inbound-blockchain-transfer-event
      summary: Inbound Blockchain Transfer Event
      description: |
        Fired when an inbound blockchain transfer changes status.

        **Event types:**
        - `BLOCKCHAIN_IN.PENDING` — Inbound blockchain transfer is pending
        - `BLOCKCHAIN_IN.SETTLED` — Inbound blockchain transfer has settled
        - `BLOCKCHAIN_IN.FAILED` — Inbound blockchain transfer has failed
      responses:
        '200':
          description: Webhook received successfully
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/InboundBlockchainTransferEvent'
components:
  schemas:
    EventBaseTrace:
      type: object
      properties:
        request_id:
          type:
            - string
            - 'null'
        request_idempotency_key:
          type:
            - string
            - 'null'
      title: EventBaseTrace
    InboundBlockchainTransferEventEventType:
      type: string
      enum:
        - BLOCKCHAIN_IN.PENDING
        - BLOCKCHAIN_IN.SETTLED
        - BLOCKCHAIN_IN.FAILED
      description: The specific inbound blockchain transfer event action
      title: InboundBlockchainTransferEventEventType
    InboundBlockchainTransferStatus:
      type: string
      enum:
        - CREATED
        - PENDING
        - NEEDS_ATTRIBUTION
        - SETTLED
        - FAILED
      description: >
        Inbound blockchain transfer status:

        - CREATED: Transfer was created

        - PENDING: Transfer is being processed

        - NEEDS_ATTRIBUTION: Inbound transfer requires attribution to a
        counterparty

        - SETTLED: Transfer completed successfully (terminal)

        - FAILED: Transfer failed (terminal)
      title: InboundBlockchainTransferStatus
    CryptoAmountCurrency:
      type: string
      enum:
        - USAT
        - USDC
        - USDT
      description: Currency code
      title: CryptoAmountCurrency
    CryptoAmount:
      type: object
      properties:
        currency:
          $ref: '#/components/schemas/CryptoAmountCurrency'
          description: Currency code
        exponent:
          type: integer
          description: Number of decimal places
        value:
          type: string
          description: Stablecoin amount in cents
        display_value:
          type: string
          description: Stablecoin amount in dollars
      required:
        - currency
        - exponent
        - value
        - display_value
      description: Display amount for blockchain transfers (USDC, USAT, or USDT)
      title: CryptoAmount
    BlockchainNetwork:
      type: string
      enum:
        - BASE
        - ETHEREUM
        - INK
        - SOLANA
        - SUI
      description: Supported blockchain networks
      title: BlockchainNetwork
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
    InboundBlockchainTransfer:
      type: object
      properties:
        id:
          type: string
          description: >-
            Unique identifier for the inbound blockchain transfer, prefixed with
            `bc_in_`.
        type:
          type: string
          enum:
            - BLOCKCHAIN_IN
          description: Object type. Always `BLOCKCHAIN_IN`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this inbound blockchain transfer.
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
          $ref: '#/components/schemas/InboundBlockchainTransferStatus'
        deposit_account_id:
          type: string
          description: >-
            ID of the internal deposit account receiving the transfer, prefixed
            with `dep_acct_`.
        counterparty_blockchain_address_id:
          type:
            - string
            - 'null'
          description: >-
            ID of the external blockchain address that sent the transfer,
            prefixed with `cp_bc_addr_`. `null` if the sender has not been
            identified yet.
        amount:
          $ref: '#/components/schemas/CryptoAmount'
        network:
          $ref: '#/components/schemas/BlockchainNetwork'
        transaction_hash:
          type:
            - string
            - 'null'
          description: On-chain transaction hash for the transfer.
        from_address:
          type:
            - string
            - 'null'
          description: Source blockchain address
        to_address:
          type:
            - string
            - 'null'
          description: Destination blockchain address
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
        - network
      title: InboundBlockchainTransfer
    InboundBlockchainTransferEvent:
      type: object
      properties:
        id:
          type: string
          description: Unique identifier for the event
        type:
          type: string
          enum:
            - EVENT
        url:
          type: string
          format: uri
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time
        archived_at:
          type:
            - string
            - 'null'
          format: date-time
        program_id:
          type:
            - string
            - 'null'
          description: Unique identifier for the program this event belongs to
        api_version:
          type: string
        trace:
          $ref: '#/components/schemas/EventBaseTrace'
        event_type:
          $ref: '#/components/schemas/InboundBlockchainTransferEventEventType'
          description: The specific inbound blockchain transfer event action
        resource:
          $ref: '#/components/schemas/InboundBlockchainTransfer'
          description: Snapshot of the inbound blockchain transfer at the time of the event
      required:
        - id
        - type
        - url
        - created_at
        - updated_at
        - api_version
        - event_type
        - resource
      title: InboundBlockchainTransferEvent

```