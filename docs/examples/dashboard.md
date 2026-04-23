# Dashboard — example page

> Full-app shell: top bar + sidebar + scrollable main column with KPIs, charts, and an activity feed. The composition test for every navigation, layout, data-display, and feedback pattern in the system.

## Anatomy

A 1440×900 frame painted with `color/gray/50`. Three regions:

- **Header** (`md`, `light`) pinned to the top, full width — logo + main nav + SearchBar (⌘K) + notifications (badge "3") + UserMenu.
- **Sidebar** (240px, `expanded`, `light`) on the left below the header — logo, MAIN section (Dashboard active, Projects, Team, Documents), WORKSPACE (Analytics, Reports, Integrations + "New" badge), SETTINGS (Settings, Help), pinned user footer.
- **Main** column right of the sidebar, below the header, with 24px padding and a 24px gap between blocks:
  1. **Banner** (`warning`, `md`) — *"Your trial ends in 5 days. Upgrade now to keep your data."*
  2. **PageHeader** (`md`) — title *"Dashboard"* + actions row (Export ghost + Create primary).
  3. **Stat row** — 4× `StatCard` (`md`) stretched to equal columns: Revenue / Active users / Conversion / Avg session, with mixed trends (up-positive ×2, down-negative, neutral) so every visual state is on screen at once.
  4. **Charts row** — 2× `Card` (`md`) side-by-side: *Revenue over time* (chart slot) + *Top customers* (table slot).
  5. **Recent activity** — full-width `Card` with a list of `NotificationItem`s.

## Composition principles

- **Real instances all the way down.** Header / Sidebar / Banner / PageHeader / StatCard / Card / NotificationItem / Button — every block is the published Kanso component, never a redrawn lookalike.
- **One layout pattern per region.** Stats use `Grid` columns=4 visually; charts use `Grid` columns=2; activity is full width. The pattern matches the visual rhythm a user actually sees.
- **Consistent `md` size across surfaces.** Header md, PageHeader md, StatCard md, Card md — the page reads as one tier of density rather than a quilt.

## Where it lives

- **Figma**: `Dashboard` frame on the [🖼️ Example Pages](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System) page (right of `Login`).
- **Storybook**: `Examples/Dashboard` (full Angular composition rendered live).
- **Source**: `packages/examples/dashboard/stories/dashboard.stories.ts`.
