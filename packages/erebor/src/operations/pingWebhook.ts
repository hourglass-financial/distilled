import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { NotFound } from "../errors.ts";

// Input Schema
export interface PingWebhookInput {
  id: string;
  ereborVersion?: string;
}
export const PingWebhookInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  id: Schema.String.pipe(T.PathParam()),
  ereborVersion: Schema.optional(Schema.String).pipe(
    T.HttpHeader("Erebor-Version"),
  ),
}).pipe(
  T.Http({ method: "POST", path: "/webhooks/{id}/ping" }),
) as unknown as GeneratedStructCodec<PingWebhookInput>;

// Output Schema
export interface PingWebhookOutput {
  success: boolean;
  response_status_code?: number | null;
  response_time_ms?: number | null;
  error?: string | null;
}
export const PingWebhookOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  success: Schema.Boolean,
  response_status_code: Schema.optional(Schema.NullOr(Schema.Number)),
  response_time_ms: Schema.optional(Schema.NullOr(Schema.Number)),
  error: Schema.optional(Schema.NullOr(Schema.String)),
}) as unknown as GeneratedStructCodec<PingWebhookOutput>;

// The operation
/**
 * Test Webhook
 *
 * Send a test event to a Webhook endpoint.
 *
 * @param id - Webhook ID
 * @param ereborVersion - Pins the API version used to process this request. Format is `YYYY-MM-DD`. When omitted, the current default version is used.

 */
export const pingWebhook = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: PingWebhookInput,
  outputSchema: PingWebhookOutput,
  errors: [NotFound] as const,
}));
