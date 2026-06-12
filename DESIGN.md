---
name: Matteo Perin
description: The digital atelier of a bespoke Italian house in Jackson Hole — cinematic craft, one-of-one scarcity.
colors:
  tuscan-terracotta: "#CB5C38"
  atelier-cream: "#F2EFE9"
  ink-charcoal: "#1C1C1C"
  atelier-black: "#0A0A0A"
  stone-gray: "#8C8C8C"
  raw-canvas: "#E5E2DC"
typography:
  display:
    fontFamily: "Playfair Display, serif"
    fontSize: "clamp(2.25rem, 6vw, 4.5rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Playfair Display, serif"
    fontSize: "1.875rem"
    fontWeight: 400
    lineHeight: 1.2
  body:
    fontFamily: "Playfair Display, serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontFamily: "Montserrat, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.25em"
rounded:
  none: "0px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "32px"
  lg: "64px"
  section: "128px"
components:
  button-primary:
    backgroundColor: "{colors.ink-charcoal}"
    textColor: "#FFFFFF"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "16px 32px"
  button-primary-hover:
    backgroundColor: "{colors.tuscan-terracotta}"
    textColor: "#FFFFFF"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-charcoal}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "14px 32px"
  eyebrow-label:
    textColor: "{colors.tuscan-terracotta}"
    typography: "{typography.label}"
---

# Design System: Matteo Perin

## 1. Overview

**Creative North Star: "The Cinematic Atelier"**

An Italian workshop shot like a film. Warm paper-cream surfaces stand in for the cutting table; photography carries the drama; type behaves like a title sequence — enormous, patient Playfair Display serifs over whispering tracked-uppercase labels. Pacing is part of the design: long scroll distances, slow reveals, generous negative space between acts. The system is quiet by default so that scale and imagery can be loud.

The house intends to push **bolder and more fashion-forward** than a typical quiet-luxury site: editorial asymmetry, oversized headlines, and confident full-bleed photography are encouraged. What it rejects (verbatim from PRODUCT.md): generic Shopify-luxe template sameness, loud streetwear hype, cold sterile minimalism, and old-money clutter.

**Key Characteristics:**
- Cream-paper canvas, ink-dark text, a single terracotta flame used sparingly
- Serif-led: even body copy speaks Playfair; Montserrat exists only for tracked uppercase labels
- Square geometry everywhere; circles only for dots, badges, and the logo mark
- Flat chrome, cinematic shadows under imagery only
- Choreographed motion: slow ease-out reveals (700–1400ms), never bouncy

## 2. Colors

A warm, paper-and-ink palette with one flame.

