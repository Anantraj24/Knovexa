import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { documentApi, chatApi } from '../services/api';
import { Button } from '../components/ui/Button';
import { StatusBadge, TypeBadge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  UploadCloud,
  FileText,
  MessageSquareText,
  Layers,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import { Document } from '../types/index';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Fetch recent documents with polling for active processing states
  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ['documents', { pageSize: 5 }],
    queryFn: () => documentApi.list({ pageSize: 5 }),
    refetchInterval: (query) => {
      const hasProcessing = query.state.data?.some(
        (d) => d.status === 'PROCESSING' || d.status === 'UPLOADED'
      );
      return hasProcessing ? 2500 : false;
    },
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: chatApi.listConversations,
  });

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      await documentApi.upload(uploadFile);
      setIsUploadOpen(false);
      setUploadFile(null);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartChat = async (doc: Document) => {
    try {
      const conversation = await chatApi.createConversation(`Discussion: ${doc.name}`, doc.id);
      navigate(`/chat?id=${conversation.id}`);
    } catch {
      navigate('/chat');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Welcome back, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Your centralized document intelligence and citation-grounded RAG workspace.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['documents'] })}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsUploadOpen(true)}
            leftIcon={<UploadCloud className="w-4 h-4" />}
          >
            Upload Document
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface rounded-card border border-border p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-input bg-accent/10 text-accent flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-text-muted">Total Documents</span>
            <div className="text-xl font-semibold text-text-primary">{documents.length}</div>
          </div>
        </div>

        <div className="bg-surface rounded-card border border-border p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-input bg-green-500/10 text-green-500 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-text-muted">Indexed Chunks</span>
            <div className="text-xl font-semibold text-text-primary">
              {documents.reduce((acc, d) => acc + (d.chunkCount || 0), 0)}
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-card border border-border p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-input bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <MessageSquareText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-text-muted">Active Conversations</span>
            <div className="text-xl font-semibold text-text-primary">{conversations.length}</div>
          </div>
        </div>
      </div>

      {/* Recent Documents Section */}
      <div className="bg-surface rounded-card border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold text-text-primary">Recent Documents</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/documents')}
            rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
          >
            View all
          </Button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-text-muted">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <UploadCloud className="w-10 h-10 text-text-muted mb-3 stroke-[1.5]" />
            <h3 className="text-sm font-medium text-text-primary">No documents uploaded yet</h3>
            <p className="text-xs text-text-muted max-w-sm mt-1 mb-4">
              Upload PDF, DOCX, or TXT files to start extracting intelligence, semantic searching, and running RAG.
            </p>
            <Button size="sm" onClick={() => setIsUploadOpen(true)}>
              Upload your first document
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-elevated text-text-muted border-b border-border">
                <tr>
                  <th className="py-3 px-4 font-medium">Document</th>
                  <th className="py-3 px-4 font-medium">Type</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Chunks</th>
                  <th className="py-3 px-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-surface-elevated/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-text-primary">{doc.name}</div>
                      <div className="text-[11px] text-text-muted">{doc.originalName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <TypeBadge type={doc.type} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="py-3 px-4 text-text-secondary">{doc.chunkCount || 0}</td>
                    <td className="py-3 px-4 text-right">
                      {doc.status === 'READY' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartChat(doc)}
                          leftIcon={<MessageSquareText className="w-3.5 h-3.5" />}
                        >
                          Chat
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload Document"
        description="Supported formats: PDF, DOCX, TXT up to 20MB."
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          {uploadError && (
            <div className="p-3 rounded-input bg-red-500/10 border border-red-500/20 text-xs text-status-error">
              {uploadError}
            </div>
          )}

          <div className="border-2 border-dashed border-border hover:border-accent/50 rounded-card p-6 text-center transition-colors bg-surface-elevated/40">
            <input
              type="file"
              id="file-upload"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) setUploadFile(e.target.files[0]);
              }}
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
              <UploadCloud className="w-8 h-8 text-accent mb-2" />
              <span className="text-xs font-medium text-text-primary">
                {uploadFile ? uploadFile.name : 'Click to select a file'}
              </span>
              <span className="text-[11px] text-text-muted mt-1">
                {uploadFile
                  ? `${(uploadFile.size / 1024 / 1024).toFixed(2)} MB`
                  : 'PDF, Word, or plain text'}
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsUploadOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isUploading} disabled={!uploadFile}>
              Upload & Process
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
