import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpUserMenuComponent } from './user-menu.component';

/**
 * Host harness that projects a couple of menu items + a help link into the
 * UserMenu slots, mirroring the documented usage. We project plain anchors so
 * the spec stays independent of the menu-item component internals while still
 * exercising real content projection + role="menu" grouping.
 */
@Component({
  imports: [KpUserMenuComponent],
  template: `
    <kp-user-menu
      [userName]="userName"
      [userEmail]="userEmail"
      [userInitials]="userInitials"
      [showEmail]="showEmail"
      [showPlanBadge]="showPlanBadge"
      [planName]="planName"
      [showThemeToggle]="showThemeToggle"
      [showHelpLink]="showHelpLink"
      (signOut)="onSignOut()"
    >
      <div kpUserMenuItems>
        <button class="proj-item" type="button" (click)="onSelect('profile')">Profile</button>
        <button class="proj-item" type="button" (click)="onSelect('settings')">Settings</button>
      </div>
      <div kpUserMenuHelp>
        <a class="proj-help" href="#">Help</a>
      </div>
    </kp-user-menu>
  `,
})
class HostComponent {
  userName: string | null = 'Greg Black';
  userEmail: string | null = 'greg@example.com';
  userInitials: string | null = 'GB';
  showEmail = true;
  showPlanBadge = false;
  planName = 'Pro';
  showThemeToggle = false;
  showHelpLink = true;

  signOutCount = 0;
  selected: string[] = [];

  onSignOut(): void {
    this.signOutCount++;
  }
  onSelect(id: string): void {
    this.selected.push(id);
  }
}

