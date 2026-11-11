"""
database.py - Supabase PostgreSQL Database Interface
Handles CRUD operations for documents, summaries, and chat history.
Ensures persistent data retention across browser refreshes and sessions.
"""

from typing import List, Dict, Any, Optional
import config
from cloud import get_supabase_client, delete_file_from_storage

# In-memory session fallback store when testing locally without live Supabase credentials
_LOCAL_DOCUMENTS: List[Dict[str, Any]] = []
_LOCAL_SUMMARIES: List[Dict[str, Any]] = []
_LOCAL_CHAT: List[Dict[str, Any]] = []

def save_document(
    user_id: str,
    file_name: str,
    file_size: int,
    page_count: int,
    extracted_text: str,
    storage_path: str
) -> Optional[Dict[str, Any]]:
    """Insert a new document record into the documents table."""
    client = get_supabase_client()
    doc_payload = {
        "user_id": user_id,
        "file_name": file_name,
        "file_size": file_size,
        "page_count": page_count,
        "extracted_text": extracted_text,
        "storage_path": storage_path
    }
    
    if not client:
        import uuid
        from datetime import datetime, timezone
        doc_record = {
            "id": str(uuid.uuid4()),
            **doc_payload,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        _LOCAL_DOCUMENTS.append(doc_record)
        return doc_record

    try:
        res = client.table("documents").insert(doc_payload).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        return None
    except Exception as e:
        print(f"Error saving document to Supabase: {e}")
        return None

def get_user_documents(user_id: str) -> List[Dict[str, Any]]:
    """Retrieve all uploaded documents belonging to the user."""
    client = get_supabase_client()
    if not client:
        return [d for d in _LOCAL_DOCUMENTS if d.get("user_id") == user_id]

    try:
        res = client.table("documents")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .execute()
        return res.data or []
    except Exception as e:
        print(f"Error fetching user documents: {e}")
        return []

def get_document_by_id(document_id: str, user_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve a single document by ID ensuring user ownership."""
    client = get_supabase_client()
    if not client:
        for d in _LOCAL_DOCUMENTS:
            if str(d.get("id")) == str(document_id) and d.get("user_id") == user_id:
                return d
        return None

    try:
        res = client.table("documents")\
            .select("*")\
            .eq("id", document_id)\
            .eq("user_id", user_id)\
            .limit(1)\
            .execute()
        return res.data[0] if res.data else None
    except Exception as e:
        print(f"Error fetching document: {e}")
        return None

def delete_document(document_id: str, user_id: str) -> bool:
    """
    Deletes document record, associated summaries, chat history,
    and the physical PDF in Supabase Storage.
    """
    doc = get_document_by_id(document_id, user_id)
    if not doc:
        return False

    # 1. Clean up cloud storage
    storage_path = doc.get("storage_path")
    if storage_path:
        delete_file_from_storage(storage_path)

    client = get_supabase_client()
    if not client:
        global _LOCAL_DOCUMENTS, _LOCAL_SUMMARIES, _LOCAL_CHAT
        _LOCAL_DOCUMENTS = [d for d in _LOCAL_DOCUMENTS if str(d.get("id")) != str(document_id)]
        _LOCAL_SUMMARIES = [s for s in _LOCAL_SUMMARIES if str(s.get("document_id")) != str(document_id)]
        _LOCAL_CHAT = [c for c in _LOCAL_CHAT if str(c.get("document_id")) != str(document_id)]
        return True

    try:
        # Cascade will delete summaries & chat history automatically via foreign keys
        client.table("documents").delete().eq("id", document_id).eq("user_id", user_id).execute()
        return True
    except Exception as e:
        print(f"Error deleting document: {e}")
        return False

# --- SUMMARIES OPERATIONS ---

def save_summary(
    document_id: str,
    user_id: str,
    summary_type: str,
    summary_content: Dict[str, Any]
) -> Optional[Dict[str, Any]]:
    """Save or update generated summary in Supabase."""
    client = get_supabase_client()
    payload = {
        "document_id": document_id,
        "user_id": user_id,
        "summary_type": summary_type,
        "summary_content": summary_content
    }

    if not client:
        import uuid
        from datetime import datetime, timezone
        # Remove any existing summary of same type
        global _LOCAL_SUMMARIES
        _LOCAL_SUMMARIES = [
            s for s in _LOCAL_SUMMARIES 
            if not (str(s.get("document_id")) == str(document_id) and s.get("summary_type") == summary_type)
        ]
        record = {
            "id": str(uuid.uuid4()),
            **payload,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        _LOCAL_SUMMARIES.append(record)
        return record

    try:
        # Upsert or insert
        res = client.table("summaries").insert(payload).execute()
        return res.data[0] if res.data else None
    except Exception as e:
        print(f"Error saving summary: {e}")
        return None

def get_summaries_for_document(document_id: str, user_id: str) -> List[Dict[str, Any]]:
    """Retrieve all saved summaries for a given document."""
    client = get_supabase_client()
    if not client:
        return [
            s for s in _LOCAL_SUMMARIES 
            if str(s.get("document_id")) == str(document_id) and s.get("user_id") == user_id
        ]

    try:
        res = client.table("summaries")\
            .select("*")\
            .eq("document_id", document_id)\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .execute()
        return res.data or []
    except Exception as e:
        print(f"Error fetching summaries: {e}")
        return []

# --- CHAT OPERATIONS ---

def save_chat_message(
    document_id: str,
    user_id: str,
    question: str,
    answer: str,
    page_references: List[int]
) -> Optional[Dict[str, Any]]:
    """Persists a Q&A exchange to Supabase chat_history."""
    client = get_supabase_client()
    payload = {
        "document_id": document_id,
        "user_id": user_id,
        "question": question,
        "answer": answer,
        "page_references": page_references
    }

    if not client:
        import uuid
        from datetime import datetime, timezone
        record = {
            "id": str(uuid.uuid4()),
            **payload,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        _LOCAL_CHAT.append(record)
        return record

    try:
        res = client.table("chat_history").insert(payload).execute()
        return res.data[0] if res.data else None
    except Exception as e:
        print(f"Error saving chat message: {e}")
        return None

def get_chat_history(document_id: str, user_id: str) -> List[Dict[str, Any]]:
    """Fetches full chat history for a document."""
    client = get_supabase_client()
    if not client:
        return [
            c for c in _LOCAL_CHAT
            if str(c.get("document_id")) == str(document_id) and c.get("user_id") == user_id
        ]

    try:
        res = client.table("chat_history")\
            .select("*")\
            .eq("document_id", document_id)\
            .eq("user_id", user_id)\
            .order("created_at", desc=False)\
            .execute()
        return res.data or []
    except Exception as e:
        print(f"Error fetching chat history: {e}")
        return []
