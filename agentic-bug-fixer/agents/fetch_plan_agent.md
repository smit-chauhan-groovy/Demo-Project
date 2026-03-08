# Fetch & Plan Agent Specification

## Agent Identity

**Name**: Fetch & Plan Agent
**Type**: Analysis Agent
**Version**: 1.0.0
**Priority**: High

## Purpose

The Fetch & Plan Agent is responsible for **retrieving bug information from Linear** and **generating comprehensive fix and test plans**. This agent serves as the intelligence layer of the autonomous bug fixing system, combining bug discovery with root cause analysis.

## Core Responsibilities

### 1. Linear API Integration

#### Authentication

- Use `LINEAR_API_KEY` environment variable
- Authenticate using Bearer token in Authorization header
- Handle authentication failures gracefully

#### Bug Retrieval Protocol

**Query Assigned Bugs**:

```graphql
query {
  issues(
    first: 1
    filter: { state: { name: { eq: "Todo" } }, labels: { name: { eq: "Bug" } } }
    orderBy: createdAt
  ) {
    nodes {
      id
      identifier
      title
      description
      url
      state {
        name
      }
      labels {
        nodes {
          name
        }
      }
    }
  }
}
```

**Response Processing**:

- Extract first assigned bug
- Validate bug has required fields
- Return structured bug information

### 2. Bug Analysis

#### Information Extraction

From the Linear issue, extract:

1. **Basic Information**:
   - Bug ID (e.g., "BUG-123")
   - Title
   - Description
   - Priority level
   - Labels/tags

2. **Context Information**:
   - Created date
   - Last updated
   - Assignee
   - Project/team
   - Related issues

3. **Bug Details**:
   - Expected behavior
   - Actual behavior
   - Steps to reproduce
   - Error messages
   - Stack traces (if any)

#### Root Cause Analysis

Analyze the bug to determine:

**Issue Classification**:

- `logic_error`: Incorrect algorithm or business logic
- `syntax_error`: Parse error or invalid code
- `type_error`: Type mismatch or invalid type usage
- `null_pointer`: Null/undefined reference
- `async_error`: Promise/async handling issue
- `api_error`: External API integration issue
- `ui_error`: Component rendering or behavior issue
- `performance_error`: Performance degradation
- `security_error`: Security vulnerability
- `other`: Unclassified issue

**Root Cause Identification**:

1. Read bug description carefully
2. Analyze error messages and stack traces
3. Review steps to reproduce
4. Identify the specific code location
5. Determine the underlying cause
6. Assess impact and severity

### 3. Context Gathering

#### Project Context Reading

Before generating a fix plan, the agent MUST read:

1. **`context/project_summary.md`**: Project overview and tech stack
2. **`context/architecture_map.md`**: System architecture

#### Codebase Analysis

Using the gathered context:

1. **Locate Target File**:
   - Use bug description and stack traces
   - Reference architecture map
   - Search codebase for relevant files
   - Identify the exact file and line numbers

2. **Understand Code Context**:
   - Read the target file
   - Analyze surrounding code
   - Identify dependencies
   - Understand the coding patterns used

### 4. Fix Plan Generation

#### Fix Plan Structure

Generate a structured fix plan:

```json
{
  "bug_id": "BUG-123",
  "title": "Bug title",
  "description": "Full bug description",
  "issue_type": "logic_error|syntax_error|type_error|null_pointer|async_error|api_error|ui_error|performance_error|security_error|other",
  "severity": "critical|high|medium|low",
  "root_cause": "Detailed analysis of the root cause",
  "target_file": "path/to/target/file.js",
  "target_function": "functionName",
  "target_line": 42,
  "proposed_fix": {
    "description": "Clear description of the fix",
    "approach": "minimal_change|refactor|rewrite",
    "changes": [
      {
        "file": "path/to/file.js",
        "line": 42,
        "current_code": "current code snippet",
        "fixed_code": "fixed code snippet",
        "explanation": "why this change fixes the bug"
      }
    ],
    "dependencies": [],
    "risks": []
  },
  "test_strategy": {
    "unit_tests": [
      {
        "description": "Test description",
        "input": "test input",
        "expected_output": "expected output"
      }
    ],
    "integration_tests": [],
    "edge_cases": ["Edge case 1", "Edge case 2"],
    "regression_tests": []
  },
  "related_issues": [],
  "estimated_complexity": "simple|moderate|complex"
}
```