### Primary
- **Tuscan Terracotta** (#CB5C38): The house accent. Eyebrow labels, focus rings, active underlines, hover states, the selection highlight. It marks "the house speaking" — never used as large fills or backgrounds in chrome.

### Neutral
- **Atelier Cream** (#F2EFE9): The default page canvas. Warm, paper-like; everything sits on it.
- **Raw Canvas** (#E5E2DC): Secondary surface for subtle banding between sections and image placeholders.
- **Ink Charcoal** (#1C1C1C): Primary text and the primary button fill. The "ink" of the system.
- **Atelier Black** (#0A0A0A): The dark world — Vault, Dossier, Portal pages and dark mode. Near-black, never pure #000.
- **Stone Gray** (#8C8C8C): Muted metadata and labels. **Caution:** on Atelier Cream it measures ~3.1:1 — acceptable only at large/heavy sizes; below 14px it must darken toward #6E6E6E to hold WCAG AA.

### Named Rules
**The One Flame Rule.** Terracotta appears on at most ~10% of any screen — an eyebrow, a rule line, a focus ring, one hover. Its rarity is its authority. If two large terracotta elements are visible at once, one is wrong.

**The Warm Dark Rule.** Dark surfaces are Atelier Black (#0A0A0A) or Ink Charcoal — never pure black, never cool gray.

## 3. Typography

**Display Font:** Playfair Display (serif fallback)
**Body Font:** Playfair Display — the body speaks serif too
**Label Font:** Montserrat (sans-serif fallback)

**Character:** A magazine masthead pairing: high-contrast Didone-adjacent serifs at cinematic scale, annotated by tiny tracked grotesque labels. The gap between the two sizes IS the hierarchy.

### Hierarchy
- **Display** (400, clamp(2.25rem–4.5rem), 1.1, −0.04em optical margin): Page heroes and section openers. One per viewport.
- **Headline** (400, 1.875–2.25rem, 1.2): Product names, article titles, modal headings.
- **Body** (400, 1.125rem, 1.8): Editorial copy, descriptions. Cap at 65–75ch.
- **Label** (Montserrat 500, 10–12px, 0.2–0.4em tracking, UPPERCASE): Eyebrows, buttons, nav, metadata. The system's whisper.

### Named Rules
**The Whisper-and-Shout Rule.** Type is either enormous Playfair or tiny tracked Montserrat. The middle register (16–24px sans) is forbidden in brand surfaces — it reads as generic SaaS.

**The Italic Aside Rule.** Playfair italic is reserved for human asides ("One of one. When it's acquired, it's gone."). Never for emphasis inside running copy.

## 4. Elevation

Flat chrome, cinematic depth. Buttons, nav, inputs, and panels sit flush on the canvas with hairline borders. Shadows exist for one purpose: lifting photography and lightboxes off the page, like prints raised from a cutting table.

### Shadow Vocabulary
- **Print Lift** (`box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)`): Lookbook and product imagery at rest.
- **Cinema Lift** (`box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25)`): Lightboxes, modals, the drawer.

### Named Rules
**The Lifted Print Rule.** If it isn't a photograph or a modal, it doesn't cast a shadow.

## 5. Components

Tailored and sharp: square edges, hairline strokes, type does the talking.

### Buttons
- **Shape:** Square (0px radius), generous horizontal padding (32–48px)
- **Primary:** Ink Charcoal fill, white Montserrat label (10px, 0.2em tracking, uppercase); hover floods Tuscan Terracotta over 500ms
- **Ghost:** Transparent with 1px current-color border; hover swaps border/text to terracotta
- **Text link:** Tracked uppercase label with 1px underline sitting 4–8px below; underline grows or recolors on hover

### Cards / Containers
- **Corner Style:** Square
- **Background:** Atelier Cream or transparent; imagery fills an aspect-ratio box (2:3 portrait dominant)
- **Shadow Strategy:** Print Lift on imagery only (see Elevation)
- **Border:** 1px hairlines at 5–15% opacity of ink
- **Internal Padding:** 24–32px

### Inputs / Fields
- **Style:** Borderless with a 1px bottom rule; floating labels in tracked uppercase
- **Focus:** Bottom rule animates to full width / darkens; terracotta focus ring (1px, 3px offset) for keyboard
- **Error:** Terracotta-family red text at label size

### Navigation
- **Style:** Transparent over hero, gains cream backdrop on scroll; tracked-uppercase links with terracotta active state; full-screen menu overlay on mobile
- **The bag and concierge** float as fixed circular icon buttons (the only circles in chrome)

### Signature Component: The Eyebrow
A 10px Montserrat label, 0.4em tracking, uppercase, Tuscan Terracotta, set 16–24px above a Display headline. It is the house's voice introducing every act. Pages open with eyebrow → display → hairline rule.

## 6. Do's and Don'ts

### Do:
- **Do** open every page with the eyebrow → Playfair display → hairline sequence; one display headline per viewport.
- **Do** let photography go full-bleed and asymmetric; editorial spreads beat centered stacks.
- **Do** use square corners and 1px hairlines everywhere in chrome; reserve circles for dots and badges.
- **Do** keep motion at 700–1400ms with ease-out-expo curves, and honor prefers-reduced-motion.
- **Do** push scale contrast further when in doubt — this house wants bolder, not safer.

### Don't:
- **Don't** ship "generic Shopify-luxe template sameness": centered hero + 3-col card grid + testimonial strip is prohibited composition.
- **Don't** import "loud streetwear hype": no countdowns, no neon, no all-caps body copy, no drop mechanics.
- **Don't** drift into "cold sterile minimalism": surfaces stay warm cream, never clinical white (#FFFFFF backgrounds are forbidden outside lightboxes).
- **Don't** lapse into "old-money clutter": no ornamental borders, no gold foil, no script faces.
- **Don't** set Stone Gray (#8C8C8C) on cream below 14px — it fails AA; darken it instead.
- **Don't** use gradient text, glassmorphism, colored side-stripes, or shadows on chrome (The Lifted Print Rule).
