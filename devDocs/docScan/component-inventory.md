# Component Inventory – Mission Control UI (apps/v0)

## BMAD Feature Components
- Header/navigation: `header`, `breadcrumb`, `slide-sidebar`, `agents-panel`.
- Workflow boards: `board-view`, `workflow-card`, `phase-workflow-card`, `workflow-step-runner`, `phase-action-drawer`, `discovery-action-drawer`, `action-drawer`.
- Planning artifacts: `epic-card`, `story-panel`, `story-workflow-sequence`, `epic-context-setup`, `epic-post-story-sequence`, `sprint-planning-card`, `sprint-retro-card`.
- Docs & status: `docs-manager`, `init-required-screen`, `welcome-screen`.
- Repo management: `repository-picker`.
- Assistants: `chat-manager`, `chat-panel`, `chat-launch-inline`, `copy-commands-inline`.
- Terminal: `terminal-manager`, `terminal-launch-dialog`, `terminal-launch-inline`.

## UI Primitives (Radix-derived)
- Layout/navigation: `sidebar`, `navigation-menu`, `menubar`, `accordion`, `tabs`, `breadcrumb`.
- Forms/inputs: `form`, `field`, `input`, `textarea`, `select`, `checkbox`, `radio-group`, `switch`, `slider`, `input-group`, `input-otp`, `button-group`, `toggle`, `toggle-group`, `kbd`.
- Feedback/display: `alert`, `alert-dialog`, `dialog`, `drawer`, `hover-card`, `popover`, `tooltip`, `toast`/`sonner`, `spinner`, `progress`, `badge`, `card`, `table`, `chart`, `calendar`, `carousel`.
- Layout utilities: `sheet`, `resizable`, `scroll-area`, `skeleton`, `separator`, `empty`, `aspect-ratio`, `pagination`.

## Data/Store Helpers
- `lib/repository-store.ts`: repo registry and active repo state.
- `lib/bmad-data.ts`: workflow/phase/story types and sample data.
- `lib/agents-data.ts`: agent roster data.
- `lib/utils.ts`: small helpers (e.g., class merging, formatting).
