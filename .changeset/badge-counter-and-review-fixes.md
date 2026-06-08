---
"@kanso-protocol/ui": minor
---

Storybook review batch — Badge gains an additive numeric counter plus several component fixes.

- **Badge**: new `counter` input — a small rounded count chip rendered after the label (same idea as the Tabs count), fully additive (never changes the label/icon/dot/shape). Its background is a translucent tint of the current text color, so it adapts to any badge color. When a counter is present the badge's trailing padding tightens to match the chip's top/bottom inset. `count` shape padding is now per-size instead of a flat 2px so multi-digit counts (`12`, `99+`) no longer crowd the edges.
- **Textarea**: `resize="both"` now resizes on both axes — resize moved from the inner field to the host so the bordered box grows/shrinks together.
- **Button**: `iconOnly` / `disabled` / `loading` use `booleanAttribute`, so the bare `iconOnly` attribute correctly makes the button square.
- **FilterBar**: filter chips now match the `sm` control height (28px) so they line up with the “Add filter” / “Clear all” buttons.
- **Header**: the user button follows button-grammar padding and aligns to the 36px icon-button height.
