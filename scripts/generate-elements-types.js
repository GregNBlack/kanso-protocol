#!/usr/bin/env node
/**
 * generate-elements-types — emit TypeScript/tooling metadata for the
 * @kanso-protocol/elements custom-elements bundle.
 *
 * Produces two artifacts from the `kp-*` element-selector components in
 * packages/ui:
 *
 *   1. packages/elements/custom-elements.json
 *      A Custom Elements Manifest (schemaVersion 1.0.0, the subset tools
 *      actually read): one module/declaration per tag, listing attributes,
 *      JS properties, and events with their coarse types + defaults. IDEs,
 *      vue-tsc / Volar, and web-component tooling consume this for
 *      autocomplete + hover docs.
 *
 *   2. packages/elements/src/jsx.generated.d.ts
 *      A `declare global { namespace JSX }` augmentation with one typed
 *      entry per tag, so `<kp-select size="md" />` type-checks in a
 *      React/TSX project instead of erroring as an unknown element. String
 *      -literal union inputs (KpSize, KpBadgeAppearance, …) are expanded
 *      inline as `'sm' | 'md' | (string & {})` — literal autocomplete while
 *      still accepting any string (attributes are strings). build-elements.js
 *      folds this into the shipped kanso-elements.d.ts.
 *
 * Regex-based (every component uses classic `@Input()/@Output()` decorators,
 * no signal inputs) and dependency-free, matching the style of the sibling
 * generate-elements-registry.js.
 *
 * Run standalone (`node scripts/generate-elements-types.js`) or as step 1.5
 * of build-elements.js.
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const UI = path.join(ROOT, 'packages', 'ui');
const CEM_OUT = path.join(ROOT, 'packages', 'elements', 'custom-elements.json');
const JSX_OUT = path.join(ROOT, 'packages', 'elements', 'src', 'jsx.generated.d.ts');
const SKIP = new Set(['src', 'styles', 'stories']);

// ─── 1. Collect string-literal-union type aliases across the library ─────
// Lets us expand `@Input() size: KpSize` into its literal members instead of
// degrading to `string`, so JSX autocomplete lists the real options.

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
          // Normalize whitespace and strip a leading `|` (common multiline
          // union style: `= \n | 'a' \n | 'b'`).
          const rhs = rhsRaw.replace(/\s+/g, ' ').replace(/^\|\s*/, '').trim();
          // Only keep pure unions of string literals ('a' | 'b' | 'c').
          if (/^'(?:[^']*)'(?:\s*\|\s*'(?:[^']*)')*$/.test(rhs)) map.set(name, rhs);
        }
      }
    }
  };
  walk(UI);
  return map;
}

// ─── 2. Classify an @Input type into JSX + CEM shapes ────────────────────

function classifyType(rawType, defaultVal, aliases) {
  const t = (rawType || '').replace(/\s+/g, ' ').trim();
  // A nullable named alias (`KpState | null`) resolves to the alias union
  // plus null; strip the null/undefined tail for the lookup.
  const nullable = /\|\s*(null|undefined)\b/.test(t);
  const bare = t.replace(/\s*\|\s*(null|undefined)\b/g, '').trim();

  // Named string-literal union alias → expand inline (open-ended).
  const aliasName = aliases.has(t) ? t : aliases.has(bare) ? bare : null;
  if (aliasName) {
    const union = `${aliases.get(aliasName)} | (string & {})${nullable ? ' | null' : ''}`;
    return { jsx: union, cem: aliases.get(aliasName), attribute: true };
  }
  // Inline string-literal union written directly on the input.
  if (/^'(?:[^']*)'(?:\s*\|\s*'(?:[^']*)')*(\s*\|\s*null)?$/.test(t)) {
    return { jsx: `${t} | (string & {})`, cem: t, attribute: true };
  }
  // Object / array inputs — property-only (attributes can only carry strings).
  if (/[[\]{}]/.test(t) || /^[A-Z]\w*(\[\])?$/.test(t) && !aliases.has(t) && t !== 'Date') {
    // Capitalized non-union type (interface/array) that we can't resolve here.
    if (/[[\]{}]/.test(t) || /^[A-Z]/.test(t)) {
      return { jsx: 'any', cem: t || 'object', attribute: false };
    }
  }
  // Primitive / simple unions we can pass through verbatim.
  if (/boolean/.test(t) || defaultVal === 'true' || defaultVal === 'false') {
    return { jsx: 'boolean | "true" | "false"', cem: 'boolean', attribute: true };
  }
  if (/\bnumber\b/.test(t)) return { jsx: 'number | string', cem: 'number', attribute: true };
  if (/\bstring\b/.test(t)) return { jsx: 'string', cem: 'string', attribute: true };
  // No annotation — infer from the default initializer.
  if (defaultVal !== undefined) {
    if (defaultVal === 'true' || defaultVal === 'false') return { jsx: 'boolean | "true" | "false"', cem: 'boolean', attribute: true };
    if (/^-?\d/.test(defaultVal)) return { jsx: 'number | string', cem: 'number', attribute: true };
    if (/^['"]/.test(defaultVal)) return { jsx: 'string', cem: 'string', attribute: true };
    if (defaultVal === '[]' || defaultVal.startsWith('[')) return { jsx: 'any', cem: 'array', attribute: false };
  }
  return { jsx: 'string', cem: 'string', attribute: true };
}

// ─── 3. Parse a component class body for @Input()/@Output() members ──────

function parseMembers(body) {
  const inputs = [];
  const outputs = [];
  // @Input() [readonly] name[: Type] [= default];
  const inRe = /@Input\(\s*(?:'[^']*'|"[^"]*")?\s*\)\s*(?:readonly\s+)?(\w+)\s*(?::\s*([^;=]+?))?\s*(?:=\s*([^;]+?))?\s*;/g;
  let m;
  while ((m = inRe.exec(body))) {
    const [, name, type, def] = m;
    inputs.push({ name, type: type && type.trim(), default: def && def.trim() });
  }
  // @Output() [readonly] name = new EventEmitter<T>();
  const outRe = /@Output\(\s*(?:'[^']*'|"[^"]*")?\s*\)\s*(?:readonly\s+)?(\w+)\s*=\s*new\s+EventEmitter<([^>]*)>/g;
  while ((m = outRe.exec(body))) {
    outputs.push({ name: m[1], detail: (m[2] || '').trim() || 'unknown' });
  }
  return { inputs, outputs };
}

// ─── 4. Walk element components ──────────────────────────────────────────

function collectElements(aliases) {
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
        // Class body = from the matched class to the next `export class` or EOF.
        const start = m.index + m[0].length;
        const rest = txt.slice(start);
        const nextCls = rest.search(/\nexport class \w+/);
        const body = nextCls === -1 ? rest : rest.slice(0, nextCls);
        const { inputs, outputs } = parseMembers(body);
        els.push({ tag: sel, cls, entry: dir, inputs, outputs });
      }
    }
  }
  els.sort((a, b) => a.tag.localeCompare(b.tag));
  return els;
}

