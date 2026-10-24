# Eval backlog

Findings from the eval build that block nothing. Each one is safe to leave as it is. Under the rule in `eval-button.md`, a finding lands here instead of starting a fix round. Pick one up only when it starts to matter.

## Scan

- **Reads an agent hides on purpose stay invisible.** A script that names no path, a base64 or other encoded read, a URL built from pieces at run time, a junction made inside a script, `cmd` delayed expansion (`!VAR!`), `%VAR:~n%` substrings, a nested `cmd /c` with its own `cd`, the public repo fetched by its numeric GitHub id, a `/c/...` path written into a script, and a `//host/c$/...` path. `eval/README.md` lists them. Each one needs an agent working to hide a read.
- **Unknown search options can hide a path.** A search option the scan does not know, such as rg's `--pre`, takes the pattern slot, so a `../` path in its value is missed. Unknown `Select-String` options lean toward false findings instead.

## Runs

- **A port can be taken before the mock starts.** `prepare` picks a free port and releases it. Another process can take it before the agent runs `bun run api`, and the agent then sees a bind error. No pick was reused in 216 tries.
- **Vite listens on `localhost` only.** It binds `[::1]`, so `127.0.0.1:5175` does not connect. The grader drives `localhost`.
- **The packed package carries the `eval` script.** `node_modules/odd-design/package.json` lists `"eval": "bun eval/cli.ts"`, which an agent could read. It sits beside scripts named `test` and `check`.
- **Old launch files have no commit.** `finish` refuses a run prepared before the commit was recorded at pack time. `scan` still works on it.
- **The token list only grows.** Every prepare and the temp-canary test add a line to `odd-eval/tokens.txt`.
- **Two parallel runs can share a temp log name.** Both agents can write `/tmp/api.log`. A log holds nothing about the repo.

## API documentation

- **A few mock responses stay undocumented.** The 204 preflight, the CORS headers, and the 400 for an unknown route are not in `API.md`. No action in the brief needs them.

## Outside the eval

- **The page background stops at the viewport.** In full-page screenshots of the settings run, the background ends at 900 px and a flat band shows below it. It looks like odd-design's page background not covering the scroll height. It is not a Button issue.
- **Worktrees from the swarms pile up.** Each verification lane gets its own T3 worktree. One, `t3-05db1b18`, has a broken `link/` folder left from an audit's junction test. Prune them when E4 lands.
