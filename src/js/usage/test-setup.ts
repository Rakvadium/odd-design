import { afterEach } from "bun:test";
import { checkRoot, flush, installUsageChecker } from "./dom.ts";

installUsageChecker("test");

afterEach(() => {
  flush();
  checkRoot(document);
});
