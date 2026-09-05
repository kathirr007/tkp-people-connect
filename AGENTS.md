# AGENTS Instructions

## PR Creation Workflow

When the user asks to create a PR (merge "develop" to "main" or similar), follow these steps:

### 1. Check Current State

- Run `git branch --show-current` to verify current branch
- Run `git status` to check for uncommitted changes

### 2. Determine What Changes to Include

- Use `gh pr view <PR_NUMBER> --json files` to check existing PR files
- If PR already exists, use `gh pr diff <PR_NUMBER>` to see actual changes
- If creating new PR, use `git diff main...<current_branch>` to see pending changes

### 3. Create Description Based ONLY on Actual Changes

- Focus only on the files that will be in the PR
- List specific changes per file
- Count exact insertions/deletions with `git diff --shortstat`
- Do NOT include entire branch history or changes from previous merges

### 4. Create/Update PR

- Use `gh pr create` for new PRs
- Use `gh pr edit <PR_NUMBER>` for existing PRs
- Title should be concise and describe the main change
- Body should include:
  - Summary
  - Specific files changed with their changes
