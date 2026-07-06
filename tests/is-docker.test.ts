import assert from "node:assert/strict";
import { test, afterEach, mock, describe } from "node:test";

import { importFresh } from "./shared.ts";

afterEach(() => {
  mock.restoreAll();
});

await describe("isDocker", () => {
  void test("detects Docker via /.dockerenv", async () => {
    mock.module("node:fs", {
      exports: {
        existsSync: (path: string) => path === "/.dockerenv",
        readFileSync: () => {
          throw new Error("ENOENT");
        },
      },
    });

    const { isDocker } = await importFresh();
    assert.equal(isDocker(), true);
  });

  void test("detects Docker via /proc/self/cgroup", async () => {
    mock.module("node:fs", {
      exports: {
        existsSync: () => false,
        readFileSync: (path: string) => {
          if (path === "/proc/self/cgroup") {
            return "xxx docker yyyy";
          }
          throw new Error("ENOENT");
        },
      },
    });

    const { isDocker } = await importFresh();
    assert.equal(isDocker(), true);
  });

  void test("detects Docker via /proc/self/mountinfo", async () => {
    mock.module("node:fs", {
      exports: {
        existsSync: () => false,
        readFileSync: (path: string) => {
          if (path === "/proc/self/mountinfo") {
            return "1234 24 0:6 /docker/containers/abc123/hostname /etc/hostname rw,nosuid";
          }
          if (path === "/proc/self/cgroup") {
            return "0::/";
          }
          throw new Error("ENOENT");
        },
      },
    });

    const { isDocker } = await importFresh();
    assert.equal(isDocker(), true);
  });

  void test("not inside Docker container", async () => {
    mock.module("node:fs", {
      exports: {
        existsSync: () => false,
        readFileSync: () => {
          throw new Error("ENOENT");
        },
      },
    });

    const { isDocker } = await importFresh();
    assert.equal(isDocker(), false);
  });

  void test("caching works correctly", async () => {
    let existsSyncCallCount = 0;
    let readFileSyncCallCount = 0;

    mock.module("node:fs", {
      exports: {
        existsSync: () => {
          existsSyncCallCount++;
          return false;
        },
        readFileSync: (path: string) => {
          readFileSyncCallCount++;
          if (path === "/proc/self/cgroup") {
            return "xxx docker yyyy";
          }
          throw new Error("ENOENT");
        },
      },
    });

    const { isDocker } = await importFresh();

    // First call - executes logic
    assert.equal(isDocker(), true);
    assert.equal(existsSyncCallCount, 1);
    assert.equal(readFileSyncCallCount, 1);

    // Second call - should use the internal `docker` state cache variable
    assert.equal(isDocker(), true);
    assert.equal(existsSyncCallCount, 1);
    assert.equal(readFileSyncCallCount, 1);
  });
});
