import { Meta, StoryObj } from '@storybook/angular';
import { KpStatCardComponent } from '../src/stat-card.component';

const meta: Meta<KpStatCardComponent> = {
  title: 'Patterns/StatCard',
  component: KpStatCardComponent,
  tags: ['autodocs'],
  argTypes: {
    size:            { control: 'inline-radio', options: ['sm','md','lg'], table: { defaultValue: { summary: 'md' } } },
    showIcon:        { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    showTrend:       { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    showSparkline:   { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
    trendDirection:  { control: 'inline-radio', options: ['up','down','neutral'], table: { defaultValue: { summary: 'up' } } },
    trendAppearance: { control: 'inline-radio', options: ['positive','negative'], table: { defaultValue: { summary: 'positive' } } },
  },
};
export default meta;
type Story = StoryObj<KpStatCardComponent>;

export const Playground: Story = {
  args: { size: 'md', label: 'Total revenue', value: '$12,482', trendValue: '+12.5%', trendDescription: 'from last month' },
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;gap:16px;align-items:flex-start">
        <kp-stat-card size="sm" label="Revenue" value="$12,482" trendValue="+12.5%" trendDescription="vs last month" style="width:240px"/>
        <kp-stat-card size="md" label="Revenue" value="$12,482" trendValue="+12.5%" trendDescription="vs last month" style="width:280px"/>
        <kp-stat-card size="lg" label="Revenue" value="$12,482" trendValue="+12.5%" trendDescription="vs last month" style="width:320px"/>
      </div>
    `,
  }),
};

export const Compositions: Story = {
  render: () => ({
    template: `
      <div style="display:grid;grid-template-columns:repeat(2,280px);gap:16px">
        <kp-stat-card label="Minimal" value="$12,482" [showTrend]="false"/>
        <kp-stat-card label="With trend" value="$12,482" trendValue="+12.5%" trendDescription="from last month"/>
        <kp-stat-card label="With icon + trend" value="$12,482" [showIcon]="true" icon="currency-dollar" trendValue="+12.5%" trendDescription="from last month"/>
        <kp-stat-card label="Full" value="$12,482" [showIcon]="true" icon="currency-dollar" trendValue="+12.5%" trendDescription="from last month" [showSparkline]="true"/>
      </div>
    `,
  }),
};

export const TrendVariants: Story = {
  render: () => ({
    template: `
      <div style="display:grid;grid-template-columns:repeat(3,280px);gap:16px">
        <kp-stat-card label="Up · positive" value="2,847" trendDirection="up"   trendAppearance="positive" trendValue="+5.2%"  trendDescription="vs last week"/>
        <kp-stat-card label="Down · negative (good)" value="142ms" trendDirection="down" trendAppearance="negative" trendValue="-8ms" trendDescription="vs last week"/>
        <kp-stat-card label="Neutral" value="3.4%" trendDirection="neutral" trendValue="0.0%" trendDescription="no change"/>
      </div>
    `,
  }),
};

export const DashboardGrid: Story = {
  render: () => ({
    template: `
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;width:1100px">
        <kp-stat-card label="Total Revenue" value="$12,482" [showIcon]="true" icon="currency-dollar" trendDirection="up" trendValue="+12.5%" trendDescription="from last month"/>
        <kp-stat-card label="Active Users" value="2,847" [showIcon]="true" icon="users" trendDirection="up" trendValue="+5.2%" trendDescription="from last week"/>
        <kp-stat-card label="Churn Rate" value="2.4%" [showIcon]="true" icon="trending-up" trendDirection="up" trendAppearance="negative" trendValue="+0.3%" trendDescription="from last month"/>
        <kp-stat-card label="Avg Response Time" value="142ms" [showIcon]="true" icon="clock" trendDirection="down" trendAppearance="negative" trendValue="-8ms" trendDescription="from last week"/>
      </div>
    `,
  }),
};
