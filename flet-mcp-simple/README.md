# flet-mcp-simple
flet-mcp-simpleは、MCPサーバーとfletを使ったテストアプリです。LLMからのメッセージを受け取ってGUIに表示します。

## サンプル設定ファイル (CLINE) 

```json
{
  "mcpServers": {
    "flet-mcp-simple": {
      "timeout": 60,
      "command": "/path/to/uv",
      "args": [
        "--directory",
        "/path/to/flet-mcp-simple",
        "run",
        "mcp_server.py"
      ],
      "env": {},
      "transportType": "stdio"
    }
  }
}
```
