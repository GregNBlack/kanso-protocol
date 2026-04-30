import { Meta, StoryObj } from '@storybook/angular';

/**
 * Foundations / Dark Mode Audit
 *
 * One-screen visual proof that every primitive ramp + the highest-signal
 * semantic tokens render correctly in both themes. Each block is rendered
 * twice — left column under the page's current theme (driven by the
 * Storybook toolbar), right column inside a wrapper with explicit
 * `data-theme="dark"` so you can compare regardless of toolbar state.
 *
 * Use this page to:
 * - Spot a missing dark-mode override (a swatch that looks identical in
 *   both columns when it shouldn't).
 * - Eyeball contrast — Alert / Badge subtle backgrounds against their
 *   foreground color in dark mode.
 * - Audit any newly added primitive ramp by checking it appears in this
 *   page after running `npm run build:tokens`.
 */
const meta: Meta = {
  title: 'Foundations/Dark Mode Audit',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    // This page is the visual proof of the *full* token set in both themes,
    // including primitive ramps that intentionally aren't WCAG-AA compliant
    // (light blue-50 against white, dark gray-50 against black). Swatch labels
    // also use mix-blend-mode: difference for legibility independent of
    // background — that math doesn't translate to a static contrast ratio.
    // Disable color-contrast on this story; the real components are still
    // checked elsewhere.
    a11y: { config: { rules: [{ id: 'color-contrast', enabled: false }] } },
  },
};
export default meta;
type Story = StoryObj;

const PRIMITIVE_RAMPS = ['gray', 'blue', 'red', 'green', 'amber', 'cyan', 'orange', 'violet'];
const STOPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

const SEMANTIC_GROUPS: { label: string; tokens: string[] }[] = [
  {
    label: 'Alert (subtle background × role × foreground)',
    tokens: [
      '--kp-color-alert-primary-subtle-bg',
      '--kp-color-alert-danger-subtle-bg',
      '--kp-color-alert-success-subtle-bg',
      '--kp-color-alert-warning-subtle-bg',
      '--kp-color-alert-info-subtle-bg',
      '--kp-color-alert-neutral-subtle-bg',
    ],
  },
  {
    label: 'Badge (subtle bg + filled bg per role)',
    tokens: [
      '--kp-color-badge-primary-subtle-bg',
      '--kp-color-badge-primary-filled-bg',
      '--kp-color-badge-danger-subtle-bg',
      '--kp-color-badge-danger-filled-bg',
      '--kp-color-badge-success-subtle-bg',
      '--kp-color-badge-success-filled-bg',
      '--kp-color-badge-warning-subtle-bg',
      '--kp-color-badge-warning-filled-bg',
      '--kp-color-badge-info-subtle-bg',
      '--kp-color-badge-info-filled-bg',
      '--kp-color-badge-neutral-subtle-bg',
      '--kp-color-badge-neutral-filled-bg',
    ],
  },
  {
    label: 'Surfaces (white/gray/black aliases that flip in dark)',
    tokens: [
      '--kp-color-white',
      '--kp-color-gray-50',
      '--kp-color-gray-100',
      '--kp-color-gray-200',
      '--kp-color-gray-900',
      '--kp-color-gray-950',
      '--kp-color-black',
    ],
  },
];

