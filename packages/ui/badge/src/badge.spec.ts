import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpBadgeComponent } from './badge.component';

describe('KpBadgeComponent', () => {
  let fixture: ComponentFixture<KpBadgeComponent>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [KpBadgeComponent] }).compileComponents();
    fixture = TestBed.createComponent(KpBadgeComponent);
    host = fixture.nativeElement as HTMLElement;
  });

  it('applies size, appearance, color classes to the host', () => {
    const c = fixture.componentInstance;
    c.size = 'sm'; c.appearance = 'outline'; c.color = 'danger';
    fixture.detectChanges();
    expect(host.className).toContain('kp-badge--sm');
    expect(host.className).toContain('kp-badge--outline');
    expect(host.className).toContain('kp-badge--danger');
  });

  it('applies pill modifier when pill=true', () => {
    fixture.componentInstance.pill = true;
    fixture.detectChanges();
    expect(host.className).toContain('kp-badge--pill');
  });

  it('applies count modifier when count=true', () => {
    fixture.componentInstance.count = true;
    fixture.detectChanges();
    expect(host.className).toContain('kp-badge--count');
  });

  it('applies closable modifier when closable=true', () => {
    fixture.componentRef.setInput('closable', true);
    fixture.detectChanges();
    expect(host.className).toContain('kp-badge--closable');
  });

  it('renders the close button only when closable=true', () => {
    fixture.detectChanges();
    expect(host.querySelector('.kp-badge__close')).toBeNull();
    fixture.componentRef.setInput('closable', true);
    fixture.detectChanges();
    expect(host.querySelector('.kp-badge__close')).not.toBeNull();
  });

  it('emits (close) when the close button is clicked', () => {
    fixture.componentRef.setInput('closable', true);
    fixture.detectChanges();
    const spy = vi.fn();
    fixture.componentInstance.close.subscribe(spy);
    const closeBtn = host.querySelector('.kp-badge__close') as HTMLElement;
    closeBtn.click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('renders the leading dot when showLeadingDot=true', () => {
    fixture.componentInstance.showLeadingDot = true;
    fixture.detectChanges();
    expect(host.querySelector('.kp-badge__dot')).not.toBeNull();
  });
});
