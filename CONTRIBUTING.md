# Contributing

## Commit Policy

This repository enforces commit hygiene locally and in CI. The policy applies forward: normalize new commits and any active branch before merge, but do not rewrite already published `main`.

### Required Header Format

Every non-exempt commit header must match:

```text
type(scope): subject
```

Breaking changes may use the optional `!` marker:

```text
type(scope)!: subject
```

Current allowed `type` values:

- `build`
- `chore`
- `ci`
- `docs`
- `feat`
- `fix`
- `perf`
- `refactor`
- `revert`
- `style`
- `test`

Accepted scopes are exact values from `config/commitlint.config.cjs`. In practice they follow these patterns:

- Views and flows: `home`, `projects`, `project-detail`
- Feature slices: `create-task`, `edit-task`, `create-project`, `edit-project`, `toggle-theme`
- Shared layers and app structure: `app`, `api`, `hooks`, `lib`, `ui`, `config`, `widgets`
- Repository and delivery work: `readme`, `tests`, `deps`, `ci`, `arch`

Examples:

```text
feat(projects): add archived filter
fix(ui): prevent dialog overflow on mobile
docs(readme): clarify local setup
test(hooks): cover overdue task sorting
```

Additional header rules enforced by local and remote audits:

- `type` must be lowercase.
- `subject` must be non-empty and specific.
- The header must stay within 100 characters.
- Generic subjects such as `wip`, `tmp`, `temp`, `update`, `misc`, and `fix stuff` are rejected.
- `fixup!`, `squash!`, and `WIP` prefixes are blocked in branch audits.
- Auto-generated `merge ...` and `revert "..."` headers are the only format exceptions.

### Commit Size Limit

Each commit is limited to 100 changed lines, counted as `added + deleted`.

If a commit must exceed that limit, add a non-empty `Commit-Exception:` footer with the reason. The exception is for justified atomic changes, not as the default path.

Complete example:

```text
feat(projects): add bulk archive action

Keep the toolbar update, repository wiring, and regression coverage together
so the feature lands as one verifiable unit.

Commit-Exception: touches 134 changed lines because the archive action,
  storage update, and regression test need to land atomically.
```

### Local Enforcement

After `pnpm install`, Husky installs the local hooks used by this policy.

- `commit-msg` runs `commitlint` with `config/commitlint.config.cjs`.
- `commit-msg` also runs `scripts/git/check-commit-message.mjs` to block generic subjects.
- `commit-msg` runs `scripts/commit/check-commit-size.cjs` to enforce the 100-line limit and validate `Commit-Exception:`.
- `pre-push` runs `pnpm run commit:audit-branch -- --base=<resolved-base> --head=<resolved-head>` to audit every commit being pushed, not just the tip commit.

If `pre-push` blocks a push, reproduce it locally with:

```bash
pnpm run commit:audit-branch -- --base=origin/main --head=HEAD
```

### Remote Enforcement

CI repeats the same history audit in `.github/workflows/commit-audit.yml`.

- The workflow runs on `pull_request` and `push`.
- It resolves the correct audit range for the branch or PR.
- It runs `npm run commit:audit-branch -- --base=... --head=...` so remote verification matches the local `pre-push` audit.

### History Rules

This team fixes commit history before merge, on active branches only.

- Amend or rebase a feature branch if it fails the policy.
- Normalize history going forward instead of retroactively rewriting shared history.
- Never rewrite already published `main`; once it is public, fix issues with follow-up commits instead of force-pushing a new history.
