# SIPPA UX Guidelines

## Visual direction
- Soft and calm green-based palette.
- Use green for primary actions, active states, progress, and important confirmations.
- Use neutral surfaces for most of the screen so green remains an accent, not visual noise.
- Prefer rounded cards, restrained shadows, generous spacing, and readable typography.

## Design Tokens

### Colors
- **Primary**: `oklch(0.58 0.19 155)` - Green accent (hsl(142, 71%, 45%))
- **Primary Foreground**: `oklch(0.985 0 0)` - White text on primary
- **Background**: `oklch(1 0 0)` - Pure white
- **Foreground**: `oklch(0.145 0 0)` - Near black text
- **Muted**: `oklch(0.97 0 0)` - Light gray for secondary surfaces
- **Muted Foreground**: `oklch(0.556 0 0)` - Gray text
- **Border**: `oklch(0.922 0 0)` - Subtle borders
- **Destructive**: `oklch(0.577 0.245 27.325)` - Red for errors/warnings
- **Card/Surface**: `oklch(1 0 0)` - White cards

### Typography
- **Font Family**: Inter (primary for all text)
- **Heading**: Font-bold, sizes: text-3xl (h1), text-2xl (h2), text-lg (h3)
- **Body**: text-sm to text-base
- **Small/Caption**: text-xs

### Spacing
- **Container padding**: px-4 (mobile), px-6 (desktop)
- **Section gap**: gap-6 (24px)
- **Card padding**: p-4 to p-6
- **Vertical rhythm**: space-y-4, space-y-6, space-y-8

### Border Radius
- **Base**: `0.625rem` (10px)
- **Small**: `calc(0.625rem * 0.6)` = 6px
- **Medium**: `calc(0.625rem * 0.8)` = 8px
- **Large**: `0.625rem` = 10px
- **Buttons/Cards**: rounded-lg (10px)
- **Avatar**: rounded-full

### Shadows
- **Card**: shadow-md (subtle elevation)
- **Dropdown**: shadow-lg (stronger elevation)
- **Focus**: ring-2 ring-ring/50 (visible keyboard focus)

## Core UX principles
1. Show the user's next action clearly.
2. Make status understandable at a glance.
3. Avoid long dense forms; use sections and progressive disclosure.
4. Preserve user input when validation fails.
5. Give immediate feedback for save/upload/status transitions.
6. Confirm destructive actions such as reject.
7. Make tables searchable, filterable, and scannable.
8. Do not force users to open detail pages just to know basic status.
9. Keep role-specific screens focused on the tasks of that role.
10. Make empty, loading, error, success, and permission-denied states intentional.

## Application Shell

### Desktop Layout (≥1024px)
- **Top Navigation**: 64px height, fixed position
  - Logo, breadcrumbs, notifications icon, user menu
- **Sidebar**: 240px width, always visible
  - Role-based navigation menu with icons
  - Active state with primary background
  - Section grouping with separators
- **Main Content**: Flexible width with container constraints

### Mobile Layout (<1024px)
- **Top Navigation**: 64px height with hamburger menu
- **Sidebar**: Hidden by default, drawer overlay on menu open
- **Full-width content** with appropriate padding

### Navigation Structure
- Centralized config in `lib/config/navigation.ts`
- Role-based filtering (User, Admin, Developer)
- Active state with `aria-current="page"`
- Icons from lucide-react

## Request submission UX
Recommended stepper:
1. Jenis Permintaan
2. Informasi Permintaan
3. Detail Kebutuhan
4. Lampiran
5. Review & Kirim

Show a summary before submission and warn before leaving with unsaved changes.

## Status UX
Use a consistent status badge + timeline. The timeline should show who changed the status, when, and an optional note.

## Dashboard UX
User: pending requests, in-progress requests, recently completed, latest status updates.
Admin: incoming queue, verification queue, approved-but-unassigned, in-progress, SLA attention.
Developer: assigned workload, overdue/SLA-near items, recent updates.

## Responsive Breakpoints
- **sm**: 640px (mobile landscape)
- **md**: 768px (tablet)
- **lg**: 1024px (desktop - sidebar visible)
- **xl**: 1280px (large desktop)
- **2xl**: 1536px (extra large)

### Responsive Behavior
- Sidebar: hidden on <lg, visible on ≥lg
- Top nav: hamburger on <lg, full nav on ≥lg
- Breadcrumbs: hidden on <md, visible on ≥md
- Cards: single column on mobile, grid on desktop
- Tables: horizontal scroll on mobile

## Accessibility
- Keyboard-friendly controls (Tab, Enter, Escape)
- Clear focus states (ring-2 ring-ring/50)
- Semantic HTML (`<nav>`, `<main>`, `<header>`)
- Labels for all form fields
- ARIA labels for icon-only buttons
- Error messages tied to inputs
- Do not rely on color alone to communicate status
- Color contrast meets WCAG AA (4.5:1 for text)
- Focus trap in dialogs/modals
