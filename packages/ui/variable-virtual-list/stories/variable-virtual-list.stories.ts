import { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import {
  KpVariableVirtualListComponent,
  KpVariableVirtualRowDirective,
} from '../src/variable-virtual-list.component';

const meta: Meta<KpVariableVirtualListComponent> = {
  title: 'Components/VariableVirtualList',
  component: KpVariableVirtualListComponent,
  decorators: [
    moduleMetadata({
      imports: [KpVariableVirtualRowDirective],
    }),
  ],
  tags: ['autodocs'],
  argTypes: {
    viewportHeight: { control: { type: 'number', min: 100, step: 50 } },
    overscan: { control: { type: 'number', min: 0, max: 50 } },
    estimatedItemHeight: { control: { type: 'number', min: 8, step: 2 } },
    // itemHeight is a function — not a Storybook control.
    itemHeight: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Window-mode virtual scroller for variable-height rows — the sibling to VirtualList. Sizes each row via a `[itemHeight]` function and maps scrollTop to the visible range with a cumulative-offset binary search. A uniform `[itemHeight]` reduces exactly to the fixed-height VirtualList.',
      },
    },
    // color-contrast disabled across stories: every story uses a projected
    // <ng-template kpVariableVirtualRow> template, so the actual text/bg pair
    // lives in user code rather than the component. The viewport has
    // `contain: strict`, which breaks axe-core's walk-up to resolve the row's
    // background context. Row content renders against surface tokens that pass
    // AA on their own.
    a11y: { config: { rules: [{ id: 'color-contrast', enabled: false }] } },
  },
};

export default meta;
type Story = StoryObj<KpVariableVirtualListComponent>;

// Deterministic pseudo-variable bodies — each row gets 1-4 lines of text.
const fakeMessages = (n: number) =>
  Array.from({ length: n }, (_, i) => {
    const lines = (i % 4) + 1;
    return {
      id: i,
      author: ['Alice', 'Bob', 'Charlie', 'Greg'][i % 4],
      lines,
      text: Array.from({ length: lines }, (_, l) => `Line ${l + 1} of message #${i + 1}.`).join(' '),
    };
  });

// Height model matching the rendered template: 40px chrome + 20px per text line.
const messageHeight = (_i: number, m: { lines: number }) => 40 + m.lines * 20;

export const VariableMessages: Story = {
  args: {
    items: fakeMessages(10_000),
    itemHeight: messageHeight,
    viewportHeight: 480,
    overscan: 6,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="border:1px solid var(--kp-color-border-default);border-radius:8px;overflow:hidden;width:560px">
        <kp-variable-virtual-list
          [items]="items"
          [itemHeight]="itemHeight"
          [viewportHeight]="viewportHeight"
          [overscan]="overscan"
        >
          <ng-template kpVariableVirtualRow let-msg let-i="index">
            <div style="display:grid;grid-template-columns:auto 1fr;gap:10px;padding:10px 14px;height:100%;box-sizing:border-box;border-bottom:1px solid var(--kp-color-surface-muted)"
                 [style.background]="i % 2 ? 'var(--kp-color-surface-subtle)' : 'var(--kp-color-surface-base)'">
              <div style="width:32px;height:32px;border-radius:50%;background:var(--kp-color-border-default);color:var(--kp-color-text-default);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600">{{ msg.author[0] }}</div>
              <div style="display:flex;flex-direction:column;gap:2px;min-width:0">
                <strong style="color:var(--kp-color-text-strong);font-size:12px">{{ msg.author }}</strong>
                <div style="font-size:13px;color:var(--kp-color-text-default);line-height:20px">{{ msg.text }}</div>
              </div>
            </div>
          </ng-template>
        </kp-variable-virtual-list>
      </div>
    `,
  }),
};

export const StepHeights: Story = {
  args: {
    items: Array.from({ length: 5_000 }, (_, i) => ({ id: i, name: `Row ${i + 1}` })),
    // Cycles 32 / 56 / 80 / 104px so the varying-height math is visible.
    itemHeight: (i: number) => 32 + (i % 4) * 24,
    viewportHeight: 420,
    overscan: 4,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="border:1px solid var(--kp-color-border-default);border-radius:8px;overflow:hidden;width:420px">
        <kp-variable-virtual-list
          [items]="items"
          [itemHeight]="itemHeight"
          [viewportHeight]="viewportHeight"
          [overscan]="overscan"
        >
          <ng-template kpVariableVirtualRow let-row let-i="index">
            <div style="display:flex;align-items:center;gap:12px;padding:0 16px;height:100%;box-sizing:border-box;border-bottom:1px solid var(--kp-color-surface-muted);font-size:13px;color:var(--kp-color-text-strong)">
              <span style="color:var(--kp-color-text-muted);font-variant-numeric:tabular-nums">#{{ row.id + 1 }}</span>
              <span>{{ row.name }}</span>
            </div>
          </ng-template>
        </kp-variable-virtual-list>
      </div>
    `,
  }),
};

export const EmptyState: Story = {
  args: {
    items: [],
    itemHeight: () => 48,
    viewportHeight: 240,
    overscan: 0,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="border:1px solid var(--kp-color-border-default);border-radius:8px;overflow:hidden;width:420px">
        <kp-variable-virtual-list [items]="items" [itemHeight]="itemHeight" [viewportHeight]="viewportHeight" [overscan]="overscan">
          <ng-template kpVariableVirtualRow let-row>
            <div>{{ row }}</div>
          </ng-template>
        </kp-variable-virtual-list>
        <div style="padding:32px;text-align:center;color:var(--kp-color-text-muted);font-size:13px">No items</div>
      </div>
    `,
  }),
};
