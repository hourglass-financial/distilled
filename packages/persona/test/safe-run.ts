import type * as Effect from "effect/Effect";
import { runEffect } from "./setup.ts";

export interface SafeFailure {
  readonly tag: string;
  readonly path?: string;
  readonly message: string;
}

const record = (value: unknown): Record<string, unknown> | undefined =>
  value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)
    : undefined;

const structuralPath = (error: unknown): string | undefined => {
  const root = record(error);
  const issue = record(root?.issue);
  const rawPath = issue?.path ?? root?.path;
  if (Array.isArray(rawPath)) {
    return rawPath
      .map((part) =>
        typeof part === "string" || typeof part === "number"
          ? String(part)
          : "?",
      )
      .join(".");
  }
  return typeof rawPath === "string" ? rawPath : undefined;
};

export const sanitizeFailure = (error: unknown): SafeFailure => {
  const object = record(error);
  const tag = typeof object?._tag === "string" ? object._tag : "UnknownError";
  const path = structuralPath(error);
  return {
    tag,
    ...(path ? { path } : {}),
    message: path ? `${tag} at ${path}` : tag,
  };
};

export class SafeApiError extends Error {
  readonly _tag: string;
  readonly path?: string;

  constructor(failure: SafeFailure) {
    super(failure.message);
    this.name = "SafeApiError";
    this._tag = failure.tag;
    this.path = failure.path;
  }
}

export const runLiveEffect = async <A, E, R>(
  effect: Effect.Effect<A, E, R>,
): Promise<A> => {
  try {
    return await runEffect(effect);
  } catch (error) {
    throw new SafeApiError(sanitizeFailure(error));
  }
};

export const runFailure = async <A, E, R>(
  effect: Effect.Effect<A, E, R>,
): Promise<SafeFailure> => {
  try {
    await runEffect(effect);
    throw new Error("Expected the Persona operation to fail");
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Expected the")) {
      throw error;
    }
    return sanitizeFailure(error);
  }
};

export type Cleanup = () => Promise<void>;

export class CleanupStack {
  readonly #entries: Array<{
    readonly label: string;
    readonly cleanup: Cleanup;
  }> = [];

  add(label: string, cleanup: Cleanup): void {
    this.#entries.push({ label, cleanup });
  }

  async run(): Promise<void> {
    const failures: Error[] = [];
    for (const entry of this.#entries.reverse()) {
      try {
        await entry.cleanup();
      } catch {
        failures.push(new Error(`Cleanup failed: ${entry.label}`));
      }
    }
    this.#entries.length = 0;
    if (failures.length > 0) {
      throw new AggregateError(failures, "Persona live-test cleanup failed");
    }
  }
}

export const withCleanup = async <A>(
  body: (cleanup: CleanupStack) => Promise<A>,
): Promise<A> => {
  const cleanup = new CleanupStack();
  let primaryFailure: unknown;
  try {
    return await body(cleanup);
  } catch (error) {
    primaryFailure = error;
    throw error;
  } finally {
    try {
      await cleanup.run();
    } catch (cleanupFailure) {
      if (primaryFailure !== undefined) {
        throw new AggregateError(
          [primaryFailure, cleanupFailure],
          "Persona test and cleanup both failed",
        );
      }
      throw cleanupFailure;
    }
  }
};