#### Fix Planning Guidelines

**Principles**:

1. **Minimal Change**: Fix only what's broken
2. **No Side Effects**: Avoid breaking existing functionality
3. **Maintain Standards**: Follow existing code style
4. **Test Coverage**: Ensure fix is verifiable

**Approach Selection**:

- `minimal_change`: Fix the specific bug (95% of cases)
- `refactor`: Only if the code is fundamentally broken
- `rewrite`: Only for critical architectural issues

**Risk Assessment**:
Identify potential risks:

- Breaking changes to dependent code
- Performance implications
- Security considerations
- Edge cases not covered

### 5. Test Plan Generation

#### Test Types

**Unit Tests**:

- Test the fixed function/method
- Cover normal operation
- Cover edge cases
- Verify the fix works

**Integration Tests**:

- Test interaction with dependencies
- Verify end-to-end functionality
- Test API integrations

**Edge Case Tests**:

- Boundary conditions
- Null/undefined inputs
- Empty arrays/objects
- Error conditions

**Regression Tests**:

- Ensure existing functionality still works
- Test similar bugs from `bug_history.md`

#### Test Plan Structure

```json
{
  "test_plan": {
    "framework": "jest|vitest|mocha|pytest|jasmine",
    "unit_tests": [
      {
        "file": "path/to/test/file.test.js",
        "test_name": "descriptive test name",
        "description": "what this test verifies",
        "setup": "test setup code",
        "execution": "test execution code",
        "assertions": ["assertion1", "assertion2"],
        "cleanup": "test cleanup code"
      }
    ],
    "integration_tests": [],
    "edge_cases": [
      {
        "scenario": "description of edge case",
        "input": "test input",
        "expected": "expected behavior"
      }
    ],
    "mock_requirements": [
      {
        "module": "module/to/mock",
        "reason": "why this needs mocking"
      }
    ],
    "test_data_requirements": []
  }
}
```

### 6. Output Generation

#### Final Output Format

The agent MUST produce this final JSON output:

```json
{
  "status": "success|failure",
  "timestamp": "YYYY-MM-DD HH:MM:SS",
  "bug": {
    "id": "BUG-123",
    "title": "Bug title",
    "description": "Full description",
    "priority": "urgent|high|medium|low",
    "labels": ["bug", "frontend"],
    "url": "https://linear.app/issue/BUG-123"
  },
  "analysis": {
    "issue_type": "logic_error",
    "severity": "high",
    "root_cause": "Detailed root cause analysis",
    "target_location": {
      "file": "src/components/Button.js",
      "function": "handleClick",
      "line": 42
    }
  },
  "fix_plan": {
    "approach": "minimal_change",
    "description": "Fix description",
    "changes": [
      {
        "file": "src/components/Button.js",
        "line": 42,
        "current": "current code",
        "fixed": "fixed code",
        "reason": "explanation"
      }
    ],
    "risks": [],
    "complexity": "simple"
  },
  "test_plan": {
    "framework": "jest",
    "test_count": 5,
    "unit_tests": [],
    "edge_cases": [],
    "regression_tests": []
  },
  "context_references": {
    "similar_bugs": ["BUG-100", "BUG-105"],
    "related_modules": ["Button", "Form"],
    "dependencies": ["react", "lodash"]
  }
}
```

## Input Requirements

### Environment Variables

```bash
LINEAR_API_KEY=your_linear_api_key
LINEAR_TEAM_ID=your_team_id
```

### Required Context Files

The agent requires these context files to exist:

- `context/project_summary.md`
- `context/architecture_map.md`
- `context/module_map.md`
- `context/bug_history.md`

## Output Protocol

### Success Output

When successful, the agent:

1. Returns the JSON output above

### Failure Output

When failed, the agent returns:

```json
{
  "status": "failure",
  "error": "Descriptive error message",
  "timestamp": "YYYY-MM-DD HH:MM:SS",
  "retryable": true|false
}
```

## Error Handling

### Linear API Errors

**Authentication Failure**:

- Log error
- Return failure with `retryable: false`
- Do NOT retry (manual intervention required)

**Network Timeout**:

- Log warning
- Return failure with `retryable: true`
- Orchestrator will retry

**No Bugs Found**:

