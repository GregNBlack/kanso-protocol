import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpToggleComponent } from './toggle.component';

describe('KpToggleComponent', () => {
  let fixture: ComponentFixture<KpToggleComponent>;
  let component: KpToggleComponent;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [KpToggleComponent] }).compileComponents();
    fixture = TestBed.createComponent(KpToggleComponent);
    component = fixture.componentInstance;
    host = fixture.nativeElement as HTMLElement;
  });

  it('exposes role="switch" on the host', () => {
    fixture.detectChanges();
    expect(host.getAttribute('role')).toBe('switch');
  });

  it('aria-checked follows the `on` input', () => {
    fixture.componentRef.setInput('on', true);
    fixture.detectChanges();
    expect(host.getAttribute('aria-checked')).toBe('true');
  });

  it('reflects disabled via aria-disabled + tabindex=-1', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(host.getAttribute('aria-disabled')).toBe('true');
    expect(host.getAttribute('tabindex')).toBe('-1');
  });

  it('click toggles state and emits (onChangeEvent)', () => {
    fixture.detectChanges();
    const spy = vi.fn();
    component.onChangeEvent.subscribe(spy);
    host.click();
    expect(spy).toHaveBeenCalledWith(true);
    host.click();
    expect(spy).toHaveBeenNthCalledWith(2, false);
  });

  it('click is a no-op when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const spy = vi.fn();
    component.onChangeEvent.subscribe(spy);
    host.click();
    expect(spy).not.toHaveBeenCalled();
  });

  it('ControlValueAccessor: writeValue updates `on`', () => {
    component.writeValue(true);
    fixture.detectChanges();
    expect(component.on).toBe(true);
  });
});
