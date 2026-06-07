import { TestBed } from '@angular/core/testing';
import { KpMarkdownViewerComponent } from './markdown-viewer.component';

describe('KpMarkdownViewerComponent', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [KpMarkdownViewerComponent] });
    const fix = TestBed.createComponent(KpMarkdownViewerComponent);
    return { fix, host: fix.nativeElement as HTMLElement, cmp: fix.componentInstance };
  }

  it('applies size class to host', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('size', 'lg');
    fix.detectChanges();
    expect(host.className).toContain('kp-markdown-viewer--lg');
  });

  it('renders markdown headings as <hN>', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('content', '# Title\n\n## Sub');
    fix.detectChanges();
    expect(host.querySelector('h1')?.textContent).toBe('Title');
    expect(host.querySelector('h2')?.textContent).toBe('Sub');
  });

  it('renders bullet lists as <ul><li>', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('content', '- one\n- two\n- three');
    fix.detectChanges();
    const items = host.querySelectorAll('ul li');
    expect(items.length).toBe(3);
  });

  it('renders fenced code blocks as <pre><code>', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('content', '```\nconst x = 1;\n```');
    fix.detectChanges();
    const code = host.querySelector('pre code');
    expect(code?.textContent).toContain('const x = 1;');
  });

  it('renders empty string when content is empty / null', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('content', '');
    fix.detectChanges();
    expect(host.querySelector('h1')).toBeNull();
    expect(host.querySelector('p')).toBeNull();

    fix.componentRef.setInput('content', null);
    fix.detectChanges();
    expect(host.querySelector('h1')).toBeNull();
  });

  it('updates output when content changes', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('content', '# First');
    fix.detectChanges();
    expect(host.querySelector('h1')?.textContent).toBe('First');

    fix.componentRef.setInput('content', '# Second');
    fix.detectChanges();
    expect(host.querySelector('h1')?.textContent).toBe('Second');
  });

  it('strips <script> when trusted=false (default)', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('content', 'before <script>alert(1)</script> after');
    fix.detectChanges();
    // Angular's automatic sanitizer (innerHTML) strips <script>
    expect(host.querySelector('script')).toBeNull();
    expect(host.textContent).toContain('before');
    expect(host.textContent).toContain('after');
  });

  it('uses a custom parser when provided', () => {
    const { fix, host, cmp } = setup();
    cmp.parser = (md) => `<section><strong>${md.toUpperCase()}</strong></section>`;
    fix.componentRef.setInput('content', 'hello');
    fix.detectChanges();
    expect(host.querySelector('section strong')?.textContent).toBe('HELLO');
  });

  it('handles inline code, links, bold, italic', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput(
      'content',
      'Use `npm` to install [docs](https://example.com) **bold** *em*'
    );
    fix.detectChanges();
    expect(host.querySelector('code')?.textContent).toBe('npm');
    expect(host.querySelector('a')?.getAttribute('href')).toBe('https://example.com');
    expect(host.querySelector('strong')?.textContent).toBe('bold');
    expect(host.querySelector('em')?.textContent).toBe('em');
  });

  it('catches parser errors gracefully', () => {
    const { fix, host, cmp } = setup();
    cmp.parser = () => {
      throw new Error('boom');
    };
    let errored = 0;
    const orig = console.error;
    console.error = () => { errored += 1; };
    try {
      fix.componentRef.setInput('content', '# anything');
      fix.detectChanges();
    } finally {
      console.error = orig;
    }
    expect(errored).toBeGreaterThan(0);
    expect(host.querySelector('h1')).toBeNull();
  });
});
