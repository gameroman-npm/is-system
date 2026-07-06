import fs from "node:fs";
import os from "node:os";

function procContains(proc: string, str: string): boolean {
  try {
    return fs.readFileSync(`/proc/${proc}`, "utf8").toLowerCase().includes(str);
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
    procContains("self/cgroup", "docker") ||
    procContains("self/mountinfo", "/docker/containers/"));
}

function isInsideContainer(): boolean {
  return (container ??= fs.existsSync("/run/.containerenv") || isDocker());
}

function isWsl(): boolean {
  return (wsl ??=
    process.platform === "linux" &&
    (os.release().toLowerCase().includes("microsoft") ||
      procContains("version", "microsoft") ||
      fs.existsSync("/proc/sys/fs/binfmt_misc/WSLInterop") ||
      fs.existsSync("/run/WSL")) &&
    !isInsideContainer());
}

export { isDocker, isInsideContainer, isWsl };
