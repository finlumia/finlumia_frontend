# Atoms and Hero Maintenance Guide

This guide explains how to maintain and extend the current text and image atoms, plus the organism that composes both into the landing hero.

## Scope

- `src/components/atoms/text/Text.tsx`
- `src/components/atoms/text/Text.types.ts`
- `src/components/atoms/image/Image.tsx`
- `src/components/atoms/image/Image.types.ts`
- `src/components/organisms/HeroSection/HeroSection.tsx`
- `src/components/organisms/HeroSection/HeroSection.types.ts`
- `src/components/pages/LandingPage.tsx`

## 1) Text atom (`Text`)

### Purpose

`Text` is now the shared semantic text atom for the project.
It can render different HTML tags and different visual variants without creating separate text components.

### Semantic rendering

Use the `as` prop to choose the output element:

- `h1`
- `h2`
- `h3`
- `p`
- `div`

This allows the same atom to be reused in headers, hero titles, subtitles, badges, and body copy.

### Variants

Supported values for `variant`:

- `primary`
- `secondary`
- `outlined`
- `inverted`
- `goldBadge` (yellow/golden pill style)
- `heroTitle`
- `heroHighlight`
- `heroDescription`

The `goldBadge` variant is intended for labels like "premium", while hero variants are tuned for high-impact landing copy.

### Size scale

Supported values for `size`:

- `xs`
- `sm`
- `md`
- `lg`
- `xl`
- `hero`

You can still override size manually with `styleConfig.fontSize`.

### Style overrides and backward compatibility

`TextStyleConfig` supports both:

- `backgroundColor` (recommended)
- `backgroudColor` (legacy typo kept for compatibility)

Prefer `backgroundColor` in new code.

Other important fields:

- layout: `display`, `width`, `maxWidth`, `height`, `margin`, `padding`
- text: `textColor`, `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`, `textTransform`, `textAlign`
- appearance: `border`, `borderRadius`, `boxShadow`, `opacity`, `visibility`
- behavior: `cursor`, `transition`, `transform`, `filter`, `justifyContent`

### Maintenance tips

- Keep `variantPreset` and `TextVariant` synchronized.
- Keep `sizePreset` and `TextSize` synchronized.
- If adding a new semantic tag, update `TextElement`.
- Avoid setting fixed heights for text unless there is a strict layout requirement.

## 2) Image atom (`Image`)

### Purpose

`Image` is the media atom for static visual assets, including SVG.

### SVG support

Use:

- `isSvg: true` to default `objectFit` to `contain`
- standard `src` with imported `.svg` assets

This keeps logos and vector illustrations crisp.

### Main API

- `src` (required)
- `alt` (required)
- `width`, `height`
- `loading` (`lazy` or `eager`)
- `decode` (`sync`, `async`, `auto`)
- `onClick`
- `styleConfig` for visual and layout overrides

### Style options

`ImageStyleConfig` includes:

- `backgroundColor` and legacy `backgroudColor`
- `border`, `borderRadius`, `boxShadow`, `padding`
- `width`, `height`, `maxWidth`
- `objectFit`, `objectPosition`
- `display`

### Maintenance tips

- Always provide meaningful `alt` text.
- Keep `maxWidth: 100%` behavior to avoid layout overflow.
- For non-SVG images, explicitly define `objectFit` when cropping behavior matters.

## 3) Hero organism (`HeroSection`)

### Purpose

`HeroSection` composes:

- multiple `Text` atoms (badge, title, highlight, description)
- one `Image` atom (hero preview)
- optional action buttons

It is the reusable "complete component" for landing-style hero blocks.

### Composition flow

`HeroSection` renders this order:

1. badge text (`Text` with `goldBadge`)
2. title text (`Text` with `heroTitle`)
3. optional highlight text (`Text` with `heroHighlight`)
4. description (`Text` with `heroDescription`)
5. optional buttons (`Button`)
6. hero image (`Image`)

### Layout behavior

- Desktop: two-column grid (content + image)
- Mobile/tablet: one column through media query
- Gaps and paddings can be customized through `styles`

### Customization API

`HeroSectionProps` exposes:

- content: `badgeText`, `title`, `highlightTitle`, `description`
- media: `previewImage`
- actions: `primaryAction`, `secondaryAction`
- visual/layout controls: `styles` and `textStyles`
- theming: `theme`

### Maintenance tips

- Keep text semantics correct (`h1` for main title, `p` for body, etc.).
- If button behavior changes globally, update button atom first, then adjust hero overrides.
- For design-system growth, prefer adding variant tokens in `Text` over creating new text atoms.

## 4) Landing page integration

`LandingPage` demonstrates:

- `Header` at the top
- `HeroSection` directly below
- custom style overrides for dark/light themes

This file should stay as the implementation reference for new pages.

## 5) Safe extension checklist

Before shipping changes in these components:

1. Verify heading hierarchy (`h1`, `h2`, `h3`) is still semantically correct.
2. Verify `Text` variants do not break header navigation styles.
3. Verify hero layout on narrow widths (max-width <= 1080px).
4. Verify SVG assets still scale correctly after style changes.
5. Prefer extending existing atoms and variants instead of introducing duplicate atoms.
