> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# NetSuite Bank Feed Connection

> Guide to setting up a NetSuite bank feed connection so you can sync your Erebor deposit accounts with NetSuite for automatic transaction import.

NetSuite bank feed connections are currently rolling out. Contact your relationship manager for access.

## Overview

NetSuite bank feeds let you link your Erebor deposit accounts directly to NetSuite. Once connected, transactions automatically sync from Erebor into NetSuite — eliminating manual data entry and reducing reconciliation errors.

The setup starts in Erebor, takes you into NetSuite to install a bundle and configure features, then brings you back to Erebor to map your accounts.

## Prerequisites

Before connecting a NetSuite bank feed, make sure you've prepared the following:

* You have an open and active Erebor deposit account
* You're an Admin or Operator of your Erebor account
* You have a NetSuite account with administrator permissions

## How it works

### 1. Navigate to the Integrations page

Go to **Settings > Integrations** in your Erebor dashboard.

You can also navigate directly to `https://erebor.bank/account/{customer_id}/settings/integrations`

### 2. Find the NetSuite integration and click **Connect**

<img src="https://files.buildwithfern.com/erebor.docs.buildwithfern.com/84b33fabe6265a230b8eeed21daaf1151760d72991e05cb5fa2f4b55a8a1e352/docs/assets/netsuite-integrations.png" alt="Navigate to Connect" />

### 3. Redirect to NetSuite

Clicking **Connect** redirects you to your NetSuite instance. Log in if you aren't already.

### 4. Install the AccountLink bundle

<img src="https://files.buildwithfern.com/erebor.docs.buildwithfern.com/809f4d1b416d8ef84e9628b0d1b9d2979d2dfad37869db8ac21d7779653f1eb7/docs/assets/netsuite-link-1.png" alt="Install Bundle" />

Navigate to the AccountLink bundle details page in NetSuite and click **Install**. If you see conflicts during installation, select **Add and Rename** to resolve them safely.

The integration uses the permissions of the user who installs the bundle. We recommend installing with an admin-level role to ensure full functionality.

### 5. Enable SuiteCloud features

<img src="https://files.buildwithfern.com/erebor.docs.buildwithfern.com/47dc5af8b53f7d863e85e22c9d8786c77c30e1de5f24326da69b6e4b956fefcc/docs/assets/netsuite-link-2.png" alt="Enable Features" />

Go to **Setup > Company > Enable Features > SuiteCloud** and enable the following:

* **SuiteBuilder**: CUSTOM RECORDS
* **SuiteScript**: CLIENT SUITESCRIPT and SERVER SUITESCRIPT
* **SuiteTalk (Web Services)**: REST WEB SERVICES
* **Manage Authentication**: TOKEN-BASED AUTHENTICATION

Click **Next**.

### 6. Verify the installation

Confirm the setup is complete:

* The AccountLink bundle shows a green checkmark on the **Installed Bundles** page
* All required SuiteCloud features are enabled

### 7. Authorize the connection

Once your NetSuite instance is configured, authorize Erebor to access your account. You'll be redirected back to Erebor.

### 8. Map your accounts

After authorization, you're taken to the NetSuite account mapping page in Erebor. Map each Erebor deposit account to the appropriate NetSuite GL account and save.

Each Erebor account must be mapped to a distinct GL account (1:1 mapping)

<img src="https://files.buildwithfern.com/erebor.docs.buildwithfern.com/25e995c55ef0a6c16eacc4b02696494998015715e25d6012a9cff40b3a7e2a59/docs/assets/netsuite-map-1.png" alt="Map Accounts" />

### 9. Create a new GL account (optional)

If you would like to create a new Netsuite GL account to map your Erebor account to, scroll to the bottom of the GL accounts list and select **+ Add account**.

<img src="https://files.buildwithfern.com/erebor.docs.buildwithfern.com/188dbe31e9fdade99a3611cae19e255b2e3bb6766a70601907cd687106bb9646/docs/assets/netsuite-add-1.png" alt="Add GL Account" />

### 10. Select sync timeframe and submit

Once all desired accounts are mapped, either use a preset timeframe or specify an arbitrary date to sync transactions for.

<img src="https://files.buildwithfern.com/erebor.docs.buildwithfern.com/551329337c13db5bcb71ed7f9d5e8db92e35c2e851cdeb4e3404fb3eba44b99e/docs/assets/netsuite-map-2.png" alt="Sync Timeframe" />

## Transaction syncing

Once connected and mapped, Erebor automatically delivers settled transactions to NetSuite. Pending transactions are not synced.

