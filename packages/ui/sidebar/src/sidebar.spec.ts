import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  KpSidebarComponent,
  KpSidebarSection,
  KpSidebarWidth,
} from './sidebar.component';

const SECTIONS: KpSidebarSection[] = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', icon: 'home', active: true },
      { label: 'Reports', icon: 'chart', badge: '3' },
      {
        label: 'Projects',
        icon: 'folder',
        expanded: true,
        children: [{ label: 'Alpha' }, { label: 'Beta' }],
      },
    ],
  },
  {
    label: 'System',
    items: [{ label: 'Settings', icon: 'settings' }],
  },
];

describe('KpSidebarComponent', () => {
  let fixture: ComponentFixture<KpSidebarComponent>;
  let host: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [KpSidebarComponent] });
    fixture = TestBed.createComponent(KpSidebarComponent);
    host = fixture.nativeElement as HTMLElement;
  });

  function setSections(sections = SECTIONS) {
    fixture.componentRef.setInput('sections', sections);
  }

  describe('landmark + appearance host classes', () => {
    it('exposes a navigation landmark via host role', () => {
      fixture.detectChanges();
      expect(host.getAttribute('role')).toBe('navigation');
    });

    it('defaults to expanded + light host classes', () => {
      fixture.detectChanges();
      expect(host.classList.contains('kp-sidebar')).toBe(true);
      expect(host.classList.contains('kp-sidebar--expanded')).toBe(true);
      expect(host.classList.contains('kp-sidebar--light')).toBe(true);
    });

    it('reflects appearance="dark" to the host class', () => {
      fixture.componentRef.setInput('appearance', 'dark');
      fixture.detectChanges();
      expect(host.classList.contains('kp-sidebar--dark')).toBe(true);
      expect(host.classList.contains('kp-sidebar--light')).toBe(false);
    });
  });

  describe('collapsed / expanded width state', () => {
    it('expanded state maps to the expanded host class (240px width var)', () => {
      fixture.componentRef.setInput('widthState', 'expanded');
      fixture.detectChanges();
      expect(host.classList.contains('kp-sidebar--expanded')).toBe(true);
      expect(host.classList.contains('kp-sidebar--collapsed')).toBe(false);
    });

    it('collapsed state maps to the collapsed host class (64px width var)', () => {
      fixture.componentRef.setInput('widthState', 'collapsed');
      fixture.detectChanges();
      expect(host.classList.contains('kp-sidebar--collapsed')).toBe(true);
      expect(host.classList.contains('kp-sidebar--expanded')).toBe(false);
    });

    it('hides the logo text when collapsed (class + aria-hidden)', () => {
      fixture.componentRef.setInput('widthState', 'collapsed');
      fixture.detectChanges();
      const logoText = host.querySelector('.kp-sidebar__logo-text') as HTMLElement;
      expect(logoText).toBeTruthy();
      expect(
        logoText.classList.contains('kp-sidebar__logo-text--hidden'),
      ).toBe(true);
      expect(logoText.getAttribute('aria-hidden')).toBe('true');
    });

    it('does not hide the logo text when expanded', () => {
      fixture.componentRef.setInput('widthState', 'expanded');
      fixture.detectChanges();
      const logoText = host.querySelector('.kp-sidebar__logo-text') as HTMLElement;
      expect(
        logoText.classList.contains('kp-sidebar__logo-text--hidden'),
      ).toBe(false);
      expect(logoText.getAttribute('aria-hidden')).toBeNull();
    });
  });

  describe('collapse toggle button', () => {
    it('toggle button advertises the correct aria-label per state', () => {
      fixture.componentRef.setInput('widthState', 'expanded');
      fixture.detectChanges();
      const toggle = host.querySelector('.kp-sidebar__toggle') as HTMLButtonElement;
      expect(toggle.getAttribute('aria-label')).toBe('Collapse sidebar');

      fixture.componentRef.setInput('widthState', 'collapsed');
      fixture.detectChanges();
      expect(toggle.getAttribute('aria-label')).toBe('Expand sidebar');
    });

    it('clicking the toggle emits (toggle) with the next width state', () => {
      fixture.componentRef.setInput('widthState', 'expanded');
      fixture.detectChanges();
      const emitted: KpSidebarWidth[] = [];
      fixture.componentInstance.toggle.subscribe((w) => emitted.push(w));

      const toggle = host.querySelector('.kp-sidebar__toggle') as HTMLButtonElement;
      toggle.click();
      fixture.detectChanges();

      expect(emitted).toEqual(['collapsed']);
      // internal state flipped, host class follows
      expect(host.classList.contains('kp-sidebar--collapsed')).toBe(true);
    });

    it('a second click toggles back to expanded', () => {
      fixture.componentRef.setInput('widthState', 'expanded');
      fixture.detectChanges();
      const spy = vi.fn();
      fixture.componentInstance.toggle.subscribe(spy);

      const toggle = host.querySelector('.kp-sidebar__toggle') as HTMLButtonElement;
      toggle.click();
      fixture.detectChanges();
      toggle.click();
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenNthCalledWith(1, 'collapsed');
      expect(spy).toHaveBeenNthCalledWith(2, 'expanded');
      expect(host.classList.contains('kp-sidebar--expanded')).toBe(true);
    });
  });

  describe('data-driven sections + nav items', () => {
    it('renders one section block per section with its label', () => {
      setSections();
      fixture.detectChanges();
      const sections = host.querySelectorAll('.kp-sidebar__section');
      expect(sections.length).toBe(2);
      const labels = Array.from(
        host.querySelectorAll('.kp-sidebar__section-label'),
      ).map((el) => el.textContent?.trim());
      expect(labels).toEqual(['Main', 'System']);
    });

    it('renders a nav-item per top-level item plus expanded children', () => {
      setSections();
      fixture.detectChanges();
      // 3 + 1 top-level items, plus 2 children of the expanded "Projects"
      const navItems = host.querySelectorAll('kp-nav-item');
      expect(navItems.length).toBe(6);
    });

    it('does not render children of a collapsed-width sidebar', () => {
      fixture.componentRef.setInput('widthState', 'collapsed');
      setSections();
      fixture.detectChanges();
      // children suppressed when widthState === collapsed → only the 4 parents
      expect(host.querySelectorAll('kp-nav-item').length).toBe(4);
    });

    it('does not render children when the parent item is not expanded', () => {
      const collapsedParent: KpSidebarSection[] = [
        {
          label: 'Main',
          items: [
            {
              label: 'Projects',
              children: [{ label: 'Alpha' }, { label: 'Beta' }],
              expanded: false,
            },
          ],
        },
      ];
      setSections(collapsedParent);
      fixture.detectChanges();
      expect(host.querySelectorAll('kp-nav-item').length).toBe(1);
    });

    it('hides section labels entirely when showSectionLabels=false', () => {
      fixture.componentRef.setInput('showSectionLabels', false);
      setSections();
      fixture.detectChanges();
      expect(host.querySelectorAll('.kp-sidebar__section-label').length).toBe(0);
    });

    it('marks section labels aria-hidden when collapsed', () => {
      fixture.componentRef.setInput('widthState', 'collapsed');
      setSections();
      fixture.detectChanges();
      const label = host.querySelector('.kp-sidebar__section-label') as HTMLElement;
      expect(label.classList.contains('kp-sidebar__section-label--hidden')).toBe(true);
      expect(label.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('item click behaviour', () => {
    it('emits (itemClick) with the clicked item', () => {
      setSections();
      fixture.detectChanges();
      const spy = vi.fn();
      fixture.componentInstance.itemClick.subscribe(spy);

      // First nav-item = Dashboard. KpNavItem emits (click$) from its inner button.
      const firstBtn = host.querySelector(
        'kp-nav-item .kp-nav-item__content',
      ) as HTMLButtonElement;
      firstBtn.click();
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0].label).toBe('Dashboard');
    });

    it('clicking a parent with children toggles its expanded flag', () => {
      const data: KpSidebarSection[] = [
        {
          label: 'Main',
          items: [
            {
              label: 'Projects',
              children: [{ label: 'Alpha' }],
              expanded: false,
            },
          ],
        },
      ];
      setSections(data);
      fixture.detectChanges();
      expect(host.querySelectorAll('kp-nav-item').length).toBe(1);

      const parentBtn = host.querySelector(
        'kp-nav-item .kp-nav-item__content',
      ) as HTMLButtonElement;
      parentBtn.click();
      fixture.detectChanges();

      expect(data[0].items[0].expanded).toBe(true);
      // child now rendered
      expect(host.querySelectorAll('kp-nav-item').length).toBe(2);
    });
  });

  describe('user footer', () => {
    it('renders the footer with name + email + avatar when a user is set', () => {
      fixture.componentRef.setInput('userName', 'Greg Black');
      fixture.componentRef.setInput('userEmail', 'greg@example.com');
      fixture.componentRef.setInput('userInitials', 'GB');
      fixture.detectChanges();

      const footer = host.querySelector('.kp-sidebar__footer');
      expect(footer).toBeTruthy();
      expect(
        host.querySelector('.kp-sidebar__footer-name')?.textContent?.trim(),
      ).toBe('Greg Black');
      expect(
        host.querySelector('.kp-sidebar__footer-email')?.textContent?.trim(),
      ).toBe('greg@example.com');
      expect(host.querySelector('kp-avatar')).toBeTruthy();
    });

    it('omits the footer when no user identity is provided', () => {
      fixture.detectChanges();
      expect(host.querySelector('.kp-sidebar__footer')).toBeNull();
    });

    it('omits the footer when showUserFooter=false even with a user set', () => {
      fixture.componentRef.setInput('showUserFooter', false);
      fixture.componentRef.setInput('userName', 'Greg Black');
      fixture.detectChanges();
      expect(host.querySelector('.kp-sidebar__footer')).toBeNull();
    });

    it('the footer menu button emits (userMenuClick) and is removed from tab order when collapsed', () => {
      fixture.componentRef.setInput('userName', 'Greg Black');
      fixture.detectChanges();
      const spy = vi.fn();
      fixture.componentInstance.userMenuClick.subscribe(spy);

      const menuBtn = host.querySelector('.kp-sidebar__footer-menu') as HTMLButtonElement;
      expect(menuBtn.getAttribute('tabindex')).toBe('0');
      menuBtn.click();
      expect(spy).toHaveBeenCalledTimes(1);

      fixture.componentRef.setInput('widthState', 'collapsed');
      fixture.detectChanges();
      expect(menuBtn.getAttribute('tabindex')).toBe('-1');
      expect(menuBtn.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('logo + projection slots', () => {
    it('hides the logo block when showLogo=false', () => {
      fixture.componentRef.setInput('showLogo', false);
      fixture.detectChanges();
      expect(host.querySelector('.kp-sidebar__logo')).toBeNull();
    });

    it('renders the default logo text via [logoText]', () => {
      fixture.componentRef.setInput('logoText', 'AppSec Hub');
      fixture.detectChanges();
      expect(
        host.querySelector('.kp-sidebar__logo-text')?.textContent?.trim(),
      ).toBe('AppSec Hub');
    });

    it('does not render the search slot when expanded but showSearch=false', () => {
      fixture.componentRef.setInput('showSearch', false);
      fixture.detectChanges();
      // no projected [kpSidebarSearch] content present
      expect(host.querySelector('[kpsidebarsearch]')).toBeNull();
    });
  });

  describe('collapse persistence', () => {
    const KEY = 'kp:test:sidebar-collapse';
    afterEach(() => {
      try { localStorage.removeItem(KEY); } catch { /* ignore */ }
    });

    it('persists the state to localStorage on toggle when persistKey is set', () => {
      fixture.componentRef.setInput('persistKey', KEY);
      fixture.detectChanges();
      fixture.componentInstance.onToggle();
      expect(localStorage.getItem(KEY)).toBe('collapsed');
      fixture.componentInstance.onToggle();
      expect(localStorage.getItem(KEY)).toBe('expanded');
    });

    it('restores the persisted state on init', () => {
      localStorage.setItem(KEY, 'collapsed');
      fixture.componentRef.setInput('persistKey', KEY);
      fixture.detectChanges(); // ngOnInit reads the stored value
      expect(fixture.componentInstance.widthState).toBe('collapsed');
    });

    it('does not write to localStorage without a persistKey', () => {
      fixture.detectChanges();
      fixture.componentInstance.onToggle();
      expect(localStorage.getItem(KEY)).toBeNull();
    });
  });
});

describe('KpSidebarComponent — content projection slots', () => {
  @Component({
    standalone: true,
    imports: [KpSidebarComponent],
    template: `
      <kp-sidebar [showSearch]="true" widthState="expanded">
        <div kpSidebarLogo class="custom-logo">Custom Logo</div>
        <input kpSidebarSearch class="custom-search" />
      </kp-sidebar>
    `,
  })
  class HostComp {}

  it('projects custom [kpSidebarLogo] content into the logo slot', () => {
    TestBed.configureTestingModule({ imports: [HostComp] });
    const fix = TestBed.createComponent(HostComp);
    fix.detectChanges();
    const root = fix.nativeElement as HTMLElement;
    expect(root.querySelector('.custom-logo')?.textContent?.trim()).toBe(
      'Custom Logo',
    );
  });

  it('projects [kpSidebarSearch] content when showSearch=true and expanded', () => {
    TestBed.configureTestingModule({ imports: [HostComp] });
    const fix = TestBed.createComponent(HostComp);
    fix.detectChanges();
    const root = fix.nativeElement as HTMLElement;
    expect(root.querySelector('input.custom-search')).toBeTruthy();
  });
});
