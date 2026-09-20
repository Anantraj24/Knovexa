import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { searchApi, chatApi } from '../services/api';
import { Button } from '../components/ui/Button';
import { Search, FileText, MessageSquareText, Sparkles } from 'lucide-react';
import { SearchResult } from '../types/index';

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  const searchMutation = useMutation({
    mutationFn: (searchQuery: string) => searchApi.search(searchQuery),
    onSuccess: (data) => {
      setResults(data);
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || searchMutation.isPending) return;
    searchMutation.mutate(query.trim());
  };

  const handleChatWithDoc = async (documentId: string, documentName: string) => {
    try {
      const conv = await chatApi.createConversation(`Discussion: ${documentName}`, documentId);
      navigate(`/chat?id=${conv.id}`);
    } catch {
      navigate('/chat');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-text-primary">Semantic Search</h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Natural-language semantic retrieval across all your indexed documents using vector embeddings.
        </p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="e.g. What are the deployment requirements and port numbers?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-surface text-text-primary placeholder:text-text-muted text-sm rounded-input border border-border pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent shadow-xs"
          />
        </div>
        <Button
          type="submit"
          isLoading={searchMutation.isPending}
          disabled={!query.trim()}
          leftIcon={<Sparkles className="w-4 h-4" />}
        >
          Search
        </Button>
      </form>

      {/* Search Results List */}
      <div className="space-y-3">
        {searchMutation.isPending ? (
          <div className="p-12 text-center text-xs text-text-muted">
            Executing vector similarity search...
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-3">
            <div className="text-xs text-text-muted px-1">
              Found {results.length} relevant passages matching "{query}"
            </div>
            {results.map((res) => (
              <div
                key={res.chunkId}
                className="bg-surface rounded-card border border-border p-4 hover:border-accent/40 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-accent" />
                    <span className="text-xs font-semibold text-text-primary">
                      {res.documentName}
                    </span>
                    {res.pageNumber && (
                      <span className="text-[10px] text-text-muted bg-surface-elevated px-1.5 py-0.5 rounded border border-border">
                        Page {res.pageNumber}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-accent font-medium">
                      {(res.score * 100).toFixed(1)}% match
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleChatWithDoc(res.documentId, res.documentName)}
                      leftIcon={<MessageSquareText className="w-3.5 h-3.5" />}
                    >
                      Chat
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed bg-surface-elevated/40 p-3 rounded-input border border-border/50 font-mono">
                  "{res.excerpt}"
                </p>
              </div>
            ))}
          </div>
        ) : searchMutation.isSuccess ? (
          <div className="p-12 text-center text-xs text-text-muted bg-surface rounded-card border border-border">
            No matching chunks found above the relevance threshold. Try broadening your query.
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-text-muted bg-surface rounded-card border border-border">
            Type a query or question above to perform grounded vector search.
          </div>
        )}
      </div>
    </div>
  );
};
