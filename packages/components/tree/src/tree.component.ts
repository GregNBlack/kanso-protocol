import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

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
  imports: [NgTemplateOutlet],
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
          [attr.aria-selected]="selected === node.id || null">
        <div
          class="kp-tree__row"
          [class.kp-tree__row--selected]="selected === node.id"
          [class.kp-tree__row--disabled]="node.disabled"
          [style.paddingLeft.px]="paddingForLevel(level)"
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
            <input
              type="checkbox"
              class="kp-tree__checkbox"
              [checked]="checkState(node) === 'checked'"
              [indeterminate]="checkState(node) === 'indeterminate'"
              [disabled]="node.disabled"
              [attr.aria-label]="'Select ' + node.label"
              (click)="$event.stopPropagation()"
              (change)="toggleChecked(node)"
            />
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
      padding-right: var(--kp-tree-pad-x);
      border-radius: 6px;
      font-size: var(--kp-tree-fs);
      color: var(--kp-color-tree-node-fg-rest, #18181B);
      cursor: pointer;
      user-select: none;
      transition: background 80ms ease;
    }
    .kp-tree__row:hover:not(.kp-tree__row--selected):not(.kp-tree__row--disabled) {
      background: var(--kp-color-tree-node-bg-hover, #FAFAFA);
    }
    .kp-tree__row--selected {
      background: var(--kp-color-tree-node-bg-selected, #EFF6FF);
      color: var(--kp-color-tree-node-fg-selected, #1D4ED8);
      font-weight: 500;
    }
    .kp-tree__row--disabled {
      color: var(--kp-color-tree-node-fg-disabled, #A1A1AA);
      cursor: not-allowed;
    }

    .kp-tree__chevron {
      all: unset;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      color: var(--kp-color-tree-node-chevron, #71717A);
      cursor: pointer;
      transition: transform 120ms ease;
      flex: 0 0 auto;
    }
    .kp-tree__chevron--expanded { transform: rotate(90deg); }
    .kp-tree__chevron--placeholder { cursor: default; }

    .kp-tree__checkbox {
      width: 14px;
      height: 14px;
      margin: 0;
      accent-color: var(--kp-color-blue-600, #2563EB);
      flex: 0 0 auto;
    }

    .kp-tree__icon {
      display: inline-flex;
      color: var(--kp-color-tree-node-icon-rest, #52525B);
      flex: 0 0 auto;
    }
    .kp-tree__row--selected .kp-tree__icon {
      color: var(--kp-color-tree-node-icon-selected, #2563EB);
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
      background: var(--kp-color-gray-100, #F4F4F5);
      color: var(--kp-color-gray-700, #3F3F46);
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

  private readonly cdr = inject(ChangeDetectorRef);

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
    this.selectedChange.emit(node.id);
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
