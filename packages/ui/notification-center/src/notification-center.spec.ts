import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  KpNotification,
  KpNotificationCenterComponent,
} from './notification-center.component';
import { KpNotificationItemComponent } from './notification-item.component';

describe('KpNotificationCenterComponent', () => {
  let fixture: ComponentFixture<KpNotificationCenterComponent>;
  let host: HTMLElement;

  const items: KpNotification[] = [
    { id: 'n1', title: 'Build passed', message: 'Pipeline #42 succeeded', time: '2m', read: false, appearance: 'success' },
    { id: 'n2', title: 'New comment', message: 'Alex replied to your thread', time: '1h', read: true },
    { id: 'n3', title: 'Mention', avatarInitials: 'AK', read: false },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [KpNotificationCenterComponent] });
    fixture = TestBed.createComponent(KpNotificationCenterComponent);
    host = fixture.nativeElement as HTMLElement;
  });

  it('renders the notifications list from @Input in with-items state', () => {
    fixture.componentRef.setInput('notifications', items);
    fixture.detectChanges();

    const list = host.querySelector('.kp-notif-center__list');
    expect(list).not.toBeNull();
    expect(list?.getAttribute('role')).toBe('list');

    const renderedItems = host.querySelectorAll('kp-notification-item');
    expect(renderedItems.length).toBe(items.length);
    expect(host.textContent).toContain('Build passed');
    expect(host.textContent).toContain('New comment');
  });

  it('exposes the region landmark + accessible label on the host', () => {
    fixture.detectChanges();
    expect(host.getAttribute('role')).toBe('region');
    expect(host.getAttribute('aria-label')).toBe('Notifications');
    expect(host.className).toContain('kp-notif-center');
  });

  it('renders the empty state and hides the list', () => {
    fixture.componentRef.setInput('state', 'empty');
    fixture.componentRef.setInput('notifications', items);
    fixture.detectChanges();

    expect(host.querySelector('.kp-notif-center__list')).toBeNull();
    expect(host.querySelector('.kp-notif-center__empty')).not.toBeNull();
    expect(host.textContent).toContain("You're all caught up");
    expect(host.querySelectorAll('kp-notification-item').length).toBe(0);
  });

  it('renders skeleton placeholders in the loading state', () => {
    fixture.componentRef.setInput('state', 'loading');
    fixture.detectChanges();

    const skeletons = host.querySelectorAll('.kp-notif-center__skeleton');
    expect(skeletons.length).toBe(4);
    expect(host.querySelectorAll('kp-notification-item').length).toBe(0);
  });

  it('hides filters by default and shows them with counts when enabled', () => {
    fixture.detectChanges();
    expect(host.querySelector('.kp-notif-center__filters')).toBeNull();

    fixture.componentRef.setInput('showFilters', true);
    fixture.componentRef.setInput('filters', [
      { id: 'all', label: 'All' },
      { id: 'unread', label: 'Unread', count: 3 },
    ]);
    fixture.detectChanges();

    const filterBtns = host.querySelectorAll('.kp-notif-center__filter');
    expect(filterBtns.length).toBe(2);
    expect(host.querySelector('.kp-notif-center__count')?.textContent?.trim()).toBe('3');
  });

  it('marks the active filter and emits filterChange on click', () => {
    const emitted: string[] = [];
    fixture.componentRef.setInput('showFilters', true);
    fixture.componentRef.setInput('activeFilter', 'all');
    fixture.componentRef.setInput('filters', [
      { id: 'all', label: 'All' },
      { id: 'unread', label: 'Unread' },
    ]);
    fixture.componentInstance.filterChange.subscribe((id) => emitted.push(id));
    fixture.detectChanges();

    const filters = host.querySelectorAll<HTMLButtonElement>('.kp-notif-center__filter');
    expect(filters[0].className).toContain('kp-notif-center__filter--active');
    expect(filters[1].className).not.toContain('kp-notif-center__filter--active');

    filters[1].click();
    expect(emitted).toEqual(['unread']);
  });

  it('emits markAllRead and settingsClick from the header actions', () => {
    const markAll = vi.fn();
    const settings = vi.fn();
    fixture.componentInstance.markAllRead.subscribe(markAll);
    fixture.componentInstance.settingsClick.subscribe(settings);
    fixture.detectChanges();

    const buttons = host.querySelectorAll<HTMLButtonElement>('.kp-notif-center__header button');
    buttons[0].click();
    expect(markAll).toHaveBeenCalledTimes(1);

    const settingsBtn = host.querySelector<HTMLButtonElement>('button[aria-label="Settings"]');
    settingsBtn?.click();
    expect(settings).toHaveBeenCalledTimes(1);
  });

  it('shows the footer by default and emits viewAll on click', () => {
    const viewAll = vi.fn();
    fixture.componentInstance.viewAll.subscribe(viewAll);
    fixture.detectChanges();

    const footer = host.querySelector('.kp-notif-center__footer');
    expect(footer).not.toBeNull();
    footer?.querySelector<HTMLButtonElement>('button')?.click();
    expect(viewAll).toHaveBeenCalledTimes(1);
  });

  it('hides the footer when showFooter=false', () => {
    fixture.componentRef.setInput('showFooter', false);
    fixture.detectChanges();
    expect(host.querySelector('.kp-notif-center__footer')).toBeNull();
  });

  it('emits itemClick with the source notification when a child item fires click$', () => {
    const emitted: KpNotification[] = [];
    fixture.componentRef.setInput('notifications', items);
    fixture.componentInstance.itemClick.subscribe((n) => emitted.push(n));
    fixture.detectChanges();

    const firstChild = fixture.debugElement
      .queryAll((n) => n.name === 'kp-notification-item')[0]
      .componentInstance as KpNotificationItemComponent;
    firstChild.click$.emit();

    expect(emitted.length).toBe(1);
    expect(emitted[0].id).toBe('n1');
  });

  describe('pagination', () => {
    const five: KpNotification[] = Array.from({ length: 5 }, (_, i) => ({
      id: `p${i}`,
      title: `Item ${i}`,
    }));

    it('shows all items and no "Show more" when pageSize is null', () => {
      fixture.componentRef.setInput('notifications', five);
      fixture.detectChanges();
      expect(host.querySelectorAll('kp-notification-item').length).toBe(5);
      expect(host.querySelector('.kp-notif-center__more')).toBeNull();
    });

    it('limits to pageSize and reveals the next page on "Show more" (emitting loadMore)', () => {
      const loaded: { visible: number; total: number }[] = [];
      fixture.componentInstance.loadMore.subscribe((e) => loaded.push(e));
      fixture.componentRef.setInput('notifications', five);
      fixture.componentRef.setInput('pageSize', 2);
      fixture.detectChanges();

      expect(host.querySelectorAll('kp-notification-item').length).toBe(2);
      const more = host.querySelector('.kp-notif-center__more') as HTMLButtonElement;
      expect(more).not.toBeNull();
      // Remaining-count hint on the control.
      expect(more.textContent?.trim()).toBe('Show 3 more');
      expect(more.getAttribute('aria-label')).toBe('Show 3 more notifications');

      more.click();
      fixture.detectChanges();
      expect(host.querySelectorAll('kp-notification-item').length).toBe(4);
      expect(loaded).toEqual([{ visible: 4, total: 5 }]);
    });

    it('hides "Show more" once every item is visible (clamping the last page)', () => {
      const loaded: { visible: number; total: number }[] = [];
      fixture.componentInstance.loadMore.subscribe((e) => loaded.push(e));
      fixture.componentRef.setInput('notifications', five);
      fixture.componentRef.setInput('pageSize', 2);
      fixture.detectChanges();

      (host.querySelector('.kp-notif-center__more') as HTMLButtonElement).click();
      fixture.detectChanges();
      (host.querySelector('.kp-notif-center__more') as HTMLButtonElement).click();
      fixture.detectChanges();

      // all 5 revealed → button gone; visible clamps to total, not 6
      expect(host.querySelectorAll('kp-notification-item').length).toBe(5);
      expect(host.querySelector('.kp-notif-center__more')).toBeNull();
      expect(loaded).toEqual([
        { visible: 4, total: 5 },
        { visible: 5, total: 5 },
      ]);
    });

    it('resets the reveal window when the notifications identity changes', () => {
      fixture.componentRef.setInput('notifications', five);
      fixture.componentRef.setInput('pageSize', 2);
      fixture.detectChanges();

      (host.querySelector('.kp-notif-center__more') as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(host.querySelectorAll('kp-notification-item').length).toBe(4);

      // Swap in a fresh list (e.g. a filter change) → window collapses to pageSize.
      const replacement: KpNotification[] = Array.from({ length: 6 }, (_, i) => ({
        id: `q${i}`,
        title: `Other ${i}`,
      }));
      fixture.componentRef.setInput('notifications', replacement);
      fixture.detectChanges();

      expect(host.querySelectorAll('kp-notification-item').length).toBe(2);
      const more = host.querySelector('.kp-notif-center__more') as HTMLButtonElement;
      expect(more).not.toBeNull();
      expect(more.textContent?.trim()).toBe('Show 4 more');
    });
  });
});

