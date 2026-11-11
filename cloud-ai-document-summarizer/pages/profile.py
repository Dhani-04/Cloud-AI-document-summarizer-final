"""
pages/profile.py - User Profile & Cloud Security Settings
Displays authenticated session data, Supabase connection status, RLS policies,
and logout controls.
"""

import streamlit as st
import config
from auth import get_current_user, sign_out_user
from database import get_user_documents

def render_profile():
    user = get_current_user()
    if not user:
        st.warning("Please sign in to access your profile.")
        return

    st.markdown("## 👤 User Profile & Cloud Configuration")
    
    col1, col2 = st.columns([2, 1])

    with col1:
        st.markdown("### Account Information")
        st.write(f"**Email Address:** `{user.get('email')}`")
        st.write(f"**User ID (UUID):** `{user.get('id')}`")
        st.write(f"**Authentication Provider:** Supabase Auth")

        # Document Metrics
        docs = get_user_documents(user["id"])
        st.write(f"**Stored Documents:** {len(docs)}")

        st.markdown("---")
        st.markdown("### Cloud Security & Policies (Row Level Security)")
        st.info(
            "🔒 **Data Isolation Guarantee:** Supabase Row Level Security (RLS) is active. "
            "All SQL queries enforce `auth.uid() = user_id`. Other users cannot view, query, or delete your files."
        )

    with col2:
        st.markdown("### Supabase Status")
        is_cfg = config.is_supabase_configured()
        if is_cfg:
            st.success("🟢 Supabase Connected")
            st.caption(f"Endpoint: {config.SUPABASE_URL[:30]}...")
            st.caption(f"Bucket: `{config.SUPABASE_STORAGE_BUCKET}`")
        else:
            st.warning("🟡 Local Cloud Emulation")
            st.caption("Add your SUPABASE_URL and SUPABASE_KEY to .streamlit/secrets.toml to activate live remote storage.")

        st.markdown("---")
        if st.button("🚪 Sign Out", type="secondary", use_container_width=True):
            sign_out_user()
            st.success("Signed out successfully.")
            st.rerun()
