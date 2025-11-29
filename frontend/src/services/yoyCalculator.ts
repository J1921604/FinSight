// YoY (Year-over-Year) comparison calculator

import type { FinancialData, YoYComparison } from '@/types/financial';

/**
 * Calculate Year-over-Year comparison
 * @param current Current period data
 * @param previous Previous year same period data
 * @param label Metric label
 * @returns YoY comparison data
 */
export const calculateYoY = (
  current: number,
  previous: number,
  label: string
): YoYComparison => {
  const change = current - previous;
  const changePercent = previous !== 0 ? (change / previous) * 100 : 0;

  return {
    current,
    previous,
    change,
    changePercent,
    label,
  };
};

/**
 * Find previous year same period data
 * @param data All financial data
 * @param currentPeriod Current period (e.g., "2025Q2")
 * @param company Company code
 * @returns Previous year data or undefined
 */
export const findPreviousYearData = (
  data: FinancialData[],
  currentPeriod: string,
  company: 'TEPCO' | 'CHUBU'
): FinancialData | undefined => {
  // Parse current period (e.g., "2025Q2" -> year: 2025, quarter: 2)
  const match = currentPeriod.match(/^(\d{4})Q([1-4])$/);
  if (!match) return undefined;

  const year = parseInt(match[1]);
  const quarter = match[2];

  // Calculate previous year same period
  const previousPeriod = `${year - 1}Q${quarter}`;

  // Find matching data
  return data.find((d) => d.company === company && d.period === previousPeriod);
};

/**
 * Get YoY color based on change percent
 * @param changePercent Change percentage
 * @returns Tailwind color class
 */
export const getYoYColor = (changePercent: number): string => {
  if (changePercent >= 5) return 'text-accent-green';
  if (changePercent <= -5) return 'text-accent-red';
  return 'text-accent-yellow';
};

/**
 * Get YoY background color
 * @param changePercent Change percentage
 * @returns Tailwind background color class
 */
export const getYoYBgColor = (changePercent: number): string => {
  if (changePercent >= 5) return 'bg-accent-green';
  if (changePercent <= -5) return 'bg-accent-red';
  return 'bg-accent-yellow';
};

/**
 * Format YoY percentage for display
 * @param changePercent Change percentage
 * @returns Formatted string (e.g., "+12.3%", "-5.7%")
 */
export const formatYoYPercent = (changePercent: number): string => {
  const sign = changePercent >= 0 ? '+' : '';
  return `${sign}${changePercent.toFixed(1)}%`;
};
