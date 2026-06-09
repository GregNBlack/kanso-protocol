import { InjectionToken, inject } from '@angular/core';
import { KpValidationMessages, KP_DEFAULT_VALIDATION_MESSAGES } from './validation';

/**
 * BCP-47 locale tag used by every Kanso component that calls into Intl
 * APIs (date / time / number formatting, weekday names, etc.).
 *
 * Default factory pulls from `navigator.language` if available, else
 * falls back to `'en-US'`. Override at the app root:
 *
 *   providers: [{ provide: KP_LOCALE, useValue: 'fr-FR' }]
 *
 * Or per-feature via a child injector. Components inject this lazily —
 * changing it at runtime requires re-rendering the affected components.
 */
export const KP_LOCALE = new InjectionToken<string>('KP_LOCALE', {
  factory: () =>
    typeof navigator !== 'undefined' && navigator.language
      ? navigator.language
      : 'en-US',
});

/**
 * Static UI strings that don't have an Intl equivalent — labels, ARIA
 * fallbacks, button text. Anything that DOES have an Intl form (month
 * names, day-period markers, time formats) is derived from `KP_LOCALE`
 * via the helpers in `intl.ts` instead of being listed here.
 *
 * Add a key here only after you've confirmed it's not derivable from
 * Intl. The goal is a small registry — large registries rot fast.
 */
export interface KpLocaleStrings {
  // Generic chrome
  close: string;
  clear: string;
  cancel: string;
  confirm: string;
  loading: string;
  noResults: string;

  // Date / time pickers — buttons + presets
  today: string;
  yesterday: string;
  thisWeek: string;
  lastWeek: string;
  thisMonth: string;
  lastMonth: string;
  selectDate: string;
  selectTime: string;
  previousMonth: string;
  nextMonth: string;

  // Timepicker columns + footer
  timeHour: string;
  timeMinute: string;
  timeSecond: string;
  timeDayPeriod: string;
  timeNow: string;

  // File upload
  dropzoneTitle: string;
  dropzoneRemove: (filename: string) => string;
  dropzoneUploaded: string;

  // Search / command palette
  searchPlaceholder: string;
  commandPaletteHint: string;
  commandPalettePlaceholder: string;

  // Pagination — host label, nav buttons, page-cell ARIA, items-per-page UI
  paginationLabel: string;
  paginationPrevious: string;
  paginationNext: string;
  paginationPreviousPage: string;
  paginationNextPage: string;
  paginationGotoPage: (page: number) => string;
  paginationCurrentPage: (page: number) => string;
  paginationItemsPerPage: string;
  paginationShowing: (from: number, to: number, total: number) => string;

  // Toast — close button on every queued toast
  toastDismiss: string;

  // Form-field validation messages, keyed by validator name. Folded in here
  // so all localizable copy lives behind one token. `<kp-form-field>` re-bases
  // on the English defaults, so an override may be partial (per-key).
  validation: KpValidationMessages;
}

/**
 * Built-in English strings. Components that read these go through
 * `injectKpStrings()` so consumers can override per-app or per-locale.
 */
export const KP_DEFAULT_STRINGS_EN: KpLocaleStrings = {
  close: 'Close',
  clear: 'Clear',
  cancel: 'Cancel',
  confirm: 'Confirm',
  loading: 'Loading…',
  noResults: 'No results found',

  today: 'Today',
  yesterday: 'Yesterday',
  thisWeek: 'This week',
  lastWeek: 'Last week',
  thisMonth: 'This month',
  lastMonth: 'Last month',
  selectDate: 'Select date',
  selectTime: 'Select time',
  previousMonth: 'Previous month',
  nextMonth: 'Next month',

  timeHour: 'Hour',
  timeMinute: 'Min',
  timeSecond: 'Sec',
  timeDayPeriod: 'AM/PM',
  timeNow: 'Now',

  dropzoneTitle: 'Drop files here or click to browse',
  dropzoneRemove: (filename) => `Remove ${filename}`,
  dropzoneUploaded: 'Uploaded',

  searchPlaceholder: 'Search…',
  commandPaletteHint: '⌘K',
  commandPalettePlaceholder: 'Type a command or search…',

  paginationLabel: 'Pagination',
  paginationPrevious: 'Previous',
  paginationNext: 'Next',
  paginationPreviousPage: 'Previous page',
  paginationNextPage: 'Next page',
  paginationGotoPage: (page) => `Go to page ${page}`,
  paginationCurrentPage: (page) => `Page ${page}, current page`,
  paginationItemsPerPage: 'Per page',
  paginationShowing: (from, to, total) => `Showing ${from}–${to} of ${total}`,

  toastDismiss: 'Dismiss',

  validation: KP_DEFAULT_VALIDATION_MESSAGES,
};

/**
 * App-level override token. Provide a `Partial<KpLocaleStrings>` —
 * unspecified keys fall through to the English defaults.
 *
 *   providers: [{
 *     provide: KP_STRINGS,
 *     useValue: {
 *       close: 'Закрыть',
 *       today: 'Сегодня',
 *       commandPalettePlaceholder: 'Команда или поиск…',
 *     },
 *   }]
 */
export const KP_STRINGS = new InjectionToken<Partial<KpLocaleStrings>>(
  'KP_STRINGS',
  { factory: () => ({}) },
);

/**
 * Resolve the merged strings dictionary inside a component / directive
 * factory. Reads both the override token and the defaults; consumers
 * never have to remember to merge.
 */
export function injectKpStrings(): KpLocaleStrings {
  const overrides = inject(KP_STRINGS);
  return { ...KP_DEFAULT_STRINGS_EN, ...overrides };
}

/** Convenience accessor with the same lifecycle constraints as `inject(KP_LOCALE)`. */
export function injectKpLocale(): string {
  return inject(KP_LOCALE);
}
