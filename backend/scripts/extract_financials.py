"""
EDINET ZIPファイルからCSVを抽出して財務データを変換
"""

import csv
import json
import re
import sys
import zipfile
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

import pandas as pd

from logger import get_data_logger

# Logger
logger = get_data_logger()

# Directories
PROJECT_ROOT = Path(__file__).parent.parent.parent
DATA_DIR = PROJECT_ROOT / "data"
FINANCIALS_DIR = DATA_DIR / "financials"
CACHE_DIR = DATA_DIR / ".cache"
TAXONOMY_MAP_PATH = DATA_DIR / "taxonomy_map.json"

# Create directories
FINANCIALS_DIR.mkdir(parents=True, exist_ok=True)


def load_taxonomy_mapping() -> Dict[str, List[str]]:
    """タクソノミマッピングを読み込む"""
    if not TAXONOMY_MAP_PATH.exists():
        logger.warning(f"Taxonomy map not found: {TAXONOMY_MAP_PATH}")
        return {}

    with open(TAXONOMY_MAP_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
        return data.get("mappings", {})


def parse_period_from_filename(filename: str) -> Optional[str]:
    """
    ファイル名から期間を抽出

    Args:
        filename: ファイル名 (例: TEPCO_S100ABCD_2025-09-30.zip)

    Returns:
        期間 (YYYYQQ形式) または None
    """
    # Extract date (YYYY-MM-DD)
    date_match = re.search(r"(\d{4})-(\d{2})-(\d{2})", filename)
    if not date_match:
        return None

    year = int(date_match.group(1))
    month = int(date_match.group(2))

    # Determine quarter
    if month in [1, 2, 3]:
        quarter = 4  # Q4 of previous year
        year -= 1
    elif month in [4, 5, 6]:
        quarter = 1  # Q1
    elif month in [7, 8, 9]:
        quarter = 2  # Q2
    else:  # 10, 11, 12
        quarter = 3  # Q3

    return f"{year}Q{quarter}"


def extract_csv_from_zip(zip_path: Path) -> List[Path]:
    """
    ZIPファイルからCSVファイルを抽出

    Args:
        zip_path: ZIPファイルパス

    Returns:
        抽出されたCSVファイルのパスリスト
    """
    extracted_files = []
    extract_dir = CACHE_DIR / f"{zip_path.stem}_extracted"
    extract_dir.mkdir(exist_ok=True)

    try:
        with zipfile.ZipFile(zip_path, "r") as zf:
            for name in zf.namelist():
                if name.endswith(".csv"):
                    zf.extract(name, extract_dir)
                    extracted_path = extract_dir / name
                    extracted_files.append(extracted_path)
                    logger.debug(f"Extracted: {name}")

    except zipfile.BadZipFile:
        logger.error(f"Bad ZIP file: {zip_path}")

    logger.info(f"Extracted {len(extracted_files)} CSV files from {zip_path.name}")
    return extracted_files


def map_field_name(edinet_label: str, taxonomy_map: Dict[str, List[str]]) -> Optional[str]:
    """
    EDINET要素名をFinSightフィールド名にマッピング

    Args:
        edinet_label: EDINET要素名
        taxonomy_map: タクソノミマッピング

    Returns:
        フィールド名 または None
    """
    for field_name, aliases in taxonomy_map.items():
        for alias in aliases:
            if alias in edinet_label:
                return field_name

    return None


def parse_financial_csv(
    csv_path: Path,
    company: str,
    period: str,
    date: str,
    taxonomy_map: Dict[str, List[str]],
) -> Optional[Dict[str, Any]]:
    """
    財務CSVをパースして1行のデータに変換

    Args:
        csv_path: CSVファイルパス
        company: 企業コード (TEPCO/CHUBU)
        period: 期間 (YYYYQQ)
        date: 決算日 (YYYY-MM-DD)
        taxonomy_map: タクソノミマッピング

    Returns:
        財務データ辞書 または None
    """
    try:
        # Read CSV
        df = pd.read_csv(csv_path, encoding="cp932")

        # Initialize data row
        data_row: Dict[str, Any] = {
            "company": company,
            "period": period,
            "date": date,
        }

        # Map columns
        for _, row in df.iterrows():
            label = str(row.get("要素名", ""))
            value = row.get("金額", None)

            if pd.isna(value) or label == "":
                continue

            # Map to field name
            field_name = map_field_name(label, taxonomy_map)
            if field_name:
                # Convert to 億円 (assume original is 千円)
                try:
                    value_float = float(value) / 100000  # 千円 → 億円
                    data_row[field_name] = round(value_float, 2)
                except (ValueError, TypeError):
                    logger.warning(f"Invalid value for {label}: {value}")

        # Check if we got any data
        if len(data_row) > 3:  # More than just company, period, date
            return data_row

        return None

    except Exception as e:
        logger.error(f"Error parsing {csv_path}: {str(e)}")
        return None


def process_company_cache(company: str) -> None:
    """
    企業のキャッシュファイルを処理して財務データCSVを生成

    Args:
        company: 企業コード (TEPCO/CHUBU)
    """
    logger.info(f"=== Processing {company} cache files ===")

    # Find cache files for this company
    cache_files = list(CACHE_DIR.glob(f"{company}_*.zip"))
    logger.info(f"Found {len(cache_files)} cache files")

    if not cache_files:
        logger.warning(f"No cache files found for {company}")
        return

    # Load taxonomy mapping
    taxonomy_map = load_taxonomy_mapping()

    # Collect all financial data
    all_data: List[Dict[str, Any]] = []

    for zip_path in cache_files:
        logger.info(f"Processing: {zip_path.name}")

        # Extract period and date from filename
        period = parse_period_from_filename(zip_path.name)
        if not period:
            logger.warning(f"Could not parse period from: {zip_path.name}")
            continue

        # Extract date (YYYY-MM-DD)
        date_match = re.search(r"(\d{4}-\d{2}-\d{2})", zip_path.name)
        date = date_match.group(1) if date_match else "unknown"

        # Extract CSVs
        csv_files = extract_csv_from_zip(zip_path)

        # Parse each CSV
        for csv_path in csv_files:
            data_row = parse_financial_csv(csv_path, company, period, date, taxonomy_map)
            if data_row:
                all_data.append(data_row)
                logger.debug(f"Parsed data: {period} with {len(data_row)} fields")

    # Sort by period
    all_data.sort(key=lambda x: x["period"])

    # Create separate CSVs for PL, BS, CF
    create_statement_csvs(company, all_data)

    logger.info(f"=== Completed processing for {company} ===")


def create_statement_csvs(company: str, data: List[Dict[str, Any]]) -> None:
    """
    PL/BS/CFの個別CSVファイルを作成

    Args:
        company: 企業コード
        data: 財務データリスト
    """
    # Define fields for each statement
    pl_fields = ["company", "period", "date", "revenue", "operating_income", "ordinary_income", "net_income"]
    bs_fields = ["company", "period", "date", "total_assets", "current_assets", "fixed_assets", "total_liabilities", "net_assets"]
    cf_fields = ["company", "period", "date", "operating_cf", "investing_cf", "financing_cf"]

    statements = {
        "pl": pl_fields,
        "bs": bs_fields,
        "cf": cf_fields,
    }

    for statement_type, fields in statements.items():
        output_path = FINANCIALS_DIR / f"{company}_{statement_type}_quarterly.csv"

        # Filter rows that have at least one field from this statement
        statement_data = []
        for row in data:
            # Check if row has any statement-specific fields
            has_data = any(field in row and row[field] is not None for field in fields[3:])
            if has_data:
                statement_data.append(row)

        if not statement_data:
            logger.warning(f"No data for {company} {statement_type.upper()}")
            continue

        # Write CSV
        with open(output_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
            writer.writeheader()
            writer.writerows(statement_data)

        logger.info(f"Created: {output_path.name} ({len(statement_data)} rows)")


def main() -> int:
    """メイン処理"""
    logger.info("=" * 80)
    logger.info("Financial Data Extraction")
    logger.info("=" * 80)

    try:
        # Process TEPCO
        process_company_cache("TEPCO")

        # Process CHUBU
        process_company_cache("CHUBU")

        logger.info("=" * 80)
        logger.info("✓ Data extraction completed successfully")
        logger.info("=" * 80)
        return 0

    except Exception as e:
        logger.error(f"Fatal error: {str(e)}", exc_info=True)
        return 1


if __name__ == "__main__":
    sys.exit(main())
