import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KpTabsComponent } from './tabs.component';
import { KpTabComponent } from './tab.component';

/**
 * KpTabs doesn't own selection — each <kp-tab> receives [selected] and
 * emits (selectedChange). The parent only propagates size/fullWidth.
 * This matches our "consumer owns state" pattern for all controls.
 */
describe('KpTabs — composition with KpTab', () => {
  @Component({
    standalone: true,
    imports: [KpTabsComponent, KpTabComponent],
    template: `
      <kp-tabs [size]="size">
        <kp-tab label="One"   [selected]="active === 0" (selectedChange)="active = 0"/>
        <kp-tab label="Two"   [selected]="active === 1" (selectedChange)="active = 1"/>
        <kp-tab label="Three" [selected]="active === 2" [disabled]="true" (selectedChange)="active = 2"/>
      </kp-tabs>
    `,
  })
  class HostComp {
    size: 'sm' | 'md' | 'lg' = 'md';
    active = 0;
  }

  function setup() {
    TestBed.configureTestingModule({ imports: [HostComp] });
    const fix = TestBed.createComponent(HostComp);
    fix.detectChanges();
    return { fix, root: fix.nativeElement as HTMLElement };
  }

  it('renders role=tablist and role=tab elements', () => {
    const { root } = setup();
    expect(root.querySelector('kp-tabs')?.getAttribute('role')).toBe('tablist');
    root.querySelectorAll('kp-tab').forEach((t) => {
      expect(t.getAttribute('role')).toBe('tab');
    });
  });

  it('propagates the selected binding to aria-selected on each tab', () => {
    const { root } = setup();
    const tabs = root.querySelectorAll('kp-tab');
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs[1].getAttribute('aria-selected')).toBe('false');
  });

  it('disabled tab reflects aria-disabled + tabindex=-1', () => {
    const { root } = setup();
    const last = root.querySelectorAll('kp-tab')[2];
    expect(last.getAttribute('aria-disabled')).toBe('true');
    expect(last.getAttribute('tabindex')).toBe('-1');
  });

  it('click on an enabled tab fires (selectedChange) — host updates active index', () => {
    const { fix, root } = setup();
    const secondBtn = root.querySelectorAll('kp-tab')[1].querySelector('button') as HTMLButtonElement;
    secondBtn.click();
    fix.detectChanges();
    expect(fix.componentInstance.active).toBe(1);
    expect(root.querySelectorAll('kp-tab')[1].getAttribute('aria-selected')).toBe('true');
  });

  it('click on a disabled tab is a no-op (native <button disabled> blocks it)', () => {
    const { fix, root } = setup();
    const disabledBtn = root.querySelectorAll('kp-tab')[2].querySelector('button') as HTMLButtonElement;
    disabledBtn.click();
    fix.detectChanges();
    expect(fix.componentInstance.active).toBe(0);
  });

  it('parent propagates size to child tabs on first render', () => {
    // Note: KpTabsComponent only syncs size in ngAfterContentInit — it
    // doesn't react to later changes. This asserts the initial snapshot.
    const { root } = setup();
    root.querySelectorAll('kp-tab').forEach((t) => {
      expect(t.className).toContain('kp-tab--md');
    });
  });
});
