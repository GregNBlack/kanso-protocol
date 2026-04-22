import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { KpSkeletonComponent } from '../src/skeleton.component';

const meta: Meta<KpSkeletonComponent> = {
  title: 'Components/Skeleton',
  component: KpSkeletonComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [KpSkeletonComponent] })],
  argTypes: {
    shape: { control: 'inline-radio', options: ['line', 'circle', 'rectangle', 'avatar', 'button', 'card'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
  },
};
export default meta;
type Story = StoryObj<KpSkeletonComponent>;

const cap = `font-size:11px;color:#A1A1AA;margin-top:8px;display:inline-block`;

export const Default: Story = {
  args: { shape: 'line', size: 'md', width: '320px' },
  render: (args) => ({ props: args, template: `<kp-skeleton [shape]="shape" [size]="size" [width]="width" [animated]="true"/>` }),
};

export const Shapes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:24px;align-items:flex-start">
        <div><kp-skeleton shape="line" width="320px"/><div style="${cap}">Line</div></div>
        <div><kp-skeleton shape="circle"/><div style="${cap}">Circle</div></div>
        <div><kp-skeleton shape="rectangle"/><div style="${cap}">Rectangle</div></div>
        <div><kp-skeleton shape="avatar"/><div style="${cap}">Avatar (composite)</div></div>
        <div><kp-skeleton shape="button"/><div style="${cap}">Button</div></div>
        <div><kp-skeleton shape="card"/><div style="${cap}">Card (composite)</div></div>
      </div>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:16px">
        <kp-skeleton size="xs" width="200px"/>
        <kp-skeleton size="sm" width="200px"/>
        <kp-skeleton size="md" width="200px"/>
        <kp-skeleton size="lg" width="200px"/>
        <kp-skeleton size="xl" width="200px"/>
      </div>`,
  }),
};

export const Compositions: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:40px">
        <div style="display:flex;flex-direction:column;gap:8px;width:400px">
          <kp-skeleton width="100%"/>
          <kp-skeleton width="85%"/>
          <kp-skeleton width="95%"/>
          <kp-skeleton width="60%"/>
          <div style="${cap}">Text paragraph</div>
        </div>

        <div style="display:flex;flex-direction:column;gap:16px">
          <kp-skeleton shape="avatar"/>
          <kp-skeleton shape="avatar"/>
          <kp-skeleton shape="avatar"/>
          <div style="${cap}">Avatar list</div>
        </div>

        <div style="display:flex;flex-direction:column;gap:16px;width:400px">
          <kp-skeleton shape="rectangle" size="md"/>
          <kp-skeleton size="lg" width="70%"/>
          <kp-skeleton width="100%"/>
          <kp-skeleton width="90%"/>
          <kp-skeleton shape="button"/>
          <div style="${cap}">Card skeleton (hand-built)</div>
        </div>

        <div style="display:flex;flex-direction:column;gap:8px;width:500px">
          @for (row of [1,2,3,4,5]; track row) {
            <div style="display:flex;gap:24px">
              <kp-skeleton width="40px"/>
              <kp-skeleton width="160px"/>
              <kp-skeleton width="120px"/>
              <kp-skeleton width="60px"/>
            </div>
          }
          <div style="${cap}">Table skeleton</div>
        </div>
      </div>`,
  }),
};
