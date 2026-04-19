import { Meta, StoryObj } from '@storybook/angular';

const meta: Meta = {
  title: 'Foundations/Typography',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj;

const commonStyles = `
  .typo-root {
    padding: 80px;
    font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    color: #18181B;
    display: flex;
    flex-direction: column;
    gap: 64px;
  }
  .typo-block { display: flex; flex-direction: column; }
  .typo-small-label {
    font-size: 11px;
    font-weight: 600;
    color: #A1A1AA;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  .typo-h1 {
    font-size: 40px;
    font-weight: 700;
    line-height: 1.2;
    color: #18181B;
    margin: 0 0 8px;
  }
  .typo-desc {
    font-size: 16px;
    line-height: 1.5;
    color: #52525B;
    max-width: 600px;
    margin: 0;
  }
  .typo-specimen {
    background: #FAFAFA;
    border: 1px solid #E4E4E7;
    border-radius: 16px;
    padding: 48px;
    display: flex;
    flex-direction: column;
    gap: 32px;
  }
  .typo-specimen-aa {
    font-size: 120px;
    font-weight: 400;
    line-height: 1;
    color: #18181B;
  }
  .typo-specimen-caption {
    font-size: 14px;
    font-weight: 500;
    color: #71717A;
  }
  .typo-weights { display: flex; gap: 48px; flex-wrap: wrap; }
  .typo-weight-col { display: flex; flex-direction: column; gap: 4px; }
  .typo-weight-aa {
    font-size: 48px;
    color: #18181B;
    line-height: 1;
  }
  .typo-weight-name {
    font-size: 12px;
    font-weight: 500;
    color: #71717A;
  }
  .typo-weight-num {
    font-size: 11px;
    color: #A1A1AA;
    font-variant-numeric: tabular-nums;
  }

  .typo-section-title {
    font-size: 24px;
    font-weight: 600;
    color: #18181B;
    margin: 0 0 24px;
  }

  .typo-scale-row {
    display: flex;
    gap: 48px;
    align-items: center;
    padding: 24px 0;
    border-top: 1px solid #F4F4F5;
  }
  .typo-scale-row:first-of-type { border-top: none; }
  .typo-scale-meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 200px;
    flex-shrink: 0;
  }
  .typo-scale-token {
    font-size: 13px;
    font-weight: 500;
    color: #18181B;
  }
  .typo-scale-spec {
    font-size: 12px;
    color: #A1A1AA;
    font-variant-numeric: tabular-nums;
  }
  .typo-scale-sample { color: #18181B; flex: 1; }

  .typo-usage-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .typo-usage-card {
    background: #FFFFFF;
    border: 1px solid #E4E4E7;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .typo-usage-label {
    font-size: 13px;
    font-weight: 500;
    color: #18181B;
  }
  .typo-usage-body {
    font-size: 13px;
    line-height: 1.5;
    color: #71717A;
  }
`;

export const Overview: Story = {
  name: 'Overview',
  render: () => ({
    template: `
      <style>${commonStyles}</style>
      <div class="typo-root">
        <section class="typo-block">
          <div class="typo-small-label">Typography</div>
          <h1 class="typo-h1">Typography</h1>
          <p class="typo-desc">Onest is a geometric sans-serif variable font designed for modern interfaces. The scale is built on a 4px grid — every computed line-height lands on the grid for predictable vertical rhythm.</p>
        </section>

        <section class="typo-specimen">
          <div class="typo-specimen-aa">Aa</div>
          <div class="typo-specimen-caption">Onest · Variable · Google Fonts</div>
          <div class="typo-weights">
            <div class="typo-weight-col">
              <div class="typo-weight-aa" style="font-weight:400">Aa</div>
              <div class="typo-weight-name">Regular</div>
              <div class="typo-weight-num">400</div>
            </div>
            <div class="typo-weight-col">
              <div class="typo-weight-aa" style="font-weight:500">Aa</div>
              <div class="typo-weight-name">Medium</div>
              <div class="typo-weight-num">500</div>
            </div>
            <div class="typo-weight-col">
              <div class="typo-weight-aa" style="font-weight:600">Aa</div>
              <div class="typo-weight-name">Semibold</div>
              <div class="typo-weight-num">600</div>
            </div>
            <div class="typo-weight-col">
              <div class="typo-weight-aa" style="font-weight:700">Aa</div>
              <div class="typo-weight-name">Bold</div>
              <div class="typo-weight-num">700</div>
            </div>
          </div>
        </section>

        <section class="typo-block">
          <h2 class="typo-section-title">Scale</h2>

          <div class="typo-scale-row">
            <div class="typo-scale-meta">
              <div class="typo-scale-token">text.2xs</div>
              <div class="typo-scale-spec">11px / 16px / 500</div>
            </div>
            <div class="typo-scale-sample" style="font-size:var(--kp-font-size-2xs,11px);line-height:var(--kp-font-line-height-2xs,1.455);font-weight:500">The quick brown fox jumps over the lazy dog</div>
          </div>

          <div class="typo-scale-row">
            <div class="typo-scale-meta">
              <div class="typo-scale-token">text.xs</div>
              <div class="typo-scale-spec">12px / 16px / 400</div>
            </div>
            <div class="typo-scale-sample" style="font-size:var(--kp-font-size-xs,12px);line-height:var(--kp-font-line-height-xs,1.333);font-weight:400">The quick brown fox jumps over the lazy dog</div>
          </div>

          <div class="typo-scale-row">
            <div class="typo-scale-meta">
              <div class="typo-scale-token">text.sm</div>
              <div class="typo-scale-spec">14px / 20px / 400</div>
            </div>
            <div class="typo-scale-sample" style="font-size:var(--kp-font-size-sm,14px);line-height:var(--kp-font-line-height-sm,1.428);font-weight:400">The quick brown fox jumps over the lazy dog</div>
          </div>

          <div class="typo-scale-row">
            <div class="typo-scale-meta">
              <div class="typo-scale-token">text.md</div>
              <div class="typo-scale-spec">16px / 24px / 400</div>
            </div>
            <div class="typo-scale-sample" style="font-size:var(--kp-font-size-md,16px);line-height:var(--kp-font-line-height-md,1.5);font-weight:400">The quick brown fox jumps over the lazy dog</div>
          </div>

          <div class="typo-scale-row">
            <div class="typo-scale-meta">
              <div class="typo-scale-token">text.lg</div>
              <div class="typo-scale-spec">20px / 28px / 500</div>
            </div>
            <div class="typo-scale-sample" style="font-size:var(--kp-font-size-lg,20px);line-height:var(--kp-font-line-height-lg,1.4);font-weight:500">Kanso Protocol Foundations</div>
          </div>

          <div class="typo-scale-row">
            <div class="typo-scale-meta">
              <div class="typo-scale-token">text.xl</div>
              <div class="typo-scale-spec">24px / 32px / 600</div>
            </div>
            <div class="typo-scale-sample" style="font-size:var(--kp-font-size-xl,24px);line-height:var(--kp-font-line-height-xl,1.333);font-weight:600">Architecture over agreements</div>
          </div>

          <div class="typo-scale-row">
            <div class="typo-scale-meta">
              <div class="typo-scale-token">text.2xl</div>
              <div class="typo-scale-spec">32px / 40px / 600</div>
            </div>
            <div class="typo-scale-sample" style="font-size:var(--kp-font-size-2xl,32px);line-height:var(--kp-font-line-height-2xl,1.25);font-weight:600">簡素 · Kanso Protocol</div>
          </div>
        </section>

        <section class="typo-block">
          <h2 class="typo-section-title">Usage</h2>
          <div class="typo-usage-grid">
            <div class="typo-usage-card">
              <div class="typo-usage-label">text.2xs – text.xs</div>
              <div class="typo-usage-body">Badges, captions, legal text, form hints, metadata, tiny status indicators.</div>
            </div>
            <div class="typo-usage-card">
              <div class="typo-usage-label">text.sm – text.md</div>
              <div class="typo-usage-body">Default body text, buttons, inputs, list items, descriptions. The workhorses of the UI.</div>
            </div>
            <div class="typo-usage-card">
              <div class="typo-usage-label">text.lg</div>
              <div class="typo-usage-body">Section labels, card titles, small headings within dense layouts.</div>
            </div>
            <div class="typo-usage-card">
              <div class="typo-usage-label">text.xl – text.2xl</div>
              <div class="typo-usage-body">Page headings, hero titles, primary display text in marketing and landing contexts.</div>
            </div>
          </div>
        </section>
      </div>
    `,
  }),
};
