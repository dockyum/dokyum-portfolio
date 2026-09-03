# Git workflow

## The shared main checkout

`dokyum-portfolio` is worked on by more than one agent session at a time, and
they share the main checkout. Treat `main` there as shared state.

- Do the work in a linked worktree on a feature branch:
  `git worktree add ../<name> -b <branch> main`, or the harness's worktree action.
- Land it by moving `main` forward only: commit on the branch, then
  `git merge --ff-only <branch>` from the main checkout, or merge on GitHub.
- Never move `main` backwards in the main checkout. A `git reset`, `rebase`, or
  `branch -f` there can drop a commit another session made seconds earlier, and
  the only trace left is the reflog.

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
