import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { FinancialData, ChartDataPoint } from '@/types/financial';

interface BSChartProps {
  data: FinancialData[];
  chartType?: 'line' | 'bar';
  comparisonMode?: boolean;
}

/**
 * B/S (Balance Sheet) Chart Component
 * Visualizes assets, liabilities, and equity trends
 */
export const BSChart: React.FC<BSChartProps> = ({
  data,
  chartType = 'line',
  comparisonMode = false,
}) => {
  // Transform data for Recharts
  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!comparisonMode) {
      return data.map((d) => ({
        period: d.period,
        total_assets: d.total_assets,
        total_liabilities: d.total_liabilities,
        total_equity: d.total_equity,
      }));
    } else {
      const grouped = data.reduce(
        (acc, d) => {
          if (!acc[d.period]) {
            acc[d.period] = { period: d.period };
          }
          if (d.company === 'TEPCO') {
            acc[d.period].total_assets_tepco = d.total_assets;
            acc[d.period].total_liabilities_tepco = d.total_liabilities;
            acc[d.period].total_equity_tepco = d.total_equity;
          } else {
            acc[d.period].total_assets_chubu = d.total_assets;
            acc[d.period].total_liabilities_chubu = d.total_liabilities;
            acc[d.period].total_equity_chubu = d.total_equity;
          }
          return acc;
        },
        {} as Record<string, ChartDataPoint>
      );
      return Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period));
    }
  }, [data, comparisonMode]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-bg-card border border-primary-cyan border-opacity-30 rounded-lg p-4 shadow-neuro-md">
          <p className="font-semibold text-text-primary mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value.toFixed(2)} 億円
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const ChartComponent = chartType === 'line' ? LineChart : BarChart;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ChartComponent data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1A1F3A" />
        <XAxis
          dataKey="period"
          stroke="#8892B0"
          tick={{ fill: '#8892B0', fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis
          stroke="#8892B0"
          tick={{ fill: '#8892B0', fontSize: 12 }}
          label={{ value: '億円', angle: -90, position: 'insideLeft', fill: '#8892B0' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ color: '#8892B0', fontSize: 12 }} />

        {!comparisonMode ? (
          <>
            {chartType === 'line' ? (
              <>
                <Line
                  type="monotone"
                  dataKey="total_assets"
                  stroke="#00D4FF"
                  strokeWidth={2}
                  name="総資産"
                  dot={{ fill: '#00D4FF', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="total_liabilities"
                  stroke="#FF4757"
                  strokeWidth={2}
                  name="負債合計"
                  dot={{ fill: '#FF4757', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="total_equity"
                  stroke="#00FF84"
                  strokeWidth={2}
                  name="純資産"
                  dot={{ fill: '#00FF84', r: 4 }}
                />
              </>
            ) : (
              <>
                <Bar dataKey="total_assets" fill="#00D4FF" name="総資産" />
                <Bar dataKey="total_liabilities" fill="#FF4757" name="負債合計" />
                <Bar dataKey="total_equity" fill="#00FF84" name="純資産" />
              </>
            )}
          </>
        ) : (
          <>
            {chartType === 'line' ? (
              <>
                <Line
                  type="monotone"
                  dataKey="total_assets_tepco"
                  stroke="#00D4FF"
                  strokeWidth={2}
                  name="東電総資産"
                  dot={{ fill: '#00D4FF', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="total_assets_chubu"
                  stroke="#00D4FF"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="中電総資産"
                  dot={{ fill: '#00D4FF', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="total_equity_tepco"
                  stroke="#00FF84"
                  strokeWidth={2}
                  name="東電純資産"
                  dot={{ fill: '#00FF84', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="total_equity_chubu"
                  stroke="#00FF84"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="中電純資産"
                  dot={{ fill: '#00FF84', r: 4 }}
                />
              </>
            ) : (
              <>
                <Bar dataKey="total_assets_tepco" fill="#00D4FF" name="東電総資産" />
                <Bar dataKey="total_assets_chubu" fill="#00D4FF" fillOpacity={0.6} name="中電総資産" />
                <Bar dataKey="total_equity_tepco" fill="#00FF84" name="東電純資産" />
                <Bar dataKey="total_equity_chubu" fill="#00FF84" fillOpacity={0.6} name="中電純資産" />
              </>
            )}
          </>
        )}
      </ChartComponent>
    </ResponsiveContainer>
  );
};
