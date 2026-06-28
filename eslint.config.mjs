import noUnsanitized from "eslint-plugin-no-unsanitized";
import tseslint from "typescript-eslint";

export default [
  {
    files: ["main.js"],
    plugins: { "no-unsanitized": noUnsanitized },
    rules: {
      "no-unsanitized/method": "warn",
      "no-unsanitized/property": "warn",
    },
  },
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ["src/**/*.ts", "packages/**/*.ts"],
    languageOptions: {
      ...config.languageOptions,
      parserOptions: {
        ...config.languageOptions?.parserOptions,
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      ...config.rules,
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
      "prefer-const": "warn",
    },
  })),
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: ["src/**/*.ts", "packages/**/*.ts"],
    languageOptions: {
      ...config.languageOptions,
      parserOptions: {
        ...config.languageOptions?.parserOptions,
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  })),
];
