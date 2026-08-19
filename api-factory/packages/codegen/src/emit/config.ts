import type { ClientIr } from "../ir/model.ts";
import { ImportCollector } from "./imports.ts";
import {
  banner,
  CORE_PACKAGE,
  createWriter,
  emitted,
  type EmittedFile,
  finishWriter,
  stringLiteral,
  writeDoc,
} from "./shared.ts";

export const emitConfig = (ir: ClientIr): EmittedFile => {
  const imports = new ImportCollector();
  imports.use(CORE_PACKAGE, "ConfigError");
  imports.use(CORE_PACKAGE, "credentialsConfig");
  imports.use(CORE_PACKAGE, "credentialsFromEnvEffect");
  imports.use("effect/Config", "Config", { namespace: true, typeOnly: true });
  imports.use("effect/Context", "Context", { namespace: true });
  imports.use("effect/Effect", "Effect", { namespace: true });
  imports.use("effect/Layer", "Layer", { namespace: true });
  imports.use("effect/Redacted", "Redacted", {
    namespace: true,
    typeOnly: true,
  });

  const { display, prefix } = ir.vendor;
  const writer = createWriter();
  writer.writeLine(
    banner([
      "auth scheme / base URL / env var names → the generator's vendor profile",
      `credentials assembly → ${CORE_PACKAGE}`,
    ]),
  );
  writer.writeLine(imports.render()).blankLine();
  writeDoc(
    writer,
    `${display} production API base URL. Override with \`${ir.envVars.baseUrl}\`.`,
  );
  writer
    .writeLine(`export const DEFAULT_BASE_URL = ${stringLiteral(ir.baseUrl)};`)
    .blankLine();
  writeDoc(
    writer,
    `Resolved ${display} credentials. The API key stays \`Redacted\` end to end.`,
  );
  writer.writeLine(`export interface ${prefix}Config {`);
  writer.indent(() => {
    writer.writeLine("readonly apiKey: Redacted.Redacted<string>;");
    writer.writeLine("readonly baseUrl: string;");
  });
  writer.writeLine("}").blankLine();
  writer.writeLine(
    `/** Context service carrying the resolved ${display} credentials. */`,
  );
  writer.writeLine(
    `export class Credentials extends Context.Service<Credentials, ${prefix}Config>()(`,
  );
  writer.indent(() =>
    writer.writeLine(`${stringLiteral(ir.serviceTags.credentials)},`),
  );
  writer.writeLine(") {}").blankLine();
  writeDoc(
    writer,
    `Reads \`${ir.envVars.apiKey}\` (redacted) and optional \`${ir.envVars.baseUrl}\` from env.`,
  );
  writer.writeLine(
    `export const config: Config.Config<${prefix}Config> = credentialsConfig({`,
  );
  writer.indent(() => {
    writer.writeLine(`apiKeyVar: ${stringLiteral(ir.envVars.apiKey)},`);
    writer.writeLine(`baseUrlVar: ${stringLiteral(ir.envVars.baseUrl)},`);
    writer.writeLine("defaultBaseUrl: DEFAULT_BASE_URL,");
  });
  writer.writeLine("});").blankLine();
  writeDoc(
    writer,
    `Credentials from the environment. Fails with a typed {@link ConfigError} when\n\`${ir.envVars.apiKey}\` is absent — the caller learns exactly what is missing rather\nthan getting an opaque defect.`,
  );
  writer.writeLine(
    "export const credentialsFromEnv: Layer.Layer<Credentials, ConfigError> =",
  );
  writer.indent(() => {
    writer.writeLine("Layer.effect(");
    writer.indent(() => {
      writer.writeLine("Credentials,");
      writer.writeLine("credentialsFromEnvEffect(");
      writer.indent(() => {
        writer.writeLine("{");
        writer.indent(() => {
          writer.writeLine(`apiKeyVar: ${stringLiteral(ir.envVars.apiKey)},`);
          writer.writeLine(`baseUrlVar: ${stringLiteral(ir.envVars.baseUrl)},`);
          writer.writeLine("defaultBaseUrl: DEFAULT_BASE_URL,");
        });
        writer.writeLine("},");
        writer.writeLine(`${stringLiteral(ir.configErrorMessage)},`);
      });
      writer.writeLine(").pipe(Effect.map(Credentials.of)),");
    });
    writer.writeLine(");");
  });
  writer.blankLine();
  writer.writeLine(
    "/** Credentials from explicit values — useful for tests and multi-tenant hosts. */",
  );
  writer.writeLine(
    `export const credentialsOf = (values: ${prefix}Config): Layer.Layer<Credentials> =>`,
  );
  writer.indent(() =>
    writer.writeLine("Layer.succeed(Credentials, Credentials.of(values));"),
  );
  return emitted("src/config.ts", finishWriter(writer));
};
