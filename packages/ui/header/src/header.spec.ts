import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpHeaderComponent, KpHeaderNavItem } from './header.component';

describe('KpHeaderComponent', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [KpHeaderComponent] });
    const fix: ComponentFixture<KpHeaderComponent> =
      TestBed.createComponent(KpHeaderComponent);
    return { fix, host: fix.nativeElement as HTMLElement };
  }

  it('exposes the banner landmark role on the host', () => {
    const { fix, host } = setup();
    fix.detectChanges();
    expect(host.getAttribute('role')).toBe('banner');
  });

  it('applies size + appearance host classes', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('size', 'lg');
    fix.componentRef.setInput('appearance', 'dark');
    fix.detectChanges();
    expect(host.className).toContain('kp-header');
    expect(host.className).toContain('kp-header--lg');
    expect(host.className).toContain('kp-header--dark');
  });

  describe('logo', () => {
    it('renders the default logo with logoText when showLogo=true (default)', () => {
      const { fix, host } = setup();
      fix.componentRef.setInput('logoText', 'Acme Corp');
      fix.detectChanges();
      expect(host.querySelector('.kp-header__logo')).not.toBeNull();
      expect(host.querySelector('.kp-header__logo-text')?.textContent).toContain(
        'Acme Corp',
      );
    });

    it('omits the logo block when showLogo=false', () => {
      const { fix, host } = setup();
      fix.componentRef.setInput('showLogo', false);
      fix.detectChanges();
      expect(host.querySelector('.kp-header__logo')).toBeNull();
    });
  });

  describe('primary nav', () => {
    const nav: KpHeaderNavItem[] = [
      { label: 'Dashboard', href: '/dash', active: true },
      { label: 'Reports', href: '/reports' },
    ];

    it('renders nav items with the Primary aria-label and href/aria-current', () => {
      const { fix, host } = setup();
      fix.componentRef.setInput('navItems', nav);
      fix.detectChanges();

      const navEl = host.querySelector('nav.kp-header__nav');
      expect(navEl?.getAttribute('aria-label')).toBe('Primary');

      const items = host.querySelectorAll('.kp-header__nav-item');
      expect(items.length).toBe(2);
      expect(items[0].textContent).toContain('Dashboard');
      expect(items[0].getAttribute('href')).toBe('/dash');
      expect(items[0].getAttribute('aria-current')).toBe('page');
      expect(items[0].classList.contains('kp-header__nav-item--active')).toBe(true);

      expect(items[1].getAttribute('aria-current')).toBeNull();
      expect(items[1].classList.contains('kp-header__nav-item--active')).toBe(false);
    });

    it('does not render the nav when there are no items', () => {
      const { fix, host } = setup();
      fix.detectChanges();
      expect(host.querySelector('nav.kp-header__nav')).toBeNull();
    });

    it('does not render the nav when showMainNav=false even with items', () => {
      const { fix, host } = setup();
      fix.componentRef.setInput('navItems', nav);
      fix.componentRef.setInput('showMainNav', false);
      fix.detectChanges();
      expect(host.querySelector('nav.kp-header__nav')).toBeNull();
    });
  });

  describe('search slot', () => {
    it('renders the search placeholder with role=search when showSearch=true', () => {
      const { fix, host } = setup();
      fix.componentRef.setInput('showSearch', true);
      fix.componentRef.setInput('searchPlaceholder', 'Find files…');
      fix.detectChanges();

      const search = host.querySelector('.kp-header__search-placeholder');
      expect(search).not.toBeNull();
      expect(search?.getAttribute('role')).toBe('search');
      expect(search?.textContent).toContain('Find files…');
    });

    it('omits the search placeholder by default (showSearch=false)', () => {
      const { fix, host } = setup();
      fix.detectChanges();
      expect(host.querySelector('.kp-header__search-placeholder')).toBeNull();
    });
  });

  describe('theme toggle', () => {
    it('is hidden by default and emits themeToggle on click when shown', () => {
      const { fix, host } = setup();
      fix.detectChanges();
      expect(
        host.querySelector('button[aria-label="Toggle theme"]'),
      ).toBeNull();

      fix.componentRef.setInput('showThemeToggle', true);
      fix.detectChanges();

      const spy = vi.fn();
      fix.componentInstance.themeToggle.subscribe(spy);
      const btn = host.querySelector<HTMLButtonElement>(
        'button[aria-label="Toggle theme"]',
      );
      expect(btn).not.toBeNull();
      btn!.click();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('notifications', () => {
    it('renders by default and emits notificationsClick on click', () => {
      const { fix, host } = setup();
      fix.detectChanges();

      const spy = vi.fn();
      fix.componentInstance.notificationsClick.subscribe(spy);
      const btn = host.querySelector<HTMLButtonElement>(
        'button[aria-label="Notifications"]',
      );
      expect(btn).not.toBeNull();
      btn!.click();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('shows the count badge only when notificationsCount is set', () => {
      const { fix, host } = setup();
      fix.detectChanges();
      expect(host.querySelector('.kp-header__notif-badge')).toBeNull();

      fix.componentRef.setInput('notificationsCount', 5);
      fix.detectChanges();
      const badge = host.querySelector('.kp-header__notif-badge');
      expect(badge).not.toBeNull();
      expect(badge?.getAttribute('aria-live')).toBe('polite');
      expect(badge?.textContent).toContain('5');
    });

    it('hides the notifications button when showNotifications=false', () => {
      const { fix, host } = setup();
      fix.componentRef.setInput('showNotifications', false);
      fix.detectChanges();
      expect(
        host.querySelector('button[aria-label="Notifications"]'),
      ).toBeNull();
    });
  });

  describe('cta', () => {
    it('is hidden by default and emits ctaClick on click when shown', () => {
      const { fix, host } = setup();
      fix.detectChanges();
      expect(host.querySelector('.kp-header__cta')).toBeNull();

      fix.componentRef.setInput('showCta', true);
      fix.componentRef.setInput('ctaLabel', 'Upgrade');
      fix.detectChanges();

      const spy = vi.fn();
      fix.componentInstance.ctaClick.subscribe(spy);
      const btn = host.querySelector<HTMLButtonElement>('.kp-header__cta');
      expect(btn).not.toBeNull();
      expect(btn!.textContent).toContain('Upgrade');
      btn!.click();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('user menu', () => {
    it('renders by default and emits userMenuClick on click', () => {
      const { fix, host } = setup();
      fix.componentRef.setInput('userName', 'Greg Black');
      fix.detectChanges();

      const btn = host.querySelector<HTMLButtonElement>('.kp-header__user');
      expect(btn).not.toBeNull();
      expect(btn!.getAttribute('aria-label')).toBe('Greg Black');

      const spy = vi.fn();
      fix.componentInstance.userMenuClick.subscribe(spy);
      btn!.click();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('falls back to "User menu" aria-label when no userName', () => {
      const { fix, host } = setup();
      fix.detectChanges();
      const btn = host.querySelector('.kp-header__user');
      expect(btn?.getAttribute('aria-label')).toBe('User menu');
    });

    it('shows name + role text on md/lg but not on sm', () => {
      const { fix, host } = setup();
      fix.componentRef.setInput('userName', 'Greg Black');
      fix.componentRef.setInput('userRole', 'Admin');
      fix.detectChanges();
      expect(host.querySelector('.kp-header__user-text')).not.toBeNull();
      expect(host.querySelector('.kp-header__user-name')?.textContent).toContain(
        'Greg Black',
      );
      expect(host.querySelector('.kp-header__user-role')?.textContent).toContain(
        'Admin',
      );

      fix.componentRef.setInput('size', 'sm');
      fix.detectChanges();
      expect(host.querySelector('.kp-header__user-text')).toBeNull();
    });

    it('hides the user menu when showUserMenu=false', () => {
      const { fix, host } = setup();
      fix.componentRef.setInput('showUserMenu', false);
      fix.detectChanges();
      expect(host.querySelector('.kp-header__user')).toBeNull();
    });
  });
});

@Component({
  standalone: true,
  imports: [KpHeaderComponent],
  template: `
    <kp-header [showSearch]="true">
      <span kpHeaderLogo class="custom-logo">Custom Mark</span>
      <input kpHeaderSearch class="custom-search" />
      <button kpHeaderActions class="custom-action">Extra</button>
    </kp-header>
  `,
})
class HostComponent {}

describe('KpHeaderComponent projection slots', () => {
  it('projects custom logo, search, and action content', () => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fix = TestBed.createComponent(HostComponent);
    fix.detectChanges();
    const host = fix.nativeElement as HTMLElement;

    expect(host.querySelector('.custom-logo')?.textContent).toContain(
      'Custom Mark',
    );
    expect(host.querySelector('.custom-search')).not.toBeNull();
    expect(host.querySelector('.custom-action')?.textContent).toContain('Extra');

    // Projected [kpHeaderSearch] takes precedence over the placeholder.
    expect(host.querySelector('.kp-header__search-placeholder')).toBeNull();
  });
});
