# Project Instructions

This repository is an Angular 21 frontend for an HRIS app. When generating or modifying code, follow the existing patterns in the repo instead of introducing new architecture.

## Core Rules

- Prefer standalone components.
- Use `inject()` for dependency injection in components and services.
- Keep naming and folder structure consistent with the existing codebase.
- Do not add new dependencies unless explicitly requested.
- Prefer small, focused changes over broad refactors.
- Preserve existing patterns for signals, RxJS, and reactive forms.

## Frontend Architecture

- Feature pages live under `src/app/pages/`.
- Reusable UI and shared services live under `src/app/shared/`.
- Cross-cutting logic lives under `src/app/core/`.
- API access follows a service layer pattern:
  - `BaseApiService` for raw HTTP helpers
  - `PaginatedQueryService<T>` for list/read flows
  - `CrudMutationService<TEntity, TCreatePayload, TUpdatePayload>` for create/update/delete flows

## Module Pattern

When creating a new module, follow the same structure used by existing modules such as `employees`, `departments`, `positions`, `roles`, and `users`.

- Create a query service for list/detail reads.
- Create a mutation service for create/update/delete actions.
- Create a list page component if the module has a table/grid view.
- Create a form component for create/edit flows.
- Add or update routes only if needed for the new module.
- Add unit tests for new services and any component logic that contains business rules.

## Type and API Contract Conventions

- Define entity and payload types in `src/app/core/types/` when the module needs shared API models.
- Match backend field names exactly unless there is a clear existing frontend convention.
- Include optional fields, derived labels, and pagination metadata only if the backend actually returns them.
- Use stable endpoint names and keep request/response shapes explicit.

## UI Behavior Conventions

- Use the existing toast, confirm, and modal services where applicable.
- Reuse `HasPermissionDirective` for RBAC-aware UI actions.
- Use reactive forms for create/edit forms.
- Handle loading, error, and submit states explicitly.
- Keep list pages consistent with existing pagination, search, and sort behavior.
- Use Lucide icons the same way as the existing pages: import the icon symbol in the component and render it as an SVG attribute, for example `<svg lucideArrowUpDown [size]="14"></svg>`. Do not use `[lucideIcon]` bindings in this repo unless the existing file already does that.

## Testing Conventions

- Use Vitest for unit tests.
- Follow the style already used in the repo for service and directive specs.
- Test HTTP request method, URL, body, and query params for API services.
- Add component tests only when the component contains meaningful logic beyond template rendering.

## What To Ask For Before Building a New Module

If the backend contract is not already known, ask for:

- module name
- base endpoint
- entity fields
- create payload fields
- update payload fields
- list response shape
- detail response shape
- pagination/search/sort parameters
- validation and conflict error behavior

## Expected Output When Implementing a Module

When asked to create a new module, return:

- files created or changed
- short summary of the implementation
- any assumptions made from the backend contract
