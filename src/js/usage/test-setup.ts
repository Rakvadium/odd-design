import { checkRoot, flush, installUsageChecker } from "./dom.ts";

export function registerUsageChecks(afterEach: (hook: () => void) => void): void {
  installUsageChecker("test");
  afterEach(() => {
    try {
      flush();
      checkRoot(document);
    } catch (error) {
      document.body.replaceChildren();
      throw error;
    }
  });
}
