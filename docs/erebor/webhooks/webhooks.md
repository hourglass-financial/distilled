> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# Webhooks

Webhooks push real-time event notifications to your server whenever something happens in your Erebor account — a wire settles, an ACH transfer fails, an onboarding status changes. Instead of polling the API, you register a URL and we'll `POST` events to it as they occur.

For the full list of event types, see [Supported Events](/api-reference/events/supported-events).

## Creating a webhook

Register a webhook by providing a URL and the event types you want to receive. Use `["*"]` to subscribe to all events.

```bash
curl -X POST "https://api.erebor.bank/webhooks" \
  -H "Authorization: test_1a2b3c4d5e6f7g8h9i0j" \
  -H "Erebor-Idempotency-Key: unique-webhook-create-001" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Payment notifications",
    "webhook_url": "https://your-app.com/webhooks/erebor",
    "event_types": ["WIRE_OUT.SETTLED", "WIRE_OUT.FAILED", "ACH_OUT.SETTLED"]
  }'
```

The response includes a `webhook_secret` field — you'll need this to verify signatures.

The `webhook_secret` is only returned once, in the creation response. It returns `null` on all subsequent reads. Store it securely as soon as you create the webhook.

## Signature verification

Every webhook request includes an `Erebor-Webhook-Signature` header that you should verify to confirm the request came from Erebor and wasn't tampered with.

### How signatures work

The signature header has this format:

```
Erebor-Webhook-Signature: t=1717200000,v1=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce8e108d8bd
```

* `t` — Unix timestamp (seconds) when Erebor sent the request
* `v1` — HMAC-SHA256 hex digest of the signed payload

The signed payload is the timestamp, a literal `.`, and the raw request body concatenated together:

```
{timestamp}.{raw_request_body}
```

The HMAC is computed using your `webhook_secret` as the key.

### Verifying step by step

1. **Extract the header values.** Parse `t` and `v1` from the `Erebor-Webhook-Signature` header.

2. **Build the signed payload.** Concatenate the `t` value, a `.`, and the raw request body exactly as received (don't parse and re-serialize the JSON — use the raw bytes).

3. **Compute the expected signature.** Calculate the HMAC-SHA256 hex digest of the signed payload using your stored `webhook_secret`.

4. **Compare signatures.** Check that your computed value matches `v1`. Use a constant-time comparison to prevent timing attacks.

5. **Check the timestamp.** Verify that `t` is within an acceptable window of the current time (we recommend 5 minutes). This prevents replay attacks.

### Worked example

Given:

|                  | Value                                                                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `webhook_secret` | `VQZm5Bm83rSumc12KDhpqMzczIERNdmW`                                                                                                               |
| `t` (timestamp)  | `1717200000`                                                                                                                                     |
| Raw body         | `{"id":"evt_01j0a1b2c3d4e5f6g7h8i9j0k1","type":"EVENT","event_type":"WIRE_OUT.SETTLED","resource":{"id":"out_wire_01j0a1b2c3d4e5f6g7h8i9j0k1"}}` |

The signed payload is:

```
1717200000.{"id":"evt_01j0a1b2c3d4e5f6g7h8i9j0k1","type":"EVENT","event_type":"WIRE_OUT.SETTLED","resource":{"id":"out_wire_01j0a1b2c3d4e5f6g7h8i9j0k1"}}
```

You can compute the signature with openssl:

```bash
echo -n '1717200000.{"id":"evt_01j0a1b2c3d4e5f6g7h8i9j0k1","type":"EVENT","event_type":"WIRE_OUT.SETTLED","resource":{"id":"out_wire_01j0a1b2c3d4e5f6g7h8i9j0k1"}}' \
  | openssl dgst -sha256 -hmac "VQZm5Bm83rSumc12KDhpqMzczIERNdmW"
```

The resulting signature in the header would be:

```
Erebor-Webhook-Signature: t=1717200000,v1=20e016c7972e5c8c9727ac883a793b70e76626ee767805935858e9e4aae2feed
```

## IP allowlist

All webhook requests originate from a static set of Erebor IP addresses. We recommend allowlisting these at your firewall or load balancer as an additional layer of verification alongside signature checks.

**Sandbox**

| IP address       |
| ---------------- |
| `3.147.144.194`  |
| `3.151.233.6`    |
| `18.224.101.119` |

**Production**

| IP address      |
| --------------- |
| `3.131.73.227`  |
| `3.147.114.233` |
| `18.219.237.15` |

## Responding to webhooks

Your endpoint must return a `2xx` HTTP status code to acknowledge receipt. The response body is ignored.

If we receive more than 100 non-success responses from your endpoint in a single day, we'll automatically disable the webhook. You can re-enable it via the API or dashboard.

## Retries

If your endpoint returns a non-`2xx` response or doesn't respond in time, we retry with exponential backoff for up to 24 hours. Retries start at 1-minute intervals, double each time, and cap at 8 hours between attempts, for a maximum of 10 attempts. After that, the delivery attempt is dropped.

You can also fetch missed events directly via the [Events API](/api-reference/events) as a fallback.

## Testing webhooks

Use the ping endpoint to send a test event to your webhook. This is useful for verifying your endpoint is reachable and your signature verification works.

```bash
curl -X POST "https://api.erebor.bank/webhooks/wh_01j0a1b2c3d4e5f6g7h8i9j0k1/ping" \
  -H "Authorization: test_1a2b3c4d5e6f7g8h9i0j"
```

The response tells you whether delivery succeeded:

```json
{
  "success": true,
  "response_status_code": 200,
  "response_time_ms": 120,
  "error": null
}
```

## Pausing and archiving webhooks

You can pause a webhook when you need to stop deliveries temporarily, or archive it when you're done with it for good.

### Pause or resume

Set `status` to `DISABLED` via `PATCH /webhooks/{id}` to stop delivery without losing the configuration. Events that match the webhook while it's disabled aren't queued — they're dropped. Set `status` back to `ENABLED` to resume.

```bash
curl -X PATCH "https://api.erebor.bank/webhooks/whk_01kasd1tthf1ns1pjn1kncctwd" \
  -H "Authorization: test_1a2b3c4d5e6f7g8h9i0j" \
  -H "Erebor-Idempotency-Key: pause-webhook-001" \
  -H "Content-Type: application/json" \
  -d '{ "status": "DISABLED" }'
```

### Archive

Archive a webhook with `POST /webhooks/{id}/archive` when you don't need it anymore. Archiving is irreversible — the webhook stops delivering events, `status` becomes `ARCHIVED`, and `archived_at` is set. The endpoint is idempotent, so calling it on an already-archived webhook returns the same object.

```bash
curl -X POST "https://api.erebor.bank/webhooks/whk_01kasd1tthf1ns1pjn1kncctwd/archive" \
  -H "Authorization: test_1a2b3c4d5e6f7g8h9i0j"
```

Use `DISABLED` for maintenance windows and temporary pauses. Archive when you're retiring the webhook for good.