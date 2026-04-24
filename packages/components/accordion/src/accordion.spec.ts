import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KpAccordionComponent } from './accordion.component';
import { KpAccordionItemComponent } from './accordion-item.component';

describe('KpAccordion + KpAccordionItem', () => {
  @Component({
    standalone: true,
    imports: [KpAccordionComponent, KpAccordionItemComponent],
    template: `
      <kp-accordion [mode]="mode" [showOuterBorder]="showOuterBorder">
        <kp-accordion-item title="One" [expanded]="a === 0" (expandedChange)="a = $event ? 0 : -1">
          <div kpAccordionItemContent>Content 1</div>
        </kp-accordion-item>
        <kp-accordion-item title="Two" [expanded]="a === 1" (expandedChange)="a = $event ? 1 : -1">
          <div kpAccordionItemContent>Content 2</div>
        </kp-accordion-item>
      </kp-accordion>
    `,
  })
  class HostComp {
    mode: 'single' | 'multi' = 'single';
    showOuterBorder = true;
    a = 0;
  }

  function setup() {
    TestBed.configureTestingModule({ imports: [HostComp] });
    const fix = TestBed.createComponent(HostComp);
    fix.detectChanges();
    return { fix, root: fix.nativeElement as HTMLElement };
  }

  it('renders trigger buttons for each item with aria-expanded', () => {
    const { root } = setup();
    const triggers = root.querySelectorAll('button[aria-expanded]');
    expect(triggers.length).toBe(2);
    expect(triggers[0].getAttribute('aria-expanded')).toBe('true');
    expect(triggers[1].getAttribute('aria-expanded')).toBe('false');
  });

  it('clicking a collapsed trigger opens it in single mode — previous closes', () => {
    const { fix, root } = setup();
    const triggers = root.querySelectorAll('button[aria-expanded]');
    (triggers[1] as HTMLButtonElement).click();
    fix.detectChanges();
    expect(triggers[0].getAttribute('aria-expanded')).toBe('false');
    expect(triggers[1].getAttribute('aria-expanded')).toBe('true');
  });

  it('outer-border variant applies the surface class on kp-accordion', () => {
    const { root } = setup();
    const acc = root.querySelector('kp-accordion');
    expect(acc?.className).toContain('kp-accordion--outer');
  });

  it('last item in group gets the border-clearing class', () => {
    const { root } = setup();
    const items = root.querySelectorAll('kp-accordion-item');
    expect(items[items.length - 1].className).toContain('kp-ai--last-in-group');
  });
});
