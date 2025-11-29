# データスキーマ仕様書

**バージョン**: 1.0.0  
**最終更新**: 2025-12-01  
**適用範囲**: FinSightプロジェクト全体

---

## 概要

本ドキュメントは、FinSightプロジェクトで使用する全てのデータファイル（CSV、JSON）のスキーマを定義します。

---

## 1. 財務諸表データ (CSV)

### ファイル命名規則

```
{company}_{statement}_quarterly.csv
```

- `company`: `TEPCO` または `CHUBU`
- `statement`: `pl`（損益計算書）、`bs`（貸借対照表）、`cf`（キャッシュフロー計算書）

**例**:
- `TEPCO_pl_quarterly.csv`
- `CHUBU_bs_quarterly.csv`

### スキーマ定義

| フィールド名 | 型 | 必須 | 説明 | 制約 |
|------------|-------|------|------|------|
| `company` | string | ✓ | 企業コード | `TEPCO` または `CHUBU` |
| `period` | string | ✓ | 期間 | YYYYQQ形式（例: `2025Q2`）、正規表現: `^\d{4}Q[1-4]$` |
| `date` | string | ✓ | 決算日 | ISO8601形式（例: `2025-09-30`） |
| `revenue` | number | | 売上高（億円） | >= 0 |
| `operating_income` | number | | 営業利益（億円） | 負値許可 |
| `ordinary_income` | number | | 経常利益（億円） | 負値許可 |
| `net_income` | number | | 当期純利益（億円） | 負値許可 |
| `total_assets` | number | | 総資産（億円） | > 0 |
| `current_assets` | number | | 流動資産（億円） | >= 0 |
| `fixed_assets` | number | | 固定資産（億円） | >= 0 |
| `total_liabilities` | number | | 総負債（億円） | >= 0 |
| `net_assets` | number | | 純資産（億円） | 負値許可（債務超過の場合） |
| `operating_cf` | number | | 営業CF（億円） | 負値許可 |
| `investing_cf` | number | | 投資CF（億円） | 負値許可 |
| `financing_cf` | number | | 財務CF（億円） | 負値許可 |

### CSVサンプル

```csv
company,period,date,revenue,operating_income,ordinary_income,net_income,total_assets,current_assets,fixed_assets,total_liabilities,net_assets,operating_cf,investing_cf,financing_cf
TEPCO,2025Q2,2025-09-30,15234.5,892.3,745.2,523.8,68900.0,12345.0,56555.0,48900.0,20000.0,2345.6,-1234.5,890.2
TEPCO,2025Q1,2025-06-30,14890.2,756.4,689.1,478.3,68500.0,11890.0,56610.0,48600.0,19900.0,2012.3,-1456.8,1023.4
```

### バリデーションルール

1. **company**: 必ず `TEPCO` または `CHUBU` のいずれか
2. **period**: `YYYYQQ` 形式（例: `2025Q1`, `2024Q4`）
3. **date**: ISO8601形式（例: `2025-09-30`）
4. **数値フィールド**: 空欄可（NULL/未定義）、数値型であること
5. **総資産**: `current_assets + fixed_assets` の合計値と一致すること（許容誤差: ±1億円）

---

## 2. 注記データ (JSON)

### ファイル命名規則

```
xbrl_notes.json
```

### スキーマ定義

```json
{
  "schema_version": "1.0.0",
  "notes": [
    {
      "company": "TEPCO | CHUBU",
      "period": "YYYYQQ",
      "docID": "S100XXXXX",
      "category": "risk | policy_change | info",
      "text": "注記本文",
      "severity": 0.85,
      "keywords": ["訴訟", "減損"],
      "detected_at": "2025-11-29T10:30:00Z"
    }
  ]
}
```

