import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpFilterBarComponent, KpFilterChip } from './filter-bar.component';

describe('KpFilterBarComponent', () => {
  let fixture: ComponentFixture<KpFilterBarComponent>;
  let host: HTMLElement;

  const CHIPS: KpFilterChip[] = [
    { id: 'status', label: 'Status: Active', color: 'primary' },
    { id: 'cat', label: 'Category: 3 selected' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [KpFilterBarComponent] });
    fixture = TestBed.createComponent(KpFilterBarComponent);
    host = fixture.nativeElement as HTMLElement;
  });

  const badges = () => Array.from(host.querySelectorAll('kp-badge'));
  const closeBtn = (badge: Element) =>
    badge.querySelector('.kp-badge__close') as HTMLButtonElement;

  it('renders one chip per filter with its label as text', () => {
    fixture.componentRef.setInput('filters', CHIPS);
    fixture.detectChanges();

    const chips = badges();
    expect(chips.length).toBe(2);
    expect(chips[0].textContent).toContain('Status: Active');
    expect(chips[1].textContent).toContain('Category: 3 selected');
  });

  it('renders no chips when filters is empty', () => {
    fixture.componentRef.setInput('filters', []);
    fixture.detectChanges();
    expect(badges().length).toBe(0);
  });

  it('passes the chip color through, defaulting to neutral when absent', () => {
    fixture.componentRef.setInput('filters', CHIPS);
    fixture.detectChanges();

    const chips = badges();
    // color="primary" → kp-badge--primary; missing color → neutral default
    expect(chips[0].className).toContain('primary');
    expect(chips[1].className).toContain('neutral');
  });

  it('every chip exposes a closable Remove button', () => {
    fixture.componentRef.setInput('filters', CHIPS);
    fixture.detectChanges();

    badges().forEach((b) => {
      const btn = closeBtn(b);
      expect(btn).toBeTruthy();
      expect(btn.getAttribute('aria-label')).toBe('Remove');
    });
  });

  it('emits removeFilter with the chip id when its close button is clicked', () => {
    fixture.componentRef.setInput('filters', CHIPS);
    fixture.detectChanges();

    const removed: string[] = [];
    fixture.componentInstance.removeFilter.subscribe((id) => removed.push(id));

    closeBtn(badges()[1]).click();
    fixture.detectChanges();

    expect(removed).toEqual(['cat']);
  });

  // --- Add filter affordance (showAddFilter, default true) ----------------

  it('shows the "Add filter" button by default and emits addFilter on click', () => {
    fixture.detectChanges();

    const spy = vi.fn();
    fixture.componentInstance.addFilter.subscribe(spy);

    const btn = Array.from(host.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Add filter'),
    ) as HTMLButtonElement;
    expect(btn).toBeTruthy();

    btn.click();
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('hides the "Add filter" button when showAddFilter is false', () => {
    fixture.componentRef.setInput('showAddFilter', false);
    fixture.detectChanges();

    const btn = Array.from(host.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Add filter'),
    );
    expect(btn).toBeUndefined();
  });

  // --- Save filter affordance (showSaveFilter, default false) -------------

  it('hides the "Save filter" button by default', () => {
    fixture.detectChanges();
    const btn = Array.from(host.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Save filter'),
    );
    expect(btn).toBeUndefined();
  });

  it('shows the "Save filter" button and emits saveFilter when enabled', () => {
    fixture.componentRef.setInput('showSaveFilter', true);
    fixture.detectChanges();

    const spy = vi.fn();
    fixture.componentInstance.saveFilter.subscribe(spy);

    const btn = Array.from(host.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Save filter'),
    ) as HTMLButtonElement;
    expect(btn).toBeTruthy();

    btn.click();
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  // --- Clear all affordance (showClearAll && filters.length > 0) ----------

  it('hides "Clear all" when there are no filters even if showClearAll is true', () => {
    fixture.componentRef.setInput('filters', []);
    fixture.componentRef.setInput('showClearAll', true);
    fixture.detectChanges();

    const btn = Array.from(host.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Clear all'),
    );
    expect(btn).toBeUndefined();
  });

  it('shows "Clear all" when filters exist and emits clearAll on click', () => {
    fixture.componentRef.setInput('filters', CHIPS);
    fixture.detectChanges();

    const spy = vi.fn();
    fixture.componentInstance.clearAll.subscribe(spy);

    const btn = Array.from(host.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Clear all'),
    ) as HTMLButtonElement;
    expect(btn).toBeTruthy();

    btn.click();
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('hides "Clear all" when showClearAll is false despite present filters', () => {
    fixture.componentRef.setInput('filters', CHIPS);
    fixture.componentRef.setInput('showClearAll', false);
    fixture.detectChanges();

    const btn = Array.from(host.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Clear all'),
    );
    expect(btn).toBeUndefined();
  });

  it('applies the kp-fb host class', () => {
    fixture.detectChanges();
    expect(host.classList.contains('kp-fb')).toBe(true);
  });
});
