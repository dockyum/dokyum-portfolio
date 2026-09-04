# Git workflow

## The shared main checkout

`dokyum-portfolio` is worked on by more than one agent session at a time, and
they share the main checkout. Treat `main` there as shared state.

- Do the work in a linked worktree on a feature branch:
  `git worktree add ../<name> -b <branch> main`, or the harness's worktree action.
- `main` moves only when a pull request is merged on GitHub. Never commit on
  `main`, never `git merge` a branch into `main` locally, and never push `main`
  directly.
- Never move `main` backwards in the main checkout. A `git reset`, `rebase`, or
  `branch -f` there can drop a commit another session made seconds earlier, and
  the only trace left is the reflog.

## Landing work: always through a pull request

1. Rebase the branch onto the latest `origin/main` and run `pnpm verify`.
2. Push the branch: `git push -u origin <branch>`.
3. Open the PR against `main` with `gh pr create`. The body says what changed,
   why, and how it was verified.
4. Open the PR as soon as the work is verified; merge it when the user asks to
   merge or land the work.
5. Merge on GitHub with **Rebase and merge**: `gh pr merge <number> --rebase`.
   Rebase keeps `main` linear, which the guard hook and the other sessions
   rely on. Do not squash, because the commit series is the record, and do not
   create merge commits. Delete the branch afterwards.
6. Bring the main checkout forward with `git pull --ff-only` there, and rebase
   any other open branch onto the new `origin/main` before its own PR.

## The guard

`.githooks/reference-transaction` refuses any ref update that rewinds or deletes
`main`, `master`, or `develop`, whichever tool or session asks for it. Enable it
once per clone:

    git config core.hooksPath .githooks

For a rewind you actually intend:

    ALLOW_BRANCH_REWIND=1 git reset --hard <ref>

The hook fails open: if it cannot decide, it allows the update, so a bug in it
can never make the repository unusable.

## Where this came from

2026-09-03: one session ran `git reset` on `main` in the main checkout to line
it up with `github/main`, about a minute after another session had committed
there. The commit was left unreachable and had to be recovered from the reflog
and cherry-picked back.

2026-09-05: one session fast-forwarded `main` locally while another session's
PR had already landed on GitHub, so landing the second change took a manual
rebase across nine conflicting files. Pull requests make the landing order
visible and let GitHub refuse a stale branch.
