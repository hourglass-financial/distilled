> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# The Deposit Account Template Object

A deposit account template defines the type and interest rate configuration for deposit accounts. Templates are configured by the Erebor team and referenced when creating onboardings. You can list your available templates to see what account types are available.

```json title="The Deposit Account Template Object"
{
  "id": "dep_acct_tmpl_01kasd1tthf1ns1pjn1kncctwd",
  "type": "DEPOSIT_ACCOUNT_TEMPLATE",
  "url": "https://api.erebor.bank/deposit_account_templates/dep_acct_tmpl_01kasd1tthf1ns1pjn1kncctwd",
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z",
  "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd",
  "name": "Erebor Business Checking",
  "deposit_account_type": "DDA",
  "ownership_types": ["BUSINESS"],
  "status": "ENABLED",
  "interest_rates": {
    "rate_config": {
      "rate_type": "FIXED",
      "fixed_rate": {
        "tiers": [
          {
            "balance_min": { "currency": "USD", "value": "0" },
            "balance_max": null,
            "rate_bps": 200
          }
        ]
      },
      "variable_rate": null
    },
    "starting_on": null,
    "ending_on": null
  }
}
```

## Attributes

### Schema (`DepositAccountTemplate`)

```yaml
components:
  schemas:
    DepositAccountType:
      type: string
      enum:
        - DDA
        - FBO
        - OMNIBUS
        - VIRTUAL_DDA
      description: >
        - DDA: Demand Deposit Account, behaves like a normal checking account,
        funds owned by the customer tied to this account.

        - FBO: For Benefit Of, this account holds an aggregate balance of
        virtual sub-accounts tied to it.

        - OMNIBUS: Behaves like a DDA, may hold funds for multiple entities
        without using virtual sub-accounts.

        - VIRTUAL_DDA: Virtual sub-account under an FBO parent account, with its
        own balance tracked separately.
      title: DepositAccountType
    OwnershipType:
      type: string
      enum:
        - BUSINESS
        - INDIVIDUAL
      title: OwnershipType
    DepositAccountTemplateStatus:
      type: string
      enum:
        - ENABLED
        - DISABLED
      description: |
        - ENABLED: May be used to create a new deposit account
        - DISABLED: May not be used to create a new deposit account
      title: DepositAccountTemplateStatus
    RateConfigRateType:
      type: string
      enum:
        - FIXED
        - VARIABLE
      description: The interest rate type for all tiers.
      title: RateConfigRateType
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
    FixedRateTier:
      type: object
      properties:
        balance_min:
          $ref: '#/components/schemas/Amount'
          description: Minimum balance (inclusive). Interval is [balance_min, balance_max).
        balance_max:
          oneOf:
            - $ref: '#/components/schemas/Amount'
            - type: 'null'
          description: >-
            Maximum balance (exclusive), null for uncapped. Should equal next
            tier's balance_min.
        rate_bps:
          type: integer
          description: Fixed interest rate in basis points (e.g., 250 = 2.50%)
      required:
        - balance_min
        - rate_bps
      title: FixedRateTier
    FixedRateConfig:
      type: object
      properties:
        tiers:
          type: array
          items:
            $ref: '#/components/schemas/FixedRateTier'
          description: Balance-based tiers for fixed rate
      required:
        - tiers
      title: FixedRateConfig
    VariableRateConfigBenchmark:
      type: string
      enum:
        - EFFR
      description: The benchmark rate to use for variable rate calculation.
      title: VariableRateConfigBenchmark
    VariableRateTierCalculationMethod:
      type: string
      enum:
        - SPREAD
        - PERCENTAGE
      description: |
        How to calculate the rate from the benchmark:
        - SPREAD: benchmark +/- spread_bps (e.g., EFFR - 25bps)
        - PERCENTAGE: percentage_bps/10000 * benchmark (e.g., 80% of EFFR)
      title: VariableRateTierCalculationMethod
    VariableRateTier:
      type: object
      properties:
        balance_min:
          $ref: '#/components/schemas/Amount'
          description: Minimum balance (inclusive). Interval is [balance_min, balance_max).
        balance_max:
          oneOf:
            - $ref: '#/components/schemas/Amount'
            - type: 'null'
          description: >-
            Maximum balance (exclusive), null for uncapped. Should equal next
            tier's balance_min.
        calculation_method:
          $ref: '#/components/schemas/VariableRateTierCalculationMethod'
          description: |
            How to calculate the rate from the benchmark:
            - SPREAD: benchmark +/- spread_bps (e.g., EFFR - 25bps)
            - PERCENTAGE: percentage_bps/10000 * benchmark (e.g., 80% of EFFR)
        spread_bps:
          type:
            - integer
            - 'null'
          description: >-
            Basis points to add/subtract from benchmark (when calculation_method
            is SPREAD).
        percentage_bps:
          type:
            - integer
            - 'null'
          description: >-
            Percentage of benchmark in basis points, 8000 = 80% (when
            calculation_method is PERCENTAGE).
      required:
        - balance_min
        - calculation_method
      title: VariableRateTier
    VariableRateConfig:
      type: object
      properties:
        benchmark:
          $ref: '#/components/schemas/VariableRateConfigBenchmark'
          description: The benchmark rate to use for variable rate calculation.
        tiers:
          type: array
          items:
            $ref: '#/components/schemas/VariableRateTier'
          description: Balance-based tiers for variable rate.
      required:
        - benchmark
        - tiers
      title: VariableRateConfig
    RateConfig:
      type: object
      properties:
        rate_type:
          $ref: '#/components/schemas/RateConfigRateType'
          description: The interest rate type for all tiers.
        fixed_rate:
          oneOf:
            - $ref: '#/components/schemas/FixedRateConfig'
            - type: 'null'
          description: Configuration for fixed rate (required when rate_type is FIXED).
        variable_rate:
          oneOf:
            - $ref: '#/components/schemas/VariableRateConfig'
            - type: 'null'
          description: >-
            Configuration for variable rate (required when rate_type is
            VARIABLE).
      required:
        - rate_type
      title: RateConfig
    InterestRateConfig:
      type: object
      properties:
        rate_config:
          $ref: '#/components/schemas/RateConfig'
          description: The rate type and tier configuration.
        starting_on:
          type:
            - string
            - 'null'
          format: date
          description: Date when this interest rate configuration becomes effective.
        ending_on:
          type:
            - string
            - 'null'
          format: date
          description: Date when this interest rate configuration expires.
      required:
        - rate_config
      title: InterestRateConfig
    DepositAccountTemplate:
      type: object
      properties:
        id:
          type: string
          description: Unique identifier for the template, prefixed with `dep_acct_tmpl_`.
        type:
          type: string
          enum:
            - DEPOSIT_ACCOUNT_TEMPLATE
          description: Object type. Always `DEPOSIT_ACCOUNT_TEMPLATE`.
        url:
          type: string
          format: uri
          description: API URL for retrieving this template.
        created_at:
          type: string
          format: date-time
          description: Timestamp of when the template was created, in ISO 8601 format.
        updated_at:
          type: string
          format: date-time
          description: Timestamp of when the template was last updated, in ISO 8601 format.
        archived_at:
          type:
            - string
            - 'null'
          format: date-time
          description: Timestamp when the template was archived, null if not archived
        program_id:
          type:
            - string
            - 'null'
          description: >-
            Unique identifier of the program this template belongs to, prefixed
            with `prgrm_`.
        name:
          type: string
          description: Human-readable name for the template.
        deposit_account_type:
          $ref: '#/components/schemas/DepositAccountType'
        ownership_types:
          type: array
          items:
            $ref: '#/components/schemas/OwnershipType'
          description: Ownership types this template supports.
        status:
          $ref: '#/components/schemas/DepositAccountTemplateStatus'
        interest_rates:
          $ref: '#/components/schemas/InterestRateConfig'
          description: Interest rate configuration for accounts created from this template.
      required:
        - id
        - type
        - url
        - created_at
        - updated_at
        - name
        - deposit_account_type
        - ownership_types
        - status
        - interest_rates
      title: DepositAccountTemplate
```