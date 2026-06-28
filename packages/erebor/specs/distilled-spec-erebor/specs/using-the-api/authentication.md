> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Authentication

Use API keys to authenticate requests to the Erebor API. You can also add IP allowlisting and mutual TLS (mTLS) on top of API keys for stricter access control.

## API keys

All requests require an API key in the `Authorization` header. Send the raw key value. Do not add a `Bearer` prefix.

```bash
curl -X GET "https://api.erebor.bank/programs" \
  -H "Authorization: test_key_YOUR_API_KEY_HERE"
```

API keys can be created, managed, and revoked in the [Developer Dashboard](https://developer.erebor.bank/). Store new keys securely when you create them.

## Test and live environments

Your key's prefix determines the environment:

* `test_key_` keys hit the sandbox with simulated data
* `live_key_` keys hit production with real money

Both environments use the same base URL: `https://api.erebor.bank`.

Keep test and live keys separate in your application configuration.

## Advanced security

IP allowlisting and mTLS are optional controls you can set in the [Developer Dashboard](https://developer.erebor.bank/). Both apply on top of API key authentication.

### IP allowlist

In the Developer Dashboard, you can choose which IP addresses can use your API keys. Leave the allowlist empty to allow requests from anywhere.

Once you add one or more IP addresses, requests from any other address are rejected. The API accepts individual IPv4 or IPv6 addresses, not CIDR ranges, and enforces a limit of 16 addresses per customer.

### Mutual TLS

mTLS requires each API request to present an active client certificate in addition to an API key. In the Developer Dashboard, upload your public certificate PEM, then turn on **Require mTLS** to enforce it. Do not upload private keys.

The API enforces a limit of 5 active certificates per customer, allowing for zero-downtime rotation.

Before you require mTLS or rotate an active certificate, verify that your API client is configured correctly using the `mtls_check` endpoint:

```bash
curl -X GET "https://api.erebor.bank/mtls_check" \
  -H "Authorization: test_key_YOUR_API_KEY_HERE" \
  --cert client-cert.pem --key client-key.pem
```

```json
{ "mtls_valid": true }
```

To rotate certificates, upload the new public certificate, verify it with `mtls_check`, update your clients, then disable the old certificate.

## Troubleshooting

If a request fails, check that:

* the `Authorization` header is present
* the API key matches the environment you intended to use
* the request comes from an allowlisted IP address, if IP allowlisting is enabled
* the client presents an active certificate, if mTLS is required

Include the value of the `Erebor-Request-ID` response header when you contact `support@erebor.bank`.