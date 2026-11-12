import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  BookOpen,
  FileText,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Database,
  Layers,
  Search,
  ExternalLink
} from 'lucide-react';
import {
  uploadDocument,
  getDocuments,
  deleteDocument,
  type IngestedDocument,
} from '../services/documentService';

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  useKnowledgeBase: boolean;
  onToggleKnowledgeBase: (enabled: boolean) => void;
}

export const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({
  isOpen,
  onClose,
  useKnowledgeBase,
  onToggleKnowledgeBase,
}) => {
  const [documents, setDocuments] = useState<IngestedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadDocs();
    }
  }, [isOpen]);

  const loadDocs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await getDocuments();
      setDocuments(list);
    } catch (err: any) {
      setError('Could not load ingested documents.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const doc = await uploadDocument(file);
      setDocuments((prev) => [doc, ...prev]);
      setSuccessMsg(`Successfully ingested "${file.name}" (${doc.totalChunks} searchable chunks).`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to ingest document.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (docId: string, title: string) => {
    if (window.confirm(`Permanently remove "${title}" from the knowledge base?`)) {
      const ok = await deleteDocument(docId);
      if (ok) {
        setDocuments((prev) => prev.filter((d) => d.docId !== docId));
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-light-border dark:border-dark-border bg-light-sidebar dark:bg-dark-sidebar">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-space font-bold text-sm">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-space font-bold text-lg text-black dark:text-white uppercase tracking-tight">
                Knowledge & Book Ingestion
              </h2>
              <p className="text-[11px] font-mono text-light-muted dark:text-dark-muted">
                Vector retrieval pipeline • RAG integration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-light-muted dark:text-dark-muted hover:text-black dark:hover:text-white hover:bg-mono-200 dark:hover:bg-mono-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Active Knowledge Search Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-light-border dark:border-dark-border bg-light-input dark:bg-dark-input">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-black dark:text-white" />
              <div>
                <div className="font-space font-semibold text-xs text-black dark:text-white uppercase">
                  Augment Chat with Uploaded Books
                </div>
                <div className="text-[11px] text-light-muted dark:text-dark-muted">
                  Automatically retrieve relevant book excerpts for user questions
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onToggleKnowledgeBase(!useKnowledgeBase)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider border transition-colors ${
                useKnowledgeBase
                  ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black font-semibold'
                  : 'border-light-border dark:border-dark-border bg-transparent text-light-muted dark:text-dark-muted'
              }`}
            >
              {useKnowledgeBase ? 'Active' : 'Disabled'}
            </button>
          </div>

          {/* Upload Area */}
          <div className="p-6 rounded-2xl border-2 border-dashed border-light-border dark:border-dark-border text-center hover:border-black dark:hover:border-white transition-colors bg-light-bg/50 dark:bg-dark-bg/50">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.txt,.docx,.md"
              className="hidden"
            />
            <Upload className="w-8 h-8 mx-auto mb-2 text-light-muted dark:text-dark-muted" />
            <h3 className="font-space font-semibold text-sm text-black dark:text-white uppercase mb-1">
              {isUploading ? 'Ingesting & Chunking Document...' : 'Upload Books, Notes or Study Material'}
            </h3>
            <p className="text-xs text-light-muted dark:text-dark-muted font-inter max-w-sm mx-auto mb-4">
              Supported formats: **PDF, DOCX, TXT, Markdown**. The text will be parsed, split into semantic chunks, and indexed for sub-second retrieval.
            </p>
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider bg-light-btn text-light-btnText dark:bg-dark-btn dark:text-dark-btnText hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <span>{isUploading ? 'Processing File...' : 'Select File from Device'}</span>
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl border border-light-border dark:border-dark-border bg-light-input dark:bg-dark-input text-xs text-light-text dark:text-dark-text">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl border border-light-border dark:border-dark-border bg-light-sidebar dark:bg-dark-sidebar text-xs text-black dark:text-white font-medium">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Ingested Document List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-widest text-light-muted dark:text-dark-muted">
                Indexed Library ({documents.length} items)
              </span>
            </div>

            {documents.length === 0 ? (
              <div className="text-center py-8 border border-light-border dark:border-dark-border rounded-xl text-xs text-light-muted dark:text-dark-muted">
                No documents currently ingested. Upload a PDF or book above to enable knowledge retrieval.
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.docId}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-light-border dark:border-dark-border bg-light-input dark:bg-dark-input hover:border-black dark:hover:border-white transition-colors"
                  >
                    <div className="flex items-center gap-3 overflow-hidden mr-3">
                      <FileText className="w-4 h-4 flex-shrink-0 text-light-muted dark:text-dark-muted" />
                      <div className="truncate">
                        <div className="font-space font-medium text-xs text-black dark:text-white truncate">
                          {doc.title}
                        </div>
                        <div className="text-[10px] font-mono text-light-muted dark:text-dark-muted flex items-center gap-2 mt-0.5">
                          <span>{(doc.fileSize / 1024).toFixed(1)} KB</span>
                          <span>•</span>
                          <span>{doc.totalChunks} Chunks</span>
                          <span>•</span>
                          <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(doc.docId, doc.title)}
                      className="p-1.5 rounded-lg text-light-muted dark:text-dark-muted hover:text-black dark:hover:text-white hover:bg-mono-200 dark:hover:bg-mono-800 transition-colors"
                      title="Delete from knowledge base"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-light-border dark:border-dark-border bg-light-sidebar dark:bg-dark-sidebar flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider bg-light-btn text-light-btnText dark:bg-dark-btn dark:text-dark-btnText hover:opacity-90"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