NetSuite runs an automatic sync for the latest transactions every 24 hours for each active bank feed account. To trigger a manual sync, go to the **Match Bank Data** tab in NetSuite and click **Update Imported Bank Data**.

Manual syncs can only be triggered once per hour per GL account.

### Viewing synced transactions

Synced transactions appear in the **Match Bank Data** tab in the NetSuite UI. Select the appropriate GL account from the dropdown to view its imported transactions. Finance teams typically use this tab for reconciliation.

## Linking new accounts

When you open a new Erebor deposit account after your initial bank feed setup, it isn't automatically linked to NetSuite. To add it:

1. Navigate to your Integrations page at `https://erebor.bank/account/{customer_id}/settings/integrations`
2. Find the NetSuite integration and click **Manage > Edit mapping**
3. You'll see all your Erebor deposit accounts — already-mapped accounts are grayed out
4. Select your new account, map it to the appropriate NetSuite GL account, and save

## Disconnecting individual accounts

If you want to stop syncing an individual accounts, you must deactivate the Format Profile in Netsuite AND disconnect the Erebor mapping.

### 1. Disconnect in Erebor

Navigate to your Integrations page at `https://erebor.bank/account/{customer_id}/settings/integrations`, then click **Manage > Edit mapping**. Select the disconnect icon.

<img src="https://files.buildwithfern.com/erebor.docs.buildwithfern.com/872019383aa816445aaab78e075c9322ee731f04f2fd219f45e1577699bbecab/docs/assets/netsuite-disconnect-1.png" alt="Edit Timeframe" />

Then, confirm the disconnection.

<img src="https://files.buildwithfern.com/erebor.docs.buildwithfern.com/26029f378ae4332cd6ec37821618c16ad2ea484f0273314fd86b9f03bd8222b3/docs/assets/netsuite-disconnect-2.png" alt="Sync Timeframe" />

### 2. Deactivate Format Profile in NetSuite

Navigate to **Financial Institutions > Format Profiles** in NetSuite. Select the Erebor format profile, set it to **Inactive**, and save. This frees up the account names for reuse if you reconnect later.

Don't skip this step. Active bank feed accounts in NetSuite must have unique names. If you delete the Erebor connection without deactivating first, you won't be able to reconnect without manually resolving naming conflicts.

## Full disconnection

If you need to disconnect your NetSuite bank feed, you must deactivate the accounts in NetSuite before removing the connection in Erebor. Skipping the NetSuite step can cause errors on reconnection.

### 1. Deactivate Format Profile and Financial Institution in NetSuite

Navigate to **Financial Institutions > Format Profiles** in NetSuite. Select the Erebor format profile, set it to **Inactive**, and save. This frees up the account names for reuse if you reconnect later.

Don't skip this step. Active bank feed accounts in NetSuite must have unique names. If you delete the Erebor connection without deactivating first, you won't be able to reconnect without manually resolving naming conflicts.

Navigate to **Financial Institutions** in NetSuite. Select the Erebor Financial Institution, set it to **Inactive**, and save.

### 2. Remove the connection in Erebor

Navigate to your Erebor Integrations page and disconnect the NetSuite integration.

### Reconnecting after a disconnection

To reconnect after a disconnection:

1. Confirm the previous Format Profile is set to **Inactive** in NetSuite
2. Start a new connection from the Erebor dashboard (follow the steps in [Connecting to Erebor](#connecting-to-erebor))
3. Remap your accounts — previous mappings are not preserved

After reconnecting, your previously synced accounts won't carry over automatically. You'll need to remap each Erebor account to the appropriate NetSuite GL account.

## Troubleshooting

### Transactions not appearing in NetSuite

1. Verify your deposit account has an **ACTIVE** status in Erebor
2. Check that transactions have reached **SETTLED** status — pending transactions are not delivered
3. Confirm your account mapping is correct on the Erebor Integrations page
4. Verify the Format Profile in NetSuite is active and correctly configured

### Revoking NetSuite access

To revoke Erebor's access to your NetSuite instance, delete the access token created during the connection flow. See [Managing Access Tokens](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/bridgehead_4249078810.html) in the NetSuite documentation and delete the connection on the Integrations page **Manage > Disconnect**

### "This user has exceeded the number of active access tokens" error

NetSuite limits the number of active access tokens per user. If you hit this limit during connection, delete unused access tokens from the NetSuite UI and retry.

### Duplicate transactions

Erebor uses idempotent transaction IDs when delivering to NetSuite. If duplicates appear, check whether you also have a manual bank import configured for the same account.