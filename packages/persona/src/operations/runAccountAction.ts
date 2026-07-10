import * as Schema from "effect/Schema";
import { API } from "../client.ts";
import * as T from "../traits.ts";
import {
  BadRequest,
  Forbidden,
  NotFound,
  Conflict,
  UnprocessableEntity,
} from "../errors.ts";

// Input Schema
export const RunAccountActionInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
  accountId: Schema.String.pipe(T.PathParam()),
  data: Schema.Struct({
    "account-action-id": Schema.String,
    parameters: Schema.optional(Schema.Record(Schema.String, Schema.Unknown)),
  }),
}).pipe(T.Http({ method: "POST", path: "/accounts/{accountId}/run-action" }));
export type RunAccountActionInput = typeof RunAccountActionInput.Type;

// Output Schema
export const RunAccountActionOutput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct(
  {
    data: Schema.Struct({
      type: Schema.optional(Schema.String),
      id: Schema.optional(Schema.String),
      attributes: Schema.optional(
        Schema.Struct({
          "reference-id": Schema.optional(Schema.NullOr(Schema.String)),
          "account-type-name": Schema.optional(Schema.String),
          "created-at": Schema.optional(Schema.String),
          "updated-at": Schema.optional(Schema.String),
          "redacted-at": Schema.optional(Schema.NullOr(Schema.String)),
          fields: Schema.optional(
            Schema.Struct({
              name: Schema.optional(
                Schema.Struct({
                  type: Schema.optional(Schema.String),
                  value: Schema.optional(
                    Schema.Struct({
                      first: Schema.optional(
                        Schema.Struct({
                          type: Schema.optional(Schema.String),
                          value: Schema.optional(Schema.NullOr(Schema.String)),
                        }),
                      ),
                      middle: Schema.optional(
                        Schema.Struct({
                          type: Schema.optional(Schema.String),
                          value: Schema.optional(Schema.NullOr(Schema.String)),
                        }),
                      ),
                      last: Schema.optional(
                        Schema.Struct({
                          type: Schema.optional(Schema.String),
                          value: Schema.optional(Schema.NullOr(Schema.String)),
                        }),
                      ),
                    }),
                  ),
                }),
              ),
              address: Schema.optional(
                Schema.Struct({
                  type: Schema.optional(Schema.String),
                  value: Schema.optional(
                    Schema.Struct({
                      street_1: Schema.optional(
                        Schema.Struct({
                          type: Schema.optional(Schema.String),
                          value: Schema.optional(Schema.NullOr(Schema.String)),
                        }),
                      ),
                      street_2: Schema.optional(
                        Schema.Struct({
                          type: Schema.optional(Schema.String),
                          value: Schema.optional(Schema.NullOr(Schema.String)),
                        }),
                      ),
                      subdivision: Schema.optional(
                        Schema.Struct({
                          type: Schema.optional(Schema.String),
                          value: Schema.optional(Schema.NullOr(Schema.String)),
                        }),
                      ),
                      city: Schema.optional(
                        Schema.Struct({
                          type: Schema.optional(Schema.String),
                          value: Schema.optional(Schema.NullOr(Schema.String)),
                        }),
                      ),
                      postal_code: Schema.optional(
                        Schema.Struct({
                          type: Schema.optional(Schema.String),
                          value: Schema.optional(Schema.NullOr(Schema.String)),
                        }),
                      ),
                      country_code: Schema.optional(
                        Schema.Struct({
                          type: Schema.optional(Schema.String),
                          value: Schema.optional(Schema.NullOr(Schema.String)),
                        }),
                      ),
                    }),
                  ),
                }),
              ),
              identification_numbers: Schema.optional(
                Schema.Struct({
                  type: Schema.optional(Schema.String),
                  value: Schema.optional(
                    Schema.Array(
                      Schema.Struct({
                        type: Schema.optional(Schema.String),
                        value: Schema.optional(
                          Schema.Struct({
                            identification_class: Schema.optional(
                              Schema.Struct({
                                type: Schema.optional(Schema.String),
                                value: Schema.optional(Schema.String),
                              }),
                            ),
                            identification_number: Schema.optional(
                              Schema.Struct({
                                type: Schema.optional(Schema.String),
                                value: Schema.optional(Schema.String),
                              }),
                            ),
                            issuing_country: Schema.optional(
                              Schema.Struct({
                                type: Schema.optional(Schema.String),
                                value: Schema.optional(Schema.String),
                              }),
                            ),
                            hashed_identification_number: Schema.optional(
                              Schema.Struct({
                                type: Schema.optional(Schema.String),
                                value: Schema.optional(
                                  Schema.NullOr(Schema.String),
                                ),
                              }),
                            ),
                          }),
                        ),
                      }),
                    ),
                  ),
                }),
              ),
              birthdate: Schema.optional(
                Schema.Struct({
                  type: Schema.optional(Schema.String),
                  value: Schema.optional(Schema.NullOr(Schema.String)),
                }),
              ),
              phone_number: Schema.optional(
                Schema.Struct({
                  type: Schema.optional(Schema.String),
                  value: Schema.optional(Schema.NullOr(Schema.String)),
                }),
              ),
              email_address: Schema.optional(
                Schema.Struct({
                  type: Schema.optional(Schema.String),
                  value: Schema.optional(Schema.NullOr(Schema.String)),
                }),
              ),
              selfie_photo: Schema.optional(
                Schema.Struct({
                  type: Schema.optional(Schema.String),
                  value: Schema.optional(
                    Schema.NullOr(
                      Schema.Struct({
                        filename: Schema.optional(Schema.String),
                        url: Schema.optional(Schema.String),
                        "byte-size": Schema.optional(Schema.Number),
                      }),
                    ),
                  ),
                }),
              ),
            }),
          ),
          tags: Schema.optional(Schema.Array(Schema.Unknown)),
          "account-status": Schema.optional(Schema.String),
        }),
      ),
      relationships: Schema.optional(
        Schema.Struct({
          "account-type": Schema.optional(
            Schema.Struct({
              data: Schema.optional(
                Schema.Struct({
                  id: Schema.optional(Schema.String),
                  type: Schema.optional(Schema.String),
                }),
              ),
            }),
          ),
        }),
      ),
    }),
    meta: Schema.Struct({
      "workflow-run-id": Schema.String,
    }),
  },
);
export type RunAccountActionOutput = typeof RunAccountActionOutput.Type;

// The operation
/**
 * Run an account action
 *
 * Triggers an account action for the specified account
 *
 * @param accountId - The ID of the account to run the action on
 */
export const runAccountAction = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: RunAccountActionInput,
  outputSchema: RunAccountActionOutput,
  errors: [
    BadRequest,
    Forbidden,
    NotFound,
    Conflict,
    UnprocessableEntity,
  ] as const,
}));
