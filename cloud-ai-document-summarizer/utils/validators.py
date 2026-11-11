"""
utils/validators.py - Upload & File Validation Utilities
Ensures security, file integrity, and adherence to cloud memory limits.
"""

from typing import Tuple
import config

def validate_uploaded_pdf(file_name: str, file_size_bytes: int) -> Tuple[bool, str]:
    """
    Validates uploaded file against MIME/extension and file size limits.
    """
    if not file_name:
        return False, "No file provided."

    if not file_name.lower().endswith(".pdf"):
        return False, "Invalid file format. Only PDF documents (.pdf) are supported."

    max_bytes = config.MAX_FILE_SIZE_MB * 1024 * 1024
    if file_size_bytes > max_bytes:
        return False, f"File size exceeds maximum allowed limit of {config.MAX_FILE_SIZE_MB}MB."

    if file_size_bytes < 100:
        return False, "File is too small or empty to be a valid PDF document."

    return True, "File is valid."

def format_file_size(size_in_bytes: int) -> str:
    """Formats raw bytes into human readable KB / MB."""
    if size_in_bytes < 1024:
        return f"{size_in_bytes} B"
    elif size_in_bytes < 1024 * 1024:
        return f"{size_in_bytes / 1024:.1f} KB"
    else:
        return f"{size_in_bytes / (1024 * 1024):.2f} MB"
