import { TestBed } from '@angular/core/testing';
import { KpTextareaComponent } from './textarea.component';

describe('KpTextareaComponent', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [KpTextareaComponent] });
    const fix = TestBed.createComponent(KpTextareaComponent);
    return { fix, host: fix.nativeElement as HTMLElement };
  }

  it('renders a real <textarea>', () => {
    const { fix, host } = setup();
    fix.detectChanges();
    expect(host.querySelector('textarea')).not.toBeNull();
  });

  it('applies size class', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('size', 'lg');
    fix.detectChanges();
    expect(host.className).toContain('kp-textarea--lg');
  });

  it('propagates placeholder + rows + maxlength to the native textarea', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('placeholder', 'Tell us more');
    fix.componentRef.setInput('rows', 5);
    fix.componentRef.setInput('maxLength', 140);
    fix.detectChanges();
    const t = host.querySelector('textarea') as HTMLTextAreaElement;
    expect(t.placeholder).toBe('Tell us more');
    expect(t.rows).toBe(5);
    expect(t.maxLength).toBe(140);
  });

  it('reflects disabled on the native textarea', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('disabled', true);
    fix.detectChanges();
    expect((host.querySelector('textarea') as HTMLTextAreaElement).disabled).toBe(true);
  });

  it('showCounter=true renders a character counter', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('showCounter', true);
    fix.componentRef.setInput('maxLength', 100);
    fix.detectChanges();
    expect(host.querySelector('.kp-textarea__counter')).not.toBeNull();
  });

  it('ControlValueAccessor: input event fires onChange + writeValue updates value', () => {
    const { fix, host } = setup();
    fix.detectChanges();
    const t = host.querySelector('textarea') as HTMLTextAreaElement;
    const spy = vi.fn();
    fix.componentInstance.registerOnChange(spy);
    t.value = 'hello';
    t.dispatchEvent(new Event('input'));
    expect(spy).toHaveBeenCalledWith('hello');

    fix.componentInstance.writeValue('from-form');
    fix.detectChanges();
    expect(fix.componentInstance.value).toBe('from-form');
  });
});
