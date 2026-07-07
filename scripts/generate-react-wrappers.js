#!/usr/bin/env node
/**
 * generate-react-wrappers — emit typed React wrappers over the Kanso
 * `<kp-*>` custom elements (@kanso-protocol/react, Tier-4 DX).
 *
 * React ≤ 18 passes unknown JSX props to a custom element as *attributes*
 * (strings), so object/array `@Input`s serialize to `[object Object]` and
 * `@Output` DOM events have no `on…`-prop path. The documented workaround
 * (docs/web-components.md) is a per-element `useRef` + `useEffect` +
 * `addEventListener` recipe. This script bakes that recipe into one typed
 * `React.forwardRef` component per element so React consumers get ergonomic,
 * type-checked `<KpSelect size="md" onOpenChange={…} />` usage.
 *
 * Output: packages/react/src/index.tsx
 *   - one `KpXxx` component + `KpXxxProps` interface per `kp-*` element
 *   - primitive/string/boolean inputs → element attributes (via JSX)
 *   - object/array inputs → JS properties (set through a ref in useEffect)
 *   - each `@Output() foo` → an `onFoo` prop wired via add/removeEventListener,
 *     passing `event.detail` through a typed `CustomEvent<Detail>`
 *
 * The element + @Input/@Output extraction and the union/type resolution are
 * shared with generate-elements-types.js (regex-based, dependency-free — every
 * component uses classic `@Input()/@Output()` decorators, no signal inputs).
 *
 * Run standalone (`node scripts/generate-react-wrappers.js`) or as step 1 of
 * packages/react/build.mjs (`npm run build:react`).
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const UI = path.join(ROOT, 'packages', 'ui');
const OUT = path.join(ROOT, 'packages', 'react', 'src', 'index.tsx');
const SKIP = new Set(['src', 'styles', 'stories']);

// ─── 1. Collect string-literal-union type aliases across the library ─────
// (shared with generate-elements-types.js) — lets us expand `@Input() size:
// KpSize` into its literal members instead of degrading to `string`, so the
// React prop types list the real options.

function collectUnionAliases() {
  const map = new Map(); // Name -> "'a' | 'b'"
  const re = /export\s+type\s+(\w+)\s*=\s*([^;]+);/g;
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'node_modules') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.ts')) {
        const txt = fs.readFileSync(full, 'utf8');
        let m;
        while ((m = re.exec(txt))) {
          const [, name, rhsRaw] = m;
          const rhs = rhsRaw.replace(/\s+/g, ' ').replace(/^\|\s*/, '').trim();
          if (/^'(?:[^']*)'(?:\s*\|\s*'(?:[^']*)')*$/.test(rhs)) map.set(name, rhs);
        }
      }
    }
  };
  walk(UI);
  return map;
}

// ─── 2. Classify an @Input type into a React prop type + kind ────────────
// (shared with generate-elements-types.js). `attribute: true` → primitive
// that React can set as an attribute; `attribute: false` → object/array that
// must be assigned as a JS property.

