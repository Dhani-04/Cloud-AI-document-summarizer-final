# Cloud-Based AI Document Summarizer
**Intermediate-Level B.Tech Artificial Intelligence and Data Science Project**

A production-grade, full-stack, cloud-native document intelligence application built with **Streamlit**, **Supabase (PostgreSQL & Storage)**, and **Google Gemini 3.8 Flash**. 

Features intelligent token-aware chunking for large PDFs, PyMuPDF page-by-page extraction, 14-section structured summaries, grounded document Q&A chatbot with page citations, user authentication with Row Level Security (RLS), and multi-format exports (PDF, Markdown, TXT).

---

## 🏗️ System Architecture

```
[ User Browser ]
       │
       ▼
[ Streamlit Web Application (app.py) ]
       │
       ├──► [ PyMuPDF Extraction (pdf_utils.py) ]
       │        └─ Page-wise text, scanning detection, layout metadata
       │
       ├──► [ Intelligent Chunking (utils/chunking.py) ]
       │        └─ Token-aware overlapping chunks & hierarchical map-reduce
       │
       ├──► [ AI Summarizer (summarizer.py) ]
       │        └─ Gemini 3.8 Flash / NLP Engine (14 Mandatory Sections)
       │
       ├──► [ Grounded Q&A Assistant (qa_engine.py) ]
       │        └─ BM25 semantic retrieval + page-cited answering
       │
       ├──► [ Supabase Cloud Backend ]
       │        ├─ Supabase Auth (auth.py)
       │        ├─ Supabase PostgreSQL: documents, summaries, chat_history (database.py)
       │        └─ Supabase Storage: private 'documents' bucket (cloud.py)
       │
       └──► [ Export Engine (export_utils.py) ]
                └─ ReportLab PDF, Markdown, Plain Text, Exam Notes
```

---

## 🚀 Key Features

1. **Academic Dashboard:** Welcome metrics, storage usage tracker, documents analyzed counter, recent file shortcuts, and cloud infrastructure health.
2. **User Authentication & RLS:** Complete user registration, login, session retention, and PostgreSQL Row Level Security (`auth.uid() = user_id`) guaranteeing private user documents.
3. **High-Performance PDF Extraction:** PyMuPDF (`fitz`) page-by-page extraction with corrupted file guards, scanned PDF detection, and character statistics.
4. **14 Mandatory Structured Summary Sections:**
   - 1. Executive Summary
   - 2. Document Introduction
   - 3. Section-wise Summary
   - 4. Chapter-wise Explanation
   - 5. Detailed Concept Explanations
   - 6. Key Concepts
   - 7. Important Definitions
   - 8. Important Points
   - 9. Keywords
   - 10. Examples and Applications
   - 11. Important Findings
   - 12. Conclusion
   - 13. Exam Preparation Notes
   - 14. Important Questions and Answers
5. **Intelligent Large Document Chunking:** Overlapping token-aware chunks, progress indicators, hierarchical map-reduce aggregation without silently skipping pages.
6. **Real Cloud Storage & Persistence:** Original PDFs stored in Supabase private bucket `documents` with user-specific isolation. Extracted text, summaries, and chat history persistently stored in PostgreSQL.
7. **Document Q&A Chatbot:** Grounded semantic retrieval citing specific page references (`[Page X]`), conversation history support, and hallucination safeguards.
8. **Multi-Format Academic Export:** Direct download of ReportLab formatted PDF, Markdown, Plain Text, Exam Notes, and Q&A.

---

## 📂 Project Structure

