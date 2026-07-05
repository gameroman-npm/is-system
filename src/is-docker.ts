import fs from "node:fs";

function fileContains(filePath: string, str: string): boolean {
  try {
    return fs.readFileSync(filePath, "utf8").toLowerCase().includes(str);
  } catch {
    return false;
  }
}

let result: boolean | undefined;
function isDocker(): boolean {
  result ??=
    fs.existsSync("/.dockerenv") ||
    fileContains("/proc/self/cgroup", "docker") ||
    fileContains("/proc/self/mountinfo", "/docker/containers/");
  return result;
}

export { isDocker, fileContains };
