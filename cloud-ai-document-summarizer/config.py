"""
config.py - Centralized configuration and secrets manager
Handles loading configuration from Streamlit secrets, environment variables, or .env file.
"""

import os
import streamlit as st
from dotenv import load_dotenv

# Load local environment variables if present
load_dotenv()

def get_secret(key: str, default: str = "") -> str:
    """Retrieve secret from Streamlit Secrets or os.environ."""
    # Check Streamlit secrets first
    try:
        if hasattr(st, "secrets") and key in st.secrets:
            return str(st.secrets[key])
    except Exception:
        pass
    
    # Fallback to os.environ
    return os.environ.get(key, default)

# Supabase Credentials
SUPABASE_URL = get_secret("SUPABASE_URL", "")
SUPABASE_KEY = get_secret("SUPABASE_KEY", "")
SUPABASE_STORAGE_BUCKET = get_secret("SUPABASE_STORAGE_BUCKET", "documents")

# AI API Key (Gemini API)
GEMINI_API_KEY = get_secret("GEMINI_API_KEY", "")

# App Limits & Configuration
MAX_FILE_SIZE_MB = 35
MAX_PAGES_DEFAULT = 200
DEFAULT_CHUNK_SIZE = 1500  # Words / token equivalent
CHUNK_OVERLAP = 200

# Summary Modes Definition
SUMMARY_MODES = ["Short", "Medium", "Detailed", "Very Detailed"]

# 14 Mandatory Structured Sections Required
STRUCTURED_SECTIONS = [
    "Executive Summary",
    "Document Introduction",
    "Section-wise Summary",
    "Chapter-wise Explanation",
    "Detailed Concept Explanations",
    "Key Concepts",
    "Important Definitions",
    "Important Points",
    "Keywords",
    "Examples and Applications",
    "Important Findings",
    "Conclusion",
    "Exam Preparation Notes",
    "Important Questions and Answers"
]

def is_supabase_configured() -> bool:
    """Check if valid Supabase credentials are provided."""
    return bool(SUPABASE_URL and SUPABASE_KEY and "your-project-id" not in SUPABASE_URL)

def is_gemini_configured() -> bool:
    """Check if Gemini API key is configured."""
    return bool(GEMINI_API_KEY and GEMINI_API_KEY != "AIzaSy...")
