import babelParser from "@babel/eslint-parser";
import htmlParser from "@html-eslint/parser";
import { defineConfig } from "eslint/config";
import odd from "./src/eslint/plugin.ts";

export default defineConfig([
  {
    ignores: ["tests/fixtures/**", ".verify/**", "storybook-static/**"],
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
  },
  {
    files: ["**/*.html"],
    languageOptions: {
      parser: htmlParser,
    },
  },
  {
    files: ["stories/**/*.ts", "tests/fixtures/usage/templates/**/*.ts", "**/*.html", "**/*.tsx"],
    // The components write odd- classes, and the fixtures in components.test.tsx pin what they write.
    ignores: ["src/react/**", "tests/components.test.tsx"],
    plugins: {
      odd,
    },
    rules: {
      "odd/usage": "error",
      "odd/usage-incomplete": "warn",
      "odd/disable-reason": "error",
    },
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
  },
]);
