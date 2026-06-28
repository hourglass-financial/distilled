> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Supported Events

Events follow the format `RESOURCE.ACTION` and are delivered in real-time when significant changes occur. Each event contains a `resource` field with a snapshot of the relevant object at the time of the event.

***

#### `ONBOARDING.SUBMITTED`

`resource` is an [Onboarding](/api-reference/onboarding/onboarding/the-onboarding-object). Onboarding application has been submitted for review.

#### `ONBOARDING.UNDER_REVIEW`

`resource` is an [Onboarding](/api-reference/onboarding/onboarding/the-onboarding-object). Onboarding application is being reviewed.

#### `ONBOARDING.APPROVED`

`resource` is an [Onboarding](/api-reference/onboarding/onboarding/the-onboarding-object). Onboarding application has been approved. A Customer is always created at this point. A Deposit Account is also created (and `DEPOSIT_ACCOUNT.PENDING`/`OPEN` fire) **only when** the Onboarding was submitted with `deposit_account_template_id`. Onboardings submitted with `program_id` produce only the Customer — open accounts later via [`POST /deposit_accounts`](/api-reference/accounts/deposit-accounts/create-deposit-account).

#### `ONBOARDING.REJECTED`

`resource` is an [Onboarding](/api-reference/onboarding/onboarding/the-onboarding-object). Onboarding application has been rejected.

#### `CUSTOMER.CREATED`

`resource` is a [Customer](/api-reference/customers/the-customer-object). A new customer has been created (e.g. when an onboarding is approved).

#### `DEPOSIT_ACCOUNT.CREATED`

`resource` is a [Deposit Account](/api-reference/accounts/deposit-accounts/the-deposit-account-object). The deposit account record has been created. This is the first event in the account lifecycle; the account then progresses through `DEPOSIT_ACCOUNT.PENDING` → `DEPOSIT_ACCOUNT.OPEN`.

#### `DEPOSIT_ACCOUNT.PENDING`

`resource` is a [Deposit Account](/api-reference/accounts/deposit-accounts/the-deposit-account-object). The deposit account is provisioning and pending activation. Fires on the status transition after `DEPOSIT_ACCOUNT.CREATED`.

#### `DEPOSIT_ACCOUNT.OPEN`

`resource` is a [Deposit Account](/api-reference/accounts/deposit-accounts/the-deposit-account-object). Deposit account is now open and active.

#### `DEPOSIT_ACCOUNT.CLOSED`

`resource` is a [Deposit Account](/api-reference/accounts/deposit-accounts/the-deposit-account-object). Deposit account has been closed.

#### `DEPOSIT_ACCOUNT.FROZEN`

`resource` is a [Deposit Account](/api-reference/accounts/deposit-accounts/the-deposit-account-object). Deposit account has been frozen.

#### `COUNTERPARTY.CREATED`

`resource` is a [Counterparty](/api-reference/counterparties/counterparties/the-counterparty-object). A new counterparty has been created.

#### `COUNTERPARTY.UPDATED`

`resource` is a [Counterparty](/api-reference/counterparties/counterparties/the-counterparty-object). A counterparty has been updated.

#### `COUNTERPARTY.ARCHIVED`

`resource` is a [Counterparty](/api-reference/counterparties/counterparties/the-counterparty-object). A counterparty has been archived.

#### `COUNTERPARTY_BANK_ACCOUNT.CREATED`

`resource` is a [Counterparty US Bank Account](/api-reference/counterparties/us-bank-accounts/the-counterparty-us-bank-account-object). A new counterparty bank account has been created.

#### `COUNTERPARTY_BANK_ACCOUNT.ARCHIVED`

`resource` is a [Counterparty US Bank Account](/api-reference/counterparties/us-bank-accounts/the-counterparty-us-bank-account-object). A counterparty bank account has been archived.

#### `COUNTERPARTY_BLOCKCHAIN_ADDRESS.CREATED`

`resource` is a [Counterparty Blockchain Address](/api-reference/counterparties/blockchain-addresses/the-counterparty-blockchain-address-object). A new counterparty blockchain address has been created.

#### `COUNTERPARTY_BLOCKCHAIN_ADDRESS.ATTRIBUTED.SELF_HOSTED`

`resource` is a [Counterparty Blockchain Address](/api-reference/counterparties/blockchain-addresses/the-counterparty-blockchain-address-object). Blockchain address has been attributed as self-hosted.

