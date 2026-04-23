const StyleDictionary = require('style-dictionary');

module.exports = {
  source: [
    'tokens/primitive/**/*.json',
    'tokens/semantic/**/*.json',
  ],
  platforms: {
    css: {
      transformGroup: 'css',
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
      transformGroup: 'scss',
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
      transformGroup: 'js',
      prefix: 'kp',
      buildPath: 'packages/core/src/_generated/',
      files: [
        {
          destination: 'tokens.js',
          format: 'javascript/es6',
        },
      ],
    },
  },
};
