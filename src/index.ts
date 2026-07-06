import fs from "node:fs";
import os from "node:os";

function fileContains(filePath: string, str: string): boolean {
  try {
    return fs.readFileSync(filePath, "utf8").toLowerCase().includes(str);
  } catch {
    return false;
  }
}

let docker: boolean | undefined,
  container: boolean | undefined,
  wsl: boolean | undefined;

function isDocker(): boolean {
  return (docker ??=
    fs.existsSync("/.dockerenv") ||
    fileContains("/proc/self/cgroup", "docker") ||
    fileContains("/proc/self/mountinfo", "/docker/containers/"));
}

function isInsideContainer(): boolean {
  return (container ??= fs.existsSync("/run/.containerenv") || isDocker());
}

function isWsl(): boolean {
  if (process.platform !== "linux") {
    return false;
  }

  return (wsl ??=
    (os.release().toLowerCase().includes("microsoft") ||
      fileContains("/proc/version", "microsoft") ||
      fs.existsSync("/proc/sys/fs/binfmt_misc/WSLInterop") ||
      fs.existsSync("/run/WSL")) &&
    !isInsideContainer());
}

export { isDocker, isInsideContainer, isWsl };