function classifyType(rawType, defaultVal, aliases) {
  const t = (rawType || '').replace(/\s+/g, ' ').trim();
  const nullable = /\|\s*(null|undefined)\b/.test(t);
  const bare = t.replace(/\s*\|\s*(null|undefined)\b/g, '').trim();

  const aliasName = aliases.has(t) ? t : aliases.has(bare) ? bare : null;
  if (aliasName) {
    const union = `${aliases.get(aliasName)} | (string & {})${nullable ? ' | null' : ''}`;
    return { jsx: union, attribute: true };
  }
  if (/^'(?:[^']*)'(?:\s*\|\s*'(?:[^']*)')*(\s*\|\s*null)?$/.test(t)) {
    return { jsx: `${t} | (string & {})`, attribute: true };
  }
  if (/[[\]{}]/.test(t) || (/^[A-Z]\w*(\[\])?$/.test(t) && !aliases.has(t) && t !== 'Date')) {
    if (/[[\]{}]/.test(t) || /^[A-Z]/.test(t)) {
      return { jsx: 'unknown', attribute: false };
    }
  }
  if (/boolean/.test(t) || defaultVal === 'true' || defaultVal === 'false') {
    return { jsx: 'boolean | "true" | "false"', attribute: true };
  }
  if (/\bnumber\b/.test(t)) return { jsx: 'number | string', attribute: true };
  if (/\bstring\b/.test(t)) return { jsx: 'string', attribute: true };
  if (defaultVal !== undefined) {
    if (defaultVal === 'true' || defaultVal === 'false')
      return { jsx: 'boolean | "true" | "false"', attribute: true };
    if (/^-?\d/.test(defaultVal)) return { jsx: 'number | string', attribute: true };
    if (/^['"]/.test(defaultVal)) return { jsx: 'string', attribute: true };
    if (defaultVal === '[]' || defaultVal.startsWith('[')) return { jsx: 'unknown', attribute: false };
  }
  return { jsx: 'string', attribute: true };
}

// ─── 3. Resolve an @Output() EventEmitter<Detail> generic into a safe TS
//        type usable inside CustomEvent<…> without importing UI types.
// Primitives, global DOM types (MouseEvent, Event, …), string-literal-union
// aliases and simple unions/arrays thereof are kept; anything referencing an
// un-importable UI interface, a generic type param (`T`), an object literal or
// a function type falls back to `unknown` (so `event.detail` stays sound).

const PRIMITIVE_TYPES = new Set([
  'boolean', 'string', 'number', 'null', 'undefined', 'any', 'unknown',
  'void', 'object', 'symbol', 'bigint', 'true', 'false',
]);
const GLOBAL_TYPES = new Set([
  'Event', 'UIEvent', 'MouseEvent', 'KeyboardEvent', 'FocusEvent', 'InputEvent',
  'PointerEvent', 'TouchEvent', 'DragEvent', 'WheelEvent', 'ClipboardEvent',
  'CustomEvent', 'File', 'Blob', 'Date', 'Element', 'HTMLElement', 'Node',
]);

function isSafeTypeToken(tok, aliases) {
  const t = tok.trim().replace(/\[\]$/, '');
  if (t === '') return false;
  if (PRIMITIVE_TYPES.has(t) || GLOBAL_TYPES.has(t) || aliases.has(t)) return true;
  if (/^'(?:[^']*)'$/.test(t)) return true; // string literal
  if (/^-?\d+(?:\.\d+)?$/.test(t)) return true; // numeric literal
  return false;
}

function resolveEventDetail(raw, aliases) {
  const t = (raw || '').replace(/\s+/g, ' ').trim();
  if (!t) return 'unknown';
  if (aliases.has(t)) return aliases.get(t);
  if (/[{}<>()]/.test(t)) return 'unknown'; // object / generic / function type
  const parts = t.split('|').map((s) => s.trim());
  if (!parts.every((p) => isSafeTypeToken(p, aliases))) return 'unknown';
  return parts
    .map((p) => {
      const arr = p.endsWith('[]');
      const bare = p.replace(/\[\]$/, '');
      return (aliases.has(bare) ? aliases.get(bare) : bare) + (arr ? '[]' : '');
    })
    .join(' | ');
}

// ─── 4. Parse a component class body for @Input()/@Output() members ──────
// (shared with generate-elements-types.js).

