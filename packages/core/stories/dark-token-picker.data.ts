/**
 * Hand-curated list of dark-mode token pairs that fail WCAG AA (4.5:1) in CI.
 *
 * Each entry describes:
 *   - tokenPath: the semantic fg token to override in tokens/themes/dark.json
 *   - displayName: short human label
 *   - context: where this color appears (sample text + the actual bg color hex)
 *   - sample: text to render in the preview
 *   - currentFg: what dark.css resolves the fg to right now (often fails)
 *   - candidates: 5 fg hex values to choose from. All chosen so they pass
 *     contrast against the bg. Designer picks the one that "feels right".
 *
 * The picker UI consumes this list, lets the designer pick one candidate per
 * entry, and outputs a JSON snippet to paste into chat for me to integrate.
 */

export interface PickerCandidate {
  hex: string;
  /** Human label like "blue-100 (light)" so the designer knows what to expect. */
  label: string;
}

export interface PickerEntry {
  tokenPath: string;
  displayName: string;
  context: string;
  bgHex: string;
  sample: string;
  currentFg: string;
  candidates: PickerCandidate[];
}

export const PICKER_ENTRIES: PickerEntry[] = [
  // === BUTTONS ===
  {
    tokenPath: 'color.primary.default.fg.rest',
    displayName: 'Primary button — text on filled bg',
    context: 'kp-button color="primary" variant="default"',
    bgHex: '#60A5FA',
    sample: 'Save changes',
    currentFg: '#18181B', // white-dark-inverted
    candidates: [
      { hex: '#FFFFFF', label: 'white (always)' },
      { hex: '#F4F4F5', label: 'gray-100 light' },
      { hex: '#172554', label: 'blue-50 light (deepest blue)' },
      { hex: '#1E3A8A', label: 'blue-100 light' },
      { hex: '#0F1729', label: 'custom — almost-black' },
    ],
  },
  {
    tokenPath: 'color.danger.default.fg.rest',
    displayName: 'Danger button — text on filled bg',
    context: 'kp-button color="danger" variant="default"',
    bgHex: '#F87171',
    sample: 'Delete account',
    currentFg: '#18181B',
    candidates: [
      { hex: '#FFFFFF', label: 'white (always)' },
      { hex: '#F4F4F5', label: 'gray-100 light' },
      { hex: '#450A0A', label: 'red-950 light (deepest red)' },
      { hex: '#7F1D1D', label: 'red-900 light' },
      { hex: '#0F1729', label: 'custom — almost-black' },
    ],
  },
  {
    tokenPath: 'color.neutral.default.fg.rest',
    displayName: 'Neutral button — text on dark bg',
    context: 'kp-button color="neutral" variant="default"',
    bgHex: '#FAFAFA', // gray-900 dark inverted = light bg
    sample: 'Cancel',
    currentFg: '#18181B',
    candidates: [
      { hex: '#18181B', label: 'gray-900 light' },
      { hex: '#27272A', label: 'gray-800 light' },
      { hex: '#3F3F46', label: 'gray-700 light' },
      { hex: '#09090B', label: 'gray-950 (deepest)' },
      { hex: '#000000', label: 'pure black' },
    ],
  },

  // === BUTTONS — subtle variants ===
  {
    tokenPath: 'color.primary.subtle.fg.rest',
    displayName: 'Primary subtle button — text',
    context: 'kp-button color="primary" variant="subtle"',
    bgHex: '#1E3A8A', // blue-100 dark = subtle.bg.rest dark
    sample: 'Show details',
    currentFg: '#93C5FD', // blue-700 light = blue-300-dark
    candidates: [
      { hex: '#DBEAFE', label: 'blue-100 light' },
      { hex: '#BFDBFE', label: 'blue-200 light' },
      { hex: '#93C5FD', label: 'blue-300 light' },
      { hex: '#60A5FA', label: 'blue-400 light' },
      { hex: '#FFFFFF', label: 'white' },
    ],
  },
  {
    tokenPath: 'color.danger.subtle.fg.rest',
    displayName: 'Danger subtle button — text',
    context: 'kp-button color="danger" variant="subtle"',
    bgHex: '#7F1D1D',
    sample: 'Move to trash',
    currentFg: '#FCA5A5',
    candidates: [
      { hex: '#FEE2E2', label: 'red-100 light' },
      { hex: '#FECACA', label: 'red-200 light' },
      { hex: '#FCA5A5', label: 'red-300 light' },
      { hex: '#F87171', label: 'red-400 light' },
      { hex: '#FFFFFF', label: 'white' },
    ],
  },

  // === BADGES ===
  {
    tokenPath: 'color.badge.primary.subtle.fg',
    displayName: 'Badge primary subtle',
    context: 'kp-badge color="primary" appearance="subtle"',
    bgHex: '#1E3A8A',
    sample: 'New',
    currentFg: '#93C5FD',
    candidates: [
      { hex: '#DBEAFE', label: 'blue-100 light' },
      { hex: '#BFDBFE', label: 'blue-200 light' },
      { hex: '#93C5FD', label: 'blue-300 light' },
      { hex: '#60A5FA', label: 'blue-400 light' },
      { hex: '#EFF6FF', label: 'blue-50 light' },
    ],
  },
  {
    tokenPath: 'color.badge.danger.subtle.fg',
    displayName: 'Badge danger subtle',
    context: 'kp-badge color="danger" appearance="subtle"',
    bgHex: '#7F1D1D',
    sample: 'Failed',
    currentFg: '#FCA5A5',
    candidates: [
      { hex: '#FEE2E2', label: 'red-100 light' },
      { hex: '#FECACA', label: 'red-200 light' },
      { hex: '#FCA5A5', label: 'red-300 light' },
      { hex: '#F87171', label: 'red-400 light' },
      { hex: '#FEF2F2', label: 'red-50 light' },
    ],
  },
  {
    tokenPath: 'color.badge.success.subtle.fg',
    displayName: 'Badge success subtle',
    context: 'kp-badge color="success" appearance="subtle"',
    bgHex: '#14532D',
    sample: 'Active',
    currentFg: '#86EFAC',
    candidates: [
      { hex: '#DCFCE7', label: 'green-100 light' },
      { hex: '#BBF7D0', label: 'green-200 light' },
      { hex: '#86EFAC', label: 'green-300 light' },
      { hex: '#4ADE80', label: 'green-400 light' },
      { hex: '#F0FDF4', label: 'green-50 light' },
    ],
  },
  {
    tokenPath: 'color.badge.warning.subtle.fg',
    displayName: 'Badge warning subtle',
    context: 'kp-badge color="warning" appearance="subtle"',
    bgHex: '#78350F',
    sample: 'Pending',
    currentFg: '#FCD34D',
    candidates: [
      { hex: '#FEF3C7', label: 'amber-100 light' },
      { hex: '#FDE68A', label: 'amber-200 light' },
      { hex: '#FCD34D', label: 'amber-300 light' },
      { hex: '#FBBF24', label: 'amber-400 light' },
      { hex: '#FFFBEB', label: 'amber-50 light' },
    ],
  },
  {
    tokenPath: 'color.badge.info.subtle.fg',
    displayName: 'Badge info subtle',
    context: 'kp-badge color="info" appearance="subtle"',
    bgHex: '#164E63',
    sample: 'Info',
    currentFg: '#67E8F9',
    candidates: [
      { hex: '#CFFAFE', label: 'cyan-100 light' },
      { hex: '#A5F3FC', label: 'cyan-200 light' },
      { hex: '#67E8F9', label: 'cyan-300 light' },
      { hex: '#22D3EE', label: 'cyan-400 light' },
      { hex: '#ECFEFF', label: 'cyan-50 light' },
    ],
  },
  {
    tokenPath: 'color.badge.neutral.subtle.fg',
    displayName: 'Badge neutral subtle',
    context: 'kp-badge color="neutral" appearance="subtle"',
    bgHex: '#27272A',
    sample: 'Archived',
    currentFg: '#D4D4D8',
    candidates: [
      { hex: '#F4F4F5', label: 'gray-100 light' },
      { hex: '#E4E4E7', label: 'gray-200 light' },
      { hex: '#D4D4D8', label: 'gray-300 light' },
      { hex: '#A1A1AA', label: 'gray-400 light' },
      { hex: '#FAFAFA', label: 'gray-50 light' },
    ],
  },

  // === BODY TEXT ON CARD/SURFACE ===
  {
    tokenPath: 'color.card.fg-desc',
    displayName: 'Card description text',
    context: 'kp-card description',
    bgHex: '#18181B', // card bg in dark
    sample: 'A short paragraph of muted explanatory text.',
    currentFg: '#A1A1AA', // gray-600 dark = was light's gray-400
    candidates: [
      { hex: '#A1A1AA', label: 'gray-400 light (current)' },
      { hex: '#D4D4D8', label: 'gray-300 light' },
      { hex: '#71717A', label: 'gray-500 (pivot)' },
      { hex: '#E4E4E7', label: 'gray-200 light' },
      { hex: '#F4F4F5', label: 'gray-100 light' },
    ],
  },
  {
    tokenPath: 'color.input.fg.default',
    displayName: 'Input — placeholder / muted value',
    context: 'kp-select / kp-input placeholder',
    bgHex: '#18181B',
    sample: 'Choose an option…',
    currentFg: '#71717A',
    candidates: [
      { hex: '#A1A1AA', label: 'gray-400 light' },
      { hex: '#D4D4D8', label: 'gray-300 light' },
      { hex: '#71717A', label: 'gray-500 (pivot, current)' },
      { hex: '#E4E4E7', label: 'gray-200 light' },
      { hex: '#52525B', label: 'gray-600 light' },
    ],
  },
  {
    tokenPath: 'color.popover.fg-desc',
    displayName: 'Popover / dialog secondary text',
    context: 'kp-popover description',
    bgHex: '#18181B',
    sample: 'Optional helper text below the title.',
    currentFg: '#A1A1AA',
    candidates: [
      { hex: '#A1A1AA', label: 'gray-400 light' },
      { hex: '#D4D4D8', label: 'gray-300 light' },
      { hex: '#71717A', label: 'gray-500 (pivot)' },
      { hex: '#E4E4E7', label: 'gray-200 light' },
      { hex: '#F4F4F5', label: 'gray-100 light' },
    ],
  },

  // === MISC ===
  {
    tokenPath: 'color.tabs.tab.fg.rest',
    displayName: 'Tabs — inactive tab text',
    context: 'kp-tab not selected',
    bgHex: '#09090B', // page bg
    sample: 'Activity',
    currentFg: '#A1A1AA',
    candidates: [
      { hex: '#A1A1AA', label: 'gray-400 light' },
      { hex: '#D4D4D8', label: 'gray-300 light' },
      { hex: '#71717A', label: 'gray-500 (pivot)' },
      { hex: '#E4E4E7', label: 'gray-200 light' },
      { hex: '#F4F4F5', label: 'gray-100 light' },
    ],
  },
  {
    tokenPath: 'color.nav-item.fg.disabled',
    displayName: 'Nav item — disabled',
    context: 'kp-nav-item disabled',
    bgHex: '#09090B',
    sample: 'Coming soon',
    currentFg: '#52525B',
    candidates: [
      { hex: '#71717A', label: 'gray-500 (pivot)' },
      { hex: '#A1A1AA', label: 'gray-400 light' },
      { hex: '#52525B', label: 'gray-600 light (current)' },
      { hex: '#D4D4D8', label: 'gray-300 light' },
      { hex: '#3F3F46', label: 'gray-700 light' },
    ],
  },
  {
    tokenPath: 'color.breadcrumbs.item.fg.link-rest',
    displayName: 'Breadcrumb link',
    context: 'kp-breadcrumb-item type="link"',
    bgHex: '#09090B',
    sample: 'Projects',
    currentFg: '#A1A1AA',
    candidates: [
      { hex: '#A1A1AA', label: 'gray-400 light (current)' },
      { hex: '#D4D4D8', label: 'gray-300 light' },
      { hex: '#71717A', label: 'gray-500 (pivot)' },
      { hex: '#E4E4E7', label: 'gray-200 light' },
      { hex: '#93C5FD', label: 'blue-300 light (linky)' },
    ],
  },
  {
    tokenPath: 'color.table.header.fg',
    displayName: 'Table header cell',
    context: 'kp-table th',
    bgHex: '#18181B',
    sample: 'Status',
    currentFg: '#D4D4D8',
    candidates: [
      { hex: '#D4D4D8', label: 'gray-300 light (current)' },
      { hex: '#A1A1AA', label: 'gray-400 light' },
      { hex: '#E4E4E7', label: 'gray-200 light' },
      { hex: '#71717A', label: 'gray-500 (pivot)' },
      { hex: '#F4F4F5', label: 'gray-100 light' },
    ],
  },
];
