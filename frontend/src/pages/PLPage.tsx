import React, { useState, useEffect } from 'react';
import { PLChart } from '@/components/PLChart';
import { YoYBadge } from '@/components/YoYBadge';
import { loadFinancialData } from '@/services/dataLoader';
import { calculateYoY, findPreviousYearData } from '@/services/yoyCalculator';
import type { FinancialData, YoYComparison } from '@/types/financial';

/**
 * P/L (Profit & Loss) Page
 * Displays revenue, operating income, and net income with YoY comparison
 */
const PLPage: React.FC = () => {
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
        const tepcoData = await loadFinancialData('TEPCO', 'pl');
        const chubuData = await loadFinancialData('CHUBU', 'pl');
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

  // Get filtered data
  const displayData = comparisonMode ? data : data.filter((d) => d.company === selectedCompany);

  // Get latest period data for metrics
  const latestData = data
    .filter((d) => d.company === selectedCompany)
    .sort((a, b) => b.period.localeCompare(a.period))[0];

  // Calculate YoY comparisons
  const yoyComparisons: YoYComparison[] = latestData
    ? [
        calculateYoY(
          latestData.revenue || 0,
          findPreviousYearData(data, latestData.period, selectedCompany)?.revenue || 0,
          '売上高'
        ),
        calculateYoY(
          latestData.operating_income || 0,
          findPreviousYearData(data, latestData.period, selectedCompany)?.operating_income || 0,
          '営業利益'
        ),
        calculateYoY(
          latestData.net_income || 0,
          findPreviousYearData(data, latestData.period, selectedCompany)?.net_income || 0,
          '当期純利益'
        ),
      ]
    : [];

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
            <span className="gradient-text">損益計算書</span> <span className="text-primary-cyan">(P/L)</span>
          </h1>
          <p className="text-text-secondary">Profit & Loss Statement</p>
        </div>

        {/* Controls */}
        <div className="glass-card p-6 mb-8 scale-in">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Company selector */}
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

            {/* Comparison mode toggle */}
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

            {/* Chart type toggle */}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 slide-in-right">
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
          </div>
        )}

        {/* Chart */}
        <div className="glass-card p-6 fade-in">
          <h2 className="text-2xl font-bold text-text-primary mb-4">推移グラフ</h2>
          <PLChart data={displayData} chartType={chartType} comparisonMode={comparisonMode} />
        </div>

        {/* Period info */}
        {latestData && (
          <div className="mt-4 text-center text-text-secondary text-sm">
            最新データ: {latestData.period} ({latestData.period_end})
          </div>
        )}
      </div>
    </div>
  );
};

export default PLPage;
