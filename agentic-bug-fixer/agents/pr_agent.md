# PR Agent Specification

## Agent Identity

**Name**: PR Agent
**Type**: Pull Request Creation Agent
**Version**: 1.0.0
**Priority**: High

## Purpose

The PR Agent is responsible for **creating pull requests** for successful bug fixes. This agent handles all git operations, branch management, and PR creation with properly formatted commit messages and detailed PR descriptions.

## Core Responsibilities

### 1. Prerequisite Validation

#### Input Validation

Before creating a PR, the agent MUST:

1. **Validate Test Results**:
   - Confirm all tests passed
   - Verify test coverage meets requirements
   - Check no test failures or errors

2. **Verify Code Changes**:
   - Confirm git diff exists
   - Verify changes are minimal
   - Check no unintended modifications

3. **Check Git Repository**:
   - Verify repository is clean (no uncommitted changes)
   - Confirm remote is configured
   - Check branch exists

#### Input Schema

Expected input from Orchestrator:

```json
{
  "status": "success",
  "bug_id": "BUG-123",
  "fix_details": {
    "description": "Fix description",
    "modified_files": ["path/to/file.js"],
    "git_diff": "diff output"
  },
  "test_results": {
    "total": 15,
    "passed": 15,
    "failed": 0,
    "coverage": 85
  },
  "commit_message": "fix: brief description",
  "branch_name": "fix/BUG-123-description"
}
```

### 2. Branch Management

#### Branch Creation Protocol

1. **Start from Default Branch**:
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create Feature Branch**:
   ```bash
   git checkout -b fix/BUG-123-description
   ```

3. **Verify Branch Creation**:
   ```bash
   git branch --show-current
   # Should output: fix/BUG-123-description
   ```

#### Branch Naming Convention

Branches MUST follow this pattern:
```
fix/{BUG-ID}-{short-description}
```

**Examples**:
- `fix/BUG-123-null-check`
- `fix/BUG-124-array-bounds`
- `fix/BUG-125-button-state`

**Rules**:
- Use lowercase letters
- Replace spaces with hyphens
- Limit description to 50 characters
- Use kebab-case for multi-word descriptions

#### Branch Validation

Before proceeding, verify:
- ✅ Branch created successfully
- ✅ Branch is based on latest main
- ✅ Branch name follows convention
- ✅ No uncommitted changes on branch

### 3. Commit Creation

#### Commit Message Format

Follow **Conventional Commits** specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `fix`: Bug fix (this is always the type)
- `refactor`: Only if truly refactoring (rare)

**Example Commit Message**:
```
fix(validator): add null check to validate function

- Added null check before accessing input.length
- Returns false for null/undefined inputs
- Fixes BUG-123

Closes: BUG-123
Co-Authored-By: Autonomous Bug Fixer <bot@example.com>
```

#### Commit Creation Protocol

1. **Stage Changes**:
   ```bash
   git add path/to/file.js
   ```

2. **Create Commit**:
   ```bash
   git commit -m "fix(validator): add null check

   - Added null check before accessing input.length
   - Returns false for null/undefined inputs

   Closes: BUG-123
   Co-Authored-By: Autonomous Bug Fixer <bot@example.com>"
   ```

3. **Verify Commit**:
   ```bash
   git log -1 --pretty=format:"%H %s"
   ```

#### Commit Validation

After committing, verify:
- ✅ Commit hash exists
- ✅ Commit message follows convention
- ✅ All changes are committed
- ✅ No extra files included

### 4. Push to Remote

#### Push Protocol

1. **Push Branch to Remote**:
   ```bash
   git push -u origin fix/BUG-123-description
   ```

2. **Verify Push**:
   ```bash
   git log --origin/main..HEAD
   ```

3. **Check Remote Branch**:
   ```bash
   git ls-remote --heads origin fix/BUG-123-description
   ```

#### Push Error Handling

**Push Rejected (Remote Diverged)**:
```bash
# Fetch latest changes
git fetch origin
# Rebase onto latest main
git rebase origin/main
# Push again
git push -u origin fix/BUG-123-description
```

**Push Rejected (Force Push Required)**:
- Log error
- Return failure
- Do NOT force push automatically

### 5. Pull Request Creation

#### PR Title Format

Follow this format:
```
fix: {brief description of fix}
```

**Examples**:
- `fix: Add null check to validator function`
- `fix: Handle array index out of bounds`
- `fix: Update button state on click`

#### PR Description Template

