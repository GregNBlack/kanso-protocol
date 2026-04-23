import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

export type KpPageErrorType = '404' | '500' | 'offline' | 'access-denied';

const DEFAULTS: Record<KpPageErrorType, { title: string; description: string; icon: string; code: string | null }> = {
  '404': {
    title: 'Page not found',
    description: "The page you're looking for doesn't exist or has been moved. Check the URL or go back to the home page.",
    icon: 'search-off',
    code: '404',
  },
  '500': {
    title: 'Something went wrong',
    description: "Our servers are experiencing issues. We've been notified and are working on it. Please try again in a few minutes.",
    icon: 'alert-triangle',
    code: '500',
  },
  'offline': {
    title: "You're offline",
    description: 'Check your internet connection and try again. Some features may be unavailable while offline.',
    icon: 'wifi-off',
    code: null,
  },
  'access-denied': {
    title: 'Access denied',
    description: "You don't have permission to access this page. Contact your administrator to request access.",
    icon: 'lock',
    code: null,
  },
};

/**
 * Kanso Protocol — PageError
 *
 * Full-page error state for 404, 500, offline, and access-denied
 * scenarios. Composes an illustration, optional hero error code,
 * title + description, and primary/secondary action slots.
 *
 * Titles/descriptions/icon default to the `type` preset; override
 * any of them via individual inputs.
 *
 * Slots:
 * - `[kpPageErrorPrimary]` — primary CTA (Button, default)
 * - `[kpPageErrorSecondary]` — secondary CTA (Button, ghost)
 *
 * @example
 * <kp-page-error type="404">
 *   <kp-button kpPageErrorPrimary>Go home</kp-button>
 *   <kp-button kpPageErrorSecondary variant="ghost">Report broken link</kp-button>
 * </kp-page-error>
 */
@Component({
  selector: 'kp-page-error',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses', role: 'alert' },
  template: `
    @if (code) {
      <div class="kp-page-error__code" aria-hidden="true">{{ code }}</div>
    }
    <div class="kp-page-error__illustration" aria-hidden="true">
      <i class="ti" [class]="'ti ti-' + iconName"></i>
    </div>
    <div class="kp-page-error__text">
      <h1 class="kp-page-error__title">{{ resolvedTitle }}</h1>
      <p class="kp-page-error__desc">{{ resolvedDescription }}</p>
    </div>
    <div class="kp-page-error__actions">
      @if (showPrimary) {
        <ng-content select="[kpPageErrorPrimary]"/>
      }
      @if (showSecondary) {
        <ng-content select="[kpPageErrorSecondary]"/>
      }
    </div>
  `,
  styles: [`
    :host {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 64px;
      min-height: 600px;
      width: 100%;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      text-align: center;
    }

    .kp-page-error__code {
      font-size: 120px;
      font-weight: 700;
      line-height: 1;
      color: var(--kp-color-gray-200, var(--kp-color-gray-200));
      letter-spacing: -0.02em;
      margin-bottom: 0;
    }

    .kp-page-error__illustration {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 96px;
      height: 96px;
      border-radius: 50%;
      background: var(--kp-color-gray-100, var(--kp-color-gray-100));
      color: var(--kp-color-gray-500, var(--kp-color-gray-500));
    }
    .kp-page-error__illustration .ti { font-size: 48px; line-height: 1; }

    .kp-page-error__text {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-width: 480px;
    }
    .kp-page-error__title {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
      color: var(--kp-color-gray-900, var(--kp-color-gray-900));
    }
    .kp-page-error__desc {
      margin: 0;
      font-size: 16px;
      line-height: 1.5;
      color: var(--kp-color-gray-600, var(--kp-color-gray-600));
    }

    .kp-page-error__actions {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
    }
  `],
})
export class KpPageErrorComponent {
  @Input() type: KpPageErrorType = '404';

  /** Override the preset title */
  @Input() title: string | null = null;
  /** Override the preset description */
  @Input() description: string | null = null;
  /** Override the Tabler icon name (without `ti-` prefix) */
  @Input() icon: string | null = null;
  /** Override the hero error code (pass empty string to hide on 404/500) */
  @Input() errorCode: string | null | undefined = undefined;

  @Input() showPrimary = true;
  @Input() showSecondary = true;

  get resolvedTitle(): string {
    return this.title ?? DEFAULTS[this.type].title;
  }
  get resolvedDescription(): string {
    return this.description ?? DEFAULTS[this.type].description;
  }
  get iconName(): string {
    return this.icon ?? DEFAULTS[this.type].icon;
  }

  get code(): string | null {
    if (this.errorCode === undefined) return DEFAULTS[this.type].code;
    return this.errorCode || null;
  }

  get hostClasses(): string {
    return `kp-page-error kp-page-error--${this.type}`;
  }
}
