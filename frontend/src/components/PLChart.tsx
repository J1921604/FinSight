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

interface PLChartProps {
  data: FinancialData[];
  chartType?: 'line' | 'bar';
  comparisonMode?: boolean;
}

/**
 * P/L (Profit & Loss) Statement Chart Component
 * Visualizes revenue, operating income, and net income trends
 */
export const PLChart: React.FC<PLChartProps> = ({
  data,
  chartType = 'line',
  comparisonMode = false,
}) => {
  // Transform data for Recharts
  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!comparisonMode) {
      // Single company mode
      return data.map((d) => ({
        period: d.period,
        revenue: d.revenue,
        operating_income: d.operating_income,
        net_income: d.net_income,
      }));
    } else {
      // Comparison mode - group by period
      const grouped = data.reduce(
        (acc, d) => {
          if (!acc[d.period]) {
            acc[d.period] = { period: d.period };
          }
          if (d.company === 'TEPCO') {
            acc[d.period].revenue_tepco = d.revenue;
            acc[d.period].operating_income_tepco = d.operating_income;
            acc[d.period].net_income_tepco = d.net_income;
          } else {
            acc[d.period].revenue_chubu = d.revenue;
            acc[d.period].operating_income_chubu = d.operating_income;
            acc[d.period].net_income_chubu = d.net_income;
          }
          return acc;
        },
        {} as Record<string, ChartDataPoint>
      );
      return Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period));
    }
  }, [data, comparisonMode]);

  // Custom tooltip
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
                  dataKey="revenue"
                  stroke="#00D4FF"
                  strokeWidth={2}
                  name="売上高"
                  dot={{ fill: '#00D4FF', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="operating_income"
                  stroke="#00FF84"
                  strokeWidth={2}
                  name="営業利益"
                  dot={{ fill: '#00FF84', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="net_income"
                  stroke="#FF2ECC"
                  strokeWidth={2}
                  name="当期純利益"
                  dot={{ fill: '#FF2ECC', r: 4 }}
                />
              </>
            ) : (
              <>
                <Bar dataKey="revenue" fill="#00D4FF" name="売上高" />
                <Bar dataKey="operating_income" fill="#00FF84" name="営業利益" />
                <Bar dataKey="net_income" fill="#FF2ECC" name="当期純利益" />
              </>
            )}
          </>
        ) : (
          <>
            {chartType === 'line' ? (
              <>
                <Line
                  type="monotone"
                  dataKey="revenue_tepco"
                  stroke="#00D4FF"
                  strokeWidth={2}
                  name="東電売上"
                  dot={{ fill: '#00D4FF', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue_chubu"
                  stroke="#00D4FF"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="中電売上"
                  dot={{ fill: '#00D4FF', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="operating_income_tepco"
                  stroke="#00FF84"
                  strokeWidth={2}
                  name="東電営業利益"
                  dot={{ fill: '#00FF84', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="operating_income_chubu"
                  stroke="#00FF84"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="中電営業利益"
                  dot={{ fill: '#00FF84', r: 4 }}
                />
              </>
            ) : (
              <>
                <Bar dataKey="revenue_tepco" fill="#00D4FF" name="東電売上" />
                <Bar dataKey="revenue_chubu" fill="#00D4FF" fillOpacity={0.6} name="中電売上" />
                <Bar dataKey="operating_income_tepco" fill="#00FF84" name="東電営業利益" />
                <Bar
                  dataKey="operating_income_chubu"
                  fill="#00FF84"
                  fillOpacity={0.6}
                  name="中電営業利益"
                />
              </>
            )}
          </>
        )}
      </ChartComponent>
    </ResponsiveContainer>
  );
};
