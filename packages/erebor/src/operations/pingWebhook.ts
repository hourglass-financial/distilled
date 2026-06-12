import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import { NotFound } from "../errors.ts";

// Input Schema
export const PingWebhookInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  id: Schema.String.pipe(T.PathParam()),
}).pipe(T.Http({ method: "POST", path: "/webhooks/{id}/ping" }));
export type PingWebhookInput = typeof PingWebhookInput.Type;

// Output Schema
export const PingWebhookOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  success: Schema.Boolean,
  response_status_code: Schema.optional(Schema.NullOr(Schema.Number)),
  response_time_ms: Schema.optional(Schema.NullOr(Schema.Number)),
  error: Schema.optional(Schema.NullOr(Schema.String)),
});
export type PingWebhookOutput = typeof PingWebhookOutput.Type;

// The operation
/**
 * Test Webhook
 *
 * Send a test event to a Webhook endpoint.
 *
 * @param id - Webhook ID
 */
export const pingWebhook = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: PingWebhookInput,
  outputSchema: PingWebhookOutput,
  errors: [NotFound] as const,
}));
