# Knovexa — Frontend Architecture

## Stack
React, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, React Hook Form, Zod.

## Folder structure
```text
client/src/
├── app/
│   ├── App.tsx
│   ├── router.tsx
│   └── providers.tsx
├── components/
│   ├── ui/
│   ├── layout/
│   ├── documents/
│   ├── chat/
│   └── search/
├── features/
│   ├── auth/
│   ├── documents/
│   ├── collections/
│   ├── chat/
│   └── search/
├── hooks/
├── lib/
├── services/
├── types/
└── pages/
```

## Routes
Public: `/login`, `/register`.
Protected: `/dashboard`, `/documents`, `/documents/:id`, `/collections`, `/search`, `/chat/:conversationId`, `/settings`.

## State
TanStack Query for server state. React state for local UI state. Avoid a global store unless a concrete cross-feature requirement appears.

## API client
```ts
export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message ?? "Request failed");
  }
  return response.json();
}
```

## Upload flow
Select → local validation → multipart POST → receive ID → invalidate query → poll status → show READY.

## Chat
```text
ChatPage
├── ConversationSidebar
├── ChatHeader
├── MessageList
│   └── ChatMessage
│       └── Citation
├── SourcePanel
└── ChatComposer
```

## Performance
Lazy-load major routes, paginate documents, avoid unnecessary renders, virtualize long chat histories when needed, and never load entire document contents into the browser unnecessarily.

## Definition of done
All routes work, protected routes enforce auth, loading/empty/error states exist, responsive design works, keyboard navigation works and business logic stays outside presentation components.
