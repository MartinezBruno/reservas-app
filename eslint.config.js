import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["**/dist/", "**/.next/", "apps/web/next-env.d.ts"]),
  js.configs.recommended,
  tseslint.configs.recommended,
  prettier,
]);
