import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpTableToolbarComponent } from './table-toolbar.component';

describe('KpTableToolbarComponent', () => {
  let fixture: ComponentFixture<KpTableToolbarComponent>;
  let host: HTMLElement;

  function setInputs(inputs: Record<string, unknown>) {
    for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
    fixture.detectChanges();
  }

  // Buttons rendered via the `kpButton` directive whose text matches `label`.
  function buttonByText(label: string): HTMLButtonElement | undefined {
    return Array.from(host.querySelectorAll<HTMLButtonElement>('button')).find((b) =>
      (b.textContent ?? '').trim().includes(label),
    );
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [KpTableToolbarComponent] });
    fixture = TestBed.createComponent(KpTableToolbarComponent);
    host = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('reflects mode on the host class', () => {
    expect(host.className).toContain('kp-tt');
    expect(host.className).toContain('kp-tt--default');
    setInputs({ mode: 'bulk-select' });
    expect(host.className).toContain('kp-tt--bulk-select');
  });

  describe('default mode', () => {
    it('renders the search bar when showSearch is true and passes the placeholder', () => {
      setInputs({ showSearch: true, searchPlaceholder: 'Find rows…' });
      const search = host.querySelector('kp-search-bar');
      expect(search).not.toBeNull();
      const input = host.querySelector<HTMLInputElement>('kp-search-bar input');
      expect(input).not.toBeNull();
      expect(input!.getAttribute('placeholder')).toBe('Find rows…');
    });

    it('hides the search bar when showSearch is false', () => {
      setInputs({ showSearch: false });
      expect(host.querySelector('kp-search-bar')).toBeNull();
    });

    it('emits (searchChange) when the search input value changes', () => {
      const spy = vi.fn();
      fixture.componentInstance.searchChange.subscribe(spy);
      setInputs({ showSearch: true });
      const input = host.querySelector<HTMLInputElement>('kp-search-bar input')!;
      input.value = 'kanso';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      fixture.detectChanges();
      expect(spy).toHaveBeenCalledWith('kanso');
    });

    it('renders the Filters button and emits (filterClick) on click', () => {
      const spy = vi.fn();
      fixture.componentInstance.filterClick.subscribe(spy);
      setInputs({ showFilter: true });
      const btn = buttonByText('Filters');
      expect(btn).toBeDefined();
      btn!.click();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('shows the active-filter-count badge only when activeFilterCount > 0', () => {
      setInputs({ showFilter: true, activeFilterCount: 0 });
      expect(host.querySelector('kp-badge')).toBeNull();
      setInputs({ activeFilterCount: 3 });
      const badge = host.querySelector('kp-badge');
      expect(badge).not.toBeNull();
      expect(badge!.textContent!.trim()).toBe('3');
    });

    it('renders the density group with ARIA role/label and emits (densityChange)', () => {
      const spy = vi.fn();
      fixture.componentInstance.densityChange.subscribe(spy);
      setInputs({ showDensity: true, density: 'comfortable' });

      const group = host.querySelector('.kp-tt__density');
      expect(group).not.toBeNull();
      expect(group!.getAttribute('role')).toBe('group');
      expect(group!.getAttribute('aria-label')).toBe('Row density');

      const active = host.querySelector('.kp-tt__density-btn--active');
      expect(active!.getAttribute('aria-label')).toBe('Comfortable');

      const compactBtn = host.querySelector<HTMLButtonElement>(
        '.kp-tt__density-btn[aria-label="Compact"]',
      )!;
      compactBtn.click();
      expect(spy).toHaveBeenCalledWith('compact');
    });

    it('renders an aria-labelled column-picker button and emits (columnsClick)', () => {
      const spy = vi.fn();
      fixture.componentInstance.columnsClick.subscribe(spy);
      setInputs({ showColumnPicker: true });
      const btn = host.querySelector<HTMLButtonElement>('button[aria-label="Columns"]');
      expect(btn).not.toBeNull();
      btn!.click();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('renders the Export button and emits (exportClick)', () => {
      const spy = vi.fn();
      fixture.componentInstance.exportClick.subscribe(spy);
      setInputs({ showExport: true });
      const btn = buttonByText('Export');
      expect(btn).toBeDefined();
      btn!.click();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('renders the create button with a custom label and emits (createClick)', () => {
      const spy = vi.fn();
      fixture.componentInstance.createClick.subscribe(spy);
      setInputs({ showCreate: true, createLabel: 'New widget' });
      const btn = buttonByText('New widget');
      expect(btn).toBeDefined();
      btn!.click();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('only draws the right-side divider when right actions accompany create', () => {
      setInputs({ showCreate: true, showExport: false, showDensity: false, showColumnPicker: false });
      expect(host.querySelector('.kp-tt__divider')).toBeNull();
      setInputs({ showExport: true });
      expect(host.querySelector('.kp-tt__divider')).not.toBeNull();
    });

    it('hides Sort by default and shows it when showSort is true', () => {
      expect(buttonByText('Sort')).toBeUndefined();
      const spy = vi.fn();
      fixture.componentInstance.sortClick.subscribe(spy);
      setInputs({ showSort: true });
      const btn = buttonByText('Sort');
      expect(btn).toBeDefined();
      btn!.click();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('bulk-select mode', () => {
    beforeEach(() => setInputs({ mode: 'bulk-select' }));

    it('pluralises the selection count (singular)', () => {
      setInputs({ selectedCount: 1 });
      const label = host.querySelector('.kp-tt__selected')!;
      expect(label.textContent!.replace(/\s+/g, ' ').trim()).toBe('1 item selected');
    });

    it('pluralises the selection count (plural)', () => {
      setInputs({ selectedCount: 5 });
      const label = host.querySelector('.kp-tt__selected')!;
      expect(label.textContent!.replace(/\s+/g, ' ').trim()).toBe('5 items selected');
    });

    it('does not render the search bar in bulk-select mode', () => {
      setInputs({ showSearch: true });
      expect(host.querySelector('kp-search-bar')).toBeNull();
    });

    it('emits (clearSelection) from the clear button', () => {
      const spy = vi.fn();
      fixture.componentInstance.clearSelection.subscribe(spy);
      buttonByText('Clear selection')!.click();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('renders all bulk actions and wires their outputs', () => {
      const ci = fixture.componentInstance;
      const exportSpy = vi.fn();
      const tagSpy = vi.fn();
      const moveSpy = vi.fn();
      const deleteSpy = vi.fn();
      ci.bulkExport.subscribe(exportSpy);
      ci.bulkTag.subscribe(tagSpy);
      ci.bulkMove.subscribe(moveSpy);
      ci.bulkDelete.subscribe(deleteSpy);

      buttonByText('Export selected')!.click();
      buttonByText('Tag')!.click();
      buttonByText('Move to')!.click();
      buttonByText('Delete')!.click();

      expect(exportSpy).toHaveBeenCalledTimes(1);
      expect(tagSpy).toHaveBeenCalledTimes(1);
      expect(moveSpy).toHaveBeenCalledTimes(1);
      expect(deleteSpy).toHaveBeenCalledTimes(1);
    });
  });
});
