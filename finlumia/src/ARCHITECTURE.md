# Frontend Architecture (Atomic Design + Modular Services)

## Folder structure

```text
src/
  app/
    providers/
    routes/
  components/
    atoms/
    molecules/
    organisms/
    templates/
    pages/
  features/
  services/
    configurator/
    identification/
    movimentation/
    document/
  shared/
    constants/
    hooks/
    styles/
    types/
    utils/
```

## Atomic Design rules

- `atoms`: small, reusable UI pieces (Button, Input, Badge).
- `molecules`: composition of atoms for common UI blocks (SearchBar, FormRow).
- `organisms`: bigger UI sections (Header, Sidebar, DataTableBlock).
- `templates`: structural layout without page data specifics.
- `pages`: page-level composition with route context.

## Reuse and responsiveness defaults

- Place design tokens (spacing, colors, radius, typography) in `shared/styles`.
- Keep responsive helpers centralized in `shared/styles`.
- Keep business rules and API calls out of `components`; prefer `features` and `services`.
- Use `services/<domain>` to isolate each backend service by subdomain.

## Current implementation flow

### Routing and page composition

- `main.tsx`: starts the app with `BrowserRouter` (SPA navigation without full reload).
- `App.tsx`: delegates to `app/routes/AppRouter.tsx`.
- `app/routes/AppRouter.tsx`: maps page routes (`/`, `/login`, `/cadastro`, `/recuperar-senha`, `/configurador`).

### Layout and reusable structure

- `components/templates/PublicLayout.tsx`: reusable app shell.
- `components/organisms/Header.tsx`: header with configurable menu and mobile toggle.
- `components/organisms/Footer.tsx`: shared footer.

### Reusable UI and business blocks

- `components/atoms`: low-level visual primitives (`Button`, `Logo`).
- `components/molecules`: composed blocks (`NavMenu`, `AuthFormShell`).
- `components/organisms/GenericTable.tsx`: generic table supporting permissions for create/edit/delete.
- `features/configurator/mockData.ts`: example source of table columns/rows/permissions.

### Permission-based table behavior

- `permissions.canCreate = true`: shows "Incluir novo".
- `permissions.canEdit = true`: shows "Editar" action.
- `permissions.canDelete = true`: shows "Excluir" action.

The same table component can be reused in multiple modules by changing only:

1. Columns
2. Data rows
3. Permission object
4. Action callbacks
