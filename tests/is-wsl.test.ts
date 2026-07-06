import assert from "node:assert/strict";
import process from "node:process";
import { test, beforeEach, afterEach, mock, describe } from "node:test";

import { importFresh } from "./shared.ts";

let originalPlatform: NodeJS.Platform;

beforeEach(() => {
  originalPlatform = process.platform;
});

afterEach(() => {
  mock.restoreAll();
  Object.defineProperty(process, "platform", { value: originalPlatform });
});

await describe("isWsl", () => {
  void test("inside WSL 1", async () => {
    Object.defineProperty(process, "platform", { value: "linux" });

    mock.module("node:fs", {
      exports: {
        readFileSync: () =>
          "Linux version 3.4.0-Microsoft (Microsoft@Microsoft.com) (gcc version 4.7 (GCC) ) #1 SMP PREEMPT Wed Dec 31 14:42:53 PST 2014",
        existsSync: () => false,
      },
    });

    const { isWsl } = await importFresh();
    assert.ok(isWsl());
  });

  void test("inside WSL 2", async () => {
    Object.defineProperty(process, "platform", { value: "linux" });

    mock.module("node:fs", {
      exports: {
        readFileSync: () =>
          "Linux version 4.19.43-microsoft-standard (oe-user@oe-host) (gcc version 7.3.0 (GCC)) #1 SMP Mon May 20 19:35:22 UTC 2019",
        existsSync: () => false,
      },
    });

    const { isWsl } = await importFresh();
    assert.ok(isWsl());
  });

  void test("not inside WSL", async () => {
    Object.defineProperty(process, "platform", { value: "darwin" });

    const { isWsl } = await importFresh();
    assert.equal(isWsl(), false);
  });

  void test("not inside WSL, but inside Linux", async () => {
    Object.defineProperty(process, "platform", { value: "linux" });

    mock.module("node:fs", {
      exports: {
        readFileSync: () =>
          "Linux version 4.19.43-standard (oe-user@oe-host) (gcc version 7.3.0 (GCC)) #1 SMP Mon May 20 19:35:22 UTC 2019",
        existsSync: () => false,
      },
    });
    mock.module("node:os", {
      exports: {
        release: () => "",
      },
    });

    const { isWsl } = await importFresh();
    assert.equal(isWsl(), false);
  });

  void test("inside WSL 2 with custom kernel", async () => {
    Object.defineProperty(process, "platform", { value: "linux" });

    mock.module("node:fs", {
      exports: {
        readFileSync: () =>
          "Linux version 6.1.0-custom (user@host) (gcc version 12.2.0) #1 SMP PREEMPT_DYNAMIC Mon Jan 1 00:00:00 UTC 2024",
        existsSync: (path: string) =>
          path === "/proc/sys/fs/binfmt_misc/WSLInterop",
      },
    });
    mock.module("node:os", {
      exports: {
        release: () => "6.1.0-custom",
      },
    });

    const { isWsl } = await importFresh();
    assert.ok(isWsl());
  });

  void test("inside WSL 2 with custom kernel detected via /run/WSL", async () => {
    Object.defineProperty(process, "platform", { value: "linux" });

    mock.module("node:fs", {
      exports: {
        readFileSync: () =>
          "Linux version 6.1.0-custom (user@host) (gcc version 12.2.0) #1 SMP PREEMPT_DYNAMIC Mon Jan 1 00:00:00 UTC 2024",
        existsSync: (path: string) => path === "/run/WSL",
      },
    });
    mock.module("node:os", {
      exports: {
        release: () => "6.1.0-custom",
      },
    });

    const { isWsl } = await importFresh();
    assert.ok(isWsl());
  });

  void test("inside WSL, but inside container", async () => {
    Object.defineProperty(process, "platform", { value: "linux" });

    mock.module("node:fs", {
      exports: {
        readFileSync: () =>
          "Linux version 4.19.43-microsoft-standard (oe-user@oe-host) (gcc version 7.3.0 (GCC)) #1 SMP Mon May 20 19:35:22 UTC 2019",
        existsSync: (path: string) => path === "/run/.containerenv",
      },
    });
    mock.module("node:os", {
      exports: {
        release: () => "microsoft",
      },
    });

    const { isWsl } = await importFresh();
    assert.equal(isWsl(), false);
  });
});
