# Error Pages Documentation

## Overview
Custom error pages have been implemented to replace default Next.js error pages with SIPPA-branded, user-friendly error screens.

## Component Architecture

### Shared Component: `ErrorState`
Location: `components/shared/error-state.tsx`

A reusable error display component that provides consistent error handling across the application.

**Props:**
- `type?: '404' | '500' | 'error'` - Type of error to display
- `title?: string` - Custom error title
- `message?: string` - Custom error message
- `showReset?: boolean` - Show reset/retry button
- `onReset?: () => void` - Reset callback function
- `backUrl?: string` - URL for back navigation (default: '/')
- `backLabel?: string` - Label for back button (default: 'Kembali ke Dashboard')

**Features:**
- Card-based layout with proper elevation and borders
- Icon-based status indication:
  - 404: FileQuestion icon with muted background
  - 500/Error: AlertCircle icon with destructive background
- Responsive design (mobile-friendly)
- SIPPA green primary color for actions
- Proper spacing per UX Guidelines (p-8, gap-6, space-y-3)
- Accessible keyboard navigation

## Error Page Types

### 1. 404 Not Found Pages

#### User Role: `app/(user)/not-found.tsx`
- Title: "Halaman Tidak Ditemukan"
- Message: "Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan."
- Back URL: `/dashboard`

#### Admin Role: `app/(admin)/not-found.tsx`
- Title: "Halaman Admin Tidak Ditemukan"
- Message: "Modul atau halaman admin yang Anda cari tidak tersedia."
- Back URL: `/admin/dashboard`

#### Developer Role: `app/(developer)/not-found.tsx`
- Title: "Halaman Tidak Ditemukan"
- Message: "Modul workspace yang Anda cari tidak tersedia."
- Back URL: `/developer/dashboard`

#### Root Level: `app/not-found.tsx`
- Title: "Halaman Tidak Ditemukan"
- Message: "Maaf, halaman yang Anda cari tidak ada. Silakan periksa kembali URL atau kembali ke halaman utama."
- Back URL: `/`

### 2. Error Boundary Pages (500 / Runtime Errors)

#### User Role: `app/(user)/error.tsx`
- Title: "Terjadi Kesalahan"
- Message: "Maaf, terjadi kesalahan saat memuat halaman ini. Silakan coba lagi atau kembali ke halaman utama."
- Features: Reset button to retry
- Back URL: `/dashboard`

#### Admin Role: `app/(admin)/error.tsx`
- Title: "Terjadi Kesalahan Sistem"
- Message: "Terjadi kesalahan saat memproses permintaan Anda. Error telah dicatat dalam log sistem."
- Features: Reset button to retry
- Back URL: `/admin/dashboard`

#### Developer Role: `app/(developer)/error.tsx`
- Title: "Terjadi Kesalahan"
- Message: "Gagal memuat halaman developer workspace. Silakan coba lagi atau kembali ke dashboard."
- Features: Reset button to retry
- Back URL: `/developer/dashboard`

#### Root Level: `app/error.tsx`
- Title: "Terjadi Kesalahan"
- Message: "Maaf, terjadi kesalahan pada aplikasi. Silakan coba lagi atau hubungi administrator jika masalah berlanjut."
- Features: Reset button to retry
- Back URL: `/`

### 3. Global Error Page: `app/global-error.tsx`

The global error page handles fatal errors that crash the entire application. It replaces the entire HTML document.

**Features:**
- Full HTML replacement (includes `<html>` and `<body>` tags)
- Inline SVG icons (no external dependencies)
- Two actions:
  - "Muat Ulang Aplikasi" - Reset button
  - "Kembali ke Beranda" - Link to homepage
- Title: "Terjadi Kesalahan Fatal"
- Message: "Aplikasi mengalami masalah serius. Silakan muat ulang halaman atau hubungi administrator sistem."

## Design Compliance

All error pages follow SIPPA UX Guidelines:

### Colors
- ✅ Primary action buttons use `oklch(0.58 0.19 155)` - Green
- ✅ Destructive states use `oklch(0.577 0.245 27.325)` - Red
- ✅ Muted backgrounds use `oklch(0.97 0 0)` - Light gray
- ✅ Text uses proper foreground/muted-foreground colors

### Typography
- ✅ Inter font family
- ✅ Heading: text-2xl, font-bold
- ✅ Body: text-sm with proper line-height
- ✅ Proper tracking and letter spacing