function parseMembers(body) {
  const inputs = [];
  const outputs = [];
  const inRe =
    /@Input\(\s*(?:'[^']*'|"[^"]*")?\s*\)\s*(?:readonly\s+)?(\w+)\s*(?::\s*([^;=]+?))?\s*(?:=\s*([^;]+?))?\s*;/g;
  let m;
  while ((m = inRe.exec(body))) {
    const [, name, type, def] = m;
    inputs.push({ name, type: type && type.trim(), default: def && def.trim() });
  }
  const outRe =
    /@Output\(\s*(?:'[^']*'|"[^"]*")?\s*\)\s*(?:readonly\s+)?(\w+)\s*=\s*new\s+EventEmitter<([^>]*)>/g;
  while ((m = outRe.exec(body))) {
    outputs.push({ name: m[1], detail: (m[2] || '').trim() || 'unknown' });
  }
  return { inputs, outputs };
}

// ─── 5. Walk element components ──────────────────────────────────────────
// (shared with generate-elements-types.js). Class names → `Kp<Name>` React
// component names by stripping the trailing `Component`.

function collectElements() {
  const els = [];
  for (const dir of fs.readdirSync(UI).sort()) {
    if (SKIP.has(dir)) continue;
    const srcDir = path.join(UI, dir, 'src');
    if (!fs.existsSync(srcDir)) continue;
    for (const f of fs.readdirSync(srcDir)) {
      if (!f.endsWith('.component.ts')) continue;
      const txt = fs.readFileSync(path.join(srcDir, f), 'utf8');
      const cmp = /@Component\(\{[\s\S]*?selector:\s*['"]([^'"]+)['"][\s\S]*?\}\)\s*export class (\w+)/g;
      let m;
      while ((m = cmp.exec(txt))) {
        const [, sel, cls] = m;
        if (!/^kp-[a-z0-9-]+$/.test(sel)) continue; // element selectors only
        const start = m.index + m[0].length;
        const rest = txt.slice(start);
        const nextCls = rest.search(/\nexport class \w+/);
        const body = nextCls === -1 ? rest : rest.slice(0, nextCls);
        const { inputs, outputs } = parseMembers(body);
        // KpSelectComponent → KpSelect (drop the Angular `Component` suffix).
        const comp = cls.replace(/Component$/, '');
        els.push({ tag: sel, cls, comp, entry: dir, inputs, outputs });
      }
    }
  }
  els.sort((a, b) => a.tag.localeCompare(b.tag));
  return els;
}

// ─── 6. Emit the React wrappers ──────────────────────────────────────────

// Members declared on KpCommonProps — a generated prop with the same name and
// an incompatible type would make `extends KpCommonProps` illegal, so those
// keys are `Omit`ted from the base for that component.
const BASE_KEYS = new Set([
  'children', 'className', 'id', 'slot', 'style', 'title', 'role', 'tabIndex',
  'hidden', 'onClick',
]);

const ident = (name) => (/^[a-zA-Z_$][\w$]*$/.test(name) ? name : `'${name}'`);
const onName = (name) => `on${name.charAt(0).toUpperCase()}${name.slice(1)}`;

function emit(els, aliases) {
  const blocks = els.map((e) => {
    const memberNames = new Set();
    const lines = [];

    // Inputs → attribute props (primitive) or property props (object/array).
    const properties = []; // input names set as JS properties
    for (const i of e.inputs) {
      const c = classifyType(i.type, i.default, aliases);
      if (!c.attribute) properties.push(i.name);
      memberNames.add(i.name);
      lines.push(`  ${ident(i.name)}?: ${c.jsx};`);
    }

    // Outputs → onXxx CustomEvent handler props.
    const events = []; // { react, dom }
    for (const o of e.outputs) {
      const react = onName(o.name);
      events.push({ react, dom: o.name });
      memberNames.add(react);
      const detail = resolveEventDetail(o.detail, aliases);
      lines.push(`  ${ident(react)}?: KpEventHandler<${detail}>;`);
    }

    const collisions = [...memberNames].filter((n) => BASE_KEYS.has(n));
    const base = collisions.length
      ? `Omit<KpCommonProps, ${collisions.sort().map((c) => `'${c}'`).join(' | ')}>`
      : 'KpCommonProps';

    const iface =
      `export interface ${e.comp}Props extends ${base} {\n${lines.join('\n')}\n}`;

    const eventsMeta = events.length
      ? `{ ${events.map((ev) => `${ident(ev.react)}: '${ev.dom}'`).join(', ')} }`
      : '{}';
    const propsMeta = properties.length
      ? `[${properties.map((p) => `'${p}'`).join(', ')}]`
      : '[]';

    const comp =
      `export const ${e.comp}: KpComponent<${e.comp}Props> =\n` +
      `  /*#__PURE__*/ createKpWrapper<${e.comp}Props>('${e.tag}', {\n` +
      `    events: ${eventsMeta},\n` +
      `    properties: ${propsMeta},\n` +
      `  });`;

    return `${iface}\n\n${comp}`;
  });

  const totalInputs = els.reduce((n, e) => n + e.inputs.length, 0);
  const totalOutputs = els.reduce((n, e) => n + e.outputs.length, 0);

  return `// AUTO-GENERATED by scripts/generate-react-wrappers.js — do not edit.
// Typed React wrappers over the @kanso-protocol/elements <kp-*> custom
// elements: ${els.length} components, ${totalInputs} inputs, ${totalOutputs} events.
//
// React <=18 passes unknown JSX props to a custom element as string
// attributes and has no on<event> path, so object/array inputs and DOM events
// need a ref + useEffect (see docs/web-components.md). These wrappers bake
// that in: primitive inputs are set as attributes (via JSX), object/array
// inputs as JS properties (through a ref), and each @Output() foo is exposed
// as an onFoo prop wired via add/removeEventListener with event.detail typed.
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';

// Side-effect import: defines every <kp-*> custom element on load. At runtime
// this is the consumer's peer dependency; the in-repo build resolves it via
// the ambient fallback in ./elements-shim.d.ts (the real types ship with the
// installed package).
import '@kanso-protocol/elements';

/** Handler for a Kanso @Output() — receives the DOM CustomEvent whose
 *  detail is the emitted value. */
export type KpEventHandler<T> = (event: CustomEvent<T>) => void;

/** Props common to every Kanso React wrapper. Standard host attributes plus
 *  data-/aria-* pass-through; deliberately no string index signature, so an
 *  unknown prop is a type error. */
export interface KpCommonProps {
  children?: React.ReactNode;
  className?: string;
  id?: string;
  slot?: string;
  style?: React.CSSProperties;
  title?: string;
  role?: React.AriaRole;
  tabIndex?: number;
  hidden?: boolean;
  onClick?: React.MouseEventHandler<HTMLElement>;
  [dataAttr: \`data-\${string}\`]: unknown;
  [ariaAttr: \`aria-\${string}\`]: unknown;
}

/** A generated wrapper: a forwardRef component whose ref is the underlying
 *  custom element (an HTMLElement). */
export type KpComponent<P> = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<P> & React.RefAttributes<HTMLElement>
>;

interface KpWrapperMeta {
  /** React on<Event> prop name → DOM event name (the @Output() property). */
  readonly events: Readonly<Record<string, string>>;
  /** Input names that must be assigned as JS properties (object/array). */
  readonly properties: readonly string[];
}

function assignRef(ref: React.Ref<HTMLElement> | undefined, value: HTMLElement | null): void {
  if (typeof ref === 'function') ref(value);
  else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = value;
}

/** Build one typed forwardRef wrapper for a \`kp-*\` custom element. */
function createKpWrapper<P extends KpCommonProps>(tag: string, meta: KpWrapperMeta): KpComponent<P> {
  const eventEntries = Object.entries(meta.events); // [reactProp, domEvent][]
  const propertyNames = meta.properties;

  const Wrapper = React.forwardRef<HTMLElement, P>(function KpWrapper(props, forwardedRef) {
    const elRef = React.useRef<HTMLElement | null>(null);
    // Latest event handlers, keyed by DOM event, read by the listeners below
    // so we subscribe once and always dispatch to the current handler.
    const handlersRef = React.useRef<Record<string, ((e: Event) => void) | undefined>>({});

    const record = props as Record<string, unknown>;
    const attributes: Record<string, unknown> = {};
    const handlers: Record<string, ((e: Event) => void) | undefined> = {};
    let children: React.ReactNode;

    for (const key in record) {
      if (key === 'children') {
        children = record[key] as React.ReactNode;
        continue;
      }
      const domEvent = meta.events[key];
      if (domEvent) {
        handlers[domEvent] = record[key] as ((e: Event) => void) | undefined;
        continue;
      }
      if (propertyNames.indexOf(key) !== -1) continue; // object/array → set as property below
      attributes[key] = record[key];
    }
    handlersRef.current = handlers;

    // Stable, up-to-date deps for the property effect (constant length).
    const propertyDeps = propertyNames.map((name) => record[name]);

    const setRef = React.useCallback(
      (node: HTMLElement | null) => {
        elRef.current = node;
        assignRef(forwardedRef, node);
      },
      [forwardedRef],
    );

    // Object/array inputs → JS properties (attributes can only carry strings).
    // Only write props that were actually passed, so element defaults survive.
    React.useEffect(() => {
      const el = elRef.current;
      if (!el) return;
      const target = el as unknown as Record<string, unknown>;
      for (const name of propertyNames) {
        if (name in record) target[name] = record[name];
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, propertyDeps);

    // @Output() events → DOM CustomEvents. Subscribe once on mount; each
    // listener dispatches to the latest handler via handlersRef.
    React.useEffect(() => {
      const el = elRef.current;
      if (!el || eventEntries.length === 0) return;
      const bound = eventEntries.map(([, domEvent]) => {
        const listener = (event: Event) => {
          const handler = handlersRef.current[domEvent];
          if (handler) handler(event);
        };
        el.addEventListener(domEvent, listener);
        return [domEvent, listener] as const;
      });
      return () => {
        for (const [domEvent, listener] of bound) el.removeEventListener(domEvent, listener);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return React.createElement(tag, { ...attributes, ref: setRef }, children);
  });

  Wrapper.displayName = tag;
  return Wrapper as KpComponent<P>;
}

${blocks.join('\n\n')}
`;
}

// ─── main ────────────────────────────────────────────────────────────────

const aliases = collectUnionAliases();
const els = collectElements();

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, emit(els, aliases));

const inputs = els.reduce((n, e) => n + e.inputs.length, 0);
const outputs = els.reduce((n, e) => n + e.outputs.length, 0);
console.log(
  `react wrappers: ${els.length} components, ${inputs} inputs, ${outputs} events\n` +
    `  → ${path.relative(ROOT, OUT)}`,
);
