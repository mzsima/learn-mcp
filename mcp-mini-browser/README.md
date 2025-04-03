# MCP Mini Browser

このアプリは、Fletを使用して作成されたシンプルなミニブラウザです。MCPサーバーを組み込み、チャット入力を通じて表示するURLを動的に更新することができます。

## 機能

- 初期状態でGoogle（`https://www.google.com`）を表示するWebViewを提供。
- MCPサーバーツール（`update_url`）を使用して、WebViewのURLを動的に更新可能。
- 軽量で簡単に使用可能。

## 動作概要

1. アプリケーション起動時、WebViewはGoogleを表示します。
2. MCPサーバーがバックグラウンドで動作し、`update_url`というツールを提供します。
3. `update_url`ツールを呼び出して、新しいURLを指定すると、WebViewがそのURLを表示します。

## 使用方法

1. アプリケーションを実行します:
   ```bash
   python main.py
   ```
2. MCPサーバーを使用してWebViewのURLを更新します:
   - `update_url`ツールを呼び出し、パラメータとして新しいURLを指定します。

## 起動
```bash
uv run main.py
```

## mcp_setting (cline)
```json
{
  "mcpServers": {
    "flet-mcp-simple": {
      "timeout": 60,
      "command": "/path/to/uv",
      "args": [
        "--directory",
        "/path/to/mcp-mini-browser",
        "run",
        "main.py"
      ],
      "env": {},
      "transportType": "stdio"
    }
  }
}
```