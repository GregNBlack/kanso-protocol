import { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import {
  KpVirtualListComponent,
  KpVirtualRowDirective,
} from '../src/virtual-list.component';

const meta: Meta<KpVirtualListComponent> = {
  title: 'Components/VirtualList',
  component: KpVirtualListComponent,
  decorators: [
    moduleMetadata({
      imports: [KpVirtualRowDirective],
    }),
  ],
  tags: ['autodocs'],
  argTypes: {
    itemHeight: { control: { type: 'number', min: 16, step: 2 } },
    viewportHeight: { control: { type: 'number', min: 100, step: 50 } },
    overscan: { control: { type: 'number', min: 0, max: 50 } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Window-mode virtual scroller for fixed-height rows. Renders only visible rows + overscan buffer. Supports any item shape via projected `<ng-template kpVirtualRow>`. Use it for lists with thousands of rows; below ~100 rows just render normally.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<KpVirtualListComponent>;

const fakeRows = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    id: i,
    name: `Row ${i + 1}`,
    email: `row${i + 1}@example.com`,
    role: ['Admin', 'Editor', 'Viewer'][i % 3],
  }));

export const TenThousandRows: Story = {
  args: {
    items: fakeRows(10_000),
    itemHeight: 44,
    viewportHeight: 480,
    overscan: 6,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="border:1px solid var(--kp-color-border-default);border-radius:8px;overflow:hidden">
        <kp-virtual-list
          [items]="items"
          [itemHeight]="itemHeight"
          [viewportHeight]="viewportHeight"
          [overscan]="overscan"
        >
          <ng-template kpVirtualRow let-row let-i="index">
            <div style="display:grid;grid-template-columns:60px 1fr 1fr 100px;align-items:center;gap:12px;padding:0 16px;height:100%;border-bottom:1px solid var(--kp-color-surface-muted);font-size:13px"
                 [style.background]="i % 2 ? 'var(--kp-color-surface-subtle)' : 'var(--kp-color-surface-base)'">
              <span style="color:var(--kp-color-text-muted);font-variant-numeric:tabular-nums">#{{ row.id + 1 }}</span>
              <span style="font-weight:500;color:var(--kp-color-text-strong)">{{ row.name }}</span>
              <span style="color:var(--kp-color-text-muted)">{{ row.email }}</span>
              <span style="display:inline-block;padding:2px 8px;border-radius:999px;background:var(--kp-color-surface-muted);color:var(--kp-color-text-default);font-size:11px;text-align:center">{{ row.role }}</span>
            </div>
          </ng-template>
        </kp-virtual-list>
      </div>
    `,
  }),
};

export const ChatLog: Story = {
  args: {
    items: Array.from({ length: 5_000 }, (_, i) => ({
      id: i,
      author: ['Alice', 'Bob', 'Charlie', 'Greg'][i % 4],
      text: `Message #${i + 1} — placeholder body text. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
      time: new Date(Date.now() - (5000 - i) * 60_000).toLocaleTimeString(),
    })),
    itemHeight: 56,
    viewportHeight: 560,
    overscan: 4,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="border:1px solid var(--kp-color-border-default);border-radius:8px;overflow:hidden;width:560px">
        <kp-virtual-list
          [items]="items"
          [itemHeight]="itemHeight"
          [viewportHeight]="viewportHeight"
          [overscan]="overscan"
        >
          <ng-template kpVirtualRow let-msg>
            <div style="display:grid;grid-template-columns:auto 1fr;gap:10px;padding:8px 14px;height:100%;border-bottom:1px solid var(--kp-color-surface-muted)">
              <div style="width:32px;height:32px;border-radius:50%;background:var(--kp-color-border-default);color:var(--kp-color-text-default);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600">{{ msg.author[0] }}</div>
              <div style="display:flex;flex-direction:column;gap:2px;min-width:0">
                <div style="display:flex;justify-content:space-between;font-size:12px"><strong style="color:var(--kp-color-text-strong)">{{ msg.author }}</strong><span style="color:var(--kp-color-text-muted)">{{ msg.time }}</span></div>
                <div style="font-size:13px;color:var(--kp-color-text-default);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ msg.text }}</div>
              </div>
            </div>
          </ng-template>
        </kp-virtual-list>
      </div>
    `,
  }),
};

export const ScrollToIndex: Story = {
  args: {
    items: fakeRows(10_000),
    itemHeight: 36,
    viewportHeight: 360,
    overscan: 4,
  },
  render: (args) => ({
    props: {
      ...args,
      jump(this: any, idx: number) {
        // Wired via template-ref binding in the surrounding host
        const el = (this.$root || document).querySelector('#vlist');
        // Storybook doesn't give us a clean component handle here; this story
        // is for visual demo. Real consumers grab the @ViewChild and call
        // list.scrollToIndex(idx).
      },
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:8px;width:480px">
        <p style="font-size:12px;color:var(--kp-color-text-muted);margin:0">
          Real consumer code: <code>@ViewChild() list; this.list.scrollToIndex(5000, 'center')</code>
        </p>
        <div style="border:1px solid var(--kp-color-border-default);border-radius:8px;overflow:hidden">
          <kp-virtual-list
            id="vlist"
            [items]="items"
            [itemHeight]="itemHeight"
            [viewportHeight]="viewportHeight"
            [overscan]="overscan"
          >
            <ng-template kpVirtualRow let-row let-i="index">
              <div style="padding:0 16px;height:100%;display:flex;align-items:center;border-bottom:1px solid var(--kp-color-surface-muted);font-size:13px;color:var(--kp-color-text-strong)">
                {{ row.name }}
              </div>
            </ng-template>
          </kp-virtual-list>
        </div>
      </div>
    `,
  }),
};

export const EmptyState: Story = {
  args: { items: [], itemHeight: 40, viewportHeight: 240, overscan: 0 },
  render: (args) => ({
    props: args,
    template: `
      <div style="border:1px solid var(--kp-color-border-default);border-radius:8px;overflow:hidden">
        <kp-virtual-list [items]="items" [itemHeight]="itemHeight" [viewportHeight]="viewportHeight" [overscan]="overscan">
          <ng-template kpVirtualRow let-row>
            <div>{{ row }}</div>
          </ng-template>
        </kp-virtual-list>
        <div style="padding:32px;text-align:center;color:var(--kp-color-text-muted);font-size:13px">No items</div>
      </div>
    `,
  }),
};
