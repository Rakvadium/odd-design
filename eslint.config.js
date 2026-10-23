import babelParser from "@babel/eslint-parser";

export default [
  {
    ignores: ["tests/fixtures/**"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          babelrc: false,
          configFile: false,
          parserOpts: {
            plugins: ["typescript", "jsx"],
          },
        },
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
  },
];
