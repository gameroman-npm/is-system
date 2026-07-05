import fs from "node:fs";
import os from "node:os";

import { fileContains } from "./is-docker";
import { isInsideContainer } from "./is-inside-container";

function isWsl(): boolean {
  if (process.platform !== "linux") {
    return false;
  }

  if (os.release().toLowerCase().includes("microsoft")) {
    return !isInsideContainer();
  }

  if (fileContains("/proc/version", "microsoft")) {
    return !isInsideContainer();
  }

  if (
    fs.existsSync("/proc/sys/fs/binfmt_misc/WSLInterop") ||
    fs.existsSync("/run/WSL")
  ) {
    return !isInsideContainer();
  }

  return false;
}

export { isWsl };
