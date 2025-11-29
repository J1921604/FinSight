import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { loadFinancialData } from '@/services/dataLoader';
import { YoYBadge } from '@/components/YoYBadge';
import { calculateYoY, findPreviousYearData } from '@/services/yoyCalculator';
import type { FinancialData } from '@/types/financial';

/**
 * Dashboard Page
 * Overview of financial metrics with quick navigation
 */
const Dashboard: React.FC = () => {
  const [plData, setPlData] = useState<FinancialData[]>([]);
  const [bsData, setBsData] = useState<FinancialData[]>([]);
  const [cfData, setCfData] = useState<FinancialData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<'TEPCO' | 'CHUBU'>('TEPCO');

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        // Load all statements for both companies
        const [plTepco, plChubu, bsTepco, bsChubu, cfTepco, cfChubu] = await Promise.all([
          loadFinancialData('TEPCO', 'pl'),
          loadFinancialData('CHUBU', 'pl'),
          loadFinancialData('TEPCO', 'bs'),
          loadFinancialData('CHUBU', 'bs'),
          loadFinancialData('TEPCO', 'cf'),
          loadFinancialData('CHUBU', 'cf'),
        ]);
        setPlData([...plTepco, ...plChubu]);
        setBsData([...bsTepco, ...bsChubu]);
        setCfData([...cfTepco, ...cfChubu]);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'データ読み込みエラー');
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  // Get latest data for selected company
  const latestPL = plData
    .filter((d) => d.company === selectedCompany)
    .sort((a, b) => b.period.localeCompare(a.period))[0];

  const latestBS = bsData
    .filter((d) => d.company === selectedCompany)
    .sort((a, b) => b.period.localeCompare(a.period))[0];

  const latestCF = cfData
    .filter((d) => d.company === selectedCompany)
    .sort((a, b) => b.period.localeCompare(a.period))[0];

  // Calculate key YoY metrics
  const revenueYoY = latestPL
    ? calculateYoY(
        latestPL.revenue || 0,
        findPreviousYearData(plData, latestPL.period, selectedCompany)?.revenue || 0,
        '売上高'
      )
    : null;

  const netIncomeYoY = latestPL
    ? calculateYoY(
        latestPL.net_income || 0,
        findPreviousYearData(plData, latestPL.period, selectedCompany)?.net_income || 0,
        '当期純利益'
      )
    : null;

  const totalAssetsYoY = latestBS
    ? calculateYoY(
        latestBS.total_assets || 0,
        findPreviousYearData(bsData, latestBS.period, selectedCompany)?.total_assets || 0,
        '総資産'
      )
    : null;

  const operatingCFYoY = latestCF
    ? calculateYoY(
        latestCF.operating_cf || 0,
        findPreviousYearData(cfData, latestCF.period, selectedCompany)?.operating_cf || 0,
        '営業CF'
      )
    : null;

  // Calculate financial ratios
  const equityRatio = latestBS && latestBS.total_assets && latestBS.total_equity
    ? (((latestBS.total_equity || 0) / (latestBS.total_assets || 1)) * 100).toFixed(1)
    : '0.0';

  const operatingMargin = latestPL && latestPL.revenue && latestPL.operating_income
    ? (((latestPL.operating_income || 0) / (latestPL.revenue || 1)) * 100).toFixed(1)
    : '0.0';

  const freeCashFlow = latestCF
    ? ((latestCF.operating_cf || 0) + (latestCF.investing_cf || 0)).toFixed(2)
    : '0.00';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="shimmer text-xl px-8 py-4 rounded-lg">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen fade-in">
        <div className="glass-card bg-accent-red bg-opacity-20 border border-accent-red p-6 max-w-md">
          <h2 className="text-accent-red text-xl font-bold mb-2">エラー</h2>
          <p className="text-text-secondary">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 fade-in-up">
          <h1 className="text-5xl font-bold mb-4">
            <span className="gradient-text">Fin</span><span className="text-primary-cyan">Sight</span>
          </h1>
          <p className="text-xl text-text-secondary mb-4">財務諸表インサイトダッシュボード</p>
          <p className="text-sm text-text-secondary">
            東京電力と中部電力の財務データを可視化し、前年同期比較と業績トレンドを提供します
          </p>
        </div>

        {/* Company selector */}
        <div className="glass-card p-6 mb-8 scale-in">
          <div className="flex gap-4 items-center">
            <span className="text-text-secondary font-semibold">企業選択:</span>
            <button
              onClick={() => setSelectedCompany('TEPCO')}
              className={`neuro-btn ${
                selectedCompany === 'TEPCO'
                  ? 'bg-primary-cyan text-bg-dark shadow-neuro-lg scale-105'
                  : 'hover-glow'
              }`}
            >
              東京電力
            </button>
            <button
              onClick={() => setSelectedCompany('CHUBU')}
              className={`neuro-btn ${
                selectedCompany === 'CHUBU'
                  ? 'bg-primary-magenta text-bg-dark shadow-neuro-lg scale-105'
                  : 'hover-glow'
              }`}
            >
              中部電力
            </button>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="mb-8 slide-in-right">
          <h2 className="text-2xl font-bold text-text-primary mb-4">主要指標サマリー</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Revenue */}
            {revenueYoY && (
              <div className="glass-card parallax-container hover-glow p-6 border border-primary-cyan border-opacity-30">
                <h3 className="text-text-secondary text-sm mb-2">売上高</h3>
                <p className="text-3xl font-bold text-primary-cyan mb-2">
                  {revenueYoY.current.toFixed(0)} <span className="text-base">億円</span>
                </p>
                <YoYBadge changePercent={revenueYoY.changePercent} size="sm" />
              </div>
            )}

            {/* Net Income */}
            {netIncomeYoY && (
              <div className="glass-card parallax-container hover-glow p-6 border border-accent-green border-opacity-30">
                <h3 className="text-text-secondary text-sm mb-2">当期純利益</h3>
                <p className="text-3xl font-bold text-accent-green mb-2">
                  {netIncomeYoY.current.toFixed(0)} <span className="text-base">億円</span>
                </p>
                <YoYBadge changePercent={netIncomeYoY.changePercent} size="sm" />
              </div>
            )}

            {/* Total Assets */}
            {totalAssetsYoY && (
              <div className="glass-card parallax-container hover-glow p-6 border border-primary-magenta border-opacity-30">
                <h3 className="text-text-secondary text-sm mb-2">総資産</h3>
                <p className="text-3xl font-bold text-primary-magenta mb-2">
                  {totalAssetsYoY.current.toFixed(0)} <span className="text-base">億円</span>
                </p>
                <YoYBadge changePercent={totalAssetsYoY.changePercent} size="sm" />
              </div>
            )}

            {/* Operating CF */}
            {operatingCFYoY && (
              <div className="glass-card parallax-container hover-glow p-6 border border-accent-yellow border-opacity-30">
                <h3 className="text-text-secondary text-sm mb-2">営業CF</h3>
                <p className="text-3xl font-bold text-accent-yellow mb-2">
                  {operatingCFYoY.current.toFixed(0)} <span className="text-base">億円</span>
                </p>
                <YoYBadge changePercent={operatingCFYoY.changePercent} size="sm" />
              </div>
            )}
          </div>
        </div>

        {/* Financial Ratios */}
        <div className="mb-8 fade-in">
          <h2 className="text-2xl font-bold text-text-primary mb-4">財務比率</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Equity Ratio */}
            <div className="glass-card parallax-container hover-glow p-6 border border-accent-green border-opacity-20">
              <h3 className="text-text-secondary text-sm mb-2">自己資本比率</h3>
              <p className="text-4xl font-bold text-accent-green mb-1">
                {equityRatio}<span className="text-2xl">%</span>
              </p>
              <p className="text-xs text-text-secondary">純資産 / 総資産</p>
            </div>

            {/* Operating Margin */}
            <div className="glass-card parallax-container hover-glow p-6 border border-primary-cyan border-opacity-20">
              <h3 className="text-text-secondary text-sm mb-2">営業利益率</h3>
              <p className="text-4xl font-bold text-primary-cyan mb-1">
                {operatingMargin}<span className="text-2xl">%</span>
              </p>
              <p className="text-xs text-text-secondary">営業利益 / 売上高</p>
            </div>

            {/* Free Cash Flow */}
            <div className="glass-card parallax-container hover-glow p-6 border border-accent-yellow border-opacity-20">
              <h3 className="text-text-secondary text-sm mb-2">フリーCF</h3>
              <p className="text-4xl font-bold text-accent-yellow mb-1">
                {freeCashFlow}<span className="text-lg">億円</span>
              </p>
              <p className="text-xs text-text-secondary">営業CF + 投資CF</p>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="mb-8 scale-in">
          <h2 className="text-2xl font-bold text-text-primary mb-4">詳細分析</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* P/L Link */}
            <Link
              to="/pl"
              className="glass-card parallax-container hover-glow p-8 border-2 border-primary-cyan border-opacity-30 hover:border-opacity-100 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-primary-cyan group-hover:scale-105 transition-transform">
                  損益計算書
                </h3>
                <span className="text-4xl">📊</span>
              </div>
              <p className="text-text-secondary mb-4">
                売上高、営業利益、当期純利益の推移を分析
              </p>
              <div className="text-primary-cyan text-sm font-semibold">詳細を見る →</div>
            </Link>

            {/* B/S Link */}
            <Link
              to="/bs"
              className="glass-card parallax-container hover-glow p-8 border-2 border-primary-magenta border-opacity-30 hover:border-opacity-100 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-primary-magenta group-hover:scale-105 transition-transform">
                  貸借対照表
                </h3>
                <span className="text-4xl">📈</span>
              </div>
              <p className="text-text-secondary mb-4">資産、負債、純資産の構成を可視化</p>
              <div className="text-primary-magenta text-sm font-semibold">詳細を見る →</div>
            </Link>

            {/* C/F Link */}
            <Link
              to="/cf"
              className="glass-card parallax-container hover-glow p-8 border-2 border-accent-green border-opacity-30 hover:border-opacity-100 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-accent-green group-hover:scale-105 transition-transform">
                  CF計算書
                </h3>
                <span className="text-4xl">💰</span>
              </div>
              <p className="text-text-secondary mb-4">
                営業、投資、財務CFの動向を把握
              </p>
              <div className="text-accent-green text-sm font-semibold">詳細を見る →</div>
            </Link>
          </div>
        </div>

        {/* Data Info */}
        {latestPL && (
          <div className="text-center text-text-secondary text-sm">
            <p>最終更新: {latestPL.period} ({latestPL.period_end})</p>
            <p className="mt-2">データソース: EDINET API (金融庁)</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
