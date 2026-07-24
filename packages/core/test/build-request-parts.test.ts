import * as Schema from "effect/Schema";
import { describe, expect, it } from "vitest";
import * as T from "../src/traits.ts";

// RFC 6570 expansion semantics in `buildRequestParts`: `{+name}` keeps
// `/` literal, `{name}` percent-encodes it.

describe("buildRequestParts — RFC 6570 path expansion", () => {
  it("reserved expansion {+name} preserves `/` literally", () => {
    const Input = Schema.Struct({
      name: Schema.String.pipe(T.HttpPath("name")),
    }).pipe(T.Http({ method: "GET", path: "v3/{+name}" }));

    const parts = T.buildRequestParts(
      Input.ast,
      T.getHttpTrait(Input.ast)!,
      { name: "projects/my-project" },
      Input,
    );

    expect(parts.path).toBe("v3/projects/my-project");
  });

  it("simple expansion {name} percent-encodes `/`", () => {
    const Input = Schema.Struct({
      name: Schema.String.pipe(T.HttpPath("name")),
    }).pipe(T.Http({ method: "GET", path: "v3/{name}" }));

    const parts = T.buildRequestParts(
      Input.ast,
      T.getHttpTrait(Input.ast)!,
      { name: "projects/my-project" },
      Input,
    );

    expect(parts.path).toBe("v3/projects%2Fmy-project");
  });

  it("reserved expansion still encodes characters outside RFC 3986 reserved+unreserved", () => {
    const Input = Schema.Struct({
      name: Schema.String.pipe(T.HttpPath("name")),
    }).pipe(T.Http({ method: "GET", path: "v3/{+name}" }));

    const parts = T.buildRequestParts(
      Input.ast,
      T.getHttpTrait(Input.ast)!,
      { name: "projects/with space" },
      Input,
    );

    expect(parts.path).toBe("v3/projects/with%20space");
  });

  it("reserved expansion preserves a value that is purely RFC 3986 reserved", () => {
    const Input = Schema.Struct({
      resource: Schema.String.pipe(T.HttpPath("resource")),
    }).pipe(T.Http({ method: "GET", path: "v1/{+resource}:getIamPolicy" }));

    const parts = T.buildRequestParts(
      Input.ast,
      T.getHttpTrait(Input.ast)!,
      { resource: "projects/p/locations/global/keyRings/kr" },
      Input,
    );

    expect(parts.path).toBe(
      "v1/projects/p/locations/global/keyRings/kr:getIamPolicy",
    );
  });
});

// OpenAPI `deepObject`-style query params: Cloudflare list endpoints model
// filters as nested structs (e.g. DNS listRecords `name: { exact }`) that
// must serialize as `name.exact=value` — NOT `name=[object Object]`, which
// the server treats as a filter that matches nothing.

