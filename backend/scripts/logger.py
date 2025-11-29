"""
Logging infrastructure for FinSight backend scripts
Provides standardized logging configuration with file and console handlers
"""

import logging
import sys
from pathlib import Path
from typing import Optional

# Log directory
LOG_DIR = Path(__file__).parent.parent.parent / "logs"
LOG_DIR.mkdir(exist_ok=True)


def setup_logger(
    name: str,
    level: int = logging.INFO,
    log_file: Optional[str] = None,
    console: bool = True,
) -> logging.Logger:
    """
    Setup logger with file and console handlers

    Args:
        name: Logger name (usually __name__)
        level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Optional log file name (will be created in logs/ directory)
        console: Enable console output

    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)

    # Remove existing handlers to avoid duplicates
    logger.handlers = []

    # Create formatter
    formatter = logging.Formatter(
        fmt="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # Console handler
    if console:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(level)
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)

    # File handler
    if log_file:
        log_path = LOG_DIR / log_file
        file_handler = logging.FileHandler(log_path, encoding="utf-8")
        file_handler.setLevel(level)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)

    return logger


def get_logger(name: str) -> logging.Logger:
    """
    Get logger instance (creates if not exists)

    Args:
        name: Logger name

    Returns:
        Logger instance
    """
    return logging.getLogger(name)


# Pre-configured loggers
def get_edinet_logger() -> logging.Logger:
    """Get logger for EDINET API operations"""
    return setup_logger(
        "finsight.edinet",
        level=logging.INFO,
        log_file="edinet_api.log",
        console=True,
    )


def get_nlp_logger() -> logging.Logger:
    """Get logger for NLP operations"""
    return setup_logger(
        "finsight.nlp",
        level=logging.INFO,
        log_file="nlp_analysis.log",
        console=True,
    )


def get_data_logger() -> logging.Logger:
    """Get logger for data processing operations"""
    return setup_logger(
        "finsight.data",
        level=logging.INFO,
        log_file="data_processing.log",
        console=True,
    )


# Example usage
if __name__ == "__main__":
    # Test logging
    logger = get_edinet_logger()
    logger.debug("Debug message")
    logger.info("Info message")
    logger.warning("Warning message")
    logger.error("Error message")
    logger.critical("Critical message")

    print(f"\nLog files created in: {LOG_DIR}")
