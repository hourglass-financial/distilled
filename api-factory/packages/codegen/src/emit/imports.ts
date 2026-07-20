import { codeUnitCompare, stringLiteral } from "./shared.ts";

export interface ImportOptions {
  readonly typeOnly?: boolean;
  readonly alias?: string;
  readonly namespace?: boolean;
}

interface NamedImport {
  readonly symbol: string;
  readonly alias?: string;
  readonly typeOnly: boolean;
}

interface NamespaceImport {
  readonly alias: string;
  readonly typeOnly: boolean;
}

interface ModuleImports {
  readonly named: Map<string, NamedImport>;
  namespace?: NamespaceImport;
}

export class ImportCollector {
  readonly #modules = new Map<string, ModuleImports>();

  use(module: string, symbol: string, options: ImportOptions = {}): string {
    const imports: ModuleImports = this.#modules.get(module) ?? {
      named: new Map(),
    };
    this.#modules.set(module, imports);
    if (options.namespace === true) {
      const alias = options.alias ?? symbol;
      imports.namespace = { alias, typeOnly: options.typeOnly ?? false };
      return alias;
    }
    const alias = options.alias;
    const key = `${symbol}\u0000${alias ?? ""}`;
    const existing = imports.named.get(key);
    imports.named.set(key, {
      symbol,
      ...(alias === undefined ? {} : { alias }),
      typeOnly: (existing?.typeOnly ?? true) && (options.typeOnly ?? false),
    });
    return alias ?? symbol;
  }

  render(): string {
    const statements: string[] = [];
    const modules = [...this.#modules.entries()].sort(
      ([leftModule], [rightModule]) => {
        const leftRelative = leftModule.startsWith(".");
        const rightRelative = rightModule.startsWith(".");
        if (leftRelative !== rightRelative) return leftRelative ? 1 : -1;
        return codeUnitCompare(leftModule, rightModule);
      },
    );
    for (const [module, imports] of modules) {
      if (imports.namespace !== undefined) {
        const prefix = imports.namespace.typeOnly ? "import type" : "import";
        statements.push(
          `${prefix} * as ${imports.namespace.alias} from ${stringLiteral(module)};`,
        );
      }
      const named = [...imports.named.values()].sort((left, right) => {
        const folded = codeUnitCompare(
          left.symbol.toLowerCase(),
          right.symbol.toLowerCase(),
        );
        if (folded !== 0) return folded;
        const exact = codeUnitCompare(left.symbol, right.symbol);
        if (exact !== 0) return exact;
        return codeUnitCompare(left.alias ?? "", right.alias ?? "");
      });
      if (named.length === 0) continue;
      const allTypeOnly = named.every((entry) => entry.typeOnly);
      const specifiers = named.map((entry) => {
        const renamed =
          entry.alias === undefined
            ? entry.symbol
            : `${entry.symbol} as ${entry.alias}`;
        return !allTypeOnly && entry.typeOnly ? `type ${renamed}` : renamed;
      });
      statements.push(
        `import${allTypeOnly ? " type" : ""} { ${specifiers.join(", ")} } from ${stringLiteral(module)};`,
      );
    }
    return statements.join("\n");
  }
}
