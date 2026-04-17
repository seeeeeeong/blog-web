# blog-web

Personal blog frontend built with React 19 + TypeScript + Vite + Tailwind CSS.
Consumes blog-api REST endpoints and renders a terminal-themed blog interface.

## Tech Stack

- React 19, TypeScript 5.9, Vite 7
- Tailwind CSS 3 (terminal-themed design system)
- TipTap (WYSIWYG editor), Marked/Turndown (Markdown conversion)
- Axios (HTTP client with JWT interceptors)
- Vercel (deployment)

---

## Package Structure (Non-Negotiable)

```
src/
├── core/
│   ├── api/
│   │   ├── components/       # UI components
│   │   │   ├── common/       # Layout, Spinner, Alert, TerminalDots, PaginationControls, CatTag
│   │   │   ├── comment/      # CommentForm, CommentItem, CommentSection
│   │   │   ├── editor/       # TipTapEditor, EditorToolbar, EditorLinkInput, EditorTableControls, MenuButton, MarkdownViewer
│   │   │   └── post/         # SimilarArticles
│   │   └── pages/            # Page-level components (equivalent to controllers)
│   ├── domain/
│   │   └── {context}/        # Type definitions per domain (post, comment, user, category, image, similar)
│   └── support/
│       ├── auth/             # JWT parsing, clearAuthData, checkIsAdmin
│       ├── constants/        # All app constants (PAGINATION, POST_LIMITS, COMMENT_LIMITS, IMAGE_UPLOAD, ALERT_DURATION, TABLE_DEFAULTS)
│       ├── contexts/         # React Context (AlertContext, AlertProvider, useAlert)
│       ├── converter/        # formatDate, formatRelativeDate, calculateWordCount, stripMarkdownSyntax
│       ├── error/            # extractApiErrorMessage
│       └── hooks/            # useTheme, useIsAdmin, usePostForm, useComments
└── storage/
    ├── common/               # Axios client instance with interceptors
    └── {context}/            # API modules per domain (postApi, commentApi, authApi, categoryApi, imageApi, similarApi)
```

**Layer rules:**
- Pages may import from `storage/`, `core/domain/`, `core/support/`, and sibling components
- Components may import from `core/domain/`, `core/support/`, and `storage/`
- `storage/` may import from `core/domain/` and `core/support/` — never from `core/api/`
- `core/domain/` contains only type definitions — no logic, no imports from other layers
- `core/support/` is for cross-cutting utilities — no UI, no API calls (except via hooks that compose them)
- Never import directly between unrelated domain contexts in `storage/`

---

## Coding Conventions

### Naming

| Target | Rule | Example |
|--------|------|---------|
| Page component | `{Entity}{Action}Page` | `PostCreatePage`, `AdminPostsPage` |
| UI component | PascalCase noun | `CommentForm`, `EditorToolbar` |
| Custom hook | `use{Noun}` | `usePostForm`, `useComments`, `useIsAdmin` |
| API module | `{context}Api` | `postApi`, `commentApi` |
| Domain type | PascalCase interface | `Post`, `PostCreateRequest` |
| Constants | UPPER_SNAKE_CASE | `PAGINATION.POSTS_PER_PAGE` |
| Utility function | camelCase verb | `formatDate`, `extractApiErrorMessage` |

### Style Rules

- Functional components only — no class components
- Extract custom hooks when logic is reused across 2+ components
- Extract shared UI when identical markup appears in 2+ places
- No magic numbers — use constants from `core/support/constants/`
- Keep components under 200 lines — extract sub-components if longer
- Use `type` imports for TypeScript types (`import type { Post }`)
- Guard clauses over nested conditionals
- No inline styles — use Tailwind classes exclusively

### API Response Handling

All API responses are unwrapped from the `ApiResponse<T>` envelope by the Axios response interceptor in `storage/common/client.ts`:

```typescript
// Interceptor automatically extracts data from { result: "SUCCESS", data: T }
// API modules receive unwrapped data directly:
const response = await apiClient.get<Post>(`/v1/posts/${postId}`);
return response.data; // Already unwrapped Post, not ApiResponse<Post>
```

### Domain Type Pattern

Types are split by domain context, mirroring blog-api's domain model:

```typescript
// core/domain/post/index.ts
export interface Post extends PostSummary {
  content: string;
  contentHtml: string;
}

export interface PostCreateRequest {
  categoryId: number;
  title: string;
  content: string;
  isDraft?: boolean;
}
```

### Custom Hook Pattern

Extract shared state + effects into hooks, keeping components focused on UI:

```typescript
// core/support/hooks/usePostForm.ts
export function usePostForm(options?: UsePostFormOptions) {
  // categories, form state, validation, word count
  return { categories, categoryId, title, content, validateForm, ... };
}

// Usage in page:
const { title, setTitle, validateForm } = usePostForm();
```

---

## Component Architecture

### Pages (≈ Controllers)

Pages are entry points that compose hooks + components. They handle:
- Route params and navigation
- Data fetching coordination
- Top-level error/loading states

### Components

Components are reusable UI units. They:
- Accept typed props
- Manage only local UI state (show/hide, form inputs)
- Delegate business logic to hooks or callbacks

### Shared Components in `common/`

| Component | Purpose |
|-----------|---------|
| `Layout` | App shell with navigation, auth state, theme toggle |
| `Spinner` | Loading indicator |
| `Alert` | Toast notification with confirm dialog variant |
| `TerminalDots` | macOS traffic light dots (terminal chrome) |
| `PaginationControls` | Prev/next pagination with item count |
| `CatTag` | Colored category tag badge |

---

## Authentication

- JWT tokens stored in `localStorage` (accessToken, refreshToken, userId)
- `storage/common/client.ts` interceptor auto-attaches Bearer token
- 401 responses trigger automatic token refresh with request queuing
- `checkIsAdmin()` / `useIsAdmin()` for admin state checks
- `clearAuthData()` centralized in `core/support/auth/authToken.ts`
- Public endpoints bypass auth header attachment (pattern-matched in interceptor)

---

## Constants

All magic numbers live in `core/support/constants/index.ts`:

```typescript
PAGINATION     // POSTS_PER_PAGE, ADMIN_POSTS_PER_PAGE
POST_LIMITS    // TITLE_MAX_LENGTH
COMMENT_LIMITS // NICKNAME_MAX_LENGTH, PASSWORD_MAX_LENGTH, CONTENT_MAX_LENGTH
IMAGE_UPLOAD   // MAX_SIZE_MB, MAX_WIDTH_OR_HEIGHT
ALERT_DURATION // SUCCESS, ERROR, WARNING, INFO
TABLE_DEFAULTS // ROWS, COLS, MAX, MIN
```

---

## Verification Checklist

After any code change:

1. `npm run build` — TypeScript check + Vite build passes
2. No new magic numbers — add to constants
3. No duplicated logic — extract hook or utility
4. New domain type → add to correct `core/domain/{context}/`
5. New API endpoint → add to correct `storage/{context}/`
6. New shared UI pattern → extract to `core/api/components/common/`

---

## What NOT To Do

- Import `storage/` from `core/domain/`
- Put business logic in components (use hooks)
- Use class components or HOCs
- Hardcode numbers or strings that may change
- Duplicate code across pages (extract hooks/components)
- Skip TypeScript types with `any`
- Create new top-level directories outside `core/` and `storage/`
- Access `localStorage` directly in components (use `core/support/auth/` utilities)
- Commit without verifying `npm run build` passes
