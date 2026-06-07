import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpNavItemComponent } from './nav-item.component';

describe('KpNavItemComponent', () => {
  let fixture: ComponentFixture<KpNavItemComponent>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpNavItemComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(KpNavItemComponent);
    host = fixture.nativeElement as HTMLElement;
  });

  function button(): HTMLButtonElement {
    return host.querySelector('.kp-nav-item__content') as HTMLButtonElement;
  }

  it('renders the label input into the label slot', () => {
    fixture.componentRef.setInput('label', 'Dashboard');
    fixture.detectChanges();
    const label = host.querySelector('.kp-nav-item__label') as HTMLElement;
    expect(label.textContent?.trim()).toBe('Dashboard');
  });

  it('applies size + base host classes', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    expect(host.className).toContain('kp-nav-item');
    expect(host.className).toContain('kp-nav-item--lg');
  });

  it('renders the icon slot by default and hides it when showIcon=false', () => {
    fixture.detectChanges();
    expect(host.querySelector('.kp-nav-item__icon')).not.toBeNull();
    fixture.componentRef.setInput('showIcon', false);
    fixture.detectChanges();
    expect(host.querySelector('.kp-nav-item__icon')).toBeNull();
  });

  it('renders the badge slot only when showBadge=true', () => {
    fixture.detectChanges();
    expect(host.querySelector('.kp-nav-item__badge')).toBeNull();
    fixture.componentRef.setInput('showBadge', true);
    fixture.detectChanges();
    expect(host.querySelector('.kp-nav-item__badge')).not.toBeNull();
  });

  it('renders the chevron only when hasChildren=true and rotates it when expanded', () => {
    fixture.detectChanges();
    expect(host.querySelector('.kp-nav-item__chevron')).toBeNull();

    fixture.componentRef.setInput('hasChildren', true);
    fixture.detectChanges();
    const chevron = host.querySelector('.kp-nav-item__chevron') as HTMLElement;
    expect(chevron).not.toBeNull();
    expect(chevron.classList.contains('kp-nav-item__chevron--expanded')).toBe(false);

    fixture.componentRef.setInput('expanded', true);
    fixture.detectChanges();
    expect(chevron.classList.contains('kp-nav-item__chevron--expanded')).toBe(true);
  });

  it('reflects depth via the --kp-nav-item-depth custom property', () => {
    fixture.componentRef.setInput('depth', 3);
    fixture.detectChanges();
    expect(host.style.getPropertyValue('--kp-nav-item-depth')).toBe('3');
  });

  describe('active state', () => {
    it('adds the active host class and aria-current="page" when active', () => {
      fixture.componentRef.setInput('active', true);
      fixture.detectChanges();
      expect(host.className).toContain('kp-nav-item--active');
      expect(host.getAttribute('aria-current')).toBe('page');
    });

    it('omits aria-current when not active', () => {
      fixture.detectChanges();
      expect(host.className).not.toContain('kp-nav-item--active');
      expect(host.getAttribute('aria-current')).toBeNull();
    });

    it('renders the active indicator only when active and showActiveIndicator', () => {
      fixture.componentRef.setInput('active', true);
      fixture.detectChanges();
      expect(host.querySelector('.kp-nav-item__indicator')).not.toBeNull();

      fixture.componentRef.setInput('showActiveIndicator', false);
      fixture.detectChanges();
      expect(host.querySelector('.kp-nav-item__indicator')).toBeNull();
    });
  });

  describe('collapsed mode', () => {
    it('adds the collapsed host class', () => {
      fixture.componentRef.setInput('collapsed', true);
      fixture.detectChanges();
      expect(host.className).toContain('kp-nav-item--collapsed');
    });

    it('sets aria-label to the label only when collapsed', () => {
      fixture.componentRef.setInput('label', 'Settings');
      fixture.detectChanges();
      // expanded: no aria-label (visible text label is used instead)
      expect(button().getAttribute('aria-label')).toBeNull();

      fixture.componentRef.setInput('collapsed', true);
      fixture.detectChanges();
      expect(button().getAttribute('aria-label')).toBe('Settings');
    });

    it('marks the visible label aria-hidden when collapsed', () => {
      fixture.detectChanges();
      const label = host.querySelector('.kp-nav-item__label') as HTMLElement;
      expect(label.getAttribute('aria-hidden')).toBeNull();

      fixture.componentRef.setInput('collapsed', true);
      fixture.detectChanges();
      expect(label.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('disabled state', () => {
    it('adds the disabled host class and disables the button', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      expect(host.className).toContain('kp-nav-item--disabled');
      expect(button().disabled).toBe(true);
    });
  });

  describe('click$ output', () => {
    it('emits click$ with the MouseEvent when the button is clicked', () => {
      fixture.detectChanges();
      const spy = vi.fn();
      fixture.componentInstance.click$.subscribe(spy);
      button().click();
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0]).toBeInstanceOf(Event);
    });

    it('does not emit click$ when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      const spy = vi.fn();
      fixture.componentInstance.click$.subscribe(spy);
      // call the handler directly: a disabled button swallows native clicks,
      // so this asserts the guard inside handleClick rather than DOM behavior.
      fixture.componentInstance.handleClick(new MouseEvent('click'));
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('content projection', () => {
    @Component({
      standalone: true,
      imports: [KpNavItemComponent],
      template: `
        <kp-nav-item [label]="label" [showBadge]="true">
          <svg kpNavItemIcon data-testid="icon"></svg>
          <span kpNavItemBadge data-testid="badge">9</span>
        </kp-nav-item>
      `,
    })
    class HostComponent {
      label = 'Inbox';
    }

    it('projects icon and badge content into their slots', () => {
      const hostFixture = TestBed.createComponent(HostComponent);
      hostFixture.detectChanges();
      const el = hostFixture.nativeElement as HTMLElement;
      const iconSlot = el.querySelector('.kp-nav-item__icon') as HTMLElement;
      const badgeSlot = el.querySelector('.kp-nav-item__badge') as HTMLElement;
      expect(iconSlot.querySelector('[data-testid="icon"]')).not.toBeNull();
      expect(badgeSlot.querySelector('[data-testid="badge"]')).not.toBeNull();
      expect(badgeSlot.textContent?.trim()).toBe('9');
    });
  });
});
