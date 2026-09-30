---
"@kanso-protocol/ui": minor
---

Follow-up to the #49–#64 batch, reported after integrating 5.19.0:

- Dark theme: `border.strong` (gray-300) sat one step below the already-fixed `border.default`, collapsing the emphasis ordering and — via kp-textarea/kp-time-picker's scrollbar-thumb color — leaving the custom scrollbar thumb nearly invisible. Raised to gray-500.
- New opt-in utility, `@kanso-protocol/ui/styles/scrollbar.css`: extracts kp-textarea's thin-scrollbar recipe into a `.kp-scrollbar-thin` class any consumer can apply to a dialog/drawer body, table wrapper, or the page itself, instead of only kp-textarea and kp-time-picker having the matching look.

Fixes #68, #69.
