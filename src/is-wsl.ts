import fs from "node:fs";
import os from "node:os";
import process from "node:process";

import { isInsideContainer } from "./is-inside-container";

function isWsl(): boolean {
  if (process.platform !== "linux") {
    return false;
  }

  if (os.release().toLowerCase().includes("microsoft")) {
    return !isInsideContainer();
  }

  try {
    if (
      fs
        .readFileSync("/proc/version", "utf8")
        .toLowerCase()
        .includes("microsoft")
    ) {
      return !isInsideContainer();
    }
  } catch {}

  if (
    fs.existsSync("/proc/sys/fs/binfmt_misc/WSLInterop") ||
    fs.existsSync("/run/WSL")
  ) {
    return !isInsideContainer();
  }

  return false;
}

export { isWsl };
