"""
app.py - Cloud-Based AI Document Summarizer
Main Streamlit application entry point.
Coordinates authentication, sidebar routing, global styling, and page views.
"""

import os
import streamlit as st
import config
from auth import sign_in_user, sign_up_user, sign_out_user, get_current_user, is_authenticated
from pages.dashboard import render_dashboard
from pages.summarize import render_summarize
from pages.history import render_history
from pages.document_chat import render_document_chat
from pages.profile import render_profile

# 1. Page Configuration
st.set_page_config(
    page_title="Cloud-Based AI Document Summarizer",
    page_icon="📑",
    layout="wide",
    initial_sidebar_state="expanded"
)

# 2. Inject Custom CSS
css_path = os.path.join(os.path.dirname(__file__), "assets", "style.css")
if os.path.exists(css_path):
    with open(css_path, "r", encoding="utf-8") as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

# 3. Session State Initialization
if "current_page" not in st.session_state:
    st.session_state["current_page"] = "Dashboard"

# 4. Authentication Gate
if not is_authenticated():
    st.markdown("<h1 style='text-align: center; color: #60a5fa;'>Cloud-Based AI Document Summarizer</h1>", unsafe_allow_html=True)
    st.markdown("<p style='text-align: center; color: #94a3b8;'>Enterprise Academic Intelligence • Supabase Cloud PostgreSQL & Storage • Gemini 3.8 AI</p>", unsafe_allow_html=True)
    st.markdown("<br>", unsafe_allow_html=True)

    c_center = st.columns([1, 2, 1])[1]
    with c_center:
        auth_tab1, auth_tab2 = st.tabs(["🔐 Sign In", "📝 Create Account"])

        with auth_tab1:
            st.subheader("Login to Your Cloud Account")
            login_email = st.text_input("Academic or Institutional Email", key="login_email")
            login_pass = st.text_input("Password", type="password", key="login_pass")
            
            if st.button("Sign In", type="primary", use_container_width=True):
                if not login_email or not login_pass:
                    st.error("Please enter both email and password.")
                else:
                    success, msg, user = sign_in_user(login_email, login_pass)
                    if success:
                        st.success(msg)
                        st.rerun()
                    else:
                        st.error(msg)

            # Quick Demo Login Button for instant evaluation
            st.markdown("---")
            if st.button("⚡ Instant Demo Login (Researcher Access)", use_container_width=True):
                sign_in_user("researcher@academic.ai", "DemoPassword123")
                st.rerun()

        with auth_tab2:
            st.subheader("Register New Account")
            st.caption("Each account gets private, isolated Supabase Storage and PostgreSQL records.")
            reg_email = st.text_input("Email", key="reg_email")
            reg_pass = st.text_input("Password (min 6 characters, 1 number)", type="password", key="reg_pass")
            reg_pass_conf = st.text_input("Confirm Password", type="password", key="reg_pass_conf")

            if st.button("Create Account", type="primary", use_container_width=True):
                if not reg_email or not reg_pass:
                    st.error("Please fill in all fields.")
                elif reg_pass != reg_pass_conf:
                    st.error("Passwords do not match.")
                else:
                    success, msg, user = sign_up_user(reg_email, reg_pass)
                    if success:
                        st.success(msg)
                    else:
                        st.error(msg)

    st.stop()

# 5. Authenticated App Layout & Sidebar Navigation
user = get_current_user()

with st.sidebar:
    st.markdown("### 📑 AI Document Summarizer")
    st.caption(f"Logged in as: **{user.get('email')}**")
    st.markdown("---")

    nav_options = ["Dashboard", "Summarize", "History", "Document Chat", "Profile"]
    
    # Check if page was updated via button click
    current_idx = nav_options.index(st.session_state["current_page"]) if st.session_state["current_page"] in nav_options else 0

    selected_page = st.radio(
        "Navigation",
        options=nav_options,
        index=current_idx,
        label_visibility="collapsed"
    )
    st.session_state["current_page"] = selected_page

    st.markdown("---")
    st.markdown("#### Cloud Backend")
    st.caption("• Database: Supabase PostgreSQL")
    st.caption("• Storage: Supabase Storage Bucket")
    st.caption("• Security: Active RLS Policies")
    st.caption("• AI Model: Gemini 3.8 Flash")

    st.markdown("---")
    if st.button("🚪 Logout", use_container_width=True):
        sign_out_user()
        st.rerun()

# 6. Render Active Page
page = st.session_state["current_page"]

if page == "Dashboard":
    render_dashboard()
elif page == "Summarize":
    render_summarize()
elif page == "History":
    render_history()
elif page == "Document Chat":
    render_document_chat()
elif page == "Profile":
    render_profile()