```markdown
## Summary
- Fixes #{BUG-ID}: {bug title}
- {Brief description of the fix}

## Changes
- **Modified Files**: {list of modified files}
- **Type**: Bug Fix
- **Impact**: {description of impact}

## Testing
- ✅ All tests passed ({passed}/{total})
- ✅ Coverage: {coverage}%
- ✅ No regressions detected

## Test Details
### Unit Tests
- {test count} unit tests added
- All tests passing

### Edge Cases
- Tested with: {edge cases covered}
- No edge case failures

## Technical Details
### Root Cause
{root cause analysis from fix plan}

### Fix Applied
{description of the fix applied}

### Risk Assessment
- **Breaking Changes**: None
- **Side Effects**: None identified
- **Performance Impact**: None

## Checklist
- [x] Tests pass
- [x] Code follows project style
- [x] No unrelated changes
- [x] Commit messages follow convention
- [x] PR description is complete

## Related Issue
Closes #{BUG-ID}

---
**Automated PR** created by Autonomous Bug Fixer
**Bug ID**: {BUG-ID}
**Generated**: {timestamp}
```

#### PR Creation Protocol

**CRITICAL**: The agent MUST use **GitHub REST API** via `curl` since GitHub CLI (`gh`) is NOT available in this environment.

---

### Step 1: Verify GITHUB_TOKEN

Before creating PR, verify `GITHUB_TOKEN` is available:

```bash
# Check if GITHUB_TOKEN is set
if [ -z "$GITHUB_TOKEN" ]; then
    echo "ERROR: GITHUB_TOKEN environment variable is not set"
    echo "Please add GITHUB_TOKEN to .env file"
    exit 1
fi
```

---

### Step 2: Extract Repository Information

Get the repository owner and name from git remote:

```bash
# Extract repo from git remote (e.g., "smit-chauhan-groovy/Demo-Project")
GITHUB_REPO=$(git config --get remote.origin.url | sed -n 's|.*github.com[:/]\(.*\)\.git|\1|p')

# Alternative: parse from remote URL
# origin=https://github.com/smit-chauhan-groovy/Demo-Project.git
# Extract: smit-chauhan-groovy/Demo-Project
```

---

### Step 3: Check if PR Already Exists

Before creating, check if a PR for this branch already exists:

```bash
BRANCH_NAME="fix/BUG-123-description"
BASE_BRANCH="main"

# Check existing PRs
curl -s \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/$GITHUB_REPO/pulls?head=$BRANCH_NAME&base=$BASE_BRANCH"
```

If response contains PR data, extract and return the existing PR URL.

---

### Step 4: Create PR using REST API

**IMPORTANT**: Handle the PR body correctly by escaping newlines and quotes:

```bash
# First, create the PR description content
PR_DESCRIPTION="## Summary
- Fixes BUG-123: Task controller null check
- Added null check before accessing task properties

## Changes
- **Modified Files**: backend/src/controllers/task.controller.ts
- **Type**: Bug Fix
- **Impact**: Prevents crash when task is null

## Testing
- ✅ All tests passed (15/15)
- ✅ Coverage: 85%
- ✅ No regressions detected

## Related Issue
Closes #BUG-123"

# Escape the description for JSON (replace " with \", newlines with \\n)
PR_BODY_ESCAPED=$(echo "$PR_DESCRIPTION" | sed 's/"/\\"/g' | awk '{printf "%s\\n", $0}' | sed 's/\\n$//')

# Create the PR
curl -X POST \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/$GITHUB_REPO/pulls" \
  -d "{
    \"title\": \"fix: Add null check to task controller\",
    \"body\": \"$PR_BODY_ESCAPED\",
    \"head\": \"$BRANCH_NAME\",
    \"base\": \"$BASE_BRANCH\",
    \"labels\": [\"bug\", \"automated-pr\"]
  }"
```

---

### Step 5: Parse Response and Extract PR Details

The API returns JSON like:

```json
{
  "id": 123456789,
  "number": 42,
  "state": "open",
  "title": "fix: Add null check to task controller",
  "html_url": "https://github.com/smit-chauhan-groovy/Demo-Project/pull/42",
  "head": {
    "ref": "fix/BUG-123-description"
  },
  "base": {
    "ref": "main"
  }
}
```

Extract the PR URL and number:

```bash
# Use jq or grep/awk to parse
PR_URL=$(curl -s ... | jq -r '.html_url')
PR_NUMBER=$(curl -s ... | jq -r '.number')
```

---

### Complete PR Creation Command Template

```bash
# Full command with all variables
curl -s -X POST \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/$GITHUB_REPO/pulls" \
  -d '{
    "title": "fix: {PR_TITLE}",
    "body": "{PR_BODY_WITH_NEWLINES}",
    "head": "{BRANCH_NAME}",
    "base": "{BASE_BRANCH}",
    "labels": ["bug", "automated-pr"]
  }' | jq -r '{html_url, number, state}'
```

---

### Error Handling

