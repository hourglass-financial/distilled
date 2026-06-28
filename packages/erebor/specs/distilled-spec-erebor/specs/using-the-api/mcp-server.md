> For a complete page index, fetch https://docs.erebor.bank/llms.txt

# MCP server

Erebor exposes a Model Context Protocol server at `https://docs.erebor.bank/_mcp/server` so AI coding tools — Claude Code, Codex, Cursor, VS Code, and others — can query these docs directly. Access uses the same password that gates this site.

## Get a token

Every tool authenticates with a `FERN_TOKEN` header. Mint one — a JWT valid for 30 days — and print it. Requires `curl` and `awk` (both preinstalled on macOS and most Linux distros).

```sh
trap 'stty echo' INT EXIT
printf "Docs password: " >&2
stty -echo; read -r DOCS_PASS; stty echo; printf "\n" >&2
if [ -z "$DOCS_PASS" ]; then
  echo "No password entered — aborted." >&2
else
  curl -s -D - -o /dev/null -X POST https://docs.erebor.bank/api/fern-docs/auth/password \
    -H 'Content-Type: application/json' \
    -d "{\"password\":\"$DOCS_PASS\"}" \
    | awk -F'[=;]' '/^[Ss]et-[Cc]ookie:.*fern_token=/ {print $2}'
fi
trap - INT EXIT
```

Copy the printed value into the config for your tool below. When it expires, re-run this and update your config.

## Add to your editor

In each example, replace `<token>` with the value you just minted.

Claude Code stores the header for you — run:

```sh
claude mcp add --transport http erebor-api-docs https://docs.erebor.bank/_mcp/server \
  --header "FERN_TOKEN: <token>"
```

Add to `~/.codex/config.toml`:

```toml
[mcp_servers.erebor-api-docs]
url = "https://docs.erebor.bank/_mcp/server"

[mcp_servers.erebor-api-docs.http_headers]
FERN_TOKEN = "<token>"
```

Add to `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (per project):

```json
{
  "mcpServers": {
    "erebor-api-docs": {
      "url": "https://docs.erebor.bank/_mcp/server",
      "headers": { "FERN_TOKEN": "<token>" }
    }
  }
}
```

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "erebor-api-docs": {
      "type": "http",
      "url": "https://docs.erebor.bank/_mcp/server",
      "headers": { "FERN_TOKEN": "<token>" }
    }
  }
}
```

For a stdio-only client (Windsurf, Cline, Zed, and others), bridge to the remote server with [`mcp-remote`](https://www.npmjs.com/package/mcp-remote):

```json
{
  "mcpServers": {
    "erebor-api-docs": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://docs.erebor.bank/_mcp/server", "--header", "FERN_TOKEN: <token>"]
    }
  }
}
```