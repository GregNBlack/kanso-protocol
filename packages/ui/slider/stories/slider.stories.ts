import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { KpSliderComponent } from '../src/slider.component';

const meta: Meta<KpSliderComponent> = {
  title: 'Components/Slider',
  component: KpSliderComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [KpSliderComponent, FormsModule] })],
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    mode: { control: 'inline-radio', options: ['single', 'range'] },
  },
};
export default meta;
type Story = StoryObj<KpSliderComponent>;

const cap = `font-size:11px;color: var(--kp-color-gray-600);margin-top:8px;display:block`;

export const Default: Story = {
  args: { size: 'md', mode: 'single', showValueLabel: true, showLabels: true },
  render: (args) => ({
    props: { ...args, value: 60 },
    template: `
      <div style="width:400px">
        <kp-slider [size]="size" [mode]="mode" [showValueLabel]="showValueLabel" [showLabels]="showLabels" [(value)]="value"/>
      </div>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    props: { a: 60, b: 60, c: 60 },
    template: `
      <div style="display:flex;flex-direction:column;gap:32px;width:400px">
        <div><kp-slider size="sm" [(value)]="a"/><div style="${cap}">sm</div></div>
        <div><kp-slider size="md" [(value)]="b"/><div style="${cap}">md (default)</div></div>
        <div><kp-slider size="lg" [(value)]="c"/><div style="${cap}">lg</div></div>
      </div>`,
  }),
};

export const Range: Story = {
  render: () => ({
    props: { v: [20, 80] as [number, number] },
    template: `
      <div style="width:400px">
        <kp-slider mode="range" [showValueLabel]="true" [showLabels]="true" [(value)]="v"/>
        <div style="${cap}">Range: {{ v[0] }} – {{ v[1] }}</div>
      </div>`,
  }),
};

export const WithTicks: Story = {
  render: () => ({
    props: { v: 50 },
    template: `
      <div style="width:400px">
        <kp-slider [showTicks]="true" [showLabels]="true" [showValueLabel]="true" [(value)]="v"/>
      </div>`,
  }),
};

export const Disabled: Story = {
  render: () => ({
    template: `
      <div style="width:400px">
        <kp-slider [disabled]="true" [value]="60" [showLabels]="true"/>
      </div>`,
  }),
};

export const UseCases: Story = {
  name: 'Use Cases',
  render: () => ({
    props: {
      priceRange: [1200, 3500] as [number, number],
      volume: 60,
      opacity: 75,
      fontSize: 16,
      priceFormatter: (v: number) => '$' + v.toLocaleString(),
      percentFormatter: (v: number) => v + '%',
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:48px;width:480px">
        <div>
          <div style="font-weight:500;font-size:14px;margin-bottom:16px">Price range</div>
          <kp-slider mode="range" [min]="0" [max]="5000" [step]="50"
            [showValueLabel]="true" [showLabels]="true"
            [minLabel]="'$0'" [maxLabel]="'$5,000'"
            [valueFormatter]="priceFormatter"
            [(value)]="priceRange"/>
        </div>

        <div>
          <div style="font-weight:500;font-size:14px;margin-bottom:16px">Volume</div>
          <div style="display:flex;align-items:center;gap:12px">
            <span aria-hidden="true" style="color: var(--kp-color-gray-600)">🔈</span>
            <kp-slider size="sm" style="flex:1" [(value)]="volume"/>
            <span style="font-variant-numeric:tabular-nums;font-size:14px;min-width:32px;text-align:right">{{ volume }}</span>
          </div>
        </div>

        <div>
          <div style="font-weight:500;font-size:14px;margin-bottom:16px">Opacity</div>
          <kp-slider [showValueLabel]="true" [showLabels]="true"
            [minLabel]="'0%'" [maxLabel]="'100%'"
            [valueFormatter]="percentFormatter"
            [(value)]="opacity"/>
        </div>

        <div>
          <div style="font-weight:500;font-size:14px;margin-bottom:4px">Font size</div>
          <div style="font-size:12px;color: var(--kp-color-gray-600);margin-bottom:16px">Between 12 and 72 pixels</div>
          <kp-slider [min]="12" [max]="72" [step]="1"
            [showValueLabel]="true" [showLabels]="true"
            [(value)]="fontSize"/>
        </div>
      </div>`,
  }),
};
