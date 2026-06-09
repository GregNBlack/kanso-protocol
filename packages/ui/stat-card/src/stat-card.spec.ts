import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KpIconComponent } from '@kanso-protocol/ui/icon';

import { KpStatCardComponent } from './stat-card.component';

/** Host that projects real content into the sparkline slot. */
@Component({
  standalone: true,
  imports: [KpStatCardComponent],
  template: `
    <kp-stat-card [showSparkline]="true">
      <svg kpStatCardSparkline data-testid="chart"></svg>
    </kp-stat-card>
  `,
})
class SparklineHostComponent {}

describe('KpStatCardComponent', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [KpStatCardComponent] });
    const fix = TestBed.createComponent(KpStatCardComponent);
    return { fix, host: fix.nativeElement as HTMLElement };
  }

  /** Resolve the rendered <kp-icon> instances inside the card. */
  function icons(fix: ComponentFixture<unknown>): KpIconComponent[] {
    return fix.debugElement
      .queryAll(By.directive(KpIconComponent))
      .map((de) => de.componentInstance as KpIconComponent);
  }

  it('renders the label and value', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('label', 'Active users');
    fix.componentRef.setInput('value', 1234);
    fix.detectChanges();

    expect(host.querySelector('.kp-stat__label')?.textContent).toContain('Active users');
    expect(host.querySelector('.kp-stat__value')?.textContent).toContain('1234');
  });

  it('reflects the size input to a host class', () => {
    const { fix, host } = setup();

    fix.detectChanges();
    expect(host.className).toContain('kp-stat--md'); // default

    fix.componentRef.setInput('size', 'lg');
    fix.detectChanges();
    expect(host.className).toContain('kp-stat--lg');
    expect(host.className).not.toContain('kp-stat--md');

    fix.componentRef.setInput('size', 'sm');
    fix.detectChanges();
    expect(host.className).toContain('kp-stat--sm');
  });

  describe('icon', () => {
    it('does not render the icon block when showIcon=false (default)', () => {
      const { fix, host } = setup();
      fix.detectChanges();
      expect(host.querySelector('.kp-stat__icon')).toBeNull();
    });

    it('renders the icon block with the given glyph when showIcon=true', () => {
      const { fix, host } = setup();
      fix.componentRef.setInput('showIcon', true);
      fix.componentRef.setInput('icon', 'users');
      fix.detectChanges();

      const slot = host.querySelector('.kp-stat__icon');
      expect(slot).not.toBeNull();
      const headerIcon = icons(fix).find((i) => i.name === 'users');
      expect(headerIcon).toBeDefined();
    });

    it('omits the icon block when showIcon=true but icon is null', () => {
      const { fix, host } = setup();
      fix.componentRef.setInput('showIcon', true);
      fix.componentRef.setInput('icon', null);
      fix.detectChanges();
      expect(host.querySelector('.kp-stat__icon')).toBeNull();
    });
  });

  describe('trend', () => {
    it('renders the trend block by default with value and description', () => {
      const { fix, host } = setup();
      fix.componentRef.setInput('trendValue', '+12.5%');
      fix.componentRef.setInput('trendDescription', 'from last month');
      fix.detectChanges();

      const trend = host.querySelector('.kp-stat__trend');
      expect(trend).not.toBeNull();
      expect(trend?.querySelector('.kp-stat__trend-value')?.textContent).toContain('+12.5%');
      expect(trend?.querySelector('.kp-stat__trend-desc')?.textContent).toContain('from last month');
    });

    it('hides the trend block when showTrend=false', () => {
      const { fix, host } = setup();
      fix.componentRef.setInput('showTrend', false);
      fix.detectChanges();
      expect(host.querySelector('.kp-stat__trend')).toBeNull();
    });

    it('omits the description span when trendDescription is null', () => {
      const { fix, host } = setup();
      fix.componentRef.setInput('trendDescription', null);
      fix.detectChanges();
      expect(host.querySelector('.kp-stat__trend')).not.toBeNull();
      expect(host.querySelector('.kp-stat__trend-desc')).toBeNull();
    });

    function tone(host: HTMLElement): string | null {
      return host.querySelector('.kp-stat__trend')?.getAttribute('data-tone') ?? null;
    }
    function trendIconName(fix: ComponentFixture<unknown>): string | undefined {
      return fix.debugElement
        .query(By.css('.kp-stat__trend-icon'))
        ?.componentInstance.name;
    }

    it('positive + up = good tone with trending-up icon', () => {
      const { fix, host } = setup();
      fix.componentRef.setInput('trendAppearance', 'positive');
      fix.componentRef.setInput('trendDirection', 'up');
      fix.detectChanges();
      expect(tone(host)).toBe('good');
      expect(trendIconName(fix)).toBe('trending-up');
    });

    it('positive + down = bad tone with trending-down icon', () => {
      const { fix, host } = setup();
      fix.componentRef.setInput('trendAppearance', 'positive');
      fix.componentRef.setInput('trendDirection', 'down');
      fix.detectChanges();
      expect(tone(host)).toBe('bad');
      expect(trendIconName(fix)).toBe('trending-down');
    });

    it('negative + up = bad tone (inverse metric)', () => {
      const { fix, host } = setup();
      fix.componentRef.setInput('trendAppearance', 'negative');
      fix.componentRef.setInput('trendDirection', 'up');
      fix.detectChanges();
      expect(tone(host)).toBe('bad');
      expect(trendIconName(fix)).toBe('trending-up');
    });

    it('negative + down = good tone (inverse metric)', () => {
      const { fix, host } = setup();
      fix.componentRef.setInput('trendAppearance', 'negative');
      fix.componentRef.setInput('trendDirection', 'down');
      fix.detectChanges();
      expect(tone(host)).toBe('good');
      expect(trendIconName(fix)).toBe('trending-down');
    });

    it('neutral direction = neutral tone with minus icon regardless of appearance', () => {
      const { fix, host } = setup();
      fix.componentRef.setInput('trendAppearance', 'positive');
      fix.componentRef.setInput('trendDirection', 'neutral');
      fix.detectChanges();
      expect(tone(host)).toBe('neutral');
      expect(trendIconName(fix)).toBe('minus');
    });
  });

  describe('sparkline', () => {
    it('does not render the sparkline region by default', () => {
      const { fix, host } = setup();
      fix.detectChanges();
      expect(host.querySelector('.kp-stat__sparkline')).toBeNull();
    });

    it('renders the styled placeholder when showSparkline=true and nothing is projected', () => {
      const { fix, host } = setup();
      fix.componentRef.setInput('showSparkline', true);
      fix.detectChanges();
      expect(host.querySelector('.kp-stat__sparkline')).not.toBeNull();
      expect(host.querySelector('.kp-stat__sparkline-placeholder')).not.toBeNull();
    });

    it('renders projected content into the slot instead of the placeholder', () => {
      TestBed.configureTestingModule({ imports: [SparklineHostComponent] });
      const fix = TestBed.createComponent(SparklineHostComponent);
      fix.detectChanges();
      const host = fix.nativeElement as HTMLElement;

      expect(host.querySelector('.kp-stat__sparkline')).not.toBeNull();
      expect(host.querySelector('[data-testid="chart"]')).not.toBeNull();
      expect(host.querySelector('.kp-stat__sparkline-placeholder')).toBeNull();
    });

    it('draws a built-in polyline from sparklineData', () => {
      const { fix, host } = setup();
      fix.componentRef.setInput('showSparkline', true);
      fix.componentRef.setInput('sparklineData', [1, 5, 2, 8, 3]);
      fix.detectChanges();
      const poly = host.querySelector('.kp-stat__sparkline-svg polyline');
      expect(poly).not.toBeNull();
      // 5 data points → 5 "x,y" pairs
      expect(poly!.getAttribute('points')!.trim().split(/\s+/).length).toBe(5);
      expect(host.querySelector('.kp-stat__sparkline-placeholder')).toBeNull();
    });

    it('falls back to the placeholder when sparklineData has < 2 points', () => {
      const { fix, host } = setup();
      fix.componentRef.setInput('showSparkline', true);
      fix.componentRef.setInput('sparklineData', [5]);
      fix.detectChanges();
      expect(host.querySelector('.kp-stat__sparkline-svg')).toBeNull();
      expect(host.querySelector('.kp-stat__sparkline-placeholder')).not.toBeNull();
    });
  });
});