describe('KpUserMenuComponent', () => {
  describe('standalone (direct inputs)', () => {
    let fixture: ComponentFixture<KpUserMenuComponent>;
    let host: HTMLElement;

    beforeEach(() => {
      TestBed.configureTestingModule({ imports: [KpUserMenuComponent] });
      fixture = TestBed.createComponent(KpUserMenuComponent);
      host = fixture.nativeElement as HTMLElement;
    });

    it('renders the user name from the @Input', () => {
      fixture.componentRef.setInput('userName', 'Ada Lovelace');
      fixture.detectChanges();
      const name = host.querySelector('.kp-user-menu__name');
      expect(name?.textContent?.trim()).toBe('Ada Lovelace');
    });

    it('renders the user email when showEmail is true (default)', () => {
      fixture.componentRef.setInput('userEmail', 'ada@example.com');
      fixture.detectChanges();
      const email = host.querySelector('.kp-user-menu__email');
      expect(email).not.toBeNull();
      expect(email?.textContent?.trim()).toBe('ada@example.com');
    });

    it('hides the email row when showEmail is false', () => {
      fixture.componentRef.setInput('userEmail', 'ada@example.com');
      fixture.componentRef.setInput('showEmail', false);
      fixture.detectChanges();
      expect(host.querySelector('.kp-user-menu__email')).toBeNull();
    });

    it('passes initials down to the avatar @Input', () => {
      fixture.componentRef.setInput('userInitials', 'AL');
      fixture.detectChanges();
      const avatar = host.querySelector('kp-avatar');
      expect(avatar).not.toBeNull();
      // initials surface as text content of the avatar
      expect(avatar?.textContent).toContain('AL');
    });

    it('does not render the plan badge by default', () => {
      fixture.detectChanges();
      expect(host.querySelector('.kp-user-menu__plan')).toBeNull();
    });

    it('renders the plan badge with planName when showPlanBadge is true', () => {
      fixture.componentRef.setInput('showPlanBadge', true);
      fixture.componentRef.setInput('planName', 'Enterprise');
      fixture.detectChanges();
      const plan = host.querySelector('.kp-user-menu__plan');
      expect(plan).not.toBeNull();
      expect(plan?.textContent?.trim()).toBe('Enterprise');
    });

    it('applies the size host class (md default, sm override)', () => {
      fixture.detectChanges();
      expect(host.className).toContain('kp-user-menu--md');

      fixture.componentRef.setInput('size', 'sm');
      fixture.detectChanges();
      expect(host.className).toContain('kp-user-menu--sm');
    });

    it('maps size to the avatar size (md -> lg, sm -> md)', () => {
      fixture.detectChanges();
      expect(fixture.componentInstance.avatarSize).toBe('lg');

      fixture.componentRef.setInput('size', 'sm');
      fixture.detectChanges();
      expect(fixture.componentInstance.avatarSize).toBe('md');
    });

    it('shows the help-link group by default and hides it when showHelpLink is false', () => {
      fixture.detectChanges();
      const groupsDefault = host.querySelectorAll('.kp-user-menu__group');
      // items group + help group + sign-out group = 3
      expect(groupsDefault.length).toBe(3);

      fixture.componentRef.setInput('showHelpLink', false);
      fixture.detectChanges();
      const groupsHidden = host.querySelectorAll('.kp-user-menu__group');
      // items group + sign-out group = 2
      expect(groupsHidden.length).toBe(2);
    });

    it('renders the theme toggle row only when showThemeToggle is true', () => {
      fixture.detectChanges();
      expect(host.querySelector('.kp-user-menu__theme')).toBeNull();

      fixture.componentRef.setInput('showThemeToggle', true);
      fixture.detectChanges();
      expect(host.querySelector('.kp-user-menu__theme')).not.toBeNull();
      expect(host.querySelector('.kp-user-menu__theme-label')?.textContent?.trim()).toBe('Theme');
    });

    it('exposes role="menu" groups and a Sign out menuitem', () => {
      fixture.detectChanges();
      const menus = host.querySelectorAll('[role="menu"]');
      expect(menus.length).toBeGreaterThanOrEqual(1);

      const signOut = host.querySelector('kp-menu-item[role="menuitem"]');
      expect(signOut).not.toBeNull();
      expect(signOut?.textContent).toContain('Sign out');
      expect(signOut?.getAttribute('aria-disabled')).toBeNull();
    });

    it('emits signOut @Output when the Sign out item is clicked', () => {
      const spy = vi.fn();
      fixture.componentInstance.signOut.subscribe(spy);
      fixture.detectChanges();

      const signOut = host.querySelector('kp-menu-item') as HTMLElement;
      expect(signOut).not.toBeNull();
      signOut.click();

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('content projection (host harness)', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HTMLElement;

    beforeEach(() => {
      TestBed.configureTestingModule({ imports: [HostComponent] });
      fixture = TestBed.createComponent(HostComponent);
      host = fixture.nativeElement as HTMLElement;
      fixture.detectChanges();
    });

    it('projects the main menu items into the role="menu" group', () => {
      const items = host.querySelectorAll('.proj-item');
      expect(items.length).toBe(2);
      const itemsGroup = items[0].closest('[role="menu"]');
      expect(itemsGroup).not.toBeNull();
    });

    it('projects help links into a menu group when showHelpLink is true', () => {
      const help = host.querySelector('.proj-help');
      expect(help).not.toBeNull();
      expect(help?.closest('[role="menu"]')).not.toBeNull();
    });

    it('invokes the projected item handler when an item is selected', () => {
      const settings = host.querySelectorAll('.proj-item')[1] as HTMLElement;
      settings.click();
      expect(fixture.componentInstance.selected).toEqual(['settings']);
    });

    it('emits signOut up through the host on Sign out click', () => {
      const signOut = host.querySelector('kp-menu-item') as HTMLElement;
      signOut.click();
      expect(fixture.componentInstance.signOutCount).toBe(1);
    });

    it('renders the plan badge alongside projected content when enabled', () => {
      // Mutate before the first CD pass to avoid NG0100 from the host harness
      // re-binding [showPlanBadge]/[planName] after they were already checked.
      const fresh = TestBed.createComponent(HostComponent);
      fresh.componentInstance.showPlanBadge = true;
      fresh.componentInstance.planName = 'Team';
      fresh.detectChanges();
      const host = fresh.nativeElement as HTMLElement;
      const plan = host.querySelector('.kp-user-menu__plan');
      expect(plan?.textContent?.trim()).toBe('Team');
      // projected items still present
      expect(host.querySelectorAll('.proj-item').length).toBe(2);
    });
  });
});
