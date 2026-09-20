import { ApiResponse } from '../types/index';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('knovexa_access_token');
  const headers = new Headers(options?.headers);

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options?.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = 'Request failed';
    try {
      const errorJson = await response.json();
      errorMessage = errorJson.error?.message || errorMessage;
    } catch {
      // Fallback to response status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const json: ApiResponse<T> = await response.json();
  return json.data;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<{ user: any; accessToken: string; refreshToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (name: string, email: string, password: string) =>
    apiRequest<{ user: any; accessToken: string; refreshToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
  me: () => apiRequest<any>('/me'),
  logout: () =>
    apiRequest<void>('/auth/logout', {
      method: 'POST',
    }),
};

export const documentApi = {
  list: (params?: { page?: number; pageSize?: number; status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.pageSize) query.set('pageSize', params.pageSize.toString());
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    return apiRequest<any[]>(`/documents?${query.toString()}`);
  },
  getById: (id: string) => apiRequest<any>(`/documents/${id}`),
  upload: (file: File, name?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (name) formData.append('name', name);
    return apiRequest<any>('/documents', {
      method: 'POST',
      body: formData,
    });
  },
  delete: (id: string) =>
    apiRequest<void>(`/documents/${id}`, {
      method: 'DELETE',
    }),
  reprocess: (id: string) =>
    apiRequest<{ id: string; status: string }>(`/documents/${id}/reprocess`, {
      method: 'POST',
    }),
};

export const collectionApi = {
  list: () => apiRequest<any[]>('/collections'),
  create: (name: string) =>
    apiRequest<any>('/collections', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),
  addDocument: (collectionId: string, documentId: string) =>
    apiRequest<void>(`/collections/${collectionId}/documents/${documentId}`, {
      method: 'POST',
    }),
  removeDocument: (collectionId: string, documentId: string) =>
    apiRequest<void>(`/collections/${collectionId}/documents/${documentId}`, {
      method: 'DELETE',
    }),
  delete: (id: string) =>
    apiRequest<void>(`/collections/${id}`, {
      method: 'DELETE',
    }),
};

export const chatApi = {
  listConversations: () => apiRequest<any[]>('/conversations'),
  getConversation: (id: string) => apiRequest<any>(`/conversations/${id}`),
  createConversation: (title: string, documentId?: string | null) =>
    apiRequest<any>('/conversations', {
      method: 'POST',
      body: JSON.stringify({ title, documentId }),
    }),
  deleteConversation: (id: string) =>
    apiRequest<void>(`/conversations/${id}`, {
      method: 'DELETE',
    }),
  askQuestion: (conversationId: string, question: string) =>
    apiRequest<{ userMessage: any; assistantMessage: any }>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ question }),
    }),
};

export const searchApi = {
  search: (query: string, documentIds?: string[], limit?: number) =>
    apiRequest<any[]>('/search', {
      method: 'POST',
      body: JSON.stringify({ query, documentIds, limit }),
    }),
};

export const healthApi = {
  check: () => apiRequest<any>('/health'),
};
