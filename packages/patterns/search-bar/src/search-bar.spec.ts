import { TestBed } from '@angular/core/testing';
import { KpSearchBarComponent } from './search-bar.component';

describe('KpSearchBarComponent', () => {
  function setup(inputs: Record<string, unknown> = {}) {
    TestBed.configureTestingModule({ imports: [KpSearchBarComponent] });
    const fix = TestBed.createComponent(KpSearchBarComponent);
    for (const [k, v] of Object.entries(inputs)) fix.componentRef.setInput(k, v);
    fix.detectChanges();
    return { fix, host: fix.nativeElement as HTMLElement };
  }

  it('inline variant renders a native <input>', () => {
    const { host } = setup();
    expect(host.querySelector('input')).not.toBeNull();
  });

  it('palette variant renders role=listbox with explicit aria-label (axe aria-input-field-name)', () => {
    const { host } = setup({ variant: 'command-palette' });
    const listbox = host.querySelector('.kp-search-bar__groups');
    expect(listbox).not.toBeNull();
    expect(listbox?.getAttribute('role')).toBe('listbox');
    expect(listbox?.getAttribute('aria-label')).toBe('Search results');
  });
});
