import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { KpCheckboxComponent } from '@kanso-protocol/checkbox';

export type KpTreeSize = 'sm' | 'md';

export interface KpTreeNode {
  /** Stable identifier — used for selection / expansion tracking. */
  id: string;
  label: string;
  /** Icon glyph key — semantics are consumer-defined. Passed through to
   *  `iconRenderer` if provided; otherwise the component draws a default
   *  folder / file circle. */
  icon?: string;
  /** Trailing text badge (count). */
  badge?: string | number;
  /** Whether this node is expandable (independent of whether `children`
   *  is already populated — useful for lazy loading). Defaults to
   *  `children.length > 0`. */
  expandable?: boolean;
  disabled?: boolean;
  children?: KpTreeNode[];
}

/**
 * Kanso Protocol — Tree
 *
 * Recursive list of nested nodes. Click the chevron to toggle expansion;
 * click the label to select. Optional `showCheckboxes` renders a
 * checkbox per node with tri-state propagation (child check flips
 * parent indeterminate / checked).
 *
 * Expansion and selection state is owned internally but mirrored via
 * `[(expanded)]` / `[(selected)]` / `[(checked)]` two-way bindings so
 * callers can drive or persist it.
 */
@Component({
  selector: 'kp-tree',
  imports: [NgTemplateOutlet, KpCheckboxComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses' },
  template: `
    <ul class="kp-tree__list" role="tree">
      @for (node of data; track node.id) {
        <ng-container *ngTemplateOutlet="nodeTpl; context: { node: node, level: 0 }"></ng-container>
      }
    </ul>

    <ng-template #nodeTpl let-node="node" let-level="level">
      <li class="kp-tree__node" role="treeitem"
          [attr.aria-level]="level + 1"
          [attr.aria-expanded]="isExpandable(node) ? isExpanded(node.id) : null"
          [attr.aria-selected]="selected === node.id || null"
          [attr.tabindex]="node.disabled ? -1 : (initialFocusedId === node.id ? 0 : -1)"
          [attr.data-node-id]="node.id"
          (keydown)="onKeyDown($event, node)"
          (focus)="focusedId = node.id">
        <div
          class="kp-tree__row"
          [class.kp-tree__row--selected]="selected === node.id"
          [class.kp-tree__row--disabled]="node.disabled"
          [style.padding-inline-start.px]="paddingForLevel(level)"
          (click)="onRowClick(node)"
        >
          @if (isExpandable(node)) {
            <button
              type="button"
              class="kp-tree__chevron"
              [class.kp-tree__chevron--expanded]="isExpanded(node.id)"
              [attr.aria-label]="isExpanded(node.id) ? 'Collapse' : 'Expand'"
              (click)="toggleExpanded(node, $event)"
            >
              <svg viewBox="0 0 12 12" fill="none" width="12" height="12" aria-hidden="true">
                <path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          } @else {
            <span class="kp-tree__chevron kp-tree__chevron--placeholder" aria-hidden="true"></span>
          }

          @if (showCheckboxes) {
            <span class="kp-tree__checkbox" (click)="$event.stopPropagation()">
              <kp-checkbox
                size="sm"
                [hasLabel]="false"
                [checked]="checkState(node) === 'checked'"
                [indeterminate]="checkState(node) === 'indeterminate'"
                [disabled]="node.disabled"
                (checkedChange)="toggleChecked(node)"
              />
            </span>
          }

          @if (showIcons) {
            <span class="kp-tree__icon" aria-hidden="true">
              @if (isExpandable(node)) {
                @if (isExpanded(node.id)) {
                  <!-- open folder -->
                  <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M1 4a1 1 0 0 1 1-1h3.5l1.5 1.5H14a1 1 0 0 1 1 1V6H2l-1 6V4z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M2 6h13l-1 6H1l1-6z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
                } @else {
                  <!-- closed folder -->
                  <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M1 4a1 1 0 0 1 1-1h3.5l1.5 1.5H14a1 1 0 0 1 1 1V12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
                }
              } @else {
                <!-- file -->
                <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M3 2h6l4 4v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M9 2v4h4" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
              }
            </span>
          }

          <span class="kp-tree__label">{{ node.label }}</span>

          @if (node.badge != null) {
            <span class="kp-tree__badge">{{ node.badge }}</span>
          }
        </div>

        @if (isExpandable(node) && isExpanded(node.id) && node.children?.length) {
          <ul class="kp-tree__list kp-tree__list--nested" role="group">
            @for (child of node.children; track child.id) {
              <ng-container *ngTemplateOutlet="nodeTpl; context: { node: child, level: level + 1 }"></ng-container>
            }
          </ul>
        }
      </li>
    </ng-template>
  `,
  styles: [`
    :host {
      display: block;
      font-family: var(--kp-font-family-sans, 'Onest', system-ui, sans-serif);
      --kp-tree-row-h: 36px;
      --kp-tree-pad-x: 12px;
      --kp-tree-gap: 8px;
      --kp-tree-indent: 24px;
      --kp-tree-fs: 14px;
    }
    :host(.kp-tree--sm) {
      --kp-tree-row-h: 28px;
      --kp-tree-pad-x: 8px;
      --kp-tree-gap: 6px;
      --kp-tree-indent: 20px;
      --kp-tree-fs: 13px;
    }

    .kp-tree__list {
      list-style: none;
      margin: 0;
      padding: 4px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .kp-tree__list--nested { padding: 0; }

    .kp-tree__node { margin: 0; }

    .kp-tree__row {
      display: flex;
      align-items: center;
      gap: var(--kp-tree-gap);
      height: var(--kp-tree-row-h);
      padding-inline-end: var(--kp-tree-pad-x);
      border-radius: 6px;
      font-size: var(--kp-tree-fs);
      color: var(--kp-color-tree-node-fg-rest, var(--kp-color-gray-900));
      cursor: pointer;
      user-select: none;
      transition: background var(--kp-motion-duration-fast) ease;
    }
    .kp-tree__row:hover:not(.kp-tree__row--selected):not(.kp-tree__row--disabled) {
      background: var(--kp-color-tree-node-bg-hover, var(--kp-color-gray-50));
    }
    .kp-tree__row--selected {
      background: var(--kp-color-tree-node-bg-selected, var(--kp-color-blue-50));
      color: var(--kp-color-tree-node-fg-selected, var(--kp-color-blue-700));
      font-weight: 500;
    }
    .kp-tree__row--disabled {
      color: var(--kp-color-tree-node-fg-disabled, var(--kp-color-gray-400));
      cursor: not-allowed;
    }

    .kp-tree__chevron {
      all: unset;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      color: var(--kp-color-tree-node-chevron, var(--kp-color-gray-500));
      cursor: pointer;
      transition: transform var(--kp-motion-duration-fast) ease;
      flex: 0 0 auto;
    }
    .kp-tree__chevron--expanded { transform: rotate(90deg); }
    .kp-tree__chevron--placeholder { cursor: default; }

    .kp-tree__checkbox {
      display: inline-flex;
      flex: 0 0 auto;
    }

    .kp-tree__icon {
      display: inline-flex;
      color: var(--kp-color-tree-node-icon-rest, var(--kp-color-gray-600));
      flex: 0 0 auto;
    }
    .kp-tree__row--selected .kp-tree__icon {
      color: var(--kp-color-tree-node-icon-selected, var(--kp-color-blue-600));
    }

    .kp-tree__label {
      flex: 1 1 auto;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .kp-tree__badge {
      flex: 0 0 auto;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 500;
      background: var(--kp-color-gray-100, var(--kp-color-gray-100));
      color: var(--kp-color-gray-700, var(--kp-color-gray-700));
    }
  `],
})
export class KpTreeComponent {
  @Input() size: KpTreeSize = 'md';
  @Input() data: KpTreeNode[] = [];
  @Input() showIcons = true;
  @Input() showCheckboxes = false;
  /** Ids of expanded nodes. Two-way bindable. */
  @Input() expanded: string[] = [];
  /** Id of the single selected node. Two-way bindable (single-select only in v1). */
  @Input() selected: string | null = null;
  /** Ids of checked nodes. Two-way bindable. */
  @Input() checked: string[] = [];

  @Output() readonly expandedChange = new EventEmitter<string[]>();
  @Output() readonly selectedChange = new EventEmitter<string | null>();
  @Output() readonly checkedChange = new EventEmitter<string[]>();
  @Output() readonly nodeClick = new EventEmitter<KpTreeNode>();

  /** @internal — id of the node that currently owns focus. Roving tabindex
   *  pattern: only this node is tabbable; arrow keys move focus around. */
  focusedId: string | null = null;

  /** @internal — fallback tabbable target when nothing has been clicked yet:
   *  the selected node if it exists, otherwise the first enabled top-level. */
  get initialFocusedId(): string | null {
    if (this.focusedId) return this.focusedId;
    if (this.selected) return this.selected;
    return this.data.find((n) => !n.disabled)?.id ?? null;
  }

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly host = inject(ElementRef) as ElementRef<HTMLElement>;

  get hostClasses(): string { return `kp-tree kp-tree--${this.size}`; }

  isExpandable(node: KpTreeNode): boolean {
    return node.expandable ?? ((node.children?.length ?? 0) > 0);
  }
  isExpanded(id: string): boolean { return this.expanded.includes(id); }

  paddingForLevel(level: number): number {
    const base = this.size === 'sm' ? 8 : 12;
    const indent = this.size === 'sm' ? 20 : 24;
    return base + level * indent;
  }

  toggleExpanded(node: KpTreeNode, event: Event): void {
    event.stopPropagation();
    if (node.disabled) return;
    const next = this.isExpanded(node.id)
      ? this.expanded.filter((id) => id !== node.id)
      : [...this.expanded, node.id];
    this.expanded = next;
    this.expandedChange.emit(next);
  }

  onRowClick(node: KpTreeNode): void {
    if (node.disabled) return;
    this.nodeClick.emit(node);
    this.selected = node.id;
    this.focusedId = node.id;
    this.selectedChange.emit(node.id);
  }

  /**
   * WAI-ARIA tree keyboard pattern:
   *   ArrowDown / ArrowUp  — previous / next visible node
   *   ArrowRight           — expand (if collapsed) or focus first child (if expanded)
   *   ArrowLeft            — collapse (if expanded) or focus parent
   *   Home / End           — first / last visible node
   *   Enter / Space        — select the focused node
   */
  onKeyDown(event: KeyboardEvent, node: KpTreeNode): void {
    if (node.disabled) return;
    const flat = this.visibleNodes();
    const idx = flat.findIndex((n) => n.node.id === node.id);
    if (idx < 0) return;

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        const next = flat.slice(idx + 1).find((n) => !n.node.disabled);
        if (next) this.focusNode(next.node.id);
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        const prev = [...flat.slice(0, idx)].reverse().find((n) => !n.node.disabled);
        if (prev) this.focusNode(prev.node.id);
        break;
      }
      case 'Home': {
        event.preventDefault();
        const first = flat.find((n) => !n.node.disabled);
        if (first) this.focusNode(first.node.id);
        break;
      }
      case 'End': {
        event.preventDefault();
        const last = [...flat].reverse().find((n) => !n.node.disabled);
        if (last) this.focusNode(last.node.id);
        break;
      }
      case 'ArrowRight': {
        event.preventDefault();
        if (this.isExpandable(node) && !this.isExpanded(node.id)) {
          this.toggleExpanded(node, event);
        } else if (this.isExpandable(node) && node.children?.length) {
          const firstChild = node.children.find((c) => !c.disabled);
          if (firstChild) this.focusNode(firstChild.id);
        }
        break;
      }
      case 'ArrowLeft': {
        event.preventDefault();
        if (this.isExpandable(node) && this.isExpanded(node.id)) {
          this.toggleExpanded(node, event);
        } else {
          const parent = flat[idx].parent;
          if (parent) this.focusNode(parent.id);
        }
        break;
      }
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.onRowClick(node);
        break;
      default:
        return;
    }
  }

  /** Flatten the tree to the linear order that's currently visible (closed
   *  branches are pruned), with each entry carrying its direct parent.
   *  Used for Up/Down keyboard nav and for resolving ArrowLeft → parent. */
  private visibleNodes(): { node: KpTreeNode; parent: KpTreeNode | null }[] {
    const out: { node: KpTreeNode; parent: KpTreeNode | null }[] = [];
    const walk = (nodes: KpTreeNode[], parent: KpTreeNode | null) => {
      for (const n of nodes) {
        out.push({ node: n, parent });
        if (n.children?.length && this.isExpanded(n.id)) walk(n.children, n);
      }
    };
    walk(this.data, null);
    return out;
  }

  private focusNode(id: string): void {
    this.focusedId = id;
    this.cdr.markForCheck();
    // After Angular reconciles tabindex, move DOM focus to the new node.
    queueMicrotask(() => {
      const el = this.host.nativeElement.querySelector<HTMLElement>(`li[data-node-id="${id}"]`);
      el?.focus();
    });
  }

  /** Tri-state check derivation: a parent reflects the union of its leaves. */
  checkState(node: KpTreeNode): 'unchecked' | 'checked' | 'indeterminate' {
    if (!node.children?.length) {
      return this.checked.includes(node.id) ? 'checked' : 'unchecked';
    }
    const leaves: KpTreeNode[] = [];
    (function collect(n: KpTreeNode) {
      if (!n.children?.length) leaves.push(n);
      else for (const c of n.children) collect(c);
    })(node);
    const checkedLeaves = leaves.filter((l) => this.checked.includes(l.id)).length;
    if (checkedLeaves === 0) return 'unchecked';
    if (checkedLeaves === leaves.length) return 'checked';
    return 'indeterminate';
  }

  toggleChecked(node: KpTreeNode): void {
    if (node.disabled) return;
    const leaves: KpTreeNode[] = [];
    (function collect(n: KpTreeNode) {
      if (!n.children?.length) leaves.push(n);
      else for (const c of n.children) collect(c);
    })(node);
    const allLeafIds = leaves.map((l) => l.id);
    const state = this.checkState(node);
    const setNext = state === 'checked'
      ? this.checked.filter((id) => !allLeafIds.includes(id))
      : [...new Set([...this.checked, ...allLeafIds])];
    this.checked = setNext;
    this.checkedChange.emit(setNext);
    this.cdr.markForCheck();
  }
}
