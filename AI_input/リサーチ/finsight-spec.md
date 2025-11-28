
# FinSight — 実装仕様書 v1.0

## 1. プロジェクト概要

### 1.1 目的
東京電力HD・中部電力の**PL/BS/CF**を詳細に比較し、四半期・通期推移、前年同期比較、注記のリスク抽出、会計方針変更検知を行う。

### 1.2 スコープ
- PL/BS/CF推移グラフ（四半期・通期）
- 前年同期差異ハイライト
- 流動/固定資産構成比
- フリーキャッシュフロー分析
- 財務健全性スコア
- 注記NLP（リスクワード抽出、方針変更検知）

---

## 2. 技術スタック

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

## 3. ディレクトリ構成

```
finsight/
├── .github/workflows/
│   ├── deploy-pages.yml
│   └── update-financials.yml
├── src/
│   ├── components/
│   │   ├── StatementTabs.tsx
│   │   ├── TrendChart.tsx
│   │   ├── DiffHighlight.tsx
│   │   ├── CompositionPie.tsx
│   │   ├── CashFlowWaterfall.tsx
│   │   ├── HealthScore.tsx
│   │   └── NotesPanel.tsx
│   ├── hooks/
│   │   ├── useFinancials.ts
│   │   └── useNotes.ts
│   ├── utils/
│   │   ├── calculations.ts
│   │   └── nlp.ts
│   ├── types/
│   │   └── financials.d.ts
│   └── App.tsx
├── data/
│   ├── financials/
│   │   ├── TEPCO_pl_quarterly.csv
│   │   ├── TEPCO_bs_quarterly.csv
│   │   ├── TEPCO_cf_quarterly.csv
│   │   ├── CHUBU_pl_quarterly.csv
│   │   ├── CHUBU_bs_quarterly.csv
│   │   └── CHUBU_cf_quarterly.csv
│   ├── ratios.csv
│   ├── xbrl_notes.json
│   └── accounting_changes.json
├── scripts/
│   ├── extract_financials.py
│   ├── compute_ratios.py
│   ├── nlp_notes_risk.py
│   └── detect_policy_changes.py
└── package.json
```

---

## 4. データモデル

### 4.1 損益計算書 (CSV)
**ファイル**: `data/financials/TEPCO_pl_quarterly.csv`

```csv
date,revenue,operating_income,ordinary_income,net_income,ebitda
2024-06-30,1234567,89012,85678,45678,120000
2024-09-30,1345678,95012,91234,52345,132000
```

### 4.2 貸借対照表 (CSV)
**ファイル**: `data/financials/TEPCO_bs_quarterly.csv`

```csv
date,current_assets,fixed_assets,total_assets,current_liabilities,fixed_liabilities,total_liabilities,equity
2024-06-30,1234567,8901234,10135801,2345678,5678901,8024579,2111222
```

### 4.3 キャッシュフロー (CSV)
**ファイル**: `data/financials/TEPCO_cf_quarterly.csv`

```csv
date,operating_cf,investing_cf,financing_cf,free_cf
2024-06-30,234567,-123456,-45678,111111
2024-09-30,267890,-145678,-50123,122212
```

### 4.4 注記リスク分析 (JSON)
**ファイル**: `data/xbrl_notes.json`

```json
[
  {
    "docID": "S100XXXXX",
    "company": "TEPCO",
    "period": "2025Q2",
    "tag": "risk",
    "text": "原子力発電所の再稼働に関する不確実性...",
    "severity": 0.85,
    "keywords": ["原子力", "再稼働", "規制"],
    "extractedAt": "2025-11-15T10:30:00Z"
  },
  {
    "docID": "S100XXXXX",
    "company": "TEPCO",
    "period": "2025Q2",
    "tag": "accounting_policy",
    "text": "有形固定資産の減価償却方法を変更...",
    "severity": 0.6,
    "keywords": ["減価償却", "会計方針変更"],
    "extractedAt": "2025-11-15T10:30:00Z"
  }
]
```

### 4.5 財務比率 (CSV)
**ファイル**: `data/ratios.csv`

```csv
date,company,current_ratio,debt_equity_ratio,roe,roa,operating_margin
2024-06-30,TEPCO,52.6,260.3,8.2,1.5,7.2
2024-09-30,TEPCO,54.1,255.8,8.5,1.6,7.5
```

---

## 5. GitHub Actions

### 5.1 財務データ更新ワークフロー

**ファイル**: `.github/workflows/update-financials.yml`

```yaml
name: Update Financial Statements

on:
  schedule:
    - cron: '0 3 * * 2'  # 毎週火曜 3:00 JST
  workflow_dispatch:

jobs:
  extract-and-analyze:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install requests pandas numpy spacy lxml beautifulsoup4
          python -m spacy download ja_core_news_sm
      
      - name: Extract financials from EDINET
        env:
          EDINET_API_KEY: ${{ secrets.EDINET_API_KEY }}
          EDINET_BASE_URL: ${{ secrets.EDINET_BASE_URL }}
        run: |
          python scripts/extract_financials.py
      
      - name: Compute ratios
        run: |
          python scripts/compute_ratios.py
      
      - name: NLP risk analysis
        run: |
          python scripts/nlp_notes_risk.py
      
      - name: Detect policy changes
        run: |
          python scripts/detect_policy_changes.py
      
      - name: Commit and push
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add data/
          git diff --quiet && git diff --staged --quiet || \
            (git commit -m "Update financials $(date +'%Y-%m-%d')" && git push)
      
      - name: Create issue on failure
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: 'Financial data extraction failed',
              body: 'Workflow run: ' + context.runId,
              labels: ['data-failure', 'edinet']
            })
```

