# MCP Server Configuration

Project-level MCP servers are configured in `.cursor/mcp.json`. Restart Cursor after changes.

## Configured Servers

### Playwright (`playwright`)
- **Package:** `@playwright/mcp`
- **Purpose:** Browser automation, E2E test generation, web interaction for AI agents
- **Requires:** Node.js 18+, Playwright browsers (`npx playwright install`)

### Storybook (`storybook`)
- **Package:** `storybook-mcp-server`
- **Purpose:** Component discovery, story management, visual testing
- **Requires:** Node.js 18+, running Storybook instance (`npm run storybook` on port 6006)
- **Note:** Enable when Storybook is added to the project

## Other Useful MCPs (configure globally)

- **cursor-ide-browser** – Browser automation (Playwright-based)
- **context7** / **compound-engineering** – Library documentation lookup
- **filesystem** – File operations
- **memory** – Persistent context

## Adding a New MCP

1. Add to `mcpServers` in `.cursor/mcp.json`:
```json
"server-name": {
  "command": "npx",
  "args": ["-y", "package-name"],
  "env": {}
}
```
2. Restart Cursor
3. Verify in Cursor Settings → Tools & MCP
