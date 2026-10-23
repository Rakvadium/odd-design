import tseslint from "typescript-eslint";
import odd from "odd-design/eslint";

export default [
  {
    files: ["src/raw-button.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: { odd },
    rules: {
      "odd/usage": "error",
      "odd/usage-incomplete": "warn",
      "odd/disable-reason": "error",
    },
  },
];
