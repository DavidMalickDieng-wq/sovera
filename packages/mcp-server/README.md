# @gardia/mcp

**Model Context Protocol server for Gardia** — connect Claude Desktop, Cursor, VS Code Copilot, Lovable, Windsurf, Continue.dev, Cline, or any MCP-capable agent to your Gardia project in 30 seconds.

Built on the [official MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk). Wraps your Gardia Functions API as native MCP tools so an agent can read tables, run SQL, do semantic search over your vectors, publish realtime messages, list blobs, and tail logs — all with your existing API key and tenant isolation enforced server-side.

## Install & run

```bash
GARDIA_URL=https://your-fn.azurewebsites.net \
GARDIA_KEY=sov_live_xxx \
GARDIA_READ_ONLY=1 \
npx -y @gardia/mcp
```

## Connect to Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "gardia": {
      "command": "npx",
      "args": ["-y", "@gardia/mcp"],
      "env": {
        "GARDIA_URL": "https://your-fn.azurewebsites.net",
        "GARDIA_KEY": "sov_live_xxx",
        "GARDIA_READ_ONLY": "1"
      }
    }
  }
}
```

Restart Claude Desktop. Ask "Show me the schema of my Gardia database" — it'll use the tools.

## Connect to Cursor / VS Code / Continue.dev / Windsurf

All MCP-aware editors accept the same JSON. See the **MCP** page inside Gardia Studio for one-click copy snippets per editor.

## Tools

| Tool | What it does |
|---|---|
| `gardia_sql` | Run SQL (read-only by default — set `GARDIA_READ_ONLY=0` for writes). |
| `gardia_tables_list` | List tables with column counts and row estimates. |
| `gardia_tenants_list` | List all tenants in the project. |
| `gardia_vector_search` | Semantic search over your embeddings — RAG-ready. |
| `gardia_vector_embed` | Embed and store text chunks for later retrieval. |
| `gardia_realtime_publish` | Publish to a Web PubSub channel. |
| `gardia_blob_list` | List blobs in a storage container. |
| `gardia_logs` | Query recent Functions logs from App Insights. |
| `gardia_compliance_status` | HDS/GDPR posture, encryption, RBAC. |

## Resources

- `gardia://project` — project URL, tenant scope, read-only flag.
- `gardia://schema` — full table/column metadata.

## Safety

- **API keys are tenant-locked server-side** — the agent cannot escape its scope.
- **`GARDIA_READ_ONLY=1`** (default in our examples) rejects `INSERT`/`UPDATE`/`DELETE`/`DROP` SQL and disables embed/publish tools.
- Every call is **audited** in `app.audit_log` with actor=key-id.
- No data leaves your subscription — the MCP server runs locally, calling your own Azure Functions.

## Source

[github.com/Quantumboxai/gardia/tree/main/packages/mcp-server](https://github.com/Quantumboxai/gardia/tree/main/packages/mcp-server) · MIT licensed.
