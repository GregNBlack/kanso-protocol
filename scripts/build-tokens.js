#!/usr/bin/env node
/**
 * Build token outputs from DTCG sources.
 *
 * Style Dictionary v4 supports a single default-export config per CLI
 * invocation. We have two configs in style-dictionary.config.js: the default
 * one (light, tokens.css / _tokens.scss / tokens.js) and a `.dark` config
 * that emits dark.css from tokens/themes/dark.json. This script runs both
 * via the SD JS API so a single `npm run build:tokens` regenerates everything.
 *
 * SD v4 is ESM-only, so it has to be loaded via dynamic import; the rest of
 * the script stays CJS to match the surrounding scripts/ folder.
 */

const path = require('node:path');

(async () => {
  const { default: StyleDictionary } = await import('style-dictionary');

  // Loading the config gives us both the light and the dark config object.
  const config = require(path.resolve(__dirname, '..', 'style-dictionary.config.js'));

  const light = new StyleDictionary(config);
  await light.buildAllPlatforms();

  const dark = new StyleDictionary(config.dark);
  await dark.buildAllPlatforms();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
