import { TestBed } from '@angular/core/testing';
import { KpAvatarComponent } from './avatar.component';

describe('KpAvatarComponent', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [KpAvatarComponent] });
    const fix = TestBed.createComponent(KpAvatarComponent);
    return { fix, host: fix.nativeElement as HTMLElement };
  }

  it('applies size + shape + appearance classes to the host', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('size', 'lg');
    fix.componentRef.setInput('shape', 'square');
    fix.componentRef.setInput('appearance', 'subtle');
    fix.detectChanges();
    expect(host.className).toContain('kp-avatar--lg');
    expect(host.className).toContain('kp-avatar--square');
    expect(host.className).toContain('kp-avatar--subtle');
  });

  it('renders initials when src is null', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('initials', 'GB');
    fix.detectChanges();
    expect(host.textContent).toContain('GB');
  });

  it('renders an <img> when src is set', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('src', 'https://example.com/me.png');
    fix.componentRef.setInput('alt', 'me');
    fix.detectChanges();
    const img = host.querySelector('img');
    expect(img?.getAttribute('src')).toBe('https://example.com/me.png');
    expect(img?.getAttribute('alt')).toBe('me');
  });

  it('renders the status dot only when showStatus=true', () => {
    const { fix, host } = setup();
    fix.detectChanges();
    expect(host.querySelector('.kp-avatar__status')).toBeNull();
    fix.componentRef.setInput('showStatus', true);
    fix.detectChanges();
    expect(host.querySelector('.kp-avatar__status')).not.toBeNull();
  });
});
