# ADR 0001 — CSS Variables as the Customization Public API

- **Status:** Accepted
- **Date:** 2026-05-25
- **Supersedes:** —

## Context

Consumers of Kanso want to customize component appearance — adjusting padding, font sizes, gaps, brand-color overrides per page. Today they do this through a mix of:

- `::ng-deep` overrides (working but fragile, breaks under view-encapsulation specificity drift)
- `!important` declarations to beat `[_ngcontent-*]` selector specificity
- Direct token-level edits (forcing them to fork the design system)

All three are anti-patterns. Production review (Sergey, 2026-05-25) flagged this repeatedly:

> "Глобальные override'ы (даже `:host ::ng-deep`) проигрывают same-property battle. Везде нужен `!important` либо двойная class-специфика."

The root problem: there is **no explicit CSS public API**. Consumers reach for whatever works, which means they reach into private structure that's free to change between versions.

## Decision

**CSS Custom Properties scoped to the component host are the only supported customization surface.**

Every visually customizable property of every component MUST be driven by a CSS variable that follows the naming convention:

```
--kp-<component-or-pattern>-<property>[--<modifier>]
```

Examples:
- `--kp-input-padding-x`
- `--kp-input-padding-x--sm`
- `--kp-page-header-pad-bottom`
- `--kp-tooltip-arrow-inset`
- `--kp-table-row-h`

The variables are documented per-component in Storybook autodocs alongside `@Input()` and `@Output()` reference. Anything not in that documented list is **private** — consumers who reach for it via `::ng-deep` or selector overrides accept the breakage when internals change.

### Conventions

1. **Single source per property.** A given customizable value is exposed through exactly one CSS variable. No duplicate hooks (`--kp-x-height` AND `--kp-x-size` for the same dimension).
2. **Default value in `var()` fallback.** `padding: var(--kp-input-padding-x, 12px)` so the variable is optional — components work without consumer customization.
3. **Naming uses kebab-case + `--` for state modifiers.** `--kp-input-padding-x--lg` not `--kp-input-padding-x-lg`. The double-dash mirrors the BEM convention used in class names.
4. **Cascade-friendly.** Variables are declared on `:host`, so consumers can override them at any ancestor element. No `!important` needed:
   ```css
   .narrow-form kp-input { --kp-input-padding-x: 8px; }
   ```
5. **State variables exist for hover/focus/active/disabled/loading.** Default to `var(--kp-input-bg, …)` for rest, `var(--kp-input-bg-hover, …)` for hover, etc.

### What this does NOT cover

- Layout-level positioning (margins, position, top/left). Components don't expose these — consumer's parent owns layout.
- Animations / motion durations. These use the global `--kp-motion-*` tokens. A component doesn't expose its own motion vars.
- Token-level redesigns (changing brand color across the system). That's still done at the W3C DTCG token layer, not per-component.

## Consequences

### Positive

- Component internals (template structure, class names, encapsulation) can change freely between versions. Customization contracts stay stable.
- Specificity war ends. Consumers never need `!important`.
- The variable list becomes a discoverable API — Storybook can list `Public CSS Variables` per component, same shape as `@Input()` docs.
- Dark mode and theming work by setting variables higher in the tree (already happening via `tokens/themes/dark.json` + `[data-theme="dark"]`).

### Negative

- Migration cost. Components built before this ADR (most of the 41) don't expose all customizable properties as variables. We need an audit + retrofit pass.
- Variable list size. A button with size × variant × color × state has 40+ var slots. Storybook docs need careful presentation.
- We're committing to backwards-compat on the variable names. Renaming `--kp-input-padding-x` later is a breaking change.

## Migration Plan

### Phase 1 (4.0.0) — establish the contract

This ADR. Components keep their current variable surface; new components must follow.

### Phase 2 (4.1+) — audit pass

Top 5 priorities to retrofit (highest production-pain first):

1. **`kp-page-header`** — `--kp-ph-pad-bottom`, `--kp-ph-title-fs`, `--kp-ph-gap-*` already exposed; verify completeness vs reported pains (back-button align, divider gap).
2. **`kp-input` / `kp-select` / `kp-textarea` / `kp-date-picker`** — expose `--kp-input-padding-x`, `--kp-input-height`, `--kp-input-radius`, `--kp-input-font-size` for size-driven sizing. Some already there; audit completeness.
3. **`kp-button`** — already heavily CSS-var driven via `--kp-button-bg-*` / `--kp-button-fg-*` per state; document the full surface.
4. **`kp-table`** — `--kp-table-row-h`, `--kp-table-pad-x`, `--kp-table-fs` exposed; row-state colors via tokens. Document.
5. **`kp-card`** — currently uses direct token references; expose per-component hooks for padding, gap, radius.

### Phase 3 (5.0+) — enforcement

Add a lint rule (custom `kanso-lint-css`) that flags any component author who introduces a customizable property without a corresponding `var()` hook. Block on CI.

## References

- [W3C Design Tokens Community Group](https://www.w3.org/community/design-tokens/)
- Production review thread, Sergey, 2026-05-25 (item #7)
- [CSS Custom Properties spec](https://www.w3.org/TR/css-variables-1/)
