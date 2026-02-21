#!/bin/bash
# SessionStart hook: Verify Node.js environment and build state on session start.
# Output goes to Claude's context so it knows the current project state.

set -e
cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || cd "$(dirname "$0")/../.." 2>/dev/null || {
    echo "Failed to change directory to project dir" >&2
    exit 1
}

echo "=== House of Veritas Session Start ==="

export PATH="$HOME/.local/bin:$PATH"

# Check Node.js
if command -v node &>/dev/null; then
    NODE_VERSION=$(node --version 2>/dev/null || echo "unknown")
    echo "Node: $NODE_VERSION"
else
    echo "WARNING: Node.js not found. Install Node.js 18+ to proceed."
fi

# Check npm
if command -v npm &>/dev/null; then
    NPM_VERSION=$(npm --version 2>/dev/null || echo "unknown")
    echo "npm: $NPM_VERSION"
else
    echo "WARNING: npm not found."
fi

# Install dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm ci --silent 2>&1 || echo "WARNING: npm ci failed. Run 'npm install' manually."
fi

# Heavy checks are opt-in via CLAUDE_FULL_CHECK=1
if [ "${CLAUDE_FULL_CHECK:-0}" = "1" ]; then
    echo "Type-checking..."
    BUILD_OUTPUT=$(npx tsc --noEmit 2>&1 || true)
    ERROR_COUNT=$(echo "$BUILD_OUTPUT" | grep -c "error TS" || true)
    if [ "$ERROR_COUNT" = "0" ]; then
        echo "TypeScript: PASSED"
    else
        echo "TypeScript: $ERROR_COUNT errors (check with npx tsc --noEmit)"
    fi

    LINT_OUTPUT=$(npm run lint 2>&1 || true)
    if echo "$LINT_OUTPUT" | grep -q "error"; then
        echo "Lint: HAS ERRORS"
    else
        echo "Lint: PASSED"
    fi

    TEST_OUTPUT=$(npm test -- --run 2>&1 || true)
    if echo "$TEST_OUTPUT" | grep -q "Tests.*passed"; then
        PASS_COUNT=$(echo "$TEST_OUTPUT" | grep -oE '[0-9]+ passed' | head -1 || echo "?")
        echo "Tests: $PASS_COUNT"
    else
        echo "Tests: CHECK NEEDED"
    fi
else
    echo "Skipping heavy checks (set CLAUDE_FULL_CHECK=1 to enable)"
fi

# Git status summary
BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
CHANGED=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
echo "Git: branch=$BRANCH, uncommitted=$CHANGED"

# Load orchestrator state if it exists
if [ -f ".claude/state/orchestrator.json" ]; then
    if command -v jq &>/dev/null; then
        LAST_PHASE=$(jq -r '.last_phase_completed // "?"' .claude/state/orchestrator.json 2>/dev/null || echo "?")
        NEXT_ACTION=$(jq -r '.next_action // "none"' .claude/state/orchestrator.json 2>/dev/null || echo "none")
    elif command -v python3 &>/dev/null; then
        LAST_PHASE=$(python3 -c "import json; d=json.load(open('.claude/state/orchestrator.json')); print(d.get('last_phase_completed','?'))" 2>/dev/null || echo "?")
        NEXT_ACTION=$(python3 -c "import json; d=json.load(open('.claude/state/orchestrator.json')); print(d.get('next_action','none'))" 2>/dev/null || echo "none")
    else
        LAST_PHASE="?"
        NEXT_ACTION="none"
    fi
    echo "Orchestrator: phase=$LAST_PHASE, next=$NEXT_ACTION"
fi

echo "=== Ready ==="
