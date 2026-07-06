import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpMarkdownViewerComponent } from './markdown-viewer.component';

describe('KpMarkdownViewerComponent', () => {
  // Warm the `marked` module cache once before the async specs. The component
  // lazy-loads `marked` via a dynamic import on first render (see
  // defaultParser); that cold first import can resolve later than the fixed
  // macrotask ticks in flush(), which made the first markdown spec race the
  // import and see empty output. Pre-warming makes every render's import
  // resolve from cache, so flush()'s ticks are always sufficient.
  beforeAll(async () => {
    await import('marked');
  });

  function setup() {
    TestBed.configureTestingModule({ imports: [KpMarkdownViewerComponent] });
    const fix = TestBed.createComponent(KpMarkdownViewerComponent);
    return { fix, host: fix.nativeElement as HTMLElement, cmp: fix.componentInstance };
  }

  // The default parser lazy-loads `marked` via dynamic import, so rendering
  // resolves on a microtask. Drain it, then apply the markForCheck'd output.
  async function flush(fix: ComponentFixture<unknown>): Promise<void> {
    // Two ticks: one for the dynamic import / parser promise, one for the
    // chained .then that sets `rendered`.
    await new Promise((r) => setTimeout(r));
    await new Promise((r) => setTimeout(r));
    fix.detectChanges();
  }

  it('applies size class to host', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('size', 'lg');
    fix.detectChanges();
    expect(host.className).toContain('kp-markdown-viewer--lg');
  });

  it('renders markdown headings as <hN>', async () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('content', '# Title\n\n## Sub');
    fix.detectChanges();
    await flush(fix);
    expect(host.querySelector('h1')?.textContent).toBe('Title');
    expect(host.querySelector('h2')?.textContent).toBe('Sub');
  });

  it('renders bullet lists as <ul><li>', async () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('content', '- one\n- two\n- three');
    fix.detectChanges();
    await flush(fix);
    const items = host.querySelectorAll('ul li');
    expect(items.length).toBe(3);
  });

  it('renders fenced code blocks as <pre><code>', async () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('content', '```\nconst x = 1;\n```');
    fix.detectChanges();
    await flush(fix);
    const code = host.querySelector('pre code');
    expect(code?.textContent).toContain('const x = 1;');
  });

  it('renders empty string when content is empty / null', async () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('content', '');
    fix.detectChanges();
    await flush(fix);
    expect(host.querySelector('h1')).toBeNull();
    expect(host.querySelector('p')).toBeNull();

    fix.componentRef.setInput('content', null);
    fix.detectChanges();
    await flush(fix);
    expect(host.querySelector('h1')).toBeNull();
  });

  it('updates output when content changes', async () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('content', '# First');
    fix.detectChanges();
    await flush(fix);
    expect(host.querySelector('h1')?.textContent).toBe('First');

    fix.componentRef.setInput('content', '# Second');
    fix.detectChanges();
    await flush(fix);
    expect(host.querySelector('h1')?.textContent).toBe('Second');
  });

  it('strips <script> when trusted=false (default)', async () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('content', 'before <script>alert(1)</script> after');
    fix.detectChanges();
    await flush(fix);
    // Angular's automatic sanitizer (innerHTML) strips <script>
    expect(host.querySelector('script')).toBeNull();
    expect(host.textContent).toContain('before');
    expect(host.textContent).toContain('after');
  });

  it('uses a custom (synchronous) parser when provided', async () => {
    const { fix, host, cmp } = setup();
    cmp.parser = (md) => `<section><strong>${md.toUpperCase()}</strong></section>`;
    fix.componentRef.setInput('content', 'hello');
    fix.detectChanges();
    await flush(fix);
    expect(host.querySelector('section strong')?.textContent).toBe('HELLO');
  });

  it('supports an async custom parser', async () => {
    const { fix, host, cmp } = setup();
    cmp.parser = (md) => Promise.resolve(`<em>${md.toUpperCase()}</em>`);
    fix.componentRef.setInput('content', 'later');
    fix.detectChanges();
    await flush(fix);
    expect(host.querySelector('em')?.textContent).toBe('LATER');
  });

  it('handles inline code, links, bold, italic', async () => {
    const { fix, host } = setup();
    fix.componentRef.setInput(
      'content',
      'Use `npm` to install [docs](https://example.com) **bold** *em*'
    );
    fix.detectChanges();
    await flush(fix);
    expect(host.querySelector('code')?.textContent).toBe('npm');
    expect(host.querySelector('a')?.getAttribute('href')).toBe('https://example.com');
    expect(host.querySelector('strong')?.textContent).toBe('bold');
    expect(host.querySelector('em')?.textContent).toBe('em');
  });

  it('catches synchronous parser errors gracefully', () => {
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

  it('catches async parser rejections gracefully', async () => {
    const { fix, host, cmp } = setup();
    cmp.parser = () => Promise.reject(new Error('boom'));
    let errored = 0;
    const orig = console.error;
    console.error = () => { errored += 1; };
    fix.componentRef.setInput('content', '# anything');
    fix.detectChanges();
    await flush(fix);
    console.error = orig;
    expect(errored).toBeGreaterThan(0);
    expect(host.querySelector('h1')).toBeNull();
  });
});
