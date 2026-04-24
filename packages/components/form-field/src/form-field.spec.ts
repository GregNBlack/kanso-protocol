import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { KpFormFieldComponent } from './form-field.component';
import {
  KP_DEFAULT_VALIDATION_MESSAGES,
  KP_VALIDATION_MESSAGES,
  KpValidationMessages,
  resolveErrorMessage,
} from './validation-messages';
import { KpInputComponent } from '@kanso-protocol/input';

describe('KpFormFieldComponent — static props', () => {
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

  it('manual [error]=true applies error modifier', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('error', true);
    fix.detectChanges();
    expect(host.className).toContain('kp-form-field--error');
  });
});

describe('KpFormFieldComponent — auto-error from NgControl', () => {
  @Component({
    standalone: true,
    imports: [KpFormFieldComponent, KpInputComponent, ReactiveFormsModule],
    template: `
      <kp-form-field label="Email" [errors]="customErrors">
        <kp-input [formControl]="ctrl" />
      </kp-form-field>
    `,
  })
  class HostComp {
    ctrl = new FormControl('', [Validators.required, Validators.minLength(3)]);
    customErrors: KpValidationMessages | null = null;
  }

  function setup() {
    TestBed.configureTestingModule({ imports: [HostComp] });
    const fix = TestBed.createComponent(HostComp);
    fix.detectChanges();
    return { fix, root: fix.nativeElement as HTMLElement };
  }

  it('pristine/untouched invalid control does NOT render the error', () => {
    const { root } = setup();
    const ff = root.querySelector('kp-form-field')!;
    expect(ff.className).not.toContain('kp-form-field--error');
    expect(root.querySelector('.kp-form-field__helper')).toBeNull();
  });

  it('after touching an invalid control, error message appears', () => {
    const { fix, root } = setup();
    const ctrl = fix.componentInstance.ctrl;
    ctrl.markAsTouched();
    ctrl.updateValueAndValidity();
    fix.detectChanges();
    const ff = root.querySelector('kp-form-field')!;
    expect(ff.className).toContain('kp-form-field--error');
    expect(root.querySelector('.kp-form-field__helper')?.textContent)
      .toBe(KP_DEFAULT_VALIDATION_MESSAGES['required']);
  });

  it('picks the first failing validator message', () => {
    const { fix, root } = setup();
    const ctrl = fix.componentInstance.ctrl;
    ctrl.setValue('ab');
    ctrl.markAsTouched();
    ctrl.updateValueAndValidity();
    fix.detectChanges();
    // minLength message has a function resolver — `requiredLength` is 3, actual 2.
    const msg = root.querySelector('.kp-form-field__helper')?.textContent ?? '';
    expect(msg).toContain('At least 3 characters');
    expect(msg).toContain('you entered 2');
  });

  it('per-field [errors] override beats the registry', () => {
    // Seed the override BEFORE the first detectChanges so Angular's
    // change-detection pass doesn't trip ExpressionChangedAfterCheck.
    TestBed.configureTestingModule({ imports: [HostComp] });
    const fix = TestBed.createComponent(HostComp);
    fix.componentInstance.customErrors = { required: 'Нужно ввести email' };
    fix.detectChanges();
    const root = fix.nativeElement as HTMLElement;

    const ctrl = fix.componentInstance.ctrl;
    ctrl.markAsTouched();
    ctrl.updateValueAndValidity();
    fix.detectChanges();
    expect(root.querySelector('.kp-form-field__helper')?.textContent)
      .toBe('Нужно ввести email');
  });

  it('error clears once the control becomes valid', () => {
    const { fix, root } = setup();
    const ctrl = fix.componentInstance.ctrl;
    ctrl.markAsTouched();
    ctrl.updateValueAndValidity();
    fix.detectChanges();
    expect(root.querySelector('kp-form-field')!.className).toContain('kp-form-field--error');

    ctrl.setValue('valid@email.com');
    fix.detectChanges();
    expect(root.querySelector('kp-form-field')!.className).not.toContain('kp-form-field--error');
  });
});

describe('KpFormFieldComponent — validation message registry', () => {
  it('resolveErrorMessage merges: per-field > token > defaults', () => {
    const token: KpValidationMessages = { required: 'from token' };
    const perField: KpValidationMessages = { required: 'from field' };
    expect(resolveErrorMessage({ required: true }, perField, token)).toBe('from field');
    expect(resolveErrorMessage({ required: true }, null, token)).toBe('from token');
    expect(resolveErrorMessage({ required: true }, null, KP_DEFAULT_VALIDATION_MESSAGES))
      .toBe(KP_DEFAULT_VALIDATION_MESSAGES['required']);
  });

  it('resolveErrorMessage evaluates function resolvers with the payload', () => {
    const msg = resolveErrorMessage(
      { minlength: { requiredLength: 5, actualLength: 2 } },
      null,
      KP_DEFAULT_VALIDATION_MESSAGES,
    );
    expect(msg).toContain('At least 5 characters');
  });

  it('falls back to a generic message when no resolver is found', () => {
    const msg = resolveErrorMessage({ myCustomValidator: true }, null, {});
    expect(msg).toContain('myCustomValidator');
  });

  it('KP_VALIDATION_MESSAGES token can be overridden at the TestBed level', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: KP_VALIDATION_MESSAGES, useValue: { required: 'Overridden' } },
      ],
    });
    const registry = TestBed.inject(KP_VALIDATION_MESSAGES);
    expect(registry['required']).toBe('Overridden');
  });
});
