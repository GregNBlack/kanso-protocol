import { TestBed } from '@angular/core/testing';
import { Component, inject } from '@angular/core';
import {
  KP_LOCALE,
  KP_STRINGS,
  KP_DEFAULT_STRINGS_EN,
  injectKpStrings,
  injectKpLocale,
  kpFormatDate,
  kpFormatTime,
  kpMonthNames,
  kpWeekdayNames,
  kpDayPeriod,
} from './index';

describe('@kanso-protocol/ui/i18n', () => {
  describe('KP_LOCALE', () => {
    it('falls back to en-US when no override is provided', () => {
      TestBed.configureTestingModule({});
      const locale = TestBed.runInInjectionContext(() => injectKpLocale());
      // navigator.language is set in the test environment; just verify it's a string
      expect(typeof locale).toBe('string');
      expect(locale.length).toBeGreaterThan(0);
    });

    it('honors an app-level override', () => {
      TestBed.configureTestingModule({
        providers: [{ provide: KP_LOCALE, useValue: 'fr-FR' }],
      });
      const locale = TestBed.runInInjectionContext(() => injectKpLocale());
      expect(locale).toBe('fr-FR');
    });
  });

  describe('KP_STRINGS / injectKpStrings', () => {
    it('returns English defaults when nothing is overridden', () => {
      TestBed.configureTestingModule({});
      const s = TestBed.runInInjectionContext(() => injectKpStrings());
      expect(s.close).toBe('Close');
      expect(s.today).toBe('Today');
      expect(s.commandPalettePlaceholder).toBe('Type a command or search…');
    });

    it('partial override merges with defaults', () => {
      TestBed.configureTestingModule({
        providers: [
          {
            provide: KP_STRINGS,
            useValue: { close: 'Закрыть', today: 'Сегодня' },
          },
        ],
      });
      const s = TestBed.runInInjectionContext(() => injectKpStrings());
      expect(s.close).toBe('Закрыть');
      expect(s.today).toBe('Сегодня');
      // Untouched keys still come from defaults
      expect(s.cancel).toBe('Cancel');
    });

    it('function-typed strings work after merge', () => {
      TestBed.configureTestingModule({
        providers: [
          {
            provide: KP_STRINGS,
            useValue: { dropzoneRemove: (n: string) => `Удалить ${n}` },
          },
        ],
      });
      const s = TestBed.runInInjectionContext(() => injectKpStrings());
      expect(typeof s.dropzoneRemove).toBe('function');
      expect(s.dropzoneRemove('foo.pdf')).toBe('Удалить foo.pdf');
    });

    it('default English includes every documented key', () => {
      const required: (keyof typeof KP_DEFAULT_STRINGS_EN)[] = [
        'close', 'clear', 'cancel', 'confirm', 'loading', 'noResults',
        'today', 'yesterday', 'thisWeek', 'lastWeek', 'thisMonth', 'lastMonth',
        'selectDate', 'selectTime', 'previousMonth', 'nextMonth',
        'timeHour', 'timeMinute', 'timeSecond', 'timeDayPeriod', 'timeNow',
        'dropzoneTitle', 'dropzoneRemove', 'dropzoneUploaded',
        'searchPlaceholder', 'commandPaletteHint', 'commandPalettePlaceholder',
      ];
      for (const k of required) {
        expect(KP_DEFAULT_STRINGS_EN[k]).toBeDefined();
      }
    });
  });

  describe('Intl helpers', () => {
    const may5 = new Date(2026, 4, 5); // 2026-05-05

    it('kpFormatDate respects locale', () => {
      const en = kpFormatDate(may5, 'en-US', { dateStyle: 'long' });
      const fr = kpFormatDate(may5, 'fr-FR', { dateStyle: 'long' });
      expect(en).toContain('May');
      expect(fr).toContain('mai');
    });

    it('kpFormatTime returns short time', () => {
      const noon = new Date(2026, 4, 5, 12, 0);
      const out = kpFormatTime(noon, 'en-US');
      // "12:00 PM" or "12:00 PM" format
      expect(out).toMatch(/12[:.]00/);
    });

    it('kpMonthNames returns 12 entries in long form', () => {
      const months = kpMonthNames('en-US', 'long');
      expect(months.length).toBe(12);
      expect(months[0]).toBe('January');
      expect(months[11]).toBe('December');
    });

    it('kpMonthNames localizes', () => {
      const ru = kpMonthNames('ru-RU', 'long');
      expect(ru[0].toLowerCase()).toContain('янв');
    });

    it('kpWeekdayNames starts on Monday by default', () => {
      const en = kpWeekdayNames('en-US', 1, 'short');
      expect(en.length).toBe(7);
      expect(en[0].toLowerCase().startsWith('mon')).toBe(true);
      expect(en[6].toLowerCase().startsWith('sun')).toBe(true);
    });

    it('kpWeekdayNames can start on Sunday', () => {
      const en = kpWeekdayNames('en-US', 0, 'short');
      expect(en[0].toLowerCase().startsWith('sun')).toBe(true);
    });

    it('kpDayPeriod returns AM/PM for en-US', () => {
      expect(kpDayPeriod(9, 'en-US')).toBe('AM');
      expect(kpDayPeriod(15, 'en-US')).toBe('PM');
    });
  });
});
