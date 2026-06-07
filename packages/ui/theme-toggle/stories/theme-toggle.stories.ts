import { Meta, StoryObj } from '@storybook/angular';
import { KpThemeToggleComponent } from '../src/theme-toggle.component';

const meta: Meta<KpThemeToggleComponent> = {
  title: 'Patterns/ThemeToggle',
  component: KpThemeToggleComponent,
  tags: ['autodocs'],
  argTypes: {
    variant:      { control: 'inline-radio', options: ['icon','segmented','dropdown'], table: { defaultValue: { summary: 'icon' } } },
    size:         { control: 'inline-radio', options: ['sm','md','lg'], table: { defaultValue: { summary: 'md' } } },
    currentTheme: { control: 'inline-radio', options: ['light','dark','system'], table: { defaultValue: { summary: 'light' } } },
    showLabel:    { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
  },
};
export default meta;
type Story = StoryObj<KpThemeToggleComponent>;

export const Playground: Story = { args: { variant: 'segmented', size: 'md', currentTheme: 'light', showLabel: true } };

export const Variants: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:24px;font-family:Onest,system-ui,sans-serif">
        <div style="display:flex;gap:16px;align-items:center">
          <kp-theme-toggle variant="icon" currentTheme="light"/>
          <span style="font-size:12px;color: var(--kp-color-gray-600)">icon · light</span>
        </div>
        <div style="display:flex;gap:16px;align-items:center">
          <kp-theme-toggle variant="segmented" currentTheme="light"/>
          <span style="font-size:12px;color: var(--kp-color-gray-600)">segmented · light</span>
        </div>
        <div style="display:flex;gap:16px;align-items:center">
          <kp-theme-toggle variant="dropdown" currentTheme="light"/>
          <span style="font-size:12px;color: var(--kp-color-gray-600)">dropdown · light</span>
        </div>
      </div>
    `,
  }),
};

export const CurrentThemeStates: Story = {
  render: () => ({
    template: `
      <div style="display:grid;grid-template-columns:repeat(3,auto);gap:20px;align-items:center;font-family:Onest,system-ui,sans-serif">
        <kp-theme-toggle variant="icon" currentTheme="light"/>
        <kp-theme-toggle variant="icon" currentTheme="dark"/>
        <kp-theme-toggle variant="icon" currentTheme="system"/>
        <kp-theme-toggle variant="segmented" currentTheme="light"/>
        <kp-theme-toggle variant="segmented" currentTheme="dark"/>
        <kp-theme-toggle variant="segmented" currentTheme="system"/>
        <kp-theme-toggle variant="dropdown" currentTheme="light"/>
        <kp-theme-toggle variant="dropdown" currentTheme="dark"/>
        <kp-theme-toggle variant="dropdown" currentTheme="system"/>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:grid;grid-template-columns:repeat(3,auto);gap:20px;align-items:center;font-family:Onest,system-ui,sans-serif">
        <kp-theme-toggle variant="icon" size="sm"/>
        <kp-theme-toggle variant="icon" size="md"/>
        <kp-theme-toggle variant="icon" size="lg"/>
        <kp-theme-toggle variant="segmented" size="sm"/>
        <kp-theme-toggle variant="segmented" size="md"/>
        <kp-theme-toggle variant="segmented" size="lg"/>
        <kp-theme-toggle variant="dropdown" size="sm"/>
        <kp-theme-toggle variant="dropdown" size="md"/>
        <kp-theme-toggle variant="dropdown" size="lg"/>
      </div>
    `,
  }),
};

export const WithLabel: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:20px;font-family:Onest,system-ui,sans-serif">
        <kp-theme-toggle variant="segmented" [showLabel]="true" currentTheme="light"/>
        <kp-theme-toggle variant="dropdown" [showLabel]="true" currentTheme="dark"/>
      </div>
    `,
  }),
};
