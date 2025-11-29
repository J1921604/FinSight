// Financial data types for PL/BS/CF statements

export interface FinancialData {
  company: 'TEPCO' | 'CHUBU';
  period: string; // Format: YYYYQQ (e.g., "2025Q2")
  period_end: string; // ISO8601 format (e.g., "2025-09-30")
  // PL (Profit & Loss) fields
  revenue?: number; // 売上高 (億円)
  operating_income?: number; // 営業利益 (億円)
  ordinary_income?: number; // 経常利益 (億円)
  net_income?: number; // 当期純利益 (億円)
  // BS (Balance Sheet) fields
  total_assets?: number; // 総資産 (億円)
  current_assets?: number; // 流動資産 (億円)
  fixed_assets?: number; // 固定資産 (億円)
  total_liabilities?: number; // 総負債 (億円)
  total_equity?: number; // 純資産 (億円) - alias for net_assets
  net_assets?: number; // 純資産 (億円)
  // CF (Cash Flow) fields
  operating_cf?: number; // 営業CF (億円)
  investing_cf?: number; // 投資CF (億円)
  financing_cf?: number; // 財務CF (億円)
}

export interface YoYComparison {
  current: number;
  previous: number;
  change: number; // 差分 (current - previous)
  changePercent: number; // 増減率 (%)
  label: string; // 項目名
}

export interface AssetComposition {
  current_assets_ratio: number; // 流動資産比率 (%)
  fixed_assets_ratio: number; // 固定資産比率 (%)
  total_assets: number; // 総資産 (億円)
}

export type StatementType = 'pl' | 'bs' | 'cf';
export type CompanyCode = 'TEPCO' | 'CHUBU';

export interface ChartDataPoint {
  period: string;
  [key: string]: string | number | undefined;
}

export interface PLMetrics {
  revenue: number;
  operating_income: number;
  ordinary_income: number;
  net_income: number;
}

export interface BSMetrics {
  total_assets: number;
  current_assets: number;
  fixed_assets: number;
  total_liabilities: number;
  net_assets: number;
}

export interface CFMetrics {
  operating_cf: number;
  investing_cf: number;
  financing_cf: number;
}
