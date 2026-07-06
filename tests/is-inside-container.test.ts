import assert from "node:assert/strict";
import { test, afterEach, mock, describe } from "node:test";

import { importFresh } from "./shared.ts";

afterEach(() => {
  mock.restoreAll();
});

await describe("isInsideContainer", () => {
  void test("inside a container", async () => {
    mock.module("node:fs", {
      exports: {
        existsSync: (path: string) => path === "/run/.containerenv",
      },
    });

    const { isInsideContainer } = await importFresh();
    assert.ok(isInsideContainer());
  });
});
