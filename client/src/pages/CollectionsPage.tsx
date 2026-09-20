import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collectionApi } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { FolderKanban, Plus, Trash2, Folder } from 'lucide-react';
import { Collection } from '../types/index';

export const CollectionsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  const { data: collections = [], isLoading } = useQuery<Collection[]>({
    queryKey: ['collections'],
    queryFn: collectionApi.list,
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => collectionApi.create(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      setIsCreateOpen(false);
      setNewCollectionName('');
      setCreateError(null);
    },
    onError: (err: Error) => {
      setCreateError(err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => collectionApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">Collections</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Organize your documents into thematic collections for targeted retrieval.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New Collection
        </Button>
      </div>

      {/* Collections Grid */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-text-muted">Loading collections...</div>
      ) : collections.length === 0 ? (
        <div className="bg-surface rounded-card border border-border p-12 text-center flex flex-col items-center">
          <FolderKanban className="w-10 h-10 text-text-muted mb-3 stroke-[1.5]" />
          <h3 className="text-sm font-medium text-text-primary">No collections yet</h3>
          <p className="text-xs text-text-muted max-w-sm mt-1 mb-4">
            Group related documents like research projects, policies, or product specs.
          </p>
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            Create Collection
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {collections.map((col) => (
            <div
              key={col.id}
              className="bg-surface rounded-card border border-border p-4 hover:border-accent/40 transition-colors flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-8 h-8 rounded-input bg-accent/10 text-accent flex items-center justify-center">
                  <Folder className="w-4 h-4" />
                </div>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete collection "${col.name}"?`)) {
                      deleteMutation.mutate(col.id);
                    }
                  }}
                  className="text-text-muted hover:text-status-error p-1 rounded-input"
                  title="Delete collection"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-text-primary truncate">{col.name}</h3>
                <span className="text-xs text-text-muted mt-1 block">
                  {col.documentCount || 0} documents assigned
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Collection"
        description="Collections allow scoped search and specialized RAG reasoning."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!newCollectionName.trim()) return;
            createMutation.mutate(newCollectionName.trim());
          }}
          className="space-y-4"
        >
          {createError && (
            <div className="p-3 rounded-input bg-red-500/10 border border-red-500/20 text-xs text-status-error">
              {createError}
            </div>
          )}

          <Input
            label="Collection Name"
            placeholder="e.g. Q4 Financials & Tax Filings"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              type="submit"
              isLoading={createMutation.isPending}
              disabled={!newCollectionName.trim()}
            >
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
