# flet-mcp-simple
flet-mcp-simpleは、MCPサーバーとfletを使ったテストアプリです。LLMからのメッセージを受け取ってGUIに表示します。

## サンプル設定ファイル (CLINE) 

以下は、個人情報を含まないサンプル設定ファイルです:

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