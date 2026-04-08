import StyleDictionary from 'style-dictionary';

// Custom transform: flatten token name with dashes
StyleDictionary.registerTransformGroup({
  name: 'kanso/css',
  transforms: [
    'attribute/cti',
    'name/kebab',
    'color/css',
    'dimension/pixelToRem',
    'shadow/css/shorthand',
  ],
});

StyleDictionary.registerTransformGroup({
  name: 'kanso/scss',
  transforms: [
    'attribute/cti',
    'name/kebab',
    'color/css',
    'dimension/pixelToRem',
    'shadow/css/shorthand',
  ],
});

StyleDictionary.registerTransformGroup({
  name: 'kanso/ts',
  transforms: [
    'attribute/cti',
    'name/camel',
    'color/css',
    'shadow/css/shorthand',
  ],
});

export default {
  source: [
    'tokens/primitive/**/*.json',
    'tokens/semantic/**/*.json',
  ],
  preprocessors: ['tokens-studio'],
  platforms: {
    css: {
      transformGroup: 'kanso/css',
      prefix: 'kp',
      buildPath: 'packages/core/styles/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          options: {
            outputReferences: true,
          },
        },
      ],
    },
    scss: {
      transformGroup: 'kanso/scss',
      prefix: 'kp',
      buildPath: 'packages/core/styles/',
      files: [
        {
          destination: '_tokens.scss',
          format: 'scss/variables',
          options: {
            outputReferences: true,
          },
        },
      ],
    },
    ts: {
      transformGroup: 'kanso/ts',
      prefix: 'kp',
      buildPath: 'packages/core/src/_generated/',
      files: [
        {
          destination: 'tokens.ts',
          format: 'javascript/es6',
        },
      ],
    },
  },
};
