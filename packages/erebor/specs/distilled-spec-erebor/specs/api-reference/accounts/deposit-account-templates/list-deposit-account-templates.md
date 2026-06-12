> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# List Deposit Account Templates

GET https://api.erebor.bank/deposit_account_templates

Retrieve a paginated list of Deposit Account Templates

Reference: https://docs.erebor.bank/api-reference/accounts/deposit-account-templates/list-deposit-account-templates

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: Erebor Banking API
  version: 1.0.0
paths:
  /deposit_account_templates:
    get:
      operationId: list-deposit-account-templates
      summary: List Deposit Account Templates
      description: Retrieve a paginated list of Deposit Account Templates
      tags:
        - subpackage_depositAccountTemplates
      parameters:
        - name: page_size
          in: query
          description: Number of items per page (max 100)
          required: false
          schema:
            type: integer
            default: 25
        - name: starting_after
          in: query
          description: Cursor for pagination (exclusive start)
          required: false
          schema:
            type: string
        - name: ending_before
          in: query
          description: Cursor for pagination (exclusive end)
          required: false
          schema:
            type: string
        - name: deposit_account_type
          in: query
          description: Filter by deposit account type
          required: false
          schema:
            $ref: '#/components/schemas/DepositAccountType'
        - name: ownership_type
          in: query
          description: Filter by ownership type
          required: false
          schema:
            $ref: '#/components/schemas/OwnershipType'
        - name: status
          in: query
          description: Filter by template status
          required: false
          schema:
            $ref: '#/components/schemas/DepositAccountTemplateStatus'
        - name: program_id
          in: query
          description: Filter by program ID
          required: false
          schema:
            type: string
        - name: Authorization
          in: header
          description: |
            Use your API key in the Authorization header.

            Example: `Authorization: your_api_key_here`
          required: true
          schema:
            type: string
      responses:
        '200':
          description: List of Deposit Account Templates
          content:
            application/json:
              schema:
                $ref: >-
                  #/components/schemas/DEPOSIT_ACCOUNT_TEMPLATES_listDepositAccountTemplates_Response_200
servers:
  - url: https://api.erebor.bank
    description: API server (environment determined by API key)
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
    BaseObject:
      type: object
      properties:
        id:
          type: string
          description: Unique identifier for the object
        type:
          type: string
          description: The type of the object
        url:
          type: string
          format: uri
          description: The URL for the object
        created_at:
          type: string
          format: date-time
          description: When the object was created
        updated_at:
          type: string
          format: date-time
          description: When the object was last updated
      required:
        - id
        - type
        - url
        - created_at
        - updated_at
      title: BaseObject
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
    DEPOSIT_ACCOUNT_TEMPLATES_listDepositAccountTemplates_Response_200:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/DepositAccountTemplate'
        has_more:
          type: boolean
        page_size:
          type: integer
        page_next:
          type:
            - string
            - 'null'
          format: uri
        page_prev:
          type:
            - string
            - 'null'
          format: uri
        url:
          type: string
          format: uri
      required:
        - data
        - has_more
        - page_size
        - url
      title: DEPOSIT_ACCOUNT_TEMPLATES_listDepositAccountTemplates_Response_200
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: Authorization
      description: |
        Use your API key in the Authorization header.

        Example: `Authorization: your_api_key_here`

