import { createRoot } from "react-dom/client";
import "odd-design";
import { App } from "./App";

const root = document.querySelector("#root");
if (root) createRoot(root).render(<App />);
