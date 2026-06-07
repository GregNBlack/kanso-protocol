import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KpRadioComponent } from './radio.component';
import { KpRadioGroupComponent } from './radio-group.component';

/**
 * Radios wrap real native <input type="radio"> elements. Inside a
 * <kp-radio-group>, browser-native mutual exclusion via shared name
 * does the work; the group only tracks the selected value.
 */
describe('KpRadioGroup + KpRadio', () => {
  @Component({
    standalone: true,
    imports: [KpRadioGroupComponent, KpRadioComponent],
    template: `
      <kp-radio-group [value]="value" (valueChange)="value = $event" name="color">
        <kp-radio [value]="'red'">Red</kp-radio>
        <kp-radio [value]="'blue'">Blue</kp-radio>
        <kp-radio [value]="'green'" [disabled]="true">Green</kp-radio>
      </kp-radio-group>
    `,
  })
  class HostComp {
    value: string | null = 'red';
  }

  function setup() {
    TestBed.configureTestingModule({ imports: [HostComp] });
    const fix = TestBed.createComponent(HostComp);
    fix.detectChanges();
    return { fix, root: fix.nativeElement as HTMLElement };
  }

  it('radio-group has role="radiogroup"', () => {
    const { root } = setup();
    expect(root.querySelector('kp-radio-group')?.getAttribute('role')).toBe('radiogroup');
  });

  it('each <kp-radio> contains a native <input type="radio">', () => {
    const { root } = setup();
    const inputs = root.querySelectorAll('input[type="radio"]');
    expect(inputs.length).toBe(3);
  });

  it('all radios in a group share the same name (browser handles mutual exclusion)', () => {
    const { root } = setup();
    const inputs = Array.from(root.querySelectorAll('input[type="radio"]')) as HTMLInputElement[];
    expect(inputs[0].name).toBe('color');
    expect(inputs[1].name).toBe('color');
    expect(inputs[2].name).toBe('color');
  });

  it('selected radio reflects in native input.checked', () => {
    const { root } = setup();
    const inputs = Array.from(root.querySelectorAll('input[type="radio"]')) as HTMLInputElement[];
    expect(inputs[0].checked).toBe(true);
    expect(inputs[1].checked).toBe(false);
  });

  it('changing radio selection updates the group value', () => {
    const { fix, root } = setup();
    const inputs = Array.from(root.querySelectorAll('input[type="radio"]')) as HTMLInputElement[];
    inputs[1].checked = true;
    inputs[1].dispatchEvent(new Event('change', { bubbles: true }));
    fix.detectChanges();
    expect(fix.componentInstance.value).toBe('blue');
    expect(inputs[1].checked).toBe(true);
    expect(inputs[0].checked).toBe(false);
  });

  it('disabled radio has the native disabled attribute', () => {
    const { root } = setup();
    const inputs = Array.from(root.querySelectorAll('input[type="radio"]')) as HTMLInputElement[];
    expect(inputs[2].disabled).toBe(true);
  });
});
