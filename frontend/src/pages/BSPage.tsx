import React, { useState, useEffect } from 'react';
import { BSChart } from '@/components/BSChart';
import { YoYBadge } from '@/components/YoYBadge';
import { loadFinancialData } from '@/services/dataLoader';
import { calculateYoY, findPreviousYearData } from '@/services/yoyCalculator';
import type { FinancialData, YoYComparison } from '@/types/financial';

/**
 * B/S (Balance Sheet) Page
 * Displays assets, liabilities, and equity with YoY comparison
 */
const BSPage: React.FC = () => {
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
        const tepcoData = await loadFinancialData('TEPCO', 'bs');
        const chubuData = await loadFinancialData('CHUBU', 'bs');
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
          latestData.total_assets || 0,
          findPreviousYearData(data, latestData.period, selectedCompany)?.total_assets || 0,
          '総資産'
        ),
        calculateYoY(
          latestData.total_liabilities || 0,
          findPreviousYearData(data, latestData.period, selectedCompany)?.total_liabilities || 0,
          '負債合計'
        ),
        calculateYoY(
          latestData.total_equity || 0,
          findPreviousYearData(data, latestData.period, selectedCompany)?.total_equity || 0,
          '純資産'
        ),
      ]
    : [];

  // Calculate equity ratio
  const equityRatio = latestData && latestData.total_assets && latestData.total_equity
    ? (((latestData.total_equity || 0) / (latestData.total_assets || 1)) * 100).toFixed(1)
    : '0.0';

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
            <span className="gradient-text">貸借対照表</span> <span className="text-primary-cyan">(B/S)</span>
          </h1>
          <p className="text-text-secondary">Balance Sheet</p>
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

            {/* Equity Ratio Card */}
            <div className="glass-card parallax-container hover-glow p-6 border border-accent-green border-opacity-20">
              <h3 className="text-text-secondary text-sm mb-2">自己資本比率</h3>
              <p className="text-3xl font-bold text-accent-green mb-2">
                {equityRatio} <span className="text-lg">%</span>
              </p>
              <p className="text-text-secondary text-xs">純資産 / 総資産</p>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="glass-card p-6 fade-in">
          <h2 className="text-2xl font-bold text-text-primary mb-4">推移グラフ</h2>
          <BSChart data={displayData} chartType={chartType} comparisonMode={comparisonMode} />
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

export default BSPage;
