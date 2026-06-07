import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpPageHeaderComponent } from './page-header.component';

describe('KpPageHeaderComponent', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [KpPageHeaderComponent] });
    const fix = TestBed.createComponent(KpPageHeaderComponent);
    return { fix, host: fix.nativeElement as HTMLElement };
  }

  it('renders the default title in an <h1> when no title slot is projected', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('title', 'All projects');
    fix.detectChanges();

    const h1 = host.querySelector('h1.kp-page-header__title');
    expect(h1).not.toBeNull();
    expect(h1!.textContent).toContain('All projects');
  });

  it('applies size + align host classes', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('size', 'lg');
    fix.componentRef.setInput('align', 'center');
    fix.detectChanges();

    expect(host.className).toContain('kp-page-header');
    expect(host.className).toContain('kp-page-header--lg');
    expect(host.className).toContain('kp-page-header--align-center');
  });

  it('defaults to md size and start align', () => {
    const { fix, host } = setup();
    fix.detectChanges();
    expect(host.className).toContain('kp-page-header--md');
    expect(host.className).toContain('kp-page-header--align-start');
  });

  it('renders the description only when showDescription=true and description is set', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('description', '12 active projects');
    fix.detectChanges();
    // showDescription defaults false -> not rendered
    expect(host.querySelector('.kp-page-header__desc')).toBeNull();
    expect(host.textContent).not.toContain('12 active projects');

    fix.componentRef.setInput('showDescription', true);
    fix.detectChanges();
    const desc = host.querySelector('.kp-page-header__desc');
    expect(desc).not.toBeNull();
    expect(desc!.textContent).toContain('12 active projects');
  });

  it('does not render description when showDescription=true but description is null', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('showDescription', true);
    fix.componentRef.setInput('description', null);
    fix.detectChanges();
    expect(host.querySelector('.kp-page-header__desc')).toBeNull();
  });

  it('renders the back button only when showBackButton=true, with an aria-label', () => {
    const { fix, host } = setup();
    fix.detectChanges();
    expect(host.querySelector('.kp-page-header__back')).toBeNull();

    fix.componentRef.setInput('showBackButton', true);
    fix.detectChanges();
    const back = host.querySelector('button.kp-page-header__back');
    expect(back).not.toBeNull();
    expect(back!.getAttribute('aria-label')).toBe('Back');
  });

  it('emits backClick when the back button is clicked', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('showBackButton', true);
    fix.detectChanges();

    const spy = vi.fn();
    fix.componentInstance.backClick.subscribe(spy);

    const back = host.querySelector('button.kp-page-header__back') as HTMLButtonElement;
    back.click();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('renders the bottom divider by default and removes it when showBottomDivider=false', () => {
    const { fix, host } = setup();
    fix.detectChanges();
    expect(host.querySelector('.kp-page-header__divider')).not.toBeNull();
    // divider is decorative
    expect(host.querySelector('.kp-page-header__divider')!.getAttribute('aria-hidden')).toBe('true');
    // host hook is null (not zeroed) while divider shown
    expect(host.style.getPropertyValue('--kp-ph-pad-bottom')).toBe('');

    fix.componentRef.setInput('showBottomDivider', false);
    fix.detectChanges();
    expect(host.querySelector('.kp-page-header__divider')).toBeNull();
    // hook is zeroed to avoid a phantom gap
    expect(host.style.getPropertyValue('--kp-ph-pad-bottom')).toBe('0px');
  });

  it('toggles the crumbs / actions / tabs container blocks via show flags', () => {
    const { fix, host } = setup();
    fix.detectChanges();
    expect(host.querySelector('.kp-page-header__crumbs')).toBeNull();
    expect(host.querySelector('.kp-page-header__actions')).toBeNull();
    expect(host.querySelector('.kp-page-header__tabs')).toBeNull();

    fix.componentRef.setInput('showBreadcrumbs', true);
    fix.componentRef.setInput('showActions', true);
    fix.componentRef.setInput('showTabs', true);
    fix.detectChanges();
    expect(host.querySelector('.kp-page-header__crumbs')).not.toBeNull();
    expect(host.querySelector('.kp-page-header__actions')).not.toBeNull();
    expect(host.querySelector('.kp-page-header__tabs')).not.toBeNull();
  });
});

describe('KpPageHeaderComponent — content projection', () => {
  @Component({
    standalone: true,
    imports: [KpPageHeaderComponent],
    template: `
      <kp-page-header
        title="Fallback title"
        [showBreadcrumbs]="true"
        [showActions]="true"
        [showTabs]="true"
      >
        <nav kpPageHeaderBreadcrumbs class="proj-crumbs">Home / Projects</nav>
        <div kpPageHeaderActions class="proj-actions">
          <button type="button" class="proj-create">Create</button>
        </div>
        <div kpPageHeaderTabs class="proj-tabs">Tab A · Tab B</div>
      </kp-page-header>
    `,
  })
  class HostComp {}

  function setup(): { fix: ComponentFixture<HostComp>; root: HTMLElement } {
    TestBed.configureTestingModule({ imports: [HostComp] });
    const fix = TestBed.createComponent(HostComp);
    fix.detectChanges();
    return { fix, root: fix.nativeElement as HTMLElement };
  }

  it('projects breadcrumbs into the crumbs slot', () => {
    const { root } = setup();
    const crumbs = root.querySelector('.kp-page-header__crumbs');
    expect(crumbs).not.toBeNull();
    expect(crumbs!.querySelector('.proj-crumbs')).not.toBeNull();
    expect(crumbs!.textContent).toContain('Home / Projects');
  });

  it('projects actions into the actions slot', () => {
    const { root } = setup();
    const actions = root.querySelector('.kp-page-header__actions');
    expect(actions).not.toBeNull();
    expect(actions!.querySelector('button.proj-create')).not.toBeNull();
  });

  it('projects tabs into the tabs slot', () => {
    const { root } = setup();
    const tabs = root.querySelector('.kp-page-header__tabs');
    expect(tabs).not.toBeNull();
    expect(tabs!.textContent).toContain('Tab A');
  });

  it('uses the default <h1> title when no kpPageHeaderTitle is projected', () => {
    const { root } = setup();
    expect(root.querySelector('h1.kp-page-header__title')).not.toBeNull();
    expect(root.querySelector('.proj-title')).toBeNull();
    expect(root.textContent).toContain('Fallback title');
  });
});

describe('KpPageHeaderComponent — projected custom title slot', () => {
  @Component({
    standalone: true,
    imports: [KpPageHeaderComponent],
    template: `
      <kp-page-header title="Fallback title">
        <div kpPageHeaderTitle class="proj-title">Custom title</div>
      </kp-page-header>
    `,
  })
  class TitleHostComp {}

  it('replaces the default <h1> fallback with the projected title content', () => {
    TestBed.configureTestingModule({ imports: [TitleHostComp] });
    const fix = TestBed.createComponent(TitleHostComp);
    fix.detectChanges();
    const root = fix.nativeElement as HTMLElement;

    const custom = root.querySelector('.proj-title');
    expect(custom).not.toBeNull();
    expect(custom!.textContent).toContain('Custom title');
    // default fallback h1 is not rendered when the slot is filled
    expect(root.querySelector('h1.kp-page-header__title')).toBeNull();
    expect(root.textContent).not.toContain('Fallback title');
  });
});