| フィールド名 | 型 | 必須 | 説明 | 制約 |
|------------|-------|------|------|------|
| `schema_version` | string | ✓ | スキーマバージョン | セマンティックバージョニング（例: `1.0.0`） |
| `notes` | array | ✓ | 注記データ配列 | |
| `notes[].company` | string | ✓ | 企業コード | `TEPCO` または `CHUBU` |
| `notes[].period` | string | ✓ | 期間 | YYYYQQ形式 |
| `notes[].docID` | string | ✓ | EDINET書類ID | 例: `S100ABCD1` |
| `notes[].category` | string | ✓ | カテゴリ | `risk`, `policy_change`, `info` のいずれか |
| `notes[].text` | string | ✓ | 注記本文 | 最大10000文字 |
| `notes[].severity` | number | ✓ | リスクスコア | 0.0 ~ 1.0 |
| `notes[].keywords` | array | ✓ | 抽出キーワード | 文字列配列 |
| `notes[].detected_at` | string | ✓ | 検出日時 | ISO8601形式 |

### JSONサンプル

```json
{
  "schema_version": "1.0.0",
  "notes": [
    {
      "company": "TEPCO",
      "period": "2025Q2",
      "docID": "S100ABCD1",
      "category": "risk",
      "text": "原子力損害賠償に関する訴訟が継続中であり、将来的に追加の損失が発生する可能性があります。",
      "severity": 0.85,
      "keywords": ["訴訟", "原子力", "賠償"],
      "detected_at": "2025-11-29T10:30:00Z"
    },
    {
      "company": "CHUBU",
      "period": "2025Q2",
      "docID": "S100EFGH2",
      "category": "policy_change",
      "text": "収益認識に関する会計基準を当期より適用しました。",
      "severity": 0.4,
      "keywords": ["会計基準", "収益認識"],
      "detected_at": "2025-11-29T11:00:00Z"
    }
  ]
}
```

### バリデーションルール

1. **schema_version**: 必ず存在し、セマンティックバージョニング形式
2. **severity**: 0.0 ~ 1.0の範囲内
3. **category**: `risk`, `policy_change`, `info` のいずれか
4. **keywords**: 空配列不可（最低1個のキーワード必須）

---

## 3. タクソノミマッピング (JSON)

### ファイル命名規則

```
taxonomy_map.json
```

### スキーマ定義

```json
{
  "schema_version": "1.0.0",
  "mappings": {
    "revenue": ["売上高", "営業収益", "Revenue", "OperatingRevenue"],
    "operating_income": ["営業利益", "OperatingIncome"],
    "net_income": ["当期純利益", "親会社株主に帰属する当期純利益", "NetIncome"]
  }
}
```

| フィールド名 | 型 | 必須 | 説明 |
|------------|-------|------|------|
| `schema_version` | string | ✓ | スキーマバージョン |
| `mappings` | object | ✓ | マッピング定義 |
| `mappings[key]` | array | ✓ | エイリアス配列 |

### マッピングルール

- 各キーは財務諸表CSVのフィールド名に対応
- エイリアス配列には、EDINET XBRLで使用される可能性のある全てのラベルを列挙
- 年度ごとに要素名が変わる場合、両方のバージョンを含める

---

## スキーマバージョン管理

### バージョニングポリシー

本プロジェクトはセマンティックバージョニング（SemVer）を採用します。

```
MAJOR.MINOR.PATCH
```

- **MAJOR**: 後方互換性のない変更（フィールド削除、型変更）
- **MINOR**: 後方互換性のある機能追加（新フィールド追加）
- **PATCH**: バグ修正、ドキュメント修正

### マイグレーション

スキーマが変更された場合、以下の手順を実施します:

1. `schema_version` をインクリメント
2. `backend/scripts/migrate_schema.py` でマイグレーションスクリプトを作成
3. 既存データを新スキーマに変換
4. 変換結果をバリデーション
5. 変更履歴を本ドキュメントに記録

### 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-12-01 | 初版作成 |

---

## スキーマバリデーション

### 自動バリデーション

```bash
# バックエンドスクリプトでスキーマ検証
python backend/scripts/validate_schema.py
```

### フロントエンドバリデーション

TypeScript型定義（`frontend/src/types/financial.ts`、`frontend/src/types/notes.ts`）により、コンパイル時にスキーマ違反を検出します。

---

## 参考資料

- [EDINET API v2 仕様書](https://disclosure.edinet-fsa.go.jp/)
- [XBRL タクソノミ](https://www.xbrl.or.jp/)
- [JSON Schema 仕様](https://json-schema.org/)
