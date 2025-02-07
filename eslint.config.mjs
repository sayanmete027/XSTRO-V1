import prettier from 'eslint-plugin-prettier';

const eslintConfig = {
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    globals: {}
  },
  plugins: {
    prettier: prettier
  },
  rules: {
    'prettier/prettier': [
      'error',
      {
        printWidth: 100,
        useTabs: false,
        tabWidth: 2,
        singleQuote: true,
        semi: true,
        quoteProps: 'as-needed',
        trailingComma: 'es5',
        bracketSpacing: true,
        bracketSameLine: false,
        arrowParens: 'always',
        endOfLine: 'auto',
        proseWrap: 'preserve',
        embeddedLanguageFormatting: 'auto',
        vueIndentScriptAndStyle: false
      }
    ]
  },
  files: ['**/*.js'],
  ignores: ['node_modules/**', 'resources/**', 'resources/lib/*']
};

export default eslintConfig;
