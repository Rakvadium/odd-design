// Windows input for sr.ts, through user32 with bun:ffi (no dependencies).
// Keys go through SendInput, so they reach NVDA's keyboard hook the way a person's keys do.
// CDP's Input.dispatchKeyEvent goes straight into the page and NVDA never sees it.
import { dlopen, FFIType, JSCallback, ptr, type Pointer } from "bun:ffi";

const user32 = dlopen("user32.dll", {
  SendInput: { args: [FFIType.u32, FFIType.ptr, FFIType.i32], returns: FFIType.u32 },
  MapVirtualKeyW: { args: [FFIType.u32, FFIType.u32], returns: FFIType.u32 },
  EnumWindows: { args: [FFIType.function, FFIType.ptr], returns: FFIType.i32 },
  GetWindowThreadProcessId: { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.u32 },
  IsWindowVisible: { args: [FFIType.ptr], returns: FFIType.i32 },
  GetClassNameW: { args: [FFIType.ptr, FFIType.ptr, FFIType.i32], returns: FFIType.i32 },
  GetForegroundWindow: { args: [], returns: FFIType.ptr },
  SetForegroundWindow: { args: [FFIType.ptr], returns: FFIType.i32 },
  BringWindowToTop: { args: [FFIType.ptr], returns: FFIType.i32 },
  ShowWindow: { args: [FFIType.ptr, FFIType.i32], returns: FFIType.i32 },
  AttachThreadInput: { args: [FFIType.u32, FFIType.u32, FFIType.i32], returns: FFIType.i32 },
  GetWindowRect: { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.i32 },
});
const kernel32 = dlopen("kernel32.dll", { GetCurrentThreadId: { args: [], returns: FFIType.u32 } });
const dwmapi = dlopen("dwmapi.dll", { DwmGetWindowAttribute: { args: [FFIType.ptr, FFIType.u32, FFIType.ptr, FFIType.u32], returns: FFIType.i32 } });
const u = user32.symbols;

const VK: Record<string, number> = {
  // Left-hand modifier codes, as a real keyboard sends them. With the generic codes (0x10-0x12),
  // NVDA's modifier tracking keeps Shift held after the chord ends.
  Backspace: 0x08, Tab: 0x09, Enter: 0x0d, Shift: 0xa0, Control: 0xa2, Alt: 0xa4, Escape: 0x1b, Space: 0x20,
  PageUp: 0x21, PageDown: 0x22, End: 0x23, Home: 0x24, ArrowLeft: 0x25, ArrowUp: 0x26, ArrowRight: 0x27, ArrowDown: 0x28,
  Insert: 0x2d, Delete: 0x2e, F6: 0x75,
};
// Keys that live on the extended part of the keyboard. NVDA treats Insert without this flag as numpad 0.
const EXTENDED = new Set([0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x2d, 0x2e]);
const MODIFIERS: Record<string, string> = { shift: "Shift", ctrl: "Control", control: "Control", alt: "Alt", nvda: "Insert", insert: "Insert" };

function vkFor(name: string): number {
  if (VK[name] !== undefined) return VK[name];
  if (/^[a-z0-9]$/i.test(name)) return name.toUpperCase().charCodeAt(0);
  throw new Error(`unknown key "${name}". Known: ${Object.keys(VK).join(", ")}, a letter or digit, with modifiers like shift+Tab or nvda+t`);
}

/** Every key name a chord accepts, for help text. */
export const KEY_NAMES = [...Object.keys(VK), "a-z", "0-9"];

const INPUT_SIZE = 40; // sizeof(INPUT) on x64
function keyEvents(vks: number[], up: boolean) {
  const buf = new Uint8Array(INPUT_SIZE * vks.length);
  const view = new DataView(buf.buffer);
  vks.forEach((vk, i) => {
    const o = i * INPUT_SIZE;
    view.setUint32(o, 1, true); // INPUT_KEYBOARD
    view.setUint16(o + 8, vk, true);
    view.setUint16(o + 10, u.MapVirtualKeyW(vk, 0), true);
    view.setUint32(o + 12, (EXTENDED.has(vk) ? 0x1 : 0) | (up ? 0x2 : 0), true);
  });
  return buf;
}

/** Presses a chord such as "Tab", "shift+Tab", "nvda+t", or "ctrl+Home": modifiers down, key down, all up. */
export function pressChord(chord: string) {
  const parts = chord.split("+");
  const key = parts.pop()!;
  const vks = [...parts.map((m) => vkFor(MODIFIERS[m.toLowerCase()] ?? m)), vkFor(key)];
  for (const buf of [keyEvents(vks, false), keyEvents([...vks].reverse(), true)]) {
    const sent = u.SendInput(vks.length, ptr(buf), INPUT_SIZE);
    if (sent !== vks.length) throw new Error(`SendInput sent ${sent} of ${vks.length} events (blocked by a higher-integrity window?)`);
  }
}

/** The visible top-level Chrome window owned by a process, or null. */
export function findWindow(pid: number, className = "Chrome_WidgetWin_1"): Pointer | null {
  let found: Pointer | null = null;
  const pidBuf = new Uint32Array(1);
  const cls = new Uint16Array(64);
  const cb = new JSCallback(
    (hwnd: Pointer) => {
      u.GetWindowThreadProcessId(hwnd, ptr(pidBuf));
      if (pidBuf[0] !== pid || !u.IsWindowVisible(hwnd)) return 1;
      const n = u.GetClassNameW(hwnd, ptr(cls), cls.length);
      if (String.fromCharCode(...cls.subarray(0, n)) !== className) return 1;
      found = hwnd;
      return 0;
    },
    { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.i32 },
  );
  u.EnumWindows(cb.ptr, null);
  cb.close();
  return found;
}

/**
 * Brings a window to the front. Windows only lets the foreground process do that, so this joins the
 * foreground thread's input queue for the call. Returns whether the window ended up in front.
 */
export function focusWindow(hwnd: Pointer): boolean {
  if (u.GetForegroundWindow() === hwnd) return true;
  const fg = u.GetForegroundWindow();
  const fgThread = fg ? u.GetWindowThreadProcessId(fg, null) : 0;
  const me = kernel32.symbols.GetCurrentThreadId();
  const attached = fgThread && fgThread !== me && u.AttachThreadInput(me, fgThread, 1);
  u.ShowWindow(hwnd, 9); // SW_RESTORE
  u.BringWindowToTop(hwnd);
  u.SetForegroundWindow(hwnd);
  if (attached) u.AttachThreadInput(me, fgThread, 0);
  return u.GetForegroundWindow() === hwnd;
}

export function isForeground(hwnd: Pointer) {
  return u.GetForegroundWindow() === hwnd;
}

/** The window's visible screen rectangle (without Windows 11's invisible resize borders), for recording it. */
export function windowRect(hwnd: Pointer) {
  const r = new Int32Array(4);
  if (dwmapi.symbols.DwmGetWindowAttribute(hwnd, 9, ptr(r), 16) !== 0) u.GetWindowRect(hwnd, ptr(r)); // DWMWA_EXTENDED_FRAME_BOUNDS
  return { x: r[0]!, y: r[1]!, width: r[2]! - r[0]!, height: r[3]! - r[1]! };
}