**If API returns 401**: Token is invalid or expired
**If API returns 422**: Validation error (branch doesn't exist, PR already exists, etc.)
**If API returns 403**: Lack of permissions

---

### Using `jq` is Recommended

For parsing JSON responses, use `jq`:

```bash
# Check if jq is available
if command -v jq &> /dev/null; then
    # Use jq for parsing
    PR_URL=$(echo "$RESPONSE" | jq -r '.html_url')
else
    # Fallback to grep/awk
    PR_URL=$(echo "$RESPONSE" | grep -o '"html_url":"[^"]*' | cut -d'"' -f4)
fi
```

#### PR Labels

Automatically apply labels:
- `bug`
- `automated-pr`
- `bug-fix`
- Priority label from bug (if available)

#### PR Assignees

Assign to:
- Original bug assignee (if available)
- Default fallback assignee (if configured)

### 6. PR Validation

#### Post-Creation Validation

After creating PR, verify using REST API:

1. **PR Exists**:
   ```bash
   # Get PR details using API
   curl -s \
     -H "Authorization: Bearer $GITHUB_TOKEN" \
     -H "Accept: application/vnd.github+json" \
     "https://api.github.com/repos/$GITHUB_REPO/pulls/$PR_NUMBER"
   ```

2. **PR Status Checks**:
   ```bash
   # Get PR status (CI/CD, reviews, etc.)
   curl -s \
     -H "Authorization: Bearer $GITHUB_TOKEN" \
     -H "Accept: application/vnd.github+json" \
     "https://api.github.com/repos/$GITHUB_REPO/pulls/$PR_NUMBER" | jq '{state, mergeable, merged, review_decision}'
   ```

3. **PR Metadata**:
   - Title is correct
   - Description is complete
   - Labels are applied
   - Assignee is set

4. **Open PR in Browser** (for verification):
   ```bash
   # Extract PR URL and open
   PR_URL=$(curl -s ... | jq -r '.html_url')
   echo "PR created: $PR_URL"
   ```

#### PR Link Extraction

Extract and return:
```json
{
  "pr_url": "https://github.com/owner/repo/pull/42",
  "pr_number": 42,
  "pr_status": "open"
}
```

### 7. Output Generation

#### Success Output

```json
{
  "status": "success",
  "timestamp": "YYYY-MM-DD HH:MM:SS",
  "bug_id": "BUG-123",
  "branch": {
    "name": "fix/BUG-123-description",
    "base": "main",
    "commit_hash": "abc123..."
  },
  "pull_request": {
    "url": "https://github.com/owner/repo/pull/42",
    "number": 42,
    "title": "fix: Add null check to validator function",
    "status": "open",
    "draft": false
  },
  "metadata": {
    "modified_files": 1,
    "lines_added": 3,
    "lines_removed": 1,
    "test_results": {
      "total": 15,
      "passed": 15,
      "coverage": 85
    }
  }
}
```

#### Failure Output

```json
{
  "status": "failure",
  "timestamp": "YYYY-MM-DD HH:MM:SS",
  "bug_id": "BUG-123",
  "error": "Descriptive error message",
  "error_type": "branch_creation_failed|commit_failed|push_failed|pr_creation_failed",
  "retryable": true|false,
  "recovery_steps": ["step 1", "step 2"]
}
```

## Error Handling

### Git Operation Errors

**Branch Creation Failed**:
```json
{
  "status": "failure",
  "error": "Branch already exists: fix/BUG-123-description",
  "error_type": "branch_creation_failed",
  "retryable": true,
  "recovery_steps": [
    "Delete existing branch",
    "Create new branch with suffix",
    "Proceed with PR creation"
  ]
}
```

**Commit Failed**:
```json
{
  "status": "failure",
  "error": "Nothing to commit",
  "error_type": "commit_failed",
  "retryable": false,
  "recovery_steps": [
    "Verify changes exist",
    "Check git status"
  ]
}
```

**Push Failed**:
```json
{
  "status": "failure",
  "error": "Remote rejected push",
  "error_type": "push_failed",
  "retryable": true,
  "recovery_steps": [
    "Fetch latest from remote",
    "Rebase branch",
    "Retry push"
  ]
}
```

### PR Creation Errors

**PR Creation Failed**:
```json
{
  "status": "failure",
  "error": "GitHub API rate limit exceeded",
  "error_type": "pr_creation_failed",
  "retryable": true,
  "recovery_steps": [
    "Wait for rate limit reset",
    "Retry PR creation"
  ]
}
```

**PR Already Exists**:
```json
{
  "status": "success",
  "warning": "PR already exists for this bug",
  "existing_pr": {
    "url": "https://github.com/owner/repo/pull/42",
    "number": 42
  }
}
```

## Logging Protocol

### Log Entries

```bash
YYYY-MM-DD HH:MM - [PR] Creating branch for BUG-123
YYYY-MM-DD HH:MM - [PR] Branch created: fix/BUG-123-description
YYYY-MM-DD HH:MM - [PR] Created commit: abc123...
YYYY-MM-DD HH:MM - [PR] Pushed branch to remote
YYYY-MM-DD HH:MM - [PR] Created PR: https://github.com/owner/repo/pull/42
```

### Detailed Logging

In debug mode, also log:
- Full git commands executed
- Full commit message
- Full PR description
- Git command outputs
- API request/responses

## Safety Mechanisms

### Pre-Flight Checks

Before creating PR:
1. Verify git status is clean
2. Verify remote is reachable
3. Verify branch is based on latest main
4. Verify no merge conflicts

### Rollback Capability

If PR creation fails:
1. Keep branch with changes
2. Log failure details
3. Return failure with recovery steps
4. Do NOT delete branch (allows manual recovery)

### Force Push Protection

The agent MUST:
- ❌ NEVER use `--force` flag
- ❌ NEVER use `--force-with-lease` automatically
- ✅ ALWAYS use safe rebase
- ✅ ALWAYS resolve conflicts properly

## Examples

### Example 1: Successful PR Creation

**Input**:
```json
{
  "bug_id": "BUG-123",
  "fix_details": {
    "description": "Add null check to validator"
  },
  "test_results": {
    "total": 5,
    "passed": 5,
    "coverage": 90
  }
}
```

**Output**:
```json
{
  "status": "success",
  "branch": {
    "name": "fix/bug-123-add-null-check"
  },
  "pull_request": {
    "url": "https://github.com/owner/repo/pull/42",
    "number": 42
  }
}
```

### Example 2: PR with Multiple Files

**Input**:
```json
{
  "bug_id": "BUG-124",
  "fix_details": {
    "modified_files": [
      "src/utils/array.js",
      "src/utils/array.test.js"
    ]
  }
}
```

**PR Description**:
```markdown
## Summary
- Fixes #124: Array index out of bounds

## Changes
- **Modified Files**: src/utils/array.js, src/utils/array.test.js
- **Type**: Bug Fix
- **Impact**: Prevents crash when accessing invalid array indices

## Testing
- ✅ All tests passed (10/10)
- ✅ Coverage: 95%
...
```

## Configuration

### Environment Variables

**REQUIRED** - The following environment variable must be set:

```bash
# REQUIRED: GitHub Personal Access Token with repo permissions
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

To create a GitHub Personal Access Token:
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope (full control of private repositories)
3. Add to `.env` file: `GITHUB_TOKEN=ghp_your_token_here`

**OPTIONAL** - Additional configuration:

```bash
# Git Configuration
GIT_AUTHOR_NAME="Autonomous Bug Fixer"
GIT_AUTHOR_EMAIL="bot@example.com"
DEFAULT_BRANCH="main"

# GitHub Configuration (auto-detected from git remote if not set)
REPO_OWNER=owner
REPO_NAME=repository
# Or combined: GITHUB_REPO=owner/repo

# PR Configuration
PR_DRAFT=false
AUTO_MERGE=false
ASSIGN_DEFAULT_REVIEWER=false
DEFAULT_REVIEWER=username

# Branch Configuration
BRANCH_PREFIX=fix
BRANCH_SEPARATOR=-
```

### PR Templates

If repository has `.github/PULL_REQUEST_TEMPLATE.md`, use it as base and append test results.

### Protected Branches

If target branch is protected:
- Verify tests pass before creating PR
- Check if PR requires review before merge
- Respect branch protection rules

## Integration with Orchestrator

### Trigger

The Orchestrator invokes this agent when:
- All tests have passed
- Bug fix is complete and validated

### Handoff

After completion:
1. Return PR URL to Orchestrator
2. Orchestrator updates bug status
3. Orchestrator updates context files

## Performance Considerations

### Optimization

- Use shallow git clones for speed
- Parallelize git operations where possible
- Cache git credentials
- Use GitHub CLI for faster API calls

### Timeout Handling

- Branch creation: 10-second timeout
- Commit creation: 5-second timeout
- Push to remote: 30-second timeout
- PR creation: 15-second timeout

## Version History

- **1.1.0** (2026-03-08): Added GitHub REST API support
  - Added complete REST API implementation using curl
  - Made REST API the primary method (gh CLI is now optional)
  - Added detailed step-by-step PR creation protocol
  - Added GITHUB_TOKEN configuration requirement
  - Updated PR validation to use REST API

- **1.0.0** (2026-03-06): Initial PR Agent specification
  - Defined git operation protocol
  - Established PR creation process
  - Created safety mechanisms

---

**Agent Type**: Pull Request Creation
**Execution Model**: Git operations + GitHub REST API (via curl)
**Dependencies**: Git, curl, GITHUB_TOKEN
**Output**: JSON with PR URL
**Next Agent**: None (workflow complete)
