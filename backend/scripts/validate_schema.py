"""
Schema validation script for FinSight data files
Validates CSV and JSON files against the schema defined in data/schema/README.md
"""

import csv
import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Tuple

# Schema version
SCHEMA_VERSION = "1.0.0"

# Data directory paths
DATA_DIR = Path(__file__).parent.parent.parent / "data"
FINANCIALS_DIR = DATA_DIR / "financials"


class ValidationError(Exception):
    """Custom exception for validation errors"""

    pass


def validate_period_format(period: str) -> bool:
    """Validate period format (YYYYQQ)"""
    pattern = r"^\d{4}Q[1-4]$"
    return bool(re.match(pattern, period))


def validate_date_format(date: str) -> bool:
    """Validate ISO8601 date format (YYYY-MM-DD)"""
    pattern = r"^\d{4}-\d{2}-\d{2}$"
    return bool(re.match(pattern, date))


def validate_company_code(company: str) -> bool:
    """Validate company code"""
    return company in ["TEPCO", "CHUBU"]


def validate_csv_schema(filepath: Path) -> Tuple[bool, List[str]]:
    """
    Validate CSV file schema

    Args:
        filepath: Path to CSV file

    Returns:
        Tuple of (is_valid, errors)
    """
    errors: List[str] = []

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            required_fields = ["company", "period", "date"]

            # Check header
            if not reader.fieldnames:
                errors.append("CSV file has no header row")
                return False, errors

            # Validate required fields exist
            for field in required_fields:
                if field not in reader.fieldnames:
                    errors.append(f"Required field '{field}' not found in CSV header")

            # Validate each row
            for row_num, row in enumerate(reader, start=2):  # Start from 2 (header is row 1)
                # Validate company
                if "company" in row and not validate_company_code(row["company"]):
                    errors.append(
                        f"Row {row_num}: Invalid company code '{row['company']}' "
                        f"(expected TEPCO or CHUBU)"
                    )

                # Validate period
                if "period" in row and not validate_period_format(row["period"]):
                    errors.append(
                        f"Row {row_num}: Invalid period format '{row['period']}' "
                        f"(expected YYYYQQ)"
                    )

                # Validate date
                if "date" in row and not validate_date_format(row["date"]):
                    errors.append(
                        f"Row {row_num}: Invalid date format '{row['date']}' "
                        f"(expected YYYY-MM-DD)"
                    )

                # Validate numeric fields
                numeric_fields = [
                    "revenue",
                    "operating_income",
                    "ordinary_income",
                    "net_income",
                    "total_assets",
                    "current_assets",
                    "fixed_assets",
                    "operating_cf",
                    "investing_cf",
                    "financing_cf",
                ]

                for field in numeric_fields:
                    if field in row and row[field]:
                        try:
                            float(row[field])
                        except ValueError:
                            errors.append(
                                f"Row {row_num}: Field '{field}' is not a valid number: "
                                f"{row[field]}"
                            )

    except FileNotFoundError:
        errors.append(f"File not found: {filepath}")
    except Exception as e:
        errors.append(f"Error reading CSV: {str(e)}")

    return len(errors) == 0, errors


def validate_notes_json(filepath: Path) -> Tuple[bool, List[str]]:
    """
    Validate notes JSON file schema

    Args:
        filepath: Path to JSON file

    Returns:
        Tuple of (is_valid, errors)
    """
    errors: List[str] = []

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)

        # Validate schema_version
        if "schema_version" not in data:
            errors.append("Missing 'schema_version' field")
        elif data["schema_version"] != SCHEMA_VERSION:
            errors.append(
                f"Schema version mismatch: expected {SCHEMA_VERSION}, "
                f"got {data['schema_version']}"
            )

        # Validate notes array
        if "notes" not in data:
            errors.append("Missing 'notes' field")
        elif not isinstance(data["notes"], list):
            errors.append("'notes' field must be an array")
        else:
            for idx, note in enumerate(data["notes"]):
                note_errors = validate_note_item(note, idx)
                errors.extend(note_errors)

    except FileNotFoundError:
        errors.append(f"File not found: {filepath}")
    except json.JSONDecodeError as e:
        errors.append(f"Invalid JSON format: {str(e)}")
    except Exception as e:
        errors.append(f"Error reading JSON: {str(e)}")

    return len(errors) == 0, errors


def validate_note_item(note: Dict[str, Any], index: int) -> List[str]:
    """Validate a single note item"""
    errors: List[str] = []
    prefix = f"Note {index}"

    # Required fields
    required_fields = [
        "company",
        "period",
        "docID",
        "category",
        "text",
        "severity",
        "keywords",
        "detected_at",
    ]
    for field in required_fields:
        if field not in note:
            errors.append(f"{prefix}: Missing required field '{field}'")

    # Validate company
    if "company" in note and not validate_company_code(note["company"]):
        errors.append(
            f"{prefix}: Invalid company code '{note['company']}' "
            f"(expected TEPCO or CHUBU)"
        )

    # Validate period
    if "period" in note and not validate_period_format(note["period"]):
        errors.append(
            f"{prefix}: Invalid period format '{note['period']}' (expected YYYYQQ)"
        )

    # Validate category
    valid_categories = ["risk", "policy_change", "info"]
    if "category" in note and note["category"] not in valid_categories:
        errors.append(
            f"{prefix}: Invalid category '{note['category']}' "
            f"(expected one of {valid_categories})"
        )

    # Validate severity
    if "severity" in note:
        if not isinstance(note["severity"], (int, float)):
            errors.append(f"{prefix}: severity must be a number")
        elif not (0.0 <= note["severity"] <= 1.0):
            errors.append(f"{prefix}: severity must be between 0.0 and 1.0")

    # Validate keywords
    if "keywords" in note:
        if not isinstance(note["keywords"], list):
            errors.append(f"{prefix}: keywords must be an array")
        elif len(note["keywords"]) == 0:
            errors.append(f"{prefix}: keywords array cannot be empty")

    return errors


def validate_all_files() -> int:
    """
    Validate all data files

    Returns:
        Exit code (0 for success, 1 for failure)
    """
    print("=" * 80)
    print("FinSight Data Schema Validation")
    print(f"Schema Version: {SCHEMA_VERSION}")
    print("=" * 80)
    print()

    total_errors = 0

    # Validate CSV files
    print("Validating CSV files...")
    csv_files = list(FINANCIALS_DIR.glob("*.csv"))

    if not csv_files:
        print(f"⚠️  No CSV files found in {FINANCIALS_DIR}")
    else:
        for csv_file in csv_files:
            is_valid, errors = validate_csv_schema(csv_file)
            if is_valid:
                print(f"✓ {csv_file.name}: PASS")
            else:
                print(f"✗ {csv_file.name}: FAIL")
                for error in errors:
                    print(f"  - {error}")
                total_errors += len(errors)

    print()

    # Validate notes JSON
    print("Validating notes JSON...")
    notes_file = DATA_DIR / "xbrl_notes.json"

    if not notes_file.exists():
        print(f"⚠️  Notes file not found: {notes_file}")
    else:
        is_valid, errors = validate_notes_json(notes_file)
        if is_valid:
            print(f"✓ {notes_file.name}: PASS")
        else:
            print(f"✗ {notes_file.name}: FAIL")
            for error in errors:
                print(f"  - {error}")
            total_errors += len(errors)

    print()
    print("=" * 80)

    if total_errors == 0:
        print("✓ All validations passed!")
        return 0
    else:
        print(f"✗ Validation failed with {total_errors} error(s)")
        return 1


if __name__ == "__main__":
    sys.exit(validate_all_files())
