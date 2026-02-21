#!/bin/bash
# PreToolUse hook: Block writes to sensitive files.
# Exit 2 = block the operation. Exit 0 = allow.

export PATH="$HOME/.local/bin:$PATH"

if ! command -v jq &>/dev/null; then
    echo "WARNING: jq not available; protect-sensitive hook skipped." >&2
    exit 0
fi

INPUT=$(cat)

FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
JQ_EXIT=$?
if [ $JQ_EXIT -ne 0 ]; then
    echo "WARNING: Failed to parse tool input." >&2
    exit 0
fi

if [ -z "$FILE_PATH" ]; then
    exit 0
fi

BLOCKED_PATTERNS=(
    ".env.local"
    ".env.production"
    "terraform.tfvars"
    "secrets.json"
    "azure-credentials.json"
    ".pfx"
    ".key"
    ".pem"
    "credentials"
    ".azure/config"
    "backend.hcl"
)

for pattern in "${BLOCKED_PATTERNS[@]}"; do
    if [[ "$FILE_PATH" == *"$pattern"* ]]; then
        echo "BLOCKED: Cannot modify sensitive file: $FILE_PATH" >&2
        exit 2
    fi
done

exit 0
