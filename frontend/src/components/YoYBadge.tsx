import React from 'react';
import { formatYoYPercent, getYoYColor, getYoYBgColor } from '@/services/yoyCalculator';

interface YoYBadgeProps {
  changePercent: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'text' | 'badge';
}

/**
 * YoY change badge component
 * Displays Year-over-Year change percentage with color coding
 */
export const YoYBadge: React.FC<YoYBadgeProps> = ({
  changePercent,
  size = 'md',
  variant = 'badge',
}) => {
  const textColor = getYoYColor(changePercent);
  const bgColor = getYoYBgColor(changePercent);
  const formattedPercent = formatYoYPercent(changePercent);

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  if (variant === 'text') {
    return (
      <span className={`font-semibold ${textColor} ${sizeClasses[size]}`}>
        {formattedPercent}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${bgColor} bg-opacity-20 ${textColor} ${sizeClasses[size]}`}
    >
      {formattedPercent}
    </span>
  );
};
