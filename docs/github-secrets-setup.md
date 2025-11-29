# GitHub Secrets セットアップ手順

**対象**: FinSightプロジェクトのCI/CD自動化  
**必要なSecrets数**: 2個  
**最終更新**: 2025-12-01

---

## 概要

FinSightプロジェクトでは、以下の2つのAPIキーをGitHub Repository Secretsとして登録する必要があります:

1. **EDINET_API_KEY** (必須) - EDINET API v2へのアクセス用
2. **ALPHA_VANTAGE_API_KEY** (オプション) - Alpha Vantage APIへのアクセス用（将来の拡張用）

**重要**: これらのAPIキーはコードに直接記述せず、必ずGitHub Secretsで管理してください。

---

## APIキーの取得

### 1. EDINET API Key (必須)

1. [EDINET API利用申請ページ](https://disclosure.edinet-fsa.go.jp/)にアクセス
2. 「API利用申請」をクリック
3. 必要事項を入力して申請
4. 承認されると、メールでAPIキー（Subscription-Key）が送付されます
5. **処理期間**: 通常3〜5営業日

**APIキー形式**:
```
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (32文字の英数字)
```

### 2. Alpha Vantage API Key (オプション)

1. [Alpha Vantage](https://www.alphavantage.co/support/#api-key)にアクセス
2. 「GET YOUR FREE API KEY TODAY」をクリック
3. メールアドレスを入力して無料APIキーを取得
4. 即座にAPIキーが発行されます

**APIキー形式**:
```
XXXXXXXXXXXXXXXXXXXX (20文字の英数字)
```

---

## GitHub Secretsの登録手順

### Step 1: GitHubリポジトリにアクセス

1. ブラウザで [https://github.com/J1921604/FinSight](https://github.com/J1921604/FinSight) を開く
2. リポジトリの「Settings」タブをクリック

### Step 2: Secrets and variablesページに移動

1. 左サイドバーの「Security」セクションを展開
2. 「Secrets and variables」をクリック
3. 「Actions」をクリック

### Step 3: Repository Secretsを追加

#### EDINET_API_KEY の登録

1. 「New repository secret」ボタンをクリック
2. 以下の情報を入力:
   - **Name**: `EDINET_API_KEY`
   - **Value**: 取得したEDINET APIキーをペースト
3. 「Add secret」ボタンをクリック

#### ALPHA_VANTAGE_API_KEY の登録 (オプション)

1. 再度「New repository secret」ボタンをクリック
2. 以下の情報を入力:
   - **Name**: `ALPHA_VANTAGE_API_KEY`
   - **Value**: 取得したAlpha Vantage APIキーをペースト
3. 「Add secret」ボタンをクリック

### Step 4: 登録確認

登録後、「Actions secrets」セクションに以下のように表示されます:

```
EDINET_API_KEY          ************************  Updated 1 minute ago
ALPHA_VANTAGE_API_KEY   ********************      Updated 1 minute ago
```

**注意**: セキュリティ上、登録後はAPIキーの値を確認することはできません。間違えて登録した場合は、削除して再登録してください。

---

## GitHub Actionsワークフローでの使用方法

登録したSecretsは、GitHub Actionsワークフロー内で以下のように使用されます:

**`.github/workflows/weekly-update.yml` の例**:

```yaml
name: Weekly Data Update

on:
  schedule:
    - cron: '0 6 * * 1'  # 毎週月曜 15:00 JST (6:00 UTC)
  workflow_dispatch:  # 手動トリガー

jobs:
  update-data:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      
      - name: Fetch EDINET data
        env:
          EDINET_API_KEY: ${{ secrets.EDINET_API_KEY }}
        run: |
          cd backend
          python scripts/fetch_edinet.py
```

**ポイント**:
- `${{ secrets.EDINET_API_KEY }}` でSecretsにアクセス
- `env` セクションで環境変数として設定
- Pythonスクリプト内で `os.getenv("EDINET_API_KEY")` で取得

---

## ローカル環境での開発

### .env.local ファイルの作成 (Gitにコミットしない)

ローカル開発時は、`.env.local` ファイルにAPIキーを記述します。

**frontend/.env.local**:
```bash
VITE_EDINET_API_KEY=your_edinet_api_key_here
VITE_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here
```

**backend/.env.local**:
```bash
EDINET_API_KEY=your_edinet_api_key_here
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here
```

**重要**:
- `.env.local` ファイルは `.gitignore` に含まれているため、Gitにコミットされません
- `.env.example` ファイルをコピーして `.env.local` を作成してください

```bash
# フロントエンド
cd frontend
cp .env.example .env.local
# エディタで .env.local を開いてAPIキーを記入

# バックエンド
cd backend
cp .env.example .env.local
# エディタで .env.local を開いてAPIキーを記入
```

---

## Secretsのローテーション

### ローテーションポリシー

セキュリティ向上のため、APIキーは **半年ごと** にローテーションすることを推奨します。

### ローテーション手順

1. 新しいAPIキーを取得（EDINET、Alpha Vantage）
2. GitHub Secretsページで既存のSecretを削除
3. 新しいAPIキーで再登録
4. ローカル環境の `.env.local` も更新

### ローテーションリマインダー

次回ローテーション推奨日: **2026年6月1日**

カレンダーにリマインダーを設定することをお勧めします。

---

## トラブルシューティング

### Q1: GitHub Actionsで "API Key is invalid" エラーが出る

**原因**: APIキーが正しく登録されていない、または有効期限切れ

**対処法**:
1. GitHub Secretsの登録内容を確認（Name が `EDINET_API_KEY` と完全一致しているか）
2. APIキーに余分なスペースや改行が含まれていないか確認
3. EDINET APIキーの有効期限を確認（通常は無期限ですが、利用規約違反で失効する場合があります）
4. 必要に応じてAPIキーを再取得して再登録

### Q2: ローカル環境で動くが、GitHub Actionsで動かない

**原因**: `.env.local` のAPIキーとGitHub Secretsのキーが異なる

**対処法**:
1. ローカルの `.env.local` とGitHub Secretsの値が一致しているか確認
2. GitHub Actionsのログで環境変数が正しく設定されているか確認
   ```yaml
   - name: Check env vars
     run: |
       echo "EDINET_API_KEY is set: ${{ secrets.EDINET_API_KEY != '' }}"
   ```

### Q3: "Secret scanning" でアラートが出た

**原因**: `.env.local` などをGitにコミットしてしまった

**対処法**:
1. 直ちにAPIキーを無効化（EDINET、Alpha Vantageで再発行）
2. コミット履歴から `.env.local` を完全削除
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch frontend/.env.local" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. 新しいAPIキーでGitHub Secretsを更新

---

## セキュリティベストプラクティス

1. **絶対にコードに直接記述しない**
   - ❌ `const API_KEY = "xxxxxxxxxxxxxxxx";`
   - ✅ `const API_KEY = import.meta.env.VITE_EDINET_API_KEY;`

2. **`.env.local` は必ず `.gitignore` に追加**
   ```gitignore
   # Environment variables
   .env
   .env.local
   .env.*.local
   ```

3. **GitHub Secret Scanningを有効化**
   - Settings > Security > Code security and analysis
   - "Secret scanning" を有効にする

4. **定期的なローテーション**
   - 半年ごとにAPIキーを更新

5. **最小権限の原則**
   - EDINET APIキーは読み取り専用（書き込み権限なし）
   - GitHub Actionsのワークフローには必要最小限の権限のみ付与

---

## 参考資料

- [GitHub Encrypted secrets 公式ドキュメント](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [EDINET API 利用規約](https://disclosure.edinet-fsa.go.jp/)
- [プロジェクト憲法: 原則2 セキュリティ要件](.specify/memory/constitution.md#原則2セキュリティ要件の最優先)

---

**最終確認チェックリスト**:

- [ ] EDINET APIキーを取得済み
- [ ] Alpha Vantage APIキー を取得済み（オプション）
- [ ] GitHub Repository Secretsに `EDINET_API_KEY` を登録済み
- [ ] GitHub Repository Secretsに `ALPHA_VANTAGE_API_KEY` を登録済み（オプション）
- [ ] ローカル環境の `.env.local` ファイルを作成済み
- [ ] `.gitignore` に `.env.local` が含まれていることを確認済み
- [ ] GitHub Actionsワークフローが正常に動作することを確認済み

全てチェックが完了したら、実装フェーズに進むことができます!
