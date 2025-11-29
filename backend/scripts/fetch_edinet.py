"""
EDINET API v2 からデータを取得するスクリプト
東京電力HD (E04498) と中部電力 (E04503) の財務データを取得
"""

import os
import sys
import time
import zipfile
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional

import requests
from dotenv import load_dotenv

from logger import get_edinet_logger

# Load environment variables
load_dotenv()
load_dotenv(".env.local")  # Override with local env if exists

# Logger
logger = get_edinet_logger()

# Configuration
EDINET_API_KEY = os.getenv("EDINET_API_KEY")
EDINET_API_BASE = os.getenv("EDINET_API_BASE", "https://api.edinet-fsa.go.jp/api/v2")
TEPCO_CODE = os.getenv("TEPCO_CODE", "E04498")
CHUBU_CODE = os.getenv("CHUBU_CODE", "E04503")

# Data directories
PROJECT_ROOT = Path(__file__).parent.parent.parent
DATA_DIR = PROJECT_ROOT / "data"
FINANCIALS_DIR = DATA_DIR / "financials"
CACHE_DIR = DATA_DIR / ".cache"

# Create directories
FINANCIALS_DIR.mkdir(parents=True, exist_ok=True)
CACHE_DIR.mkdir(parents=True, exist_ok=True)


class EDINETAPIError(Exception):
    """EDINET API error"""

    pass


def get_documents_list(
    date: str,
    doc_type: int = 2,
    max_retries: int = 3,
    retry_delay: int = 10,
) -> List[Dict]:
    """
    EDINET 書類一覧APIを呼び出す

    Args:
        date: 日付 (YYYY-MM-DD)
        doc_type: 書類種別 (2: 有価証券報告書・四半期報告書)
        max_retries: 最大リトライ回数
        retry_delay: リトライ間隔 (秒)

    Returns:
        書類一覧

    Raises:
        EDINETAPIError: API呼び出しエラー
    """
    if not EDINET_API_KEY:
        raise EDINETAPIError("EDINET_API_KEY is not set. Please set it in .env.local")

    url = f"{EDINET_API_BASE}/documents.json"
    params = {"date": date, "type": doc_type}
    headers = {"Subscription-Key": EDINET_API_KEY}

    for attempt in range(max_retries):
        try:
            logger.info(f"Fetching documents list for date: {date} (attempt {attempt + 1})")
            response = requests.get(url, params=params, headers=headers, timeout=30)

            if response.status_code == 200:
                data = response.json()
                results = data.get("results", [])
                logger.info(f"Found {len(results)} documents")
                return results

            elif response.status_code == 401:
                raise EDINETAPIError("Invalid API key (401 Unauthorized)")

            elif response.status_code == 404:
                logger.warning(f"No documents found for date: {date}")
                return []

            else:
                logger.warning(
                    f"API returned status {response.status_code}: {response.text}"
                )
                if attempt < max_retries - 1:
                    logger.info(f"Retrying in {retry_delay} seconds...")
                    time.sleep(retry_delay)
                else:
                    raise EDINETAPIError(
                        f"Failed to fetch documents list: HTTP {response.status_code}"
                    )

        except requests.exceptions.Timeout:
            logger.warning(f"Request timeout (attempt {attempt + 1})")
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
            else:
                raise EDINETAPIError("Request timeout after max retries")

        except requests.exceptions.RequestException as e:
            logger.error(f"Request error: {str(e)}")
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
            else:
                raise EDINETAPIError(f"Request failed: {str(e)}")

    raise EDINETAPIError("Failed to fetch documents list after max retries")


def download_document(
    doc_id: str,
    output_path: Path,
    doc_type: int = 5,
    max_retries: int = 3,
    retry_delay: int = 10,
) -> bool:
    """
    EDINET 書類取得APIでZIPファイルをダウンロード

    Args:
        doc_id: 書類ID
        output_path: 出力ファイルパス
        doc_type: 書類種別 (5: CSV形式)
        max_retries: 最大リトライ回数
        retry_delay: リトライ間隔 (秒)

    Returns:
        成功したかどうか

    Raises:
        EDINETAPIError: API呼び出しエラー
    """
    if not EDINET_API_KEY:
        raise EDINETAPIError("EDINET_API_KEY is not set")

    url = f"{EDINET_API_BASE}/documents/{doc_id}"
    params = {"type": doc_type}
    headers = {"Subscription-Key": EDINET_API_KEY}

    for attempt in range(max_retries):
        try:
            logger.info(
                f"Downloading document {doc_id} (type={doc_type}, attempt {attempt + 1})"
            )
            response = requests.get(
                url, params=params, headers=headers, timeout=60, stream=True
            )

            if response.status_code == 200:
                with open(output_path, "wb") as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)

                logger.info(f"Downloaded to: {output_path}")
                return True

            elif response.status_code == 401:
                raise EDINETAPIError("Invalid API key (401 Unauthorized)")

            elif response.status_code == 404:
                logger.warning(f"Document {doc_id} not found (404)")
                return False

            else:
                logger.warning(
                    f"API returned status {response.status_code}: {response.text[:200]}"
                )
                if attempt < max_retries - 1:
                    logger.info(f"Retrying in {retry_delay} seconds...")
                    time.sleep(retry_delay)
                else:
                    raise EDINETAPIError(
                        f"Failed to download document: HTTP {response.status_code}"
                    )

        except requests.exceptions.Timeout:
            logger.warning(f"Request timeout (attempt {attempt + 1})")
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
            else:
                raise EDINETAPIError("Download timeout after max retries")

        except requests.exceptions.RequestException as e:
            logger.error(f"Request error: {str(e)}")
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
            else:
                raise EDINETAPIError(f"Download failed: {str(e)}")

    return False


