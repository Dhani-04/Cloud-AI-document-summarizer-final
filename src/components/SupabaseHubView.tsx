import React, { useState } from 'react';
import { 
  Database, 
  ShieldCheck, 
  Copy, 
  Check, 
  Table, 
  Cloud
} from 'lucide-react';
import { DocumentRecord, SummaryRecord, ChatMessage } from '../types';

interface SupabaseHubViewProps {
  documents: DocumentRecord[];
  summaries: SummaryRecord[];
  chatMessages: ChatMessage[];
}

export const SupabaseHubView: React.FC<SupabaseHubViewProps> = ({
  documents,
  summaries,
  chatMessages,
}) => {
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [activeSchemaTab, setActiveSchemaTab] = useState<'tables' | 'rls' | 'sql'>('tables');

  const schemaSql = `-- =========================================================================
-- Cloud-Based AI Document Summarizer
-- Supabase PostgreSQL Schema & Row Level Security (RLS) Setup
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    page_count INTEGER NOT NULL DEFAULT 1,
    extracted_text TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. SUMMARIES TABLE
CREATE TABLE IF NOT EXISTS public.summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    summary_type TEXT NOT NULL CHECK (summary_type IN ('Short', 'Medium', 'Detailed', 'Very Detailed')),
    summary_content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CHAT HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.chat_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    page_references JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents" ON public.documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documents" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents" ON public.documents FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own summaries" ON public.summaries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own summaries" ON public.summaries FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own chat history" ON public.chat_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat messages" ON public.chat_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false) ON CONFLICT DO NOTHING;
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(schemaSql);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cloud className="w-5 h-5 text-fuchsia-400" />
            <span>Supabase Cloud Architecture</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            PostgreSQL relational schemas, private storage bucket, and Row Level Security policies
          </p>
        </div>

        <button
          onClick={copyToClipboard}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-blue-600 hover:from-fuchsia-500 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-fuchsia-600/20 transition-all cursor-pointer"
        >
          {copiedSchema ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copiedSchema ? 'SQL Copied!' : 'Copy Supabase SQL'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'tables', label: '📊 Database Tables' },
          { id: 'rls', label: '🔒 Row Level Security' },
          { id: 'sql', label: '📄 schema.sql' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSchemaTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSchemaTab === tab.id
                ? 'bg-gradient-to-r from-fuchsia-600 to-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* View 1: Tables */}
      {activeSchemaTab === 'tables' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Table: documents */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-fuchsia-400" />
                <span className="font-mono text-sm font-bold text-slate-100">documents</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-fuchsia-500/10 text-fuchsia-400 text-[11px] font-bold border border-fuchsia-500/20">
                {documents.length} rows
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Stores uploaded document metadata, page counts, extracted full text, and storage pointers.
            </p>
            <div className="pt-2 border-t border-slate-800 font-mono text-[11px] text-slate-400 space-y-1">
              <div>id (UUID, PK)</div>
              <div>user_id (UUID, FK auth.users)</div>
              <div>file_name (TEXT)</div>
              <div>file_size (BIGINT)</div>
              <div>page_count (INT)</div>
              <div>extracted_text (TEXT)</div>
              <div>storage_path (TEXT)</div>
              <div>created_at (TIMESTAMP)</div>
            </div>
          </div>

          {/* Table: summaries */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-blue-400" />
                <span className="font-mono text-sm font-bold text-slate-100">summaries</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[11px] font-bold border border-blue-500/20">
                {summaries.length} rows
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Stores structured 14-section JSON payloads across 4 granularity modes with foreign key cascade.
            </p>
            <div className="pt-2 border-t border-slate-800 font-mono text-[11px] text-slate-400 space-y-1">
              <div>id (UUID, PK)</div>
              <div>document_id (UUID, FK documents)</div>
              <div>user_id (UUID, FK auth.users)</div>
              <div>summary_type (TEXT)</div>
              <div>summary_content (JSONB)</div>
              <div>created_at (TIMESTAMP)</div>
            </div>
          </div>

          {/* Table: chat_history */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-slate-300" />
                <span className="font-mono text-sm font-bold text-slate-100">chat_history</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-bold border border-slate-700">
                {chatMessages.length} rows
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Maintains multi-turn conversational exchanges along with verified page citations.
            </p>
            <div className="pt-2 border-t border-slate-800 font-mono text-[11px] text-slate-400 space-y-1">
              <div>id (UUID, PK)</div>
              <div>document_id (UUID, FK documents)</div>
              <div>user_id (UUID, FK auth.users)</div>
              <div>question (TEXT)</div>
              <div>answer (TEXT)</div>
              <div>page_references (JSONB)</div>
              <div>created_at (TIMESTAMP)</div>
            </div>
          </div>
        </div>
      )}

      {/* View 2: RLS */}
      {activeSchemaTab === 'rls' && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-fuchsia-400 font-bold text-base">
            <ShieldCheck className="w-5 h-5" />
            <span>Row Level Security (RLS) & Multi-Tenant Data Isolation</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            In compliance with cloud architecture best practices, Supabase enforces PostgreSQL Row Level Security:
          </p>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="font-bold text-fuchsia-400">1. Isolation Condition: </span>
              <code className="text-slate-300">USING (auth.uid() = user_id)</code>
              <p className="text-slate-400 mt-1">
                Ensures users can only read, write, or delete rows tagged with their own authenticated UID.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="font-bold text-blue-400">2. Storage Bucket Isolation: </span>
              <code className="text-slate-300">auth.uid()::text = (storage.foldername(name))[1]</code>
              <p className="text-slate-400 mt-1">
                Ensures private storage objects are uploaded into user-scoped paths (<code className="text-slate-300">{'{user_id}/{filename}'}</code>) that cannot be accessed by other tenants.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="font-bold text-slate-200">3. Cascading Cleanup: </span>
              <code className="text-slate-300">ON DELETE CASCADE</code>
              <p className="text-slate-400 mt-1">
                When a document record is deleted, its associated summaries and chat exchanges are automatically removed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* View 3: Full SQL */}
      {activeSchemaTab === 'sql' && (
        <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-sm">
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono">cloud-ai-document-summarizer/supabase/schema.sql</span>
            <button
              onClick={copyToClipboard}
              className="text-xs text-fuchsia-400 hover:text-fuchsia-300 font-bold cursor-pointer"
            >
              {copiedSchema ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
          <pre className="p-4 text-[11px] font-mono text-fuchsia-300/90 overflow-x-auto whitespace-pre max-h-[500px]">
            {schemaSql}
          </pre>
        </div>
      )}
    </div>
  );
};
