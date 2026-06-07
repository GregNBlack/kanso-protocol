#!/usr/bin/env node
/**
 * Generate `packages/mcp/manifest.json` by walking packages/**‎/src,
 * parsing every `*.component.ts` with ts-morph, and extracting the
 * metadata AI agents need to author Kanso UI: selector, description,
 * inputs/outputs (name + type + default), ARIA role, size ramp.
 *
 * Also folds in design tokens parsed from the built `tokens.css` so
 * agents can look up color / spacing / motion values by name.
 *
 * Run manually via `node scripts/generate-mcp-manifest.js`, or let the
 * `prebuild` hook on @kanso-protocol/mcp trigger it automatically.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Project, SyntaxKind } from 'ts-morph';

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), '..');
const OUT = path.join(ROOT, 'packages', 'mcp', 'manifest.json');

/** Convert `kp-button` → "Button", `@kanso-protocol/form-field` → "FormField". */
function humanize(slug) {
  return slug
    .replace(/^@kanso-protocol\//, '')
    .replace(/^kp-/, '')
    .split('-')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join('');
}

function pickJsDoc(node) {
  const docs = node.getJsDocs();
  if (!docs.length) return { description: '', examples: [] };
  const doc = docs[docs.length - 1];
  const description = doc.getDescription().trim();
  const examples = doc
    .getTags()
    .filter((t) => t.getTagName() === 'example')
    .map((t) => (t.getCommentText() ?? '').trim())
    .filter(Boolean);
  return { description, examples };
}

function readDecoratorArg(cls) {
  // Accept both @Component and @Directive — directive-driven primitives
  // (e.g. KpTooltipDirective) are the public surface for some packages.
  const dec = cls.getDecorator('Component') || cls.getDecorator('Directive');
  if (!dec) return null;
  const arg = dec.getArguments()[0];
  if (!arg || arg.getKind() !== SyntaxKind.ObjectLiteralExpression) return null;
  return arg;
}

function readStringProp(obj, name) {
  const prop = obj?.getProperty(name);
  if (!prop || prop.getKind() !== SyntaxKind.PropertyAssignment) return null;
  const init = prop.getInitializer();
  if (!init) return null;
  if (init.getKind() === SyntaxKind.StringLiteral) return init.getLiteralText();
  if (init.getKind() === SyntaxKind.NoSubstitutionTemplateLiteral) return init.getLiteralText();
  return init.getText();
}

function readHostRoleAttr(obj) {
  const hostProp = obj?.getProperty('host');
  if (!hostProp || hostProp.getKind() !== SyntaxKind.PropertyAssignment) return null;
  const hostObj = hostProp.getInitializer();
  if (!hostObj || hostObj.getKind() !== SyntaxKind.ObjectLiteralExpression) return null;
  for (const p of hostObj.getProperties()) {
    if (p.getKind() !== SyntaxKind.PropertyAssignment) continue;
    const nameNode = p.getNameNode();
    const key = nameNode.getText().replace(/^['"`]|['"`]$/g, '');
    if (key !== '[attr.role]') continue;
    const init = p.getInitializer();
    // Expected form: '"dialog"' — the attribute value is a literal wrapped in quotes.
    const raw = init.getText();
    const m = raw.match(/^['"`]["'](\w+)["']['"`]$/);
    return m ? m[1] : null;
  }
  return null;
}

function typeText(prop) {
  const typeNode = prop.getTypeNode();
  if (typeNode) return typeNode.getText();
  return prop.getType().getText();
}

function defaultValue(prop) {
  const init = prop.getInitializer();
  if (!init) return null;
  return init.getText();
}

function extractInputs(cls) {
  const out = [];
  for (const prop of cls.getProperties()) {
    const dec = prop.getDecorator('Input');
    if (!dec) continue;
    const docText = prop.getJsDocs().map((d) => d.getDescription().trim()).filter(Boolean).join(' ');
    out.push({
      name: prop.getName(),
      type: typeText(prop).trim(),
      default: defaultValue(prop),
      description: docText,
    });
  }
  return out;
}

function extractOutputs(cls) {
  const out = [];
  for (const prop of cls.getProperties()) {
    const dec = prop.getDecorator('Output');
    if (!dec) continue;
    const t = typeText(prop).trim();
    // "EventEmitter<Foo>" → "Foo"
    const m = t.match(/EventEmitter<\s*(.+)\s*>/);
    out.push({
      name: prop.getName(),
      payload: m ? m[1] : 'unknown',
    });
  }
  return out;
}

/**
 * Naïve but useful: detect components whose source mentions WAI-ARIA keyboard
 * key names. Lets agents tell "does kp-tabs support arrow keys?" without us
 * hand-writing a table for every component.
 */
function detectKeyboardPatterns(sourceText) {
  const keys = [];
  const scan = [
    ['ArrowRight', 'ArrowRight'],
    ['ArrowLeft',  'ArrowLeft'],
    ['ArrowUp',    'ArrowUp'],
    ['ArrowDown',  'ArrowDown'],
    ['Home',       /'Home'|"Home"/],
    ['End',        /'End'|"End"/],
    ['PageUp',     'PageUp'],
    ['PageDown',   'PageDown'],
    ['Enter',      /'Enter'|"Enter"/],
    ['Escape',     /Escape|keydown\.escape/],
    ['Space',      / ' '| " "|'Space'/],
    ['Backspace',  'Backspace'],
  ];
  for (const [key, needle] of scan) {
    const re = needle instanceof RegExp ? needle : new RegExp(needle);
    if (re.test(sourceText)) keys.push(key);
  }
  return keys;
}

function extractSizes(cls) {
  // Look for the `size` input's type annotation to enumerate the ramp.
  for (const prop of cls.getProperties()) {
    if (prop.getName() !== 'size') continue;
    const t = typeText(prop).trim();
    // Common shapes: KpSize (alias), 'sm' | 'md' | 'lg', union literal.
    const literals = Array.from(t.matchAll(/'([^']+)'/g)).map((m) => m[1]);
    if (literals.length) return literals;
    // Resolve alias via symbol
    const type = prop.getType();
    if (type.isUnion()) {
      return type
        .getUnionTypes()
        .map((ut) => ut.isStringLiteral() ? ut.getLiteralValue() : null)
        .filter(Boolean);
    }
    return [];
  }
  return [];
}

function storybookUrl(layer, slug) {
  // Matches our Storybook routing: Components/Accordion → components-accordion--docs.
  return `https://gregnblack.github.io/kanso-protocol/?path=/docs/${layer}-${slug.replace(/-/g, '')}--docs`;
}

// Derive the layer (components | patterns) from the entry's story title
// (`title: 'Components/Button'` / `'Patterns/Sidebar'`). Single-package
// layout no longer encodes layer in the folder path. Defaults to
// 'components' when there's no story.
function layerFromStory(entryDir) {
  const storiesDir = path.join(entryDir, 'stories');
  if (!fs.existsSync(storiesDir)) return 'components';
  for (const f of fs.readdirSync(storiesDir)) {
    if (!f.endsWith('.stories.ts')) continue;
    const m = fs.readFileSync(path.join(storiesDir, f), 'utf8').match(/title:\s*['"]([^/'"]+)\//);
    if (m) return m[1].toLowerCase() === 'patterns' ? 'patterns' : 'components';
  }
  return 'components';
}

// Scan the single packages/ui tree — one entry point per subfolder.
function walkComponents(project, _unusedLayer, dir) {
  const items = [];
  if (!fs.existsSync(dir)) return items;
  const SKIP = new Set(['src', 'styles', 'stories']);
  for (const slug of fs.readdirSync(dir)) {
    if (SKIP.has(slug)) continue;
    const entryDir = path.join(dir, slug);
    const srcDir = path.join(entryDir, 'src');
    if (!fs.statSync(entryDir).isDirectory()) continue;
    if (!fs.existsSync(srcDir)) continue;
    const layer = layerFromStory(entryDir);
    for (const f of fs.readdirSync(srcDir)) {
      // Scan public component + directive files. Skip *-internal.* files —
      // those render visual chrome that's never exposed as a public symbol.
      const isPublic = (f.endsWith('.component.ts') || f.endsWith('.directive.ts')) &&
        !f.includes('-internal.');
      if (!isPublic) continue;
      const sf = project.addSourceFileAtPathIfExists(path.join(srcDir, f));
      if (!sf) continue;
      const sourceText = sf.getFullText();
      for (const cls of sf.getClasses()) {
        const decoratorArgs = readDecoratorArg(cls);
        if (!decoratorArgs) continue; // Not a @Component
        const selector = readStringProp(decoratorArgs, 'selector');
        if (!selector) continue;
        const { description, examples } = pickJsDoc(cls);
        items.push({
          name: slug,
          className: cls.getName(),
          selector,
          layer,
          package: '@kanso-protocol/ui',
          import: `@kanso-protocol/ui/${slug}`,
          description,
          examples,
          inputs: extractInputs(cls),
          outputs: extractOutputs(cls),
          ariaRole: readHostRoleAttr(decoratorArgs),
          sizeRamp: extractSizes(cls),
          keyboardPatterns: detectKeyboardPatterns(sourceText),
          docsUrl: storybookUrl(layer, slug),
          sourcePath: path.relative(ROOT, sf.getFilePath()),
        });
      }
    }
  }
  return items;
}

function parseTokens() {
  const tokensCss = path.join(ROOT, 'packages', 'ui', 'styles', 'tokens.css');
  if (!fs.existsSync(tokensCss)) return [];
  const src = fs.readFileSync(tokensCss, 'utf8');
  const out = [];
  // Match declarations like `--kp-color-blue-600: #2563eb;` anywhere.
  const re = /--kp-([a-z0-9-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const name = m[1];
    const value = m[2].trim();
    const [category, ...rest] = name.split('-');
    out.push({
      name: `--kp-${name}`,
      value,
      category,
      subPath: rest.join('-'),
    });
  }
  return out;
}

function loadFigmaMapping() {
  const p = path.join(ROOT, 'packages', 'mcp', 'figma-mapping.json');
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

/**
 * Attach `figma: { fileKey, nodeId, url }` and (when available) `codeConnect: {
 * npm, primaryClass, selector, import, docs, storybook }` to every component /
 * pattern record. The MCP server uses figma so `figma_for_component(name)` can
 * return a one-shot context the assistant feeds straight into Figma's MCP
 * tools, and codeConnect so the same lookup can return the Angular import
 * statement / npm package without a second round trip.
 */
function attachFigmaContext(items, mappingForLayer, fileKey, fileUrl, codeConnectForLayer) {
  if (!mappingForLayer && !codeConnectForLayer) return items;
  return items.map((item) => {
    const nodeId = mappingForLayer?.[item.name];
    const cc = codeConnectForLayer?.[item.name];
    const out = { ...item };
    if (nodeId) {
      out.figma = {
        fileKey,
        nodeId,
        url: `${fileUrl}?node-id=${nodeId.replace(':', '-')}`,
      };
    }
    if (cc) {
      out.codeConnect = cc;
    }
    return out;
  });
}

function main() {
  const project = new Project({
    compilerOptions: { allowJs: false, target: 99 },
    skipAddingFilesFromTsConfig: true,
    useInMemoryFileSystem: false,
  });

  const figmaMap = loadFigmaMapping();
  // Single packages/ui tree; layer is derived per-entry from its story title.
  const all = walkComponents(project, null, path.join(ROOT, 'packages', 'ui'));
  const components = all.filter((i) => i.layer === 'components');
  const patterns   = all.filter((i) => i.layer === 'patterns');
  const tokens     = parseTokens();

  const fileKey = figmaMap?.fileKey ?? null;
  const fileUrl = figmaMap?.url ?? null;

  const componentsWithFigma = attachFigmaContext(components, figmaMap?.components, fileKey, fileUrl, figmaMap?.codeConnect?.components);
  const patternsWithFigma   = attachFigmaContext(patterns,   figmaMap?.patterns,   fileKey, fileUrl, figmaMap?.codeConnect?.patterns);

  const manifest = {
    generatedAt: new Date().toISOString(),
    version: JSON.parse(fs.readFileSync(path.join(ROOT, 'packages', 'mcp', 'package.json'), 'utf8')).version,
    totals: {
      components: components.length,
      patterns: patterns.length,
      tokens: tokens.length,
    },
    figma: figmaMap
      ? {
          fileKey: figmaMap.fileKey,
          fileName: figmaMap.fileName,
          url: figmaMap.url,
          pages: figmaMap.pages,
          iconLibrary: figmaMap.iconLibrary,
          foundations: figmaMap.foundations,
        }
      : null,
    components: componentsWithFigma.sort((a, b) => a.name.localeCompare(b.name)),
    patterns:   patternsWithFigma.sort((a, b) => a.name.localeCompare(b.name)),
    tokens,
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2));
  const figmaCovered = componentsWithFigma.filter((c) => c.figma).length + patternsWithFigma.filter((p) => p.figma).length;
  console.log(`mcp manifest: ${manifest.totals.components} components, ${manifest.totals.patterns} patterns, ${manifest.totals.tokens} tokens, ${figmaCovered} figma node refs → ${path.relative(ROOT, OUT)}`);
}

main();
