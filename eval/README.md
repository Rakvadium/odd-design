# Run a round

1. Run `bun eval/setup.ts`.
   The script builds and packs odd-design.
   It creates the next free `C:\workspaces\app-NNN`, copies the template, and installs the tarball.
   It commits a scaffold, then prints the folder and the brief.

2. Start a fresh T3 thread on that folder.
   Paste the brief as the first message.
   Let the thread finish.

3. Run `bun eval/grade.ts` with the app folder.
   The grader prints PASS or FAIL for each check.
   It exits 1 when any check fails.

4. In the app folder, run `git add -A` and then `git diff --cached scaffold --stat`.
   That diff is what the agent changed after the scaffold.

The checks are `grade()` in `eval/grade.ts`.
