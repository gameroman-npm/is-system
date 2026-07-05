import fs from "node:fs";

function hasDockerEnv() {
  try {
    fs.statSync("/.dockerenv");
    return true;
  } catch {
    return false;
  }
}

function hasDockerCGroup() {
  try {
    return fs.readFileSync("/proc/self/cgroup", "utf8").includes("docker");
  } catch {
    return false;
  }
}

function hasDockerMountInfo() {
  try {
    return fs
      .readFileSync("/proc/self/mountinfo", "utf8")
      .includes("/docker/containers/");
  } catch {
    return false;
  }
}

let result: boolean | undefined;
function isDocker(): boolean {
  result ??= hasDockerEnv() || hasDockerCGroup() || hasDockerMountInfo();
  return result;
}

export { isDocker };
