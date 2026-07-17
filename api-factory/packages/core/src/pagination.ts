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

const step =
  <I, Page, Item, E, R, T>(
    fetchPage: (input: I) => Effect.Effect<Page, E, R>,
    input: I,
    config: CursorPagination<I, Page, Item>,
    project: (page: Page) => ReadonlyArray<T>,
  ) =>
  (
    cursor: Option.Option<string>,
  ): Effect.Effect<
    readonly [ReadonlyArray<T>, Option.Option<Option.Option<string>>],
    E,
    R
  > =>
    Effect.map(
      fetchPage(
        Option.isSome(cursor) ? withCursor(input, config, cursor.value) : input,
      ),
      (page) => {
        const next = config.nextCursor(page);
        const nextState =
          next === null || next === undefined
            ? Option.none<Option.Option<string>>()
            : Option.some(Option.some(next));
        return [project(page), nextState] as const;
      },
    );

/**
 * Stream every page of a cursor-paginated list, starting from an optional
 * initial cursor already present on `input`.
 */
export const pages = <I, Page, Item, E, R>(
  fetchPage: (input: I) => Effect.Effect<Page, E, R>,
  input: I,
  config: CursorPagination<I, Page, Item>,
): Stream.Stream<Page, E, R> =>
  Stream.paginate(
    initialCursor(input, config.cursorParam),
    step(fetchPage, input, config, (page) => [page]),
  );

/**
 * Stream every item across every page of a cursor-paginated list — the common
 * "give me all of them" consumer path.
 */
export const items = <I, Page, Item, E, R>(
  fetchPage: (input: I) => Effect.Effect<Page, E, R>,
  input: I,
  config: CursorPagination<I, Page, Item>,
): Stream.Stream<Item, E, R> =>
  Stream.paginate(
    initialCursor(input, config.cursorParam),
    step(fetchPage, input, config, config.items),
  );

const initialCursor = <I>(
  input: I,
  cursorParam: keyof I & string,
): Option.Option<string> => {
  const value = (input as Record<string, unknown>)[cursorParam];
  return typeof value === "string" ? Option.some(value) : Option.none();
};
