import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpIconComponent } from './icon.component';
import { KP_ICON_REGISTRY } from './icon-registry';

// A minimal stroke SVG and a filled SVG to exercise the dimension rewriter.
const STROKE_SVG = '<svg viewBox="0 0 24 24" stroke="currentColor" width="24" height="24" stroke-width="2"><path d="M0 0h4"/></svg>';
const FILLED_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M0 0h4"/></svg>';

describe('KpIconComponent', () => {
  let fixture: ComponentFixture<KpIconComponent>;
  let host: HTMLElement;

  beforeEach(async () => {
    // Seed the shared registry with spec-only names so we don't depend on the
    // generated allowlist contents (which can change as icons are added).
    KP_ICON_REGISTRY.register('spec-stroke', STROKE_SVG);
    KP_ICON_REGISTRY.register('spec-filled', FILLED_SVG);

    await TestBed.configureTestingModule({ imports: [KpIconComponent] }).compileComponents();
    fixture = TestBed.createComponent(KpIconComponent);
    host = fixture.nativeElement as HTMLElement;
  });

  function render(name: string, size?: string) {
    fixture.componentRef.setInput('name', name);
    if (size) fixture.componentRef.setInput('size', size);
    fixture.detectChanges();
    return host.querySelector('svg');
  }

  it('is decorative: host carries aria-hidden="true"', () => {
    expect(host.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders a registered icon inline as SVG', () => {
    const svg = render('spec-stroke');
    expect(svg).toBeTruthy();
    expect(svg!.querySelector('path')).toBeTruthy();
  });

  it('applies the size ramp to host class and SVG dimensions', () => {
    const svg = render('spec-stroke', 'lg');
    expect(host.classList.contains('kp-icon')).toBe(true);
    expect(host.classList.contains('kp-icon--lg')).toBe(true);
    // lg → 22px box, stroke 1.75 (stroke icon)
    expect(svg!.getAttribute('width')).toBe('22');
    expect(svg!.getAttribute('height')).toBe('22');
    expect(svg!.getAttribute('stroke-width')).toBe('1.75');
  });

  it('defaults to md (18px, stroke 1.5)', () => {
    const svg = render('spec-stroke');
    expect(host.classList.contains('kp-icon--md')).toBe(true);
    expect(svg!.getAttribute('width')).toBe('18');
    expect(svg!.getAttribute('stroke-width')).toBe('1.5');
  });

  it('does not add stroke-width to filled (stroke="none") icons', () => {
    const svg = render('spec-filled', 'sm');
    expect(svg!.getAttribute('width')).toBe('16');
    expect(svg!.getAttribute('stroke-width')).toBeNull();
  });

  it('renders nothing and warns once for an unknown name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const svg = render('definitely-not-a-real-icon');
    expect(svg).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('definitely-not-a-real-icon');
    warn.mockRestore();
  });

  it('renders nothing for an empty name without warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    fixture.componentRef.setInput('name', '');
    fixture.detectChanges();
    expect(host.querySelector('svg')).toBeNull();
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('reacts to a name change', () => {
    render('spec-stroke');
    expect(host.querySelector('svg')).toBeTruthy();
    fixture.componentRef.setInput('name', 'spec-filled');
    fixture.detectChanges();
    // filled svg has fill but no stroke-width applied
    expect(host.querySelector('svg')!.getAttribute('fill')).toBe('currentColor');
  });
});

describe('KP_ICON_REGISTRY', () => {
  it('register() then has()/get() round-trips', () => {
    KP_ICON_REGISTRY.register('spec-reg-one', '<svg><g/></svg>');
    expect(KP_ICON_REGISTRY.has('spec-reg-one')).toBe(true);
    expect(KP_ICON_REGISTRY.get('spec-reg-one')).toContain('<g');
  });

  it('registerMany() adds every entry', () => {
    KP_ICON_REGISTRY.registerMany({
      'spec-many-a': '<svg id="a"/>',
      'spec-many-b': '<svg id="b"/>',
    });
    expect(KP_ICON_REGISTRY.has('spec-many-a')).toBe(true);
    expect(KP_ICON_REGISTRY.has('spec-many-b')).toBe(true);
  });

  it('get() returns undefined for unknown names', () => {
    expect(KP_ICON_REGISTRY.get('spec-never-registered')).toBeUndefined();
    expect(KP_ICON_REGISTRY.has('spec-never-registered')).toBe(false);
  });

  it('ships a non-empty default icon set', () => {
    // The generated Tabler allowlist should populate the registry.
    expect(KP_ICON_REGISTRY.names().length).toBeGreaterThan(50);
  });
});
