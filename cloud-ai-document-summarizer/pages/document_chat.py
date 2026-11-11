"""
pages/document_chat.py - Grounded Document Q&A Assistant
Enables interactive chat against uploaded documents with supporting page citations,
hallucination guards, and persistent Supabase chat storage.
"""

import streamlit as st
from auth import get_current_user
from database import get_user_documents, get_chat_history, save_chat_message
from qa_engine import answer_document_question

def render_document_chat():
    user = get_current_user()
    if not user:
        st.warning("Please sign in to access the Document Q&A assistant.")
        return

    st.markdown("## 💬 Grounded Document Q&A Assistant")
    st.markdown("Ask deep questions about any uploaded document. Responses are strictly grounded with page-level citations.")

    docs = get_user_documents(user["id"])
    if not docs:
        st.info("No documents uploaded. Please upload a PDF in the **Summarize** page first.")
        return

    # Document Selector
    doc_options = {d["id"]: f"{d['file_name']} ({d.get('page_count', 1)} pages)" for d in docs}
    
    # Check if active_doc_id is present
    current_selected = st.session_state.get("active_doc_id")
    if current_selected not in doc_options:
        current_selected = list(doc_options.keys())[0]

    selected_doc_id = st.selectbox(
        "Select Document for Q&A",
        options=list(doc_options.keys()),
        format_func=lambda x: doc_options[x],
        index=list(doc_options.keys()).index(current_selected)
    )

    selected_doc = next(d for d in docs if d["id"] == selected_doc_id)

    # Reconstruct page structures from extracted_text
    extracted = selected_doc.get("extracted_text", "")
    pages_raw = extracted.split("--- [Page ")
    pages_data = []
    
    for idx, raw in enumerate(pages_raw):
        if not raw.strip():
            continue
        try:
            p_num = int(raw.split("] ---")[0])
            p_text = raw.split("] ---")[1].strip()
        except Exception:
            p_num = idx + 1
            p_text = raw.strip()
            
        pages_data.append({"page_num": p_num, "text": p_text})

    if not pages_data:
        pages_data = [{"page_num": 1, "text": extracted}]

    # Load persistent chat history from Supabase
    chat_history = get_chat_history(selected_doc_id, user["id"])

    # Display past conversation
    st.markdown("### Conversation History")
    for msg in chat_history:
        with st.chat_message("user"):
            st.write(msg["question"])
        with st.chat_message("assistant"):
            st.write(msg["answer"])
            if msg.get("page_references"):
                refs = ", ".join([f"Page {p}" for p in msg["page_references"]])
                st.caption(f"📍 Cited Sources: {refs}")

    # Chat Input
    user_query = st.chat_input("Ask a question about this document (e.g., 'What methodology was used in chapter 3?')...")
    if user_query:
        # Display user message immediately
        with st.chat_message("user"):
            st.write(user_query)

        with st.chat_message("assistant"):
            with st.spinner("Analyzing document pages and synthesizing grounded answer..."):
                answer_text, page_refs = answer_document_question(
                    pages_data=pages_data,
                    question=user_query,
                    conversation_history=chat_history
                )
                st.write(answer_text)
                if page_refs:
                    st.caption(f"📍 Supporting Sources: {', '.join([f'Page {p}' for p in page_refs])}")

                # Save to Supabase chat_history table
                save_chat_message(
                    document_id=selected_doc_id,
                    user_id=user["id"],
                    question=user_query,
                    answer=answer_text,
                    page_references=page_refs
                )
                st.rerun()
