# Knovexa — UI/UX Design System

## Direction
Premium technical productivity SaaS. Inspiration: Linear for density, Notion for document-oriented interaction, Vercel for restrained visual language.

Avoid purple gradients, excessive glassmorphism, giant marketing heroes, neon AI aesthetics and decorative blobs.

## Colors

Light:
- Background #FAFAF9
- Surface #FFFFFF
- Muted surface #F5F5F4
- Border #E7E5E4
- Primary text #171717
- Secondary text #57534E
- Muted text #78716C
- Accent #2563EB
- Success #16A34A
- Warning #D97706
- Error #DC2626

Dark:
- Background #0A0A0A
- Surface #111111
- Elevated #171717
- Border #262626
- Primary #FAFAFA
- Secondary #A3A3A3
- Muted #737373
- Accent #60A5FA

## Typography
Inter, fallback system-ui.
Page title 28px/600.
Section title 20px/600.
Card title 16px/600.
Body 14px/400.
Small 13px.
Caption 12px.

## Spacing
4px base: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.

## Radius
Buttons/inputs 6px; cards 8px; dialogs 10px; large containers 12px.

## Application shell
```text
┌─────────────────────────────────────────────────────────────┐
│ Knovexa                           Search    Help    Avatar   │
├──────────────┬──────────────────────────────────────────────┤
│ Dashboard    │                                              │
│ Documents    │                 Main Content                 │
│ Collections  │                                              │
│ Search       │                                              │
│ Settings     │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

Sidebar: 240px desktop, 64px collapsed.

## Dashboard
Use a compact workspace layout, not a marketing hero:
```text
Good morning
Your knowledge workspace
[ Upload document ]

Recent documents
Document             Status       Updated
Research.pdf         Ready        2m ago
Requirements.docx   Processing   5m ago
Notes.txt            Ready        1h ago
```

## Documents
Toolbar: search, filter, sort, upload. Prefer compact list rows over oversized cards.

## Chat
Desktop:
```text
┌───────────┬───────────────────────────┬────────────────────┐
│ Chats     │ Conversation              │ Sources            │
│ + New     │ User question             │ Research.pdf       │
│ Chat 1    │ Knovexa answer            │ Page 12            │
│ Chat 2    │                           │ Notes.docx          │
│           │ [Ask a question......]    │                    │
└───────────┴───────────────────────────┴────────────────────┘
```

## Citation
Show [1] references inline and open a source panel with document, page and excerpt.

## Components
Button, Input, Textarea, Select, Dropdown, Modal, Dialog, Tooltip, Toast, Badge, Avatar, Tabs, Breadcrumbs, DataTable, DocumentList, DocumentCard, UploadDropzone, ProcessingStatus, ChatMessage, Citation, SourcePanel, EmptyState, ErrorState, Skeleton, Pagination, CommandMenu.

## Accessibility
Keyboard navigation, visible focus, semantic HTML, accessible labels, WCAG AA contrast, no color-only status, Escape closes dialogs, focus trapping.

## Motion
150–200ms ease-out. Use motion for dialogs, upload progress, toasts and streaming only.
