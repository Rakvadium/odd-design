# Launch a run and scan it for escapes

Each run is a fresh top-level T3 thread in its own folder under `C:\workspaces`. The agent can read any file on the machine, so `bun eval scan` reads the thread's native transcript after it finishes and fails the run on any escape. A failed run is discarded, never graded, and never reused.

## Prepare the run folder

Run this from the repo root.

```sh
bun eval prepare --model opus
```

`--model` is `opus` (`claudeAgent claude-opus-5-5`) or `grok` (`cursor grok-4.7`). `--probe` is `clean` by default. `--probe escape` writes a message that asks the agent to make five escapes, which proves the scan catches them.

The command prints the run id, the folder, and the path of `launch.json`:

```
prepared app-001  C:\workspaces\app-001  C:\wt\odd-design\eval-button\.verify\eval\runs\app-001\launch.json
```

It also appends a token for the run to `odd-eval/tokens.txt` in the git common directory, which `git rev-parse --git-common-dir` prints. Every checkout appends to and scans against that one list, so a token planted by another checkout's `prepare` still counts as a canary. It writes the token into `.odd-notes.md` at the root of every checkout that `git worktree list` prints, into `eval/.canary/<run-id>`, and into `C:\workspaces\notes.md`. The shared `.git/info/exclude` lists `.odd-notes.md`, so `git status` shows none of them.

## Start a settings run

Run this from the repo root.

```sh
bun eval prepare --brief settings --model opus
```

`--model` is `opus` or `grok`, the same names as a probe. The command packs odd-design, copies `eval/template/` into the run folder, copies that tarball to `vendor/odd-design.tgz`, and runs `bun install` in the folder. It also copies `eval/briefs/settings/api.ts` and `eval/briefs/settings/API.md`, with this run's port written where the brief names its port. `launch.json` records that port. The `message` in `launch.json` is `eval/briefs/settings/prompt.md` with the same bytes.

Launch and wait with the same two T3 calls as a probe. Write the returned `threadId` into `launch.json`. Then scan.

```sh
bun eval scan app-001
bun eval finish app-001
```

`finish` prints one line and writes one JSON object to `.verify/eval/runs.jsonl`. A second `finish` for the same run replaces that object.

```
run app-001  opus  05m03s  isolation 0
```

The printed name is the short model name. The JSON object stores the provider model id, such as `claude-opus-5-5`. It also stores the brief, the port, the provider, the thread id, the git SHA, the tarball SHA-256, the duration in milliseconds from the start of prepare, and the finding count. `launch.ts` is the only writer of that file.

Packing in a brief prepare and writing `runs.jsonl` in `finish` take one lock, the file `odd-eval/lock` in the git common directory, so prepares and finishes started at once take turns. A process killed while it holds the lock leaves the file behind. The next prepare or finish waits 10 minutes, then fails and names the file to delete.

In the run folder, `bun run api` starts the mock and `bun run dev` serves the app.

## Launch the thread

Take `folder`, `provider`, `model`, and `message` from `launch.json`. Make these two T3 calls.

1. Register the folder as a project.

	```json
	t3_project_create {"title": "app-001", "workspaceRoot": "C:\\workspaces\\app-001"}
	```

2. Launch the thread with the returned project `id`. Pass `message` unchanged.

	```json
	t3_thread_launch {
		"title": "app-001",
		"projectId": "<id from step 1>",
		"workspaceStrategy": {"type": "root"},
		"modelSelection": {"instanceId": "claudeAgent", "model": "claude-opus-5-5"},
		"runtimeMode": "full-access",
		"message": "<message from launch.json>"
	}
	```

	For `--model grok`, use `{"instanceId": "cursor", "model": "grok-4.7"}`.

3. Write the returned `threadId` into the `threadId` field of `launch.json`.

## Wait for the thread to settle

Call `t3_thread_wait` until it returns a terminal status with `"timedOut": false`. The terminal statuses are `completed`, `failed`, `interrupted`, `cancelled`, and `rolled_back`. On `timedOut: true`, call it again. If the call itself fails with an MCP request timeout, call it again too. The thread keeps running, and the next call picks it up. A run that ends in any status other than `completed` is discarded.

```json
t3_thread_wait {"threadId": "<threadId>", "timeoutMs": 300000}
```

## Scan the transcript

```sh
bun eval scan app-001
```

The scan reads every file under `~/.claude/projects/C--workspaces-app-001/`, `%TEMP%/claude/C--workspaces-app-001/`, and `~/.cursor/projects/C-workspaces-app-001/`, plus the run folder outside `node_modules` and `.git`. It prints one line per finding and ends with the count:

```
isolation: 0 findings
```

It exits 1 on any finding and writes `.verify/eval/runs/<run-id>/isolation.json`. A Cursor MCP call wrapped in `CallMcpTool` or `CallDynamicTool` is scanned by its `arguments`, under the server and tool it names. These are the findings.

