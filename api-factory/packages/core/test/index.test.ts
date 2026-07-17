import { describe, expect, it } from "vitest";
import * as Core from "../src/index.ts";

describe("core barrel", () => {
  it("exposes the machinery a generated client imports", () => {
    expect(typeof Core.makeRunner).toBe("function");
    expect(typeof Core.makeMatchError).toBe("function");
    expect(typeof Core.planRequest).toBe("function");
    expect(typeof Core.isVoidOutput).toBe("function");
    expect(Core.Secret).toBeDefined();
    expect(Core.DEFAULT_ERRORS.length).toBeGreaterThan(0);
    expect(Core.STATUS_ERRORS[404]).toBe(Core.NotFound);
    expect(Core.RETRYABLE_STATUSES.has(429)).toBe(true);
    expect(typeof Core.Retry.defaultPolicy.while).toBe("function");
    expect(typeof Core.Pagination.items).toBe("function");
    expect(typeof Core.Category.isTransient).toBe("function");
  });

  it("plans a GET: path substitution, scalar + comma-joined array query, no body", () => {
    const plan = Core.planRequest(
      {
        method: "GET",
        pathTemplate: "/organizations/{id}",
        pathParams: ["id"],
        queryParams: ["limit", "domains"],
      },
      { id: "org_123", limit: 50, domains: ["a.com", "b.com"] },
    );
    expect(plan.path).toBe("/organizations/org_123");
    expect(plan.query).toEqual({ limit: "50", domains: "a.com,b.com" });
    expect(plan.body).toBeUndefined();
  });

  it("plans a write: merges constantBody and keeps body arrays intact", () => {
    const plan = Core.planRequest(
      {
        method: "POST",
        pathTemplate: "/organizations",
        pathParams: [],
        queryParams: [],
        constantBody: { grant_type: "password" },
      },
      { name: "Acme", domains: ["a.com", "b.com"] },
    );
    expect(plan.body).toEqual({
      grant_type: "password",
      name: "Acme",
      domains: ["a.com", "b.com"],
    });
  });
});
