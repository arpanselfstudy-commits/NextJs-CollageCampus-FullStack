# Repository Guidelines

## Project Structure & Module Organization
This repository is a Next.js 16 App Router application with all source under `src/`. Route entries live in `src/app`, including grouped segments such as `src/app/(auth)` and `src/app/(protected)`, plus API handlers under `src/app/api`. Feature code is organized by domain in `src/modules/<feature>` with `pages`, `components`, `hooks`, `api`, `types`, and `validation` files kept together. Shared UI lives in `src/components/common` and `src/components/layouts`. Server-side models, services, validators, and auth helpers live in `src/backend`. Static assets are in `public/`.

## Build, Test, and Development Commands
Use `npm install` to sync dependencies from `package-lock.json`.

- `npm run dev` starts the local Next.js dev server.
- `npm run build` creates the production build.
- `npm run start` serves the production build locally.
- `npm run lint` runs ESLint with the Next.js core-web-vitals and TypeScript rules.

There is no committed `test` script yet. If you add tests, wire them into `package.json` so contributors can run them consistently.

## Coding Style & Naming Conventions
Use TypeScript with strict typing and the `@/*` path alias for imports from `src`. Existing code uses 2-space indentation, single quotes, and semicolons omitted, so match that style. Name React components, page objects, and stores in `PascalCase`; hooks in `camelCase` with a `use` prefix; CSS modules as `ComponentName.module.css`. Keep feature-specific logic inside its module before promoting code to shared libraries.

## Testing Guidelines
`vitest` and `fast-check` are installed, but test files are not yet established in the tree. Place new tests next to the feature they cover or under a dedicated `src/**/__tests__` folder, and use `*.test.ts` or `*.test.tsx`. Prioritize coverage for backend services, validators, and custom hooks. Add a runnable `npm test` script with any new test suite.

## Commit & Pull Request Guidelines
Recent history follows Conventional Commit style such as `feat(auth): ...`, `refactor(shops): ...`, and `chore: ...`. Continue using `type(scope): summary` where the scope names the affected module. Pull requests should include a brief description, linked issue if applicable, screenshots for UI changes, and notes about any new environment variables, routes, or API behavior.

## Security & Configuration Tips
Secrets stay in local environment files and must never be committed. Current integrations expect values such as `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `EMAIL_*`, `NEXT_PUBLIC_APP_URL`, and optional upload keys like `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` or `NEXT_PUBLIC_IMGBB_API_KEY`.
