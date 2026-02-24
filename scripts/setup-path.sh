#!/bin/sh
# Add node_modules/.bin to PATH so next, eslint, prettier, vitest work when run directly
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BIN_PATH="$SCRIPT_DIR/../node_modules/.bin"
if [ -d "$BIN_PATH" ]; then
  export PATH="$BIN_PATH:$PATH"
  echo "Added to PATH: $BIN_PATH"
else
  echo "Run 'npm ci' or 'npm install' first"
fi
