"""
pages/summarize.py - Upload, Extract & AI Summarization
Handles uploading PDFs, running PyMuPDF extraction, persisting to Supabase,
generating 14-section structured summaries, and multi-format exports.
"""

import streamlit as st
import config
from auth import get_current_user
from cloud import upload_file_to_storage
from database import save_document, save_summary, get_summaries_for_document, get_document_by_id
from pdf_utils import extract_text_from_pdf_bytes
from summarizer import summarize_document
from utils.validators import validate_uploaded_pdf, format_file_size
from utils.text_processing import calculate_text_stats
from export_utils import summary_to_markdown, summary_to_plain_text, generate_pdf_summary_bytes

def render_summarize():
    user = get_current_user()
    if not user:
        st.warning("Please sign in or register to upload and summarize documents.")
        return

    st.markdown("## 📑 AI Document Summarizer")
    st.markdown("Upload academic papers, textbooks, or research reports to generate comprehensive 14-section structured summaries.")

    # Check for pending upload or active document
    uploaded_file = st.file_uploader(
        "Choose a PDF file", 
        type=["pdf"],
        help=f"Max file size: {config.MAX_FILE_SIZE_MB}MB. Supports papers, reports, theses, and textbooks."
    )

    if st.session_state.get("pending_file") and not uploaded_file:
        uploaded_file = st.session_state.pop("pending_file")

    active_doc_id = st.session_state.get("active_doc_id")
    current_doc = None
    if active_doc_id:
        current_doc = get_document_by_id(active_doc_id, user["id"])

    # Mode Selector
    summary_mode = st.selectbox(
        "🎯 Select Summarization Mode",
        options=config.SUMMARY_MODES,
        index=2, # Default to "Detailed"
        help="Short: quick brief • Medium: balanced • Detailed: deep academic breakdown • Very Detailed: exhaustive textbook analysis"
    )

    # Process Uploaded PDF
    if uploaded_file is not None:
        file_bytes = uploaded_file.getvalue()
        file_size = len(file_bytes)
        file_name = uploaded_file.name

        # Validate
        valid, err_msg = validate_uploaded_pdf(file_name, file_size)
        if not valid:
            st.error(err_msg)
            return

        col_meta1, col_meta2, col_meta3 = st.columns(3)
        col_meta1.info(f"**Filename:** {file_name}")
        col_meta2.info(f"**Size:** {format_file_size(file_size)}")

        if st.button("🚀 Extract Text & Upload to Cloud Storage", type="primary", use_container_width=True):
            with st.spinner("Extracting text and uploading to Supabase Storage..."):
                # 1. PyMuPDF Extraction
                success, ext_err, pages_data, meta = extract_text_from_pdf_bytes(file_bytes)
                if not success:
                    st.error(ext_err)
                    return

                col_meta3.info(f"**Total Pages:** {meta['total_pages']}")
                
                # Check for scanned PDF
                if meta.get("is_likely_scanned"):
                    st.warning("⚠️ This document appears to be scanned or image-based. Text extraction may be partial.")

                # Combine text
                full_text = "\n\n".join([f"--- [Page {p['page_num']}] ---\n{p['text']}" for p in pages_data])

                # 2. Upload original PDF to Supabase Storage
                up_ok, storage_path, storage_msg = upload_file_to_storage(user["id"], file_bytes, file_name)
                if not up_ok:
                    st.error(f"Failed to upload PDF to Supabase Storage: {storage_msg}")
                    return

                # 3. Save Document in Supabase Database
                saved_doc = save_document(
                    user_id=user["id"],
                    file_name=file_name,
                    file_size=file_size,
                    page_count=meta["total_pages"],
                    extracted_text=full_text,
                    storage_path=storage_path
                )

                if saved_doc:
                    st.success(f"Document saved securely to Supabase! ID: `{saved_doc['id']}`")
                    st.session_state["active_doc_id"] = saved_doc["id"]
                    st.session_state["pages_data"] = pages_data
                    current_doc = saved_doc
                    st.rerun()

    # Active Document Processing
    if current_doc:
        st.markdown("---")
        st.markdown(f"### 📄 Active Document: **{current_doc['file_name']}**")
        stats = calculate_text_stats(current_doc.get("extracted_text", ""))
        
        c1, c2, c3, c4 = st.columns(4)
        c1.metric("Pages", current_doc.get("page_count", 1))
        c2.metric("Total Words", f"{stats['word_count']:,}")
        c3.metric("Est. Reading Time", f"{stats['estimated_reading_time_min']} min")
        c4.metric("Storage Status", "☁️ Synced")

        # Action: Generate Summary
        if st.button(f"✨ Generate {summary_mode} Structured Summary", type="primary"):
            progress_bar = st.progress(0.0)
            status_text = st.empty()

            def update_progress(ratio: float, msg: str):
                progress_bar.progress(min(1.0, max(0.0, ratio)))
                status_text.text(msg)

            # Reconstruct pages_data if missing from session
            pages_data = st.session_state.get("pages_data", [])
            if not pages_data:
                # Reconstruct simple page chunks from stored text
                pages_data = [{"page_num": 1, "text": current_doc.get("extracted_text", "")}]

            summary_json = summarize_document(
                pages_data=pages_data,
                summary_mode=summary_mode,
                progress_callback=update_progress
            )

            # Save Summary to Supabase
            save_summary(
                document_id=current_doc["id"],
                user_id=user["id"],
                summary_type=summary_mode,
                summary_content=summary_json
            )
            st.success(f"{summary_mode} summary saved to Supabase database!")

        # Display Existing Summaries
        existing_summaries = get_summaries_for_document(current_doc["id"], user["id"])
        if existing_summaries:
            latest = existing_summaries[0]
            summary_data = latest.get("summary_content", {})

            st.markdown("---")
            st.subheader(f"📑 Generated Summary ({latest.get('summary_type', 'Standard')})")

            # 14 Mandatory Structured Sections Rendering
            tab1, tab2, tab3, tab4, tab5 = st.tabs([
                "📌 Core Overview (1-4)",
                "💡 Concepts & Definitions (5-9)",
                "🔬 Findings & Conclusion (10-12)",
                "🎓 Exam Prep & Q&A (13-14)",
                "📥 Export Options"
            ])

            with tab1:
                st.markdown("#### 1. Executive Summary")
                st.write(summary_data.get("executive_summary", "N/A"))
                
                st.markdown("#### 2. Document Introduction")
                st.write(summary_data.get("document_introduction", "N/A"))
                
                st.markdown("#### 3. Section-wise Summary")
                for s in summary_data.get("section_wise_summary", []):
                    st.markdown(f"- {s}")
                    
                st.markdown("#### 4. Chapter-wise Explanation")
                for c in summary_data.get("chapter_wise_explanation", []):
                    st.markdown(f"- {c}")

            with tab2:
                st.markdown("#### 5. Detailed Concept Explanations")
                for d in summary_data.get("detailed_concept_explanations", []):
                    st.markdown(f"- {d}")

                st.markdown("#### 6. Key Concepts")
                st.write(", ".join([f"**{kc}**" for kc in summary_data.get("key_concepts", [])]))

                st.markdown("#### 7. Important Definitions")
                for defn in summary_data.get("important_definitions", []):
                    st.markdown(f"- **{defn.get('term')}:** {defn.get('definition')}")

                st.markdown("#### 8. Important Points")
                for pt in summary_data.get("important_points", []):
                    st.markdown(f"- {pt}")

                st.markdown("#### 9. Keywords")
                st.write(" • ".join([f"`{k}`" for k in summary_data.get("keywords", [])]))

            with tab3:
                st.markdown("#### 10. Examples and Applications")
                for ex in summary_data.get("examples_and_applications", []):
                    st.markdown(f"- {ex}")

                st.markdown("#### 11. Important Findings")
                for f in summary_data.get("important_findings", []):
                    st.markdown(f"- {f}")

                st.markdown("#### 12. Conclusion")
                st.write(summary_data.get("conclusion", "N/A"))

            with tab4:
                st.markdown("#### 13. Exam Preparation Notes")
                for note in summary_data.get("exam_preparation_notes", []):
                    st.info(f"💡 {note}")

                st.markdown("#### 14. Important Questions and Answers")
                for qa in summary_data.get("important_questions_and_answers", []):
                    with st.expander(f"❓ {qa.get('question')}"):
                        st.write(qa.get("answer"))

            with tab5:
                st.markdown("#### Export Generated Academic Summary")
                md_content = summary_to_markdown(summary_data, current_doc["file_name"])
                txt_content = summary_to_plain_text(summary_data, current_doc["file_name"])
                pdf_bytes = generate_pdf_summary_bytes(summary_data, current_doc["file_name"])

                col_exp1, col_exp2, col_exp3 = st.columns(3)
                with col_exp1:
                    st.download_button(
                        label="📄 Download PDF Summary",
                        data=pdf_bytes,
                        file_name=f"{current_doc['file_name']}_summary.pdf",
                        mime="application/pdf",
                        use_container_width=True
                    )
                with col_exp2:
                    st.download_button(
                        label="📝 Download Markdown (.md)",
                        data=md_content,
                        file_name=f"{current_doc['file_name']}_summary.md",
                        mime="text/markdown",
                        use_container_width=True
                    )
                with col_exp3:
                    st.download_button(
                        label="📋 Download Plain Text (.txt)",
                        data=txt_content,
                        file_name=f"{current_doc['file_name']}_summary.txt",
                        mime="text/plain",
                        use_container_width=True
                    )
