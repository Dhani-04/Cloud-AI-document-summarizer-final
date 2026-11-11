"""
auth.py - Supabase Authentication & Session Management
Handles user sign-up, sign-in, sign-out, session persistence, and password validation.
"""

import re
from typing import Optional, Dict, Any, Tuple
import streamlit as st
import config
from cloud import get_supabase_client

def validate_password(password: str) -> Tuple[bool, str]:
    """Validate password strength (minimum 6 characters, mixed alphanumerics)."""
    if len(password) < 6:
        return False, "Password must be at least 6 characters long."
    if not re.search(r"\d", password):
        return False, "Password must contain at least one numerical digit."
    return True, "Password is valid."

def sign_up_user(email: str, password: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
    """Register a new user with Supabase Auth."""
    is_valid, msg = validate_password(password)
    if not is_valid:
        return False, msg, None

    client = get_supabase_client()
    if not client:
        # Fallback local mock user for testing without live Supabase
        user_data = {"id": "local-dev-user-001", "email": email}
        st.session_state["user"] = user_data
        st.session_state["access_token"] = "local-token-xyz"
        return True, "Account created successfully (Local Cloud Mode)", user_data

    try:
        res = client.auth.sign_up({
            "email": email.strip(),
            "password": password
        })
        if res.user:
            return True, "Account created successfully! You can now log in.", res.user.__dict__
        return False, "Registration failed. Please check your credentials.", None
    except Exception as e:
        return False, f"Sign-up error: {str(e)}", None

def sign_in_user(email: str, password: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
    """Authenticate existing user with Supabase Auth."""
    client = get_supabase_client()
    if not client:
        # Local mode login
        user_data = {"id": "local-dev-user-001", "email": email}
        st.session_state["user"] = user_data
        st.session_state["access_token"] = "local-token-xyz"
        return True, "Signed in successfully (Local Cloud Mode)", user_data

    try:
        res = client.auth.sign_in_with_password({
            "email": email.strip(),
            "password": password
        })
        if res.user and res.session:
            st.session_state["user"] = {
                "id": str(res.user.id),
                "email": res.user.email
            }
            st.session_state["access_token"] = res.session.access_token
            return True, "Signed in successfully!", st.session_state["user"]
        return False, "Invalid email or password.", None
    except Exception as e:
        return False, f"Login error: {str(e)}", None

def sign_out_user():
    """Sign out the current user and reset session state."""
    client = get_supabase_client()
    if client:
        try:
            client.auth.sign_out()
        except Exception:
            pass
    
    st.session_state.pop("user", None)
    st.session_state.pop("access_token", None)
    st.session_state.pop("active_document", None)

def get_current_user() -> Optional[Dict[str, Any]]:
    """Returns the currently authenticated user dictionary or None."""
    return st.session_state.get("user")

def is_authenticated() -> bool:
    """Returns True if a user is actively authenticated."""
    return bool(st.session_state.get("user"))
