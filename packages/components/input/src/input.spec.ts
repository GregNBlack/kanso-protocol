import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { KpInputComponent } from './input.component';

describe('KpInputComponent', () => {
  let fixture: ComponentFixture<KpInputComponent>;
  let component: KpInputComponent;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [KpInputComponent] }).compileComponents();
    fixture = TestBed.createComponent(KpInputComponent);
    component = fixture.componentInstance;
    host = fixture.nativeElement as HTMLElement;
  });

  it('renders a real <input> inside the host', () => {
    fixture.detectChanges();
    const input = host.querySelector('input');
    expect(input).not.toBeNull();
  });

  it('applies size class via host binding', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    expect(host.className).toContain('kp-input--lg');
  });

  it('reflects disabled on the native input + aria-disabled on the host', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const input = host.querySelector('input') as HTMLInputElement;
    expect(input.disabled).toBe(true);
    expect(host.getAttribute('aria-disabled')).toBe('true');
  });

  it('forceState="error" sets aria-invalid=true on the host', () => {
    fixture.componentRef.setInput('forceState', 'error');
    fixture.detectChanges();
    expect(host.getAttribute('aria-invalid')).toBe('true');
  });

  it('propagates placeholder to the native input', () => {
    fixture.componentRef.setInput('placeholder', 'your@email.com');
    fixture.detectChanges();
    const input = host.querySelector('input') as HTMLInputElement;
    expect(input.placeholder).toBe('your@email.com');
  });

  it('type prop drives the native input type', () => {
    fixture.componentRef.setInput('type', 'password');
    fixture.detectChanges();
    const input = host.querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('password');
  });

  it('user typing updates the component value and fires ControlValueAccessor onChange', () => {
    fixture.detectChanges();
    const input = host.querySelector('input') as HTMLInputElement;
    const spy = vi.fn();
    component.registerOnChange(spy);
    input.value = 'hello';
    input.dispatchEvent(new Event('input'));
    expect(component.value).toBe('hello');
    expect(spy).toHaveBeenCalledWith('hello');
  });

  it('writeValue updates the component value', () => {
    component.writeValue('from-form');
    fixture.detectChanges();
    expect(component.value).toBe('from-form');
  });

  it('aria-label falls back to label when ariaLabel input is unset', () => {
    fixture.componentRef.setInput('label', 'Email');
    fixture.detectChanges();
    const input = host.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-label')).toBe('Email');
  });

  it('aria-label falls back to placeholder when neither ariaLabel nor label is set', () => {
    fixture.componentRef.setInput('placeholder', 'your@email.com');
    fixture.detectChanges();
    const input = host.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-label')).toBe('your@email.com');
  });

  it('aria-label falls back to "Input" when nothing else is set', () => {
    fixture.detectChanges();
    const input = host.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-label')).toBe('Input');
  });

  it('ariaLabel input wins over label and placeholder', () => {
    fixture.componentRef.setInput('label', 'L');
    fixture.componentRef.setInput('placeholder', 'P');
    fixture.componentRef.setInput('ariaLabel', 'Custom');
    fixture.detectChanges();
    const input = host.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-label')).toBe('Custom');
  });
});

describe('KpInputComponent integration with ReactiveForms', () => {
  @Component({
    standalone: true,
    imports: [KpInputComponent, ReactiveFormsModule],
    template: `<kp-input [formControl]="ctrl" placeholder="demo" />`,
  })
  class HostComp {
    ctrl = new FormControl('');
  }

  it('two-way syncs the FormControl value with the native input', async () => {
    await TestBed.configureTestingModule({ imports: [HostComp] }).compileComponents();
    const fix = TestBed.createComponent(HostComp);
    fix.detectChanges();
    const nativeInput = fix.nativeElement.querySelector('input') as HTMLInputElement;

    // from FormControl → view
    fix.componentInstance.ctrl.setValue('from-control');
    fix.detectChanges();
    expect(nativeInput.value).toBe('from-control');

    // from view → FormControl
    nativeInput.value = 'from-view';
    nativeInput.dispatchEvent(new Event('input'));
    expect(fix.componentInstance.ctrl.value).toBe('from-view');
  });
});
