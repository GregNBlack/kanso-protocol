import { TestBed } from '@angular/core/testing';
import { KpFileUploadComponent, KpFileRejection, KpUploadFile } from './file-upload.component';

function makeFile(name: string, size: number, type = 'text/plain'): File {
  const f = new File(['x'.repeat(Math.min(size, 1024))], name, { type });
  Object.defineProperty(f, 'size', { value: size });
  return f;
}

describe('KpFileUploadComponent', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [KpFileUploadComponent] });
    const fix = TestBed.createComponent(KpFileUploadComponent);
    fix.detectChanges();
    return { fix, host: fix.nativeElement as HTMLElement, cmp: fix.componentInstance };
  }

  it('applies size + appearance classes to the host', () => {
    const { fix, host } = setup();
    fix.componentRef.setInput('size', 'lg');
    fix.componentRef.setInput('appearance', 'compact');
    fix.detectChanges();
    expect(host.className).toContain('kp-file-upload--lg');
    expect(host.className).toContain('kp-file-upload--compact');
  });

  it('emits filesAdded for accepted files and tracks them', () => {
    const { fix, cmp } = setup();
    fix.componentRef.setInput('multiple', true);
    let added: KpUploadFile[] = [];
    cmp.filesAdded.subscribe((f) => (added = f));
    const f1 = makeFile('a.txt', 100);
    const f2 = makeFile('b.txt', 200);
    (cmp as any).ingest([f1, f2]);
    expect(added.length).toBe(2);
    expect(cmp.files.length).toBe(2);
    expect(cmp.files[0].file.name).toBe('a.txt');
  });

  it('keeps only the first file when multiple=false', () => {
    const { cmp } = setup();
    (cmp as any).ingest([makeFile('a.txt', 100), makeFile('b.txt', 100)]);
    expect(cmp.files.length).toBe(1);
    expect(cmp.files[0].file.name).toBe('a.txt');
  });

  it('rejects files exceeding maxSize', () => {
    const { fix, cmp } = setup();
    fix.componentRef.setInput('maxSize', 500);
    let rejected: KpFileRejection[] = [];
    cmp.filesRejected.subscribe((r) => (rejected = r));
    (cmp as any).ingest([makeFile('big.txt', 1000)]);
    expect(rejected.length).toBe(1);
    expect(rejected[0].reason).toBe('size');
    expect(cmp.files.length).toBe(0);
  });

  it('rejects files when total count would exceed maxFiles', () => {
    const { fix, cmp } = setup();
    fix.componentRef.setInput('multiple', true);
    fix.componentRef.setInput('maxFiles', 2);
    let rejected: KpFileRejection[] = [];
    cmp.filesRejected.subscribe((r) => (rejected = r));
    (cmp as any).ingest([
      makeFile('a.txt', 1),
      makeFile('b.txt', 1),
      makeFile('c.txt', 1),
    ]);
    expect(cmp.files.length).toBe(2);
    expect(rejected.length).toBe(1);
    expect(rejected[0].reason).toBe('count');
  });

  it('rejects files whose type does not match accept (extension match)', () => {
    const { fix, cmp } = setup();
    fix.componentRef.setInput('accept', '.pdf');
    let rejected: KpFileRejection[] = [];
    cmp.filesRejected.subscribe((r) => (rejected = r));
    (cmp as any).ingest([makeFile('doc.txt', 50)]);
    expect(rejected.length).toBe(1);
    expect(rejected[0].reason).toBe('type');
  });

  it('accepts via wildcard mime (image/*)', () => {
    const { fix, cmp } = setup();
    fix.componentRef.setInput('accept', 'image/*');
    let added: KpUploadFile[] = [];
    cmp.filesAdded.subscribe((f) => (added = f));
    (cmp as any).ingest([makeFile('photo.png', 10, 'image/png')]);
    expect(added.length).toBe(1);
  });

  it('removes a file by id and emits fileRemoved', () => {
    const { fix, cmp } = setup();
    fix.componentRef.setInput('multiple', true);
    (cmp as any).ingest([makeFile('a.txt', 1), makeFile('b.txt', 1)]);
    let removed: KpUploadFile | null = null;
    cmp.fileRemoved.subscribe((f) => (removed = f));
    const id = cmp.files[0].id;
    cmp.remove(id);
    expect(cmp.files.length).toBe(1);
    expect(removed!.id).toBe(id);
  });

  it('setProgress clamps and flips status to uploading', () => {
    const { cmp } = setup();
    (cmp as any).ingest([makeFile('a.txt', 1)]);
    const id = cmp.files[0].id;
    cmp.setProgress(id, 150);
    expect(cmp.files[0].progress).toBe(100);
    expect(cmp.files[0].status).toBe('uploading');
  });

  it('setStatus("success") forces progress to 100', () => {
    const { cmp } = setup();
    (cmp as any).ingest([makeFile('a.txt', 1)]);
    const id = cmp.files[0].id;
    cmp.setStatus(id, 'success');
    expect(cmp.files[0].progress).toBe(100);
    expect(cmp.files[0].status).toBe('success');
  });

  it('setStatus("error") records the error message', () => {
    const { cmp } = setup();
    (cmp as any).ingest([makeFile('a.txt', 1)]);
    const id = cmp.files[0].id;
    cmp.setStatus(id, 'error', 'network down');
    expect(cmp.files[0].status).toBe('error');
    expect(cmp.files[0].error).toBe('network down');
  });

  it('formatSize renders B / KB / MB / GB', () => {
    const { cmp } = setup();
    expect(cmp.formatSize(500)).toBe('500 B');
    expect(cmp.formatSize(2048)).toBe('2.0 KB');
    expect(cmp.formatSize(2 * 1024 * 1024)).toBe('2.0 MB');
    expect(cmp.formatSize(2 * 1024 * 1024 * 1024)).toBe('2.0 GB');
  });

  it('ignores ingest when disabled', () => {
    const { fix, cmp } = setup();
    fix.componentRef.setInput('disabled', true);
    fix.detectChanges();
    const zone = (fix.nativeElement as HTMLElement).querySelector('.kp-file-upload__zone') as HTMLElement;
    cmp.openFilePicker();
    expect(zone.getAttribute('aria-disabled')).toBe('true');
    expect(zone.getAttribute('tabindex')).toBe('-1');
  });
});