def find_company_documents(
    edinet_code: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = 40,
) -> List[Dict]:
    """
    特定企業の書類を検索

    Args:
        edinet_code: EDINETコード
        start_date: 開始日 (YYYY-MM-DD)
        end_date: 終了日 (YYYY-MM-DD)
        limit: 取得件数上限

    Returns:
        書類リスト
    """
    if not end_date:
        end_date = datetime.now().strftime("%Y-%m-%d")

    if not start_date:
        # Default: 10 years ago
        start = datetime.now() - timedelta(days=365 * 10)
        start_date = start.strftime("%Y-%m-%d")

    logger.info(
        f"Searching documents for {edinet_code} from {start_date} to {end_date}"
    )

    found_docs = []
    current_date = datetime.strptime(end_date, "%Y-%m-%d")
    start = datetime.strptime(start_date, "%Y-%m-%d")

    # Search backwards from end_date
    while current_date >= start and len(found_docs) < limit:
        date_str = current_date.strftime("%Y-%m-%d")

        try:
            results = get_documents_list(date_str)

            # Filter by company
            for doc in results:
                if doc.get("edinetCode") == edinet_code:
                    doc_desc = doc.get("docDescription", "")
                    if "四半期報告書" in doc_desc or "有価証券報告書" in doc_desc:
                        found_docs.append(doc)
                        logger.info(
                            f"Found: {doc.get('docID')} - {doc_desc} "
                            f"(期間: {doc.get('periodEnd')})"
                        )

                        if len(found_docs) >= limit:
                            break

        except EDINETAPIError as e:
            logger.warning(f"Error fetching documents for {date_str}: {str(e)}")

        # Move to previous day
        current_date -= timedelta(days=1)

        # Rate limiting: 1 request per second
        time.sleep(1)

    logger.info(f"Found {len(found_docs)} documents for {edinet_code}")
    return found_docs


def fetch_company_data(edinet_code: str, company_name: str, years: int = 10) -> None:
    """
    企業データを取得してキャッシュに保存

    Args:
        edinet_code: EDINETコード
        company_name: 企業名 (TEPCO/CHUBU)
        years: 取得年数
    """
    logger.info(f"=== Fetching data for {company_name} ({edinet_code}) ===")

    # Search documents
    docs = find_company_documents(edinet_code, limit=years * 4)  # Quarterly reports

    if not docs:
        logger.warning(f"No documents found for {company_name}")
        return

    # Download each document
    for doc in docs:
        doc_id = doc.get("docID")
        period_end = doc.get("periodEnd", "unknown")
        doc_desc = doc.get("docDescription", "unknown")

        # Create cache filename
        cache_filename = f"{company_name}_{doc_id}_{period_end}.zip"
        cache_path = CACHE_DIR / cache_filename

        # Skip if already downloaded
        if cache_path.exists():
            logger.info(f"Skipping {doc_id} (already cached)")
            continue

        # Download
        try:
            success = download_document(doc_id, cache_path)
            if success:
                logger.info(f"Cached: {cache_filename}")
            else:
                logger.warning(f"Failed to download {doc_id}")

        except EDINETAPIError as e:
            logger.error(f"Error downloading {doc_id}: {str(e)}")

        # Rate limiting
        time.sleep(2)

    logger.info(f"=== Completed data fetch for {company_name} ===")


def main() -> int:
    """メイン処理"""
    logger.info("=" * 80)
    logger.info("EDINET Data Fetcher")
    logger.info("=" * 80)

    try:
        # Fetch TEPCO data
        fetch_company_data(TEPCO_CODE, "TEPCO", years=10)

        # Fetch CHUBU data
        fetch_company_data(CHUBU_CODE, "CHUBU", years=10)

        logger.info("=" * 80)
        logger.info("✓ Data fetch completed successfully")
        logger.info("=" * 80)
        return 0

    except Exception as e:
        logger.error(f"Fatal error: {str(e)}", exc_info=True)
        return 1


if __name__ == "__main__":
    sys.exit(main())