#### `COUNTERPARTY_BLOCKCHAIN_ADDRESS.ATTRIBUTED.CUSTODIAN`

`resource` is a [Counterparty Blockchain Address](/api-reference/counterparties/blockchain-addresses/the-counterparty-blockchain-address-object). Blockchain address has been attributed to a known custodian.

#### `COUNTERPARTY_BLOCKCHAIN_ADDRESS.ATTRIBUTED.CUSTODIAN_OTHER`

`resource` is a [Counterparty Blockchain Address](/api-reference/counterparties/blockchain-addresses/the-counterparty-blockchain-address-object). Blockchain address has been attributed to another custodian.

#### `COUNTERPARTY_BLOCKCHAIN_ADDRESS.ARCHIVED`

`resource` is a [Counterparty Blockchain Address](/api-reference/counterparties/blockchain-addresses/the-counterparty-blockchain-address-object). A counterparty blockchain address has been archived.

#### `COUNTERPARTY_INTERNATIONAL_BANK_ACCOUNT.ARCHIVED`

`resource` is a [Counterparty International Bank Account](/api-reference/counterparties/international-bank-accounts/the-counterparty-international-bank-account-object). A counterparty international bank account has been archived.

#### `COUNTERPARTY_RAIL_ADDRESS.ARCHIVED`

`resource` is a [Counterparty Rail Address](/api-reference/counterparties/rail-addresses/the-counterparty-rail-address-object). A counterparty rail address has been archived.

#### `ACH_IN.CREATED`

`resource` is an [Inbound ACH Transfer](/api-reference/payments/ach/inbound/the-inbound-ach-transfer-object). Inbound ACH transfer has been created.

#### `ACH_IN.PENDING`

`resource` is an [Inbound ACH Transfer](/api-reference/payments/ach/inbound/the-inbound-ach-transfer-object). Inbound ACH transfer is pending.

#### `ACH_IN.SETTLED`

`resource` is an [Inbound ACH Transfer](/api-reference/payments/ach/inbound/the-inbound-ach-transfer-object). Inbound ACH transfer has settled.

#### `ACH_IN.FAILED`

`resource` is an [Inbound ACH Transfer](/api-reference/payments/ach/inbound/the-inbound-ach-transfer-object). Inbound ACH transfer has failed.

#### `ACH_IN.RETURNED`

`resource` is an [Inbound ACH Transfer](/api-reference/payments/ach/inbound/the-inbound-ach-transfer-object). Inbound ACH transfer has been returned.

#### `ACH_OUT.CREATED`

`resource` is an [Outbound ACH Transfer](/api-reference/payments/ach/outbound/the-outbound-ach-transfer-object). Outbound ACH transfer has been created.

#### `ACH_OUT.PENDING`

`resource` is an [Outbound ACH Transfer](/api-reference/payments/ach/outbound/the-outbound-ach-transfer-object). Outbound ACH transfer is pending.

#### `ACH_OUT.SETTLED`

`resource` is an [Outbound ACH Transfer](/api-reference/payments/ach/outbound/the-outbound-ach-transfer-object). Outbound ACH transfer has settled.

#### `ACH_OUT.FAILED`

`resource` is an [Outbound ACH Transfer](/api-reference/payments/ach/outbound/the-outbound-ach-transfer-object). Outbound ACH transfer has failed.

#### `ACH_OUT.RETURNED`

`resource` is an [Outbound ACH Transfer](/api-reference/payments/ach/outbound/the-outbound-ach-transfer-object). Outbound ACH transfer has been returned.

#### `WIRE_IN.CREATED`

`resource` is an [Inbound Wire Transfer](/api-reference/payments/wire/inbound/the-inbound-wire-transfer-object). Inbound wire transfer has been created.

#### `WIRE_IN.PENDING`

`resource` is an [Inbound Wire Transfer](/api-reference/payments/wire/inbound/the-inbound-wire-transfer-object). Inbound wire transfer is pending.

#### `WIRE_IN.SETTLED`

`resource` is an [Inbound Wire Transfer](/api-reference/payments/wire/inbound/the-inbound-wire-transfer-object). Inbound wire transfer has settled.

#### `WIRE_IN.FAILED`

`resource` is an [Inbound Wire Transfer](/api-reference/payments/wire/inbound/the-inbound-wire-transfer-object). Inbound wire transfer has failed.

#### `WIRE_IN.RETURNED`

`resource` is an [Inbound Wire Transfer](/api-reference/payments/wire/inbound/the-inbound-wire-transfer-object). Inbound wire transfer has been returned.

