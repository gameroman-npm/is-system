import fs from "node:fs";

import { isDocker } from "./is-docker";

function hasContainerEnv(): boolean {
  try {
    fs.statSync("/run/.containerenv");
    return true;
  } catch {
    return false;
  }
}

let isContainer: boolean | undefined;
function isInsideContainer(): boolean {
  isContainer ??= hasContainerEnv() || isDocker();
  return isContainer;
}

export { isInsideContainer };
