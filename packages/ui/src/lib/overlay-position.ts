/**
 * Shared overlay positioning math for floating UI (tooltip, popover, …).
 *
 * Pure function: given the trigger's rect, the overlay's measured size,
 * a preferred side, a gap, and a cross-axis alignment, returns the
 * fixed-position `{ x, y, side }` for the overlay — with viewport-edge
 * flipping and clamping baked in.
 *
 * Kept framework-agnostic (no Angular imports) so it can be unit-tested
 * in isolation and reused by any directive that parks a `position: fixed`
 * element next to a trigger.
 */

export type KpOverlaySide = 'top' | 'right' | 'bottom' | 'left';
export type KpOverlayAlign = 'start' | 'center' | 'end';

export interface KpOverlayRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface KpOverlayPositionInput {
  /** Trigger bounding rect (viewport coords, e.g. from getBoundingClientRect). */
  trigger: KpOverlayRect;
  /** Overlay measured size. */
  overlay: { width: number; height: number };
  /** Preferred side. Flips to the opposite side if it doesn't fit. */
  side: KpOverlaySide;
  /** Distance in px between trigger edge and overlay. */
  gap: number;
  /** Viewport size. */
  viewport: { width: number; height: number };
  /**
   * Cross-axis alignment. For top/bottom this shifts horizontally; for
   * left/right it shifts vertically. `inset` is the distance from the
   * overlay corner to the alignment anchor (e.g. an arrow centre).
   */
  align?: KpOverlayAlign;
  alignInset?: number;
  /** Viewport gutter to clamp within. Default 4. */
  gutter?: number;
}

export interface KpOverlayPositionResult {
  x: number;
  y: number;
  /** Final side after flipping — may differ from the requested side. */
  side: KpOverlaySide;
  /**
   * Where the arrow should sit along the overlay's cross-axis edge, in px
   * from the overlay's left (top/bottom sides) or top (left/right sides).
   * Tracks the trigger centre even after the overlay is clamped to a
   * viewport edge — so the arrow keeps pointing at the trigger — and is
   * itself clamped to `[alignInset, extent - alignInset]` so it never
   * leaves the rounded corner. Apply as `--kp-tooltip-arrow-offset`.
   */
  arrowOffset: number;
}

const OPPOSITE: Record<KpOverlaySide, KpOverlaySide> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

export function computeOverlayPosition(input: KpOverlayPositionInput): KpOverlayPositionResult {
  const {
    trigger, overlay, gap, viewport,
    align = 'center', alignInset = 0, gutter = 4,
  } = input;

  const fits = (s: KpOverlaySide): boolean => {
    switch (s) {
      case 'top':    return trigger.top    - overlay.height - gap >= 0;
      case 'bottom': return trigger.bottom + overlay.height + gap <= viewport.height;
      case 'left':   return trigger.left   - overlay.width  - gap >= 0;
      case 'right':  return trigger.right   + overlay.width  + gap <= viewport.width;
    }
  };

  let side = input.side;
  if (!fits(side) && fits(OPPOSITE[side])) side = OPPOSITE[side];

  // Offset along the cross-axis so the alignment anchor (arrow point /
  // start / end) lines up with the trigger centre.
  const offset = (extent: number): number => {
    switch (align) {
      case 'start': return alignInset;
      case 'end':   return extent - alignInset;
      default:      return extent / 2;
    }
  };

  let x: number, y: number;
  switch (side) {
    case 'top':
      x = trigger.left + trigger.width / 2 - offset(overlay.width);
      y = trigger.top - overlay.height - gap;
      break;
    case 'bottom':
      x = trigger.left + trigger.width / 2 - offset(overlay.width);
      y = trigger.bottom + gap;
      break;
    case 'left':
      x = trigger.left - overlay.width - gap;
      y = trigger.top + trigger.height / 2 - offset(overlay.height);
      break;
    case 'right':
      x = trigger.right + gap;
      y = trigger.top + trigger.height / 2 - offset(overlay.height);
      break;
  }

  // Clamp within viewport gutter.
  x = Math.max(gutter, Math.min(x, viewport.width - overlay.width - gutter));
  y = Math.max(gutter, Math.min(y, viewport.height - overlay.height - gutter));

  // Re-point the arrow at the trigger centre *after* clamping, so a tooltip
  // shoved off a viewport edge still points back at its trigger. Clamp the
  // arrow into the overlay's safe corner zone so it can't escape the box.
  const horizontal = side === 'top' || side === 'bottom';
  const crossExtent = horizontal ? overlay.width : overlay.height;
  const triggerCentre = horizontal
    ? trigger.left + trigger.width / 2
    : trigger.top + trigger.height / 2;
  const finalCross = horizontal ? x : y;
  const inset = Math.min(alignInset || 12, crossExtent / 2);
  const arrowOffset = Math.max(inset, Math.min(triggerCentre - finalCross, crossExtent - inset));

  return { x, y, side, arrowOffset };
}
