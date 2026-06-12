> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# The Deposit Account Object

A deposit account holds funds for a customer. Accounts are created automatically when an [Onboarding](/api-reference/onboarding/onboarding/list-onboardings) is approved. Each account has balances, account numbers for receiving wires and ACH, and optionally blockchain addresses for crypto transfers.

```json title="The Deposit Account Object"
{
  "id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "type": "DEPOSIT_ACCOUNT",
  "url": "https://api.erebor.bank/deposit_accounts/dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T09:30:00Z",
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "customer_id": "cust_01kasd1tthf1ns1pjn1kncctwd",
  "name": "Main Business Account",
  "status": "OPEN",
  "deposit_account_template_id": "dep_acct_tmpl_01kasd1tthf1ns1pjn1kncctwd",
  "deposit_account_type": "DDA",
  "ownership_type": "BUSINESS",
  "balances": {
    "current": { "currency": "USD", "exponent": 2, "value": "100000", "display_value": "1000.00" },
    "available": { "currency": "USD", "exponent": 2, "value": "95000", "display_value": "950.00" },
    "pending_in": { "currency": "USD", "exponent": 2, "value": "2500", "display_value": "25.00" },
    "pending_out": { "currency": "USD", "exponent": 2, "value": "0", "display_value": "0.00" }
  },
  "account_numbers": [],
  "default_account_number": null,
  "blockchain_addresses": [],
  "parent_account_id": null,
  "disclosures": {
    "disclosures_signed_externally": true
  },
  "custom_ref": "GL-OPERATING-USD",
  "custom_fields": {
    "cost_center": "engineering",
    "ledger_code": "1100"
  }
}
```

## Attributes

### Schema (`DepositAccount`)

