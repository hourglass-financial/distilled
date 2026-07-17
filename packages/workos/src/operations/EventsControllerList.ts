import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import type { GeneratedStructCodec } from "@distilled.cloud/core/generated-schema";
import { BadRequest, UnprocessableEntity } from "../errors.ts";

// Input Schema
export interface EventsControllerListInput {
  before?: string;
  after?: string;
  limit?: number;
  order?: "normal" | "desc" | "asc";
  events?: ReadonlyArray<string>;
  range_start?: string;
  range_end?: string;
  organization_id?: string;
}
export const EventsControllerListInput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    before: Schema.optional(Schema.String).pipe(T.HttpQuery("before")),
    after: Schema.optional(Schema.String).pipe(T.HttpQuery("after")),
    limit: Schema.optional(Schema.Number).pipe(T.HttpQuery("limit")),
    order: Schema.optional(Schema.Literals(["normal", "desc", "asc"])).pipe(
      T.HttpQuery("order"),
    ),
    events: Schema.optional(Schema.Array(Schema.String)).pipe(
      T.HttpQuery("events", { style: "form", explode: false }),
    ),
    range_start: Schema.optional(Schema.String).pipe(
      T.HttpQuery("range_start"),
    ),
    range_end: Schema.optional(Schema.String).pipe(T.HttpQuery("range_end")),
    organization_id: Schema.optional(Schema.String).pipe(
      T.HttpQuery("organization_id"),
    ),
  }).pipe(
    T.Http({ method: "GET", path: "/events" }),
  ) as unknown as GeneratedStructCodec<EventsControllerListInput>;

// Output Schema
export interface EventsControllerListOutput {
  object: "list";
  data: ReadonlyArray<{
    object: "event";
    id: string;
    event: string;
    data: Record<string, unknown>;
    created_at: string;
    context?: Record<string, unknown>;
  }>;
  list_metadata: { after: string | null };
}
export const EventsControllerListOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    object: Schema.Literals(["list"]),
    data: Schema.Array(
      Schema.Struct({
        object: Schema.Literals(["event"]),
        id: Schema.String,
        event: Schema.String,
        data: Schema.Record(Schema.String, Schema.Unknown),
        created_at: Schema.String,
        context: Schema.optional(Schema.Record(Schema.String, Schema.Unknown)),
      }),
    ),
    list_metadata: Schema.Struct({
      after: Schema.NullOr(Schema.String),
    }),
  }) as unknown as GeneratedStructCodec<EventsControllerListOutput>;

// The operation
/**
 * List events
 *
 * List events for the current environment.
 *
 * @param before - An object ID that defines your place in the list. When the ID is not present, you are at the end of the list. For example, if you make a list request and receive 100 objects, ending with `"obj_123"`, your subsequent call can include `before="obj_123"` to fetch a new batch of objects before `"obj_123"`.
 * @param after - An object ID that defines your place in the list. When the ID is not present, you are at the end of the list. For example, if you make a list request and receive 100 objects, ending with `"obj_123"`, your subsequent call can include `after="obj_123"` to fetch a new batch of objects after `"obj_123"`.
 * @param limit - Upper limit on the number of objects to return, between `1` and `100`.
 * @param order - Order the results by the creation time. Supported values are `"asc"` (ascending), `"desc"` (descending), and `"normal"` (descending with reversed cursor semantics where `before` fetches older records and `after` fetches newer records).
 * @param events - Filter events by one or more event types (e.g. `dsync.user.created`).
 * @param range_start - ISO-8601 date string to filter events created after this date.
 * @param range_end - ISO-8601 date string to filter events created before this date.
 * @param organization_id - Filter events by the [Organization](/reference/organization) that the event is associated with.
 */
export const EventsControllerList = /*@__PURE__*/ /*#__PURE__*/ API.make(
  () => ({
    inputSchema: EventsControllerListInput,
    outputSchema: EventsControllerListOutput,
    errors: [BadRequest, UnprocessableEntity] as const,
  }),
);
