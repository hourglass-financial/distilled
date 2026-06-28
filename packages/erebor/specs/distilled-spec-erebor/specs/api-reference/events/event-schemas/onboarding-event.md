> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Onboarding Event

POST 

Fired when an onboarding application changes status.

**Event types:**
- `ONBOARDING.SUBMITTED` — Application submitted for review
- `ONBOARDING.UNDER_REVIEW` — Application is being reviewed
- `ONBOARDING.APPROVED` — Application has been approved
- `ONBOARDING.REJECTED` — Application has been rejected


Reference: https://docs.erebor.bank/api-reference/events/event-schemas/onboarding-event

## OpenAPI 3.1 Webhook Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths: {}
webhooks:
  onboarding-event:
    post:
      operationId: onboarding-event
      summary: Onboarding Event
      description: |
        Fired when an onboarding application changes status.

        **Event types:**
        - `ONBOARDING.SUBMITTED` — Application submitted for review
        - `ONBOARDING.UNDER_REVIEW` — Application is being reviewed
        - `ONBOARDING.APPROVED` — Application has been approved
        - `ONBOARDING.REJECTED` — Application has been rejected
      responses:
        '200':
          description: Webhook received successfully
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/OnboardingEvent'
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
    OnboardingEventEventType:
      type: string
      enum:
        - ONBOARDING.SUBMITTED
        - ONBOARDING.UNDER_REVIEW
        - ONBOARDING.APPROVED
        - ONBOARDING.REJECTED
      description: The specific onboarding event action
      title: OnboardingEventEventType
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
    OnboardingEvent:
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
          $ref: '#/components/schemas/OnboardingEventEventType'
          description: The specific onboarding event action
        resource:
          $ref: '#/components/schemas/Onboarding'
          description: Snapshot of the onboarding at the time of the event
      required:
        - id
        - type
        - url
        - created_at
        - updated_at
        - api_version
        - event_type
        - resource
      title: OnboardingEvent

```