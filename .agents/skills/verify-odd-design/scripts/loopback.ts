#!/usr/bin/env bun
// Records what the default speakers play (WASAPI loopback) to a WAV file, through bun:ffi.
// Usage: bun loopback.ts <out.wav>. Stops when <out.wav>.stop appears, then writes <out.wav>.json
// with { startedAt } (Unix ms of the first sample), so sr.ts can line the audio up with the video.
//
// Loopback only delivers packets while something is playing. Each packet carries its own clock
// position, and the gaps are filled with silence, so the file keeps real time.
import { CFunction, dlopen, FFIType, ptr, read, toArrayBuffer, type Pointer } from "bun:ffi";
import { existsSync, closeSync, openSync, writeSync, rmSync, writeFileSync } from "node:fs";

const out = process.argv[2];
if (!out) throw new Error("usage: loopback.ts <out.wav>");

const ole32 = dlopen("ole32.dll", {
  CoInitializeEx: { args: [FFIType.ptr, FFIType.u32], returns: FFIType.i32 },
  CoCreateInstance: { args: [FFIType.ptr, FFIType.ptr, FFIType.u32, FFIType.ptr, FFIType.ptr], returns: FFIType.i32 },
}).symbols;
const kernel32 = dlopen("kernel32.dll", {
  QueryPerformanceCounter: { args: [FFIType.ptr], returns: FFIType.i32 },
  QueryPerformanceFrequency: { args: [FFIType.ptr], returns: FFIType.i32 },
}).symbols;

function guid(s: string) {
  const h = s.replace(/-/g, "");
  const b = new Uint8Array(16);
  const v = new DataView(b.buffer);
  v.setUint32(0, parseInt(h.slice(0, 8), 16), true);
  v.setUint16(4, parseInt(h.slice(8, 12), 16), true);
  v.setUint16(6, parseInt(h.slice(12, 16), 16), true);
  for (let i = 0; i < 8; i++) b[8 + i] = parseInt(h.slice(16 + i * 2, 18 + i * 2), 16);
  return b;
}
const CLSID_MMDeviceEnumerator = guid("BCDE0395-E52F-467C-8E3D-C4579291692E");
const IID_IMMDeviceEnumerator = guid("A95664D2-9614-4F35-A746-DE8DB63617E6");
const IID_IAudioClient = guid("1CB9AD4C-DBFA-4C32-B178-C2F568A703B2");
const IID_IAudioCaptureClient = guid("C8ADBD64-E71E-48A0-A4DE-185C395CD317");

/** Calls method `index` of a COM object's vtable. */
function com(obj: Pointer, index: number, args: FFIType[], ...values: any[]): number {
  const fn = CFunction({ ptr: read.ptr(read.ptr(obj) as Pointer, index * 8) as Pointer, args: [FFIType.ptr, ...args], returns: FFIType.i32 });
  const hr = fn(obj, ...values);
  fn.close();
  return hr;
}
const check = (hr: number, what: string) => {
  if (hr < 0) throw new Error(`${what} failed: HRESULT 0x${(hr >>> 0).toString(16)}`);
};
const outPtr = () => new BigUint64Array(1);
const deref = (b: BigUint64Array) => Number(b[0]) as Pointer;

check(ole32.CoInitializeEx(null, 0), "CoInitializeEx");
const enumerator = outPtr();
check(ole32.CoCreateInstance(ptr(CLSID_MMDeviceEnumerator), null, 0x17, ptr(IID_IMMDeviceEnumerator), ptr(enumerator)), "CoCreateInstance");
const device = outPtr();
check(com(deref(enumerator), 4, [FFIType.i32, FFIType.i32, FFIType.ptr], 0, 0, ptr(device)), "GetDefaultAudioEndpoint"); // eRender, eConsole
const client = outPtr();
check(com(deref(device), 3, [FFIType.ptr, FFIType.u32, FFIType.ptr, FFIType.ptr], ptr(IID_IAudioClient), 0x17, null, ptr(client)), "Activate");
const fmtOut = outPtr();
check(com(deref(client), 8, [FFIType.ptr], ptr(fmtOut)), "GetMixFormat");
const fmtPtr = deref(fmtOut);
const cbSize = read.u16(fmtPtr, 16);
const fmt = new Uint8Array(18 + cbSize);
for (let i = 0; i < fmt.length; i++) fmt[i] = read.u8(fmtPtr, i);
const fv = new DataView(fmt.buffer);
const channels = fv.getUint16(2, true);
const rate = fv.getUint32(4, true);
const blockAlign = fv.getUint16(12, true);
// Shared mode, loopback, 1 s buffer.
check(com(deref(client), 3, [FFIType.i32, FFIType.u32, FFIType.i64, FFIType.i64, FFIType.ptr, FFIType.ptr], 0, 0x20000, 10_000_000n, 0n, fmtPtr, null), "Initialize");
const capture = outPtr();
check(com(deref(client), 14, [FFIType.ptr, FFIType.ptr], ptr(IID_IAudioCaptureClient), ptr(capture)), "GetService");

