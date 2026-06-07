import { TestBed } from '@angular/core/testing';
import { KpSkeletonComponent } from './skeleton.component';

describe('KpSkeletonComponent', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [KpSkeletonComponent] });
    const fix = TestBed.createComponent(KpSkeletonComponent);
    return { fix, host: fix.nativeElement as HTMLElement };
  }

  it('applies shape + size classes', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('shape', 'circle');
    fix.componentRef.setInput('size', 'lg');
    fix.detectChanges();
    expect(host.className).toContain('kp-sk--circle');
    expect(host.className).toContain('kp-sk--lg');
  });

  it('has aria-hidden=true by default — it is decorative', () => {
    const { fix, host } = setup();
    fix.detectChanges();
    expect(host.getAttribute('aria-hidden')).toBe('true');
  });

  it('animated=false removes the kp-sk--animated class', () => {
    const { fix, host } = setup();
    fix.detectChanges();
    expect(host.className).toContain('kp-sk--animated');
    fix.componentRef.setInput('animated', false);
    fix.detectChanges();
    expect(host.className).not.toContain('kp-sk--animated');
  });

  it('applies explicit width / height overrides via inline style', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('width', '200px');
    fix.componentRef.setInput('height', '32px');
    fix.detectChanges();
    expect(host.style.width).toBe('200px');
    expect(host.style.height).toBe('32px');
  });
});
