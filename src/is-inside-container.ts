import fs from "node:fs";

import { isDocker } from "./is-docker";

let isContainer: boolean | undefined;
function isInsideContainer(): boolean {
  isContainer ??= fs.existsSync("/run/.containerenv") || isDocker();
  return isContainer;
}

export { isInsideContainer };
