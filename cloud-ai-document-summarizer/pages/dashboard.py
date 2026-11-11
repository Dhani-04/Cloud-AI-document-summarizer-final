"""
pages/dashboard.py - Overview & Analytics Dashboard
Displays total documents, summaries, Supabase Cloud Storage quota,
recent documents list, quick upload widget, and academic metrics.
"""

import streamlit as st
import config
from auth import get_current_user
from database import get_user_documents, get_summaries_for_document
from utils.validators import format_file_size

def render_dashboard():
    user = get_current_user()
    if not user:
        st.warning("Please sign in or create an account to access your personal cloud dashboard.")
        return

    st.markdown("## 📊 Academic Research & Document Intelligence Dashboard")
    st.markdown(
        f"Welcome back, **{user.get('email', 'Researcher')}**! "
        f"Manage your cloud-stored documents, examine structured summaries, and run grounded document Q&A."
    )
    
    # Fetch documents from Supabase
    docs = get_user_documents(user["id"])
    total_docs = len(docs)
    total_pages = sum([d.get("page_count", 0) for d in docs])
    total_bytes = sum([d.get("file_size", 0) for d in docs])

    # Calculate summaries count
    total_summaries = 0
    for d in docs:
        summaries = get_summaries_for_document(d["id"], user["id"])
        total_summaries += len(summaries)

    # Top KPI Metrics Cards
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric(label="📄 Total Documents", value=total_docs)
    with col2:
        st.metric(label="🧠 Summaries Created", value=total_summaries)
    with col3:
        st.metric(label="📑 Total Pages Analyzed", value=total_pages)
    with col4:
        st.metric(label="☁️ Cloud Storage Used", value=format_file_size(total_bytes))

    st.markdown("---")

    # Cloud Storage & Quick Upload Section
    c_left, c_right = st.columns([3, 2])

    with c_left:
        st.subheader("📁 Recent Cloud Documents")
        if not docs:
            st.info("No documents uploaded yet. Use the quick upload box on the right or go to the **Summarize** tab.")
        else:
            for d in docs[:5]:
                with st.expander(f"📄 {d.get('file_name')} ({d.get('page_count')} pages • {format_file_size(d.get('file_size', 0))})"):
                    st.write(f"**Uploaded on:** {d.get('created_at', 'Recently')[:10]}")
                    st.write(f"**Storage Path:** `{d.get('storage_path')}`")
                    c_act1, c_act2 = st.columns(2)
                    with c_act1:
                        if st.button("Open in Summarizer", key=f"dash_sum_{d['id']}"):
                            st.session_state["active_doc_id"] = d["id"]
                            st.session_state["current_page"] = "Summarize"
                            st.rerun()
                    with c_act2:
                        if st.button("Ask Q&A", key=f"dash_chat_{d['id']}"):
                            st.session_state["active_doc_id"] = d["id"]
                            st.session_state["current_page"] = "Document Chat"
                            st.rerun()

    with c_right:
        st.subheader("⚡ Quick Upload")
        quick_file = st.file_uploader(
            "Upload new PDF document",
            type=["pdf"],
            key="dashboard_quick_uploader"
        )
        if quick_file is not None:
            st.success(f"File selected: {quick_file.name} ({format_file_size(len(quick_file.getvalue()))})")
            if st.button("Proceed to Extraction & Summarization", use_container_width=True):
                st.session_state["pending_file"] = quick_file
                st.session_state["current_page"] = "Summarize"
                st.rerun()

        # Cloud Infrastructure Status
        st.markdown("### 🌐 Cloud Infrastructure")
        supabase_connected = config.is_supabase_configured()
        st.write(f"**Supabase PostgreSQL:** {'🟢 Active & Connected' if supabase_connected else '🟡 Local Emulation Mode'}")
        st.write(f"**Supabase Storage:** {'🟢 Private Bucket `documents`' if supabase_connected else '🟡 Local Emulation'}")
        st.write(f"**AI Engine:** {'🟢 Gemini 3.8 Flash' if config.is_gemini_configured() else '🟢 Academic NLP Fallback'}")
