# User Interface Module Requirements

**Module ID:** Module 10
**Total Functions:** 10
**Priority:** CRITICAL
**Status:** 🟡 Implemented 95% (Error boundaries need improvement)
**Dependencies:** All modules (UI is cross-cutting)

---

## Overview

The User Interface module provides the visual and interactive foundation for Zenith Trainer. Built with Radix UI components, Tailwind CSS, and next-themes, it ensures professional UI/UX with accessibility (WCAG 2.1 AA), responsive design, and dark/light mode support.

Current implementation (95%) includes all core UI elements: navigation, responsive design, theming, 17 Radix UI components, toasts, loading states. Error boundaries have basic implementation but need comprehensive fallback UI and better error messaging.

**Key Capabilities:**
- Main navigation with role-based menu items
- Fully responsive design (mobile-first, Tailwind breakpoints)
- Dark/Light/System theme support (next-themes)
- 17 Radix UI components (Accordion, Alert, Dialog, Dropdown, Select, Slider, etc.)
- Toast notifications (success, error, info, warning)
- Loading states (skeletons, spinners)
- Form validation (React Hook Form + Zod)
- Accessibility (WCAG 2.1 AA)
- Icons (lucide-react)
- Error boundaries (basic, needs improvement)

**Integration Points:**
- All modules use UI components
- Theme applied globally via `next-themes`
- Toast system used for all user feedback

---

## Core Functions

### Function 10.1: Main Navigation - ✅ 100%

**Purpose:** App-wide navigation menu.

**Key Requirements:**
- Desktop: Horizontal nav bar (logo, menu items, user profile, theme toggle)
- Mobile: Hamburger menu (slide-out drawer)
- Menu items: Dashboard, Library, Programs, Schedule, History, Analytics, Habits
- Active state: Highlight current page
- User dropdown: Profile, Settings, Logout

**Technical:**
- Component: `MainNav` (`src/components/main-nav.tsx`)
- Routing: Next.js App Router (`usePathname()`)
- Mobile menu: Radix UI Sheet component

---

### Function 10.2: Responsive Design - ✅ 100%

**Purpose:** Adaptive layouts for all screen sizes.

**Breakpoints (Tailwind):**
- `sm`: 640px (mobile landscape)
- `md`: 768px (tablet)
- `lg`: 1024px (laptop)
- `xl`: 1280px (desktop)
- `2xl`: 1536px (large desktop)

**Approach:**
- Mobile-first: Base styles for mobile, breakpoints for larger screens
- Flexbox/Grid: Responsive layouts
- Touch targets: Min 48px on mobile

**Technical:**
- Tailwind CSS: Utility classes (`sm:`, `md:`, `lg:`)
- Components: Use `className` with responsive utilities

---

### Function 10.3: Dark/Light Mode - ✅ 100%

**Purpose:** User-selectable theme.

**Themes:**
- Light: Default light theme
- Dark: Dark theme (OLED-friendly)
- System: Follow OS preference

**Implementation:**
- Library: `next-themes` (0.3.0)
- Storage: localStorage (`theme` key)
- CSS variables: `--background`, `--foreground`, `--primary`, etc.
- Toggle: Button in nav bar (Sun/Moon icon)

**Technical:**
- Provider: `<ThemeProvider>` in root layout
- Hook: `useTheme()` for theme access/toggle
- Tailwind: `dark:` variant for dark mode styles

---

### Function 10.4: Radix UI Components - ✅ 100%

**Purpose:** Accessible, unstyled UI primitives.

**Integrated Components (17):**
1. Accordion - Collapsible sections
2. Alert/AlertDialog - Confirmations
3. Dialog - Modals
4. Dropdown Menu - Context menus
5. Select - Dropdowns
6. Slider - RPE input
7. Toast - Notifications
8. Popover - Floating content
9. Tabs - Tab navigation
10. Tooltip - Hover info
11. Checkbox - Checkboxes
12. Radio Group - Radio buttons
13. Switch - Toggle switches
14. Progress - Progress bars
15. Separator - Dividers
16. Label - Form labels
17. Form - Form wrapper

**Styling:**
- Base: Radix UI headless components
- Styling: Tailwind CSS utility classes
- Variants: Custom variants via `class-variance-authority`

**Technical:**
- Files: `src/components/ui/*`
- Installation: `@radix-ui/react-*` packages

---

### Function 10.5: Toast Notifications - ✅ 100%

**Purpose:** User feedback for actions (success, error, info, warning).

**Types:**
- Success: Green, checkmark icon
- Error: Red, X icon
- Info: Blue, info icon
- Warning: Yellow, warning icon

**Features:**
- Auto-dismiss: 3-5 seconds (configurable)
- Manual dismiss: X button
- Position: Top-right (configurable)
- Stacking: Multiple toasts stack vertically

