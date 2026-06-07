import { TestBed } from '@angular/core/testing';
import { KpCardComponent } from './card.component';

describe('KpCardComponent', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [KpCardComponent] });
    const fix = TestBed.createComponent(KpCardComponent);
    return { fix, host: fix.nativeElement as HTMLElement };
  }

  it('applies size + appearance classes', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('size', 'lg');
    fix.componentRef.setInput('appearance', 'outline');
    fix.detectChanges();
    expect(host.className).toContain('kp-card--lg');
    expect(host.className).toContain('kp-card--outline');
  });

  it('renders header with title when showHeader=true (default)', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('title', 'Team');
    fix.detectChanges();
    expect(host.textContent).toContain('Team');
    expect(host.querySelector('.kp-card__header')).not.toBeNull();
  });

  it('suppresses the header when showHeader=false', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('title', 'Team');
    fix.componentRef.setInput('showHeader', false);
    fix.detectChanges();
    expect(host.querySelector('.kp-card__header')).toBeNull();
  });

  it('renders description only when showDescription=true', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('title', 'Team');
    fix.componentRef.setInput('description', '42 members');
    fix.detectChanges();
    expect(host.textContent).not.toContain('42 members');
    fix.componentRef.setInput('showDescription', true);
    fix.detectChanges();
    expect(host.textContent).toContain('42 members');
  });
});
