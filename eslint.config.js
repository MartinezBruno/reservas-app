import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import nextPlugin from "@next/eslint-plugin-next";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["**/dist/", "**/.next/", "apps/web/next-env.d.ts"]),
  js.configs.recommended,

  // Lint con información de tipos (no-floating-promises, no-misused-promises, etc.)
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          // Archivos de config que no están en ningún tsconfig
          allowDefaultProject: ["*.js", "*.ts", "apps/api/*.config.ts"],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Los handlers async de Fastify sin await son idiomáticos
      "@typescript-eslint/require-await": "off",
    },
  },
  {
    files: ["**/*.js", "**/*.mjs"],
    extends: [tseslint.configs.disableTypeChecked],
  },

  // Next.js y React Hooks, solo en la web
  {
    files: ["apps/web/**/*.{ts,tsx}"],
    extends: [
      nextPlugin.configs["core-web-vitals"],
      reactHooks.configs.flat["recommended-latest"],
    ],
    settings: { next: { rootDir: "apps/web" } },
  },

  prettier,
]);
