> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Simulating onboarding outcomes

In the sandbox environment you can drive an Onboarding to a specific status without a real KYC/KYB review, using the **`Erebor-Simulation-Scenario`** request header on `POST /onboardings`.

| `Erebor-Simulation-Scenario` | Outcome                                                                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `ONBOARDING_REJECTED`        | The Onboarding status is set to `REJECTED`. No Customer or Deposit Account is created.                                                      |
| `ONBOARDING_UNDER_REVIEW`    | The Onboarding status is set to `UNDER_REVIEW`.                                                                                             |
| *(omitted)*                  | The Onboarding status is set to `APPROVED` (and opens the initial Deposit Account when you submitted with a `deposit_account_template_id`). |

An unrecognized value is rejected with `400`, so a mistyped scenario surfaces immediately.

```bash
curl -X POST "https://api.erebor.bank/onboardings" \
  -H "Authorization: test_key_YOUR_API_KEY_HERE" \
  -H "Erebor-Simulation-Scenario: ONBOARDING_REJECTED" \
  -H "Content-Type: application/json" \
  -d '{
    "person_applicant_id": "prsn_app_01kasd1tthf1ns1pjn1kncctwd",
    "deposit_account_template_id": "dep_acct_tmpl_01kasd1tthf1ns1pjn1kncctwd",
    "disclosures": { "disclosures_signed_externally": true }
  }'
```

This header is honored only in the sandbox environment. In production it is ignored, and Onboardings go through real KYC/KYB review.