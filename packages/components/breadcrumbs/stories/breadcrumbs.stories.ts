import { applicationConfig, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { provideRouter, Router } from '@angular/router';
import { Component, OnInit, inject } from '@angular/core';
import { KpBreadcrumbsComponent } from '../src/breadcrumbs.component';
import { KpBreadcrumbItemComponent } from '../src/breadcrumb-item.component';
import { KpBreadcrumbSeparatorComponent } from '../src/breadcrumb-separator.component';
import { KpBreadcrumbsAutoComponent } from '../src/breadcrumbs-auto.component';

@Component({
  selector: 'kp-breadcrumbs-auto-demo',
  imports: [KpBreadcrumbsAutoComponent],
  template: `
    <kp-breadcrumbs-auto size="md" separator="chevron"/>
    <p style="font-size:11px;color:#A1A1AA;margin:12px 0 0">
      Router state is driven by <code>provideRouter(...)</code> in this story's <code>applicationConfig</code>.
      In a real app, drop <code>&lt;kp-breadcrumbs-auto/&gt;</code> inside any routed component and the trail
      rebuilds on every <code>NavigationEnd</code>.
    </p>`,
})
class BreadcrumbsAutoDemoComponent implements OnInit {
  private readonly router = inject(Router);
  ngOnInit(): void {
    // skipLocationChange — NavigationEnd still fires so breadcrumbs rebuild,
    // but window.location stays put. Otherwise the URL rewrite breaks Storybook's
    // relative chunk loading for any story the user visits afterwards.
    void this.router.navigateByUrl('/projects/design-system/button', { skipLocationChange: true });
  }
}

// Placeholder component so router config is valid (Angular 16+ requires every
// route to declare one of component / redirectTo / children / loadChildren /
// loadComponent — the story only cares about matching for the breadcrumb
// data, so an empty template is enough).
@Component({ selector: 'kp-route-blank', standalone: true, template: '' })
class RouteBlank {}

const meta: Meta<KpBreadcrumbsComponent> = {
  title: 'Components/Breadcrumbs',
  component: KpBreadcrumbsComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [
        KpBreadcrumbItemComponent,
        KpBreadcrumbSeparatorComponent,
        KpBreadcrumbsAutoComponent,
      ],
    }),
  ],
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'], table: { defaultValue: { summary: 'md' } } },
  },
};
export default meta;
type Story = StoryObj<KpBreadcrumbsComponent>;

const home = `<svg kpBreadcrumbIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 12 L12 3 L21 12"/><path d="M5 10 V21 H19 V10"/>
</svg>`;

const folder = `<svg kpBreadcrumbIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 7 V19 H21 V9 H12 L10 7 Z"/>
</svg>`;

const file = `<svg kpBreadcrumbIcon viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M14 2 H6 V22 H18 V6 Z"/><path d="M14 2 V6 H18"/>
</svg>`;

const caption = `font-size:11px;color:#A1A1AA;margin-top:6px;display:block`;

export const Default: Story = {
  args: { size: 'md' },
  render: (args) => ({
    props: args,
    template: `
      <kp-breadcrumbs [size]="size">
        <kp-breadcrumb-item type="link" href="#">${home}</kp-breadcrumb-item>
        <kp-breadcrumb-separator type="chevron"/>
        <kp-breadcrumb-item type="link" label="Projects" href="#"/>
        <kp-breadcrumb-separator type="chevron"/>
        <kp-breadcrumb-item type="current" label="Button"/>
      </kp-breadcrumbs>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:24px">
        <div>
          <kp-breadcrumbs size="sm">
            <kp-breadcrumb-item type="link" href="#">${home}</kp-breadcrumb-item>
            <kp-breadcrumb-separator type="chevron"/>
            <kp-breadcrumb-item type="link" label="Projects" href="#"/>
            <kp-breadcrumb-separator type="chevron"/>
            <kp-breadcrumb-item type="link" label="Design System" href="#"/>
            <kp-breadcrumb-separator type="chevron"/>
            <kp-breadcrumb-item type="current" label="Button"/>
          </kp-breadcrumbs>
          <span style="${caption}">Small</span>
        </div>
        <div>
          <kp-breadcrumbs size="md">
            <kp-breadcrumb-item type="link" href="#">${home}</kp-breadcrumb-item>
            <kp-breadcrumb-separator type="chevron"/>
            <kp-breadcrumb-item type="link" label="Projects" href="#"/>
            <kp-breadcrumb-separator type="chevron"/>
            <kp-breadcrumb-item type="link" label="Design System" href="#"/>
            <kp-breadcrumb-separator type="chevron"/>
            <kp-breadcrumb-item type="current" label="Button"/>
          </kp-breadcrumbs>
          <span style="${caption}">Medium (default)</span>
        </div>
      </div>`,
  }),
};

