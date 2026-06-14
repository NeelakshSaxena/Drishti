# Stitch Screen Mapping (Ingested)

## Screen → Route → Android Mapping

| Stitch Screen | Web Route | Purpose | Android Target |
|---|---|---|---|
| `register.png` | `/` | Role selection | `RoleSelectionActivity` |
| `parent_register.png` | `/register/parent` | Parent auth | `ParentAuthActivity` |
| `child_register.png` | `/register/child` | Child auth | `ChildAuthActivity` |
| `child_auth.png` | `/auth/child` | PIN display | `ChildPinFragment` |
| `parent_add.png` | `/parent/link-child` | Link child OTP | `LinkChildActivity` |
| `dashboard_parent.png` | `/parent/dashboard` | Parent monitor | `ParentDashboardActivity` |
| `dashboard_child.png` | `/child/dashboard` | Child actions | `ChildDashboardActivity` |
| `dashboard_invite.png` | `/guest/[token]` | Guest view | `GuestViewActivity` |

## Reusable UI Patterns Across Screens

1. **Dark glassmorphism card** — `bg-zinc-950/60 backdrop-blur-md border-zinc-800`
2. **App header bar** — `h-14 bg-zinc-950/80 backdrop-blur` with DRISHTI wordmark
3. **Sidebar + Map layout** — Left panel (w-80) + right MapLibre view
4. **Bottom action bar** — Stats pills + action buttons
5. **OTP/PIN input row** — 6-box character input
6. **Status dot + label** — Pulsing dot + uppercase micro label
7. **Animated loading** — 3 pulsing dots with staggered delays
8. **DottedGlowBackground** — Animated particle background for auth pages
9. **Share modal** — Fixed overlay with copy-to-clipboard
10. **Error banner** — Red background with icon and message text