describe("buildRequestParts — structured query params", () => {
  const Input = Schema.Struct({
    zoneId: Schema.String.pipe(T.HttpPath("zone_id")),
    name: Schema.optional(
      Schema.Struct({
        contains: Schema.optional(Schema.String),
        exact: Schema.optional(Schema.String),
      }),
    ).pipe(T.HttpQuery("name")),
    tag: Schema.optional(
      Schema.Struct({
        not: Schema.optional(Schema.Array(Schema.String)),
      }),
    ).pipe(T.HttpQuery("tag")),
    type: Schema.optional(Schema.String).pipe(T.HttpQuery("type")),
  }).pipe(T.Http({ method: "GET", path: "/zones/{zone_id}/dns_records" }));

  const build = (input: Record<string, unknown>) =>
    T.buildRequestParts(Input.ast, T.getHttpTrait(Input.ast)!, input, Input);

  it("flattens a struct query param to dot-notation keys", () => {
    const parts = build({
      zoneId: "z1",
      name: { exact: "api.example.com" },
      type: "A",
    });

    expect(parts.query).toEqual({
      "name.exact": "api.example.com",
      type: "A",
    });
  });

  it("flattens multiple members of the same struct", () => {
    const parts = build({
      zoneId: "z1",
      name: { exact: "api.example.com", contains: "example" },
    });

    expect(parts.query).toEqual({
      "name.exact": "api.example.com",
      "name.contains": "example",
    });
  });

  it("serializes array members as repeated dot-notation params", () => {
    const parts = build({ zoneId: "z1", tag: { not: ["a", "b"] } });

    expect(parts.query).toEqual({ "tag.not": ["a", "b"] });
  });

  it("skips undefined and null struct members", () => {
    const parts = build({
      zoneId: "z1",
      name: { exact: "api.example.com", contains: undefined },
    });

    expect(parts.query).toEqual({ "name.exact": "api.example.com" });
  });

  it("keeps scalar and array query params unchanged", () => {
    const ScalarInput = Schema.Struct({
      type: Schema.optional(Schema.String).pipe(T.HttpQuery("type")),
      id: Schema.optional(Schema.Array(Schema.String)).pipe(T.HttpQuery("id")),
    }).pipe(T.Http({ method: "GET", path: "/things" }));

    const parts = T.buildRequestParts(
      ScalarInput.ast,
      T.getHttpTrait(ScalarInput.ast)!,
      { type: "A", id: ["1", "2"] },
      ScalarInput,
    );

    expect(parts.query).toEqual({ type: "A", id: ["1", "2"] });
  });

  it("uses bracket notation for explicit OpenAPI deepObject parameters", () => {
    const DeepObjectInput = Schema.Struct({
      filter: Schema.optional(
        Schema.Struct({
          status: Schema.optional(Schema.String),
          nested: Schema.optional(
            Schema.Struct({ exact: Schema.optional(Schema.String) }),
          ),
        }),
      ).pipe(
        T.HttpQuery("filter-options", {
          style: "deepObject",
          explode: true,
        }),
      ),
    }).pipe(T.Http({ method: "GET", path: "/things" }));

    const parts = T.buildRequestParts(
      DeepObjectInput.ast,
      T.getHttpTrait(DeepObjectInput.ast)!,
      { filter: { status: "active", nested: { exact: "match" } } },
      DeepObjectInput,
    );

    expect(parts.query).toEqual({
      "filter-options[status]": "active",
      "filter-options[nested][exact]": "match",
    });
  });

  it("honors OpenAPI array styles and explode metadata", () => {
    const StyledInput = Schema.Struct({
      repeated: Schema.Array(Schema.String).pipe(
        T.HttpQuery("repeated", { style: "form", explode: true }),
      ),
      comma: Schema.Array(Schema.String).pipe(
        T.HttpQuery("comma", { style: "form", explode: false }),
      ),
      spaced: Schema.Array(Schema.String).pipe(
        T.HttpQuery("spaced", { style: "spaceDelimited", explode: false }),
      ),
      piped: Schema.Array(Schema.String).pipe(
        T.HttpQuery("piped", { style: "pipeDelimited", explode: false }),
      ),
    }).pipe(T.Http({ method: "GET", path: "/things" }));

    const parts = T.buildRequestParts(
      StyledInput.ast,
      T.getHttpTrait(StyledInput.ast)!,
      {
        repeated: ["one", "two"],
        comma: ["one", "two"],
        spaced: ["one", "two"],
        piped: ["one", "two"],
      },
      StyledInput,
    );

    expect(parts.query).toEqual({
      repeated: ["one", "two"],
      comma: "one,two",
      spaced: "one two",
      piped: "one|two",
    });
  });

  it("honors OpenAPI form object explode metadata", () => {
    const StyledInput = Schema.Struct({
      exploded: Schema.Struct({
        red: Schema.Number,
        green: Schema.Number,
      }).pipe(T.HttpQuery("color", { style: "form", explode: true })),
      compact: Schema.Struct({ red: Schema.Number, green: Schema.Number }).pipe(
        T.HttpQuery("compact", { explode: false }),
      ),
    }).pipe(T.Http({ method: "GET", path: "/things" }));

    const parts = T.buildRequestParts(
      StyledInput.ast,
      T.getHttpTrait(StyledInput.ast)!,
      {
        exploded: { red: 100, green: 200 },
        compact: { red: 100, green: 200 },
      },
      StyledInput,
    );

    expect(parts.query).toEqual({
      red: "100",
      green: "200",
      compact: "red,100,green,200",
    });
  });
});

// Multipart file fields are modeled from OpenAPI `type: string, format: binary`
// as `Schema.String`, yet a caller correctly supplies a Blob/File/typed-array.
// `buildRequestParts` encodes the input only to derive wire-format keys, so the
// binary value must survive that encode byte-for-byte rather than being rejected
// by the String codec (which previously threw before the HTTP request was built).

describe("buildRequestParts — multipart binary body fields", () => {
  // Mirrors Erebor's createDocument input: a `file` binary field alongside
  // ordinary string/enum fields (already in wire form), all sent as
  // multipart/form-data.
  const Input = Schema.Struct({
    file: Schema.String,
    document_type: Schema.Literals(["FORMATION_DOCUMENT", "OTHER"]),
    name: Schema.String,
  }).pipe(
    T.Http({ method: "POST", path: "/documents", contentType: "multipart" }),
  );

  const build = (input: Record<string, unknown>) =>
    T.buildRequestParts(Input.ast, T.getHttpTrait(Input.ast)!, input, Input);

  it("preserves a Blob file value byte-for-byte through key encoding", () => {
    const blob = new Blob([new TextEncoder().encode("pdf-bytes")], {
      type: "application/pdf",
    });
    const parts = build({
      file: blob,
      document_type: "FORMATION_DOCUMENT",
      name: "Acme Formation.pdf",
    });

    const body = parts.body as Record<string, unknown>;
    // The exact Blob instance survives — not a `{}` stand-in from a failed encode.
    expect(body.file).toBe(blob);
    expect(body.document_type).toBe("FORMATION_DOCUMENT");
    expect(body.name).toBe("Acme Formation.pdf");
  });

  it("preserves a Uint8Array file value", () => {
    const bytes = new Uint8Array([1, 2, 3, 4]);
    const parts = build({
      file: bytes,
      document_type: "OTHER",
      name: "raw.bin",
    });

    const body = parts.body as Record<string, unknown>;
    expect(body.file).toBe(bytes);
    expect(body.document_type).toBe("OTHER");
  });

  it("does not mutate the caller's input object", () => {
    const blob = new Blob([new Uint8Array([9])]);
    const input = { file: blob, document_type: "OTHER", name: "x" };
    build(input);

    // The lazy copy inside the encoder must leave the original Blob in place.
    expect(input.file).toBe(blob);
  });

  it("still encodes a plain string file value unchanged (regression)", () => {
    const parts = build({
      file: "already-a-string",
      document_type: "OTHER",
      name: "n",
    });

    const body = parts.body as Record<string, unknown>;
    expect(body.file).toBe("already-a-string");
    expect(body.document_type).toBe("OTHER");
  });
});
