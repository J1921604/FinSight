"""
Generate sample financial data for testing
Creates quarterly data for TEPCO and CHUBU for the past 10 years
"""

import csv
import os
from datetime import datetime, timedelta
from pathlib import Path


def generate_sample_data():
    """Generate sample quarterly financial data"""
    # Create output directories
    data_dir = Path(__file__).parent.parent / 'data' / 'financials'
    data_dir.mkdir(parents=True, exist_ok=True)

    companies = ['TEPCO', 'CHUBU']
    statements = ['pl', 'bs', 'cf']

    # Base data for each company (annual values in 億円)
    base_data = {
        'TEPCO': {
            'revenue': 60000,
            'operating_income': 3000,
            'net_income': 1500,
            'total_assets': 140000,
            'total_liabilities': 100000,
            'total_equity': 40000,
            'operating_cf': 8000,
            'investing_cf': -5000,
            'financing_cf': -2000,
        },
        'CHUBU': {
            'revenue': 30000,
            'operating_income': 2000,
            'net_income': 1000,
            'total_assets': 70000,
            'total_liabilities': 45000,
            'total_equity': 25000,
            'operating_cf': 5000,
            'investing_cf': -3000,
            'financing_cf': -1500,
        },
    }

    # Generate 10 years of quarterly data
    start_year = 2015
    end_year = 2025
    quarters = [
        ('03-31', 'Q4'),
        ('06-30', 'Q1'),
        ('09-30', 'Q2'),
        ('12-31', 'Q3'),
    ]

    for company in companies:
        for statement in statements:
            filename = data_dir / f'{company}_{statement}_quarterly.csv'
            rows = []

            # Generate data for each quarter
            for year in range(start_year, end_year):
                for month_day, quarter in quarters:
                    period_end = f'{year}-{month_day}'
                    period = f'{year}{quarter}'

                    # Add some variance (±10%)
                    import random

                    variance = random.uniform(0.9, 1.1)
                    growth = 1 + ((year - start_year) * 0.02)  # 2% annual growth

                    if statement == 'pl':
                        row = {
                            'company': company,
                            'period': period,
                            'period_end': period_end,
                            'revenue': round(
                                base_data[company]['revenue'] / 4 * variance * growth, 2
                            ),
                            'operating_income': round(
                                base_data[company]['operating_income'] / 4 * variance * growth, 2
                            ),
                            'net_income': round(
                                base_data[company]['net_income'] / 4 * variance * growth, 2
                            ),
                        }
                    elif statement == 'bs':
                        row = {
                            'company': company,
                            'period': period,
                            'period_end': period_end,
                            'total_assets': round(
                                base_data[company]['total_assets'] * variance * growth, 2
                            ),
                            'total_liabilities': round(
                                base_data[company]['total_liabilities'] * variance * growth, 2
                            ),
                            'total_equity': round(
                                base_data[company]['total_equity'] * variance * growth, 2
                            ),
                        }
                    elif statement == 'cf':
                        row = {
                            'company': company,
                            'period': period,
                            'period_end': period_end,
                            'operating_cf': round(
                                base_data[company]['operating_cf'] / 4 * variance * growth, 2
                            ),
                            'investing_cf': round(
                                base_data[company]['investing_cf'] / 4 * variance * growth, 2
                            ),
                            'financing_cf': round(
                                base_data[company]['financing_cf'] / 4 * variance * growth, 2
                            ),
                        }

                    rows.append(row)

            # Write CSV
            if rows:
                fieldnames = rows[0].keys()
                with open(filename, 'w', newline='', encoding='utf-8') as f:
                    writer = csv.DictWriter(f, fieldnames=fieldnames)
                    writer.writeheader()
                    writer.writerows(rows)

                print(f'Created: {filename} ({len(rows)} rows)')


if __name__ == '__main__':
    print('Generating sample financial data...')
    generate_sample_data()
    print('Sample data generation complete!')
