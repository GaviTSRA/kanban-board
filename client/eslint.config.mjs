import pluginVue from "eslint-plugin-vue";
import eslintConfigPrettier from "eslint-config-prettier";

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import vueEslintParser from "vue-eslint-parser";

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/recommended"],
  {
    plugins: {
      "typescript-eslint": tseslint.plugin,
    },
    languageOptions: {
      parser: vueEslintParser,
      parserOptions: {
        parser: "@typescript-eslint/parser",
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ref: "readonly",
        defineNuxtPlugin: "readonly",
        useFetch: "readonly",
        navigateTo: "readonly",
        Ref: "readonly",
        useRoute: "readonly",
        nextTick: "readonly",
        onBeforeUpdate: "readonly",
        useLocalStorage: "readonly",
        onMounted: "readonly",
        useHead: "readonly",
      },
    },
    rules: {
      "vue/multi-word-component-names": "off",
    },
  },
  eslintConfigPrettier,
];
