# Eval rough edges

The Simple Button round (app-036) hit two problems that the agent had to work around.

1. `eval/template/index.html` has no viewport meta tag, so the app renders at desktop width on a phone.
2. `odd-design/enhance` resolves to `src/js/enhance.ts`. A consumer's `tsc` compiles that file as source and rejects its `./menu.ts`-style imports with TS5097. app-036 added `allowImportingTsExtensions` to get past it.

Reproduced on a scratch `bun eval/setup.ts`. Importing `roving` and `createToaster` from `odd-design/enhance` gives 10 TS5097 errors. Importing from `odd-design/palette` and `odd-design/appearance` gives 3 more, from the same cause.

## Commits

1. **Repro.** `scripts/consumer-smoke.ts` is the existing packed-consumer check. Its `REQUIRED` list gains the `.js` and `.d.ts` for `enhance`, `appearance`, and `palette` under `dist/js/`. The consumer fixture's `shared/src/main.tsx` imports one function from each of the three entries. Before the fix, the smoke script fails on the missing files, and the fixture's `tsc` prints TS5097.
2. **Fix.** Add the three entries to `entries` in `scripts/build.ts`. Point `./enhance`, `./appearance`, and `./palette` in `package.json` at `dist/js/<name>.{d.ts,js}` in the same `types`/`import`/`default` shape as `./usage`. Add `<meta name="viewport" content="width=device-width, initial-scale=1">` to the template.

A `grok-4.7` child writes each commit. I review the diff myself, since I run on Claude. No other reviewer.

## Verify

- `bun scripts/consumer-smoke.ts` fails before the fix and passes after it.
- A scratch `bun eval/setup.ts` with an `odd-design/enhance` import compiles under the template's `tsc` with no TS5097. The template `tsconfig.json` has no `allowImportingTsExtensions`.
- `grep viewport` finds the tag in the scaffolded app's `index.html`.
- `bun run check` passes.

Then a PR against `main`. No merge.

## Decision

Caleb approved folding `./appearance` and `./palette` into the same commits.

## Backlog

- `files` still packs raw `src/js`. No export resolves there anymore, but the README points readers at `src/js/appearance.ts` for the first-paint script. Decide whether to drop it from `files` and from the smoke script's `REQUIRED`.