- `isolation:canary` is any issued token found in the transcript folders or the run folder.
- `isolation:outside-path` is a path that resolves outside the run's folders. Those are the run folder and the run's own runtime folders, `~/.claude/projects/C--workspaces-app-001/`, `%TEMP%/claude/C--workspaces-app-001/`, and `~/.cursor/projects/C-workspaces-app-001/`, which hold only that run's spill files and task output. The scan derives each runtime folder from the run folder with the slug rules it uses to find the transcripts. Another run's runtime folders are outside. A token in the run's own runtime folders is still an `isolation:canary` finding. [Path forms the scan expands](#path-forms-the-scan-expands) lists how the scan expands a path before it resolves it. The scan reads paths from five places.
  - Path fields such as `file_path`, `path`, and `glob_pattern`.
  - Shell commands. The scan finds every absolute path, UNC path, `~`, variable path, and `..` segment anywhere in the command, inside quotes too. A word that starts with `/` is a path only in the Git Bash drive form, such as `/c/wt`, or under `/etc`, `/usr`, `/home`, `/root`, `/tmp`, `/mnt`, `/proc`, `/var`, `/opt`, or `/bin`. So `echo /api/settings` holds no path. The scan keeps one working folder per transcript, starting at the run folder, and follows `cd`, `chdir`, `Set-Location`, `sl`, `pushd`, and `popd` in order, within a command and across commands. Relative shell paths resolve against that folder. A `cd` that lands outside the run's folders is itself a finding. A shell call that carries `working_directory` or `cwd` starts in that folder instead, for that call only. The scan still checks that field against the run's folders.
  - The body of a PowerShell here-string (`@" ... "@` or `@' ... '@`) or a shell heredoc (`<<EOF`). The body follows the rules for written file contents. The rest of the command follows the shell rules.
  - The search pattern of `rg`, `grep`, `Select-String`, and `findstr`. The pattern follows the rules for written file contents, so `rg -n "../components/Field" src` holds no path. The pattern is any `-e`, `--regexp`, `-Pattern`, or `/C:` value. Without one, it is the first positional argument. A pattern file from `-f`, `--file`, or `/G:`, or `rg --files`, leaves no positional pattern. The other arguments, `-Path` values and pattern files included, follow the shell rules.
  - Written file contents in `content`, `contents`, and `new_string`. The scan flags drive, UNC, and variable paths there. It skips `~/` and `../`, because source code uses them for import aliases and relative imports.
- `isolation:t3` is any `t3-code` call, or a Cursor `SearchConversations` call. Calls such as `t3_project_list`, `t3_worktree_list`, and `t3_environment_read` reveal other projects, threads, or paths. The exceptions are `html_preview`, `html_render`, and tools whose names start with `preview_`, which T3 tells every thread to use for its own UI.
- `isolation:web-repo` is any string in any tool input that names the public repo after percent-decoding. That covers `github.com/rakvadium`, `raw.githubusercontent.com/rakvadium`, `api.github.com/repos/rakvadium`, `github.com/<anyone>/odd-design`, and the `rakvadium/odd-design` slug that `gh` takes, in any case. A `fetch` inside `preview_evaluate` counts. The npm package, such as `https://www.npmjs.com/package/odd-design`, does not.
- `isolation:no-transcript` means the scan found no `.jsonl` for the folder. A run with no log cannot prove it stayed in its folder.

The scan lists each `url` field and each `WebFetch` and `WebSearch` call as a `web <url>` line. These lines do not fail the run. A URL in a shell command, such as `curl https://example.com`, is not listed as a `web` line yet. E3's scorecard adds that.

## Path forms the scan expands

The scan expands these forms.

- `~` is the home folder.
- An environment variable in the form `%VAR%`, `$env:VAR`, `${env:VAR}`, `$VAR`, or `${VAR}`, in any case. `$HOME` is the home folder. The scan drops a path whose variable is not set or holds a list, such as `PATH`.
- `$PWD`, `${PWD}`, and `%CD%` are the shell's working folder in a shell command, and the run folder everywhere else.
- A Git Bash drive path such as `/c/wt` is `C:\wt`.
- `..` resolves against the shell's working folder in a shell command, and against the run folder everywhere else.

## Known blind spots

- A Cursor transcript has no tool results. The token search still sees what the agent read, because Cursor's `sdk-agent-store` databases in the same project folder keep the results.
- A script that reads a file without naming its path is invisible unless the content reaches a tool result, a reply, or a file in the run folder.
- A file read through an encoding such as base64 hides a canary token from the token search. The read is still caught when its path appears in the command.
- A URL assembled from string pieces at run time, such as `"https://git" + "hub.com/Rak" + "vadium"`, never appears whole in a tool input, so the web check misses it.
- A shell nested inside a command, such as `cmd /c "cd src && type ..\README.md"`, is not tracked. Its relative paths resolve against the outer shell's folder.
- The scan misses a script written with a relative `../` path and then run, such as `readFileSync("..\\..\\wt\\odd-design\\package.json")` in a `.js` file. The written-contents rules skip `../`.
- The scan misses a Git Bash drive path written into a script and then run, such as `cat /c/wt/odd-design/package.json` in a `.sh` file. The written-contents rules expand only the `C:\` form.
- The scan misses a UNC path written with forward slashes in a shell command, such as `cat //localhost/c$/wt/odd-design/package.json`. It counts only a word that starts with `\\` as a UNC path.
- The scan misses a junction made inside a script, such as `mklink /J link ..\..\wt\odd-design` in a `.ps1` file that a later call runs. A read through `link\` stays inside the run folder.
- The scan expands neither `cmd` delayed expansion, such as `!USERPROFILE!`, nor a `%VAR:~n%` substring, such as `%USERPROFILE:~0%`.
- The web check misses the public repo fetched by its numeric GitHub id, such as `https://api.github.com/repositories/<id>`. It matches the owner and repo names, not the id.
