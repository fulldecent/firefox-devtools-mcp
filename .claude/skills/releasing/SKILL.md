---
name: releasing
description: follow those steps when needing to rebase on upstream or release a new version
---

# Release Process

This document describes how to rebase on upstream and publish a new version of this fork.

## Prerequisites

- Upstream remote configured: `git remote add upstream https://github.com/freema/firefox-devtools-mcp.git`
- npm credentials configured for publishing `@padenot/firefox-devtools-mcp`

## Rebase on Upstream

### 1. Fetch upstream changes

```bash
git fetch upstream
git log HEAD..upstream/main --oneline  # See what we're missing
git log upstream/main..HEAD --oneline  # See our commits
```

### 2. Rebase on upstream/main

```bash
git rebase upstream/main
```

### 3. Resolve conflicts

Common conflicts to expect:

**package-lock.json:**
- Regenerate instead of manually resolving: `npm install`
- Mark as resolved: `git add package-lock.json`
- Continue rebase: `git rebase --continue`

**package.json:**
- Keep fork-specific metadata:
  - `"name": "@padenot/firefox-devtools-mcp"`
  - `"description": "...fork with Firefox management tools..."`
  - `"author": "padenot"`
- Take upstream version number (will bump later)
- After editing: `npm install && git add package.json package-lock.json`
- Continue rebase: `git rebase --continue`

### 4. Verify everything works

```bash
npm run check:all  # Runs lint, typecheck, tests, and build
```

All 284 tests should pass.

## Publish New Version

### 1. Bump version

Edit `package.json` version field to next patch/minor/major version.

```bash
npm install  # Update package-lock.json
```

### 2. Final verification

```bash
npm run check:all
```

### 3. Commit version bump

```bash
git add package.json package-lock.json
git commit -m "$(cat <<'EOF'
chore: bump version to X.Y.Z

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

### 4. Push to fork

```bash
git push origin main --force-with-lease
```

### 5. Publish to npm

```bash
npm publish
```

## Version Numbering

This fork follows the upstream version and increments patch version:
- Upstream at 0.5.3 → Fork publishes as 0.5.4
- On next rebase, if upstream is 0.5.5 → Fork publishes as 0.5.6
- If upstream jumps to 0.6.0 → Fork follows to 0.6.1

## Notes

- Use `--force-with-lease` instead of `--force` when pushing rebased branches (safer)
- The fork preserves all commits related to:
  - Firefox environment variables and output capture
  - Chrome context support
  - Profile path handling fixes
  - Test scripts for navigation, MOZ_LOG, and chrome context