**Technical:**
- Component: `Toast` (Radix UI Toast)
- Hook: `useToast()` for triggering toasts
- Usage: `toast.success("Workout saved!")`

---

### Function 10.6: Loading States - ✅ 100%

**Purpose:** Indicate async operations.

**Types:**
1. **Skeletons:** Placeholder UI (cards, text lines) while loading
2. **Spinners:** Circular loading indicator
3. **Progress bars:** Determinate progress (e.g., upload)

**Usage:**
- Page load: Skeleton components
- Button actions: Spinner on button
- File upload: Progress bar

**Technical:**
- Skeleton: Custom component (`Skeleton.tsx`)
- Spinner: SVG icon (lucide-react `Loader2` with `animate-spin`)
- Progress: Radix UI Progress component

---

### Function 10.7: Form Validation - ✅ 100%

**Purpose:** Client-side form validation with clear error messages.

**Stack:**
- React Hook Form: Form state management
- Zod: Schema validation
- @hookform/resolvers: Zod integration

**Features:**
- Real-time validation (onChange, onBlur)
- Field-level errors (inline below input)
- Form-level errors (banner at top)
- Disabled submit button if invalid

**Technical:**
- Hook: `useForm<T>({ resolver: zodResolver(schema) })`
- Components: `<Form>`, `<FormField>`, `<FormMessage>`

---

### Function 10.8: Accessibility - ✅ 100%

**Purpose:** WCAG 2.1 Level AA compliance.

**Requirements:**
- Semantic HTML: `<nav>`, `<main>`, `<header>`
- ARIA labels: All interactive elements
- Keyboard navigation: Full support (Tab, Enter, Space, Arrows)
- Focus management: Visible focus indicators, logical tab order
- Screen reader: Meaningful labels, announcements for state changes
- Color contrast: 4.5:1 (text), 3:1 (UI components)

**Testing:**
- Tools: axe DevTools, WAVE, Lighthouse
- Manual: Keyboard-only navigation, screen reader (NVDA, JAWS)

**Technical:**
- Radix UI: Built-in accessibility (focus trap, ARIA attributes)
- Custom components: Add ARIA labels manually

---

### Function 10.9: Icons - ✅ 100%

**Purpose:** Consistent iconography.

**Library:** lucide-react (0.475.0)
- 1000+ icons
- Tree-shakeable (only import used icons)
- Customizable size, color, stroke width

**Usage:**
```typescript
import { Dumbbell, Calendar, BarChart } from 'lucide-react';

<Dumbbell className="w-5 h-5 text-primary" />
```

**Technical:**
- Package: `lucide-react`
- Style: Tailwind classes for size/color

---

### Function 10.10: Error Boundaries - 🟡 Partial (60%)

**Current:** Basic error boundary catches React errors, shows generic "Something went wrong" message.

**Needed (40%):**
- Comprehensive error boundaries (per route, per module)
- Fallback UI: User-friendly error screen with:
  - Error icon
  - User-friendly message (not stack trace)
  - "Try again" button (reload component)
  - "Report issue" link
- Error logging: Send errors to monitoring service (Sentry, LogRocket)
- Granular boundaries: Isolate errors (one broken component doesn't crash entire app)

**Technical:**
- Component: `ErrorBoundary` (React error boundary)
- Logging: `console.error` → future: Sentry integration
- Recovery: `resetErrorBoundary()` function

---

## Module-Level Requirements

### Performance Requirements
- Page load: <2s (including UI assets)
- Theme toggle: Instant (<50ms)
- Toast appearance: <100ms
- Modal open/close: Smooth (<200ms)

### Security Requirements
- XSS prevention: Sanitize all user inputs
- CSP: Content Security Policy headers (Next.js config)

### Accessibility Requirements
- WCAG 2.1 Level AA compliance
- Keyboard navigation: Full coverage
- Screen reader: All interactive elements accessible

### Browser/Platform Support
- Chrome/Edge 111+, Firefox 128+, Safari 16.4+
- Mobile: iOS 16+, Android 12+
- Responsive: 320px to 4K

---

## Implementation Notes

**Recommended Implementation Order (for remaining 5%):**
1. Function 10.10: Comprehensive error boundaries (4-6 hours / 5 story points)

**Estimated Effort (Remaining):**
- Error boundaries: 4-6 hours / 5 story points

**Technical Risks & Mitigation:**
- **Risk:** Error boundary not catching all errors (async errors)
  **Mitigation:** Add try/catch in async functions, use error logging

**Dependencies on External Factors:**
- Radix UI stability (generally stable)
- next-themes compatibility with Next.js updates

---

## Related Documentation

- [Architecture - UI Layer](../core/04_ARCHITECTURE.md#frontend-architecture)
- [Design System](../design/00_DESIGN_SYSTEM.md) (future)

---

**Last Updated:** November 15, 2025
**Author:** Bootstrap PHASE 5
**Status:** 🟡 95% Complete (Error boundaries need improvement)
