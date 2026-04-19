# 簡素 Kanso Protocol

**Open source design system for Angular, built on architectural consistency.**

Design tokens in W3C DTCG format serve as a single source of truth for both Figma and code. Rules are embedded in architecture, not in agreements.

---

## Why Kanso Protocol?

Most design systems break consistency through convention drift — developers and designers interpret rules differently over time. Kanso Protocol solves this by making rules architectural:

- **Every value is a token.** No magic numbers, no hardcoded colors.
- **Every component follows the same anatomy.** Container → Content → Element.
- **Every state is explicit.** No opacity overlays — clean, predictable colors.
- **One source of truth.** Change a token in one place — it updates in Figma and code.

## Quick Start

```bash
# Clone
git clone https://github.com/GregNBlack/kanso-protocol.git
cd kanso-protocol

# Install
npm install

# Build tokens (DTCG JSON → CSS/SCSS/TS)
npm run build:tokens

# Run Storybook
npm run storybook
```

## Architecture

```
kanso-protocol/
├── tokens/
│   ├── primitive/        ← Raw values (colors, spacing, sizing)
│   └── semantic/         ← Roles & states (color.primary.default.bg.rest)
├── packages/
│   ├── core/             ← Compiled tokens, types, mixins
│   └── components/
│       └── button/       ← Reference implementation
├── .storybook/           ← Component showcase
└── .github/workflows/    ← CI/CD
```

## Design Tokens

Tokens follow the [W3C DTCG](https://design-tokens.github.io/community-group/format/) specification.

**Naming convention:**
```
{category}.{role}.{variant}.{property}.{state}
```

Example: `color.primary.default.bg.hover`

**Two-level architecture:**

| Level     | Purpose              | Example                              |
|-----------|----------------------|--------------------------------------|
| Primitive | Raw palette values   | `color.blue.600` → `#2563EB`        |
| Semantic  | Interface roles      | `color.primary.default.bg.rest` → `{color.blue.600}` |

## Component Anatomy

Every component follows a unified three-layer model:

```
┌─ Container ──────────────────────────┐
│  padding · border · radius · bg      │
│  ┌─ Content ──────────────────────┐  │
│  │  gap                           │  │
│  │  [Element] [Element] [Element] │  │
│  │   icon      label     badge    │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

## Component Sizes

| Size | Height | Radius | Use case                  |
|------|--------|--------|---------------------------|
| XS   | 24px   | 8px    | Dense UI, tables, tags    |
| SM   | 28px   | 10px   | Secondary actions         |
| MD   | 36px   | 12px   | **Default** — buttons, inputs |
| LG   | 44px   | 14px   | Touch-friendly, primary CTA |
| XL   | 52px   | 16px   | Hero actions              |

## States

Six explicit states for every interactive component:

| State    | Behavior                                        |
|----------|-------------------------------------------------|
| Rest     | Default appearance                              |
| Hover    | Pointer over element                            |
| Active   | Pointer pressed                                 |
| Focus    | Keyboard focus — 2px outline ring               |
| Disabled | Action unavailable — removed from tab order     |
| Loading  | Action in progress — keeps focus, `aria-busy`   |

**Loading ≠ Disabled.** Loading preserves focus and announces state to screen readers.

## Component API contracts

Every component has a formal API contract in `docs/components/`. Read the contract before using a component — it describes the API, variants, states, accessibility requirements, and usage rules.

- [Button](docs/components/button.md)
- [Input](docs/components/input.md)
- [Icon](docs/components/icon.md)
- [Spinner](docs/components/spinner.md)
- [Checkbox](docs/components/checkbox.md)
- [Radio](docs/components/radio.md)
- [Toggle](docs/components/toggle.md)
- [FormField](docs/components/form-field.md)
- [MenuItem](docs/components/menu-item.md)
- [DropdownMenu](docs/components/dropdown-menu.md)
- [Textarea](docs/components/textarea.md)

Template for new components: [`docs/components/_template.md`](docs/components/_template.md)

## Usage

```typescript
import { KpButtonComponent } from '@kanso-protocol/button';

@Component({
  imports: [KpButtonComponent],
  template: `
    <kp-button size="md" variant="default" color="primary">
      Save
    </kp-button>

    <kp-button variant="outline" color="danger" [loading]="isSaving">
      Delete
    </kp-button>
  `,
})
export class MyComponent {
  isSaving = false;
}
```

## Figma Integration

Kanso Protocol syncs with Figma via [Tokens Studio](https://tokens.studio):

1. Tokens Studio reads DTCG JSON from this repository
2. Changes to tokens create a Pull Request
3. After merge, tokens update in both code and Figma Variables
4. Components in Figma use Variables — theme switching works automatically

## Guiding Principles

1. **Explicit over implicit.** No magic values — everything through tokens.
2. **Architecture over agreements.** Rules are structural, not written.
3. **Predictability over flexibility.** Limited but predictable API > flexible but chaotic.
4. **Single source of truth.** One change, one place.
5. **Every component is equal.** Same anatomy, same contract, no exceptions without ADR.

## Tech Stack

- **Framework:** Angular 18+
- **Monorepo:** Nx
- **Tokens:** W3C DTCG + Style Dictionary 4
- **Docs:** Storybook 8
- **Font:** [Onest](https://fonts.google.com/specimen/Onest) (Google Fonts, Cyrillic)
- **Icons:** [Tabler Icons](https://tabler.io/icons)
- **CI/CD:** GitHub Actions
- **Figma sync:** Tokens Studio

## License

[MIT](LICENSE) © GregNBlack
