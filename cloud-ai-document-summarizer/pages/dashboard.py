"""
pages/dashboard.py - Overview & Analytics Dashboard
Displays total documents, summaries, Supabase Cloud Storage quota,
recent documents list, quick upload widget, and academic metrics.
Styled in modern Silver, Magenta, and Blue.
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

    # Banner matching React styling
    st.markdown("""
    <div class="project-banner">
        <div class="banner-badge">✨ AI Document Intelligence & Cloud Storage</div>
        <h1 class="banner-heading">Cloud-Based AI Document Summarizer</h1>
    </div>
    """, unsafe_allow_html=True)
    
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

    # 4 Primary KPI Metrics Cards (Silver, Magenta & Blue custom HTML cards)
    st.markdown(f"""
    <div class="stat-grid">
        <div class="stat-card">
            <div class="stat-label">Total Documents</div>
            <div class="stat-number">{total_docs}</div>
            <div class="stat-subtext-magenta">✓ Table: documents</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Summaries Created</div>
            <div class="stat-number">{total_summaries}</div>
            <div class="stat-subtext-blue">★ 14 Structured Sections</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Pages Processed</div>
            <div class="stat-number">{total_pages}</div>
            <div class="stat-subtext-magenta">❖ Token-Aware Chunks</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Cloud Storage Used</div>
            <div class="stat-number">{format_file_size(total_bytes)}</div>
            <div class="stat-subtext-blue">☁ Bucket: documents</div>
        </div>
    </div>
    """, unsafe_allow_html=True)

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
                        if st.button("Open in Summarizer", key=f"dash_sum_{d['id']}", type="primary"):
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
            if st.button("Proceed to Extraction & Summarization", type="primary", use_container_width=True):
                st.session_state["pending_file"] = quick_file
                st.session_state["current_page"] = "Summarize"
                st.rerun()

        # Cloud Infrastructure Status
        st.markdown("### 🌐 Cloud Status")
        supabase_connected = config.is_supabase_configured()
        st.write(f"**Supabase PostgreSQL:** {'🟢 Active & Connected' if supabase_connected else '🟡 Local Emulation Mode'}")
        st.write(f"**Supabase Storage:** {'🟢 Private Bucket `documents`' if supabase_connected else '🟡 Local Emulation'}")
        st.write(f"**AI Engine:** {'🟢 Gemini 3.8 Flash' if config.is_gemini_configured() else '🟢 Academic NLP Fallback'}")
