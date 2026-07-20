import type { ClientIr, DependencyIr, TsconfigIr } from "../ir/model.ts";
import { emitted, type EmittedFile } from "./shared.ts";

const dependencyMap = (
  dependencies: ReadonlyArray<DependencyIr>,
): Record<string, string> =>
  Object.fromEntries(dependencies.map(({ name, version }) => [name, version]));

const tsconfigJson = (config: TsconfigIr): string =>
  `${JSON.stringify(
    {
      extends: config.extends,
      include: config.include,
      compilerOptions: {
        ...(config.compilerOptions.outDir === undefined
          ? {}
          : { outDir: config.compilerOptions.outDir }),
        rootDir: config.compilerOptions.rootDir,
        ...(config.compilerOptions.noEmit === undefined
          ? {}
          : { noEmit: config.compilerOptions.noEmit }),
        ...(config.compilerOptions.paths === undefined
          ? {}
          : {
              paths: Object.fromEntries(
                config.compilerOptions.paths.map(({ alias, targets }) => [
                  alias,
                  targets,
                ]),
              ),
            }),
      },
      ...(config.references.length === 0
        ? {}
        : {
            references: config.references.map((path) => ({ path })),
          }),
    },
    null,
    2,
  )}\n`;

export const emitScaffold = (ir: ClientIr): ReadonlyArray<EmittedFile> => {
  const scaffold = ir.scaffold;
  const files = scaffold.files.includes("MANIFEST")
    ? scaffold.files
    : [...scaffold.files, "MANIFEST"];
  const packageJson = `${JSON.stringify(
    {
      name: ir.packageName,
      version: scaffold.version,
      private: scaffold.private,
      repository: scaffold.repository,
      type: scaffold.type,
      sideEffects: scaffold.sideEffects,
      module: scaffold.module,
      files,
      exports: { ".": scaffold.exports },
      scripts: scaffold.scripts,
      dependencies: dependencyMap(scaffold.dependencies),
      peerDependencies: dependencyMap(scaffold.peerDependencies),
      devDependencies: dependencyMap(scaffold.devDependencies),
    },
    null,
    2,
  )}\n`;
  return [
    emitted("package.json", packageJson),
    emitted("tsconfig.json", tsconfigJson(scaffold.tsconfig)),
    emitted("tsconfig.test.json", tsconfigJson(scaffold.testTsconfig)),
  ];
};
