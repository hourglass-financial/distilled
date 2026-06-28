> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# The Inbound Blockchain Transfer Object

An inbound blockchain transfer represents cryptocurrency funds received on-chain from an external blockchain address. These are created automatically when an on-chain transfer is detected to your customer's blockchain address.

```json title="The Inbound Blockchain Transfer Object"
{
  "id": "bc_in_01kasd1tthf1ns1pjn1kncctwd",
  "type": "BLOCKCHAIN_IN",
  "url": "https://api.erebor.bank/blockchain_in/bc_in_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T09:30:00Z",
  "archived_at": null,
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "status": "SETTLED",
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "counterparty_blockchain_address_id": "cp_bc_addr_01kasd1tthf1ns1pjn1kncctwd",
  "amount": {
    "currency": "USAT",
    "exponent": 2,
    "value": "500000",
    "display_value": "5000.00"
  },
  "network": "ETHEREUM",
  "transaction_hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "from_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f8fE0C",
  "to_address": "0x8ba1f109551bD432803012645Ac136ddd64DBA72"
}
```

## Attributes

### Schema (`InboundBlockchainTransfer`)

```yaml
components:
  schemas:
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
```