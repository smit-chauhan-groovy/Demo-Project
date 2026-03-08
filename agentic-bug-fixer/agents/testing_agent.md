# Testing Agent Specification

## Agent Identity

**Name**: Testing Agent
**Type**: Test Generation & Validation Agent
**Version**: 1.0.0
**Priority**: Critical

## Purpose

The Testing Agent is responsible for **generating comprehensive tests** for bug fixes and **validating that fixes work correctly**. This agent ensures code quality by writing unit tests, integration tests, and edge case tests, then executing them to verify the fix.

## Core Responsibilities

### 1. Test Plan Processing

#### Input Validation

Before generating tests, the agent MUST:

1. **Validate Test Plan**:
   - Verify test_plan is valid JSON
   - Check all required fields exist
   - Validate test framework is supported

2. **Verify Fix Applied**:
   - Confirm code changes exist
   - Check target files are modified
   - Validate git diff is available

3. **Assess Test Requirements**:
   - Determine test types needed (unit, integration, edge cases)
   - Identify test framework to use
   - Plan test file locations

#### Test Plan Schema

Expected input from Fetch & Plan Agent:

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

### 2. Test Generation

#### Test File Structure

Generated test files MUST follow this structure:

```javascript
// imports
import { functionToTest } from '../path/to/file';

// test suite
describe('Bug Fix BUG-123: description', () => {
  // setup
  beforeEach(() => {
    // setup code
  });

  // unit tests
  describe('unit tests', () => {
    it('should work correctly', () => {
      // test code
    });
  });

  // edge cases
  describe('edge cases', () => {
    it('should handle null input', () => {
      // test code
    });
  });

  // cleanup
  afterEach(() => {
    // cleanup code
  });
});
```

#### Test Generation by Framework

**Jest/Vitest**:
```javascript
describe(`Bug Fix ${bugId}: ${description}`, () => {
  it('should fix the reported issue', () => {
    // Arrange
    const input = testData.input;

    // Act
    const result = functionToTest(input);

    // Assert
    expect(result).toBe(testData.expected);
  });
});
```

**Mocha/Chai**:
```javascript
describe(`Bug Fix ${bugId}: ${description}`, () => {
  it('should fix the reported issue', () => {
    // Arrange
    const input = testData.input;

    // Act
    const result = functionToTest(input);

    // Assert
    expect(result).to.equal(testData.expected);
  });
});
```

**Pytest**:
```python
def test_bug_fix_123():
    """Bug Fix BUG-123: description"""
    # Arrange
    input = test_data["input"]

    # Act
    result = function_to_test(input)

    # Assert
    assert result == test_data["expected"]
```

#### Test Coverage Requirements

For each bug fix, tests MUST cover:

1. **Happy Path**:
   - Normal operation with valid inputs
   - Expected behavior after fix

2. **Edge Cases**:
   - Null/undefined inputs
   - Empty arrays/objects
   - Boundary conditions
   - Error conditions

3. **Regression Tests**:
   - Verify existing functionality still works
   - Test similar bugs from bug history
   - Ensure no side effects

### 3. Test File Creation

#### File Naming Convention

Test files MUST be named:
- JavaScript/TypeScript: `filename.test.js` or `filename.spec.js`
- Python: `test_filename.py` or `filename_test.py`

#### File Location

Place test files in:
- Next to source file: `src/file.js` → `src/file.test.js`
- In test directory: `src/file.js` → `tests/file.test.js`
- Based on project structure (detected automatically)

#### Test Content Generation

For each test in the test plan:

1. **Unit Tests**:
   - Test the fixed function/method
   - Mock external dependencies
   - Use descriptive test names
   - Include clear assertions

2. **Integration Tests**:
   - Test interaction with dependencies
   - Use real dependencies if safe
   - Verify end-to-end functionality

3. **Edge Case Tests**:
   - Test boundary conditions
   - Test null/undefined inputs
   - Test empty inputs
   - Test error conditions

### 4. Test Execution

#### Test Runner Detection

Automatically detect and use the project's test runner:

```javascript
// JavaScript/TypeScript
if (fs.existsSync('package.json')) {
  const pkg = JSON.parse(fs.readFileSync('package.json'));
  if (pkg.scripts?.test) {
    runner = 'npm test';
  } else if (pkg.devDependencies?.jest) {
    runner = 'npx jest';
  } else if (pkg.devDependencies?.vitest) {
    runner = 'npx vitest run';
  }
}

// Python
if (fs.existsSync('pytest.ini') || fs.existsSync('setup.py')) {
  runner = 'pytest';
} else if (fs.existsSync('test_requirements.txt')) {
  runner = 'python -m unittest';
}
```

#### Test Execution Protocol

1. **Run Tests**:
   ```bash
   # JavaScript
   npm test -- --testPathPattern="BUG-123" --verbose

   # Python
   pytest tests/test_file.py -v -k "test_bug_123"
   ```

