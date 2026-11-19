# Technical decisions

Each entry records what was chosen, what was ruled out, and why. Newest decisions go at the bottom.

---

## 1. Fastify as the HTTP framework

**Date:** 2026-11-14 · **Status:** accepted

**Context.** The API is a JSON service with a small number of endpoints, where correctness under concurrency matters more than framework features. It needs request validation, typed handlers and fast integration tests.

**Decision.** Fastify 5.

**Why.**

- Validation and serialization are built into the route definition (`schema.body`, `schema.response`) instead of being added through middleware. Each route declares its contract in one place.
- `app.inject()` runs a request through the full pipeline (hooks, validation, serialization) without opening a port. The `/health` test already uses it, and every endpoint test will follow the same pattern.
- Plugin encapsulation gives each plugin its own scope, so things like the database client can be registered once and decorated onto the instance, without global singletons.
- It supports async/await and TypeScript out of the box.

**Ruled out.**

- **Express:** routing works fine, but validation, serialization and typed handlers would all be assembled from separate libraries.
- **NestJS:** dependency injection, decorators and modules add more structure than an API this size needs. They also hide the parts this project is meant to show: transactions, constraints, and error handling around concurrent bookings.

**Consequences.** Zod schemas live in `packages/shared`, and Fastify needs to be told how to use them for validation. That integration (a Zod type provider) is still an open decision, to be settled before the first endpoint with a request body.

---

## 2. `packages/shared` consumed from source

**Date:** 2026-11-14 · **Status:** accepted

**Context.** `shared` holds Zod schemas and types used by both the API and the web app.

**Decision.** `shared` has no build step. Its `exports` field points straight at `./src/index.ts`, and every consumer compiles it as part of its own build.

**Why.** There is no separate build or watch process for `shared`. A schema change shows up immediately in `pnpm dev`, tests and typecheck, and the package can never be stale relative to its source.

**Ruled out.**

- **Compiling `shared` to `dist/`:** adds a build order (shared first, apps after) and a watcher in dev.
- **TypeScript project references:** solves the same problem with more configuration than a single small package needs.

**Consequences.** Every consumer has to know how to compile TypeScript:

- the API uses tsx in dev and tsup with `noExternal: ["@reservas/shared"]` for production;
- the web app uses `transpilePackages`;
- Vitest transpiles it on its own.

Because tsup inlines `shared`, it also inlines any of `shared`'s dependencies that the API does not declare itself. Zod ended up inside the API bundle (741 KB) until it was added to the API's own dependencies, which brought the bundle down to 596 B. Rule: a dependency of `shared` that the API uses at runtime must also be declared in the API.

`shared` cannot be published to npm as is. That is acceptable, because it is a private workspace package.

---

## 3. ESM across the whole repo

**Date:** 2026-11-14 · **Status:** accepted

**Decision.** Every package has `"type": "module"`. TypeScript uses `module`/`moduleResolution: NodeNext` (the web app uses `bundler`, which is what Next expects).

**Why.**

- Node 24 runs ES modules natively. Next.js and Vitest are ESM-first.
- `apps/api/src/server.ts` uses top-level `await` for `app.listen()`, which only works in ESM.
- A single module system avoids interop problems between CommonJS and ESM inside the monorepo.

**Ruled out.** **CommonJS:** it still works, but it is the legacy format. It would need interop for ESM-only dependencies and would not allow top-level `await`.

**Consequences.** With `NodeNext`, relative imports in the API need the `.js` extension (`import { buildApp } from "./app.js"`), even though the source file is `.ts`.

---

## 4. TypeScript 6.0 instead of 7

**Date:** 2026-11-14 · **Status:** accepted, to revisit

**Context.** TypeScript 7 is the current `latest` release (7.0.2).

**Decision.** Pin `typescript` to `~6.0.3`.

**Why.** `typescript-eslint` 8.72 declares a peer dependency of `typescript >=4.8.4 <6.1.0`. The type-aware lint rules, such as `no-floating-promises`, depend on that integration, and missing promise handling is exactly the kind of bug that matters in booking and queue code. Linting comes before using the newest compiler.

**Ruled out.** **TypeScript 7 without type-aware linting**, or with an unsupported version: it would lose the rules that catch unhandled promises.

**Consequences.** Upgrade once `typescript-eslint` supports TypeScript 7. The tilde range (`~6.0.3`) allows patch updates but not minor ones.

---

## 5. Vitest with one root config and per-package projects

**Date:** 2026-11-19 · **Status:** accepted

**Decision.** A single `vitest.config.ts` at the root defines one project per package (`shared`, `api`). The web app has no unit tests yet; it will be covered by Cypress.

**Why.**

- `pnpm test` at the root runs everything in one process with one report.
- CI needs a single command.
- A single package still runs on its own with `pnpm test --project api`.

**Ruled out.** **A Vitest config in each package, run with `pnpm -r test`:** that gives one process and one report per package, and the configuration would be repeated.

---

## Pending

- **ORM / database access (Prisma vs alternatives).** Leaning towards Prisma for familiarity. Before deciding, check how it handles the exclusion constraint that prevents double bookings: whether migrations detect drift on it, and how the `23P01` error reaches the application. To be decided at the start of stage 1.
- **Fastify + Zod integration** (type provider). See decision 1.
