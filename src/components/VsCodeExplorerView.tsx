import React, { useState, useEffect } from 'react';
import { 
  FolderTree, 
  FileCode, 
  Download, 
  Copy, 
  Check, 
  Terminal, 
  Folder, 
  ChevronRight, 
  ChevronDown,
  Sparkles,
  ExternalLink,
  Code
} from 'lucide-react';
import { ProjectFile } from '../types';

export const VsCodeExplorerView: React.FC = () => {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [downloadingZip, setDownloadingZip] = useState(false);

  useEffect(() => {
    fetch('/api/project-files')
      .then((res) => res.json())
      .then((data) => {
        if (data.files && data.files.length > 0) {
          setFiles(data.files);
          const defaultApp = data.files.find((f: ProjectFile) => f.path === 'app.py') || data.files[0];
          setSelectedFile(defaultApp);
        }
      })
      .catch((err) => console.error('Failed to load project files:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleCopyCode = () => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = () => {
    setDownloadingZip(true);
    window.location.href = '/api/download-zip';
    setTimeout(() => setDownloadingZip(false), 2500);
  };

  const categories = ['All', 'Root', 'Pages', 'Utils', 'Database', 'Config', 'Assets'];
  const filteredFiles = activeCategory === 'All'
    ? files
    : files.filter((f) => f.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold mb-2">
            <Terminal className="w-3.5 h-3.5" />
            <span>Complete VS Code Source Code</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            VS Code Project Studio & Downloader
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Inspect, copy, or download the full production Python & Streamlit codebase with all 21 modular files, Supabase SQL schema, and requirements.
          </p>
        </div>

        {/* Primary Download ZIP Button */}
        <button
          onClick={handleDownloadZip}
          disabled={downloadingZip}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>{downloadingZip ? 'Packaging ZIP...' : 'Download Project (.ZIP)'}</span>
        </button>
      </div>

      {/* Main IDE Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden min-h-[650px]">
        {/* Left Sidebar: File Tree (4 Cols) */}
        <div className="lg:col-span-4 border-r border-slate-800 p-4 flex flex-col h-full bg-slate-900/60">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-slate-300 font-bold text-xs uppercase tracking-wider">
              <FolderTree className="w-4 h-4 text-blue-400" />
              <span>Project Files ({files.length})</span>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex overflow-x-auto gap-1 py-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Files List */}
          <div className="flex-1 overflow-y-auto space-y-1 pt-2 pr-1">
            {loading ? (
              <div className="text-xs text-slate-500 p-4 text-center">Loading project files...</div>
            ) : (
              filteredFiles.map((file) => (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono flex items-center justify-between transition-colors ${
                    selectedFile?.path === file.path
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                    <span className="truncate">{file.path}</span>
                  </div>
                  <span className="text-[10px] text-slate-600 font-sans">{file.category}</span>
                </button>
              ))
            )}
          </div>

          {/* Quick Terminal Guide */}
          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300">Run Locally in VS Code:</div>
            <code className="block bg-slate-950 p-2 rounded text-emerald-400 font-mono text-[10px]">
              pip install -r requirements.txt<br />
              streamlit run app.py
            </code>
          </div>
        </div>

        {/* Right Code Viewer (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col h-full bg-slate-950">
          {selectedFile ? (
            <>
              {/* Top bar with active file and copy */}
              <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-mono text-slate-300">
                  <Code className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold">{selectedFile.path}</span>
                </div>

                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy Code'}</span>
                </button>
              </div>

              {/* Code text content with line numbers */}
              <div className="flex-1 overflow-auto p-4 text-[12px] font-mono leading-relaxed text-slate-200 selection:bg-blue-600/30">
                <pre className="whitespace-pre">
                  {selectedFile.content.split('\n').map((line, i) => (
                    <div key={i} className="flex">
                      <span className="w-8 shrink-0 text-slate-600 text-right pr-4 select-none">
                        {i + 1}
                      </span>
                      <span className="text-slate-300">{line}</span>
                    </div>
                  ))}
                </pre>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              Select a file from the explorer on the left to view code.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