export const Separators: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:16px">
        ${(['chevron', 'slash', 'dot'] as const).map((sep, i) => `
          <div>
            <kp-breadcrumbs size="md">
              <kp-breadcrumb-item type="link" href="#">${home}</kp-breadcrumb-item>
              <kp-breadcrumb-separator type="${sep}"/>
              <kp-breadcrumb-item type="link" label="Projects" href="#"/>
              <kp-breadcrumb-separator type="${sep}"/>
              <kp-breadcrumb-item type="link" label="Design System" href="#"/>
              <kp-breadcrumb-separator type="${sep}"/>
              <kp-breadcrumb-item type="current" label="Button"/>
            </kp-breadcrumbs>
            <span style="${caption}">${['Chevron (default)', 'Slash', 'Dot'][i]}</span>
          </div>
        `).join('')}
      </div>`,
  }),
};

export const PathLength: Story = {
  name: 'Path Length',
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:16px">
        <div>
          <kp-breadcrumbs size="md">
            <kp-breadcrumb-item type="link" href="#">${home}</kp-breadcrumb-item>
            <kp-breadcrumb-separator type="chevron"/>
            <kp-breadcrumb-item type="current" label="Projects"/>
          </kp-breadcrumbs>
          <span style="${caption}">2 levels</span>
        </div>
        <div>
          <kp-breadcrumbs size="md">
            <kp-breadcrumb-item type="link" href="#">${home}</kp-breadcrumb-item>
            <kp-breadcrumb-separator type="chevron"/>
            <kp-breadcrumb-item type="link" label="Projects" href="#"/>
            <kp-breadcrumb-separator type="chevron"/>
            <kp-breadcrumb-item type="current" label="Design System"/>
          </kp-breadcrumbs>
          <span style="${caption}">3 levels (default)</span>
        </div>
        <div>
          <kp-breadcrumbs size="md">
            <kp-breadcrumb-item type="link" href="#">${home}</kp-breadcrumb-item>
            <kp-breadcrumb-separator type="chevron"/>
            <kp-breadcrumb-item type="link" label="Projects" href="#"/>
            <kp-breadcrumb-separator type="chevron"/>
            <kp-breadcrumb-item type="link" label="Design System" href="#"/>
            <kp-breadcrumb-separator type="chevron"/>
            <kp-breadcrumb-item type="link" label="Components" href="#"/>
            <kp-breadcrumb-separator type="chevron"/>
            <kp-breadcrumb-item type="current" label="Button"/>
          </kp-breadcrumbs>
          <span style="${caption}">5 levels</span>
        </div>
        <div>
          <kp-breadcrumbs size="md">
            <kp-breadcrumb-item type="link" href="#">${home}</kp-breadcrumb-item>
            <kp-breadcrumb-separator type="chevron"/>
            <kp-breadcrumb-item type="link" label="Projects" href="#"/>
            <kp-breadcrumb-separator type="chevron"/>
            <kp-breadcrumb-item type="link" label="Design System" href="#"/>
            <kp-breadcrumb-separator type="chevron"/>
            <kp-breadcrumb-item type="link" label="Components" href="#"/>
            <kp-breadcrumb-separator type="chevron"/>
            <kp-breadcrumb-item type="link" label="Button" href="#"/>
            <kp-breadcrumb-separator type="chevron"/>
            <kp-breadcrumb-item type="link" label="States" href="#"/>
            <kp-breadcrumb-separator type="chevron"/>
            <kp-breadcrumb-item type="current" label="Hover"/>
          </kp-breadcrumbs>
          <span style="${caption}">7 levels</span>
        </div>
      </div>`,
  }),
};

