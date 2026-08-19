import type { ClientIr } from "../ir/model.ts";
import { ImportCollector } from "./imports.ts";
import {
  banner,
  CORE_PACKAGE,
  createWriter,
  emitted,
  type EmittedFile,
  finishWriter,
  section,
  stringLiteral,
  writeDoc,
} from "./shared.ts";

export const emitClient = (ir: ClientIr): EmittedFile => {
  const imports = new ImportCollector();
  for (const symbol of [
    "makeEnvelopeDecoder",
    "makeMatchError",
    "makeRunner",
    "makeVendorAdapters",
    "parseRetryAfter",
    "Retry",
  ]) {
    imports.use(CORE_PACKAGE, symbol);
  }
  for (const symbol of [
    "ClassifiedErrorClass",
    "InputSchema",
    "Operation",
    "OutputSchema",
    "Runner",
  ]) {
    imports.use(CORE_PACKAGE, symbol, { typeOnly: true });
  }
  for (const symbol of ["Context", "Effect", "Layer"]) {
    imports.use(`effect/${symbol}`, symbol, { namespace: true });
  }
  imports.use("effect/unstable/http/HttpClient", "HttpClient");
  imports.use("effect/unstable/http/FetchHttpClient", "FetchHttpClient", {
    namespace: true,
  });
  imports.use("./config.ts", "credentialsFromEnv");
  imports.use("./config.ts", "Credentials");
  for (const symbol of [
    "CODE_ERRORS",
    "DEFAULT_ERRORS",
    "STATUS_ERRORS",
    `Unknown${ir.vendor.prefix}Error`,
    `${ir.vendor.prefix}DecodeError`,
    `${ir.vendor.prefix}TransportError`,
  ]) {
    imports.use("./errors.ts", symbol);
  }
  imports.use("./errors.ts", `${ir.vendor.prefix}ExtraError`, {
    typeOnly: true,
  });

  const { display, prefix } = ir.vendor;
  const writer = createWriter();
  writer.writeLine(
    banner(
      [
        "auth scheme / error envelope shape → the generator's vendor profile",
        `request execution, retry, error gating, envelope decode, failure wrapping → ${CORE_PACKAGE}`,
      ],
      `Every operation flows through the single \`${prefix}Client.run\`, assembled here\nfrom one core \`makeRunner\` + \`makeMatchError\` pair. The service is the only\nthing a consumer wires; everything else is a tree-shakeable operation import.`,
    ),
  );
  writer.writeLine(imports.render()).blankLine();
  writer.writeLine(section("Error envelope + matcher")).blankLine();
  writer.writeLine(
    `const adapters = makeVendorAdapters<${prefix}ExtraError>({`,
  );
  writer.indent(() => {
    writer.writeLine(`UnknownError: Unknown${prefix}Error,`);
    writer.writeLine(`TransportError: ${prefix}TransportError,`);
    writer.writeLine(`DecodeError: ${prefix}DecodeError,`);
  });
  writer.writeLine("});").blankLine();
  writer.writeLine(`const matchError = makeMatchError<${prefix}ExtraError>({`);
  writer.indent(() => {
    writeDoc(writer, ir.envelope.decodeDocs);
    writer.writeLine("decodeEnvelope: makeEnvelopeDecoder({");
    writer.indent(() => {
      writer.writeLine(
        `messageFields: [${ir.envelope.messageFields.map(stringLiteral).join(", ")}],`,
      );
      writer.writeLine(
        `discriminatorFields: [${ir.envelope.discriminatorFields.map(stringLiteral).join(", ")}],`,
      );
      writer.writeLine(
        `stringBodyIsMessage: ${String(ir.envelope.stringBodyIsMessage)},`,
      );
    });
    writer.writeLine("}),");
    writer.writeLine("statusErrors: STATUS_ERRORS,");
    writer.writeLine("codeErrors: CODE_ERRORS,");
    writer.writeLine("universalErrors: DEFAULT_ERRORS,");
    writer.writeLine("retryAfter: parseRetryAfter,");
    writer.writeLine("makeUnknown: adapters.makeUnknown,");
  });
  writer.writeLine("});").blankLine();
  writer.writeLine(section("Client service + layers")).blankLine();
  writeDoc(
    writer,
    `The full, honest error channel of a ${display} operation: its own declared typed\nerrors plus the universal defaults, \`Unknown*\` fallback, and transport/decode\nwrappers. Every generated operation annotates its result with this.`,
  );
  writer.writeLine(
    `export type ${prefix}Error<EC extends readonly ClassifiedErrorClass[]> =`,
  );
  writer.indent(() => {
    writer.writeLine("| InstanceType<EC[number]>");
    writer.writeLine(`| ${prefix}ExtraError;`);
  });
  writer.blankLine();
  writeDoc(
    writer,
    `The single request runner every ${display} operation is dispatched through.`,
  );
  writer.writeLine(`export interface ${prefix}ClientShape {`);
  writer.indent(() =>
    writer.writeLine(`readonly run: Runner<${prefix}ExtraError>;`),
  );
  writer.writeLine("}").blankLine();
  writeDoc(writer, `Context service exposing the ${display} request runner.`);
  writer.writeLine(`export class ${prefix}Client extends Context.Service<`);
  writer.indent(() => {
    writer.writeLine(`${prefix}Client,`);
    writer.writeLine(`${prefix}ClientShape`);
  });
  writer
    .writeLine(`>()(${stringLiteral(ir.serviceTags.client)}) {}`)
    .blankLine();
  writer.writeLine("/** Options for building the client layer. */");
  writer.writeLine(`export interface ${prefix}ClientOptions {`);
  writer.indent(() => {
    writer.writeLine(
      "/** Retry policy applied to every call. Defaults to core's transient policy. */",
    );
    writer.writeLine("readonly retry?: Retry.RetryPolicy;");
  });
  writer.writeLine("}").blankLine();
  writeDoc(
    writer,
    `Client layer over an injected \`HttpClient\` + {@link Credentials}. Use this\nwhen you want to supply your own transport (e.g. a mock in tests) or a custom\nretry policy.`,
  );
  writer.writeLine(
    `export const layerWith = (options: ${prefix}ClientOptions = {}): Layer.Layer<`,
  );
  writer.indent(() => {
    writer.writeLine(`${prefix}Client,`);
    writer.writeLine("never,");
    writer.writeLine("HttpClient | Credentials");
  });
  writer.writeLine("> =>");
  writer.indent(() => {
    writer.writeLine("Layer.effect(");
    writer.indent(() => {
      writer.writeLine(`${prefix}Client,`);
      writer.writeLine("Effect.gen(function* () {");
      writer.indent(() => {
        writer.writeLine("const http = yield* HttpClient;");
        writer.writeLine("const { apiKey, baseUrl } = yield* Credentials;");
        writer.writeLine(`const run = makeRunner<${prefix}ExtraError>({`);
        writer.indent(() => {
          writer.writeLine("http,");
          writer.writeLine("apiKey,");
          writer.writeLine("baseUrl,");
          writer.writeLine("retry: options.retry ?? Retry.defaultPolicy,");
          writer.writeLine("matchError,");
          writer.writeLine("toTransport: adapters.toTransport,");
          writer.writeLine("toDecode: adapters.toDecode,");
        });
        writer.writeLine("});");
        writer.writeLine(`return ${prefix}Client.of({ run });`);
      });
      writer.writeLine("}),");
    });
    writer.writeLine(");");
  });
  writer.blankLine();
  writer.writeLine(
    "/** Client layer with the default retry policy, over injected deps. */",
  );
  writer.writeLine(
    `export const layer: Layer.Layer<${prefix}Client, never, HttpClient | Credentials> =`,
  );
  writer.indent(() => writer.writeLine("layerWith();"));
  writer.blankLine();
  writeDoc(
    writer,
    "Batteries-included layer: the default retry policy, `fetch` transport, and\ncredentials from the environment. The one line most consumers provide.",
  );
  writer.writeLine("export const layerFromEnv = layer.pipe(");
  writer.indent(() => {
    writer.writeLine("Layer.provide(FetchHttpClient.layer),");
    writer.writeLine("Layer.provide(credentialsFromEnv),");
  });
  writer.writeLine(");").blankLine();
  writer
    .writeLine(section("Dispatch helper used by every generated operation"))
    .blankLine();
  writer.writeLine(
    "/** Dispatch a declared operation through the client service. */",
  );
  writer.writeLine("export const run = <");
  writer.indent(() => {
    writer.writeLine("IS extends InputSchema,");
    writer.writeLine("OS extends OutputSchema,");
    writer.writeLine("EC extends readonly ClassifiedErrorClass[],");
  });
  writer.writeLine(">(");
  writer.indent(() => {
    writer.writeLine("op: Operation<IS, OS, EC>,");
    writer.writeLine('input: IS["Type"],');
  });
  writer.writeLine(
    `): Effect.Effect<OS["Type"], ${prefix}Error<EC>, ${prefix}Client> =>`,
  );
  writer.indent(() =>
    writer.writeLine(
      `Effect.flatMap(${prefix}Client, (client) => client.run(op, input));`,
    ),
  );
  return emitted("src/client.ts", finishWriter(writer));
};