```

## Examples



**Response**

```json
{
  "has_more": false,
  "page_size": 25,
  "url": "https://api.erebor.bank/deposit_account_templates",
  "data": [
    {
      "id": "dep_acct_tmpl_01kasd1tthf1ns1pjn1kncctwd",
      "type": "DEPOSIT_ACCOUNT_TEMPLATE",
      "url": "https://api.erebor.bank/deposit_account_templates/dep_acct_tmpl_01kasd1tthf1ns1pjn1kncctwd",
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-15T10:30:00Z",
      "name": "Erebor Business Checking",
      "deposit_account_type": "DDA",
      "ownership_types": [
        "BUSINESS"
      ],
      "status": "ENABLED",
      "interest_rates": {
        "rate_config": {
          "rate_type": "FIXED",
          "fixed_rate": {
            "tiers": [
              {
                "balance_min": {
                  "currency": "USD",
                  "value": "0",
                  "exponent": 2,
                  "display_value": "0.00"
                },
                "rate_bps": 200,
                "balance_max": {
                  "currency": "USD",
                  "value": "100000000",
                  "exponent": 2,
                  "display_value": "1000000.00"
                }
              },
              {
                "balance_min": {
                  "currency": "USD",
                  "value": "100000000",
                  "exponent": 2,
                  "display_value": "1000000.00"
                },
                "rate_bps": 350,
                "balance_max": {
                  "currency": "USD",
                  "value": "500000000",
                  "exponent": 2,
                  "display_value": "5000000.00"
                }
              },
              {
                "balance_min": {
                  "currency": "USD",
                  "value": "500000000",
                  "exponent": 2,
                  "display_value": "5000000.00"
                },
                "rate_bps": 450,
                "balance_max": null
              }
            ]
          },
          "variable_rate": null
        },
        "starting_on": null,
        "ending_on": null
      },
      "archived_at": null,
      "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd"
    },
    {
      "id": "dep_acct_tmpl_01kasd2uuhg2ot2qko2locduye",
      "type": "DEPOSIT_ACCOUNT_TEMPLATE",
      "url": "https://api.erebor.bank/deposit_account_templates/dep_acct_tmpl_01kasd2uuhg2ot2qko2locduye",
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-15T10:30:00Z",
      "name": "Erebor High-Yield Savings",
      "deposit_account_type": "FBO",
      "ownership_types": [
        "BUSINESS"
      ],
      "status": "ENABLED",
      "interest_rates": {
        "rate_config": {
          "rate_type": "VARIABLE",
          "fixed_rate": null,
          "variable_rate": {
            "benchmark": "EFFR",
            "tiers": [
              {
                "balance_min": {
                  "currency": "USD",
                  "value": "0",
                  "exponent": 2,
                  "display_value": "0.00"
                },
                "calculation_method": "SPREAD",
                "balance_max": {
                  "currency": "USD",
                  "value": "100000000",
                  "exponent": 2,
                  "display_value": "1000000.00"
                },
                "spread_bps": -50,
                "percentage_bps": null
              },
              {
                "balance_min": {
                  "currency": "USD",
                  "value": "100000000",
                  "exponent": 2,
                  "display_value": "1000000.00"
                },
                "calculation_method": "SPREAD",
                "balance_max": {
                  "currency": "USD",
                  "value": "500000000",
                  "exponent": 2,
                  "display_value": "5000000.00"
                },
                "spread_bps": -25,
                "percentage_bps": null
              },
              {
                "balance_min": {
                  "currency": "USD",
                  "value": "500000000",
                  "exponent": 2,
                  "display_value": "5000000.00"
                },
                "calculation_method": "SPREAD",
                "balance_max": null,
                "spread_bps": 0,
                "percentage_bps": null
              }
            ]
          }
        },
        "starting_on": null,
        "ending_on": null
      },
      "archived_at": null,
      "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd"
    },
    {
      "id": "dep_acct_tmpl_01kasd3vvig3pu3rlo3modevzf",
      "type": "DEPOSIT_ACCOUNT_TEMPLATE",
      "url": "https://api.erebor.bank/deposit_account_templates/dep_acct_tmpl_01kasd3vvig3pu3rlo3modevzf",
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-15T10:30:00Z",
      "name": "Erebor Premium Savings",
      "deposit_account_type": "FBO",
      "ownership_types": [
        "INDIVIDUAL"
      ],
      "status": "ENABLED",
      "interest_rates": {
        "rate_config": {
          "rate_type": "VARIABLE",
          "fixed_rate": null,
          "variable_rate": {
            "benchmark": "EFFR",
            "tiers": [
              {
                "balance_min": {
                  "currency": "USD",
                  "value": "0",
                  "exponent": 2,
                  "display_value": "0.00"
                },
                "calculation_method": "PERCENTAGE",
                "balance_max": {
                  "currency": "USD",
                  "value": "100000000",
                  "exponent": 2,
                  "display_value": "1000000.00"
                },
                "spread_bps": null,
                "percentage_bps": 6000
              },
              {
                "balance_min": {
                  "currency": "USD",
                  "value": "100000000",
                  "exponent": 2,
                  "display_value": "1000000.00"
                },
                "calculation_method": "PERCENTAGE",
                "balance_max": {
                  "currency": "USD",
                  "value": "500000000",
                  "exponent": 2,
                  "display_value": "5000000.00"
                },
                "spread_bps": null,
                "percentage_bps": 8000
              },
              {
                "balance_min": {
                  "currency": "USD",
                  "value": "500000000",
                  "exponent": 2,
                  "display_value": "5000000.00"
                },
                "calculation_method": "PERCENTAGE",
                "balance_max": null,
                "spread_bps": null,
                "percentage_bps": 9500
              }
            ]
          }
        },
        "starting_on": null,
        "ending_on": null
      },
      "archived_at": null,
      "program_id": "prgrm_01kasd1tthf1ns1pjn1kncctwd"
    }
  ],
  "page_next": null,
  "page_prev": null
}
```

**SDK Code**

```python List of Deposit Account Templates
import requests

url = "https://api.erebor.bank/deposit_account_templates"

headers = {"Authorization": "<apiKey>"}

response = requests.get(url, headers=headers)

print(response.json())
```

```javascript List of Deposit Account Templates
const url = 'https://api.erebor.bank/deposit_account_templates';
const options = {method: 'GET', headers: {Authorization: '<apiKey>'}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go List of Deposit Account Templates
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://api.erebor.bank/deposit_account_templates"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("Authorization", "<apiKey>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby List of Deposit Account Templates
require 'uri'
require 'net/http'

url = URI("https://api.erebor.bank/deposit_account_templates")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["Authorization"] = '<apiKey>'

response = http.request(request)
puts response.read_body
```

```java List of Deposit Account Templates
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;

HttpResponse<String> response = Unirest.get("https://api.erebor.bank/deposit_account_templates")
  .header("Authorization", "<apiKey>")
  .asString();
```

```php List of Deposit Account Templates
<?php
require_once('vendor/autoload.php');

$client = new \GuzzleHttp\Client();

$response = $client->request('GET', 'https://api.erebor.bank/deposit_account_templates', [
  'headers' => [
    'Authorization' => '<apiKey>',
  ],
]);

echo $response->getBody();
```

```csharp List of Deposit Account Templates
using RestSharp;

var client = new RestClient("https://api.erebor.bank/deposit_account_templates");
var request = new RestRequest(Method.GET);
request.AddHeader("Authorization", "<apiKey>");
IRestResponse response = client.Execute(request);
```

```swift List of Deposit Account Templates
import Foundation

let headers = ["Authorization": "<apiKey>"]

let request = NSMutableURLRequest(url: NSURL(string: "https://api.erebor.bank/deposit_account_templates")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "GET"
request.allHTTPHeaderFields = headers

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```