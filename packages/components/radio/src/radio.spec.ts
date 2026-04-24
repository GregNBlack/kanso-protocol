import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KpRadioComponent } from './radio.component';
import { KpRadioGroupComponent } from './radio-group.component';

describe('KpRadioGroup + KpRadio', () => {
  @Component({
    standalone: true,
    imports: [KpRadioGroupComponent, KpRadioComponent],
    template: `
      <kp-radio-group [value]="value" (valueChange)="value = $event" name="color">
        <kp-radio [value]="'red'" label="Red"/>
        <kp-radio [value]="'blue'" label="Blue"/>
        <kp-radio [value]="'green'" label="Green" [disabled]="true"/>
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

  it('each radio has role="radio" and reflects selection via aria-checked', () => {
    const { root } = setup();
    const radios = root.querySelectorAll('kp-radio');
    expect(radios.length).toBe(3);
    expect(radios[0].getAttribute('role')).toBe('radio');
    expect(radios[0].getAttribute('aria-checked')).toBe('true');
    expect(radios[1].getAttribute('aria-checked')).toBe('false');
  });

  it('clicking a radio updates the group value', () => {
    const { fix, root } = setup();
    const radios = root.querySelectorAll('kp-radio');
    (radios[1] as HTMLElement).click();
    fix.detectChanges();
    expect(fix.componentInstance.value).toBe('blue');
    expect(radios[1].getAttribute('aria-checked')).toBe('true');
    expect(radios[0].getAttribute('aria-checked')).toBe('false');
  });

  it('disabled radio does not change selection on click', () => {
    const { fix, root } = setup();
    const radios = root.querySelectorAll('kp-radio');
    (radios[2] as HTMLElement).click();
    fix.detectChanges();
    expect(fix.componentInstance.value).toBe('red');
  });

  it('disabled radio has aria-disabled + tabindex=-1', () => {
    const { root } = setup();
    const last = root.querySelectorAll('kp-radio')[2];
    expect(last.getAttribute('aria-disabled')).toBe('true');
    expect(last.getAttribute('tabindex')).toBe('-1');
  });
});
