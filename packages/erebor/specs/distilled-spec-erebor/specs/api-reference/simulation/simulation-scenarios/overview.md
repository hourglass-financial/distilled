> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Simulation scenarios

In the sandbox environment, the **`Erebor-Simulation-Scenario`** request header lets you drive a resource to a specific outcome, so you can exercise success and failure paths.

## How it works

* Send `Erebor-Simulation-Scenario: <SCENARIO>` on the relevant create request. The value selects the outcome — see each resource page in this section for its supported values.
* The header is set per request; it does not change any stored configuration.

Honored only in the sandbox environment. In production the header is ignored.

This complements the simulation **endpoints** (e.g. simulating a received wire or ACH), which inject inbound activity rather than steering a create request.

## Supported resources

* **Onboarding** — force an onboarding to `REJECTED`, `UNDER_REVIEW`, or `APPROVED`.