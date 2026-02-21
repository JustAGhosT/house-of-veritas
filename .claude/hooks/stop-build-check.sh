#!/bin/bash
# Stop hook: Verify build and tests still pass before Claude finishes.
# Catches regressions introduced during the conversation.

cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || cd "$(dirname "$0")/../.." 2>/dev/null || {
    echo "Failed to change to project directory" >&2
    exit 1
}

if ! command -v npx &>/dev/null; then
    echo "Build check: SKIPPED (npx not found)"
    exit 0
fi

# TypeScript check
TS_OUTPUT=$(npx tsc --noEmit 2>&1 || true)
FAIL=0

TS_ERRORS=$(echo "$TS_OUTPUT" | grep -c "error TS" || true)
if [ "$TS_ERRORS" = "0" ]; then
    echo "TypeScript: PASSED"
else
    echo "TypeScript: FAILED ($TS_ERRORS errors)"
    echo "Fix type errors before finishing."
    echo "$TS_OUTPUT" | grep "error TS" | head -10
    FAIL=1
fi

# Unit tests
TEST_OUTPUT=$(npm test -- --run 2>&1 || true)
if echo "$TEST_OUTPUT" | grep -q "Tests.*passed"; then
    echo "Tests: PASSED"
elif echo "$TEST_OUTPUT" | grep -q "failed"; then
    FAIL_COUNT=$(echo "$TEST_OUTPUT" | grep -oE '[0-9]+ failed' | head -1 || true)
    echo "Tests: FAILED ($FAIL_COUNT)"
    echo "Fix failing tests before finishing."
    FAIL=1
else
    echo "Tests: CHECK NEEDED"
fi

# Git status
CHANGED=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
if [ "$CHANGED" -gt 0 ]; then
    echo "Git: $CHANGED uncommitted changes"
fi

exit $FAIL
