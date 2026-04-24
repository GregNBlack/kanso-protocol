import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KpBreadcrumbsComponent } from './breadcrumbs.component';
import { KpBreadcrumbItemComponent } from './breadcrumb-item.component';
import { KpBreadcrumbSeparatorComponent } from './breadcrumb-separator.component';

describe('KpBreadcrumbs composition', () => {
  @Component({
    standalone: true,
    imports: [KpBreadcrumbsComponent, KpBreadcrumbItemComponent, KpBreadcrumbSeparatorComponent],
    template: `
      <kp-breadcrumbs>
        <kp-breadcrumb-item label="Home" href="/"/>
        <kp-breadcrumb-separator/>
        <kp-breadcrumb-item label="Team" href="/team"/>
        <kp-breadcrumb-separator/>
        <kp-breadcrumb-item label="Profile" type="current"/>
      </kp-breadcrumbs>
    `,
  })
  class HostComp {}

  it('uses a <nav> element with role navigation + aria-label', () => {
    TestBed.configureTestingModule({ imports: [HostComp] });
    const fix = TestBed.createComponent(HostComp);
    fix.detectChanges();
    const nav = fix.nativeElement.querySelector('nav');
    expect(nav).not.toBeNull();
    expect(nav.getAttribute('aria-label')).toBe('Breadcrumb');
  });

  it('renders every breadcrumb-item and separator', () => {
    TestBed.configureTestingModule({ imports: [HostComp] });
    const fix = TestBed.createComponent(HostComp);
    fix.detectChanges();
    expect(fix.nativeElement.querySelectorAll('kp-breadcrumb-item').length).toBe(3);
    expect(fix.nativeElement.querySelectorAll('kp-breadcrumb-separator').length).toBe(2);
  });

  it('current item has aria-current="page"', () => {
    TestBed.configureTestingModule({ imports: [HostComp] });
    const fix = TestBed.createComponent(HostComp);
    fix.detectChanges();
    const items = fix.nativeElement.querySelectorAll('kp-breadcrumb-item');
    const last = items[2].querySelector('[aria-current]');
    expect(last?.getAttribute('aria-current')).toBe('page');
  });

  it('link-type item renders an <a> with the given href', () => {
    TestBed.configureTestingModule({ imports: [HostComp] });
    const fix = TestBed.createComponent(HostComp);
    fix.detectChanges();
    const first = fix.nativeElement.querySelectorAll('kp-breadcrumb-item')[0];
    const a = first.querySelector('a');
    expect(a?.getAttribute('href')).toBe('/');
  });
});
