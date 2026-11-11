"""
utils/text_processing.py - NLP & Text Sanitization
Performs text cleaning, keyword extraction, readability scoring, and statistics computation.
"""

import re
from typing import List, Dict, Any

def clean_extracted_text(text: str) -> str:
    """Sanitizes raw PDF extracted text by removing formatting artifacts."""
    if not text:
        return ""
    
    # Replace non-breaking spaces and unusual whitespace
    text = text.replace("\u00a0", " ").replace("\r\n", "\n").replace("\r", "\n")
    
    # Remove excessive blank lines
    text = re.sub(r"\n{3,}", "\n\n", text)
    
    # Fix hyphenated line breaks (e.g., "comput- \n er" -> "computer")
    text = re.sub(r"(\w+)-\s*\n\s*(\w+)", r"\1\2", text)
    
    # Replace multiple spaces with single space
    text = re.sub(r"[ \t]+", " ", text)
    
    return text.strip()

def calculate_text_stats(text: str) -> Dict[str, Any]:
    """Computes academic metrics for extracted document text."""
    if not text:
        return {
            "word_count": 0,
            "char_count": 0,
            "estimated_reading_time_min": 0,
            "vocabulary_size": 0
        }
    
    words = re.findall(r"\b\w+\b", text.lower())
    word_count = len(words)
    unique_words = len(set(words))
    
    # Standard 200 WPM reading rate
    reading_time = max(1, round(word_count / 200))
    
    return {
        "word_count": word_count,
        "char_count": len(text),
        "estimated_reading_time_min": reading_time,
        "vocabulary_size": unique_words
    }

def extract_keywords_heuristic(text: str, top_n: int = 15) -> List[str]:
    """Lightweight keyword extraction without heavy model overhead."""
    common_stopwords = {
        "the", "and", "is", "in", "to", "of", "it", "with", "for", "as", "on", "that", "this",
        "by", "an", "be", "are", "from", "at", "or", "which", "will", "from", "has", "have",
        "can", "all", "was", "we", "they", "their", "more", "also", "into", "than", "other",
        "such", "its", "then", "been", "these", "were", "what", "there", "when", "some"
    }
    
    words = re.findall(r"\b[A-Za-z]{4,}\b", text.lower())
    frequency: Dict[str, int] = {}
    for w in words:
        if w not in common_stopwords:
            frequency[w] = frequency.get(w, 0) + 1
            
    sorted_keywords = sorted(frequency.items(), key=lambda x: x[1], reverse=True)
    return [k[0] for k in sorted_keywords[:top_n]]
