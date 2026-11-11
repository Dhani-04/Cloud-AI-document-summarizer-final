"""
cloud.py - Supabase Cloud Storage Manager
Handles authenticating, uploading PDFs to private user buckets, generating secure signed URLs,
and deleting storage files on document cleanup.
"""

import uuid
from typing import Optional, Tuple
from supabase import create_client, Client
import config

_supabase_client: Optional[Client] = None

def get_supabase_client() -> Optional[Client]:
    """Initialize and return the Supabase client singleton."""
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client
    
    if not config.is_supabase_configured():
        return None
    
    try:
        _supabase_client = create_client(config.SUPABASE_URL, config.SUPABASE_KEY)
        return _supabase_client
    except Exception as e:
        print(f"Failed to connect to Supabase: {e}")
        return None

def upload_file_to_storage(
    user_id: str,
    file_bytes: bytes,
    original_filename: str
) -> Tuple[bool, str, str]:
    """
    Uploads a PDF file into the private 'documents' bucket under user_id folder.
    Returns: (success: bool, storage_path: str, message: str)
    """
    client = get_supabase_client()
    if not client:
        # Fallback local identifier when Supabase is not configured
        local_path = f"local_{user_id}/{original_filename}"
        return True, local_path, "Saved to local cloud-emulated storage"
    
    try:
        # Ensure unique filename to prevent overwriting
        file_extension = original_filename.split(".")[-1] if "." in original_filename else "pdf"
        unique_file_id = f"{uuid.uuid4().hex[:12]}_{original_filename}"
        storage_path = f"{user_id}/{unique_file_id}"
        
        # Upload byte buffer to Supabase Storage
        res = client.storage.from_(config.SUPABASE_STORAGE_BUCKET).upload(
            path=storage_path,
            file=file_bytes,
            file_options={"content-type": "application/pdf", "upsert": "false"}
        )
        
        return True, storage_path, "File successfully uploaded to Supabase Storage"
    except Exception as e:
        return False, "", f"Storage upload error: {str(e)}"

def get_signed_download_url(storage_path: str, expires_in: int = 3600) -> Optional[str]:
    """Generates a temporary signed download URL for private documents."""
    client = get_supabase_client()
    if not client or storage_path.startswith("local_"):
        return None
    
    try:
        res = client.storage.from_(config.SUPABASE_STORAGE_BUCKET).create_signed_url(
            path=storage_path,
            expires_in=expires_in
        )
        return res.get("signedURL") or res.get("signedUrl")
    except Exception as e:
        print(f"Error creating signed URL: {e}")
        return None

def delete_file_from_storage(storage_path: str) -> bool:
    """Deletes the PDF from Supabase Storage."""
    client = get_supabase_client()
    if not client or storage_path.startswith("local_"):
        return True
    
    try:
        client.storage.from_(config.SUPABASE_STORAGE_BUCKET).remove([storage_path])
        return True
    except Exception as e:
        print(f"Error deleting file from storage: {e}")
        return False
