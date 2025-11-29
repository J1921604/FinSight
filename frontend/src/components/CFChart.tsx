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

interface CFChartProps {
  data: FinancialData[];
  chartType?: 'line' | 'bar';
  comparisonMode?: boolean;
}

/**
 * C/F (Cash Flow) Statement Chart Component
 * Visualizes operating, investing, and financing cash flows
 */
export const CFChart: React.FC<CFChartProps> = ({
  data,
  chartType = 'line',
  comparisonMode = false,
}) => {
  // Transform data for Recharts
  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!comparisonMode) {
      return data.map((d) => ({
        period: d.period,
        operating_cf: d.operating_cf,
        investing_cf: d.investing_cf,
        financing_cf: d.financing_cf,
      }));
    } else {
      const grouped = data.reduce(
        (acc, d) => {
          if (!acc[d.period]) {
            acc[d.period] = { period: d.period };
          }
          if (d.company === 'TEPCO') {
            acc[d.period].operating_cf_tepco = d.operating_cf;
            acc[d.period].investing_cf_tepco = d.investing_cf;
            acc[d.period].financing_cf_tepco = d.financing_cf;
          } else {
            acc[d.period].operating_cf_chubu = d.operating_cf;
            acc[d.period].investing_cf_chubu = d.investing_cf;
            acc[d.period].financing_cf_chubu = d.financing_cf;
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
                  dataKey="operating_cf"
                  stroke="#00FF84"
                  strokeWidth={2}
                  name="営業CF"
                  dot={{ fill: '#00FF84', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="investing_cf"
                  stroke="#FF2ECC"
                  strokeWidth={2}
                  name="投資CF"
                  dot={{ fill: '#FF2ECC', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="financing_cf"
                  stroke="#FFB800"
                  strokeWidth={2}
                  name="財務CF"
                  dot={{ fill: '#FFB800', r: 4 }}
                />
              </>
            ) : (
              <>
                <Bar dataKey="operating_cf" fill="#00FF84" name="営業CF" />
                <Bar dataKey="investing_cf" fill="#FF2ECC" name="投資CF" />
                <Bar dataKey="financing_cf" fill="#FFB800" name="財務CF" />
              </>
            )}
          </>
        ) : (
          <>
            {chartType === 'line' ? (
              <>
                <Line
                  type="monotone"
                  dataKey="operating_cf_tepco"
                  stroke="#00FF84"
                  strokeWidth={2}
                  name="東電営業CF"
                  dot={{ fill: '#00FF84', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="operating_cf_chubu"
                  stroke="#00FF84"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="中電営業CF"
                  dot={{ fill: '#00FF84', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="investing_cf_tepco"
                  stroke="#FF2ECC"
                  strokeWidth={2}
                  name="東電投資CF"
                  dot={{ fill: '#FF2ECC', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="investing_cf_chubu"
                  stroke="#FF2ECC"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="中電投資CF"
                  dot={{ fill: '#FF2ECC', r: 4 }}
                />
              </>
            ) : (
              <>
                <Bar dataKey="operating_cf_tepco" fill="#00FF84" name="東電営業CF" />
                <Bar dataKey="operating_cf_chubu" fill="#00FF84" fillOpacity={0.6} name="中電営業CF" />
                <Bar dataKey="investing_cf_tepco" fill="#FF2ECC" name="東電投資CF" />
                <Bar dataKey="investing_cf_chubu" fill="#FF2ECC" fillOpacity={0.6} name="中電投資CF" />
              </>
            )}
          </>
        )}
      </ChartComponent>
    </ResponsiveContainer>
  );
};
