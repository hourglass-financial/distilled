> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# The Blockchain Address Object

A blockchain address is a wallet address associated with a deposit account for receiving and sending cryptocurrency transfers. Each address is tied to a specific blockchain network.

```json title="The Blockchain Address Object"
{
  "id": "bc_addr_01kasd1tthf1ns1pjn1kncctwd",
  "type": "BLOCKCHAIN_ADDRESS",
  "url": "https://api.erebor.bank/blockchain_addresses/bc_addr_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T09:30:00Z",
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "name": "Primary ETH Address",
  "address": "0x742d35Cc6529Cf6c6D06E4C8a4c07583F5C6C2d8",
  "address_type": "ETHEREUM",
  "custom_ref": "WALLET-2025-001",
  "custom_fields": {
    "purpose": "treasury",
    "network_tag": "evm-l2"
  }
}
```

## Attributes

### Schema (`BlockchainAddress`)

```yaml
components:
  schemas:
    AddressType:
      type: string
      enum:
        - ETHEREUM
        - SOLANA
        - SUI
      description: >
        High-level address family for creation. `ETHEREUM` provisions wallets
        across configured EVM networks

        (e.g. Ethereum, Base). `SOLANA` and `SUI` target a single-network
        family.
      title: AddressType
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
    BlockchainAddress:
      type: object
      properties:
        id:
          type: string
          description: >-
            Unique identifier for the blockchain address, prefixed with
            `bc_addr_`.
        type:
          type: string
          enum:
            - BLOCKCHAIN_ADDRESS
          description: Object type. Always `BLOCKCHAIN_ADDRESS`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this blockchain address.
        created_at:
          type: string
          format: date-time
          description: >-
            Timestamp of when the blockchain address was created, in ISO 8601
            format.
        updated_at:
          type: string
          format: date-time
          description: >-
            Timestamp of when the blockchain address was last updated, in ISO
            8601 format.
        archived_at:
          type:
            - string
            - 'null'
          format: date-time
        deposit_account_id:
          type: string
          description: >-
            ID of the deposit account this blockchain address belongs to,
            prefixed with `dep_acct_`.
        name:
          type:
            - string
            - 'null'
          description: Human-readable name for this blockchain address.
        address:
          type: string
          description: >
            On-chain address string. EVM chains use `0x` + 40 hex (checksummed
            mixed case is common in APIs).

            Solana uses base58. Sui uses `0x` + 64 hex.
        address_type:
          $ref: '#/components/schemas/AddressType'
        network:
          type: array
          items:
            $ref: '#/components/schemas/BlockchainNetwork'
          description: >
            Blockchain networks where this custodial address is active. For EVM,
            one logical address is often

            reused on multiple networks (e.g. Ethereum mainnet and Base); each
            network is listed separately.
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
        - deposit_account_id
        - address
        - address_type
        - network
      title: BlockchainAddress
```