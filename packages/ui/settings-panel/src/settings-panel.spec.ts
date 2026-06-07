import { TestBed } from '@angular/core/testing';
import { KpSettingsPanelComponent } from './settings-panel.component';

describe('KpSettingsPanelComponent', () => {
  function setup(inputs: Record<string, unknown> = {}) {
    TestBed.configureTestingModule({ imports: [KpSettingsPanelComponent] });
    const fix = TestBed.createComponent(KpSettingsPanelComponent);
    fix.componentRef.setInput('title', 'Notifications');
    for (const [k, v] of Object.entries(inputs)) fix.componentRef.setInput(k, v);
    fix.detectChanges();
    return { fix, host: fix.nativeElement as HTMLElement };
  }

  it('header renders inside a plain <div>, not a <header> landmark (axe landmark-no-duplicate-banner)', () => {
    const { host } = setup();
    const headerWrap = host.querySelector('.kp-sp__header');
    expect(headerWrap).not.toBeNull();
    expect(headerWrap?.tagName).toBe('DIV');
    // Belt-and-suspenders: no native <header> anywhere inside the panel
    expect(host.querySelector('header')).toBeNull();
  });

  it('renders the title inside the header div', () => {
    const { host } = setup({ title: 'Email preferences' });
    const title = host.querySelector('.kp-sp__title');
    expect(title?.textContent?.trim()).toBe('Email preferences');
  });

  it('omits header entirely when showHeader is false', () => {
    const { host } = setup({ showHeader: false });
    expect(host.querySelector('.kp-sp__header')).toBeNull();
  });
});
