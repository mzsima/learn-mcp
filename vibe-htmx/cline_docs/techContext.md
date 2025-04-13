# Tech Context

## 使用技術 (Technologies used)

*   **フロントエンド (ブラウザ側):**
    *   HTML5 (サーバーが生成)
    *   CSS3 (`static/style.css`)
    *   Vanilla JavaScript (必要最小限、`static/` 内に配置)
    *   htmx (`static/htmx.min.js`, サーバー通信とDOM更新を担当)
*   **バックエンド (サーバー側):**
    *   Python 3.13 (ランタイム)
    *   Flask (Webフレームワーク、ルーティング、リクエスト処理)
    *   ~~Jinja2 (テンプレートエンジン、Flask に同梱、サーバーサイドで HTML を生成)~~ - **原則使用しない**
*   **データベース:**
    *   SQLite 3 (Python 標準 `sqlite3` モジュールを使用、**サーバーサイドの API 経由でアクセス**)

## 開発セットアップ (Development setup)

*   **Python:** `.python-version` で指定された `3.13` を使用。
*   **パッケージ管理:** `uv` を使用して Python の依存関係を管理 (`pyproject.toml` に基づく)。
*   **Webフレームワーク:** Flask を使用。
*   **データベース:** Python 標準の `sqlite3` モジュールを使用。データベースファイル (`instance/database.db` 等) を配置。
*   **エディタ:** VS Code またはユーザーの好みのエディタ。
*   **バージョン管理:** Git を使用 (推奨)。`.gitignore` ファイルで仮想環境 (`.venv`) やデータベースファイルなどを管理対象外にする。
*   **実行:** データベース初期化は `uv run flask --app main init-db` を実行。開発サーバーの起動は `uv run flask --app main run --host=0.0.0.0 --port=5001` を使用する (仮想環境の有効化や `pip install` は不要)。Webブラウザで `http://localhost:5001` にアクセスする。

## 技術的制約 (Technical constraints)

*   **vibeコーディング:** 迅速な開発を優先し、過度な抽象化や複雑な設計パターンを避ける。
*   **シンプルな構成:** 大規模なフレームワークやライブラリの導入は最小限に留める。htmx と Vanilla JS でフロントエンドを構築。
*   **Python 依存:** `.rule` で指定された技術スタックは Node.js だったが、ユーザーの指示により Python (Flask) をサーバーサイド技術として使用する。既存の Python 関連ファイルを活用する。
*   **単一サーバー:** 基本的に単一の Python プロセス (Flask) でWebサーバーとAPIエンドポイント（htmx向け）を提供する。
*   **状態管理:** 状態は主にサーバーサイド (Python/Flask) とデータベース (SQLite) で管理する。クライアントサイド (ブラウザ) では複雑な状態を持たず、htmx/JS が API から取得したデータに基づいて UI を構築・更新する。