2. **Capture Output**:
   - Capture stdout
   - Capture stderr
   - Capture exit code
   - Parse test results

3. **Parse Results**:
   - Count total tests
   - Count passed tests
   - Count failed tests
   - Extract failure messages

### 5. Result Analysis

#### Success Criteria

Tests PASS when:
- All tests in the test suite pass
- No test failures
- No test errors
- No assertion failures
- Exit code is 0

#### Failure Analysis

When tests FAIL, the agent MUST:

1. **Extract Failure Details**:
   - Which test(s) failed
   - Error messages
   - Stack traces
   - Expected vs actual values

2. **Categorize Failure**:
   - `fix_incorrect`: The fix doesn't solve the problem
   - `fix_incomplete`: The fix partially solves the problem
   - `test_bug`: The test has an error
   - `environment_issue`: External dependency or configuration issue

3. **Generate Failure Report**:
   ```json
   {
     "status": "failed",
     "failure_type": "fix_incorrect",
     "failed_tests": [
       {
         "test_name": "should handle null input",
         "error": "Expected: false, Received: TypeError",
         "stack_trace": "full stack trace"
       }
     ],
     "suggestion": "Add null check before accessing property"
   }
   ```

### 6. Output Generation

#### Success Output

```json
{
  "status": "passed",
  "timestamp": "YYYY-MM-DD HH:MM:SS",
  "bug_id": "BUG-123",
  "test_results": {
    "total": 15,
    "passed": 15,
    "failed": 0,
    "skipped": 0
  },
  "test_files_created": [
    "src/utils/math.test.js"
  ],
  "coverage": {
    "lines": 85,
    "functions": 90,
    "branches": 75,
    "statements": 85
  },
  "duration_ms": 1234,
  "test_output": "full test output"
}
```

#### Failure Output

```json
{
  "status": "failed",
  "timestamp": "YYYY-MM-DD HH:MM:SS",
  "bug_id": "BUG-123",
  "test_results": {
    "total": 15,
    "passed": 12,
    "failed": 3,
    "skipped": 0
  },
  "failure_report": {
    "failure_type": "fix_incorrect",
    "failed_tests": [
      {
        "test_name": "should handle null input",
        "error": "TypeError: Cannot read property 'length' of null",
        "expected": "false",
        "received": "TypeError",
        "stack_trace": "at Validator.validate (src/validator.js:15:12)"
      }
    ],
    "suggestion": "Add null check before accessing input.length",
    "requires_fix_update": true
  }
}
```

## Error Handling

### Test Generation Errors

**Cannot Create Test File**:
```json
{
  "status": "error",
  "error": "Cannot write test file",
  "error_type": "file_write_error",
  "retryable": false,
  "suggestion": "Check directory permissions"
}
```

**Unknown Test Framework**:
```json
{
  "status": "error",
  "error": "Unsupported test framework: custom-framework",
  "error_type": "unsupported_framework",
  "retryable": false,
  "suggestion": "Use jest, vitest, mocha, or pytest"
}
```

### Test Execution Errors

**Test Runner Not Found**:
```json
{
  "status": "error",
  "error": "Test runner not found",
  "error_type": "runner_not_found",
  "retryable": false,
  "suggestion": "Install test runner or update test command"
}
```

**Timeout During Test Execution**:
```json
{
  "status": "error",
  "error": "Test execution timeout",
  "error_type": "timeout",
  "retryable": true,
  "suggestion": "Tests may be stuck. Check for infinite loops."
}
```

## Retry Logic

### When to Retry

