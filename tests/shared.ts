export const importFresh = (): Promise<typeof import("is-system")> =>
  import(`../src/index.ts?cache=${Date.now()}`);