#### `WIRE_IN.RESOLVING_FROM_SUSPENSE`

`resource` is an [Inbound Wire Transfer](/api-reference/payments/wire/inbound/the-inbound-wire-transfer-object). Inbound wire transfer was previously held in suspense (unroutable on initial receipt) and is being resolved to the customer account.

#### `WIRE_OUT.CREATED`

`resource` is an [Outbound Wire Transfer](/api-reference/payments/wire/outbound/the-outbound-wire-transfer-object). Outbound wire transfer has been created.

#### `WIRE_OUT.PENDING`

`resource` is an [Outbound Wire Transfer](/api-reference/payments/wire/outbound/the-outbound-wire-transfer-object). Outbound wire transfer is pending.

#### `WIRE_OUT.SETTLED`

`resource` is an [Outbound Wire Transfer](/api-reference/payments/wire/outbound/the-outbound-wire-transfer-object). Outbound wire transfer has settled.

#### `WIRE_OUT.FAILED`

`resource` is an [Outbound Wire Transfer](/api-reference/payments/wire/outbound/the-outbound-wire-transfer-object). Outbound wire transfer has failed.

#### `WIRE_OUT.RETURNED`

`resource` is an [Outbound Wire Transfer](/api-reference/payments/wire/outbound/the-outbound-wire-transfer-object). Outbound wire transfer has been returned.

#### `BLOCKCHAIN_IN.CREATED`

`resource` is an [Inbound Blockchain Transfer](/api-reference/payments/blockchain/inbound/the-inbound-blockchain-transfer-object). Inbound blockchain transfer has been created.

#### `BLOCKCHAIN_IN.NEEDS_ATTRIBUTION`

`resource` is an [Inbound Blockchain Transfer](/api-reference/payments/blockchain/inbound/the-inbound-blockchain-transfer-object). Inbound blockchain transfer is awaiting attribution — the originating address must be identified before it can proceed.

#### `BLOCKCHAIN_IN.PENDING`

`resource` is an [Inbound Blockchain Transfer](/api-reference/payments/blockchain/inbound/the-inbound-blockchain-transfer-object). Inbound blockchain transfer is pending.

#### `BLOCKCHAIN_IN.SETTLED`

`resource` is an [Inbound Blockchain Transfer](/api-reference/payments/blockchain/inbound/the-inbound-blockchain-transfer-object). Inbound blockchain transfer has settled.

#### `BLOCKCHAIN_IN.FAILED`

`resource` is an [Inbound Blockchain Transfer](/api-reference/payments/blockchain/inbound/the-inbound-blockchain-transfer-object). Inbound blockchain transfer has failed.

#### `BLOCKCHAIN_OUT.CREATED`

`resource` is an [Outbound Blockchain Transfer](/api-reference/payments/blockchain/outbound/the-outbound-blockchain-transfer-object). Outbound blockchain transfer has been created.

#### `BLOCKCHAIN_OUT.PENDING`

`resource` is an [Outbound Blockchain Transfer](/api-reference/payments/blockchain/outbound/the-outbound-blockchain-transfer-object). Outbound blockchain transfer is pending.

#### `BLOCKCHAIN_OUT.SETTLED`

`resource` is an [Outbound Blockchain Transfer](/api-reference/payments/blockchain/outbound/the-outbound-blockchain-transfer-object). Outbound blockchain transfer has settled.

#### `BLOCKCHAIN_OUT.FAILED`

`resource` is an [Outbound Blockchain Transfer](/api-reference/payments/blockchain/outbound/the-outbound-blockchain-transfer-object). Outbound blockchain transfer has failed.

#### `BOOK_TRANSFER.CREATED`

`resource` is a [Book Transfer](/api-reference/payments/book-transfers/the-book-transfer-object). Book transfer has been created.

#### `BOOK_TRANSFER.PENDING`

`resource` is a [Book Transfer](/api-reference/payments/book-transfers/the-book-transfer-object). Book transfer is pending.

#### `BOOK_TRANSFER.SETTLED`

`resource` is a [Book Transfer](/api-reference/payments/book-transfers/the-book-transfer-object). Book transfer has settled.

#### `BOOK_TRANSFER.FAILED`

`resource` is a [Book Transfer](/api-reference/payments/book-transfers/the-book-transfer-object). Book transfer has failed.

#### `RAIL_IN.CREATED`

