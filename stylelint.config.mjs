/** @type {import('stylelint').Config} */
const config = {
  extends: ['stylelint-config-standard'],
  rules: {
    // Permitir @tailwind, @apply, @theme y otras directivas de Tailwind CSS
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'layer',
          'config',
          'variants',
          'responsive',
          'screen',
          'theme',
          'custom-variant',
        ],
      },
    ],
    // Permitir funciones de Tailwind como theme()
    'function-no-unknown': [
      true,
      {
        ignoreFunctions: ['theme'],
      },
    ],
    
    // Desactivar reglas que son incompatibles con Tailwind CSS
    'no-descending-specificity': null,
    'selector-class-pattern': null,
    'alpha-value-notation': null,
    'color-function-notation': null,
    'hue-degree-notation': null,
    'lightness-notation': null,
    'import-notation': null,
    'no-duplicate-selectors': null,
    'declaration-empty-line-before': null,
    'rule-empty-line-before': null,
    'property-no-vendor-prefix': null,
    'color-function-alias-notation': null,
    'color-hex-length': null,
    'number-max-precision': null,
    'custom-property-pattern': null, // Tailwind genera custom properties con doble guión
    'selector-pseudo-element-colon-notation': null,
    'value-keyword-case': null,
    'declaration-property-value-keyword-no-deprecated': null,
    'declaration-block-no-redundant-longhand-properties': null,
    'declaration-block-no-duplicate-properties': null,
  },
};

export default config;
