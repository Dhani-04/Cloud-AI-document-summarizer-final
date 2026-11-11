"""
utils/chunking.py - Intelligent Token-Aware Text Chunking
Splits long documents into model-compatible chunks with configurable overlaps,
retaining page boundaries and document structural metadata.
"""

from typing import List, Dict, Any
import re

def create_chunks_from_pages(
    pages: List[Dict[str, Any]],
    chunk_size_words: int = 1200,
    overlap_words: int = 150
) -> List[Dict[str, Any]]:
    """
    Creates overlapping chunks across pages, preserving page attribution.
    Each item in 'pages' is expected to have:
      - 'page_num': int (1-indexed)
      - 'text': str
    Returns a list of dicts:
      - 'chunk_index': int
      - 'text': str
      - 'start_page': int
      - 'end_page': int
      - 'word_count': int
    """
    if not pages:
        return []

    # Flatten pages into tagged words
    tagged_words: List[Dict[str, Any]] = []
    for p in pages:
        page_num = p.get("page_num", 1)
        text = p.get("text", "")
        words = text.split()
        for w in words:
            tagged_words.append({"word": w, "page": page_num})

    if not tagged_words:
        return []

    chunks: List[Dict[str, Any]] = []
    total_words = len(tagged_words)
    start_idx = 0
    chunk_id = 0

    while start_idx < total_words:
        end_idx = min(start_idx + chunk_size_words, total_words)
        chunk_slice = tagged_words[start_idx:end_idx]
        
        chunk_text = " ".join([item["word"] for item in chunk_slice])
        start_page = chunk_slice[0]["page"]
        end_page = chunk_slice[-1]["page"]

        chunks.append({
            "chunk_index": chunk_id,
            "text": chunk_text,
            "start_page": start_page,
            "end_page": end_page,
            "word_count": len(chunk_slice)
        })
        chunk_id += 1

        # Advance with overlap
        if end_idx >= total_words:
            break
        start_idx += max(1, chunk_size_words - overlap_words)

    return chunks

def split_text_into_sections(text: str) -> List[str]:
    """Splits a document text by common academic section header patterns."""
    pattern = r"(?m)^(?:Chapter\s+\d+|[0-9]+\.[0-9]*\s+[A-Z]|Abstract|Introduction|Methodology|Results|Discussion|Conclusion|References)"
    splits = re.split(pattern, text)
    return [s.strip() for s in splits if s.strip()]
