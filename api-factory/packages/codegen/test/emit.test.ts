import { describe, expect, it } from "vitest";
import { emitClient } from "../src/emit/client.ts";
import { emitConsistencyTest } from "../src/emit/consistency-test.ts";
import { emitErrors } from "../src/emit/errors.ts";
import { ImportCollector } from "../src/emit/imports.ts";
import { emitResources } from "../src/emit/resources.ts";
import { emitField } from "../src/emit/schemas.ts";
import {
  canonicalize,
  decodeVendorConfig,
  generate,
  normalizeOpenApi,
  type Formatter,
  type JsonObject,
} from "../src/index.ts";
import { errorsRichFixture } from "./fixtures/errors-rich.ts";
import { arraySuccessFixture } from "./fixtures/array-success.ts";
import { fixtures } from "./fixtures/index.ts";
import { minimalFixture } from "./fixtures/minimal.ts";
import { paginationFixture } from "./fixtures/pagination.ts";
import { unionSuccessFixture } from "./fixtures/union-success.ts";
import { bastionConfig, bastionSpec } from "./fixtures/openapi.ts";
import {
  emitToTemp,
  expectTreesEqual,
  prepareGolden,
  removeTemp,
} from "./helpers.ts";

const identity: Formatter = (files) => files;

describe("reviewed exemplar conventions", () => {
  it("sorts import statements by group and module, and members by imported symbol", () => {
    const imports = new ImportCollector();
    imports.use("../schemas.ts", "Widget");
    imports.use("./client.ts", "WorkosError", { typeOnly: true });
    imports.use("./client.ts", "run");
    imports.use("./client.ts", "WorkosClient", { typeOnly: true });
    imports.use("effect/Schema", "Schema", { namespace: true });
    imports.use("@hourglass-financial/api-factory-core", "STATUS_ERRORS", {
      alias: "CORE_STATUS_ERRORS",
    });
    imports.use("@hourglass-financial/api-factory-core", "RedactedValue");
    imports.use("@hourglass-financial/api-factory-core", "MetaKey");
    imports.use("@hourglass-financial/api-factory-core", "Meta");
    imports.use("@hourglass-financial/api-factory-core", "DEFAULT_ERRORS", {
      alias: "CORE_DEFAULT_ERRORS",
    });
    imports.use(
      "@hourglass-financial/api-factory-core",
      "ClassifiedErrorClass",
      {
        typeOnly: true,
      },
    );
    imports.use("@hourglass-financial/api-factory-core", "byCode");

    expect(imports.render()).toBe(
      'import { byCode, type ClassifiedErrorClass, DEFAULT_ERRORS as CORE_DEFAULT_ERRORS, Meta, MetaKey, RedactedValue, STATUS_ERRORS as CORE_STATUS_ERRORS } from "@hourglass-financial/api-factory-core";\n' +
        'import * as Schema from "effect/Schema";\n' +
        'import { Widget } from "../schemas.ts";\n' +
        'import { run, type WorkosClient, type WorkosError } from "./client.ts";',
    );
  });

  it("places imports or declarations immediately after non-barrel banners", () => {
    const files = generate(minimalFixture, { formatter: identity });
    for (const file of files.filter((entry) => entry.path.endsWith(".ts"))) {
      const bannerEnd = file.contents.indexOf(" */");
      expect(bannerEnd, file.path).toBeGreaterThanOrEqual(0);
      const suffix = file.contents.slice(bannerEnd + 3);
      if (file.path === "src/index.ts") {
        expect(suffix.startsWith("\n\n"), file.path).toBe(true);
      } else {
        expect(suffix.startsWith("\n\n"), file.path).toBe(false);
        expect(suffix.startsWith("\n"), file.path).toBe(true);
      }
    }
  });

  it("emits envelope factory data and documentation from resolved IR data", () => {
    const client = emitClient({
      ...minimalFixture,
      envelope: {
        ...minimalFixture.envelope,
        decodeDocs: "Resolved envelope documentation from the IR.",
        discriminatorFields: ["code", "error-code"],
      },
    }).contents;
    expect(client).toContain(
      "/** Resolved envelope documentation from the IR. */",
    );
    expect(client).toContain('discriminatorFields: ["code", "error-code"],');
    expect(client).toContain("decodeEnvelope: makeEnvelopeDecoder({");
    expect(client).not.toContain("const asString");
    expect(client).not.toContain("const decodeEnvelope");
  });

  it("emits the code-error title and prose inside one section rule", () => {
    expect(emitErrors(errorsRichFixture).contents).toContain(
      "// ---------------------------------------------------------------------------\n" +
        "// Code-discriminated authentication errors (POST /sessions/authenticate)\n" +
        "//\n" +
        "// The endpoint returns typed discriminator errors.\n" +
        "// Classes are ordered alphabetically by discriminator code.\n" +
        "// ---------------------------------------------------------------------------",
    );
  });

  it("emits resolved pagination trio documentation", () => {
    const resource = emitResources(paginationFixture)[0]!.contents;
    expect(resource).toContain(
      "/** Stream every page of satellites, following the `after` cursor. */",
    );
    expect(resource).toContain(
      "/** Stream every satellite across every page. */",
    );
  });

  it("emits an array output schema and readonly array result type", () => {
    const resource = emitResources(arraySuccessFixture)[0]!.contents;

    expect(resource).toContain("Schema.$Array<typeof Identity>");
    expect(resource).toContain("output: Schema.Array(Identity),");
    expect(resource).toContain("Effect.Effect<ReadonlyArray<Identity>,");
  });

  it("emits an ordered union output schema and result type", () => {
    const resource = emitResources(unionSuccessFixture)[0]!.contents;

    expect(resource).toContain("Schema.Union([PendingJob, CompletedJob])");
    expect(resource).toContain("Effect.Effect<PendingJob | CompletedJob,");
  });

  it("names the resolved vendor coverage location", () => {
    expect(emitConsistencyTest(minimalFixture).contents).toContain(
      "Behavioral coverage lives in `vendors/northstar`.",
    );
  });

  it("emits __proto__ fields as computed properties", () => {
    expect(
      emitField({
        name: "__proto__",
        schema: { kind: "string" },
        optional: false,
        nullable: false,
      }),
    ).toBe('["__proto__"]: Schema.String');
  });

  it("emits overridden code error names through declarations and references", () => {
    const config = {
      ...(bastionConfig as JsonObject),
      errors: {
        ...((bastionConfig as JsonObject)["errors"] as JsonObject),
        codeClassNames: { invalid_token: "AInvalidToken" },
      },
    };
    const ir = canonicalize(
      normalizeOpenApi(bastionSpec, decodeVendorConfig(config)),
    );
    const files = generate(ir, { formatter: identity });
    const errors = files.find((file) => file.path === "src/errors.ts")!;
    const sessions = files.find(
      (file) => file.path === "src/resources/sessions.ts",
    )!;

    expect(errors.contents).toContain("export class AInvalidToken extends");
    expect(errors.contents).toContain('  "AInvalidToken",');
    expect(errors.contents).toContain(
      "byCode([\n    AlphaChallenge,\n    AInvalidToken,",
    );
    expect(sessions.contents).toContain(
      "const authenticateErrors = [AInvalidToken, AlphaChallenge, NotFound, TooManyRequests] as const;",
    );
  });
});

describe("synthetic emitter goldens", () => {
  for (const [name, ir] of Object.entries(fixtures)) {
    it(`emits the ${name} tree byte-for-byte`, () => {
      const golden = prepareGolden(name, ir);
      const actual = emitToTemp(ir);
      try {
        expectTreesEqual(golden, actual);
      } finally {
        removeTemp(actual);
      }
    });
  }
});