```
cloud-ai-document-summarizer/
│
├── app.py                      # Main Streamlit web application & routing
├── config.py                   # Centralized configuration & secrets loader
├── cloud.py                    # Supabase Cloud Storage manager (bucket: documents)
├── auth.py                     # Supabase Auth, login, signup, session manager
├── database.py                 # Supabase PostgreSQL CRUD operations & persistence
├── summarizer.py               # 14-section AI summarizer with 4 modes & chunking
├── pdf_utils.py                # PyMuPDF (fitz) page extraction & scan detection
├── qa_engine.py                # Grounded document retrieval & Q&A chatbot
├── export_utils.py             # PDF, Markdown, TXT, and Exam Notes export generator
│
├── pages/
│   ├── dashboard.py            # Overview analytics & KPI dashboard
│   ├── summarize.py            # PDF upload, extraction, & 14-section viewer
│   ├── history.py              # Saved documents, re-summarize & deletion
│   ├── document_chat.py        # Grounded Q&A chatbot interface
│   └── profile.py              # User profile & cloud security settings
│
├── utils/
│   ├── chunking.py             # Token-aware overlapping chunker
│   ├── text_processing.py      # Text cleaner, statistics & keyword extractor
│   └── validators.py           # File size, type, and integrity validation
│
├── assets/
│   └── style.css               # Professional academic UI stylesheet
│
├── supabase/
│   └── schema.sql              # Supabase PostgreSQL schema & RLS policies
│
├── .streamlit/
│   ├── config.toml             # Streamlit server and theme configuration
│   └── secrets.toml.example    # Secrets template for local and cloud deployment
│
├── requirements.txt            # Python dependencies for Streamlit Cloud
├── .gitignore                  # Git ignore rules for virtualenvs and secrets
└── README.md                   # Complete documentation and setup manual
```

---

## 🛠️ Local Development in Visual Studio Code

### Prerequisites
- Python 3.10, 3.11, or 3.12
- VS Code with Python extension
- Supabase account (free at [supabase.com](https://supabase.com))
- Google AI Studio API key (free at [aistudio.google.com](https://aistudio.google.com/))

### Step 1: Open in VS Code & Create Virtual Environment
```bash
cd cloud-ai-document-summarizer
python3 -m venv venv

# Windows:
.\venv\Scripts\activate

# macOS / Linux:
source venv/bin/activate
```

### Step 2: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Setup Supabase Database & Storage
1. Log in to [Supabase Dashboard](https://supabase.com/dashboard).
2. Create a new project.
3. In the left menu, click **SQL Editor**.
4. Open `supabase/schema.sql`, copy all contents, paste into the SQL Editor and click **Run**.
5. This creates the `documents`, `summaries`, `chat_history` tables, active Row Level Security (RLS) policies, and the private `documents` storage bucket.

### Step 4: Configure Secrets
Copy `.streamlit/secrets.toml.example` to `.streamlit/secrets.toml`:
```bash
cp .streamlit/secrets.toml.example .streamlit/secrets.toml
```
Open `.streamlit/secrets.toml` and fill in your actual credentials:
```toml
SUPABASE_URL = "https://your-project.supabase.co"
SUPABASE_KEY = "your-anon-key"
GEMINI_API_KEY = "AIzaSy..."
SUPABASE_STORAGE_BUCKET = "documents"
```

### Step 5: Run the Streamlit Application
```bash
streamlit run app.py
```
Open `http://localhost:8501` in your browser.

---

## ☁️ Deployment on Streamlit Community Cloud

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Cloud-Based AI Document Summarizer"
   git branch -M main
   git remote add origin https://github.com/your-username/cloud-ai-document-summarizer.git
   git push -u origin main
   ```
2. **Deploy on Streamlit:**
   - Go to [share.streamlit.io](https://share.streamlit.io/).
   - Click **New app**.
   - Select your repository and set `Main file path` to `app.py`.
   - Click **Advanced settings...** and open **Secrets**.
   - Paste the contents of your `.streamlit/secrets.toml` with your real keys.
   - Click **Deploy!**

---

## 🔧 Troubleshooting Guide

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| **"Failed to upload to Supabase Storage"** | The `documents` bucket does not exist or lacks RLS policies | Run the storage section of `supabase/schema.sql` in the Supabase SQL Editor. |
| **"Scanned PDF warning"** | The PDF contains scanned images without selectable text layer | Use native digital PDFs or OCR before processing. |
| **"File exceeds max size limit"** | Uploaded file > 35MB | Split the PDF or increase `MAX_FILE_SIZE_MB` in `config.py`. |
| **"Gemini quota exceeded"** | Free tier rate limit | Wait 60 seconds or the app will automatically use the high-accuracy NLP extractive fallback. |
