/**
 * Cursor pagination — the WorkOS `list_metadata.before/after` style, exposed as
 * both a `Stream` of pages and a `Stream` of items.
 *
 * Built on `Stream.paginate` (the verified v4 primitive): the seed is the
 * current cursor, and the step effect fetches one page, emits its contents, and
 * yields the next cursor while one exists. Unlike v1's `getPath`/string-path
 * traversal, the page→cursor and page→items projections are ordinary typed
 * accessor functions the caller supplies, so there is no stringly-typed field
 * lookup and no `any`.
 */
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Stream from "effect/Stream";

/**
 * Describes how to walk a cursor-paginated list.
 *
 * @typeParam I - the operation input; `cursorParam` is one of its keys.
 * @typeParam Page - the single-page response.
 * @typeParam Item - one element of a page.
 */
export interface CursorPagination<I, Page, Item> {
  /** Input field that carries the forward cursor (WorkOS: `"after"`). */
  readonly cursorParam: keyof I & string;
  /**
   * Input fields to drop once the walk advances past the first page — the
   * opposing-direction cursor (WorkOS: `["before"]`). A caller-supplied
   * `before` scopes the *first* request; carrying it into subsequent requests
   * alongside the forward cursor would send both directions at once.
   */
  readonly clear?: ReadonlyArray<keyof I & string>;
  /** The next-page cursor, or null/undefined at the end of the list. */
  readonly nextCursor: (page: Page) => string | null | undefined;
  /** The items contained in a page. */
  readonly items: (page: Page) => ReadonlyArray<Item>;
}

const withCursor = <I, Page, Item>(
  input: I,
  config: CursorPagination<I, Page, Item>,
  cursor: string,
): I => {
  const next: Record<string, unknown> = {
    ...(input as Record<string, unknown>),
    [config.cursorParam]: cursor,
  };
  for (const param of config.clear ?? []) delete next[param];
  return next as I;
};

// The paginate state is simply the next request: the seed is the caller's
// input verbatim, and each step yields the following request (or ends the
// walk). Every subsequent request is rebuilt from the caller's ORIGINAL
// input — cursor substituted, `clear` params dropped — so pagination
// parameters can never drift between pages, whatever `fetchPage` does.
const step =
  <I, Page, Item, E, R, T>(
    fetchPage: (input: I) => Effect.Effect<Page, E, R>,
    input: I,
    config: CursorPagination<I, Page, Item>,
    project: (page: Page) => ReadonlyArray<T>,
  ) =>
  (
    request: I,
  ): Effect.Effect<readonly [ReadonlyArray<T>, Option.Option<I>], E, R> =>
    Effect.map(fetchPage(request), (page) => {
      const next = config.nextCursor(page);
      return [
        project(page),
        next === null || next === undefined
          ? Option.none<I>()
          : Option.some(withCursor(input, config, next)),
      ] as const;
    });

/**
 * Stream every page of a cursor-paginated list. The first request sends
 * `input` exactly as given (including any caller-supplied cursor, in either
 * direction); from the second page on, the forward cursor is substituted and
 * the `clear` params are dropped.
 */
export const pages = <I, Page, Item, E, R>(
  fetchPage: (input: I) => Effect.Effect<Page, E, R>,
  input: I,
  config: CursorPagination<I, Page, Item>,
): Stream.Stream<Page, E, R> =>
  Stream.paginate(
    input,
    step(fetchPage, input, config, (page) => [page]),
  );

/**
 * Stream every item across every page of a cursor-paginated list — the common
 * "give me all of them" consumer path. First-request semantics match
 * {@link pages}.
 */
export const items = <I, Page, Item, E, R>(
  fetchPage: (input: I) => Effect.Effect<Page, E, R>,
  input: I,
  config: CursorPagination<I, Page, Item>,
): Stream.Stream<Item, E, R> =>
  Stream.paginate(input, step(fetchPage, input, config, config.items));
