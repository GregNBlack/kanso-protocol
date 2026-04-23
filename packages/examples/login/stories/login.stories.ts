import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { Component } from '@angular/core';
import { KpFormFieldComponent } from '@kanso-protocol/form-field';
import { KpInputComponent } from '@kanso-protocol/input';
import { KpCheckboxComponent } from '@kanso-protocol/checkbox';
import { KpButtonComponent } from '@kanso-protocol/button';
import { KpDividerComponent } from '@kanso-protocol/divider';

/**
 * Headless wrapper so Storybook can render a single Angular component
 * for the example page (instead of an inline template, which loses
 * styles encapsulation in `<i class="ti">` icons).
 */
@Component({
  selector: 'kp-example-login',
  standalone: true,
  imports: [KpFormFieldComponent, KpInputComponent, KpCheckboxComponent, KpButtonComponent, KpDividerComponent],
  template: `
    <div class="page">
      <div class="card">
        <div class="logo" aria-hidden="true">
          <i class="ti ti-shield-check"></i>
        </div>

        <h1 class="title">Welcome back</h1>
        <p class="description">Sign in to your Kanso Protocol account</p>

        <kp-form-field label="Email">
          <kp-input type="email" placeholder="you@example.com"/>
        </kp-form-field>

        <kp-form-field label="Password">
          <kp-input type="password" placeholder="••••••••"/>
        </kp-form-field>

        <div class="options">
          <label class="remember">
            <kp-checkbox [checked]="true"/>
            <span>Remember me</span>
          </label>
          <a class="link" href="#">Forgot password?</a>
        </div>

        <kp-button variant="default" color="primary" size="md" style="display:flex;width:100%">
          <span>Sign in</span>
        </kp-button>

        <kp-divider label="Or continue with"/>

        <div class="social">
          <kp-button variant="outline" color="neutral" size="md" style="display:flex;flex:1 1 0;width:100%">
            <i kpButtonIconLeft class="ti ti-brand-google" aria-hidden="true"></i>
            <span>Google</span>
          </kp-button>
          <kp-button variant="outline" color="neutral" size="md" style="display:flex;flex:1 1 0;width:100%">
            <i kpButtonIconLeft class="ti ti-brand-github" aria-hidden="true"></i>
            <span>GitHub</span>
          </kp-button>
        </div>

        <p class="signup">
          Don't have an account? <a class="link" href="#">Sign up</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .page {
      box-sizing: border-box;
      width: 100%;
      min-height: 100vh;
      padding: 64px 24px;
      background: var(--kp-color-gray-50, #FAFAFA);
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .card {
      box-sizing: border-box;
      width: 100%;
      max-width: 400px;
      padding: 32px;
      background: var(--kp-color-white, #FFFFFF);
      border: 1px solid var(--kp-color-gray-200, #E4E4E7);
      border-radius: 16px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .card kp-form-field { width: 100%; }
    .card kp-input { display: flex; width: 100%; }

    .logo {
      width: 64px; height: 64px;
      border-radius: 16px;
      background: var(--kp-color-blue-600, #2563EB);
      color: var(--kp-color-white, #FFFFFF);
      display: flex; align-items: center; justify-content: center;
      align-self: center;
    }
    .logo .ti { font-size: 32px; line-height: 1; }

    .title {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      text-align: center;
      color: var(--kp-color-gray-900, #18181B);
    }

    .description {
      margin: 0;
      font-size: 14px;
      text-align: center;
      color: var(--kp-color-gray-600, #52525B);
    }

    .options {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .remember {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--kp-color-gray-900, #18181B);
      cursor: pointer;
    }

    .link {
      font-size: 13px;
      font-weight: 500;
      color: var(--kp-color-blue-600, #2563EB);
      text-decoration: none;
    }
    .link:hover { text-decoration: underline; }

    .social {
      display: flex;
      gap: 12px;
    }

    .signup {
      margin: 0;
      text-align: center;
      font-size: 13px;
      color: var(--kp-color-gray-600, #52525B);
    }

    :host .ti { font-size: 16px; line-height: 1; }
  `],
})
class KpExampleLoginComponent {}

const meta: Meta<KpExampleLoginComponent> = {
  title: 'Examples/Login',
  component: KpExampleLoginComponent,
  decorators: [moduleMetadata({ imports: [KpExampleLoginComponent] })],
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<KpExampleLoginComponent>;

export const Default: Story = {};
