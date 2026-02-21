#!/bin/bash
# PostToolUse hook: After file edits, warn about uncommitted changes.
# Non-blocking — informational only (always exits 0).

cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || exit 0

if ! command -v git &>/dev/null; then
    exit 0
fi

CHANGED=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')

if [ "$CHANGED" -ge 10 ]; then
    echo "WARNING: $CHANGED uncommitted changes. Consider committing to avoid losing work." >&2
fi

exit 0
