import { TestBed } from '@angular/core/testing';
import { KpAvatarGroupComponent } from './avatar-group.component';

describe('KpAvatarGroupComponent', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [KpAvatarGroupComponent] });
    const fix = TestBed.createComponent(KpAvatarGroupComponent);
    fix.componentRef.setInput('items', [
      { initials: 'A' }, { initials: 'B' }, { initials: 'C' }, { initials: 'D' }, { initials: 'E' },
    ]);
    fix.componentRef.setInput('max', 3);
    fix.detectChanges();
    return { fix, host: fix.nativeElement as HTMLElement };
  }

  it('renders up to `max` visible avatars', () => {
    const { host } = setup();
    expect(host.querySelectorAll('kp-avatar').length).toBe(3);
  });

  it('renders an overflow +N pill when there are more items than max', () => {
    const { host } = setup();
    const count = host.querySelector('.kp-avatar-group__count');
    expect(count).not.toBeNull();
    expect(count!.textContent).toContain('+2');
  });

  it('hides overflow pill when showCount=false', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('showCount', false);
    fix.detectChanges();
    expect(host.querySelector('.kp-avatar-group__count')).toBeNull();
  });

  it('applies size class', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('size', 'lg');
    fix.detectChanges();
    expect(host.className).toContain('kp-avatar-group--lg');
  });
});