export const ItemContent: Story = {
  name: 'Item Content',
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:16px">
        <div>
          <kp-breadcrumbs size="md">
            <kp-breadcrumb-item type="link" href="#">${home}</kp-breadcrumb-item>
            <kp-breadcrumb-separator type="chevron"/>
            <kp-breadcrumb-item type="link" label="Projects" href="#">${folder}</kp-breadcrumb-item>
            <kp-breadcrumb-separator type="chevron"/>
            <kp-breadcrumb-item type="current" label="README.md">${file}</kp-breadcrumb-item>
          </kp-breadcrumbs>
          <span style="${caption}">Icon + Text</span>
        </div>
        <div>
          <kp-breadcrumbs size="md">
            <kp-breadcrumb-item type="link" label="Home" href="#"/>
            <kp-breadcrumb-separator type="chevron"/>
            <kp-breadcrumb-item type="link" label="Projects" href="#"/>
            <kp-breadcrumb-separator type="chevron"/>
            <kp-breadcrumb-item type="current" label="Design System"/>
          </kp-breadcrumbs>
          <span style="${caption}">Text only</span>
        </div>
        <div>
          <kp-breadcrumbs size="md">
            <kp-breadcrumb-item type="link" href="#">${home}</kp-breadcrumb-item>
            <kp-breadcrumb-separator type="chevron"/>
            <kp-breadcrumb-item type="link" label="Projects" href="#"/>
            <kp-breadcrumb-separator type="chevron"/>
            <kp-breadcrumb-item type="current" label="Button.tsx">${file}</kp-breadcrumb-item>
          </kp-breadcrumbs>
          <span style="${caption}">Mix</span>
        </div>
      </div>`,
  }),
};

export const Overflow: Story = {
  render: () => ({
    template: `
      <kp-breadcrumbs size="md">
        <kp-breadcrumb-item type="link" href="#">${home}</kp-breadcrumb-item>
        <kp-breadcrumb-separator type="chevron"/>
        <kp-breadcrumb-item type="link" label="Projects" href="#"/>
        <kp-breadcrumb-separator type="chevron"/>
        <kp-breadcrumb-item type="ellipsis" ariaLabel="Show 3 hidden breadcrumbs"/>
        <kp-breadcrumb-separator type="chevron"/>
        <kp-breadcrumb-item type="link" label="States" href="#"/>
        <kp-breadcrumb-separator type="chevron"/>
        <kp-breadcrumb-item type="current" label="Hover"/>
      </kp-breadcrumbs>
      <p style="font-size:11px;color:#A1A1AA;margin:8px 0 0">Use ellipsis to collapse middle levels when path is long. Clicking ellipsis opens a Popover / DropdownMenu with hidden items.</p>`,
  }),
};

export const States: Story = {
  render: () => ({
    template: `
      <kp-breadcrumbs size="md">
        <kp-breadcrumb-item type="link" label="Rest" href="#"/>
        <kp-breadcrumb-separator type="chevron"/>
        <kp-breadcrumb-item type="link" label="Disabled" [disabled]="true"/>
        <kp-breadcrumb-separator type="chevron"/>
        <kp-breadcrumb-item type="current" label="Current"/>
      </kp-breadcrumbs>
      <p style="font-size:11px;color:#A1A1AA;margin:8px 0 0">Hover + focus states are interactive — move the mouse over "Rest" or tab into it.</p>`,
  }),
};

export const Auto: Story = {
  name: 'Auto (router-driven)',
  decorators: [
    applicationConfig({
      providers: [
        provideRouter([
          {
            path: '',
            data: { breadcrumb: 'Home' },
            children: [
              {
                path: 'projects',
                data: { breadcrumb: 'Projects' },
                children: [
                  {
                    path: 'design-system',
                    data: { breadcrumb: 'Design System' },
                    children: [
                      {
                        path: 'button',
                        component: RouteBlank,
                        data: { breadcrumb: (route: any) => route.paramMap.get('id') ?? 'Button' },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ]),
      ],
    }),
  ],
  render: () => ({
    moduleMetadata: { imports: [BreadcrumbsAutoDemoComponent] },
    template: `<kp-breadcrumbs-auto-demo/>`,
  }),
};

export const UseCases: Story = {
  name: 'Use Cases',
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:32px">
        <div>
          <kp-breadcrumbs size="sm">
            <kp-breadcrumb-item type="link" href="#">${home}</kp-breadcrumb-item>
            <kp-breadcrumb-separator type="slash"/>
            <kp-breadcrumb-item type="link" label="kanso-protocol" href="#"/>
            <kp-breadcrumb-separator type="slash"/>
            <kp-breadcrumb-item type="link" label="packages" href="#"/>
            <kp-breadcrumb-separator type="slash"/>
            <kp-breadcrumb-item type="link" label="components" href="#"/>
            <kp-breadcrumb-separator type="slash"/>
            <kp-breadcrumb-item type="current" label="button.component.ts">${file}</kp-breadcrumb-item>
          </kp-breadcrumbs>
          <span style="${caption}">File path navigation</span>
        </div>
        <div>
          <kp-breadcrumbs size="md">
            <kp-breadcrumb-item type="link" href="#">${home}</kp-breadcrumb-item>
            <kp-breadcrumb-separator type="chevron"/>
            <kp-breadcrumb-item type="link" label="Electronics" href="#"/>
            <kp-breadcrumb-separator type="chevron"/>
            <kp-breadcrumb-item type="link" label="Laptops" href="#"/>
            <kp-breadcrumb-separator type="chevron"/>
            <kp-breadcrumb-item type="current" label="MacBook Pro 16"/>
          </kp-breadcrumbs>
          <span style="${caption}">Product catalog navigation</span>
        </div>
        <div>
          <kp-breadcrumbs size="md">
            <kp-breadcrumb-item type="link" href="#">${home}</kp-breadcrumb-item>
            <kp-breadcrumb-separator type="chevron"/>
            <kp-breadcrumb-item type="link" label="Settings" href="#"/>
            <kp-breadcrumb-separator type="chevron"/>
            <kp-breadcrumb-item type="ellipsis"/>
            <kp-breadcrumb-separator type="chevron"/>
            <kp-breadcrumb-item type="link" label="Permissions" href="#"/>
            <kp-breadcrumb-separator type="chevron"/>
            <kp-breadcrumb-item type="current" label="Edit role"/>
          </kp-breadcrumbs>
          <span style="${caption}">Deep admin navigation with collapsed middle</span>
        </div>
      </div>`,
  }),
};
