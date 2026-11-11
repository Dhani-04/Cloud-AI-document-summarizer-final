"""
pdf_utils.py - High-Performance PDF Extraction with PyMuPDF (fitz)
Extracts page-wise text, calculates layout metrics, handles corrupted documents,
and identifies scanned/image-only PDFs.
"""

import io
from typing import List, Dict, Any, Tuple
import fitz  # PyMuPDF
from utils.text_processing import clean_extracted_text

def extract_text_from_pdf_bytes(
    pdf_bytes: bytes,
    max_pages: int = 300
) -> Tuple[bool, str, List[Dict[str, Any]], Dict[str, Any]]:
    """
    Extracts text page-by-page from raw PDF bytes.
    Returns:
      (success: bool, error_message: str, pages_data: List[Dict], doc_metadata: Dict)
      where each page dict contains:
        - page_num: int
        - text: str
        - char_count: int
        - has_images: bool
    """
    try:
        # Open PDF stream with PyMuPDF
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    except Exception as e:
        return False, f"Failed to parse PDF document. The file might be corrupted or encrypted: {str(e)}", [], {}

    total_pages = len(doc)
    if total_pages == 0:
        doc.close()
        return False, "The uploaded PDF has 0 pages.", [], {}

    pages_to_process = min(total_pages, max_pages)
    pages_data: List[Dict[str, Any]] = []
    scanned_pages_count = 0
    total_chars = 0

    for i in range(pages_to_process):
        page = doc[i]
        page_text = page.get_text("text") or ""
        cleaned = clean_extracted_text(page_text)
        
        # Check if page has images
        images = page.get_images()
        has_images = len(images) > 0
        
        # Heuristic for scanned page: Very few characters but images exist
        if len(cleaned.strip()) < 30 and has_images:
            scanned_pages_count += 1

        total_chars += len(cleaned)
        pages_data.append({
            "page_num": i + 1,
            "text": cleaned,
            "char_count": len(cleaned),
            "has_images": has_images
        })

    metadata = {
        "total_pages": total_pages,
        "processed_pages": pages_to_process,
        "total_characters": total_chars,
        "is_likely_scanned": (scanned_pages_count / max(1, pages_to_process)) > 0.6,
        "author": doc.metadata.get("author", "Unknown"),
        "title": doc.metadata.get("title", ""),
    }

    doc.close()
    return True, "", pages_data, metadata

def combine_pages_text(pages_data: List[Dict[str, Any]]) -> str:
    """Concatenates all page texts with explicit page markers."""
    combined = []
    for p in pages_data:
        combined.append(f"--- [Page {p['page_num']}] ---\n{p['text']}")
    return "\n\n".join(combined)
