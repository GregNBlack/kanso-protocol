import { TestBed } from '@angular/core/testing';
import { KpPaginationComponent } from './pagination.component';

describe('KpPaginationComponent', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [KpPaginationComponent] });
    const fix = TestBed.createComponent(KpPaginationComponent);
    return { fix, host: fix.nativeElement as HTMLElement };
  }

  it('host has role="navigation" + aria-label', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('totalPages', 5);
    fix.detectChanges();
    expect(host.getAttribute('role')).toBe('navigation');
    expect(host.getAttribute('aria-label')).toBeTruthy();
  });

  it('current page item has aria-current="page"', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('totalPages', 10);
    fix.componentRef.setInput('currentPage', 3);
    fix.detectChanges();
    const current = host.querySelector('[aria-current="page"]');
    expect(current).not.toBeNull();
    expect(current!.textContent?.trim()).toBe('3');
  });

  it('emits (pageChange) when a page is clicked', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('totalPages', 5);
    fix.componentRef.setInput('currentPage', 1);
    fix.detectChanges();
    const spy = vi.fn();
    fix.componentInstance.pageChange.subscribe(spy);
    // Click the "2" pagination item.
    const page2 = Array.from(host.querySelectorAll('kp-pagination-item'))
      .find((el) => el.textContent?.trim() === '2');
    (page2?.querySelector('button') as HTMLButtonElement)?.click();
    fix.detectChanges();
    expect(spy).toHaveBeenCalledWith(2);
  });

  it('Prev is disabled on the first page', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('totalPages', 5);
    fix.componentRef.setInput('currentPage', 1);
    fix.detectChanges();
    const prev = host.querySelector('kp-pagination-item[class*="prev"]');
    // Fallback selector: first nav item = prev when showPrevNext=true.
    const first = host.querySelector('kp-pagination-item');
    expect((first?.querySelector('button') as HTMLButtonElement | null)?.disabled).toBe(true);
  });

  it('Next is disabled on the last page', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('totalPages', 3);
    fix.componentRef.setInput('currentPage', 3);
    fix.detectChanges();
    const items = host.querySelectorAll('kp-pagination-item');
    const last = items[items.length - 1];
    expect((last?.querySelector('button') as HTMLButtonElement | null)?.disabled).toBe(true);
  });
});
