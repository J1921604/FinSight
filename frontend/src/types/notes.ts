// Types for XBRL notes and NLP risk analysis

export interface NoteData {
  company: 'TEPCO' | 'CHUBU';
  period: string; // Format: YYYYQQ
  docID: string; // EDINET document ID (e.g., "S100XXXXX")
  category: 'risk' | 'policy_change' | 'info';
  text: string; // 注記本文
  severity: number; // リスクスコア (0.0 ~ 1.0)
  keywords: string[]; // 抽出キーワード
  detected_at: string; // ISO8601 timestamp
}

export interface NotesResponse {
  schema_version: string;
  notes: NoteData[];
}

export interface RiskKeyword {
  keyword: string;
  weight: number; // キーワードの重要度係数
  category: 'litigation' | 'impairment' | 'regulation' | 'nuclear' | 'other';
}

export interface PolicyChange {
  company: 'TEPCO' | 'CHUBU';
  period: string;
  change_type: 'accounting_policy' | 'accounting_estimate' | 'error_correction';
  description: string;
  impact: 'high' | 'medium' | 'low';
  is_new: boolean; // 前回期から新規追加されたか
}

export type SeverityLevel = 'high' | 'medium' | 'low';

export interface RiskItem extends NoteData {
  severityLevel: SeverityLevel;
  edinetUrl: string; // 元書類へのリンク
}
