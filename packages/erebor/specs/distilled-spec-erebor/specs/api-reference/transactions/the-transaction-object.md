> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# The Transaction Object

A transaction is a ledger entry representing the movement of funds in or out of a deposit account. Transactions are created automatically when payments (ACH, wire, blockchain, rail, or book transfers) are processed.

```json title="The Transaction Object"
{
  "id": "txn_01kasd1tthf1ns1pjn1kncctwd",
  "type": "TRANSACTION",
  "url": "https://api.erebor.bank/transactions/txn_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T09:30:00Z",
  "status": "SETTLED",
  "transaction_type": "WIRE_IN",
  "amount": {
    "currency": "USD",
    "exponent": 2,
    "value": "150000",
    "display_value": "1500.00"
  },
  "description": "Wire transfer from client",
  "associated_payments": [
    {
      "type": "WIRE_IN",
      "id": "wire_in_01kasd1tthf1ns1pjn1kncctwd",
      "url": "https://api.erebor.bank/wire_in/wire_in_01kasd1tthf1ns1pjn1kncctwd"
    }
  ],
  "from": {
    "type": "DEPOSIT_ACCOUNT",
    "id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
    "url": "https://api.erebor.bank/deposit_accounts/dep_acct_01kasd1tthf1ns1pjn1kncctwd",
    "description": "Operating account"
  },
  "to": {
    "type": "DEPOSIT_ACCOUNT",
    "id": "dep_acct_01jasd2tthf2ns2pjn2kncctwd",
    "url": "https://api.erebor.bank/deposit_accounts/dep_acct_01jasd2tthf2ns2pjn2kncctwd",
    "description": "Client escrow account"
  }
}
```

## Attributes

### Schema (`Transaction`)

```yaml
components:
  schemas:
    TransactionStatus:
      type: string
      enum:
        - CREATED
        - PENDING
        - SETTLED
        - FAILED
        - REVERSED
      description: |
        - CREATED: Transaction created but not yet processed
        - PENDING: Transaction processing in progress
        - SETTLED: Transaction successfully completed (terminal state)
        - FAILED: Transaction failed to process (terminal state)
        - REVERSED: Transaction was reversed/refunded (terminal state)
      title: TransactionStatus
    TransactionType:
      type: string
      enum:
        - ACH_IN
        - ACH_OUT
        - WIRE_IN
        - WIRE_OUT
        - INTERNATIONAL_WIRE_IN
        - INTERNATIONAL_WIRE_OUT
        - BLOCKCHAIN_IN
        - BLOCKCHAIN_OUT
        - RAIL_IN
        - RAIL_OUT
        - BOOK_TRANSFER
        - INTEREST
        - FEE
        - ADJUSTMENT
      description: >
        Type of transaction indicating the payment method and direction.

        - ACH_IN/ACH_OUT: ACH transfers

        - WIRE_IN/WIRE_OUT: Domestic wire transfers

        - INTERNATIONAL_WIRE_IN/INTERNATIONAL_WIRE_OUT: International Wire
        transfers

        - BLOCKCHAIN_IN/BLOCKCHAIN_OUT: Cryptocurrency transfers

        - RAIL_IN/RAIL_OUT: Rail transfers

        - BOOK_TRANSFER: Internal account-to-account transfers

        - INTEREST: Interest credited to account

        - FEE: Fee charged to account

        - ADJUSTMENT: Manual adjustment
      title: TransactionType
    Amount:
      type: object
      properties:
        currency:
          type: string
        exponent:
          type: integer
          description: Number of decimal places for display
        value:
          type: string
          description: Amount in smallest currency unit (e.g., cents)
        display_value:
          type: string
          description: Human-readable amount
      required:
        - currency
        - value
      title: Amount
    ResourceReference:
      type: object
      properties:
        type:
          type: string
          description: The type of the referenced resource
        id:
          type: string
          description: The ID of the referenced resource
        url:
          type: string
          format: uri
          description: The URL of the referenced resource
      required:
        - type
        - id
        - url
      title: ResourceReference
    TransactionFrom:
      type: object
      properties:
        type:
          type: string
          description: The type of the referenced resource
        id:
          type: string
          description: The ID of the referenced resource
        url:
          type: string
          format: uri
          description: The URL of the referenced resource
        description:
          type:
            - string
            - 'null'
          description: Optional description for the source
      required:
        - type
        - id
        - url
      description: >-
        Source account or resource for this transaction. `null` for interest
        payments and fees.
      title: TransactionFrom
    TransactionTo:
      type: object
      properties:
        type:
          type: string
          description: The type of the referenced resource
        id:
          type: string
          description: The ID of the referenced resource
        url:
          type: string
          format: uri
          description: The URL of the referenced resource
        description:
          type:
            - string
            - 'null'
          description: Optional description for the destination
      required:
        - type
        - id
        - url
      description: >-
        Destination account or resource for this transaction. `null` for
        interest payments and fees.
      title: TransactionTo
    Transaction:
      type: object
      properties:
        id:
          type: string
          description: Unique identifier for the transaction, prefixed with `txn_`.
        type:
          type: string
          enum:
            - TRANSACTION
          description: Object type. Always `TRANSACTION`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this transaction.
        created_at:
          type: string
          format: date-time
          description: Timestamp of when the transaction was created, in ISO 8601 format.
        updated_at:
          type: string
          format: date-time
          description: >-
            Timestamp of when the transaction was last updated, in ISO 8601
            format.
        archived_at:
          type:
            - string
            - 'null'
          format: date-time
        status:
          $ref: '#/components/schemas/TransactionStatus'
        transaction_type:
          $ref: '#/components/schemas/TransactionType'
        amount:
          $ref: '#/components/schemas/Amount'
        description:
          type: string
          description: Description of the transaction (max 255 characters).
        associated_payments:
          type:
            - array
            - 'null'
          items:
            $ref: '#/components/schemas/ResourceReference'
          description: >-
            Payment resources associated with this transaction. Each entry
            contains the payment's `type`, `id`, and `url`.
        from:
          oneOf:
            - $ref: '#/components/schemas/TransactionFrom'
            - type: 'null'
          description: >-
            Source account or resource for this transaction. `null` for interest
            payments and fees.
        to:
          oneOf:
            - $ref: '#/components/schemas/TransactionTo'
            - type: 'null'
          description: >-
            Destination account or resource for this transaction. `null` for
            interest payments and fees.
      required:
        - id
        - type
        - url
        - created_at
        - updated_at
        - status
        - transaction_type
        - amount
        - description
      title: Transaction
```