import { describe, expect, it } from "vitest";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import * as Pagination from "../src/pagination.ts";

interface Input {
  readonly after?: string;
}
interface Page {
  readonly data: ReadonlyArray<{ readonly id: string }>;
  readonly list_metadata: { readonly after: string | null };
}

const config: Pagination.CursorPagination<Input, Page, { id: string }> = {
  cursorParam: "after",
  nextCursor: (page) => page.list_metadata.after,
  items: (page) => page.data,
};

const makeFetch = () => {
  const calls: Array<Input> = [];
  const fetchPage = (input: Input): Effect.Effect<Page> => {
    calls.push(input);
    if (input.after === undefined) {
      return Effect.succeed({
        data: [{ id: "a" }, { id: "b" }],
        list_metadata: { after: "cur1" },
      });
    }
    if (input.after === "cur1") {
      return Effect.succeed({
        data: [{ id: "c" }],
        list_metadata: { after: null },
      });
    }
    return Effect.die(new Error(`unexpected cursor ${input.after}`));
  };
  return { fetchPage, calls };
};

describe("cursor pagination", () => {
  it("streams every item across pages, following the cursor", async () => {
    const { fetchPage, calls } = makeFetch();
    const items = await Effect.runPromise(
      Stream.runCollect(Pagination.items(fetchPage, {}, config)),
    );
    expect(items.map((i) => i.id)).toEqual(["a", "b", "c"]);
    // Two fetches: the seed page, then one follow-up with the cursor.
    expect(calls).toEqual([{}, { after: "cur1" }]);
  });

  it("streams whole pages and terminates when the cursor is null", async () => {
    const { fetchPage } = makeFetch();
    const pages = await Effect.runPromise(
      Stream.runCollect(Pagination.pages(fetchPage, {}, config)),
    );
    expect(pages.length).toBe(2);
    expect(pages[0]?.list_metadata.after).toBe("cur1");
    expect(pages[1]?.list_metadata.after).toBeNull();
  });

  it("resumes from an initial cursor already on the input", async () => {
    const { fetchPage, calls } = makeFetch();
    const items = await Effect.runPromise(
      Stream.runCollect(Pagination.items(fetchPage, { after: "cur1" }, config)),
    );
    expect(items.map((i) => i.id)).toEqual(["c"]);
    expect(calls).toEqual([{ after: "cur1" }]);
  });
});
