import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { chatApi, documentApi } from '../services/api';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import {
  MessageSquareText,
  Plus,
  Send,
  FileText,
  Trash2,
  Sparkles,
  BookOpen,
  X,
} from 'lucide-react';
import { Conversation, Message, CitationItem, Document } from '../types/index';

export const ChatPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeConversationId = searchParams.get('id');
  const queryClient = useQueryClient();

  const [inputQuestion, setInputQuestion] = useState('');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [selectedCitation, setSelectedCitation] = useState<CitationItem | null>(null);
  const [isSourcePanelOpen, setIsSourcePanelOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Conversations
  const { data: conversations = [], isLoading: isConversationsLoading } = useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: chatApi.listConversations,
  });

  // 2. Fetch Available Documents for New Chat Dropdown
  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ['documents', { status: 'READY' }],
    queryFn: () => documentApi.list({ status: 'READY' }),
  });

  // Auto-select first conversation if none selected in URL
  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      setSearchParams({ id: conversations[0].id });
    }
  }, [activeConversationId, conversations, setSearchParams]);

  // 3. Fetch Active Conversation Messages
  const { data: activeConversation, isLoading: isChatLoading } = useQuery<Conversation>({
    queryKey: ['conversation', activeConversationId],
    queryFn: () => chatApi.getConversation(activeConversationId!),
    enabled: !!activeConversationId,
  });

  // Auto scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  // 4. Ask Question Mutation
  const askMutation = useMutation({
    mutationFn: ({ conversationId, question }: { conversationId: string; question: string }) =>
      chatApi.askQuestion(conversationId, question),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['conversation', activeConversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      // If assistant answer has citations, auto-select first citation
      if (data.assistantMessage?.citations?.length > 0) {
        setSelectedCitation(data.assistantMessage.citations[0]);
        setIsSourcePanelOpen(true);
      }
    },
  });

  // 5. Create Conversation Mutation
  const createChatMutation = useMutation({
    mutationFn: ({ title, documentId }: { title: string; documentId?: string | null }) =>
      chatApi.createConversation(title, documentId),
    onSuccess: (newConv) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setIsNewChatModalOpen(false);
      setNewChatTitle('');
      setSelectedDocId('');
      setSearchParams({ id: newConv.id });
    },
  });

  // 6. Delete Conversation Mutation
  const deleteChatMutation = useMutation({
    mutationFn: (id: string) => chatApi.deleteConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setSearchParams({});
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuestion.trim() || !activeConversationId || askMutation.isPending) return;

    const question = inputQuestion.trim();
    setInputQuestion('');
    askMutation.mutate({ conversationId: activeConversationId, question });
  };

  const handleCitationClick = (citation: CitationItem) => {
    setSelectedCitation(citation);
    setIsSourcePanelOpen(true);
  };

  // Helper to render text with clickable [1] citations
  const renderMessageContent = (content: string, citations?: CitationItem[]) => {
    if (!citations || citations.length === 0) {
      return <p className="whitespace-pre-wrap leading-relaxed">{content}</p>;
    }

    // Split text by citation markers like [1], [2]
    const parts = content.split(/(\[\d+\])/g);

    return (
      <p className="whitespace-pre-wrap leading-relaxed">
        {parts.map((part, i) => {
          const match = part.match(/\[(\d+)\]/);
          if (match) {
            const pos = parseInt(match[1], 10);
            const citation = citations.find((c) => c.position === pos);
            return (
              <button
                key={i}
                onClick={() => citation && handleCitationClick(citation)}
                className="inline-flex items-center justify-center mx-1 px-1.5 py-0.2 rounded bg-accent/15 hover:bg-accent hover:text-white text-accent font-semibold text-xs border border-accent/30 transition-colors cursor-pointer select-none"
                title={citation ? `View source chunk: ${citation.documentName}` : 'Citation source'}
              >
                [{pos}]
              </button>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </p>
    );
  };

  return (
    <div className="h-[calc(100vh-6.5rem)] flex bg-surface rounded-card border border-border overflow-hidden">
      {/* COLUMN 1: Conversations Sidebar */}
      <div className="w-64 border-r border-border flex flex-col bg-surface shrink-0">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
            <MessageSquareText className="w-4 h-4 text-accent" />
            <span>Discussions</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsNewChatModalOpen(true)}
            title="New Conversation"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isConversationsLoading ? (
            <div className="p-4 text-center text-xs text-text-muted">Loading chats...</div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-text-muted">
              No conversations yet. Start a new chat to query documents.
            </div>
          ) : (
            conversations.map((c) => {
              const isActive = c.id === activeConversationId;
              return (
                <div
                  key={c.id}
                  onClick={() => setSearchParams({ id: c.id })}
                  className={`group flex items-center justify-between p-2.5 rounded-input text-xs cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-accent/10 text-accent font-semibold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                  }`}
                >
                  <div className="flex flex-col truncate pr-2">
                    <span className="truncate">{c.title}</span>
                    {c.document && (
                      <span className="text-[10px] text-text-muted truncate mt-0.5">
                        📄 {c.document.name}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Delete this conversation?')) {
                        deleteChatMutation.mutate(c.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-status-error transition-opacity"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* COLUMN 2: Main Active Chat Stream */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        {/* Chat Thread Header */}
        <div className="h-12 border-b border-border bg-surface px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 truncate">
            <span className="text-xs font-semibold text-text-primary truncate">
              {activeConversation?.title || 'Knovexa RAG Chat'}
            </span>
            {activeConversation?.document && (
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-surface-elevated border border-border text-text-muted">
                <FileText className="w-3 h-3 text-accent" />
                {activeConversation.document.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeConversation?.messages && (
              <span className="text-[11px] text-text-muted font-mono">
                {activeConversation.messages.length} messages
              </span>
            )}
            <button
              onClick={() => setIsSourcePanelOpen(!isSourcePanelOpen)}
              className={`p-1.5 rounded-input border transition-colors ${
                isSourcePanelOpen
                  ? 'bg-accent/10 border-accent/30 text-accent'
                  : 'bg-surface border-border text-text-muted hover:text-text-primary'
              }`}
              title="Toggle Sources Inspector"
            >
              <BookOpen className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isChatLoading ? (
            <div className="flex items-center justify-center h-full text-xs text-text-muted">
              Loading conversation...
            </div>
          ) : !activeConversation || activeConversation.messages?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto p-6">
              <div className="w-10 h-10 rounded-container bg-accent/10 text-accent flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary">Grounded Document Q&A</h3>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Ask questions about your uploaded documents. Knovexa will retrieve the most relevant
                passages and generate answers strictly grounded in verified facts with citations.
              </p>
            </div>
          ) : (
            activeConversation.messages?.map((msg: Message) => {
              const isUser = msg.role === 'USER';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/30 text-accent flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                      K
                    </div>
                  )}

                  <div
                    className={`max-w-xl rounded-card p-3.5 border ${
                      isUser
                        ? 'bg-accent text-white border-accent'
                        : 'bg-surface text-text-primary border-border shadow-xs'
                    }`}
                  >
                    {renderMessageContent(msg.content, msg.citations)}
                  </div>
                </div>
              );
            })
          )}

          {askMutation.isPending && (
            <div className="flex gap-3 text-xs justify-start items-center text-text-muted animate-pulse">
              <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/30 text-accent flex items-center justify-center font-bold text-[11px] shrink-0">
                K
              </div>
              <span>Searching vector index and formulating grounded response...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Composer */}
        <div className="p-3 bg-surface border-t border-border">
          <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
            <input
              type="text"
              placeholder={
                activeConversation
                  ? 'Ask a question grounded in your documents...'
                  : 'Select or create a conversation first...'
              }
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              disabled={!activeConversation || askMutation.isPending}
              className="flex-1 bg-surface-elevated text-text-primary placeholder:text-text-muted text-xs rounded-input border border-border px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent disabled:opacity-50"
            />
            <Button
              size="sm"
              type="submit"
              disabled={!inputQuestion.trim() || !activeConversation || askMutation.isPending}
              isLoading={askMutation.isPending}
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      </div>

      {/* COLUMN 3: Sources / Citation Inspector Panel */}
      {isSourcePanelOpen && (
        <div className="w-80 border-l border-border bg-surface flex flex-col shrink-0 animate-in slide-in-from-right-10 duration-fast">
          <div className="h-12 border-b border-border px-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
              <BookOpen className="w-4 h-4 text-accent" />
              <span>Source Citations</span>
            </div>
            <button
              onClick={() => setIsSourcePanelOpen(false)}
              className="text-text-muted hover:text-text-primary p-1 rounded-input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {selectedCitation ? (
              <div className="space-y-3">
                <div className="bg-surface-elevated rounded-input p-3 border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-accent">
                      Citation [{selectedCitation.position}]
                    </span>
                    {selectedCitation.pageNumber && (
                      <span className="text-[10px] text-text-muted">
                        Page {selectedCitation.pageNumber}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-medium text-text-primary flex items-center gap-1.5 mb-2">
                    <FileText className="w-3.5 h-3.5 text-text-muted" />
                    <span className="truncate">{selectedCitation.documentName}</span>
                  </div>
                  <div className="p-2.5 rounded bg-surface border border-border text-[11px] text-text-secondary leading-relaxed font-mono whitespace-pre-wrap">
                    "{selectedCitation.contentExcerpt}"
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-xs text-text-muted py-8">
                Click any numeric citation badge like [1] inside an answer to inspect its verified
                source text.
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Conversation Modal */}
      <Modal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        title="Start New Discussion"
        description="Select a document to ground your chat, or leave blank to query all owned documents."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!newChatTitle.trim()) return;
            createChatMutation.mutate({
              title: newChatTitle.trim(),
              documentId: selectedDocId || null,
            });
          }}
          className="space-y-4"
        >
          <Input
            label="Conversation Title"
            placeholder="e.g. Architecture and Deployment Analysis"
            value={newChatTitle}
            onChange={(e) => setNewChatTitle(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Target Document Scope
            </label>
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="w-full bg-surface-elevated text-text-primary text-xs rounded-input border border-border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
            >
              <option value="">All Uploaded Documents (Global Knowledge)</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.type})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsNewChatModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              type="submit"
              isLoading={createChatMutation.isPending}
              disabled={!newChatTitle.trim()}
            >
              Create Chat
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
