# mcp-simple-sse

Pythonで実装されたMCPサーバーで、Server-Sent Events (SSE) を使用して通信を行います。このアプリケーションは、ウェブサイトのコンテンツを取得し、構造化された形式で返すツールを提供します。

## 機能

- **ウェブサイトのコンテンツ取得**: 指定されたURLのHTMLを解析し、テキストコンテンツを抽出。
- **HTTPリクエスト**: `httpx` を使用してウェブサイトにアクセス。
- **HTML解析**: `BeautifulSoup` を使用してHTMLを解析し、不要な空行を除去したテキストを生成。

## 使用方法

MCP設定：　（Clineでためしてます）

例：
```json
"mcp-website-fetcher": {
    "url": "http://localhost:8000/sse",
    "disabled": false,
    "autoApprove": []
}
```
