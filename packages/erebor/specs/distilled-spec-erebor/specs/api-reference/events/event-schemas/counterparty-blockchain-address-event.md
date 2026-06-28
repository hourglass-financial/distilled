> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Counterparty Blockchain Address Event

POST 

Fired when a counterparty blockchain address is created or attributed.

**Event types:**
- `COUNTERPARTY_BLOCKCHAIN_ADDRESS.CREATED` — A new counterparty blockchain address has been created
- `COUNTERPARTY_BLOCKCHAIN_ADDRESS.ATTRIBUTED.SELF_HOSTED` — Address attributed as self-hosted
- `COUNTERPARTY_BLOCKCHAIN_ADDRESS.ATTRIBUTED.CUSTODIAN` — Address attributed to a known custodian
- `COUNTERPARTY_BLOCKCHAIN_ADDRESS.ATTRIBUTED.CUSTODIAN_OTHER` — Address attributed to another custodian


Reference: https://docs.erebor.bank/api-reference/events/event-schemas/counterparty-blockchain-address-event

## OpenAPI 3.1 Webhook Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths: {}
webhooks:
  counterparty-blockchain-address-event:
    post:
      operationId: counterparty-blockchain-address-event
      summary: Counterparty Blockchain Address Event
      description: >
        Fired when a counterparty blockchain address is created or attributed.


        **Event types:**

        - `COUNTERPARTY_BLOCKCHAIN_ADDRESS.CREATED` — A new counterparty
        blockchain address has been created

        - `COUNTERPARTY_BLOCKCHAIN_ADDRESS.ATTRIBUTED.SELF_HOSTED` — Address
        attributed as self-hosted

        - `COUNTERPARTY_BLOCKCHAIN_ADDRESS.ATTRIBUTED.CUSTODIAN` — Address
        attributed to a known custodian

        - `COUNTERPARTY_BLOCKCHAIN_ADDRESS.ATTRIBUTED.CUSTODIAN_OTHER` — Address
        attributed to another custodian
      responses:
        '200':
          description: Webhook received successfully
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CounterpartyBlockchainAddressEvent'
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
    CounterpartyBlockchainAddressEventEventType:
      type: string
      enum:
        - COUNTERPARTY_BLOCKCHAIN_ADDRESS.CREATED
        - COUNTERPARTY_BLOCKCHAIN_ADDRESS.ATTRIBUTED.SELF_HOSTED
        - COUNTERPARTY_BLOCKCHAIN_ADDRESS.ATTRIBUTED.CUSTODIAN
        - COUNTERPARTY_BLOCKCHAIN_ADDRESS.ATTRIBUTED.CUSTODIAN_OTHER
      description: The specific counterparty blockchain address event action
      title: CounterpartyBlockchainAddressEventEventType
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
    Custodian:
      type: string
      enum:
        - ANCHORAGE_SG
        - ANCHORAGE_US
        - AQUANOW_CA
        - B2C2_UK
        - B2C2_US
        - BITGO_SG
        - BITGO_US
        - BITSTAMP_US
        - BVNK_US
        - CIRCLE_FR
        - CIRCLE_US
        - CITIBANK_US
        - COINBASE_US
        - COINSMART_CA
        - COPPER_CH
        - COPPER_UK
        - CUMBERLAND_DRW_LLC_US
        - CUMBERLAND_SG
        - EREBOR_BANK_US
        - FALCONX_US
        - FIDELITY_UK
        - FIDELITY_US
        - FIREBLOCKS_APAC
        - FIREBLOCKS_US
        - GALAXY_KY
        - GEMINI_US
        - KRAKEN_BVI
        - KRAKEN_EU_IE
        - KRAKEN_UK
        - KRAKEN_US
        - NUBANK_BR
        - PAXOS_US
        - RAMP_NETWORK_US
        - ROBINHOOD_US
        - WINTERMUTE_GB
        - SELF_HOSTED
        - OTHER
      description: >-
        Supported VASPs (Virtual Asset Service Providers) and custodians for
        blockchain addresses. Use SELF_HOSTED if the address is self-custodied,
        or OTHER if the custodian is not in this list.
      title: Custodian
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
    CounterpartyBlockchainAddress:
      type: object
      properties:
        id:
          type: string
          description: >-
            Unique identifier for the counterparty blockchain address, prefixed
            with `cp_bc_addr_`.
        type:
          type: string
          enum:
            - COUNTERPARTY_BLOCKCHAIN_ADDRESS
          description: Object type. Always `COUNTERPARTY_BLOCKCHAIN_ADDRESS`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this counterparty blockchain address.
        created_at:
          type: string
          format: date-time
          description: Timestamp of when the address was created, in ISO 8601 format.
        updated_at:
          type: string
          format: date-time
          description: Timestamp of when the address was last updated, in ISO 8601 format.
        archived_at:
          type:
            - string
            - 'null'
          format: date-time
        customer_id:
          type:
            - string
            - 'null'
          description: ID of the customer this address belongs to, prefixed with `cust_`.
        program_id:
          type:
            - string
            - 'null'
          description: ID of the program this address belongs to, prefixed with `prgrm_`.
        counterparty_id:
          type:
            - string
            - 'null'
          description: >-
            ID of the counterparty this blockchain address is linked to,
            prefixed with `cp_`.
        description:
          type: string
          description: >-
            User-friendly description for this blockchain address (max 100
            characters).
        address:
          type: string
          description: Blockchain wallet address
        network:
          $ref: '#/components/schemas/BlockchainNetwork'
          description: Blockchain network for this address
        custodian:
          $ref: '#/components/schemas/Custodian'
          description: >-
            Custodian holding this blockchain address. Use `SELF_HOSTED` if
            self-custodied, or `OTHER` if the custodian isn't in the supported
            list.
        custodian_other:
          type:
            - string
            - 'null'
          description: Name of the custodian. Required when `custodian` is `OTHER`.
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
        - description
        - address
        - network
        - custodian
      title: CounterpartyBlockchainAddress
    CounterpartyBlockchainAddressEvent:
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
          $ref: '#/components/schemas/CounterpartyBlockchainAddressEventEventType'
          description: The specific counterparty blockchain address event action
        resource:
          $ref: '#/components/schemas/CounterpartyBlockchainAddress'
          description: >-
            Snapshot of the counterparty blockchain address at the time of the
            event
      required:
        - id
        - type
        - url
        - created_at
        - updated_at
        - api_version
        - event_type
        - resource
      title: CounterpartyBlockchainAddressEvent

```