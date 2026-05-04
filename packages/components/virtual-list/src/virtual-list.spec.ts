import { Component, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  KpVirtualListComponent,
  KpVirtualRowDirective,
} from './virtual-list.component';

@Component({
  imports: [KpVirtualListComponent, KpVirtualRowDirective],
  template: `
    <kp-virtual-list
      #list
      [items]="items"
      [itemHeight]="itemHeight"
      [viewportHeight]="viewportHeight"
      [overscan]="overscan"
    >
      <ng-template kpVirtualRow let-row let-i="index">
        <div class="row" [attr.data-row]="i">{{ row }}</div>
      </ng-template>
    </kp-virtual-list>
  `,
})
class HostCmp {
  @ViewChild('list') list!: KpVirtualListComponent<string>;
  items: readonly string[] = Array.from({ length: 1000 }, (_, i) => `item-${i}`);
  itemHeight = 40;
  viewportHeight = 400;
  overscan = 4;
}

describe('KpVirtualListComponent', () => {
  function setup(items?: readonly string[]) {
    TestBed.configureTestingModule({ imports: [HostCmp] });
    const fix = TestBed.createComponent(HostCmp);
    if (items !== undefined) fix.componentInstance.items = items;
    fix.detectChanges();
    return { fix, host: fix.nativeElement as HTMLElement, cmp: fix.componentInstance };
  }

  it('totalHeight = items.length * itemHeight', () => {
    const { cmp } = setup();
    expect(cmp.list.totalHeight).toBe(40000);
  });

  it('renders only the visible window + overscan, not all 1000 rows', () => {
    const { cmp, host } = setup();
    expect(cmp.list.visibleEnd - cmp.list.visibleStart).toBeLessThanOrEqual(18);
    const rendered = host.querySelectorAll('.kp-virtual-list__row').length;
    expect(rendered).toBeLessThanOrEqual(18);
    expect(rendered).toBeGreaterThan(0);
  });

  it('starts at index 0 with no scroll', () => {
    const { cmp } = setup();
    expect(cmp.list.visibleStart).toBe(0);
    // visibleCount = ceil(400/40) = 10; end = 0 + 10 + overscan(4) = 14
    expect(cmp.list.visibleEnd).toBe(14);
  });

  it('window translate matches visibleStart after scroll', () => {
    const { cmp } = setup();
    cmp.list.scrollToIndex(20);
    cmp.list.onScroll();
    // After scrollToIndex(20): scrollTop = 800, firstVisible = 20, start = 16
    expect(cmp.list.visibleStart).toBe(16);
    expect(cmp.list.windowTransform).toBe('translate3d(0, 640px, 0)');
  });

  it('scrollToIndex with position="center" centers the row', () => {
    const { cmp } = setup();
    cmp.list.scrollToIndex(500, 'center');
    cmp.list.onScroll();
    const center = (cmp.list.visibleStart + cmp.list.visibleEnd) / 2;
    expect(Math.abs(center - 500)).toBeLessThan(8);
  });

  it('scrollToIndex clamps to bounds', () => {
    const { cmp } = setup();
    cmp.list.scrollToIndex(99999);
    cmp.list.onScroll();
    expect(cmp.list.visibleEnd).toBe(1000);
  });

  it('handles empty items', () => {
    const { cmp } = setup([]);
    expect(cmp.list.visibleStart).toBe(0);
    expect(cmp.list.visibleEnd).toBe(0);
    expect(cmp.list.totalHeight).toBe(0);
  });

  it('window collapses to all items when total < viewport capacity', () => {
    const { cmp } = setup(['tiny-0', 'tiny-1', 'tiny-2', 'tiny-3', 'tiny-4']);
    // 5 rows * 40 = 200 total; viewport 400 = all visible
    expect(cmp.list.visibleEnd).toBe(5);
    expect(cmp.list.totalHeight).toBe(200);
  });

  it('overscan=0 renders only visibleCount rows', () => {
    TestBed.configureTestingModule({ imports: [HostCmp] });
    const fix = TestBed.createComponent(HostCmp);
    fix.componentInstance.overscan = 0;
    fix.detectChanges();
    expect(fix.componentInstance.list.visibleEnd).toBe(10);
  });

  it('overscan=20 expands the window', () => {
    TestBed.configureTestingModule({ imports: [HostCmp] });
    const fix = TestBed.createComponent(HostCmp);
    fix.componentInstance.overscan = 20;
    fix.detectChanges();
    expect(fix.componentInstance.list.visibleEnd).toBe(30);
  });

  it('emits rangeChange asynchronously when scroll moves the window', async () => {
    const { fix, cmp } = setup();
    let lastRange: { start: number; end: number } | null = null;
    cmp.list.rangeChange.subscribe((r) => (lastRange = r));
    cmp.list.scrollToIndex(50);
    cmp.list.onScroll();
    await Promise.resolve();
    expect(lastRange).toEqual({ start: 46, end: 64 });
  });

  it('sets aria-rowcount on host and aria-rowindex on rows', () => {
    const { host, fix } = setup();
    expect(host.querySelector('kp-virtual-list')?.getAttribute('aria-rowcount')).toBe('1000');
    fix.detectChanges();
    const firstRow = host.querySelector('.kp-virtual-list__row');
    expect(firstRow?.getAttribute('aria-rowindex')).toBe('1');
    expect(firstRow?.getAttribute('role')).toBe('listitem');
  });

  it('uses custom trackBy when provided', () => {
    const { fix, cmp } = setup();
    let trackByCalls = 0;
    cmp.list.trackBy = (i) => {
      trackByCalls++;
      return i;
    };
    cmp.list.scrollToIndex(20);
    cmp.list.onScroll();
    fix.detectChanges();
    expect(trackByCalls).toBeGreaterThan(0);
  });
});