const qpc = new BigInt64Array(1);
kernel32.QueryPerformanceFrequency(ptr(qpc));
const freq = qpc[0];
const now100ns = () => (kernel32.QueryPerformanceCounter(ptr(qpc)), (qpc[0] * 10_000_000n) / freq);

// WAV header with the mix format as-is (usually 32-bit float, extensible). Sizes are patched at the end.
const fd = openSync(out, "w");
const header = new Uint8Array(12 + 8 + fmt.length + 8);
const hv = new DataView(header.buffer);
header.set([..."RIFF"].map((c) => c.charCodeAt(0)), 0);
header.set([..."WAVEfmt "].map((c) => c.charCodeAt(0)), 8);
hv.setUint32(16, fmt.length, true);
header.set(fmt, 20);
header.set([..."data"].map((c) => c.charCodeAt(0)), 20 + fmt.length);
writeSync(fd, header);
let frames = 0;

const startedAt = Date.now();
const start100ns = now100ns();
check(com(deref(client), 10, []), "Start");
rmSync(`${out}.stop`, { force: true });
console.log(`recording ${channels}ch ${rate} Hz to ${out}`);

const data = outPtr();
const count = new Uint32Array(1);
const flags = new Uint32Array(1);
const devPos = new BigUint64Array(1);
const qpcPos = new BigUint64Array(1);
const writeSilence = (n: number) => {
  const chunk = new Uint8Array(Math.min(n, rate) * blockAlign);
  while (n > 0) {
    const m = Math.min(n, rate);
    writeSync(fd, chunk, 0, m * blockAlign);
    frames += m;
    n -= m;
  }
};

while (!existsSync(`${out}.stop`)) {
  for (;;) {
    const hr = com(deref(capture), 3, [FFIType.ptr, FFIType.ptr, FFIType.ptr, FFIType.ptr, FFIType.ptr], ptr(data), ptr(count), ptr(flags), ptr(devPos), ptr(qpcPos));
    check(hr, "GetBuffer");
    if (hr === 0x08890001 || count[0] === 0) break; // AUDCLNT_S_BUFFER_EMPTY
    const at = Number(((qpcPos[0] - BigInt.asUintN(64, start100ns)) * BigInt(rate)) / 10_000_000n);
    if (at > frames) writeSilence(at - frames);
    const bytes = count[0] * blockAlign;
    if (flags[0] & 0x2) writeSilence(count[0]); // AUDCLNT_BUFFERFLAGS_SILENT
    else writeSync(fd, new Uint8Array(toArrayBuffer(deref(data), 0, bytes)).slice());
    if (!(flags[0] & 0x2)) frames += count[0];
    check(com(deref(capture), 4, [FFIType.u32], count[0]), "ReleaseBuffer");
  }
  // Keep real time through stretches where nothing plays.
  const due = Number(((now100ns() - start100ns) * BigInt(rate)) / 10_000_000n) - Math.floor(rate / 5);
  if (due > frames) writeSilence(due - frames);
  await Bun.sleep(10);
}

check(com(deref(client), 11, []), "Stop");
const dataBytes = frames * blockAlign;
const sizes = new DataView(new ArrayBuffer(4));
sizes.setUint32(0, 4 + 8 + fmt.length + 8 + dataBytes, true);
writeSync(fd, new Uint8Array(sizes.buffer), 0, 4, 4);
sizes.setUint32(0, dataBytes, true);
writeSync(fd, new Uint8Array(sizes.buffer), 0, 4, 20 + fmt.length + 4);
closeSync(fd);
writeFileSync(`${out}.json`, JSON.stringify({ startedAt, rate, channels, seconds: frames / rate }));
rmSync(`${out}.stop`, { force: true });
console.log(`stopped: ${(frames / rate).toFixed(1)} s`);

