import React, { useState } from 'react';
import { 
  FileText, 
  Trash2, 
  Sparkles, 
  HardDrive, 
  Search,
  Eye,
  FileCheck
} from 'lucide-react';
import { DocumentRecord, SummaryRecord } from '../types';

interface HistoryViewProps {
  documents: DocumentRecord[];
  summaries: SummaryRecord[];
  onSelectDocument: (doc: DocumentRecord) => void;
  onNavigateTab: (tab: string) => void;
  onDeleteDocument: (docId: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  documents,
  summaries,
  onSelectDocument,
  onNavigateTab,
  onDeleteDocument,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);

  const filteredDocs = documents.filter((d) =>
    d.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-fuchsia-400" />
            <span>Document History & Cloud Storage</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your persistent Supabase PostgreSQL records and Cloud Storage files
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full bg-slate-950 text-xs text-slate-200 pl-9 pr-4 py-2 rounded-xl border border-slate-700/80 focus:outline-none focus:ring-1 focus:ring-fuchsia-500"
          />
        </div>
      </div>

      {filteredDocs.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
          <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No matching documents found in your cloud storage.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDocs.map((doc) => {
            const docSummaries = summaries.filter((s) => s.documentId === doc.id);
            return (
              <div
                key={doc.id}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 shrink-0">
                      <FileCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm sm:text-base">
                        {doc.fileName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                        <span>{doc.pageCount} Pages</span>
                        <span>•</span>
                        <span>{(doc.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                        <span>•</span>
                        <span className="font-mono text-[11px] text-fuchsia-400">
                          {doc.storagePath}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => setPreviewDoc(previewDoc?.id === doc.id ? null : doc)}
                      className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-800"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{previewDoc?.id === doc.id ? 'Hide Text' : 'View Text'}</span>
                    </button>

                    <button
                      onClick={() => {
                        onSelectDocument(doc);
                        onNavigateTab('summarize');
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-fuchsia-600 to-blue-600 hover:from-fuchsia-500 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Summarizer</span>
                    </button>

                    <button
                      onClick={() => {
                        onSelectDocument(doc);
                        onNavigateTab('chat');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <span>Q&A</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete ${doc.fileName} and remove from Supabase Storage?`)) {
                          onDeleteDocument(doc.id);
                        }
                      }}
                      className="p-2 rounded-lg bg-slate-950 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors border border-slate-800 cursor-pointer"
                      title="Delete from Supabase"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Summaries list */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-slate-400 font-medium">Summaries Stored:</span>
                  {docSummaries.length === 0 ? (
                    <span className="text-slate-500 italic">None generated yet</span>
                  ) : (
                    docSummaries.map((s) => (
                      <span
                        key={s.id}
                        className="px-2.5 py-1 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-300 text-xs font-bold"
                      >
                        Mode: {s.summaryType} • {new Date(s.createdAt).toLocaleDateString()}
                      </span>
                    ))
                  )}
                </div>

                {/* Extracted Text Preview Drawer */}
                {previewDoc?.id === doc.id && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
                    <div className="font-bold text-slate-200">
                      Extracted Text Preview ({doc.extractedText.length} characters):
                    </div>
                    <pre className="font-mono text-[11px] text-slate-400 max-h-48 overflow-y-auto whitespace-pre-wrap p-3 bg-slate-900 rounded-lg border border-slate-800">
                      {doc.extractedText.slice(0, 3000)}
                      {doc.extractedText.length > 3000 && '\n\n[... truncated for preview ...]'}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
