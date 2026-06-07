---
"@kanso-protocol/ui": patch
---

Fix tooltip positioning near a viewport edge. Two gaps remained after the earlier flip/clamp work:

- **Arrow drifted off the trigger when the body was edge-clamped.** When a trigger sits near a screen edge, the tooltip body is clamped inward, but the arrow stayed centred on the body — so it pointed away from the trigger. `computeOverlayPosition` now returns an `arrowOffset` that re-points the arrow at the trigger centre (clamped into the rounded-corner zone), and the tooltip applies it.
- **Tooltip didn't follow its trigger on scroll/resize.** The fixed-positioned tooltip is now repositioned (rAF-throttled, capture-phase so scrollable ancestors count) while open, so it no longer drifts toward a screen edge when the page scrolls.

`KpTooltipDirective` now uses the shared `computeOverlayPosition` util (removing a duplicated copy that could drift from it).
