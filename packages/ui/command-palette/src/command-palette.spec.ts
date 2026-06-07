import { TestBed } from '@angular/core/testing';
import {
  KpCommandPaletteComponent,
  KpCommandGroup,
  KpCommandItem,
} from './command-palette.component';

const groups: KpCommandGroup[] = [
  {
    id: 'pages',
    label: 'Pages',
    items: [
      { id: 'home', label: 'Home' },
      { id: 'inbox', label: 'Inbox', hint: '12 unread' },
      { id: 'settings', label: 'Settings', shortcut: 'g s' },
    ],
  },
  {
    id: 'actions',
    label: 'Actions',
    items: [
      { id: 'new', label: 'Create new…' },
      { id: 'logout', label: 'Log out', disabled: true },
    ],
  },
];

describe('KpCommandPaletteComponent', () => {
  let activeFixture: { destroy(): void } | null = null;

  afterEach(() => {
    // Force fixture teardown so the dialog's portal element is removed
    // from <body> before the next test sets up. Without this the
    // document.body queries below are non-deterministic across the suite.
    activeFixture?.destroy();
    activeFixture = null;
  });

  function setup(open = true) {
    TestBed.configureTestingModule({ imports: [KpCommandPaletteComponent] });
    const fix = TestBed.createComponent(KpCommandPaletteComponent);
    activeFixture = fix;
    fix.componentRef.setInput('groups', groups);
    fix.componentRef.setInput('open', open);
    fix.detectChanges();
    return { fix, host: fix.nativeElement as HTMLElement, cmp: fix.componentInstance };
  }

  it('opens with the first non-disabled item active', () => {
    const { cmp } = setup();
    expect(cmp.activeItemId).toBe('home');
  });

  it('counts items across groups', () => {
    const { cmp } = setup();
    expect(cmp.totalItems).toBe(5);
  });

  it('skips disabled items in keyboard cycling', () => {
    const { cmp } = setup();
    // Cycle through all non-disabled: home → inbox → settings → new → home
    const order: string[] = [];
    for (let i = 0; i < 5; i++) {
      order.push(cmp.activeItemId!);
      (cmp as any).move(1);
    }
    expect(order).toEqual(['home', 'inbox', 'settings', 'new', 'home']);
  });

  it('ArrowDown / ArrowUp move active item', () => {
    const { cmp } = setup();
    cmp.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(cmp.activeItemId).toBe('inbox');
    cmp.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    expect(cmp.activeItemId).toBe('home');
  });

  it('Home / End jump to first / last item', () => {
    const { cmp } = setup();
    cmp.onKeydown(new KeyboardEvent('keydown', { key: 'End' }));
    expect(cmp.activeItemId).toBe('new'); // last non-disabled
    cmp.onKeydown(new KeyboardEvent('keydown', { key: 'Home' }));
    expect(cmp.activeItemId).toBe('home');
  });

  it('Enter selects the active item and emits itemSelect', () => {
    const { cmp } = setup();
    let selected: KpCommandItem | null = null;
    cmp.itemSelect.subscribe((i) => (selected = i));
    cmp.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(selected!.id).toBe('home');
  });

  it('selecting an item closes the palette', () => {
    const { cmp } = setup();
    let lastOpen: boolean | null = null;
    cmp.openChange.subscribe((o) => (lastOpen = o));
    cmp.select(groups[0].items[1]);
    expect(lastOpen).toBe(false);
  });

  it('select() ignores disabled items', () => {
    const { cmp } = setup();
    let calls = 0;
    cmp.itemSelect.subscribe(() => (calls += 1));
    cmp.select({ id: 'logout', label: 'Log out', disabled: true });
    expect(calls).toBe(0);
  });

  it('input emits filterChange', () => {
    const { cmp } = setup();
    let last = '';
    cmp.filterChange.subscribe((v) => (last = v));
    cmp.onInput({ target: { value: 'sett' } } as unknown as Event);
    expect(last).toBe('sett');
    expect(cmp.filter).toBe('sett');
  });

  it('clear() resets filter and re-anchors active item', () => {
    const { fix, cmp } = setup();
    fix.componentRef.setInput('filter', 'foo');
    cmp.activeItemId = 'inbox';
    cmp.clear();
    expect(cmp.filter).toBe('');
    expect(cmp.activeItemId).toBe('home');
  });

  it('global keydown matching shortcut combo toggles open', () => {
    const { cmp } = setup(false);
    // Cmd/Ctrl+K should open
    const ev = new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true });
    cmp.onWindowKeydown(ev);
    expect(cmp.open).toBe(true);
    cmp.onWindowKeydown(ev);
    expect(cmp.open).toBe(false);
  });

  it('global keydown ignores plain "k" without modifier', () => {
    const { cmp } = setup(false);
    cmp.onWindowKeydown(new KeyboardEvent('keydown', { key: 'k' }));
    expect(cmp.open).toBe(false);
  });

  it('shortcut=null disables global listener', () => {
    const { fix, cmp } = setup(false);
    fix.componentRef.setInput('shortcut', null);
    cmp.onWindowKeydown(new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true }));
    expect(cmp.open).toBe(false);
  });

  it('renders empty state when no items', () => {
    const { fix, cmp } = setup();
    fix.componentRef.setInput('groups', []);
    fix.detectChanges();
    expect(cmp.totalItems).toBe(0);
    // Query only the empty-state element. document.body.textContent would
    // also pick up content from prior fixtures' orphaned dialog portals
    // (until the dialog destroy-cleanup ships) — this stays test-order-safe.
    const empty = document.body.querySelector('.kp-cmdk__empty');
    expect(empty?.textContent?.trim()).toBe('No results found');
  });
});
