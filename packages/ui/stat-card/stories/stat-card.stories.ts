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
    sparklineTrend:  { control: 'inline-radio', options: [null, 'up', 'down', 'neutral', 'auto'], table: { defaultValue: { summary: 'null' } } },
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
        <kp-stat-card label="Full" value="$12,482" [showIcon]="true" icon="currency-dollar" trendValue="+12.5%" trendDescription="from last month" [showSparkline]="true" [sparklineData]="[4,7,5,9,6,11,8,12]"/>
      </div>
    `,
  }),
};

export const WithSparkline: Story = {
  name: 'With sparkline',
  render: () => ({
    template: `
      <div style="display:grid;grid-template-columns:repeat(3,280px);gap:16px">
        <kp-stat-card label="Revenue" value="$12,482" trendDirection="up" trendAppearance="positive" trendValue="+12.5%" trendDescription="30-day" [showSparkline]="true" [sparklineData]="[4,6,5,8,7,10,9,12,11,14]"/>
        <kp-stat-card label="Latency" value="142ms" trendDirection="down" trendAppearance="negative" trendValue="-8ms" trendDescription="30-day" [showSparkline]="true" [sparklineData]="[18,16,17,14,15,12,13,11,12,9]"/>
        <kp-stat-card label="Sessions" value="3.4k" trendDirection="neutral" trendValue="0.0%" trendDescription="30-day" [showSparkline]="true" [sparklineData]="[9,11,8,10,9,11,10,9,10,9]"/>
      </div>
    `,
  }),
};

export const SparklineTrendColoring: Story = {
  name: 'Sparkline trend coloring',
  render: () => ({
    template: `
      <div style="display:grid;grid-template-columns:repeat(3,280px);gap:16px">
        <!-- No trend row: sparkline colored on its own via sparklineTrend -->
        <kp-stat-card label="Signups" value="1,204" [showTrend]="false" [showSparkline]="true" sparklineTrend="up"   [sparklineData]="[3,5,4,7,6,9,8,12]"/>
        <kp-stat-card label="Error rate" value="0.8%" [showTrend]="false" [showSparkline]="true" sparklineTrend="down" [sparklineData]="[12,9,10,7,8,5,6,3]"/>
        <!-- 'auto' derives up/down/neutral from the series itself -->
        <kp-stat-card label="Queue depth" value="42" [showTrend]="false" [showSparkline]="true" sparklineTrend="auto" [sparklineData]="[8,10,7,11,9,13,10,15]"/>
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
