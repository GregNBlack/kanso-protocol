import { TestBed } from '@angular/core/testing';
import { KpFormFieldComponent } from './form-field.component';

describe('KpFormFieldComponent', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [KpFormFieldComponent] });
    const fix = TestBed.createComponent(KpFormFieldComponent);
    return { fix, host: fix.nativeElement as HTMLElement };
  }

  it('renders a label when provided', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('label', 'Email');
    fix.detectChanges();
    expect(host.textContent).toContain('Email');
  });

  it('renders helper text when showHelper=true and helper provided', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('label', 'Email');
    fix.componentRef.setInput('helper', 'We never share it.');
    fix.detectChanges();
    expect(host.textContent).toContain('We never share it.');
  });

  it('hides helper when showHelper=false', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('helper', 'hidden');
    fix.componentRef.setInput('showHelper', false);
    fix.detectChanges();
    expect(host.textContent).not.toContain('hidden');
  });

  it('renders a required asterisk in required="required-asterisk" mode', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('label', 'Email');
    fix.componentRef.setInput('required', 'required-asterisk');
    fix.detectChanges();
    expect(host.textContent).toContain('*');
  });

  it('applies error modifier when error=true', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('error', true);
    fix.detectChanges();
    expect(host.className).toContain('kp-form-field--error');
  });
});