`resource` is an [Inbound Rail Transfer](/api-reference/payments/rail/inbound/the-inbound-rail-transfer-object). Inbound rail transfer has been created.

#### `RAIL_IN.PENDING`

`resource` is an [Inbound Rail Transfer](/api-reference/payments/rail/inbound/the-inbound-rail-transfer-object). Inbound rail transfer is pending.

#### `RAIL_IN.SETTLED`

`resource` is an [Inbound Rail Transfer](/api-reference/payments/rail/inbound/the-inbound-rail-transfer-object). Inbound rail transfer has settled.

#### `RAIL_IN.FAILED`

`resource` is an [Inbound Rail Transfer](/api-reference/payments/rail/inbound/the-inbound-rail-transfer-object). Inbound rail transfer has failed.

#### `RAIL_OUT.CREATED`

`resource` is an [Outbound Rail Transfer](/api-reference/payments/rail/outbound/the-outbound-rail-transfer-object). Outbound rail transfer has been created.

#### `RAIL_OUT.PENDING`

`resource` is an [Outbound Rail Transfer](/api-reference/payments/rail/outbound/the-outbound-rail-transfer-object). Outbound rail transfer is pending.

#### `RAIL_OUT.SETTLED`

`resource` is an [Outbound Rail Transfer](/api-reference/payments/rail/outbound/the-outbound-rail-transfer-object). Outbound rail transfer has settled.

#### `RAIL_OUT.FAILED`

`resource` is an [Outbound Rail Transfer](/api-reference/payments/rail/outbound/the-outbound-rail-transfer-object). Outbound rail transfer has failed.

#### `INTERNATIONAL_WIRE_IN.PENDING`

`resource` is an [Inbound International Wire](/api-reference/payments/international-wire/inbound/the-inbound-international-wire-object). Inbound international wire is pending.

#### `INTERNATIONAL_WIRE_IN.SETTLED`

`resource` is an [Inbound International Wire](/api-reference/payments/international-wire/inbound/the-inbound-international-wire-object). Inbound international wire has settled.

#### `INTERNATIONAL_WIRE_IN.FAILED`

`resource` is an [Inbound International Wire](/api-reference/payments/international-wire/inbound/the-inbound-international-wire-object). Inbound international wire has failed.

#### `INTERNATIONAL_WIRE_IN.RETURNED`

`resource` is an [Inbound International Wire](/api-reference/payments/international-wire/inbound/the-inbound-international-wire-object). Inbound international wire has been returned.

#### `INTERNATIONAL_WIRE_OUT.CREATED`

`resource` is an [Outbound International Wire](/api-reference/payments/international-wire/outbound/the-outbound-international-wire-object). Outbound international wire has been created.

#### `INTERNATIONAL_WIRE_OUT.PENDING`

`resource` is an [Outbound International Wire](/api-reference/payments/international-wire/outbound/the-outbound-international-wire-object). Outbound international wire is pending.

#### `INTERNATIONAL_WIRE_OUT.SETTLED`

`resource` is an [Outbound International Wire](/api-reference/payments/international-wire/outbound/the-outbound-international-wire-object). Outbound international wire has settled.

#### `INTERNATIONAL_WIRE_OUT.FAILED`

`resource` is an [Outbound International Wire](/api-reference/payments/international-wire/outbound/the-outbound-international-wire-object). Outbound international wire has failed.

#### `INTERNATIONAL_WIRE_OUT.RETURNED`

`resource` is an [Outbound International Wire](/api-reference/payments/international-wire/outbound/the-outbound-international-wire-object). Outbound international wire has been returned.

#### `TRANSACTION.CREATED`

`resource` is a [Transaction](/api-reference/transactions/the-transaction-object). Transaction has been created.

#### `TRANSACTION.PENDING`

`resource` is a [Transaction](/api-reference/transactions/the-transaction-object). Transaction is pending processing.

#### `TRANSACTION.POSTED`

`resource` is a [Transaction](/api-reference/transactions/the-transaction-object). Transaction has posted to the account.

#### `TRANSACTION.SETTLED`

`resource` is a [Transaction](/api-reference/transactions/the-transaction-object). Transaction has settled to the ledger.

#### `TRANSACTION.FAILED`

`resource` is a [Transaction](/api-reference/transactions/the-transaction-object). Transaction has failed to process.

#### `TRANSACTION.REVERSED`

`resource` is a [Transaction](/api-reference/transactions/the-transaction-object). Transaction has been reversed or refunded.