### Spacing
- ✅ Card padding: p-8
- ✅ Section gaps: gap-6, space-y-3, space-y-6
- ✅ Button size: h-11 (size="lg")
- ✅ Icon size: h-20 w-20 container, h-10 w-10 icon

### Border Radius
- ✅ Cards: rounded-lg (10px)
- ✅ Icon containers: rounded-full
- ✅ Buttons: rounded-lg

### Shadows & Elevation
- ✅ Card: border-2 with proper shadow
- ✅ Clear visual hierarchy

### Accessibility
- ✅ Keyboard-friendly navigation
- ✅ Proper color contrast (WCAG AA)
- ✅ Semantic HTML structure
- ✅ Clear focus states on buttons

## User Experience

### Error 404 Flow
1. User navigates to non-existent page
2. Sees FileQuestion icon with muted styling
3. Reads clear Indonesian message
4. Clicks "Kembali ke Dashboard" to return to their role's dashboard

### Error 500 Flow
1. Runtime error occurs during page load
2. Error boundary catches the error
3. User sees AlertCircle icon with red styling
4. Error is logged to console for debugging
5. User can:
   - Click "Coba Lagi" to retry (reset error boundary)
   - Click "Kembali ke Dashboard" to navigate away

### Global Error Flow
1. Fatal error crashes the app
2. Full page replaced with error state
3. User can:
   - Click "Muat Ulang Aplikasi" to reset
   - Click "Kembali ke Beranda" to navigate to root

## Testing

### Manual Testing Checklist

**404 Pages:**
- [ ] Navigate to `/invalid-page` - should show root 404
- [ ] Navigate to `/dashboard/invalid` - should show user 404
- [ ] Navigate to `/admin/invalid` - should show admin 404
- [ ] Navigate to `/developer/invalid` - should show developer 404
- [ ] Verify back buttons navigate to correct dashboard

**Error Boundaries:**
- [ ] Trigger error in user page - verify user error boundary
- [ ] Trigger error in admin page - verify admin error boundary
- [ ] Trigger error in developer page - verify developer error boundary
- [ ] Click "Coba Lagi" - verify page resets
- [ ] Click back button - verify navigation works

**Global Error:**
- [ ] Trigger fatal error - verify global error replaces HTML
- [ ] Click "Muat Ulang Aplikasi" - verify reset works
- [ ] Click "Kembali ke Beranda" - verify navigation works

**Responsive Design:**
- [ ] Test on mobile (< 640px) - verify card scales properly
- [ ] Test on tablet (768px) - verify layout remains centered
- [ ] Test on desktop (> 1024px) - verify max-width constraint

**Accessibility:**
- [ ] Tab through buttons - verify focus visible
- [ ] Press Enter on focused button - verify activation
- [ ] Test with screen reader - verify content readable
- [ ] Verify color contrast meets WCAG AA

## Integration Notes

### Using ErrorState in Components

```typescript
import { ErrorState } from '@/components/shared/error-state';

// For loading/error states in client components
if (error) {
  return (
    <ErrorState
      type="error"
      message={error}
      showReset
      onReset={() => window.location.reload()}
    />
  );
}
```

### Custom Error Pages

To create a custom error for a specific route:

```typescript
// app/my-route/error.tsx
'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/shared/error-state';

export default function MyRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('My route error:', error);
  }, [error]);

  return (
    <ErrorState
      type="error"
      title="Custom Title"
      message="Custom message"
      showReset
      onReset={reset}
      backUrl="/my-dashboard"
      backLabel="Back to My Dashboard"
    />
  );
}
```

## Future Enhancements

Potential improvements for future versions:

1. **Error Tracking Integration**
   - Integrate with Sentry or similar service
   - Send error reports with context
   - Track error frequency and patterns

2. **Enhanced User Guidance**
   - Add suggested actions based on error type
   - Show recent pages for easy navigation
   - Add search functionality on 404 pages

3. **Developer Experience**
   - Show stack traces in development mode
   - Add error reproduction steps
   - Link to relevant documentation

4. **Offline Support**
   - Detect network errors specifically
   - Show offline indicator
   - Suggest checking connection

5. **Internationalization**
   - Support English alongside Indonesian
   - Detect browser language preference
   - Allow language switching on error pages

## References

- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [SIPPA UX Guidelines](.ai/UX_GUIDELINES.md)
- [SIPPA Architecture](.ai/ARCHITECTURE.md)
