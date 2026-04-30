import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { KpDropdownMenuComponent } from './dropdown-menu.component';
import { KpMenuItemComponent } from './menu-item.component';
import { KpMenuDividerComponent } from './menu-divider.component';
import { KpMenuSectionLabelComponent } from './menu-section-label.component';

@Component({
  imports: [KpDropdownMenuComponent, KpMenuItemComponent, KpMenuDividerComponent, KpMenuSectionLabelComponent],
  template: `
    <kp-dropdown-menu
      [hasSearch]="hasSearch"
      [hasFooter]="hasFooter"
      [showCancel]="showCancel"
      primaryLabel="Apply"
      cancelLabel="Cancel"
      (primary)="onPrimary()"
      (cancel)="onCancel()"
      (searchChange)="onSearch($event)">
      <kp-menu-section-label label="Account"/>
      <kp-menu-item label="Profile" shortcut="⌘P"/>
      <kp-menu-divider/>
      <kp-menu-item label="Sign out" danger="true"/>
    </kp-dropdown-menu>
  `,
})
class HostCmp {
  hasSearch = false;
  hasFooter = false;
  showCancel = true;
  onPrimary = vi.fn();
  onCancel = vi.fn();
  onSearch = vi.fn();
}

function setupWith(opts: Partial<HostCmp>) {
  TestBed.configureTestingModule({ imports: [HostCmp] });
  const fix = TestBed.createComponent(HostCmp);
  Object.assign(fix.componentInstance, opts);
  fix.detectChanges();
  return { fix, host: fix.nativeElement as HTMLElement, cmp: fix.componentInstance };
}

describe('Menu (DropdownMenu + MenuItem)', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [HostCmp] });
    const fix = TestBed.createComponent(HostCmp);
    fix.detectChanges();
    return { fix, host: fix.nativeElement as HTMLElement, cmp: fix.componentInstance };
  }

  describe('KpDropdownMenuComponent', () => {
    it('exposes role="menu" on the body wrapper (not the host)', () => {
      const { host } = setup();
      // role=menu must contain only menuitem-* direct children. Search field
      // + footer buttons live on the host alongside the items, so role=menu
      // is scoped to the body wrapper they sit inside.
      const body = host.querySelector('kp-dropdown-menu .kp-dropdown-menu__body')!;
      expect(body.getAttribute('role')).toBe('menu');
    });

    it('renders projected content (items, divider, section label)', () => {
      const { host } = setup();
      expect(host.querySelectorAll('kp-menu-item').length).toBe(2);
      expect(host.querySelector('kp-menu-divider')).not.toBeNull();
      expect(host.querySelector('kp-menu-section-label')).not.toBeNull();
    });

    it('search slot is absent by default', () => {
      expect(setup().host.querySelector('.kp-dropdown-menu__search')).toBeNull();
    });

    it('search slot renders when hasSearch=true', () => {
      const { host } = setupWith({ hasSearch: true });
      expect(host.querySelector('.kp-dropdown-menu__search')).not.toBeNull();
    });

    it('typing in the search input emits searchChange with the new value', () => {
      const { host, cmp } = setupWith({ hasSearch: true });
      const input = host.querySelector('.kp-dropdown-menu__search input') as HTMLInputElement;
      input.value = 'pro';
      // Bubbles is required so the host's (input) listener picks it up.
      input.dispatchEvent(new Event('input', { bubbles: true }));
      expect(cmp.onSearch).toHaveBeenCalledWith('pro');
    });

    it('footer slot is absent by default', () => {
      expect(setup().host.querySelector('.kp-dropdown-menu__footer')).toBeNull();
    });

    it('footer slot renders when hasFooter=true', () => {
      const { host } = setupWith({ hasFooter: true });
      expect(host.querySelector('.kp-dropdown-menu__footer')).not.toBeNull();
    });

    it('hides the cancel button when showCancel=false', () => {
      const { host } = setupWith({ hasFooter: true, showCancel: false });
      const buttons = host.querySelectorAll('.kp-dropdown-menu__buttons kp-button');
      expect(buttons.length).toBe(1);
    });

    it('primary button click emits (primary)', () => {
      const { host, cmp } = setupWith({ hasFooter: true });
      // kp-button is the host that listens for (click); fire on it, not on
      // an inner <button> element (which may not exist in the test harness).
      const primary = host.querySelector('.kp-dropdown-menu__buttons kp-button') as HTMLElement;
      primary.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(cmp.onPrimary).toHaveBeenCalled();
    });
  });

  describe('KpMenuItemComponent', () => {
    function itemSetup(extra: Record<string, unknown> = {}) {
      TestBed.configureTestingModule({ imports: [KpMenuItemComponent] });
      const fix = TestBed.createComponent(KpMenuItemComponent);
      fix.componentRef.setInput('label', 'Edit');
      for (const [k, v] of Object.entries(extra)) fix.componentRef.setInput(k, v);
      fix.detectChanges();
      return { fix, host: fix.nativeElement as HTMLElement, cmp: fix.componentInstance };
    }

    it('renders the label and gets role="menuitem"', () => {
      const { host } = itemSetup();
      expect(host.getAttribute('role')).toBe('menuitem');
      expect(host.textContent).toContain('Edit');
    });

    it('renders shortcut when provided', () => {
      const { host } = itemSetup({ shortcut: '⌘E' });
      expect(host.querySelector('.kp-menu-item__shortcut')?.textContent).toContain('⌘E');
    });

    it('renders description when provided and applies has-description class', () => {
      const { host } = itemSetup({ description: 'Open editor', size: 'lg' });
      expect(host.classList.contains('kp-menu-item--has-description')).toBe(true);
      expect(host.querySelector('.kp-menu-item__description')?.textContent).toBe('Open editor');
    });

    it('disabled sets aria-disabled and tabindex=-1', () => {
      const { host } = itemSetup({ disabled: true });
      expect(host.getAttribute('aria-disabled')).toBe('true');
      expect(host.getAttribute('tabindex')).toBe('-1');
    });

    it('selected adds the modifier class', () => {
      const { host } = itemSetup({ selected: true });
      expect(host.classList.contains('kp-menu-item--selected')).toBe(true);
    });

    it('danger adds the modifier class', () => {
      const { host } = itemSetup({ danger: true });
      expect(host.classList.contains('kp-menu-item--danger')).toBe(true);
    });

    it('hasChevron renders the chevron svg in the trailing slot', () => {
      const { host } = itemSetup({ hasChevron: true });
      expect(host.querySelector('.kp-menu-item__trailing svg')).not.toBeNull();
    });

    it('size class follows the size input', () => {
      const { host } = itemSetup({ size: 'lg' });
      expect(host.classList.contains('kp-menu-item--lg')).toBe(true);
    });

    it('forceState overrides disabled in the host class list', () => {
      const { host } = itemSetup({ disabled: true, forceState: 'hover' });
      expect(host.classList.contains('kp-menu-item--hover')).toBe(true);
      expect(host.classList.contains('kp-menu-item--disabled')).toBe(false);
    });
  });
});
