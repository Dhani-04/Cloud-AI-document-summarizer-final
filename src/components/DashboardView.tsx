import React from 'react';
import { 
  FileText, 
  Sparkles, 
  HardDrive, 
  Layers, 
  Upload, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { DocumentRecord, SummaryRecord } from '../types';

interface DashboardViewProps {
  documents: DocumentRecord[];
  summaries: SummaryRecord[];
  onSelectDocument: (doc: DocumentRecord) => void;
  onNavigateTab: (tab: string) => void;
  onLoadSample: (sampleId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  documents,
  summaries,
  onSelectDocument,
  onNavigateTab,
  onLoadSample,
}) => {
  const totalDocs = documents.length;
  const totalSummaries = summaries.length;
  const totalPages = documents.reduce((acc, d) => acc + (d.pageCount || 1), 0);
  const totalBytes = documents.reduce((acc, d) => acc + (d.fileSize || 0), 0);
  const formattedStorage = (totalBytes / (1024 * 1024)).toFixed(2);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner - Silver, Magenta, Blue */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-xl">
        {/* Subtle accent glows */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>AI Document Intelligence & Cloud Storage</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Cloud-Based AI Document Summarizer
          </h1>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigateTab('summarize')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-blue-600 hover:from-fuchsia-500 hover:to-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-fuchsia-600/20 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Document</span>
            </button>

            <button
              onClick={() => onNavigateTab('chat')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs sm:text-sm font-semibold border border-slate-800 transition-all cursor-pointer"
            >
              <span>Ask Document Q&A</span>
              <ArrowRight className="w-4 h-4 text-fuchsia-400" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Primary KPI Metric Cards (Silver borders, magenta/blue glow) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Documents
            </span>
            <div className="w-9 h-9 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-2">{totalDocs}</div>
          <div className="text-[11px] text-fuchsia-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            <span>Table: documents</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Summaries Created
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-2">{totalSummaries}</div>
          <div className="text-[11px] text-blue-400 mt-1 flex items-center gap-1 font-medium">
            <Sparkles className="w-3 h-3" />
            <span>14 Structured Sections</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Pages Processed
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200">
              <Layers className="w-4 h-4 text-fuchsia-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-2">{totalPages}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
            <Layers className="w-3 h-3 text-fuchsia-400" />
            <span>Token-aware chunks</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Cloud Storage Used
            </span>
            <div className="w-9 h-9 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-2">{formattedStorage} MB</div>
          <div className="text-[11px] text-fuchsia-400 mt-1 flex items-center gap-1 font-medium">
            <HardDrive className="w-3 h-3" />
            <span>Bucket: documents</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Documents & Quick Upload Option */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Documents */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-fuchsia-400" />
              <span>Recent Cloud Documents</span>
            </h2>
            <button
              onClick={() => onNavigateTab('history')}
              className="text-xs text-fuchsia-400 hover:text-fuchsia-300 font-semibold cursor-pointer"
            >
              View All ({documents.length}) →
            </button>
          </div>

          <div className="space-y-3">
            {documents.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
                <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No documents in your cloud history yet.</p>
                <button
                  onClick={() => onNavigateTab('summarize')}
                  className="mt-3 px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-blue-600 text-white text-xs font-bold"
                >
                  Upload First PDF
                </button>
              </div>
            ) : (
              documents.slice(0, 4).map((doc) => {
                const docSummaries = summaries.filter((s) => s.documentId === doc.id);
                return (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                        <FileCheck className="w-5 h-5 text-fuchsia-400" />
                      </div>
                      <div>
                        <div
                          className="font-bold text-sm text-slate-200 hover:text-fuchsia-400 cursor-pointer line-clamp-1 transition-colors"
                          onClick={() => {
                            onSelectDocument(doc);
                            onNavigateTab('summarize');
                          }}
                        >
                          {doc.fileName}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                          <span>{doc.pageCount} pages</span>
                          <span>•</span>
                          <span>{(doc.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                          <span>•</span>
                          <span className="text-blue-400 font-medium">
                            {docSummaries.length > 0
                              ? `${docSummaries.length} summary generated`
                              : 'Ready to summarize'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => {
                          onSelectDocument(doc);
                          onNavigateTab('summarize');
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Summarize
                      </button>
                      <button
                        onClick={() => {
                          onSelectDocument(doc);
                          onNavigateTab('chat');
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Ask Q&A
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 1 Col: Quick Upload & Cloud Infrastructure Status */}
        <div className="space-y-6">
          {/* Quick Preloaded Academic Papers for Instant Testing */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-fuchsia-400" />
              <span>Instant Test Papers</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Select a research paper to test extraction and summarization immediately:
            </p>

            <div className="mt-3 space-y-2">
              <button
                onClick={() => onLoadSample('sample-doc-1')}
                className="w-full text-left p-3 rounded-xl bg-slate-950/70 hover:bg-slate-900 border border-slate-800 hover:border-fuchsia-500/40 transition-all text-xs group cursor-pointer"
              >
                <div className="font-bold text-slate-200 group-hover:text-fuchsia-400">
                  📄 Attention & Transformer Architecture
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">12 Pages • Deep Learning & NLP</div>
              </button>

              <button
                onClick={() => onLoadSample('sample-doc-2')}
                className="w-full text-left p-3 rounded-xl bg-slate-950/70 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/40 transition-all text-xs group cursor-pointer"
              >
                <div className="font-bold text-slate-200 group-hover:text-blue-400">
                  📄 Distributed Consensus in Cloud Databases
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">8 Pages • Raft, Paxos, Quorums</div>
              </button>
            </div>
          </div>

          {/* Cloud Architecture Status */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Cloud Status</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-slate-300">Supabase Auth</span>
                <span className="text-fuchsia-400 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" /> RLS Protected
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-slate-300">PostgreSQL Database</span>
                <span className="text-blue-400 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Connected
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-slate-300">Supabase Storage</span>
                <span className="text-fuchsia-400 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400" /> Private Bucket
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-slate-300">AI Model</span>
                <span className="text-blue-400 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-fuchsia-400" /> Gemini 3.8
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
