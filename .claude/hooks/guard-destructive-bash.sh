#!/bin/bash
# PreToolUse hook: Block destructive Bash commands.
# Exit 2 = block. Exit 0 = allow.

export PATH="/usr/bin:/bin:/usr/local/bin:$HOME/.local/bin:$PATH"

if ! command -v jq &>/dev/null; then
    echo "WARNING: jq not available; guard hook skipped." >&2
    exit 0
fi

INPUT=$(cat)

COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
JQ_EXIT=$?
if [ $JQ_EXIT -ne 0 ]; then
    exit 0
fi

if [ -z "$COMMAND" ]; then
    exit 0
fi

# Strip heredoc content to avoid false positives in commit messages
COMMAND_STRIPPED=$(echo "$COMMAND" | sed '/<<.*EOF/,/^EOF[[:space:]]*$/d; /<<.*HEREDOC/,/^HEREDOC[[:space:]]*$/d')

BLOCKED_PATTERNS=(
    "git push --force"
    "git push -f"
    "git reset --hard"
    "git clean -f"
    "git clean -df"
    "git clean -fd"
    "git checkout -- ."
    "git checkout ."
    "git restore ."
    "git branch -D"
    "terraform destroy"
    "terraform apply -auto-approve"
    "az group delete"
    "az resource delete"
)

for pattern in "${BLOCKED_PATTERNS[@]}"; do
    regex=$(printf '%s' "$pattern" | sed 's/\./\\./g')
    if [[ "$COMMAND_STRIPPED" =~ $regex([[:space:]]|$) ]]; then
        echo "BLOCKED: Destructive operation detected: '$pattern'. Ask the user for explicit confirmation first." >&2
        exit 2
    fi
done

if [[ "$COMMAND_STRIPPED" == *"rm -rf /"* ]] || [[ "$COMMAND_STRIPPED" == *"rm -rf ~"* ]]; then
    echo "BLOCKED: Cannot rm -rf outside the project directory." >&2
    exit 2
fi

exit 0
