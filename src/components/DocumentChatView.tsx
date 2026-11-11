import React, { useState } from 'react';
import { 
  Send, 
  MessageSquare, 
  ShieldCheck, 
  FileText, 
  Sparkles, 
  Trash2
} from 'lucide-react';
import { ChatMessage, DocumentRecord } from '../types';

interface DocumentChatViewProps {
  currentDocument: DocumentRecord | null;
  allDocuments: DocumentRecord[];
  onSelectDocument: (doc: DocumentRecord) => void;
  chatMessages: ChatMessage[];
  onSendMessage: (question: string) => Promise<void>;
  onClearChat: (documentId: string) => void;
  isThinking: boolean;
}

export const DocumentChatView: React.FC<DocumentChatViewProps> = ({
  currentDocument,
  allDocuments,
  onSelectDocument,
  chatMessages,
  onSendMessage,
  onClearChat,
  isThinking,
}) => {
  const [inputQuery, setInputQuery] = useState('');

  const docMessages = currentDocument
    ? chatMessages.filter((m) => m.documentId === currentDocument.id)
    : [];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isThinking) return;
    const q = inputQuery;
    setInputQuery('');
    onSendMessage(q);
  };

  const sampleQuestions = [
    'What is the primary methodology introduced in this document?',
    'What are the key mathematical formulas or equations specified?',
    'How does this work overcome previous technical limitations?',
    'What empirical findings or benchmarks were observed?',
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header and Document Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-fuchsia-400" />
            <span>Document Q&A Assistant</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Grounded passage retrieval with exact page citations to prevent hallucinations
          </p>
        </div>

        {allDocuments.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">Target Document:</label>
            <select
              value={currentDocument?.id || ''}
              onChange={(e) => {
                const found = allDocuments.find((d) => d.id === e.target.value);
                if (found) onSelectDocument(found);
              }}
              className="bg-slate-950 text-xs text-slate-200 border border-slate-700/80 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-fuchsia-500"
            >
              {allDocuments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.fileName} ({d.pageCount} pgs)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!currentDocument ? (
        <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
          <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No document selected. Please upload or choose a document first.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat Conversation Container (3 Cols) */}
          <div className="lg:col-span-3 flex flex-col h-[650px] rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-lg">
            {/* Chat Messages List */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {docMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 text-sm">
                      Ask Questions About {currentDocument.fileName}
                    </h4>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">
                      Inquire about formulas, methodologies, or findings. Answers cite specific pages.
                    </p>
                  </div>

                  {/* Sample questions pills */}
                  <div className="pt-3 max-w-md w-full space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-left">
                      Suggested Questions:
                    </div>
                    {sampleQuestions.map((sq, i) => (
                      <button
                        key={i}
                        onClick={() => onSendMessage(sq)}
                        className="w-full text-left p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-fuchsia-500/30 text-xs text-slate-300 transition-colors cursor-pointer"
                      >
                        ❓ {sq}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                docMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-fuchsia-600 to-blue-600 text-white rounded-tr-none shadow-md shadow-fuchsia-600/10'
                          : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none space-y-2'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>

                      {/* Cited Page References */}
                      {msg.sender === 'assistant' && msg.pageReferences && msg.pageReferences.length > 0 && (
                        <div className="pt-2 border-t border-slate-800 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] text-slate-400 font-bold">📍 Grounded In:</span>
                          {msg.pageReferences.map((p) => (
                            <span
                              key={p}
                              className="px-2 py-0.5 rounded-md bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 text-[10px] font-mono font-bold"
                            >
                              Page {p}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 px-1 mt-1 font-mono">
                      {msg.sender === 'user' ? 'You' : 'Assistant'} •{' '}
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}

              {isThinking && (
                <div className="flex items-start gap-2">
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl rounded-tl-none p-3 text-xs text-slate-400 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-fuchsia-400 animate-spin" />
                    <span>Searching document pages & retrieving grounded answer...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={`Ask anything about ${currentDocument.fileName}...`}
                className="flex-1 bg-slate-900 text-xs text-slate-200 px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-1 focus:ring-fuchsia-500"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isThinking}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-blue-600 hover:from-fuchsia-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-fuchsia-600/20 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask</span>
              </button>
            </form>
          </div>

          {/* Right Sidebar: Grounding Info & Document Specs */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-sm">
              <div className="flex items-center gap-2 text-fuchsia-400 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Anti-Hallucination Guard</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Operates with strict document grounding. If facts are not present in the uploaded PDF, it will state so explicitly.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-sm">
              <div className="text-xs font-bold text-slate-200">Active Document</div>
              <div className="text-xs text-slate-400 space-y-1">
                <div>Pages: <strong className="text-slate-200">{currentDocument.pageCount}</strong></div>
                <div>Storage: <strong className="text-blue-400">Supabase Bucket</strong></div>
                <div>Format: <strong className="text-slate-200">PDF Document</strong></div>
              </div>
            </div>

            {docMessages.length > 0 && (
              <button
                onClick={() => onClearChat(currentDocument.id)}
                className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/20 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Chat History</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
