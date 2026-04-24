import { TestBed } from '@angular/core/testing';
import { KpTreeComponent, KpTreeNode } from './tree.component';

const TREE: KpTreeNode[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      { id: 'src/a.ts', label: 'a.ts' },
      {
        id: 'src/utils',
        label: 'utils',
        children: [
          { id: 'src/utils/x.ts', label: 'x.ts' },
          { id: 'src/utils/y.ts', label: 'y.ts' },
        ],
      },
    ],
  },
  { id: 'README', label: 'README.md' },
  { id: 'locked', label: 'locked', disabled: true },
];

describe('KpTreeComponent', () => {
  function setup(extra: Record<string, unknown> = {}) {
    TestBed.configureTestingModule({ imports: [KpTreeComponent] });
    const fix = TestBed.createComponent(KpTreeComponent);
    fix.componentRef.setInput('data', TREE);
    for (const [k, v] of Object.entries(extra)) fix.componentRef.setInput(k, v);
    fix.detectChanges();
    return { fix, host: fix.nativeElement as HTMLElement, cmp: fix.componentInstance };
  }

  const rootRows = (host: HTMLElement) =>
    Array.from(host.querySelectorAll<HTMLElement>('ul.kp-tree__list > li > .kp-tree__row'));

  it('renders one root row per top-level node and exposes role="tree"', () => {
    const { host } = setup();
    expect(host.querySelector('.kp-tree__list')?.getAttribute('role')).toBe('tree');
    expect(rootRows(host).length).toBe(3);
  });

  it('isExpandable defaults to "has children" but is overridable per node', () => {
    const { cmp } = setup();
    expect(cmp.isExpandable(TREE[0])).toBe(true);
    expect(cmp.isExpandable(TREE[1])).toBe(false);
    expect(cmp.isExpandable({ id: 'lazy', label: 'Lazy', expandable: true })).toBe(true);
  });

  it('paddingForLevel scales with level (md)', () => {
    const md = setup().cmp;
    expect(md.paddingForLevel(0)).toBe(12);
    expect(md.paddingForLevel(1)).toBe(36);
  });

  it('paddingForLevel uses smaller base + indent at sm', () => {
    const sm = setup({ size: 'sm' }).cmp;
    expect(sm.paddingForLevel(0)).toBe(8);
    expect(sm.paddingForLevel(2)).toBe(48);
  });

  it('toggleExpanded adds / removes id from expanded and emits expandedChange', () => {
    const { cmp } = setup();
    const spy = vi.fn();
    cmp.expandedChange.subscribe(spy);
    cmp.toggleExpanded(TREE[0], new MouseEvent('click'));
    expect(cmp.expanded).toContain('src');
    expect(spy).toHaveBeenLastCalledWith(['src']);
    cmp.toggleExpanded(TREE[0], new MouseEvent('click'));
    expect(cmp.expanded).not.toContain('src');
    expect(spy).toHaveBeenLastCalledWith([]);
  });

  it('toggleExpanded ignores disabled nodes', () => {
    const { cmp } = setup();
    const spy = vi.fn();
    cmp.expandedChange.subscribe(spy);
    cmp.toggleExpanded(TREE[2], new MouseEvent('click'));
    expect(spy).not.toHaveBeenCalled();
  });

  it('row click emits nodeClick + selectedChange', () => {
    const { cmp } = setup();
    const click = vi.fn();
    const selected = vi.fn();
    cmp.nodeClick.subscribe(click);
    cmp.selectedChange.subscribe(selected);
    cmp.onRowClick(TREE[1]);
    expect(click).toHaveBeenCalledWith(TREE[1]);
    expect(selected).toHaveBeenCalledWith('README');
  });

  it('row click is a no-op on a disabled node', () => {
    const { cmp } = setup();
    const selected = vi.fn();
    cmp.selectedChange.subscribe(selected);
    cmp.onRowClick(TREE[2]);
    expect(selected).not.toHaveBeenCalled();
  });

  it('checkState: leaf reflects whether its id is in `checked`', () => {
    const { cmp } = setup();
    expect(cmp.checkState(TREE[1])).toBe('unchecked');
    cmp.checked = ['README'];
    expect(cmp.checkState(TREE[1])).toBe('checked');
  });

  it('checkState: parent is "checked" when every leaf is checked, "indeterminate" partway', () => {
    const { cmp } = setup();
    cmp.checked = ['src/a.ts', 'src/utils/x.ts', 'src/utils/y.ts'];
    expect(cmp.checkState(TREE[0])).toBe('checked');
    cmp.checked = ['src/a.ts'];
    expect(cmp.checkState(TREE[0])).toBe('indeterminate');
    cmp.checked = [];
    expect(cmp.checkState(TREE[0])).toBe('unchecked');
  });

  it('toggleChecked on a parent flips every descendant leaf and emits the new set', () => {
    const { cmp } = setup();
    const spy = vi.fn();
    cmp.checkedChange.subscribe(spy);
    cmp.toggleChecked(TREE[0]); // src
    expect(cmp.checked.sort()).toEqual(['src/a.ts', 'src/utils/x.ts', 'src/utils/y.ts'].sort());
    expect(spy).toHaveBeenCalled();
    cmp.toggleChecked(TREE[0]); // unchecks all again
    expect(cmp.checked).toEqual([]);
  });

  it('toggleChecked on a leaf only adds that one id', () => {
    const { cmp } = setup();
    cmp.toggleChecked(TREE[1]); // README
    expect(cmp.checked).toEqual(['README']);
  });

  it('hostClasses reflects size', () => {
    const { host } = setup({ size: 'sm' });
    expect(host.classList.contains('kp-tree--sm')).toBe(true);
  });

  it('aria-selected is set on the selected row', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('selected', 'README');
    fix.detectChanges();
    // Top-level <li>s — README is the second.
    const topLevel = Array.from(host.querySelectorAll<HTMLElement>('ul.kp-tree__list > li.kp-tree__node'));
    const readmeLi = topLevel[1];
    expect(readmeLi.querySelector('.kp-tree__label')?.textContent?.trim()).toBe('README.md');
    expect(readmeLi.getAttribute('aria-selected')).toBe('true');
  });

  // ─── Keyboard navigation ──────────────────────────────────────────────

  it('initial tabindex=0 is on the first enabled root node (or selected if set)', () => {
    const { fix, host } = setup();
    fix.detectChanges();
    const src = host.querySelector('li[data-node-id="src"]');
    expect(src?.getAttribute('tabindex')).toBe('0');
    const readme = host.querySelector('li[data-node-id="README"]');
    expect(readme?.getAttribute('tabindex')).toBe('-1');
  });

  it('ArrowDown moves focus to the next visible node; ArrowUp moves back', () => {
    const { fix, cmp } = setup({ expanded: ['src'] });
    cmp.focusedId = 'src';
    cmp.onKeyDown(new KeyboardEvent('keydown', { key: 'ArrowDown' }), TREE[0]);
    expect(cmp.focusedId).toBe('src/a.ts');
    fix.detectChanges();
    cmp.onKeyDown(new KeyboardEvent('keydown', { key: 'ArrowUp' }), cmp.data.find((d) => d.id === 'src')!.children![0]);
    expect(cmp.focusedId).toBe('src');
  });

  it('ArrowRight on a collapsed expandable node expands it', () => {
    const { cmp } = setup();
    cmp.focusedId = 'src';
    const spy = vi.fn();
    cmp.expandedChange.subscribe(spy);
    cmp.onKeyDown(new KeyboardEvent('keydown', { key: 'ArrowRight' }), TREE[0]);
    expect(cmp.expanded).toContain('src');
    expect(spy).toHaveBeenCalledWith(['src']);
  });

  it('ArrowRight on an already-expanded node moves focus to the first child', () => {
    const { cmp } = setup({ expanded: ['src'] });
    cmp.focusedId = 'src';
    cmp.onKeyDown(new KeyboardEvent('keydown', { key: 'ArrowRight' }), TREE[0]);
    expect(cmp.focusedId).toBe('src/a.ts');
  });

  it('ArrowLeft on an expanded node collapses it', () => {
    const { cmp } = setup({ expanded: ['src'] });
    cmp.focusedId = 'src';
    cmp.onKeyDown(new KeyboardEvent('keydown', { key: 'ArrowLeft' }), TREE[0]);
    expect(cmp.expanded).not.toContain('src');
  });

  it('ArrowLeft on a leaf focuses the parent', () => {
    const { cmp } = setup({ expanded: ['src'] });
    cmp.focusedId = 'src/a.ts';
    cmp.onKeyDown(new KeyboardEvent('keydown', { key: 'ArrowLeft' }), TREE[0].children![0]);
    expect(cmp.focusedId).toBe('src');
  });

  it('Home focuses the first enabled node; End focuses the last visible non-disabled node', () => {
    const { cmp } = setup({ expanded: ['src'] });
    cmp.focusedId = 'src/a.ts';
    cmp.onKeyDown(new KeyboardEvent('keydown', { key: 'Home' }), TREE[0].children![0]);
    expect(cmp.focusedId).toBe('src');
    cmp.onKeyDown(new KeyboardEvent('keydown', { key: 'End' }), TREE[0]);
    // Last visible non-disabled is README ("locked" is disabled).
    expect(cmp.focusedId).toBe('README');
  });

  it('Enter on the focused node selects it', () => {
    const { cmp } = setup();
    cmp.focusedId = 'README';
    const spy = vi.fn();
    cmp.selectedChange.subscribe(spy);
    cmp.onKeyDown(new KeyboardEvent('keydown', { key: 'Enter' }), TREE[1]);
    expect(spy).toHaveBeenCalledWith('README');
  });

  it('key presses on a disabled node are ignored', () => {
    const { cmp } = setup();
    cmp.focusedId = 'locked';
    cmp.onKeyDown(new KeyboardEvent('keydown', { key: 'ArrowUp' }), TREE[2]);
    expect(cmp.focusedId).toBe('locked');
  });
});
