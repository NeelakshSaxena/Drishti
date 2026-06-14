# Drishti Navigation Flow & Stitch Screen Mapping

## 1. Complete Navigation Graph

```
/  (Landing — Role Selection)
│
├── "Access Guardian Flow" button
│   └── /register/parent  (Login or Signup — dual-mode form)
│       │
│       ├── [Login success + has children]
│       │   └── /parent/dashboard  (Map + monitoring sidebar)
│       │
│       ├── [Login success + no children]
│       │   └── /parent/link-child  (6-digit OTP entry)
│       │       └── [Link success] → /parent/dashboard
│       │
│       └── [Signup success]
│           └── /parent/link-child
│
├── "Start Individual Entry" button
│   └── /register/child  (Login or Signup — dual-mode form)
│       │
│       ├── [Login success + linked to parent]
│       │   └── /child/dashboard  (Map + action sidebar)
│       │
│       ├── [Login success + NOT linked]
│       │   └── /auth/child  (Show PIN, poll for link)
│       │       ├── [Parent links] → /child/dashboard
│       │       └── [Manual "Dashboard" button] → /child/dashboard
│       │
│       └── [Signup success]
│           └── /auth/child
│
├── /guest/[token]  (Read-only shared view)
│   └── No navigation out (standalone page)
│
└── /dashboard/view  (Legacy dashboard)
```

## 2. Stitch Screen Mockup Mapping

| Mockup File | Route | Screen Purpose | Implementation Status |
|---|---|---|---|
| `register.png` | `/` | Role selection (Child / Parent) | ✅ Implemented |
| `parent_register.png` | `/register/parent` | Parent login/signup form | ✅ Implemented |
| `child_register.png` | `/register/child` | Child login/signup form | ✅ Implemented |
| `child_auth.png` | `/auth/child` | PIN code display screen | ✅ Implemented |
| `parent_add.png` | `/parent/link-child` | 6-digit OTP entry for linking | ✅ Implemented |
| `dashboard_parent.png` | `/parent/dashboard` | Parent monitoring dashboard | ✅ Implemented |
| `dashboard_child.png` | `/child/dashboard` | Child action dashboard | ✅ Implemented |
| `dashboard_invite.png` | `/guest/[token]` | Read-only guest view | ✅ Implemented |

## 3. Mockup vs Implementation Comparison

### register.png → `/` (Landing)
- **Mockup**: Simple "Register" with Child/Parent options
- **Actual**: Premium dark UI with glassmorphism cards, DottedGlowBackground, role descriptions

### child_auth.png → `/auth/child`
- **Mockup**: "Hello, Child!" with 6-box code display
- **Actual**: Matches closely — 6-box PIN display, Fingerprint icon, Regenerate/Dashboard buttons

### parent_add.png → `/parent/link-child`
- **Mockup**: "Hello, <parent>!" with 5-box code entry
- **Actual**: 6-box OTP entry (corrected from mockup's 5), success animation

### dashboard_parent.png → `/parent/dashboard`
- **Mockup**: Left sidebar (welcome, child dropdown, trip status) + right map + bottom bar
- **Actual**: Matches layout — sidebar with child status, MapLibre map, bottom stats/actions

### dashboard_child.png → `/child/dashboard`
- **Mockup**: Left sidebar (welcome, create trip, share location, parent info) + map + bottom bar
- **Actual**: Matches — action buttons, share modal, location status, SOS button

### dashboard_invite.png → `/guest/[token]`
- **Mockup**: DRISHTI header, selected child, trip status, map, bottom bar (disabled)
- **Actual**: Guest view with read-only badge, info sidebar/drawer, MapLibre map

## 4. Route Protection Matrix

| Route | Protection | Redirect On Fail |
|---|---|---|
| `/` | None | — |
| `/register/parent` | Auto-redirect if session exists | `/parent/dashboard` or `/parent/link-child` |
| `/register/child` | Auto-redirect if session exists | `/child/dashboard` or `/auth/child` |
| `/auth/child` | Requires `child_id` in localStorage | — |
| `/parent/link-child` | Requires `parent_id` + validates with backend | `/register/parent` |
| `/parent/dashboard` | Requires `parent_id` + validates with backend | `/register/parent` |
| `/child/dashboard` | Requires `child_id` in localStorage | — |
| `/guest/[token]` | Token validated against backend | Error page |

## 5. Android Activity Mapping

| Web Route | Android Activity/Fragment | Notes |
|---|---|---|
| `/` | `RoleSelectionActivity` | Entry point |
| `/register/parent` | `ParentAuthActivity` | Login/signup tabs |
| `/register/child` | `ChildAuthActivity` | Login/signup tabs |
| `/auth/child` | `ChildPinFragment` | Show code, poll for link |
| `/parent/link-child` | `LinkChildActivity` | 6-digit PIN input |
| `/parent/dashboard` | `ParentDashboardActivity` | Map + drawer |
| `/child/dashboard` | `ChildDashboardActivity` | Map + drawer |
| `/guest/[token]` | `GuestViewActivity` | Deep-linked |