// ─── 5. Emit Custom Elements Manifest ────────────────────────────────────

function emitCem(els, aliases) {
  const modules = els.map((e) => {
    const attributes = [];
    const members = [];
    for (const i of e.inputs) {
      const c = classifyType(i.type, i.default, aliases);
      const decl = { kind: 'field', name: i.name, type: { text: c.cem } };
      if (i.default !== undefined) decl.default = i.default;
      members.push(decl);
      if (c.attribute) attributes.push({ name: i.name, type: { text: c.cem }, fieldName: i.name });
    }
    const events = e.outputs.map((o) => ({ name: o.name, type: { text: `CustomEvent<${o.detail}>` } }));
    return {
      kind: 'javascript-module',
      path: `packages/ui/${e.entry}/src`,
      declarations: [
        {
          kind: 'class',
          customElement: true,
          tagName: e.tag,
          name: e.cls,
          attributes,
          members,
          events,
        },
      ],
      exports: [{ kind: 'custom-element-definition', name: e.tag, declaration: { name: e.cls } }],
    };
  });
  return JSON.stringify(
    {
      schemaVersion: '1.0.0',
      readme: 'AUTO-GENERATED by scripts/generate-elements-types.js — do not edit.',
      modules,
    },
    null,
    2,
  );
}

// ─── 6. Emit JSX augmentation .d.ts ──────────────────────────────────────

function emitJsx(els, aliases) {
  const ifaces = els.map((e) => {
    const props = e.inputs.map((i) => {
      const c = classifyType(i.type, i.default, aliases);
      return `    ${/^[a-zA-Z_$][\w$]*$/.test(i.name) ? i.name : `'${i.name}'`}?: ${c.jsx};`;
    });
    const name = `${e.cls}Jsx`;
    return `  interface ${name} extends KpElementBaseAttributes {\n${props.join('\n')}\n  }`;
  });
  const map = els.map((e) => `      '${e.tag}': ${e.cls}Jsx;`).join('\n');
  return `// AUTO-GENERATED by scripts/generate-elements-types.js — do not edit.
// Importing '@kanso-protocol/elements' brings these into scope so <kp-*>
// elements type-check in a TSX/React project. Attributes are strings, so
// string-union inputs accept their literal members OR any string.
//
// Event outputs are documented in custom-elements.json (React <=18 wires
// them via addEventListener; React 19 supports on<event> props) and are not
// emitted here to avoid misleading handler typings.

// Minimal, framework-neutral base — avoids depending on React's types so the
// augmentation also works under the classic JSX runtime and other libraries.
interface KpElementBaseAttributes {
  id?: string;
  class?: string;
  className?: string;
  slot?: string;
  part?: string;
  style?: string | Record<string, string | number>;
  title?: string;
  hidden?: boolean;
  tabIndex?: number;
  role?: string;
  children?: unknown;
  key?: string | number;
  ref?: unknown;
  [dataAttr: \`data-\${string}\`]: unknown;
  [ariaAttr: \`aria-\${string}\`]: unknown;
}

declare global {
${ifaces.join('\n')}

  namespace JSX {
    interface IntrinsicElements {
${map}
    }
  }
}

export {};
`;
}

// ─── main ────────────────────────────────────────────────────────────────

const aliases = collectUnionAliases();
const els = collectElements(aliases);

fs.mkdirSync(path.dirname(CEM_OUT), { recursive: true });
fs.writeFileSync(CEM_OUT, emitCem(els, aliases) + '\n');
fs.mkdirSync(path.dirname(JSX_OUT), { recursive: true });
fs.writeFileSync(JSX_OUT, emitJsx(els, aliases));

const attrs = els.reduce((n, e) => n + e.inputs.length, 0);
const evts = els.reduce((n, e) => n + e.outputs.length, 0);
console.log(
  `elements types: ${els.length} custom elements, ${attrs} inputs, ${evts} events\n` +
    `  → ${path.relative(ROOT, CEM_OUT)}\n` +
    `  → ${path.relative(ROOT, JSX_OUT)}`,
);
