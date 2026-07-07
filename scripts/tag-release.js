#!/usr/bin/env node
/**
 * tag-release — create the git tag + GitHub Release for the current release, if
 * they don't already exist. Idempotent (safe to run on every push to main).
 *
 * Why this exists: the maintainer flow is **local-bump** — `npx changeset
 * version` is run locally, so the changesets get consumed before merge. On
 * `main`, changesets/action then finds no pending changesets and goes straight
 * to `publish:` (publish-libs.js → npm). npm gets the new versions, but
 * changesets/action only creates git tags / GitHub Releases when it consumes
 * changeset files — so with local-bump, GitHub Releases silently lag npm
 * (v5.15.0 stayed "Latest" for weeks while npm was on 5.16.0). This step closes
 * that gap.
 *
 * Tag: `v<@kanso-protocol/ui version>` (the umbrella version, matching the repo
 * convention — releases are tagged by the ui package version). Release notes:
 * the top-most dated section of CHANGELOG.md.
 *
 * Runs in CI (release.yml, after the publish step) and locally
 * (`npm run release:tag`). Requires `gh` authenticated (or GH_TOKEN /
 * GITHUB_TOKEN in env) and push rights to origin.
 */

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const sh = (cmd, args) => execFileSync(cmd, args, { cwd: ROOT, encoding: 'utf8' }).trim();
const shTry = (cmd, args) => {
  try { return sh(cmd, args); } catch { return null; }
};

const version = JSON.parse(fs.readFileSync(path.join(ROOT, 'packages/ui/package.json'), 'utf8')).version;
const tag = `v${version}`;

// ─── Idempotency: bail if this release already exists ───────────────────────
const existing = shTry('gh', ['release', 'view', tag, '--json', 'tagName', '-q', '.tagName']);
if (existing === tag) {
  console.log(`tag-release: ${tag} already released — nothing to do.`);
  process.exit(0);
}

// ─── Release notes + title from the top-most dated CHANGELOG section ─────────
const lines = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8').split('\n');
const starts = lines.reduce((a, l, i) => (/^## \d{4}-\d{2}-\d{2}/.test(l) ? [...a, i] : a), []);
let notes = `Release ${tag}.`;
let title = tag;
if (starts.length) {
  const [from, to] = [starts[0], starts[1] ?? lines.length];
  notes = lines.slice(from + 1, to).join('\n').trim() || notes;
  // "## 2026-07-06 — feat: design-system integrity …" → strip date + cc-type
  const m = lines[from].match(/^##\s+\d{4}-\d{2}-\d{2}\s+—\s+(.*)$/);
  if (m) title = `${tag} — ${m[1].replace(/^(feat|fix|docs|chore|refactor|revert|test)(\([^)]*\))?:\s*/, '')}`;
}
const notesFile = path.join(os.tmpdir(), `kanso-relnotes-${tag}.md`);
fs.writeFileSync(notesFile, notes + '\n');

// ─── Create + push the annotated tag on HEAD (the release commit) ────────────
if (!shTry('git', ['rev-parse', '-q', '--verify', `refs/tags/${tag}`])) {
  sh('git', ['tag', '-a', tag, '-m', `${tag} — @kanso-protocol/ui`]);
}
shTry('git', ['push', 'origin', tag]); // may already be on origin; --verify-tag below is the guard

// ─── Create the GitHub Release (marks it latest) ─────────────────────────────
sh('gh', ['release', 'create', tag, '--title', title, '--notes-file', notesFile, '--latest', '--verify-tag']);
console.log(`tag-release: created tag + GitHub Release ${tag} ("${title}").`);
