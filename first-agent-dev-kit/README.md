# First Agent Dev Kit プロジェクト

このプロジェクトは、Google の Agent Development Kit (ADK) のチュートリアルを参考に作成されました。

## 概要

このアプリケーションは、指定された都市名に基づいてポケモンセンターの情報を提供するエージェントです。

## 仕組み

1.  **エージェント定義 (`location_info_agent/agent.py`):**
    *   `google.adk.agents.Agent` を使用して `location_info_agent` という名前のエージェントが定義されています。
    *   このエージェントは、`gemini-2.0-flash-exp` モデルを使用するように設定されています（モデルは変更可能です）。
2.  **ツール (`get_pokemon_center` 関数):**
    *   エージェントは `get_pokemon_center` というツール（Python関数）を利用します。
    *   この関数は、引数として都市名 (`city`) を受け取ります。
    *   `agent.py` 内に定義されたポケモンセンターのリスト (`ALL_POKEMON_CENTERS`) から、指定された都市に存在するポケモンセンターの情報を検索します。
    *   見つかった場合はその情報を、見つからなかった場合はエラーメッセージを返します。
3.  **実行:**
    *   ADK フレームワークを通じてこのエージェントと対話することで、特定の都市のポケモンセンター情報を問い合わせることができます。
