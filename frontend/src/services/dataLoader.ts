// CSV data loader using Papa Parse

import Papa from 'papaparse';
import type { FinancialData } from '@/types/financial';
import { DataLoadError, ParseError } from '@/lib/errorHandler';

export interface LoadDataOptions {
  cache?: boolean;
  validateSchema?: boolean;
}

// Cache for loaded data
const dataCache: Map<string, FinancialData[]> = new Map();

/**
 * Load financial data from CSV file
 * @param company Company code (TEPCO or CHUBU)
 * @param statement Statement type (pl, bs, or cf)
 * @param options Loading options
 * @returns Promise<FinancialData[]>
 */
export const loadFinancialData = async (
  company: 'TEPCO' | 'CHUBU',
  statement: 'pl' | 'bs' | 'cf',
  options: LoadDataOptions = {}
): Promise<FinancialData[]> => {
  const { cache = true, validateSchema = true } = options;
  const cacheKey = `${company}_${statement}`;

  // Check cache first
  if (cache && dataCache.has(cacheKey)) {
    return dataCache.get(cacheKey)!;
  }

  try {
    const filename = `${company}_${statement}_quarterly.csv`;
    const basePath = '/FinSight/';
    const url = `${basePath}data/${filename}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new DataLoadError(`Failed to load ${filename}: ${response.statusText}`, {
        status: response.status,
        url,
      });
    }

    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse<FinancialData>(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(
              new ParseError('CSV parsing failed', {
                errors: results.errors,
                filename,
              })
            );
            return;
          }

          const data = results.data;

          // Validate schema if requested
          if (validateSchema) {
            const validationErrors = validateFinancialData(data);
            if (validationErrors.length > 0) {
              reject(
                new ParseError('Data validation failed', {
                  errors: validationErrors,
                  filename,
                })
              );
              return;
            }
          }

          // Cache the data
          if (cache) {
            dataCache.set(cacheKey, data);
          }

          resolve(data);
        },
        error: (error: any) => {
          reject(
            new ParseError(`Papa Parse error: ${error.message}`, {
              filename,
              error,
            })
          );
        },
      });
    });
  } catch (error) {
    if (error instanceof DataLoadError || error instanceof ParseError) {
      throw error;
    }
    throw new DataLoadError('Unexpected error loading financial data', { error });
  }
};

/**
 * Validate financial data schema
 */
const validateFinancialData = (data: FinancialData[]): string[] => {
  const errors: string[] = [];

  data.forEach((row, index) => {
    // Check required fields
    if (!row.company || !['TEPCO', 'CHUBU'].includes(row.company)) {
      errors.push(`Row ${index}: Invalid company "${row.company}"`);
    }

    if (!row.period || !/^\d{4}Q[1-4]$/.test(row.period)) {
      errors.push(`Row ${index}: Invalid period format "${row.period}" (expected YYYYQQ)`);
    }

    if (!row.period_end) {
      errors.push(`Row ${index}: Missing period_end field`);
    }

    // Check numeric fields are actually numbers
    const numericFields = [
      'revenue',
      'operating_income',
      'ordinary_income',
      'net_income',
      'total_assets',
      'current_assets',
      'fixed_assets',
      'operating_cf',
      'investing_cf',
      'financing_cf',
    ];

    numericFields.forEach((field) => {
      const value = row[field as keyof FinancialData];
      if (value !== undefined && value !== null && typeof value !== 'number') {
        errors.push(`Row ${index}: Field "${field}" is not a number: ${value}`);
      }
    });
  });

  return errors;
};

/**
 * Clear data cache
 */
export const clearCache = (): void => {
  dataCache.clear();
};

/**
 * Get cache status
 */
export const getCacheStatus = (): { size: number; keys: string[] } => {
  return {
    size: dataCache.size,
    keys: Array.from(dataCache.keys()),
  };
};
