# Header Maintenance Guide

This guide documents the functions and render flow added for the current `Header` architecture.
It is written for first-time readers who need to maintain or extend this area quickly.

## Scope

- `components/organisms/Header/Header.tsx`
- `components/organisms/Header/Header.type.ts`
- `components/pages/LandingPage.tsx`
- `shared/styles/tokens/organisms/header.ts`

## 1) `Header()` (`Header.tsx`)

### Purpose
Render a flexible header that supports:
- sectioned composition (`leftItems`, `centerItems`, `rightItems`)
- flat composition (`items`)
- legacy composition (`logo`, `text`, `icon`, `buttons`)

### Inputs
- `theme`: selects foundation palette via `getFoundationByTheme(theme)`
- `styleHeader`: inline layout and visual overrides
- `leftItems` / `centerItems` / `rightItems`: preferred modern API
- `items`: fallback API when sectioned composition is not used
- legacy props (`logo`, `text`, `icon`, `buttons`): compatibility mode

### Internal helpers
- `resolveAlign(value)`: maps semantic values (`left`, `center`, `right`) to CSS `alignItems`
- `renderItem(item, index)`: renders one `HeaderItem` by discriminated union `type`
  - `logo` => `Logo`
  - `text` => `Text`
  - `button` => `Button`
  - `icon` => `Icon`

### Rendering priority
1. If any of `leftItems`, `centerItems`, `rightItems` has elements, render sectioned layout.
2. Else, if `items` has elements, render flat sequence.
3. Else, render legacy props.

### Styling behavior
- `finalStyle` controls the root `<header>`
- `groupStyle` controls left group
- `centerGroupStyle` applies `centerGap` override
- `rightGroupStyle` applies `rightGap` override

## 2) `LandingPage()` (`LandingPage.tsx`)

### Purpose
Reference composition of the final landing header layout.

### What it demonstrates
- sectioned `Header` API
- logo on the left
- navigation text in the center
- action buttons on the right
- style overrides via `TextStyleConfig` and `ButtonStyleConfig`

### Key local configs
- `textLogoStyle`: branding text appearance
- `navTextStyle`: navigation item appearance
- `ghostButtonStyle`: "Entrar" outline-style button
- `primaryButtonStyle`: "Criar conta gratis" CTA button

## 3) `createThemeHeaderTokens()` (`tokens/organisms/header.ts`)

### Purpose
Create theme-specific token variants for header surfaces.

### Input
- `foundation` (`lightFoundation` or `darkFoundation`)

### Output variants
- `default`
- `elevated`
- `transparent`

Each variant returns:
- `backgroundColor`
- `textColor`
- `borderColor`
- `shadow`

### Usage
Consumed by:
- `headerTokens.light`
- `headerTokens.dark`

## 4) Types reference (`Header.type.ts`)

### `HeaderItem`
Discriminated union for item rendering:
- `{ type: "logo"; props: LogoProps }`
- `{ type: "text"; props: TextProps }`
- `{ type: "icon"; props: IconProps }`
- `{ type: "button"; props: ButtonProps }`

### `HeaderProps`
- modern:
  - `leftItems?`, `centerItems?`, `rightItems?`
  - `items?`
- legacy:
  - `logo?`, `text?`, `icon?`, `buttons?`
- global:
  - `theme?`, `styleHeader?`

### `HeaderStyleConfig`
Layout and visual controls:
- `backgroundColor`, `display`, `visibility`, `padding`
- `align`, `justifyContent`, `gap`
- `centerGap`, `rightGap`
- `flexDirection`

## 5) Maintenance checklist

- Prefer sectioned API (`leftItems`, `centerItems`, `rightItems`) for predictable layout.
- Keep `HeaderItem` union and `renderItem()` switch in sync when adding new component types.
- Avoid removing legacy props until all call sites are migrated.
- If adding new style fields to `HeaderStyleConfig`, map them in `finalStyle`.
- Keep token files source-of-truth for shared values; avoid hardcoding repeated numbers across pages.

## Related documentation

- `docs/atoms-and-hero-maintenance-guide.md` for text atom semantic variants, image atom, and hero composition maintenance.
