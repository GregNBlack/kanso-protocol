import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KpCardComponent } from './card.component';

describe('KpCardComponent', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [KpCardComponent] });
    const fix = TestBed.createComponent(KpCardComponent);
    return { fix, host: fix.nativeElement as HTMLElement };
  }

  it('applies size + appearance classes', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('size', 'lg');
    fix.componentRef.setInput('appearance', 'outline');
    fix.detectChanges();
    expect(host.className).toContain('kp-card--lg');
    expect(host.className).toContain('kp-card--outline');
  });

  it('renders header with title when showHeader=true (default)', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('title', 'Team');
    fix.detectChanges();
    expect(host.textContent).toContain('Team');
    expect(host.querySelector('.kp-card__header')).not.toBeNull();
  });

  it('suppresses the header when showHeader=false', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('title', 'Team');
    fix.componentRef.setInput('showHeader', false);
    fix.detectChanges();
    expect(host.querySelector('.kp-card__header')).toBeNull();
  });

  it('renders description only when showDescription=true', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('title', 'Team');
    fix.componentRef.setInput('description', '42 members');
    fix.detectChanges();
    expect(host.textContent).not.toContain('42 members');
    fix.componentRef.setInput('showDescription', true);
    fix.detectChanges();
    expect(host.textContent).toContain('42 members');
  });
});

describe('KpCardComponent — projected header slots', () => {
  @Component({
    standalone: true,
    imports: [KpCardComponent],
    template: `
      <kp-card title="Fallback title" description="Fallback desc" [showDescription]="true">
        <div kpCardHeaderLeading class="proj-leading">AV</div>
        <div kpCardTitle class="proj-title">Custom title</div>
        <div kpCardDescription class="proj-desc">Custom desc</div>
      </kp-card>
    `,
  })
  class SlottedHeaderHostComp {}

  it('projected title/description slots replace their string fallbacks', () => {
    TestBed.configureTestingModule({ imports: [SlottedHeaderHostComp] });
    const fix = TestBed.createComponent(SlottedHeaderHostComp);
    fix.detectChanges();
    const root = fix.nativeElement as HTMLElement;

    expect(root.querySelector('.proj-leading')?.textContent).toBe('AV');
    expect(root.querySelector('.proj-title')?.textContent).toBe('Custom title');
    expect(root.querySelector('.proj-desc')?.textContent).toBe('Custom desc');
    // fallback string-driven elements are not rendered when their slot is filled
    expect(root.querySelector('.kp-card__title')).toBeNull();
    expect(root.querySelector('.kp-card__desc')).toBeNull();
    expect(root.textContent).not.toContain('Fallback title');
    expect(root.textContent).not.toContain('Fallback desc');
  });

  @Component({
    standalone: true,
    imports: [KpCardComponent],
    template: `<kp-card title="Team" [showDescription]="true" description="42 members" />`,
  })
  class UnslottedHeaderHostComp {}

  it('.kp-card__leading stays empty (and hidden) when nothing is projected into it', () => {
    TestBed.configureTestingModule({ imports: [UnslottedHeaderHostComp] });
    const fix = TestBed.createComponent(UnslottedHeaderHostComp);
    fix.detectChanges();
    const root = fix.nativeElement as HTMLElement;

    const leading = root.querySelector('.kp-card__leading') as HTMLElement;
    expect(leading).not.toBeNull();
    expect(getComputedStyle(leading).display).toBe('none');
    expect(root.querySelector('.kp-card__title')?.textContent).toBe('Team');
    expect(root.querySelector('.kp-card__desc')?.textContent).toBe('42 members');
  });
});
