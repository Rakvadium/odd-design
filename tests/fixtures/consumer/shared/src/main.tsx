import { createRoot } from "react-dom/client";
import { applyAppearance } from "odd-design/appearance";
import { avatarFallback } from "odd-design/enhance";
import { generatePalette } from "odd-design/palette";
import { App } from "./App";

applyAppearance({ mode: "system", palette: "default", chrome: "calm" });
avatarFallback();
generatePalette({ primary: "#7c3aed" });

const root = document.querySelector("#root");
if (root) createRoot(root).render(<App />);
