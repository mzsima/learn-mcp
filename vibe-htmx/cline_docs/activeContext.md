# Active Context

## 現在作業中の内容 (What you're working on now)

プロジェクトの初期セットアップと Memory Bank ファイルの作成。Webホワイトボードアプリケーションの基本的な骨組みを構築する準備段階。

## 最近の変更点 (Recent changes)

*   `cline_docs/` ディレクトリの作成。
*   `productContext.md` ファイルの作成と内容の記述。

## 最近の変更点 (Recent changes)

*   **メモ移動機能 (Update - Position) の実装:**
    *   `templates/index.html`: ドラッグ＆ドロップ用の JavaScript と、htmx.ajax を使った PUT `/api/notes/<id>/position` リクエスト送信を実装。
    *   `main.py`: メモ位置更新用の PUT `/api/notes/<int:note_id>/position` ルートを追加。
*   **メモ編集機能 (Update - Content) の実装:**
    *   `templates/index.html`: ダブルクリックで `<textarea>` に置換し、blur/Enter で PUT `/api/notes/<id>` を送信する JavaScript を実装。htmx 属性 (`hx-put`, `hx-target`, `hx-swap`) を `<textarea>` に動的に追加。
    *   `main.py`: メモ内容更新用の PUT `/api/notes/<int:note_id>` ルートを追加し、更新後の HTML フラグメントを返すように修正。
*   **メモ削除機能 (Delete) の実装:**
    *   `main.py`: メモ削除用の DELETE `/api/notes/<int:note_id>` ルートを追加。
    *   `main.py`: `get_notes`, `add_note`, `update_note_content` で生成する HTML に削除ボタン (`hx-delete` 付き) を追加。
    *   `static/style.css`: 削除ボタンのスタイルを追加・調整。
*   **リファクタリング:**
    *   `main.py` の HTML 生成ロジックを `_generate_note_html` ヘルパー関数に共通化。
    *   **HTML と JavaScript の分離:** `templates/index.html` 内のインライン JavaScript を `static/script.js` に移動し、`index.html` から参照するように修正。
    *   **フロントエンドエラーハンドリング:** `static/script.js` 内の主要な操作 (位置更新、編集開始) に基本的な `alert` によるエラーフィードバックを追加。
    *   **CSS 改善:** `static/style.css` を整理し、全体的なルックフィール、メモ、フォーム、編集中のテキストエリア、削除ボタンのスタイルを改善。不要なルール (`.note:active`, `.note-content` の `pointer-events`) を削除。
    *   **UI/UX 微調整:** ドラッグ中の視覚的フィードバックを実装 (`static/script.js` で `dragging` クラスを付与し、`static/style.css` でスタイル定義)。
*   **バグ修正:**
    *   `main.py`: `_generate_note_html` ヘルパー関数内で `sqlite3.Row` オブジェクトのアクセス方法を修正 (`.get()` -> `['key']`) し、`AttributeError` を解消。`update_note_content` も修正し、ヘルパーに関数を渡す前に更新された行を取得するようにした。
*   Memory Bank (`progress.md`, `activeContext.md`) を更新。

## 次のステップ (Next steps)

*   **改善:**
    *   テスト (基本的な動作確認 - サーバー再起動後に実施)。
    *   README.md の更新。
    *   (Option) さらなる UI/UX の微調整 (編集確定/キャンセルの明確化など)。
