import { computeOverlayPosition, KpOverlayRect } from './overlay-position';

const trigger: KpOverlayRect = {
  // a 100×40 trigger at viewport centre-ish
  left: 500, right: 600, top: 300, bottom: 340, width: 100, height: 40,
};
const viewport = { width: 1200, height: 800 };
const overlay = { width: 200, height: 120 };

describe('computeOverlayPosition', () => {
  it('places below the trigger for side=bottom, centred horizontally', () => {
    const r = computeOverlayPosition({ trigger, overlay, side: 'bottom', gap: 8, viewport });
    expect(r.side).toBe('bottom');
    expect(r.y).toBe(trigger.bottom + 8);
    // centre: triggerCenterX (550) - overlay.width/2 (100) = 450
    expect(r.x).toBe(450);
  });

  it('places above the trigger for side=top', () => {
    const r = computeOverlayPosition({ trigger, overlay, side: 'top', gap: 8, viewport });
    expect(r.side).toBe('top');
    expect(r.y).toBe(trigger.top - overlay.height - 8);
  });

  it('flips bottom→top when not enough space below', () => {
    const lowTrigger: KpOverlayRect = { ...trigger, top: 760, bottom: 790 };
    const r = computeOverlayPosition({ trigger: lowTrigger, overlay, side: 'bottom', gap: 8, viewport });
    expect(r.side).toBe('top');
  });

  it('flips right→left when not enough space to the right', () => {
    const rightTrigger: KpOverlayRect = { ...trigger, left: 1100, right: 1180 };
    const r = computeOverlayPosition({ trigger: rightTrigger, overlay, side: 'right', gap: 8, viewport });
    expect(r.side).toBe('left');
  });

  it('clamps x within the viewport gutter', () => {
    const edgeTrigger: KpOverlayRect = { ...trigger, left: 1150, right: 1190, width: 40 };
    const r = computeOverlayPosition({ trigger: edgeTrigger, overlay, side: 'bottom', gap: 8, viewport });
    expect(r.x).toBeLessThanOrEqual(viewport.width - overlay.width - 4);
    expect(r.x).toBeGreaterThanOrEqual(4);
  });

  it('honours align=start via alignInset', () => {
    const r = computeOverlayPosition({
      trigger, overlay, side: 'bottom', gap: 8, viewport, align: 'start', alignInset: 12,
    });
    // start: triggerCenterX (550) - alignInset (12) = 538
    expect(r.x).toBe(538);
  });

  it('honours align=end via alignInset', () => {
    const r = computeOverlayPosition({
      trigger, overlay, side: 'bottom', gap: 8, viewport, align: 'end', alignInset: 12,
    });
    // end: triggerCenterX (550) - (overlay.width - alignInset) = 550 - 188 = 362
    expect(r.x).toBe(362);
  });

  describe('arrowOffset (keeps pointing at the trigger after clamping)', () => {
    it('centres the arrow when the overlay is not clamped', () => {
      const r = computeOverlayPosition({ trigger, overlay, side: 'bottom', gap: 8, viewport });
      // overlay at x=450, trigger centre 550 → arrow at 100 = overlay.width/2
      expect(r.arrowOffset).toBe(100);
    });

    it('re-points the arrow at the trigger when clamped to the RIGHT edge', () => {
      // trigger hugging the right edge; the centred overlay would overflow and
      // gets clamped left — the arrow must shift right to still hit the trigger.
      const edge: KpOverlayRect = { ...trigger, left: 1150, right: 1190, width: 40 };
      const r = computeOverlayPosition({ trigger: edge, overlay, side: 'bottom', gap: 8, viewport, alignInset: 12 });
      const triggerCentre = edge.left + edge.width / 2; // 1170
      // arrow tip (overlay-left x + arrowOffset) should equal the trigger centre…
      expect(r.x + r.arrowOffset).toBeCloseTo(triggerCentre, 5);
      // …and stay inside the rounded corner.
      expect(r.arrowOffset).toBeGreaterThanOrEqual(12);
      expect(r.arrowOffset).toBeLessThanOrEqual(overlay.width - 12);
    });

    it('re-points the arrow at the trigger when clamped to the LEFT edge', () => {
      const edge: KpOverlayRect = { ...trigger, left: 10, right: 50, width: 40 };
      const r = computeOverlayPosition({ trigger: edge, overlay, side: 'bottom', gap: 8, viewport, alignInset: 12 });
      const triggerCentre = edge.left + edge.width / 2; // 30
      expect(r.x).toBe(4); // clamped to the left gutter
      expect(r.x + r.arrowOffset).toBeCloseTo(triggerCentre, 5);
      expect(r.arrowOffset).toBeGreaterThanOrEqual(12);
    });

    it('clamps the arrow to the corner when the trigger is beyond the overlay edge', () => {
      // trigger so far past the edge that the true centre would push the arrow
      // out of the box — it must stop at the inset.
      const edge: KpOverlayRect = { ...trigger, left: 1196, right: 1200, width: 4 };
      const r = computeOverlayPosition({ trigger: edge, overlay, side: 'bottom', gap: 8, viewport, alignInset: 12 });
      expect(r.arrowOffset).toBeLessThanOrEqual(overlay.width - 12);
      expect(r.arrowOffset).toBeGreaterThanOrEqual(12);
    });
  });
});