```yaml
components:
  schemas:
    DepositAccountStatus:
      type: string
      enum:
        - PENDING
        - OPEN
        - CLOSED
        - FROZEN
      description: |
        - PENDING: Account requested but not yet open
        - OPEN: Account is active and ready for use
        - CLOSED: Account is closed, payments will be returned
        - FROZEN: Account is frozen for compliance reasons
      title: DepositAccountStatus
    DepositAccountType:
      type: string
      enum:
        - DDA
        - FBO
        - OMNIBUS
        - VIRTUAL_DDA
      description: >
        - DDA: Demand Deposit Account, behaves like a normal checking account,
        funds owned by the customer tied to this account.

        - FBO: For Benefit Of, this account holds an aggregate balance of
        virtual sub-accounts tied to it.

        - OMNIBUS: Behaves like a DDA, may hold funds for multiple entities
        without using virtual sub-accounts.

        - VIRTUAL_DDA: Virtual sub-account under an FBO parent account, with its
        own balance tracked separately.
      title: DepositAccountType
    OwnershipType:
      type: string
      enum:
        - BUSINESS
        - INDIVIDUAL
      title: OwnershipType
    Currency:
      type: string
      enum:
        - USD
        - USDC
      title: Currency
    DisplayAmount:
      type: object
      properties:
        currency:
          $ref: '#/components/schemas/Currency'
          description: >-
            Currency code (USD for wire/ACH transfers, USDC for blockchain
            transfers)
        exponent:
          type: integer
          description: Number of decimal places
        value:
          type: string
          description: Amount in cents
        display_value:
          type: string
          description: Human-readable amount
      required:
        - currency
        - exponent
        - value
        - display_value
      title: DisplayAmount
    CurrencyBalance:
      type: object
      properties:
        current:
          $ref: '#/components/schemas/DisplayAmount'
        available:
          $ref: '#/components/schemas/DisplayAmount'
        pending_in:
          $ref: '#/components/schemas/DisplayAmount'
        pending_out:
          $ref: '#/components/schemas/DisplayAmount'
      required:
        - current
        - available
        - pending_in
        - pending_out
      title: CurrencyBalance
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
    AccountNumber:
      type: object
      properties:
        id:
          type: string
          description: Unique identifier for the account number, prefixed with `acct_num_`.
        type:
          type: string
          enum:
            - ACCOUNT_NUMBER
          description: Object type. Always `ACCOUNT_NUMBER`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this account number.
        created_at:
          type: string
          format: date-time
          description: >-
            Timestamp of when the account number was created, in ISO 8601
            format.
        updated_at:
          type: string
          format: date-time
          description: >-
            Timestamp of when the account number was last updated, in ISO 8601
            format.
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
            Unique identifier of the program this account number belongs to,
            prefixed with `prgrm_`.
        deposit_account_id:
          type: string
          description: >-
            ID of the deposit account this account number belongs to, prefixed
            with `dep_acct_`.
        name:
          type:
            - string
            - 'null'
          description: Human-readable name for this account number.
        account_number:
          type: string
          description: Bank account number (up to 17 characters).
        routing_number:
          type: string
          description: Nine-digit ABA routing number.
        default:
          type: boolean
          description: Whether this is the default account number for the deposit account.
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
        - account_number
        - routing_number
        - default
      title: AccountNumber
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
    Disclosures:
      type: object
      properties:
        disclosures_signed_externally:
          type: boolean
          description: >-
            Set to true to indicate that your customer has been shown and has
            signed Erebor's disclosures prior to creating this account.
            Currently, this field is required and must be set to true in order
            for the request to succeed.
      required:
        - disclosures_signed_externally
      description: >-
        Contains information related to bank disclosures. You are responsible
        for presenting Erebor's required disclosures to your customers and
        obtaining their acknowledgment before account creation.
      title: Disclosures
    DepositAccount:
      type: object
      properties:
        id:
          type: string
          description: >-
            Unique identifier for the deposit account, prefixed with
            `dep_acct_`.
        type:
          type: string
          enum:
            - DEPOSIT_ACCOUNT
          description: Object type. Always `DEPOSIT_ACCOUNT`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this deposit account.
        created_at:
          type: string
          format: date-time
          description: >-
            Timestamp of when the deposit account was created, in ISO 8601
            format.
        updated_at:
          type: string
          format: date-time
          description: >-
            Timestamp of when the deposit account was last updated, in ISO 8601
            format.
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
            Unique identifier of the program this deposit account belongs to,
            prefixed with `prgrm_`.
        customer_id:
          type: string
          description: ID of the customer who owns this account, prefixed with `cust_`.
        name:
          type:
            - string
            - 'null'
          description: Human-readable name for the account.
        status:
          $ref: '#/components/schemas/DepositAccountStatus'
        deposit_account_template_id:
          type: string
          description: >-
            ID of the template used to create this account, prefixed with
            `dep_acct_tmpl_`.
        deposit_account_type:
          $ref: '#/components/schemas/DepositAccountType'
        ownership_type:
          $ref: '#/components/schemas/OwnershipType'
        balances:
          $ref: '#/components/schemas/CurrencyBalance'
          description: Account balances broken down by type.
        account_numbers:
          type: array
          items:
            $ref: '#/components/schemas/AccountNumber'
          description: List of account numbers associated with this account.
        default_account_number:
          oneOf:
            - $ref: '#/components/schemas/AccountNumber'
            - type: 'null'
          description: The default account number for this deposit account.
        blockchain_addresses:
          type: array
          items:
            $ref: '#/components/schemas/BlockchainAddress'
          description: List of blockchain addresses associated with this account.
        parent_account_id:
          type:
            - string
            - 'null'
          description: >-
            For `VIRTUAL_DDA` accounts, the ID of the parent FBO account. `null`
            for non-virtual accounts.
        disclosures:
          $ref: '#/components/schemas/Disclosures'
          description: Disclosure acknowledgment carried over from the onboarding.
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
        - customer_id
        - deposit_account_template_id
        - deposit_account_type
        - ownership_type
        - balances
        - disclosures
      title: DepositAccount
```