---

## 6. Python スクリプト

### 6.1 財務諸表抽出

**ファイル**: `scripts/extract_financials.py`

```python
import os
import json
import requests
import zipfile
import csv
import io
from pathlib import Path
from datetime import datetime

API_KEY = os.getenv("EDINET_API_KEY")
BASE_URL = os.getenv("EDINET_BASE_URL")
DATA_DIR = Path("data/financials")

def extract_pl(zip_bytes):
    """損益計算書を抽出"""
    pl_data = {}
    
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as z:
        for filename in z.namelist():
            if not filename.endswith('.csv'):
                continue
            
            with z.open(filename) as f:
                reader = csv.DictReader(io.TextIOWrapper(f, encoding='utf-8'))
                
                for row in reader:
                    label = row.get('label', '').strip()
                    amount = float(row.get('amount', 0) or 0)
                    
                    if '営業収益' in label or '売上高' in label:
                        pl_data['revenue'] = amount
                    elif '営業利益' in label:
                        pl_data['operating_income'] = amount
                    elif '経常利益' in label:
                        pl_data['ordinary_income'] = amount
                    elif '当期純利益' in label:
                        pl_data['net_income'] = amount
    
    return pl_data

def extract_bs(zip_bytes):
    """貸借対照表を抽出"""
    bs_data = {}
    
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as z:
        for filename in z.namelist():
            if not filename.endswith('.csv'):
                continue
            
            with z.open(filename) as f:
                reader = csv.DictReader(io.TextIOWrapper(f, encoding='utf-8'))
                
                for row in reader:
                    label = row.get('label', '').strip()
                    amount = float(row.get('amount', 0) or 0)
                    
                    if '流動資産' in label:
                        bs_data['current_assets'] = amount
                    elif '固定資産' in label:
                        bs_data['fixed_assets'] = amount
                    elif '資産合計' in label:
                        bs_data['total_assets'] = amount
                    elif '流動負債' in label:
                        bs_data['current_liabilities'] = amount
                    elif '固定負債' in label:
                        bs_data['fixed_liabilities'] = amount
                    elif '負債合計' in label:
                        bs_data['total_liabilities'] = amount
                    elif '純資産' in label:
                        bs_data['equity'] = amount
    
    return bs_data

def extract_cf(zip_bytes):
    """キャッシュフロー計算書を抽出"""
    cf_data = {}
    
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as z:
        for filename in z.namelist():
            if not filename.endswith('.csv'):
                continue
            
            with z.open(filename) as f:
                reader = csv.DictReader(io.TextIOWrapper(f, encoding='utf-8'))
                
                for row in reader:
                    label = row.get('label', '').strip()
                    amount = float(row.get('amount', 0) or 0)
                    
                    if '営業活動' in label and 'キャッシュ・フロー' in label:
                        cf_data['operating_cf'] = amount
                    elif '投資活動' in label and 'キャッシュ・フロー' in label:
                        cf_data['investing_cf'] = amount
                    elif '財務活動' in label and 'キャッシュ・フロー' in label:
                        cf_data['financing_cf'] = amount
    
    # フリーCF計算
    if 'operating_cf' in cf_data and 'investing_cf' in cf_data:
        cf_data['free_cf'] = cf_data['operating_cf'] + cf_data['investing_cf']
    
    return cf_data

def save_csv(company, statement_type, data, date):
    """CSV保存"""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    
    filename = DATA_DIR / f"{company}_{statement_type}_quarterly.csv"
    
    # 既存データ読み込み
    existing = []
    if filename.exists():
        with open(filename, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            existing = [row for row in reader if row['date'] != date]
    
    # 新規データ追加
    data['date'] = date
    existing.append(data)
    existing.sort(key=lambda x: x['date'])
    
    # 保存
    if existing:
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=existing[0].keys())
            writer.writeheader()
            writer.writerows(existing)
    
    print(f"✓ Saved {company} {statement_type} for {date}")

def main():
    # EDINETから最新データ取得（前述のfetch_edinet.pyと連携）
    companies = ["TEPCO", "CHUBU"]
    
    for company in companies:
        # ZIPファイル読み込み（fetch_edinet.pyで取得済み想定）
        zip_path = Path(f"data/edinet_parsed/{company}_latest.zip")
        if not zip_path.exists():
            print(f"⚠️ ZIP not found: {zip_path}")
            continue
        
        with open(zip_path, 'rb') as f:
            zip_bytes = f.read()
        
        date = datetime.now().strftime("%Y-%m-%d")
        
        # 各諸表抽出
        pl_data = extract_pl(zip_bytes)
        bs_data = extract_bs(zip_bytes)
        cf_data = extract_cf(zip_bytes)
        
        # 保存
        save_csv(company, 'pl', pl_data, date)
        save_csv(company, 'bs', bs_data, date)
        save_csv(company, 'cf', cf_data, date)

if __name__ == "__main__":
    main()
```

