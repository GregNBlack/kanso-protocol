# Detail View — example page

> Entity-detail layout: rich PageHeader (breadcrumbs, back, title-with-status, description, actions, tabs) and a 2/3 + 1/3 grid for content + sidebar metadata. The composition that exercises every PageHeader slot at once.

## Anatomy

A 1440×900 frame on `color/gray/50`. Same Header + Sidebar shell as the rest of the showcase (sidebar's logo + user footer are off — they live in the Header).

### Main column

1. **PageHeader** (`md`) with every slot enabled:
   - **Breadcrumbs** — Projects › Design System › Kanso Protocol
   - **Back button** — `‹` icon-only ghost
   - **Title** — *"Kanso Protocol"* H1, with an inline `Badge` (`success`, `subtle`, `pill`) reading **Active** right after it
   - **Description** — *"Open-source Angular design system."*
   - **Actions** — Share (outline neutral) + Edit (default primary) + `⋯` overflow icon-only ghost
   - **Tabs** — Overview (selected) / Activity / Files / Members / Settings
   - **Bottom divider** under the whole header

2. **Body grid** — `2fr 1fr` columns, 16px gap, top-aligned:

   **Main (2/3)**
   - `Card` *About* — short prose paragraph describing the project. Inline `<code>` for the token reference.
   - `Card` *Recent activity* — vertical timeline: each event is `<kp-avatar size="sm">` + author + verb + target + relative time.

   **Side (1/3)**
   - `Card` *Details* — four `<kp-settings-row>`s as key/value rows: Owner / Created / Visibility (uses a primary-subtle Badge) / License. Last row's divider is off.
   - `Card` *Members* — `<kp-avatar-group>` (max 4, total 7) for the overlap stack at the top, then a vertical list of named members (avatar + name + role).

## Composition principles

- **Use the PageHeader as a real header.** Title alone reads like a list-view page; the breadcrumbs + back button + status badge + tabs together signal "you're inside a record".
- **2/3 + 1/3 grid, not 3 equal columns.** Body content (About, Activity) needs reading width; metadata (Details, Members) is glanceable and can live in a narrower lane.
- **AvatarGroup over a long list.** When a card just needs to say *"there are people on this thing"*, the stacked avatars + `+N` count are denser than a vertical list. Pair with a short member list below if names matter.
- **One source of "status".** Active/Inactive lives next to the title in the PageHeader; do not repeat the same status as a row in Details. One canonical surface for each piece of state.

## Where it lives

- **Figma**: `Detail View` frame on the [🖼️ Example Pages](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System) page (right of `List View`).
- **Storybook**: `Examples/Detail View`.
- **Source**: `packages/examples/detail-view/stories/detail-view.stories.ts`.
