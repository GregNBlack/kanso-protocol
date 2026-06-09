---
"@kanso-protocol/ui": patch
---

Dark theme token consistency — the dark theme's primary/accent semantic tokens now reference the accent ramp (`var(--kp-color-blue-*)`) instead of hardcoded literals, so a runtime brand recolor cascades through the dark theme exactly like it already did in light. 216 semantic overrides in `tokens/themes/dark.json` were converted from literals to references (173 were exact duplicates of a ramp stop — zero visual change; 43 primary/accent off-ramp tints were snapped to the lightness-nearest accent stop — a small refinement of the dark primary foreground/border shades). Status, neutral, and surface tokens stay fixed by design (a danger badge is red regardless of brand). The dark CSS format now honors `outputReferences` so these var() chains are preserved.

Also adds a **Theme Editor** Storybook page (Foundations) for generating a custom theme: pick a brand color to recolor the whole accent ramp, or hand-tune any stop of any ramp in light/dark, with a live preview and CSS / DTCG-JSON export. (Storybook-only; not shipped in the package.)
