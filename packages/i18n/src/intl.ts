/**
 * Thin wrappers over `Intl.DateTimeFormat` so components that take
 * `KP_LOCALE` don't have to repeat the `new Intl.DateTimeFormat(...)`
 * dance. Each helper caches the formatter per (locale, options) — the
 * cache is keyed on a JSON-stringified options object since `Intl`
 * options are small and structurally compared.
 */

const CACHE = new Map<string, Intl.DateTimeFormat>();

function getFormatter(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${locale}::${JSON.stringify(options)}`;
  let f = CACHE.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(locale, options);
    CACHE.set(key, f);
  }
  return f;
}

/**
 * Format a date in the consumer's locale.
 *
 *   kpFormatDate(d, 'fr-FR', { dateStyle: 'medium' })  // "5 mai 2026"
 */
export function kpFormatDate(
  date: Date,
  locale: string,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
): string {
  return getFormatter(locale, options).format(date);
}

/**
 * Format the time portion of a date.
 *
 *   kpFormatTime(d, 'en-US', { hour: 'numeric', minute: '2-digit' })  // "3:45 PM"
 *   kpFormatTime(d, 'de-DE')                                          // "15:45"
 */
export function kpFormatTime(
  date: Date,
  locale: string,
  options: Intl.DateTimeFormatOptions = { timeStyle: 'short' },
): string {
  return getFormatter(locale, options).format(date);
}

/**
 * Localized month names. Reuses a single formatter; the calendar
 * components walk all 12 months once on render.
 *
 *   kpMonthNames('en-US', 'long')   // ['January', 'February', ...]
 *   kpMonthNames('ru-RU', 'short')  // ['янв.', 'февр.', ...]
 */
export function kpMonthNames(
  locale: string,
  format: 'long' | 'short' | 'narrow' = 'long',
): string[] {
  const fmt = getFormatter(locale, { month: format });
  const out: string[] = [];
  // Use day=1 of each month at year=2000 (safe — no month has fewer than 1 day,
  // year is well after epoch + DST offsets don't shift the month).
  for (let m = 0; m < 12; m++) out.push(fmt.format(new Date(2000, m, 1)));
  return out;
}

/**
 * Localized weekday short labels in display order, starting from
 * `firstDayOfWeek` (0 = Sunday, 1 = Monday).
 *
 *   kpWeekdayNames('en-US', 1, 'narrow')  // ['M', 'T', 'W', 'T', 'F', 'S', 'S']
 *   kpWeekdayNames('en-US', 1, 'short')   // ['Mon', 'Tue', ...]
 */
export function kpWeekdayNames(
  locale: string,
  firstDayOfWeek: 0 | 1 = 1,
  format: 'long' | 'short' | 'narrow' = 'short',
): string[] {
  const fmt = getFormatter(locale, { weekday: format });
  // Pick a reference week starting on Sunday 2017-01-01 (Sunday = 0).
  const out: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(2017, 0, 1 + i);
    out.push(fmt.format(d));
  }
  if (firstDayOfWeek === 1) {
    return [...out.slice(1), out[0]];
  }
  return out;
}

/**
 * AM/PM marker for a given hour in the consumer's locale, or empty
 * string if the locale uses 24h format (most of the world).
 *
 *   kpDayPeriod(15, 'en-US') // 'PM'
 *   kpDayPeriod(15, 'de-DE') // ''
 */
export function kpDayPeriod(hour: number, locale: string): string {
  const fmt = getFormatter(locale, { hour: 'numeric', hour12: true });
  // Format "3 PM" → match trailing letters
  const formatted = fmt.format(new Date(2000, 0, 1, hour));
  const m = formatted.match(/[A-Za-zА-Яа-я]+\.?$/);
  return m ? m[0] : '';
}
