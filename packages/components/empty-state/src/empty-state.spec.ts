import { TestBed } from '@angular/core/testing';
import { KpEmptyStateComponent } from './empty-state.component';

describe('KpEmptyStateComponent', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [KpEmptyStateComponent] });
    const fix = TestBed.createComponent(KpEmptyStateComponent);
    return { fix, host: fix.nativeElement as HTMLElement };
  }

  it('renders title + description by default', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('title', 'No results');
    fix.componentRef.setInput('description', 'Try a different query.');
    fix.detectChanges();
    expect(host.textContent).toContain('No results');
    expect(host.textContent).toContain('Try a different query.');
  });

  it('drops the description slot when showDescription=false', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('title', 'No results');
    fix.componentRef.setInput('description', 'Try again.');
    fix.componentRef.setInput('showDescription', false);
    fix.detectChanges();
    expect(host.textContent).not.toContain('Try again.');
  });

  it('hides the illustration slot when showIllustration=false', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('showIllustration', false);
    fix.detectChanges();
    expect(host.querySelector('.kp-es__illustration')).toBeNull();
  });

  it('applies the size class', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('size', 'lg');
    fix.detectChanges();
    expect(host.className).toContain('kp-es--lg');
  });
});
