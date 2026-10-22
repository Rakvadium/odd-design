import { CHROMES, MODES, PALETTES, type Chrome, type Mode, type Palette } from "./contract.ts";

export { CHROMES, MODES, PALETTES, type Chrome, type Mode, type Palette };

export type Appearance = { mode: Mode; palette: Palette; chrome: Chrome };

export const DEFAULT_APPEARANCE: Appearance = { mode: "system", palette: "default", chrome: "calm" };

const STORAGE_KEY = "odd-appearance";

/** Writes the three axes onto an element. Mode is pure CSS (`color-scheme`), so "system" needs no listener. */
export function applyAppearance(appearance: Appearance, root: HTMLElement = document.documentElement) {
  root.dataset.mode = appearance.mode;
  root.dataset.palette = appearance.palette;
  root.dataset.chrome = appearance.chrome;
}

export function loadAppearance(storage: Storage = localStorage): Appearance {
  try {
    const saved = JSON.parse(storage.getItem(STORAGE_KEY) ?? "{}");
    return {
      mode: MODES.includes(saved.mode) ? saved.mode : DEFAULT_APPEARANCE.mode,
      palette: PALETTES.includes(saved.palette) ? saved.palette : DEFAULT_APPEARANCE.palette,
      chrome: CHROMES.includes(saved.chrome) ? saved.chrome : DEFAULT_APPEARANCE.chrome,
    };
  } catch {
    return DEFAULT_APPEARANCE;
  }
}

export function saveAppearance(appearance: Appearance, storage: Storage = localStorage) {
  storage.setItem(STORAGE_KEY, JSON.stringify(appearance));
}

/** Inline this in <head> before any stylesheet so the first frame already has the user's appearance. */
export const FIRST_PAINT_SCRIPT = `try{var a=JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)})||"{}"),d=document.documentElement.dataset;a.mode&&(d.mode=a.mode);a.palette&&(d.palette=a.palette);a.chrome&&(d.chrome=a.chrome)}catch(e){}`;
