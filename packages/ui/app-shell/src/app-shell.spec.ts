import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpAppShellComponent } from './app-shell.component';

@Component({
  standalone: true,
  imports: [KpAppShellComponent],
  template: `
    <kp-app-shell
      [layout]="layout"
      [showHeader]="showHeader"
      [showSidebar]="showSidebar"
      [showFooter]="showFooter"
      [showBanner]="showBanner"
    >
      <div kpAppShellHeader class="proj-header">HEADER</div>
      <div kpAppShellBanner class="proj-banner">BANNER</div>
      <div kpAppShellSidebar class="proj-sidebar">SIDEBAR</div>
      <div kpAppShellBody class="proj-body">BODY</div>
      <div kpAppShellFooter class="proj-footer">FOOTER</div>
    </kp-app-shell>
  `,
})
class HostComponent {
  layout = 'sidebar-left';
  showHeader = true;
  showSidebar = true;
  showFooter = false;
  showBanner = false;
}

describe('KpAppShellComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let shell: HTMLElement;

  function sync() {
    fixture.componentRef.changeDetectorRef.markForCheck();
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    sync();
    shell = fixture.nativeElement.querySelector('kp-app-shell') as HTMLElement;
  });

  it('applies the base host class and the layout modifier class', () => {
    expect(shell.classList.contains('kp-app-shell')).toBe(true);
    expect(shell.classList.contains('kp-app-shell--sidebar-left')).toBe(true);
  });

  it('updates the layout modifier class when layout changes', () => {
    host.layout = 'sidebar-right';
    sync();
    expect(shell.classList.contains('kp-app-shell--sidebar-right')).toBe(true);
    expect(shell.classList.contains('kp-app-shell--sidebar-left')).toBe(false);
  });

  // --- Header slot + @if branch ---

  it('renders the header wrapper and projects [kpAppShellHeader] when showHeader=true', () => {
    const wrapper = shell.querySelector('.kp-app-shell__header');
    expect(wrapper).not.toBeNull();
    expect(wrapper!.querySelector('.proj-header')!.textContent).toContain('HEADER');
  });

  it('omits the header wrapper when showHeader=false', () => {
    host.showHeader = false;
    sync();
    expect(shell.querySelector('.kp-app-shell__header')).toBeNull();
  });

  // --- Banner slot + @if branch ---

  it('omits the banner wrapper by default (showBanner=false)', () => {
    expect(shell.querySelector('.kp-app-shell__banner')).toBeNull();
  });

  it('renders the banner wrapper and projects [kpAppShellBanner] when showBanner=true', () => {
    host.showBanner = true;
    sync();
    const wrapper = shell.querySelector('.kp-app-shell__banner');
    expect(wrapper).not.toBeNull();
    expect(wrapper!.querySelector('.proj-banner')!.textContent).toContain('BANNER');
  });

  // --- Sidebar slot + @if branch ---

  it('renders the sidebar <aside> and projects [kpAppShellSidebar] when showSidebar=true and layout has a sidebar', () => {
    const aside = shell.querySelector('aside.kp-app-shell__sidebar');
    expect(aside).not.toBeNull();
    expect(aside!.querySelector('.proj-sidebar')!.textContent).toContain('SIDEBAR');
  });

  it('omits the sidebar when showSidebar=false', () => {
    host.showSidebar = false;
    sync();
    expect(shell.querySelector('.kp-app-shell__sidebar')).toBeNull();
  });

  it('omits the sidebar when layout="no-sidebar" even though showSidebar=true', () => {
    host.layout = 'no-sidebar';
    sync();
    expect(host.showSidebar).toBe(true);
    expect(shell.querySelector('.kp-app-shell__sidebar')).toBeNull();
  });

  // --- Body (always rendered) ---

  it('always renders the main region and projects [kpAppShellBody]', () => {
    const main = shell.querySelector('main.kp-app-shell__main');
    expect(main).not.toBeNull();
    expect(main!.querySelector('.proj-body')!.textContent).toContain('BODY');
  });

  it('keeps the main region even when header, sidebar and footer are all hidden', () => {
    host.showHeader = false;
    host.showSidebar = false;
    host.showFooter = false;
    sync();
    expect(shell.querySelector('main.kp-app-shell__main')).not.toBeNull();
  });

  // --- Footer slot + @if branch ---

  it('omits the footer wrapper by default (showFooter=false)', () => {
    expect(shell.querySelector('.kp-app-shell__footer')).toBeNull();
  });

  it('renders the footer <footer> and projects [kpAppShellFooter] when showFooter=true', () => {
    host.showFooter = true;
    sync();
    const footer = shell.querySelector('footer.kp-app-shell__footer');
    expect(footer).not.toBeNull();
    expect(footer!.querySelector('.proj-footer')!.textContent).toContain('FOOTER');
  });

  // --- Semantic structure ---

  it('uses semantic landmark elements (<aside>, <main>, <footer>) for the regions', () => {
    host.showFooter = true;
    sync();
    expect(shell.querySelector('aside')).not.toBeNull();
    expect(shell.querySelector('main')).not.toBeNull();
    expect(shell.querySelector('footer')).not.toBeNull();
  });
});
