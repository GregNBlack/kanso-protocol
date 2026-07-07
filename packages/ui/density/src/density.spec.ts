import { TestBed } from '@angular/core/testing';
import { inject, signal } from '@angular/core';
import {
  KP_DENSITY,
  DENSITY_SIZE,
  provideKansoDensity,
  resolveDensitySize,
  KpDensity,
} from './public-api';

describe('@kanso-protocol/ui/density', () => {
  describe('DENSITY_SIZE', () => {
    it('maps each density step to a component size', () => {
      expect(DENSITY_SIZE.compact).toBe('sm');
      expect(DENSITY_SIZE.comfortable).toBe('md');
      expect(DENSITY_SIZE.spacious).toBe('lg');
    });
  });

  describe('KP_DENSITY / provideKansoDensity', () => {
    it('is not provided by default (optional injection yields null)', () => {
      TestBed.configureTestingModule({});
      const getter = TestBed.runInInjectionContext(() =>
        inject(KP_DENSITY, { optional: true }),
      );
      expect(getter).toBeNull();
    });

    it('provides a static density as a getter', () => {
      TestBed.configureTestingModule({ providers: [provideKansoDensity('compact')] });
      const getter = TestBed.inject(KP_DENSITY);
      expect(typeof getter).toBe('function');
      expect(getter()).toBe('compact');
    });

    it('provides a signal-backed density (reads latest value)', () => {
      const density = signal<KpDensity>('comfortable');
      TestBed.configureTestingModule({ providers: [provideKansoDensity(density)] });
      const getter = TestBed.inject(KP_DENSITY);
      expect(getter()).toBe('comfortable');
      density.set('spacious');
      expect(getter()).toBe('spacious');
    });
  });

  describe('resolveDensitySize', () => {
    it('returns the explicit size when set, ignoring density', () => {
      const density = () => 'compact' as const;
      expect(resolveDensitySize('lg', density)).toBe('lg');
    });

    it('falls back to the density-mapped size when explicit is null', () => {
      expect(resolveDensitySize(null, () => 'compact')).toBe('sm');
      expect(resolveDensitySize(undefined, () => 'spacious')).toBe('lg');
    });

    it('falls back to comfortable (md) when neither explicit nor density is set', () => {
      expect(resolveDensitySize(null, null)).toBe('md');
      expect(resolveDensitySize(undefined, undefined)).toBe('md');
    });
  });
});
