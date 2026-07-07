import { Component, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  KpVariableVirtualListComponent,
  KpVariableVirtualRowDirective,
  KpItemHeightFn,
} from './variable-virtual-list.component';

@Component({
  imports: [KpVariableVirtualListComponent, KpVariableVirtualRowDirective],
  template: `
    <kp-variable-virtual-list
      #list
      [items]="items"
      [itemHeight]="itemHeight"
      [viewportHeight]="viewportHeight"
      [overscan]="overscan"
    >
      <ng-template kpVariableVirtualRow let-row let-i="index">
        <div class="row" [attr.data-row]="i">{{ row }}</div>
      </ng-template>
    </kp-variable-virtual-list>
  `,
})
class HostCmp {
  @ViewChild('list') list!: KpVariableVirtualListComponent<string>;
  items: readonly string[] = Array.from({ length: 1000 }, (_, i) => `item-${i}`);
  // Alternating heights: even rows 20px, odd rows 40px → each pair sums to 60px.
  itemHeight: KpItemHeightFn<string> = (i) => (i % 2 === 0 ? 20 : 40);
  viewportHeight = 400;
  overscan = 4;
}

type Overrides = Partial<
  Pick<HostCmp, 'items' | 'itemHeight' | 'viewportHeight' | 'overscan'>
>;

