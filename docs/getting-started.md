# Getting started

From zero to a themed, accessible screen in five steps. Assumes an Angular 21+ app (standalone, zoneless-friendly).

## 1. Install

One package — every component and pattern is a secondary entry point of it:

```bash
npm install @kanso-protocol/ui
```

Peer deps: `@angular/core` and `@angular/common` (`>= 21.0.0`). Some components also use `@angular/forms` (form controls) and `@angular/router` (`breadcrumbs`, `nav-item`) — install those if you use them.

## 2. Load the tokens

Components consume CSS custom properties at runtime. Import them once at app bootstrap (e.g. in `styles.css` or `main.ts`):

```ts
import '@kanso-protocol/ui/styles/tokens.css';   // light + the :root default
import '@kanso-protocol/ui/styles/dark.css';      // enables [data-theme="dark"]
```

That's the whole setup — no module to import, no `forRoot()`.

## 3. Use a component

Everything is standalone; import the specific entry point and drop it in a template:

```ts
import { Component } from '@angular/core';
import { KpButtonComponent } from '@kanso-protocol/ui/button';
import { KpIconComponent } from '@kanso-protocol/ui/icon';

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [KpButtonComponent, KpIconComponent],
  template: `
    <button kpButton variant="default" color="primary" (click)="save()">
      <kp-icon name="check" /> Save
    </button>
  `,
})
export class DemoComponent {
  save() { /* … */ }
}
```

Import only what you reference — each entry point is its own ESM module, so tree-shaking ships nothing else.

## 4. Compose a screen

Patterns are opinionated compositions. A typical app chrome:

```ts
import { KpAppShellComponent } from '@kanso-protocol/ui/app-shell';
import { KpSidebarComponent } from '@kanso-protocol/ui/sidebar';
import { KpHeaderComponent } from '@kanso-protocol/ui/header';
import { KpPageHeaderComponent } from '@kanso-protocol/ui/page-header';
```

```html
<kp-app-shell>
  <kp-header kpAppShellHeader [/* logo, search, user-menu slots */]></kp-header>
  <kp-sidebar kpAppShellSidebar [sections]="nav"></kp-sidebar>

  <main kpAppShellBody>
    <kp-page-header title="Team members" />
    <!-- your content -->
  </main>
</kp-app-shell>
```

See the **Example Pages** in [Storybook](https://gregnblack.github.io/kanso-protocol) (Dashboard / Settings / List / Detail / Login) for full, copyable compositions, and [`docs/templates/workspace.md`](templates/workspace.md) for a drop-in workspace shell.

## 5. Build a form

`form-field` wraps any control, renders the label / helper / required marker, and — this is the point — **reads the control's `ValidationErrors` and renders the matching message automatically**. You supply the message text once, app-wide, via `KP_VALIDATION_MESSAGES`.

```ts
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { KpFormFieldComponent, KP_VALIDATION_MESSAGES } from '@kanso-protocol/ui/form-field';
import { KpInputComponent } from '@kanso-protocol/ui/input';
import { KpButtonComponent } from '@kanso-protocol/ui/button';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, KpFormFieldComponent, KpInputComponent, KpButtonComponent],
  providers: [
    {
      provide: KP_VALIDATION_MESSAGES,
      useValue: {
        required: 'This field is required.',
        email: 'Enter a valid email address.',
        minlength: ({ requiredLength }: { requiredLength: number }) =>
          `At least ${requiredLength} characters.`,
      },
    },
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()">
      <kp-form-field label="Email" required="auto">
        <input kpInput type="email" formControlName="email" />
      </kp-form-field>

      <kp-form-field label="Password" required="auto">
        <input kpInput type="password" formControlName="password" />
      </kp-form-field>

      <button kpButton type="submit" color="primary" [disabled]="form.invalid">
        Create account
      </button>
    </form>
  `,
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });
  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    /* … */
  }
}
```

- The error message appears when the control is invalid **and** touched — `form-field` handles the timing.
- Override a single field's text inline with `[errors]="{ required: 'Custom…' }"`.
- For server-side errors, set the control error yourself: `form.get('email')!.setErrors({ taken: true })` and add a `taken` message to the registry.

## Next steps

- **Theme it** → [`docs/theming.md`](theming.md): recolor to your brand in one line, light/dark, multi-brand.
- **What's stable** → [`docs/stability.md`](stability.md): per-surface tier (`stable` / `beta` / `experimental`).
- **Pick the right component** → the *Decision Matrix* page in Storybook.
- **Keyboard contract** → [`docs/keyboard-map.md`](keyboard-map.md).
- **SSR** → [`docs/ssr.md`](ssr.md): works out of the box with `@angular/ssr`.
- **AI-assisted** → wire the [`@kanso-protocol/mcp`](../packages/mcp/README.md) server so Claude / Cursor author against the live, typed catalog.