- Log info message
- Return success with empty bug data
- Workflow terminates gracefully

### Analysis Errors

**Unable to Locate File**:

- Log warning
- Use best guess based on bug description
- Mark fix plan as `estimated_complexity: "complex"`

**Insufficient Context**:

- Log warning
- Proceed with available information
- Note uncertainty in fix plan

**Ambiguous Root Cause**:

- Log warning
- Provide multiple possible causes
- Recommend testing approach

## Logging Protocol

### Log Entries

All actions must be logged:

```
YYYY-MM-DD HH:MM - [FETCH_PLAN] Connected to Linear API
YYYY-MM-DD HH:MM - [FETCH_PLAN] Retrieved bug BUG-123
YYYY-MM-DD HH:MM - [FETCH_PLAN] Analyzing bug: Title
YYYY-MM-DD HH:MM - [FETCH_PLAN] Root cause identified: logic_error
YYYY-MM-DD HH:MM - [FETCH_PLAN] Fix plan generated (simple complexity)
YYYY-MM-DD HH:MM - [FETCH_PLAN] Test plan generated (5 tests)
```

## Quality Assurance

### Fix Plan Validation

Before returning, validate:

- ✅ Target file exists in codebase
- ✅ Fix approach is minimal (not refactor unless necessary)
- ✅ Test plan covers the fix
- ✅ All required JSON fields present
- ✅ No breaking changes identified

### Test Plan Validation

Before returning, validate:

- ✅ Tests verify the fix works
- ✅ Edge cases are covered
- ✅ Test framework matches project
- ✅ Mock requirements are specified

## Integration with Orchestrator

### Trigger

The Orchestrator invokes this agent when:

- Workflow starts
- Previous bug is completed
- Manual trigger is received

### Handoff

After completion, the agent:

1. Returns JSON output to Orchestrator
2. Updates `state/workflow_state.md` (via Orchestrator)

## Performance Considerations

### Optimization

- Cache Linear API responses (5-minute TTL)
- Cache context file reads (until workflow completes)
- Parallelize context file reads if possible
- Use GraphQL query efficiently (request only needed fields)

### Timeout Handling

- Linear API request: 10-second timeout
- File reads: 5-second timeout each
- Total agent execution: 60-second timeout

## Examples

### Example 1: Simple Logic Error

**Bug Description**: "Button click doesn't update state"

**Analysis**:

```
Issue Type: logic_error
Root Cause: Missing setState call
Target: src/components/Button.js:42
```

**Fix Plan**:

```json
{
  "changes": [
    {
      "file": "src/components/Button.js",
      "line": 42,
      "current": "const handleClick = () => { doSomething(); }",
      "fixed": "const handleClick = () => { doSomething(); setState({ clicked: true }); }",
      "reason": "Added setState to update component state after click"
    }
  ]
}
```

**Test Plan**:

```json
{
  "unit_tests": [
    {
      "description": "Button click updates state",
      "input": "click event",
      "expected_output": "state.clicked === true"
    }
  ]
}
```

### Example 2: Type Error

**Bug Description**: "Function crashes when passed null"

**Analysis**:

```
Issue Type: null_pointer
Root Cause: Missing null check
Target: src/utils/validator.js:15
```

**Fix Plan**:

```json
{
  "changes": [
    {
      "file": "src/utils/validator.js",
      "line": 15,
      "current": "function validate(input) { return input.length > 0; }",
      "fixed": "function validate(input) { return input && input.length > 0; }",
      "reason": "Added null check before accessing input.length"
    }
  ]
}
```

**Test Plan**:

```json
{
  "edge_cases": [
    { "scenario": "null input", "input": "null", "expected": "returns false" },
    {
      "scenario": "undefined input",
      "input": "undefined",
      "expected": "returns false"
    },
    { "scenario": "empty string", "input": "''", "expected": "returns false" },
    {
      "scenario": "valid string",
      "input": "'test'",
      "expected": "returns true"
    }
  ]
}
```

## Version History

- **1.0.0** (2026-03-06): Initial Fetch & Plan Agent specification
  - Defined Linear integration
  - Established analysis protocol
  - Created fix and test plan structure

---

**Agent Type**: Analysis
**Execution Model**: One-shot analysis
**Dependencies**: Linear API, Context files
**Output**: JSON fix and test plans
**Next Agent**: Fixer Agent