### 6.2 NLP注記リスク分析

**ファイル**: `scripts/nlp_notes_risk.py`

```python
import json
import spacy
from pathlib import Path

nlp = spacy.load("ja_core_news_sm")

RISK_KEYWORDS = [
    "リスク", "不確実性", "懸念", "課題", "問題",
    "規制", "訴訟", "損失", "減損", "事故",
    "原子力", "再稼働", "環境", "気候変動"
]

POLICY_KEYWORDS = [
    "会計方針", "変更", "改正", "適用", "移行",
    "減価償却", "評価", "計上基準"
]

def extract_notes(zip_path):
    """注記テキストを抽出（簡易版）"""
    # 実際はXBRLの注記セクションをパース
    # ここでは仮実装
    return [
        "原子力発電所の再稼働に関する不確実性が継続している...",
        "有形固定資産の減価償却方法を定率法から定額法に変更した..."
    ]

def analyze_text(text, keywords):
    """テキスト分析"""
    doc = nlp(text)
    
    matched = [kw for kw in keywords if kw in text]
    severity = len(matched) / len(keywords) if keywords else 0
    
    return {
        "keywords": matched,
        "severity": round(severity, 2)
    }

def main():
    notes = []
    
    companies = ["TEPCO", "CHUBU"]
    for company in companies:
        zip_path = Path(f"data/edinet_parsed/{company}_latest.zip")
        if not zip_path.exists():
            continue
        
        texts = extract_notes(zip_path)
        
        for text in texts:
            # リスク分析
            risk_analysis = analyze_text(text, RISK_KEYWORDS)
            if risk_analysis['severity'] > 0.3:
                notes.append({
                    "company": company,
                    "period": "2025Q2",
                    "tag": "risk",
                    "text": text[:200] + "..." if len(text) > 200 else text,
                    "severity": risk_analysis['severity'],
                    "keywords": risk_analysis['keywords'],
                    "extractedAt": "2025-11-28T10:00:00Z"
                })
            
            # 会計方針変更検知
            policy_analysis = analyze_text(text, POLICY_KEYWORDS)
            if policy_analysis['severity'] > 0.2:
                notes.append({
                    "company": company,
                    "period": "2025Q2",
                    "tag": "accounting_policy",
                    "text": text[:200] + "..." if len(text) > 200 else text,
                    "severity": policy_analysis['severity'],
                    "keywords": policy_analysis['keywords'],
                    "extractedAt": "2025-11-28T10:00:00Z"
                })
    
    # 保存
    output_file = Path("data/xbrl_notes.json")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(notes, f, ensure_ascii=False, indent=2)
    
    print(f"✓ Extracted {len(notes)} notes")

if __name__ == "__main__":
    main()
```

---

## 7. フロントエンド実装

### 7.1 財務諸表タブ

**ファイル**: `src/components/StatementTabs.tsx`

```typescript
import React, { useState } from 'react';
import { TrendChart } from './TrendChart';

export const StatementTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pl' | 'bs' | 'cf'>('pl');

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        {(['pl', 'bs', 'cf'] as const).map((tab) => (
          <button
            key={tab}
            className={`button ${activeTab === tab ? 'button--selected' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'pl' && '損益計算書'}
            {tab === 'bs' && '貸借対照表'}
            {tab === 'cf' && 'キャッシュフロー'}
          </button>
        ))}
      </div>

      <TrendChart statementType={activeTab} />
    </div>
  );
};
```

### 7.2 注記パネル

**ファイル**: `src/components/NotesPanel.tsx`

```typescript
import React from 'react';

interface Note {
  company: string;
  tag: string;
  text: string;
  severity: number;
  keywords: string[];
}

interface Props {
  notes: Note[];
}

export const NotesPanel: React.FC<Props> = ({ notes }) => {
  const getSeverityColor = (severity: number) => {
    if (severity >= 0.7) return 'border-red-500';
    if (severity >= 0.4) return 'border-yellow-500';
    return 'border-blue-500';
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">注記分析</h2>
      
      {notes.map((note, idx) => (
        <div
          key={idx}
          className={`neumorph-card p-4 border-l-4 ${getSeverityColor(note.severity)}`}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="font-semibold">{note.company}</span>
            <span className="text-sm text-gray-400">
              {note.tag === 'risk' ? 'リスク' : '会計方針'}
            </span>
          </div>
          
          <p className="text-sm mb-2">{note.text}</p>
          
          <div className="flex gap-2 flex-wrap">
            {note.keywords.map((kw, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-gray-700 rounded text-xs"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
```

---

## 8. 今後の拡張

- [ ] セグメント別分析
- [ ] 連結/単体の自動切り替え
- [ ] 過去5期比較
- [ ] 財務異常値の自動検知

---

**Version**: 1.0  
**Last Updated**: 2025-11-28
