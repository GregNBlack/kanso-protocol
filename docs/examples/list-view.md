# List View — example page

> Canonical "X members / X projects / X orders" page. Stress-tests the full data-table chain — TableToolbar + FilterBar + Table + Pagination — under one shell.

## Anatomy

A 1440×900 frame on `color/gray/50`. Same Header + Sidebar shell as Dashboard / Settings; the main column carries:

1. **PageHeader** (`md`) — title *"Team members"* + description (member count) + actions row (Export ghost + Invite primary).
2. **Table card** — single bordered surface (1px gray-200, 12px corner radius) wrapping every table-related block so the toolbar / chips / rows / footer all share one outline:
   1. **TableToolbar** — Search (`Search members…`), Filters button with badge `2`, Create button labeled *"Invite"*.
   2. **FilterBar** — two active chips (`Role: Admin` primary, `Status: Active` success) + Add filter + Clear all.
   3. **Table** (`md`, selectable) with 4 columns:
      - **Name** — Avatar (initials) + name + email stacked.
      - **Role** — plain text.
      - **Status** — `Badge` pill with colour mapped to status (Active → success, Pending → warning, Inactive → neutral).
      - **Actions** — kebab `⋯` icon-only button.
   4. **Pagination** footer (`md`) — current page 1 of 3, items info `Showing 1–8 of 24`.

## Composition principles

- **Single container, multiple bands.** Toolbar / chips / rows / pagination all share a single bordered card so the page reads as one data surface, not four detached strips.
- **Status semantics through colour.** Pending stays warning yellow; Inactive falls back to neutral; Active is the only "happy" green. Don't overload colour — three states is the cap on a status badge.
- **Real Avatar in cells.** Even at `xs/sm` sizes the Avatar component carries the same affordances (initials → image fallback, ring/status options) that the rest of the app uses.
- **Don't open a modal from a row.** Use a kebab to keep row destinations consistent — clicking the row navigates to detail; the kebab is for secondary actions (resend invite, change role, remove).

## Where it lives

- **Figma**: `List View` frame on the [🖼️ Example Pages](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System) page (right of `Settings`).
- **Storybook**: `Examples/List View`.
- **Source**: `packages/examples/list-view/stories/list-view.stories.ts`.
