"""
pages/history.py - Document Management & History
View all uploaded documents, review previously generated summaries,
download files, view extracted text, and securely delete documents and storage.
"""

import streamlit as st
from auth import get_current_user
from database import get_user_documents, get_summaries_for_document, delete_document
from cloud import get_signed_download_url
from utils.validators import format_file_size
from export_utils import summary_to_markdown

def render_history():
    user = get_current_user()
    if not user:
        st.warning("Please log in to view your document history.")
        return

    st.markdown("## 📚 Document History & Cloud Management")
    st.markdown("All documents and generated summaries stored in your private Supabase PostgreSQL and Storage.")

    docs = get_user_documents(user["id"])
    if not docs:
        st.info("No documents found in your cloud history. Upload a PDF in the **Summarize** page.")
        return

    st.write(f"Showing **{len(docs)}** uploaded documents:")

    for doc in docs:
        doc_id = doc["id"]
        with st.container():
            c_header, c_del = st.columns([5, 1])
            with c_header:
                st.markdown(f"### 📄 {doc['file_name']}")
                st.caption(f"Pages: {doc.get('page_count', 1)} • Size: {format_file_size(doc.get('file_size', 0))} • Date: {doc.get('created_at', '')[:10]}")
            with c_del:
                if st.button("🗑️ Delete", key=f"del_{doc_id}", help="Delete document, storage file, and summaries"):
                    if delete_document(doc_id, user["id"]):
                        st.success(f"Deleted {doc['file_name']}")
                        st.rerun()
                    else:
                        st.error("Failed to delete document.")

            # Tabbed details for each document
            h_tab1, h_tab2, h_tab3 = st.tabs(["📑 Saved Summaries", "📝 Extracted Text Preview", "⬇️ Cloud Download"])

            with h_tab1:
                summaries = get_summaries_for_document(doc_id, user["id"])
                if not summaries:
                    st.write("No summary generated yet for this document.")
                    if st.button("Generate Summary Now", key=f"gen_now_{doc_id}"):
                        st.session_state["active_doc_id"] = doc_id
                        st.session_state["current_page"] = "Summarize"
                        st.rerun()
                else:
                    for s in summaries:
                        st.markdown(f"**Mode:** {s.get('summary_type')} (Created: {s.get('created_at', '')[:19]})")
                        content = s.get("summary_content", {})
                        st.markdown(f"> **Executive Summary:** {content.get('executive_summary', 'N/A')}")
                        st.download_button(
                            label="📥 Download Markdown Summary",
                            data=summary_to_markdown(content, doc["file_name"]),
                            file_name=f"{doc['file_name']}_summary.md",
                            key=f"dl_sum_{s['id']}"
                        )

            with h_tab2:
                extracted = doc.get("extracted_text", "")
                st.text_area("Extracted Text Excerpt", extracted[:2000], height=180, key=f"txt_{doc_id}")

            with h_tab3:
                signed_url = get_signed_download_url(doc.get("storage_path", ""))
                if signed_url:
                    st.markdown(f"[🔗 Direct Cloud Storage Download Link]({signed_url})")
                else:
                    st.write(f"Storage Path: `{doc.get('storage_path')}`")

            st.markdown("---")
