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
export const CreateAGraphQueryInput = /*@__PURE__*/ /*#__PURE__*/ Schema.Struct(
  {
    include: Schema.optional(Schema.String).pipe(T.HttpQuery("include")),
    fields: Schema.optional(Schema.Record(Schema.String, Schema.String)).pipe(
      T.HttpQuery("fields"),
    ),
    data: Schema.Struct({
      attributes: Schema.Struct({
        "graph-query-template-id": Schema.String,
        "parameter-map": Schema.optional(
          Schema.Record(Schema.String, Schema.Unknown),
        ),
        "variable-map": Schema.optional(
          Schema.Record(Schema.String, Schema.Unknown),
        ),
        "timeout-in-seconds": Schema.optional(Schema.Number),
      }),
    }),
    meta: Schema.optional(
      Schema.Struct({
        "run-sync": Schema.optional(Schema.Boolean),
      }),
    ),
  },
).pipe(T.Http({ method: "POST", path: "/graph-queries" }));
export type CreateAGraphQueryInput = typeof CreateAGraphQueryInput.Type;

// Output Schema
export const CreateAGraphQueryOutput =
  /*@__PURE__*/ /*#__PURE__*/ Schema.Struct({
    data: Schema.Struct({
      type: Schema.optional(Schema.String),
      id: Schema.optional(Schema.String),
      attributes: Schema.optional(
        Schema.Struct({
          status: Schema.optional(Schema.String),
          params: Schema.optional(Schema.Record(Schema.String, Schema.Unknown)),
          "created-at": Schema.optional(Schema.String),
          "updated-at": Schema.optional(Schema.NullOr(Schema.String)),
          "errored-at": Schema.optional(Schema.NullOr(Schema.String)),
          "completed-at": Schema.optional(Schema.NullOr(Schema.String)),
          "redacted-at": Schema.optional(Schema.NullOr(Schema.String)),
          stats: Schema.optional(Schema.Unknown),
          "explorer-url": Schema.optional(Schema.NullOr(Schema.String)),
          "node-limit-reached": Schema.optional(Schema.NullOr(Schema.Boolean)),
          nodes: Schema.optional(
            Schema.Array(
              Schema.Struct({
                type: Schema.optional(Schema.String),
                value: Schema.optional(Schema.String),
              }),
            ),
          ),
        }),
      ),
      relationships: Schema.optional(
        Schema.Struct({
          accounts: Schema.optional(
            Schema.Struct({
              data: Schema.optional(
                Schema.Array(
                  Schema.Struct({
                    id: Schema.optional(Schema.String),
                    type: Schema.optional(Schema.String),
                  }),
                ),
              ),
            }),
          ),
        }),
      ),
    }),
    included: Schema.optional(
      Schema.Array(
        Schema.Struct({
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
                              value: Schema.optional(
                                Schema.NullOr(Schema.String),
                              ),
                            }),
                          ),
                          middle: Schema.optional(
                            Schema.Struct({
                              type: Schema.optional(Schema.String),
                              value: Schema.optional(
                                Schema.NullOr(Schema.String),
                              ),
                            }),
                          ),
                          last: Schema.optional(
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
                  address: Schema.optional(
                    Schema.Struct({
                      type: Schema.optional(Schema.String),
                      value: Schema.optional(
                        Schema.Struct({
                          street_1: Schema.optional(
                            Schema.Struct({
                              type: Schema.optional(Schema.String),
                              value: Schema.optional(
                                Schema.NullOr(Schema.String),
                              ),
                            }),
                          ),
                          street_2: Schema.optional(
                            Schema.Struct({
                              type: Schema.optional(Schema.String),
                              value: Schema.optional(
                                Schema.NullOr(Schema.String),
                              ),
                            }),
                          ),
                          subdivision: Schema.optional(
                            Schema.Struct({
                              type: Schema.optional(Schema.String),
                              value: Schema.optional(
                                Schema.NullOr(Schema.String),
                              ),
                            }),
                          ),
                          city: Schema.optional(
                            Schema.Struct({
                              type: Schema.optional(Schema.String),
                              value: Schema.optional(
                                Schema.NullOr(Schema.String),
                              ),
                            }),
                          ),
                          postal_code: Schema.optional(
                            Schema.Struct({
                              type: Schema.optional(Schema.String),
                              value: Schema.optional(
                                Schema.NullOr(Schema.String),
                              ),
                            }),
                          ),
                          country_code: Schema.optional(
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
      ),
    ),
  });
export type CreateAGraphQueryOutput = typeof CreateAGraphQueryOutput.Type;

// The operation
/**
 * Create a Graph Query
 *
 * @param include - A comma-separated list of relationship paths. This can be used to customize which related resources will be fully serialized in the `included` key in the response. See [Serialization](https://docs.withpersona.com/serialization#inclusion-of-related-resources) for more details.
 * @param fields - Comma-separated list(s) of attributes to include in the response. This can be used to customize which attributes will be serialized in the response. See [Serialization](https://docs.withpersona.com/serialization#sparse-fieldsets) for more details.
 */
export const createAGraphQuery = /*@__PURE__*/ /*#__PURE__*/ API.make(() => ({
  inputSchema: CreateAGraphQueryInput,
  outputSchema: CreateAGraphQueryOutput,
  errors: [
    BadRequest,
    Forbidden,
    NotFound,
    Conflict,
    UnprocessableEntity,
  ] as const,
}));