describe('KpNotificationItemComponent', () => {
  let fixture: ComponentFixture<KpNotificationItemComponent>;
  let host: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [KpNotificationItemComponent] });
    fixture = TestBed.createComponent(KpNotificationItemComponent);
    host = fixture.nativeElement as HTMLElement;
  });

  it('renders title, message and time content', () => {
    fixture.componentRef.setInput('title', 'Deploy finished');
    fixture.componentRef.setInput('message', 'Production is live');
    fixture.componentRef.setInput('time', '5m ago');
    fixture.detectChanges();

    expect(host.querySelector('.kp-notif-item__title')?.textContent?.trim()).toBe('Deploy finished');
    expect(host.querySelector('.kp-notif-item__message')?.textContent?.trim()).toBe('Production is live');
    expect(host.querySelector('.kp-notif-item__time')?.textContent?.trim()).toBe('5m ago');
  });

  it('omits message and time markup when not provided', () => {
    fixture.componentRef.setInput('title', 'Just a title');
    fixture.detectChanges();
    expect(host.querySelector('.kp-notif-item__message')).toBeNull();
    expect(host.querySelector('.kp-notif-item__time')).toBeNull();
  });

  it('carries the listitem role on the host', () => {
    fixture.detectChanges();
    expect(host.getAttribute('role')).toBe('listitem');
  });

  it('applies the unread modifier class when read=false (default)', () => {
    fixture.detectChanges();
    expect(host.className).toContain('kp-notif-item');
    expect(host.className).toContain('kp-notif-item--unread');
  });

  it('drops the unread modifier class when read=true', () => {
    fixture.componentRef.setInput('read', true);
    fixture.detectChanges();
    expect(host.className).toContain('kp-notif-item');
    expect(host.className).not.toContain('kp-notif-item--unread');
  });

  it('shows the avatar status indicator only while unread', () => {
    const avatar = () => fixture.nativeElement.querySelector('kp-avatar') as HTMLElement;
    fixture.detectChanges();
    expect(avatar()).not.toBeNull();
    // unread => showStatus true on the inner avatar component
    const unreadInstance = fixture.debugElement.query(
      (n) => n.name === 'kp-avatar',
    )?.componentInstance;
    expect(unreadInstance.showStatus).toBe(true);

    fixture.componentRef.setInput('read', true);
    fixture.detectChanges();
    const readInstance = fixture.debugElement.query(
      (n) => n.name === 'kp-avatar',
    )?.componentInstance;
    expect(readInstance.showStatus).toBe(false);
  });

  it('maps appearance to a status color and keeps user avatars at default appearance', () => {
    const cmp = fixture.componentInstance;

    cmp.appearance = 'danger';
    expect(cmp.statusColor).toBe('busy');
    cmp.appearance = 'warning';
    expect(cmp.statusColor).toBe('busy');
    cmp.appearance = 'neutral';
    expect(cmp.statusColor).toBe('offline');
    cmp.appearance = 'success';
    expect(cmp.statusColor).toBe('online');

    // icon-based item adopts the appearance token
    cmp.appearance = 'info';
    cmp.avatarInitials = null;
    cmp.avatarSrc = null;
    expect(cmp.resolvedAppearance).toBe('info');

    // user avatar (initials/src) stays neutral default
    cmp.avatarInitials = 'GN';
    expect(cmp.resolvedAppearance).toBe('default');
  });

  it('exposes a click$ output that emits to subscribers', () => {
    const clicked = vi.fn();
    fixture.componentInstance.click$.subscribe(clicked);
    fixture.detectChanges();
    fixture.componentInstance.click$.emit();
    expect(clicked).toHaveBeenCalledTimes(1);
  });

  it('emits click$ on a real DOM click (row is the action)', () => {
    const clicked = vi.fn();
    fixture.componentInstance.click$.subscribe(clicked);
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).click();
    expect(clicked).toHaveBeenCalledTimes(1);
  });

  it('is keyboard-operable: focusable + Enter and Space activate', () => {
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('tabindex')).toBe('0');

    const clicked = vi.fn();
    fixture.componentInstance.click$.subscribe(clicked);
    host.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    host.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(clicked).toHaveBeenCalledTimes(2);
  });
});
