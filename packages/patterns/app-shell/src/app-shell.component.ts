import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

export type KpAppShellLayout =
  | 'sidebar-left'
  | 'sidebar-right'
  | 'no-sidebar'
  | 'sidebar-collapsed';

/**
 * Kanso Protocol — AppShell
 *
 * Root application template. Composes Header + Sidebar + Main + Footer
 * with a single layout input driving placement. All sections are
 * projection slots — drop in real `<kp-header>`, `<kp-sidebar>`,
 * `<kp-banner>`, etc. instances.
 *
 * Slots:
 * - `[kpAppShellHeader]` — topbar
 * - `[kpAppShellBanner]` — under header, spans full width
 * - `[kpAppShellSidebar]` — side nav (left / right / hidden depending on `layout`)
 * - `[kpAppShellBody]` — main content; scrolls independently
 * - `[kpAppShellFooter]` — optional footer strip
 *
 * @example
 * <kp-app-shell layout="sidebar-left">
 *   <kp-header kpAppShellHeader [navItems]="nav"/>
 *   <kp-sidebar kpAppShellSidebar [sections]="sections"/>
 *   <div kpAppShellBody>
 *     <kp-page-header title="Dashboard"/>
 *     <!-- … -->
 *   </div>
 * </kp-app-shell>
 */
@Component({
  selector: 'kp-app-shell',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses' },
  template: `
    @if (showHeader) {
      <div class="kp-app-shell__header">
        <ng-content select="[kpAppShellHeader]"/>
      </div>
    }
    @if (showBanner) {
      <div class="kp-app-shell__banner">
        <ng-content select="[kpAppShellBanner]"/>
      </div>
    }
    <div class="kp-app-shell__body">
      @if (showSidebar && layout !== 'no-sidebar') {
        <aside class="kp-app-shell__sidebar">
          <ng-content select="[kpAppShellSidebar]"/>
        </aside>
      }
      <main class="kp-app-shell__main">
        <ng-content select="[kpAppShellBody]"/>
      </main>
    </div>
    @if (showFooter) {
      <footer class="kp-app-shell__footer">
        <ng-content select="[kpAppShellFooter]"/>
      </footer>
    }
  `,
  styles: [`
    :host {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      width: 100%;
      min-height: 100vh;
      background: var(--kp-color-gray-50, var(--kp-color-gray-50));
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
    }

    .kp-app-shell__header,
    .kp-app-shell__banner,
    .kp-app-shell__footer {
      flex: 0 0 auto;
    }

    .kp-app-shell__body {
      flex: 1 1 auto;
      display: flex;
      min-height: 0;
    }

    .kp-app-shell__sidebar {
      flex: 0 0 auto;
    }

    .kp-app-shell__main {
      flex: 1 1 auto;
      min-width: 0;
      overflow-y: auto;
    }

    .kp-app-shell__footer {
      border-top: 1px solid var(--kp-color-gray-200, var(--kp-color-gray-200));
      background: var(--kp-color-white, var(--kp-color-white));
    }

    /* Sidebar right: flip the body row */
    :host(.kp-app-shell--sidebar-right) .kp-app-shell__body {
      flex-direction: row-reverse;
    }
  `],
})
export class KpAppShellComponent {
  @Input() layout: KpAppShellLayout = 'sidebar-left';
  @Input() showHeader = true;
  @Input() showSidebar = true;
  @Input() showFooter = false;
  @Input() showBanner = false;

  get hostClasses(): string {
    return `kp-app-shell kp-app-shell--${this.layout}`;
  }
}
