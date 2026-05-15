# Angular HRIS

HRIS Starter is an open-source human resource information system built with Angular 21, showcasing scalable frontend architecture with standalone components, signals, RBAC, and modern testing practices.

## Why This Project

This project focuses on practical frontend architecture patterns commonly used in production applications, including:

- Modern Angular architecture using standalone components, signals, and lazy-loaded routes
- Role-based route protection and UI permission gating for real-world access control patterns
- Security-minded auth flow with refresh-token hydration and production environment replacement
- Test coverage with Vitest unit tests and Playwright end-to-end tests
- Clean separation of `core`, `shared`, `layout`, and `pages` for maintainability
- Accessibility and UX polish with loading skeletons, aria labels, and keyboard-friendly controls
- Production-oriented documentation through phase reports and implementation notes

## Stack

- Angular 21
- Angular Router
- RxJS
- Tailwind-ready styling
- Vitest for unit tests
- Playwright for end-to-end tests

## Requirements

- Node.js 20 or newer
- Docker Desktop
- pnpm 10

## Setup

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm start
```

The app runs at `http://localhost:4200/`.

## Commands

Build the production bundle:

```bash
pnpm build
```

Run the app in watch mode for development builds:

```bash
pnpm watch
```

Run unit tests with Vitest:

```bash
pnpm test
```

Run Vitest in watch mode:

```bash
pnpm test:watch
```

Run the linter:

```bash
pnpm lint
```

Run Playwright end-to-end tests:

```bash
pnpm e2e
```

Open the Playwright UI:

```bash
pnpm e2e:ui
```

## Project Structure

- `src/app/core` - auth, guards, interceptors, services, and utility code
- `src/app/layout` - shell and sidebar layout
- `src/app/pages` - feature pages
- `src/app/shared` - reusable components and services
- `docs` - implementation phase reports and planning notes

## Environment

- Development API config lives in `src/environments/environment.development.ts`
- Production builds use `src/environments/environment.production.ts`
- Application code imports from `src/environments/environment.ts` so Angular can swap files at build time

## License

This repository is licensed under the MIT License. See [LICENSE.md](LICENSE.md).
