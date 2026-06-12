> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Paying other Erebor accounts

When both the sender and recipient are on Erebor, you have two options for moving funds: book transfers and rail transfers. Both settle instantly. The right choice depends on whether the accounts belong to the same customer.

## Book transfers

Use a [book transfer](/payments/book-transfers) when both accounts belong to the same customer. This is the simplest path — you specify `from_deposit_account_id` and `to_deposit_account_id` and the funds move immediately.

Best for:

* Moving funds between a customer's own accounts
* Sweeping balances within a single customer

## Rail transfers

Use a [rail transfer](/payments/rail-transfers) when the source and destination accounts belong to different customers. You can address the destination by [account ID](/payments/rail-transfers#sending-to-an-account-you-manage) (for accounts in programs you manage) or by [rail address](/payments/rail-transfers#sending-to-a-counterparty-rail-address) (for settling with other entities on Erebor).

Best for:

* Moving funds between your operating account and program customer accounts
* Moving funds between different customers in your program
* Settling with another company on Erebor

## Which should I use?

| Scenario                                                           | Use                                                                              |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Transferring between a customer's own accounts                     | [Book transfer](/payments/book-transfers)                                        |
| Sweeping balances within a single customer                         | [Book transfer](/payments/book-transfers)                                        |
| Moving funds to or from your operating account to program accounts | [Rail transfer](/payments/rail-transfers#sending-to-an-account-you-manage)       |
| Moving funds between different customers in your program           | [Rail transfer](/payments/rail-transfers#sending-to-an-account-you-manage)       |
| Settling with another company on Erebor                            | [Rail transfer](/payments/rail-transfers#sending-to-a-counterparty-rail-address) |