describe('KpVariableVirtualListComponent', () => {
  function setup(overrides?: Overrides) {
    TestBed.configureTestingModule({ imports: [HostCmp] });
    const fix = TestBed.createComponent(HostCmp);
    if (overrides) Object.assign(fix.componentInstance, overrides);
    fix.detectChanges();
    return { fix, host: fix.nativeElement as HTMLElement, cmp: fix.componentInstance };
  }

  describe('offset math (varying heights)', () => {
    it('totalHeight is the sum of every row height', () => {
      // 500 pairs × (20 + 40) = 30000
      const { cmp } = setup();
      expect(cmp.list.totalHeight).toBe(30000);
    });

    it('rowHeightAt returns each row its own height', () => {
      const { cmp } = setup();
      expect(cmp.list.rowHeightAt(0)).toBe(20);
      expect(cmp.list.rowHeightAt(1)).toBe(40);
      expect(cmp.list.rowHeightAt(2)).toBe(20);
    });

    it('rendered rows carry the height returned by [itemHeight]', () => {
      const { host } = setup();
      const rows = host.querySelectorAll<HTMLElement>('.kp-variable-virtual-list__row');
      // First visible row is index 0 → 20px, second index 1 → 40px.
      expect(rows[0].style.height).toBe('20px');
      expect(rows[1].style.height).toBe('40px');
    });
  });

  describe('visible-window calculation', () => {
    it('starts at index 0 with no scroll and covers the viewport + overscan', () => {
      const { cmp } = setup();
      // scrollTop 0 → first = 0. bottom = 400; offsets[13]=380 < 400,
      // offsets[14]=420 → last = 14. end = 14 + overscan(4) = 18.
      expect(cmp.list.visibleStart).toBe(0);
      expect(cmp.list.visibleEnd).toBe(18);
    });

    it('renders only the visible window, not all 1000 rows', () => {
      const { cmp, host } = setup();
      const rendered = host.querySelectorAll('.kp-variable-virtual-list__row').length;
      expect(rendered).toBe(cmp.list.visibleEnd - cmp.list.visibleStart);
      expect(rendered).toBeLessThan(30);
      expect(rendered).toBeGreaterThan(0);
    });

    it('maps scrollTop → window via the cumulative offsets', () => {
      const { cmp } = setup();
      cmp.list.scrollToIndex(20); // offsets[20] = 600
      cmp.list.onScroll();
      // first = 20 (offsets[20]=600 ≤ 600). bottom = 1000; offsets[33]=980<1000,
      // offsets[34]=1020 → last = 34. start = 20-4 = 16, end = 34+4 = 38.
      expect(cmp.list.visibleStart).toBe(16);
      expect(cmp.list.visibleEnd).toBe(38);
    });

    it('windowTransform matches the offset of visibleStart', () => {
      const { cmp } = setup();
      cmp.list.scrollToIndex(20);
      cmp.list.onScroll();
      // offsets[16] = 8 pairs × 60 = 480
      expect(cmp.list.windowTransform).toBe('translate3d(0, 480px, 0)');
    });

    it('overscan=0 trims the window to exactly the visible span', () => {
      const { cmp } = setup({ overscan: 0 });
      expect(cmp.list.visibleStart).toBe(0);
      expect(cmp.list.visibleEnd).toBe(14);
    });

    it('scrollToIndex clamps to bounds and never over-runs the list', () => {
      const { cmp } = setup();
      cmp.list.scrollToIndex(99999);
      cmp.list.onScroll();
      expect(cmp.list.visibleEnd).toBe(1000);
    });

    it('scrollToIndex position="center" centers the target row', () => {
      const { cmp } = setup();
      cmp.list.scrollToIndex(500, 'center');
      cmp.list.onScroll();
      const center = (cmp.list.visibleStart + cmp.list.visibleEnd) / 2;
      expect(Math.abs(center - 500)).toBeLessThan(10);
    });

    it('emits rangeChange asynchronously when scroll moves the window', async () => {
      const { cmp } = setup();
      let lastRange: { start: number; end: number } | null = null;
      cmp.list.rangeChange.subscribe((r) => (lastRange = r));
      cmp.list.scrollToIndex(50); // offsets[50] = 1500
      cmp.list.onScroll();
      await Promise.resolve();
      // first = 50, bottom = 1900; offsets[63]=1880<1900, offsets[64]=1920 →
      // last = 64. start = 46, end = 68.
      expect(lastRange).toEqual({ start: 46, end: 68 });
    });
  });

  describe('edge cases', () => {
    it('handles empty items', () => {
      const { cmp } = setup({ items: [] });
      expect(cmp.list.visibleStart).toBe(0);
      expect(cmp.list.visibleEnd).toBe(0);
      expect(cmp.list.totalHeight).toBe(0);
    });

    it('handles a single item', () => {
      const { cmp, host } = setup({ items: ['only'], itemHeight: () => 40 });
      expect(cmp.list.totalHeight).toBe(40);
      expect(cmp.list.visibleStart).toBe(0);
      expect(cmp.list.visibleEnd).toBe(1);
      expect(host.querySelectorAll('.kp-variable-virtual-list__row').length).toBe(1);
    });

    it('window collapses to all items when total height < viewport', () => {
      const { cmp } = setup({
        items: ['a', 'b', 'c', 'd', 'e'],
        itemHeight: () => 40,
      });
      // 5 × 40 = 200 total; viewport 400 → all visible.
      expect(cmp.list.visibleEnd).toBe(5);
      expect(cmp.list.totalHeight).toBe(200);
    });

    it('falls back to estimatedItemHeight for a non-finite/non-positive height', () => {
      const { cmp } = setup({
        items: ['a', 'b'],
        itemHeight: () => NaN,
      });
      // estimatedItemHeight defaults to 40 → totalHeight 2 × 40.
      expect(cmp.list.totalHeight).toBe(80);
      expect(cmp.list.rowHeightAt(0)).toBe(40);
    });
  });

  describe('all-same-height equals fixed-height behaviour', () => {
    // A uniform [itemHeight] must reduce to <kp-virtual-list>'s documented math.
    it('reproduces the fixed-height window (totalHeight, start/end)', () => {
      const { cmp } = setup({ itemHeight: () => 40 });
      expect(cmp.list.totalHeight).toBe(40000);
      expect(cmp.list.visibleStart).toBe(0);
      // visibleCount = ceil(400/40) = 10; end = 0 + 10 + overscan(4) = 14.
      expect(cmp.list.visibleEnd).toBe(14);
    });

    it('reproduces the fixed-height transform after scrolling', () => {
      const { cmp } = setup({ itemHeight: () => 40 });
      cmp.list.scrollToIndex(20);
      cmp.list.onScroll();
      expect(cmp.list.visibleStart).toBe(16);
      expect(cmp.list.windowTransform).toBe('translate3d(0, 640px, 0)');
    });
  });

  describe('accessibility', () => {
    it('exposes list/listitem ARIA with set-size/pos-in-set per row', () => {
      const { host } = setup();
      const window = host.querySelector('.kp-variable-virtual-list__window');
      expect(window?.getAttribute('role')).toBe('list');
      const firstRow = host.querySelector('.kp-variable-virtual-list__row');
      expect(firstRow?.getAttribute('role')).toBe('listitem');
      expect(firstRow?.getAttribute('aria-setsize')).toBe('1000');
      expect(firstRow?.getAttribute('aria-posinset')).toBe('1');
    });
  });

  describe('trackBy', () => {
    it('uses a custom trackBy when provided', () => {
      const { fix, cmp } = setup();
      let calls = 0;
      cmp.list.trackBy = () => {
        calls++;
        return calls;
      };
      cmp.list.scrollToIndex(20);
      cmp.list.onScroll();
      fix.detectChanges();
      expect(calls).toBeGreaterThan(0);
    });
  });
});
