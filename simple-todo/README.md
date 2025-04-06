# simple-todo

Pythonで実装されたMCPサーバーを使用したシンプルなTodoアプリケーションです。このアプリケーションは、MCPツールを通じてTodoの管理を行う機能を提供します。

## 機能

- **Todoの取得**: 現在のTodoリストを取得します。
- **Todoの追加**: 新しいTodoを追加します。
- **Todoの更新**: Todoのステータスを更新します。
- **Todoの削除**: 指定したTodoを削除します。
- **MCPツール**: MCPプロトコルを使用して、Todoの操作を行うツールを提供します。

## 使用方法

1. アプリケーションを起動します:
   ```bash
   uv run main.py
   ```

2. ブラウザで`http://localhost:8000`にアクセスして、Todoを追加します。

3. AI（MCPインストール済み）に次のように指示します:
   ```text
    現在のTodoリストを確認し、各タスクに対する回答を提供してください。その後、回答済みのタスクのステータスを'Open'から'Done'に変更してください。一度に全てのタスクの回答とステータス変更を行い、結果をまとめて返してください。
   ```

## MCP設定例 (Clineで使用する場合)

以下は、Clineで使用するためのMCP設定例です:

```json
{
  "mcpServers": {
    "simple-todo": {
      "timeout": 60,
      "url": "http://localhost:8000/sse",
      "transportType": "sse"
    }
  }
}
```

## MCPツールの詳細

- **get_todos**:
  - 説明: 現在のTodoリストを取得します。
  - 入力スキーマ: なし

- **add_todo**:
  - 説明: 新しいTodoを追加します。
  - 入力スキーマ:
    ```json
    {
      "type": "object",
      "required": ["body"],
      "properties": {
        "body": {"type": "string"}
      }
    }
    ```

- **update_todo**:
  - 説明: Todoのステータスを更新します。
  - 入力スキーマ:
    ```json
    {
      "type": "object",
      "required": ["id", "status"],
      "properties": {
        "id": {"type": "integer"},
        "status": {"type": "string", "enum": ["Open", "Done", "Pending"]}
      }
    }
    ```

## 開発者向け情報

- **依存関係**:
  - `starlette`
  - `uvicorn`
  - `mcp`

- **サーバーのエンドポイント**:
  - `/todos`: Todoの取得、追加、削除、更新
  - `/sse`: MCPサーバーとの通信
  - `/static`: 静的ファイルの提供
