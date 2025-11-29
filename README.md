# FinSight - 財務諸表インサイトダッシュボード

**Version**: 1.0.0  
**Release Date**: 2025-12-15  
**プロジェクト憲法**: [constitution.md](https://github.com/J1921604/FinSight/blob/main/specs/001-FinSight/constitution.md)  
**最終更新**: 2025-12-15

---

## プロジェクト概要

FinSightは、東京電力ホールディングスおよび中部電力の財務諸表（PL/BS/CF）を構造化し、時系列比較、注記分析、リスク検知を通じて、透明性の高い財務インサイトを提供するダッシュボードアプリケーションです。

### 主要機能

1. **財務諸表可視化**
   - 損益計算書（PL）の四半期・通期推移グラフ
   - 貸借対照表（BS）の構成比分析
   - キャッシュフロー計算書（CF）のウォーターフォール表示

2. **比較分析**
   - 前年同期比較と差異ハイライト
   - 東京電力HD vs 中部電力の並列比較
   - 業界ベンチマークとの対比

3. **注記分析（NLP）**
   - 有価証券報告書の注記からリスク要因を自動抽出
   - 会計方針の変更検知と影響分析
   - 重要性スコアによる優先度付け

4. **財務健全性スコア**
   - 流動性、収益性、安定性、キャッシュフローの総合評価
   - 100点満点のスコア化で直感的な理解を支援

---

## プロジェクト憲法

本プロジェクトは、以下の5つの基本原則に基づき開発されます。詳細は[憲法ドキュメント](https://github.com/J1921604/FinSight/blob/main/.specify/memory/constitution.md)を参照してください。

### 原則1: テスト駆動開発の徹底
全ての機能実装に先立ち、テストケースを定義し、仕様に対する検証を必須とします。

### 原則2: セキュリティ要件の最優先
セキュリティ要件は機能要件より優先し、機密データの平文保存を禁止します。

### 原則3: パフォーマンス定量化と受入基準
パフォーマンス閾値を定量化し、全ての機能の受入基準に組み込みます。

### 原則4: データの再現性と監査証跡
外部依存はバージョン固定により再現性を確保し、仕様と実装の乖離をレビューで検知・是正します。

### 原則5: 継続的インテグレーションとデプロイメント
作業順序を憲法→仕様→計画→タスク→検証→実装→レビューとし、重大変更にはレビュー承認を必須とします。

---

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フロントエンド | React 18 + TypeScript |
| チャート | Recharts |
| NLP | Python (spaCy / transformers) |
| スタイリング | Tailwind CSS |
| ビルド | Vite |
| ホスティング | GitHub Pages |
| データ更新 | GitHub Actions (週次) |
| 外部API | EDINET API v2 |

---

## プロジェクト構造

```
FinSight/
├── .github/
│   ├── workflows/          # CI/CDパイプライン
│   ├── agents/             # Copilotエージェント定義
│   └── prompts/            # コマンドプロンプト
├── .specify/
│   ├── memory/
│   │   └── constitution.md # プロジェクト憲法
│   ├── templates/          # 仕様書・計画書テンプレート
│   └── scripts/            # 開発支援スクリプト
├── AI_input/
│   └── リサーチ/            # 調査資料・仕様書
├── src/
│   ├── components/         # Reactコンポーネント
│   ├── hooks/              # カスタムフック
│   ├── utils/              # ユーティリティ関数
│   └── styles/             # スタイルシート
├── data/
│   ├── financials/         # 財務データ（CSV/JSON）
│   ├── ratios.csv          # 財務比率
│   └── xbrl_notes.json     # 注記分析結果
├── scripts/
│   ├── extract_financials.py  # EDINET財務データ抽出
│   ├── compute_ratios.py      # 財務比率計算
│   └── nlp_notes_risk.py      # 注記NLP分析
└── tests/
    ├── unit/               # ユニットテスト
    ├── integration/        # 統合テスト
    └── e2e/                # E2Eテスト
```

---

## 開発ワークフロー

### ブランチ戦略

```bash
# 仕様ブランチ（mainから派生）
git checkout main
git checkout -b 001-financial-statement-comparison

# 実装ブランチ（仕様ブランチから派生）
git checkout 001-financial-statement-comparison
git checkout -b feature/impl-001-pl-analysis
```

### 作業順序

```mermaid
flowchart LR
    A[憲法確認] --> B[仕様策定]
    B --> C[計画作成]
    C --> D[タスク分解]
    D --> E[テスト設計]
    E --> F[実装]
    F --> G[コードレビュー]
    G --> H[マージ]
    H --> I[デプロイ]
    
    style A fill:#00FF84
    style E fill:#FF2ECC
    style G fill:#00D4FF
```

---

## セットアップ

### 前提条件

- Node.js 20.x以上
- Python 3.11以上
- Git

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/J1921604/FinSight.git
cd FinSight

# フロントエンド依存関係のインストール
npm install

# Python依存関係のインストール
pip install -r scripts/requirements.txt

# spaCyの日本語モデルをダウンロード
python -m spacy download ja_core_news_sm
```

### 環境変数の設定

`.env.example`をコピーして`.env`を作成し、必要なAPIキーを設定してください。

```bash
cp .env.example .env
```

```.env
# EDINET API v2
EDINET_API_KEY=your_edinet_api_key
EDINET_BASE_URL=https://api.edinet-fsa.go.jp/api/v2

# GitHub（Issue自動起票用、オプション）
GITHUB_TOKEN=your_github_token
```

**注意**: `.env`ファイルは`.gitignore`に含まれており、リポジトリにコミットされません。

---

## 開発サーバーの起動

### フロントエンド

```bash
npm run dev
```

ブラウザで http://localhost:5173 を開きます。

### バックエンド（データ更新スクリプト）

```bash
npm run dev:data
```

### 同時起動

```bash
npm run dev:all
```

---

## テスト実行

### ユニットテスト

```bash
# フロントエンド（TypeScript）
npm test

# バックエンド（Python）
pytest tests/unit/
```

### 統合テスト

```bash
pytest tests/integration/
```

### E2Eテスト

```bash
npm run test:e2e
```

### カバレッジレポート

```bash
npm run test:coverage
```

---

## ビルドとデプロイ

### ビルド

```bash
npm run build
```

### プレビュー

```bash
npm run preview
```

### GitHub Pagesへのデプロイ

mainブランチへのプッシュで自動的にデプロイされます。

```bash
git push origin main
```

または、手動でワークフローを実行:

```bash
gh workflow run deploy-pages.yml
```

---

## データ更新

### EDINET財務データの取得

```bash
python scripts/extract_financials.py
```

### 財務比率の計算

```bash
python scripts/compute_ratios.py
```

### 注記のNLP分析

```bash
python scripts/nlp_notes_risk.py
```

### 全データパイプラインの実行

```bash
npm run data:update
```

---

## パフォーマンス予算

本プロジェクトは、以下のパフォーマンス予算を遵守します（憲法 第I章 原則3）。

| 指標 | 目標値 |
|------|--------|
| LCP (Largest Contentful Paint) | < 2.5秒 |
| TTI (Time to Interactive) | < 2.0秒 |
| FID (First Input Delay) | < 100ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
| バンドルサイズ（gzip後） | < 200KB |
| 初期データロード | < 500KB |

### パフォーマンス測定

```bash
npm run lighthouse
```

---

## セキュリティ

### 脆弱性スキャン

```bash
# npm
npm audit

# Python
pip-audit
```

### Secretsの管理

- 全てのAPIキーはGitHub Secretsまたは環境変数で管理
- コードに直接記述しない
- `.env`ファイルは必ず`.gitignore`に追加
- Secretsは半期ごとにローテーション

### 依存関係の更新

```bash
# Dependabotの自動PR確認
# または手動で
npm update
pip install --upgrade -r scripts/requirements.txt
```

---

## コントリビューション

### PRの作成

1. 仕様ブランチから実装ブランチを作成
2. テストを先に書く（TDD）
3. 実装とテスト実行
4. PRを作成し、レビューを依頼
5. CIが全て通過することを確認
6. 最低1名のレビュワー承認を得る
7. マージ

### レビューチェックリスト

- [ ] 仕様書との整合性
- [ ] テストカバレッジ80%以上
- [ ] セキュリティベストプラクティス遵守
- [ ] パフォーマンス予算内
- [ ] ドキュメント更新済み

---

## コミットメッセージ規約

Conventional Commitsに準拠します。

```
<type>(<scope>): <subject>

<body>

<footer>
```

**type**:
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント変更
- `style`: コードフォーマット
- `refactor`: リファクタリング
- `perf`: パフォーマンス改善
- `test`: テスト追加・修正
- `chore`: ビルド・設定変更

**scope**:
- `pl`: 損益計算書機能
- `bs`: 貸借対照表機能
- `cf`: キャッシュフロー機能
- `notes`: 注記分析機能
- `edinet`: EDINET連携
- `ui`: UIコンポーネント
- `ci`: CI/CD設定

**例**:
```
feat(pl): 前年同期比較機能を追加

四半期ごとのPLデータに対し、前年同期との差異を自動計算し、
ハイライト表示する機能を実装。

Closes #42
```

---

## ライセンス

本プロジェクトはMITライセンスのもとで公開されています。詳細は[LICENSE](LICENSE)を参照してください。

---

## お問い合わせ

- プロジェクトオーナー: J1921604
- リポジトリ: https://github.com/J1921604/FinSight
- Issue報告: https://github.com/J1921604/FinSight/issues

---

## 参考資料

- [プロジェクト憲法](https://github.com/J1921604/FinSight/blob/main/.specify/memory/constitution.md)
- [EDINET API仕様書](https://disclosure2dl.edinet-fsa.go.jp/guide/static/disclosure/download/ESE140206.pdf)
- [仕様書テンプレート](https://github.com/J1921604/FinSight/blob/main/.specify/templates/spec-template.md)
- [計画書テンプレート](https://github.com/J1921604/FinSight/blob/main/.specify/templates/plan-template.md)
- [タスクテンプレート](https://github.com/J1921604/FinSight/blob/main/.specify/templates/tasks-template.md)

---

**次回憲法レビュー予定日**: 2026年2月28日
