> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Intuit Bank Feed Connection

> Guide to setting up an Intuit bank feed connection so you can sync your Erebor deposit accounts with QuickBooks for automatic transaction import.

## Overview

Intuit bank feeds allow you to link your Erebor deposit accounts directly to QuickBooks. Once connected, transactions automatically sync from Erebor into your QuickBooks account — eliminating manual data entry and reducing reconciliation errors.

You initiate the connection from the Erebor dashboard, which redirects you into QuickBooks to complete the linking process.

## Prerequisites

Before connecting an Intuit bank feed, make sure you've prepared the following:

* You have an open and active Erebor deposit account
* You're an Admin or Operator of your Erebor account
* You have a QuickBooks Online/Desktop account

## How it works

### 1. Navigate to the User Settings page

<img src="https://files.buildwithfern.com/erebor.docs.buildwithfern.com/3cb71e3f1cda98c431461480709e9454d63d74e3b833011a2749a01114fc6681/docs/assets/intuit-settings.png" alt="Navigate to Settings" />

You can also navigate directly to `https://erebor.bank/account/{customer_id}/settings/integrations`

### 2. Navigate to the Integrations section

<img src="https://files.buildwithfern.com/erebor.docs.buildwithfern.com/2c2a1bc91488a1a65d77b880df7bbaaabc8e9975b596ce57367ba02830e0f1b2/docs/assets/intuit-integrations.png" alt="Navigate to Integrations" />

### 3. Find the QuickBooks integration and click **Connect**.

<img src="https://files.buildwithfern.com/erebor.docs.buildwithfern.com/68df01bdcb8508c8e8dd7bdcdb44e158a37ccb2d3f8635511f852554fa972b9a/docs/assets/intuit-connect.png" alt="Navigate to Connect" />

### 4. Redirect to QuickBooks

Clicking **Connect** redirects you to your QuickBooks instance. If you aren't already logged into QuickBooks, you'll be prompted to sign in.

### 5. Search for Erebor

QuickBooks displays a list of supported financial institutions. Search for **Erebor** to find and select the Erebor integration.

### 6. Log into your Erebor account

You will be redirected back to the Erebor login page. Enter your login credentials including your MFA token to authenticate to your Erebor account.

### 7. Account sharing consent

After logging in, you will be presented with a consent screen to share your Erebor account data with Intuit. Review the permissions and click **Continue** to authorize the connection.

### 8. Account selection

View your connected Erebor deposit accounts and select which accounts to link to QuickBooks GL accounts. Each Erebor account will display its nickname and current balance.

You can connect multiple deposit accounts to a single QuickBooks organization. Each account will appear as a separate bank feed in QuickBooks.

### 9. Historical transaction import

Select a time range for historical transaction import, up to a maximum of 2 years. This allows you to backfill transaction history when first setting up the connection.

### 10. Connect and sync

Click **Connect** to securely link your selected accounts and begin syncing data. Settled transactions will start flowing from Erebor into QuickBooks in near real-time.

## Transaction Syncing

Once connected, Erebor automatically delivers settled transactions to QuickBooks. Transactions that are pending and not yet settled will not be synced. QuickBooks then loads new transactions once a day by default, or, you can initiate an ad-hoc load by updating your accounts in the QuickBooks UI.

## Linking new accounts

When you open a new Erebor deposit account after your initial bank feed setup, the new account is not automatically linked to QuickBooks. To add it:

1. Navigate to your QuickBooks [linking page](https://qbo.intuit.com/app/bankconnect?launchPoint=dtx\&origin=addaccount) and connect your Erebor account
2. Complete the QuickBooks authorization flow
3. On the account selection screen, you'll see your new account alongside any previously linked accounts
4. Select the new account and map it to the appropriate QuickBooks GL account
5. Click **Connect** to begin syncing transactions for the new account

Previously linked accounts are not affected by the reconnection flow. You only need to select and map your new account.

## Troubleshooting

### Transactions not appearing in QuickBooks

1. Verify your deposit account has an **ACTIVE** status
2. Check that transactions have reached **SETTLED** status — pending transactions are not delivered
3. Ensure you selected the correct account during the connection flow
4. Try updating your transactions and accounts via the QuickBooks UI

### Duplicate transactions

Erebor uses idempotent transaction IDs when delivering to Intuit. If duplicates appear in QuickBooks, check whether you have also set up a manual bank connection importing the same account.