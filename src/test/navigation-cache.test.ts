import { describe, expect, it, vi } from "vitest";
import { getRouter } from "@/router";

describe("Navigation query cache", () => {
  it("reuses freshly loaded page data on a return visit", async () => {
    const client = getRouter().options.context.queryClient;
    const queryFn = vi.fn().mockResolvedValue([{ id: "worker-1" }]);
    const options = { queryKey: ["workers", "cache-test"], queryFn };
    await client.fetchQuery(options);
    await client.fetchQuery(options);
    expect(queryFn).toHaveBeenCalledTimes(1);
    client.clear();
  });

  it("refetches page data when explicitly invalidated", async () => {
    const client = getRouter().options.context.queryClient;
    const queryFn = vi.fn().mockResolvedValue([]);
    const options = { queryKey: ["workers", "invalidation-test"], queryFn };
    await client.fetchQuery(options);
    await client.invalidateQueries({ queryKey: options.queryKey });
    await client.fetchQuery(options);
    expect(queryFn).toHaveBeenCalledTimes(2);
    client.clear();
  });
});