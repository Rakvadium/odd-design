import { createRoot } from "react-dom/client";
// @ts-expect-error Package entry is a stylesheet, so the compiler has no module type for it.
import "odd-design";
import { App } from "./App";

const root = document.querySelector("#root");
if (root) createRoot(root).render(<App />);