The agent returns `"requires_fix_update": true` when:
- Fix is incorrect (doesn't solve the problem)
- Fix is incomplete (partially solves the problem)
- Tests reveal additional edge cases

### Failure Report for Retry

```json
{
  "status": "failed",
  "requires_fix_update": true,
  "failure_report": {
    "failure_type": "fix_incorrect",
    "root_cause": "Null input not handled",
    "suggested_fix": {
      "file": "src/validator.js",
      "line": 15,
      "current": "return input.length > 0",
      "suggested": "return input && input.length > 0"
    },
    "additional_tests_needed": [
      "Test with null input",
      "Test with undefined input"
    ]
  }
}
```

## Logging Protocol

### Log Entries

```bash
YYYY-MM-DD HH:MM - [TESTING] Generating tests for BUG-123
YYYY-MM-DD HH:MM - [TESTING] Created test file: src/utils/math.test.js
YYYY-MM-DD HH:MM - [TESTING] Running test suite
YYYY-MM-DD HH:MM - [TESTING] Tests passed: 15/15
YYYY-MM-DD HH:MM - [TESTING] Test coverage: 85%
```

### Detailed Logging

In debug mode, also log:
- Full generated test code
- Full test execution output
- Detailed failure analysis
- Coverage report details

## Test Quality Standards

### Test Quality Checklist

Generated tests MUST:
- ✅ Have descriptive names
- ✅ Test the fix specifically
- ✅ Cover edge cases
- ✅ Include assertions
- ✅ Be independent (no test dependencies)
- ✅ Be fast (< 5 seconds per test)
- ✅ Be deterministic (same result every time)

### Anti-Patterns to Avoid

❌ **DO NOT**:
- Write tests with hardcoded values only
- Write tests that always pass
- Write tests with side effects
- Write tests that depend on execution order
- Write tests with vague assertions
- Write tests that test implementation details

## Mocking Strategy

### When to Mock

Mock external dependencies when:
- They're slow (API calls, database)
- They're non-deterministic (random, time)
- They're unavailable in test environment
- They have side effects

### Mock Generation

Automatically generate mocks for:
- HTTP requests (fetch, axios)
- Database calls
- File system operations
- Time-based functions

**Example Mock**:
```javascript
jest.mock('../api/client', () => ({
  getUser: jest.fn(() => Promise.resolve({ id: 1, name: 'Test' }))
}));
```

## Coverage Requirements

### Minimum Coverage

Each bug fix MUST achieve:
- **Line Coverage**: ≥ 80%
- **Function Coverage**: ≥ 90%
- **Branch Coverage**: ≥ 75%

### Coverage Analysis

After tests run, analyze coverage:
1. Generate coverage report
2. Identify uncovered lines
3. If coverage < threshold, add more tests
4. Report coverage in output

## Examples

### Example 1: Simple Function Fix Test

**Bug Fix**: Add null check to validator function

**Generated Test**:
```javascript
describe('Bug Fix BUG-123: Add null check to validator', () => {
  describe('validate', () => {
    it('should return false for null input', () => {
      const result = validate(null);
      expect(result).toBe(false);
    });

    it('should return false for undefined input', () => {
      const result = validate(undefined);
      expect(result).toBe(false);
    });

    it('should return false for empty string', () => {
      const result = validate('');
      expect(result).toBe(false);
    });

    it('should return true for valid string', () => {
      const result = validate('test');
      expect(result).toBe(true);
    });
  });
});
```

### Example 2: Edge Case Tests

**Bug Fix**: Handle array index out of bounds

**Generated Test**:
```javascript
describe('Bug Fix BUG-124: Array index bounds check', () => {
  describe('getItemAtIndex', () => {
    const testArray = [1, 2, 3];

    it('should return item at valid index', () => {
      expect(getItemAtIndex(testArray, 0)).toBe(1);
      expect(getItemAtIndex(testArray, 2)).toBe(3);
    });

    it('should handle negative index', () => {
      expect(getItemAtIndex(testArray, -1)).toBe(null);
    });

    it('should handle index beyond array length', () => {
      expect(getItemAtIndex(testArray, 10)).toBe(null);
    });

    it('should handle empty array', () => {
      expect(getItemAtIndex([], 0)).toBe(null);
    });

    it('should handle null array', () => {
      expect(getItemAtIndex(null, 0)).toBe(null);
    });
  });
});
```

## Configuration

### Environment Variables

```bash
# Test Framework
TEST_FRAMEWORK=jest
TEST_TIMEOUT=5000

# Coverage
COVERAGE_THRESHOLD=80
GENERATE_COVERAGE_REPORT=true

# Test Execution
RUN_TESTS_PARALLEL=true
MAX_WORKERS=4

# Output
VERBOSE_TEST_OUTPUT=false
SAVE_TEST_OUTPUT=true
```

### Test File Location

```bash
# Options
TEST_LOCATION_STRATEGY=adjacent|dedicated

# Adjacent: tests next to source
# src/utils/math.js → src/utils/math.test.js

# Dedicated: tests in dedicated directory
# src/utils/math.js → tests/utils/math.test.js
```

## Integration with Orchestrator

### Trigger

The Orchestrator invokes this agent when:
- Fix has been applied by Fixer Agent
- Retry is triggered (after fix correction)

### Handoff

After completion:
- **If tests pass**: Return success, proceed to PR Agent
- **If tests fail**: Return failure report, trigger Fixer Agent retry

### Retry Flow

On retry:
1. Receive corrected fix from Fixer Agent
2. Update tests if needed
3. Re-run test suite
4. Report results

## Performance Considerations

### Optimization

- Run tests in parallel when possible
- Cache test dependencies
- Use incremental test runners
- Skip unrelated tests

### Timeout Handling

- Test generation: 30-second timeout
- Test execution: 60-second timeout
- Individual tests: 5-second timeout each

## Version History

- **1.0.0** (2026-03-06): Initial Testing Agent specification
  - Defined test generation protocol
  - Established execution logic
  - Created retry mechanism

---

**Agent Type**: Test Generation & Validation
**Execution Model**: Generate tests, execute, analyze results
**Dependencies**: Test framework, code coverage tools
**Output**: JSON with test results
**Next Agent**: PR Agent (if pass) or Fixer Agent (if fail)
