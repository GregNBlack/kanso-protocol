# AvatarGroup

> Overlapping stack of Avatars with an optional "+N" count chip. Signals "this thing has several people attached to it" without dominating the row.

## Contract

`<kp-avatar-group>` takes a list of `[items]` and renders up to `[max]` of them as overlapping Avatars (each with `showRing=true` so the edges read cleanly). If `total > items.length` or `items.length > max`, a count chip `+N` appears at the end.

`+N` math: `total ?? items.length` minus the number of visible avatars. When `total` is omitted, the chip shows `items.length - max` for the hidden members you passed in. When `total` is set, it's the ground truth (useful when `items` is a page of profile data for performance — you don't have to hydrate 200 avatars to say "240 people").

## API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Avatar size propagated to children |
| `overlap` | `'tight' \| 'normal' \| 'loose'` | `'normal'` | Negative gap between avatars (scales with size) |
| `max` | `number` | `3` | Max visible avatars before collapsing into `+N` |
| `showCount` | `boolean` | `true` | Render the `+N` chip when overflow |
| `total` | `number \| null` | `null` | Ground-truth total count; defaults to `items.length` |
| `items` | `KpAvatarGroupItem[]` | `[]` | Avatar descriptors (initials / src / alt / appearance) |

### `KpAvatarGroupItem`

```ts
interface KpAvatarGroupItem {
  initials?: string;                   // 1–2 letters
  src?: string;                        // image URL (takes precedence)
  alt?: string;                        // alt + aria-label
  appearance?: KpAvatarAppearance;     // color role
}
```

## Sizes

The count chip matches the avatar size so the row stays visually flush:

| Size | Avatar px | Chip px | Font |
|------|----------|---------|------|
| `xs` | 20 | 20 | 10 |
| `sm` | 24 | 24 | 11 |
| `md` | 32 | 32 | 12 |
| `lg` | 40 | 40 | 14 |
| `xl` | 56 | 56 | 18 |

## Do / Don't

### Do
- Use **`total`** when your backend returns a count separate from the loaded avatars — don't load 200 images to display "240 people".
- Use **`overlap="tight"`** inside dense UIs (row toolbars, table cells). Use **`"loose"`** inside headers or hero blocks where the avatars are the subject.
- Keep `max` in the 3–5 range. More than that and the `+N` chip stops saving space.

### Don't
- Don't mix sizes within a single group. If you need a lead avatar, use a separate `<kp-avatar>` next to the group.
- Don't show groups of 1. A single avatar is just… an avatar.
- Don't swap `showCount` on/off based on state — overflow is a fact, not a preference.

## Accessibility

- Each child `<kp-avatar>` carries its own `aria-label` (alt / initials).
- The count chip has `aria-label="+N more"` so screen readers announce the overflow.
- If the group is interactive (e.g., opens a list of members), wrap it in a `button` and provide a group-level `aria-label`.

## References

- **Figma component**: [`AvatarGroup` Component Set](https://www.figma.com/design/ahRfe4BdMAyoK0I3lnicp6/Design-System)
- **Storybook**: https://gregnblack.github.io/kanso-protocol/?path=/docs/components-avatargroup
- **Source**: `packages/components/avatar-group/src/`
- **Tokens**: `avatar-group/count/bg`, `avatar-group/count/fg`

## Changelog

- `0.1.0` — Initial release. 5 sizes × 3 overlap densities, data-driven `[items]` API, optional `+N` chip.