const styles = `
  .audit-root {
    padding: 48px;
    font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    background: var(--kp-color-white, #FFFFFF);
    color: var(--kp-color-black, #09090B);
    display: flex;
    flex-direction: column;
    gap: 56px;
  }
  .audit-h1 {
    font-size: 28px;
    font-weight: 700;
    margin: 0 0 4px;
    color: var(--kp-color-gray-900, #18181B);
  }
  .audit-lede {
    font-size: 14px;
    line-height: 1.5;
    color: var(--kp-color-gray-500, #71717A);
    max-width: 720px;
    margin: 0;
  }
  .audit-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .audit-section-title {
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--kp-color-gray-500, #71717A);
    margin: 0;
  }
  .audit-pair {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    align-items: stretch;
  }
  .audit-pane {
    background: var(--kp-color-white, #FFF);
    color: var(--kp-color-black, #000);
    border: 1px solid var(--kp-color-gray-200, #E4E4E7);
    border-radius: 12px;
    padding: 16px;
  }
  .audit-pane-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--kp-color-gray-500, #71717A);
    margin: 0 0 12px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .audit-ramp {
    display: grid;
    grid-template-columns: 90px repeat(11, 1fr);
    align-items: center;
    gap: 4px;
  }
  .audit-ramp + .audit-ramp { margin-top: 8px; }
  .audit-ramp-name {
    font-size: 12px;
    font-weight: 500;
    color: var(--kp-color-gray-700, #3F3F46);
    text-transform: capitalize;
  }
  .audit-swatch {
    aspect-ratio: 1 / 1;
    border-radius: 6px;
    border: 1px solid var(--kp-color-gray-200, #E4E4E7);
    position: relative;
  }
  .audit-swatch::after {
    content: attr(data-stop);
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    font-size: 9px;
    font-weight: 600;
    color: rgba(255,255,255,0.7);
    mix-blend-mode: difference;
    font-variant-numeric: tabular-nums;
  }

  .audit-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 8px;
  }
  .audit-cell {
    border-radius: 8px;
    padding: 16px 12px;
    font-size: 11px;
    line-height: 1.3;
    color: var(--kp-color-gray-900, #18181B);
    border: 1px solid var(--kp-color-gray-200, #E4E4E7);
    word-break: break-all;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
  }
`;

function rampHtml(): string {
  return PRIMITIVE_RAMPS
    .map(
      (ramp) =>
        `<div class="audit-ramp">
          <span class="audit-ramp-name">${ramp}</span>
          ${STOPS.map(
            (s) =>
              `<div class="audit-swatch" data-stop="${s}" style="background: var(--kp-color-${ramp}-${s})"></div>`,
          ).join('')}
        </div>`,
    )
    .join('\n');
}

function semanticHtml(): string {
  return SEMANTIC_GROUPS.map(
    (group) => `
      <div class="audit-section">
        <p class="audit-section-title">${group.label}</p>
        <div class="audit-grid">
          ${group.tokens
            .map(
              (t) =>
                `<div class="audit-cell" style="background: var(${t})">${t}</div>`,
            )
            .join('')}
        </div>
      </div>`,
  ).join('\n');
}

// Left pane has no wrapper — inherits whatever the Storybook toolbar set
// (default Light). Right pane forces dark via the [data-theme="dark"]
// rules in dark.css. To get the cleanest comparison, set the toolbar theme
// to Light. When toolbar is Dark both panes degenerate to dark — that
// scenario is a useful "everything dark" QA view in its own right.
function pairHtml(inner: string): string {
  return `
    <div class="audit-pair">
      <div class="audit-pane">
        <p class="audit-pane-label">Toolbar theme (set toolbar to Light)</p>
        ${inner}
      </div>
      <div class="audit-pane" data-theme="dark">
        <p class="audit-pane-label">Forced dark</p>
        ${inner}
      </div>
    </div>`;
}

export const PrimitiveRamps: Story = {
  name: 'Primitive ramps',
  render: () => ({
    template: `
      <style>${styles}</style>
      <div class="audit-root">
        <header>
          <h1 class="audit-h1">Primitive ramps — light vs dark</h1>
          <p class="audit-lede">Each ramp is rendered twice: the left column follows the Storybook toolbar theme (set toolbar to <strong>Light</strong> for the cleanest comparison), the right column is wrapped in <code>data-theme="dark"</code> so it always shows the inverted values. A swatch that looks identical in both columns means the ramp isn't wired into <code>dark.css</code> — add the inverted values to <code>tokens/themes/dark.json</code> and rebuild.</p>
        </header>
        ${pairHtml(rampHtml())}
      </div>
    `,
  }),
};

export const SemanticTokens: Story = {
  name: 'Semantic tokens (high-signal subset)',
  render: () => ({
    template: `
      <style>${styles}</style>
      <div class="audit-root">
        <header>
          <h1 class="audit-h1">Semantic tokens — toolbar vs forced dark</h1>
          <p class="audit-lede">High-signal subset focused on the tokens most likely to need explicit dark overrides — alert/badge subtle backgrounds (where simple primitive inversion lands too close to the page background) and the white/gray/black surface aliases. The rest of the semantic catalog is auto-derived from primitives via <code>var()</code> aliasing — primitives are audited on the previous page.</p>
        </header>
        ${pairHtml(semanticHtml())}
      </div>
    `,
  }),
};
