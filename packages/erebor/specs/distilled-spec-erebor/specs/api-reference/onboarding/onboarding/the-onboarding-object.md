> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# The Onboarding Object

An onboarding ties an applicant to a deposit account template and tracks the review process. When approved, Erebor automatically creates a [Customer](/api-reference/customers/list-customers) and a [Deposit Account](/api-reference/accounts/deposit-accounts/list-deposit-accounts).

```json title="The Onboarding Object"
{
  "id": "onb_01kasd1tthf1ns1pjn1kncctwd",
  "type": "ONBOARDING",
  "url": "https://api.erebor.bank/onboardings/onb_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T09:30:00Z",
  "updated_at": "2025-01-15T10:15:00Z",
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "status": "APPROVED",
  "applicant_type": "BUSINESS",
  "person_applicant_id": null,
  "business_applicant_id": "biz_app_01kasd1tthf1ns1pjn1kncctwd",
  "deposit_account_template_id": "dep_acct_tmpl_01kasd1tthf1ns1pjn1kncctwd",
  "disclosures": {
    "disclosures_signed_externally": true
  },
  "customer_id": "cust_01kasd1tthf1ns1pjn1kncctwd",
  "deposit_account_id": "dep_acct_01kasd1tthf1ns1pjn1kncctwd",
  "custom_ref": "ONB-2025-7821",
  "custom_fields": {
    "sales_rep": "j.smith",
    "internal_id": "ONB-2025-7821"
  }
}
```

## Attributes

### Schema (`Onboarding`)

```yaml
components:
  schemas:
    OnboardingStatus:
      type: string
      enum:
        - SUBMITTED
        - UNDER_REVIEW
        - APPROVED
        - REJECTED
      description: Current status of the onboarding.
      title: OnboardingStatus
    OnboardingApplicantType:
      type: string
      enum:
        - PERSON
        - BUSINESS
      description: Indicates whether the onboarding is for a person or business applicant.
      title: OnboardingApplicantType
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
    Onboarding:
      type: object
      properties:
        id:
          type: string
          description: Unique identifier for the onboarding, prefixed with `onb_`.
        type:
          type: string
          enum:
            - ONBOARDING
          description: Object type. Always `ONBOARDING`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this onboarding.
        created_at:
          type: string
          format: date-time
          description: Timestamp of when the onboarding was created, in ISO 8601 format.
        updated_at:
          type: string
          format: date-time
          description: >-
            Timestamp of when the onboarding was last updated, in ISO 8601
            format.
        archived_at:
          type:
            - string
            - 'null'
          format: date-time
        program_id:
          type: string
          description: >-
            Unique identifier of the program this onboarding belongs to,
            prefixed with `prgrm_`. Always set: echoed from the request when the
            Onboarding was created with `program_id`, or derived from the
            template's program when it was created with
            `deposit_account_template_id`.
        status:
          $ref: '#/components/schemas/OnboardingStatus'
          description: Current status of the onboarding.
        applicant_type:
          $ref: '#/components/schemas/OnboardingApplicantType'
          description: >-
            Indicates whether the onboarding is for a person or business
            applicant.
        person_applicant_id:
          type:
            - string
            - 'null'
          description: >-
            ID of the person applicant, prefixed with `prsn_app_`. Set when
            `applicant_type` is `PERSON`.
        business_applicant_id:
          type:
            - string
            - 'null'
          description: >-
            ID of the business applicant, prefixed with `biz_app_`. Set when
            `applicant_type` is `BUSINESS`.
        deposit_account_template_id:
          type:
            - string
            - 'null'
          description: >-
            ID of the deposit account template used to open the initial deposit
            account on approval, prefixed with `dep_acct_tmpl_`. `null` when the
            onboarding was created with `program_id` instead — in that case no
            initial account is opened and accounts must be opened later via
            `POST /deposit_accounts`.
        disclosures:
          $ref: '#/components/schemas/Disclosures'
        customer_id:
          type:
            - string
            - 'null'
          description: >-
            ID of the customer created on approval, prefixed with `cust_`.
            `null` until the onboarding is approved.
        deposit_account_id:
          type:
            - string
            - 'null'
          description: >-
            ID of the deposit account created on approval, prefixed with
            `dep_acct_`. `null` until the onboarding is approved.
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
        - program_id
        - status
        - applicant_type
        - disclosures
      title: Onboarding
```