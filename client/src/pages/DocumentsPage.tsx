import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { documentApi, chatApi } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { StatusBadge, TypeBadge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  UploadCloud,
  Search,
  Trash2,
  RefreshCw,
  MessageSquareText,
  AlertCircle,
} from 'lucide-react';
import { Document } from '../types/index';

export const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [customName, setCustomName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ['documents', { search, status: statusFilter === 'ALL' ? undefined : statusFilter }],
    queryFn: () =>
      documentApi.list({
        search: search || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      }),
    refetchInterval: (query) => {
      const hasProcessing = query.state.data?.some(
        (d) => d.status === 'PROCESSING' || d.status === 'UPLOADED'
      );
      return hasProcessing ? 2000 : false;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => documentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const reprocessMutation = useMutation({
    mutationFn: (id: string) => documentApi.reprocess(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      await documentApi.upload(uploadFile, customName || undefined);
      setIsUploadOpen(false);
      setUploadFile(null);
      setCustomName('');
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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">Documents</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Manage your indexed research papers, manuals, and documents.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setIsUploadOpen(true)}
          leftIcon={<UploadCloud className="w-4 h-4" />}
        >
          Upload Document
        </Button>
      </div>

      {/* Toolbar: Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface p-3 rounded-card border border-border">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Filter by document name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-3.5 h-3.5" />}
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'READY', 'PROCESSING', 'FAILED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-2.5 py-1 text-xs font-medium rounded-input transition-colors duration-fast ${
                statusFilter === status
                  ? 'bg-accent/10 text-accent font-semibold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
              }`}
            >
              {status === 'ALL' ? 'All Statuses' : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-surface rounded-card border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-text-muted">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <UploadCloud className="w-10 h-10 text-text-muted mb-3 stroke-[1.5]" />
            <h3 className="text-sm font-medium text-text-primary">No documents found</h3>
            <p className="text-xs text-text-muted max-w-sm mt-1 mb-4">
              Try adjusting your search query or upload a new PDF, DOCX, or TXT file.
            </p>
            <Button size="sm" onClick={() => setIsUploadOpen(true)}>
              Upload Document
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-elevated text-text-muted border-b border-border">
                <tr>
                  <th className="py-3 px-4 font-medium">Name</th>
                  <th className="py-3 px-4 font-medium">Type</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Chunks</th>
                  <th className="py-3 px-4 font-medium">Size</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-surface-elevated/50 transition-colors">
                    <td className="py-3 px-4 max-w-xs truncate">
                      <div className="font-medium text-text-primary truncate">{doc.name}</div>
                      <div className="text-[11px] text-text-muted truncate">{doc.originalName}</div>
                      {doc.errorMessage && (
                        <div className="flex items-center gap-1 text-[11px] text-status-error mt-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span className="truncate">{doc.errorMessage}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <TypeBadge type={doc.type} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="py-3 px-4 text-text-secondary">{doc.chunkCount || 0}</td>
                    <td className="py-3 px-4 text-text-muted">
                      {(parseInt(doc.sizeBytes, 10) / 1024).toFixed(1)} KB
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {doc.status === 'READY' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStartChat(doc)}
                            title="Chat with document"
                          >
                            <MessageSquareText className="w-3.5 h-3.5 text-accent" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => reprocessMutation.mutate(doc.id)}
                          title="Reprocess document"
                          disabled={reprocessMutation.isPending}
                        >
                          <RefreshCw
                            className={`w-3.5 h-3.5 text-text-muted hover:text-text-primary ${
                              doc.status === 'PROCESSING' ? 'animate-spin text-accent' : ''
                            }`}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (window.confirm(`Delete "${doc.name}"?`)) {
                              deleteMutation.mutate(doc.id);
                            }
                          }}
                          title="Delete document"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-text-muted hover:text-status-error" />
                        </Button>
                      </div>
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
        description="Upload PDF, Word (.docx), or plain text (.txt) files up to 20MB."
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          {uploadError && (
            <div className="p-3 rounded-input bg-red-500/10 border border-red-500/20 text-xs text-status-error">
              {uploadError}
            </div>
          )}

          <Input
            label="Document Title (Optional)"
            placeholder="e.g. Q3 Financial Report"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
          />

          <div className="border-2 border-dashed border-border hover:border-accent/50 rounded-card p-6 text-center transition-colors bg-surface-elevated/40">
            <input
              type="file"
              id="file-upload-dialog"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) setUploadFile(e.target.files[0]);
              }}
            />
            <label htmlFor="file-upload-dialog" className="cursor-pointer flex flex-col items-center">
              <UploadCloud className="w-8 h-8 text-accent mb-2" />
              <span className="text-xs font-medium text-text-primary">
                {uploadFile ? uploadFile.name : 'Click to select a file'}
              </span>
              <span className="text-[11px] text-text-muted mt-1">
                {uploadFile
                  ? `${(uploadFile.size / 1024 / 1024).toFixed(2)} MB`
                  : 'PDF, DOCX, or TXT'}
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
