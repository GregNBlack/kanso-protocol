#!/usr/bin/env node
/**
 * Build token outputs from DTCG sources.
 *
 * Style Dictionary v4 supports a single default-export config per CLI
 * invocation. style-dictionary.config.js exposes:
 *   • the default (light) config — tokens.css / _tokens.scss / tokens.js;
 *   • `themeConfigs` — one config per `tokens/themes/<name>.json`, each
 *     emitting `packages/ui/styles/<name>.css` under `[data-theme="<name>"]`.
 *
 * This script runs the light config, then loops over every theme config via
 * the SD JS API, so a single `npm run build:tokens` regenerates everything
 * (light + dark + high-contrast + any future theme, no per-theme wiring here).
 *
 * SD v4 is ESM-only, so it has to be loaded via dynamic import; the rest of
 * the script stays CJS to match the surrounding scripts/ folder.
 */

const path = require('node:path');

(async () => {
  const { default: StyleDictionary } = await import('style-dictionary');

  // Loading the config gives us the light config plus the per-theme configs.
  const config = require(path.resolve(__dirname, '..', 'style-dictionary.config.js'));

  // Light: :root defaults + tokens.css / _tokens.scss / tokens.js.
  const light = new StyleDictionary(config);
  await light.buildAllPlatforms();

  // Themes: each tokens/themes/<name>.json → packages/ui/styles/<name>.css.
  for (const themeConfig of config.themeConfigs) {
    const theme = new StyleDictionary(themeConfig);
    await theme.buildAllPlatforms();
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
