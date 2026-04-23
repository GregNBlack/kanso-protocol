# Settings — example page

> Same app shell as the Dashboard, but the main column is owned by `PageHeader` (with tabs) and a stack of `SettingsPanel`s — Profile / Preferences / Danger zone.

## Anatomy

A 1440×900 frame on `color/gray/50`. Three regions:

- **Header** (`md`, `light`) — same chrome as every signed-in page.
- **Sidebar** (240px, `expanded`, `light`) — logo + user footer turned off (those live in the Header), `Settings` row marked active.
- **Main** column right of the sidebar:
  1. **PageHeader** (`md`) — title *"Settings"* + description + a 5-tab nav (`General` selected, `Notifications`, `Billing`, `Team`, `Security`) + bottom divider.
  2. **Container** capped at 720px wide so the form doesn't sprawl on widescreen monitors.
  3. **Stack** of three `<kp-settings-panel>`s with a 32px gap between them:
     - **Profile** — Avatar (with a Change button), Full name, Email, Bio (textarea), divider off on the last row.
     - **Preferences** — Theme, Language, Timezone (all `<kp-select>`s).
     - **Danger zone** — single row with a `Delete account` outline-danger button. Card border + title flip to red via a local CSS variable override (`--kp-color-gray-200 → --kp-color-red-300`, title to `--kp-color-red-600`).

## Composition principles

- **Same shell, different content.** Header + Sidebar are unchanged from `Dashboard` so the user's spatial model is preserved as they move between pages. Only the main column changes.
- **Container width discipline.** Forms read better at ~720px than at 1200px. The example caps the main column with `max-width: 720px` rather than letting fields stretch edge-to-edge.
- **Danger affordance at the consumer layer.** `SettingsPanel` doesn't ship a "danger" appearance variant — instead the example overrides `--kp-color-gray-200` and the title colour locally. If we end up needing this in three more places, we'll promote it to a real `appearance="danger"` on the panel.

## Where it lives

- **Figma**: `Settings` frame on the [🖼️ Example Pages](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System) page (right of `Dashboard`).
- **Storybook**: `Examples/Settings`.
- **Source**: `packages/examples/settings/stories/settings.stories.ts`.
