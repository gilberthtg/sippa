# SIPPA Architecture

## Proposed application architecture
- Next.js App Router
- TypeScript
- Server Components by default; Client Components only where interaction requires them
- Route Handlers / Server Actions for application APIs and mutations as appropriate
- ORM: Drizzle ORM
- MySQL via mysql2
- Form validation: Zod
- Form state: React Hook Form
- UI: Tailwind CSS 4 + shadcn/ui (base-ui primitives)

## High-level layers
1. UI / route layer
2. Application use-cases / services
3. Domain validation and business rules
4. Data access / repository layer
5. MySQL
6. File storage / notifications (integration points)

## Principles
- Role-based authorization is enforced server-side; hiding a button is not authorization.
- Validate every mutation on the server.
- Keep request workflow transitions explicit and auditable.
- Keep reporting queries separated from transactional mutations where useful.
- Prefer reusable domain components over duplicated page-specific logic.

## Main feature modules
- auth
- dashboard
- requests
- assignments
- progress
- reports
- sla
- users/roles
- audit
- attachments
- notifications

## Component Architecture

### Directory Structure
```
components/
  ui/                    # shadcn/ui primitives (base-ui components)
    button.tsx
    input.tsx
    card.tsx
    dialog.tsx
    dropdown-menu.tsx
    avatar.tsx
    breadcrumb.tsx
    skeleton.tsx
    alert.tsx
    separator.tsx
    popover.tsx
    scroll-area.tsx
    badge.tsx
    label.tsx
    select.tsx
    table.tsx
    tabs.tsx
    textarea.tsx
    toast.tsx
    
  layout/               # Application shell components
    app-shell.tsx       # Main layout wrapper with sidebar + topnav
    top-nav.tsx         # Top navigation bar
    sidebar.tsx         # Desktop sidebar navigation
    mobile-nav.tsx      # Mobile drawer navigation
    user-menu.tsx       # User dropdown menu with logout
    page-header.tsx     # Page title and action bar
    page-container.tsx  # Standard page wrapper with padding
    
  shared/               # Application-wide reusable components
    empty-state.tsx     # No data placeholder
    error-state.tsx     # Error display with retry
    loading-state.tsx   # Loading spinner with message
    confirm-dialog.tsx  # Confirmation modal for destructive actions
    
  requests/             # Domain-specific components
    status-badge.tsx
    priority-badge.tsx
    sla-badge.tsx
```

### Component Principles
- **UI primitives** are unchanged from shadcn/ui, use base-ui React primitives
- **Layout components** handle application shell and navigation
- **Shared components** are domain-agnostic, reusable across features
- **Feature components** are specific to business domains (requests, reports, etc.)

### State Management
- Server state: React Server Components (default)
- Client state: React hooks (useState, useReducer)
- Forms: React Hook Form + Zod validation
- No global state library needed for v1.0

## Navigation Architecture

### Centralized Configuration
- Navigation menu defined in `lib/config/navigation.ts`
- Role-based filtering via `getNavigationForRole(role)`
- Menu items include: label, href, icon, roles[]
- Sections support optional titles for grouping

### Role-Based Menus
- **User**: Dashboard, Request Baru, DevTI Request
- **Admin**: Dashboard, DevTI Request, Laptri, Pencapaian SLA, Settings
- **Developer**: Dashboard, My Assignment, DevTI Request

### Active State
- Uses `usePathname()` to detect current route
- Active items styled with primary background
- Includes `aria-current="page"` for accessibility

## Suggested route map
- `/login` - Authentication (auth layout)
- `/` - Landing/redirect based on role
- `/dashboard` - User dashboard (user layout)
- `/requests/new` - Submit new request (user layout)
- `/requests` - User request list (user layout)
- `/requests/[id]` - Request detail (user layout)
- `/admin/dashboard` - Admin dashboard (admin layout)
- `/admin/requests` - Admin request list (admin layout)
- `/admin/requests/[id]` - Admin request detail (admin layout)
- `/admin/reports/laptri` - Quarterly report (admin layout)
- `/admin/reports/sla` - SLA report (admin layout)
- `/admin/settings` - Settings (admin layout)
- `/developer/dashboard` - Developer dashboard (developer layout)
- `/developer/assignments` - Developer assignments (developer layout)
- `/developer/requests` - Developer request list (developer layout)

## Layout Structure

### Role-Based Layouts
Each role has its own layout wrapper:
- `app/(user)/layout.tsx` - Wraps user pages with AppShell
- `app/(admin)/layout.tsx` - Wraps admin pages with AppShell
- `app/(developer)/layout.tsx` - Wraps developer pages with AppShell
- `app/(auth)/layout.tsx` - No shell, centered form layout

### AppShell Props
```typescript
<AppShell 
  user={session.user}
  role={role}
  breadcrumbs={[...]}  // optional
>
  {children}
</AppShell>
```

## Suggested project structure
```text
src/
  app/
    (auth)/
      login/
    (user)/
      dashboard/
      requests/
    (admin)/
      admin/
        dashboard/
        requests/
        reports/
        settings/
    (developer)/
      developer/
        dashboard/
        assignments/
        requests/
  components/
    ui/
    layout/
    shared/
    requests/
    reports/
  lib/
    config/
      navigation.ts
    db/
      schema/
      index.ts
      seed.ts
    auth/
      config.ts
      options.ts
    validations/
    permissions/
    constants.ts
    utils.ts
  types/

db/
  migrations/

.ai/
```
