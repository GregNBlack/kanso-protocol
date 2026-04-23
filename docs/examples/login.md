# Login — example page

> Centered authentication card on a neutral background. The first of the showcase pages assembled exclusively from Kanso atoms and patterns to prove the system holds together at the page level.

## Anatomy

A 1440×900 frame painted with `color/gray/50`. A 400px wide card sits centered both horizontally and vertically, with subtle shadow + 1px outline + 16px corner radius. The card uses a 32px padding ring and a 20px column gap.

Inside the card, top to bottom:

1. **Logo** — 64×64 square painted `color/blue/600`, 16px corner radius, white `shield-check` Tabler glyph centered (32px).
2. **Title** — *"Welcome back"*, Onest SemiBold 24, centered, `color/text/primary`.
3. **Description** — *"Sign in to your Kanso Protocol account"*, Onest Regular 14, centered, `color/text/secondary`.
4. **Email field** — `<kp-form-field label="Email">` wrapping a `<kp-input type="email" placeholder="you@example.com">`.
5. **Password field** — `<kp-form-field label="Password">` wrapping a `<kp-input type="password">`.
6. **Options row** — `<kp-checkbox checked>` + "Remember me" on the left, "Forgot password?" link in `color/blue/600` on the right.
7. **Primary action** — `<kp-button variant="default" color="primary" size="md">` *"Sign in"*, stretched to full card width.
8. **Divider** — `<kp-divider>` with the label *"Or continue with"*.
9. **Social row** — two outline `<kp-button>`s side-by-side with `brand-google` and `brand-github` Tabler icons.
10. **Sign-up link** — *"Don't have an account?"* + a *"Sign up"* link in `color/blue/600`.

## Composition principles

- **Single visual mass.** Every control on the card sits inside the 336px usable column (400 − 32×2). The Sign in button, the social pair, and the form fields all share that left/right alignment.
- **Hierarchy by size, not colour.** Logo + title carry the visual weight. The body copy and links stay neutral; only the primary action and links use brand blue.
- **Real components only.** The card frame is the only "drawn" element. Everything inside — FormField, Input, Checkbox, Button, Divider — is an instance of the matching Kanso component.

## Where it lives

- **Figma**: `Login` frame on the [🖼️ Example Pages](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System) page.
- **Source for the atoms used**: `packages/components/{form-field,input,checkbox,button,divider}` — no separate Angular package for the login page itself; consumers compose it from these atoms.
