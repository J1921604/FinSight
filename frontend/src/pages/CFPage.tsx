import React, { useState, useEffect } from 'react';
import { CFChart } from '@/components/CFChart';
import { YoYBadge } from '@/components/YoYBadge';
import { loadFinancialData } from '@/services/dataLoader';
import { calculateYoY, findPreviousYearData } from '@/services/yoyCalculator';
import type { FinancialData, YoYComparison } from '@/types/financial';

/**
 * C/F (Cash Flow) Page
 * Displays operating, investing, and financing cash flows with YoY comparison
 */
const CFPage: React.FC = () => {
  const [data, setData] = useState<FinancialData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<'TEPCO' | 'CHUBU'>('TEPCO');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const tepcoData = await loadFinancialData('TEPCO', 'cf');
        const chubuData = await loadFinancialData('CHUBU', 'cf');
        setData([...tepcoData, ...chubuData]);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'データ読み込みエラー');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const displayData = comparisonMode ? data : data.filter((d) => d.company === selectedCompany);

  const latestData = data
    .filter((d) => d.company === selectedCompany)
    .sort((a, b) => b.period.localeCompare(a.period))[0];

  const yoyComparisons: YoYComparison[] = latestData
    ? [
        calculateYoY(
          latestData.operating_cf || 0,
          findPreviousYearData(data, latestData.period, selectedCompany)?.operating_cf || 0,
          '営業CF'
        ),
        calculateYoY(
          latestData.investing_cf || 0,
          findPreviousYearData(data, latestData.period, selectedCompany)?.investing_cf || 0,
          '投資CF'
        ),
        calculateYoY(
          latestData.financing_cf || 0,
          findPreviousYearData(data, latestData.period, selectedCompany)?.financing_cf || 0,
          '財務CF'
        ),
      ]
    : [];

  // Calculate free cash flow (operating - investing)
  const freeCashFlow = latestData
    ? ((latestData.operating_cf || 0) + (latestData.investing_cf || 0)).toFixed(2)
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
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">キャッシュフロー計算書</span> <span className="text-primary-cyan">(C/F)</span>
          </h1>
          <p className="text-text-secondary">Cash Flow Statement</p>
        </div>

        {/* Controls */}
        <div className="glass-card p-6 mb-8 scale-in">
          <div className="flex flex-wrap gap-4 items-center">
            {!comparisonMode && (
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedCompany('TEPCO')}
                  className={`neuro-btn ${
                    selectedCompany === 'TEPCO'
                      ? 'bg-primary-cyan text-bg-dark shadow-neuro-md'
                      : 'hover-glow'
                  }`}
                >
                  東京電力
                </button>
                <button
                  onClick={() => setSelectedCompany('CHUBU')}
                  className={`neuro-btn ${
                    selectedCompany === 'CHUBU'
                      ? 'bg-primary-magenta text-bg-dark shadow-neuro-md'
                      : 'hover-glow'
                  }`}
                >
                  中部電力
                </button>
              </div>
            )}

            <button
              onClick={() => setComparisonMode(!comparisonMode)}
              className={`neuro-btn ${
                comparisonMode
                  ? 'bg-accent-green text-bg-dark shadow-neuro-md'
                  : 'hover-glow'
              }`}
            >
              {comparisonMode ? '比較中' : '比較モード'}
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => setChartType('line')}
                className={`neuro-btn ${
                  chartType === 'line'
                    ? 'bg-primary-cyan text-bg-dark shadow-neuro-md'
                    : 'hover-glow'
                }`}
              >
                折れ線
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`neuro-btn ${
                  chartType === 'bar'
                    ? 'bg-primary-cyan text-bg-dark shadow-neuro-md'
                    : 'hover-glow'
                }`}
              >
                棒グラフ
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        {!comparisonMode && latestData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 slide-in-right">
            {yoyComparisons.map((yoy) => (
              <div
                key={yoy.label}
                className="glass-card parallax-container hover-glow p-6 border border-primary-cyan border-opacity-20"
              >
                <h3 className="text-text-secondary text-sm mb-2">{yoy.label}</h3>
                <p className="text-3xl font-bold text-primary-cyan mb-2">
                  {yoy.current.toFixed(2)} <span className="text-lg">億円</span>
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-text-secondary text-sm">前年同期比</span>
                  <YoYBadge changePercent={yoy.changePercent} size="sm" />
                </div>
              </div>
            ))}

            {/* Free Cash Flow Card */}
            <div className="glass-card parallax-container hover-glow p-6 border border-accent-green border-opacity-20">
              <h3 className="text-text-secondary text-sm mb-2">フリーCF</h3>
              <p className="text-3xl font-bold text-accent-green mb-2">
                {freeCashFlow} <span className="text-lg">億円</span>
              </p>
              <p className="text-text-secondary text-xs">営業CF + 投資CF</p>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="glass-card p-6 fade-in">
          <h2 className="text-2xl font-bold text-text-primary mb-4">推移グラフ</h2>
          <CFChart data={displayData} chartType={chartType} comparisonMode={comparisonMode} />
        </div>

        {/* Period info */}
        {latestData && (
          <div className="mt-4 text-center text-text-secondary text-sm">
            最新データ: {latestData.period} ({latestData.period_end})
          </div>
        )}

        {/* Cash Flow Interpretation Guide */}
        <div className="mt-8 glass-card parallax-container p-6 border border-primary-cyan border-opacity-20 scale-in">
          <h3 className="text-xl font-bold text-text-primary mb-4">CFパターン解釈ガイド</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-l-4 border-accent-green pl-4">
              <h4 className="font-semibold text-accent-green mb-1">健全型</h4>
              <p className="text-sm text-text-secondary">営業CF: プラス</p>
              <p className="text-sm text-text-secondary">投資CF: マイナス</p>
              <p className="text-sm text-text-secondary">財务CF: マイナス</p>
            </div>
            <div className="border-l-4 border-accent-yellow pl-4">
              <h4 className="font-semibold text-accent-yellow mb-1">成長型</h4>
              <p className="text-sm text-text-secondary">営業CF: プラス</p>
              <p className="text-sm text-text-secondary">投資CF: マイナス大</p>
              <p className="text-sm text-text-secondary">財務CF: プラス</p>
            </div>
            <div className="border-l-4 border-accent-red pl-4">
              <h4 className="font-semibold text-accent-red mb-1">要注意</h4>
              <p className="text-sm text-text-secondary">営業CF: マイナス</p>
              <p className="text-sm text-text-secondary">投資CF: プラス(資産売却)</p>
              <p className="text-sm text-text-secondary">財務CF: プラス</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CFPage;
