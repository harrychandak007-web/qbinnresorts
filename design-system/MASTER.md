# Qbinn Tusker — Master Design System

**Product:** Hotel/Hospitality × Luxury/Premium Brand  
**Register:** Brand (design IS the product)  
**Stack:** Vanilla HTML/CSS/JS, single file  

---

## 1. Design Philosophy

**Scene sentence:** A discerning traveller opens the site on their phone at dusk, half-dreaming about forests and elephants. The interface must feel like the property itself — unhurried, textured, wild-luxe, never corporate.

**Strategy:** Committed — dark surface IS the brand. Gold carries authority. Cream carries warmth. Green whispers the forest.

**Style:** Liquid Glass + Minimalism (primary) — Glassmorphism accents on overlay elements (nav, lightbox, cards)  
**Pattern:** Hero-Centric + Storytelling + Social Proof  
**Anti-patterns to avoid:** Poor/small imagery, complex booking flows, fast/jarring animations, bright backgrounds, generic card grids

---

## 2. Color Tokens

```css
:root {
  /* Surfaces */
  --black:   #080808;   /* page body */
  --dark:    #111111;   /* section bg */
  --surface: #181818;   /* card/panel bg */
  --surface-glass: rgba(24, 24, 24, 0.75); /* glassmorphism panels */

  /* Brand */
  --gold:    #c4973a;   /* primary accent — WCAG 3:1 on dark */
  --gold-lt: #e0b85a;   /* hover state, large text */
  --gold-dim: rgba(196, 151, 58, 0.15); /* borders, dividers */
  --cream:   #f0ead8;   /* primary text on dark */
  --green:   #3a6b34;   /* nature accent, availability */

  /* Text */
  --text-primary:   #f0ead8;            /* cream — body text */
  --text-secondary: rgba(240,234,216,0.65); /* muted body */
  --text-muted:     rgba(240,234,216,0.4);  /* captions, metadata */
  --text-gold:      #c4973a;            /* headings, labels */

  /* Semantic */
  --error:   rgba(200, 80, 80, 0.7);
  --success: rgba(58, 107, 52, 0.6);
  --white:   #ffffff;
}
```

---

## 3. Typography

**Heading:** EB Garamond (Serif) — editorial, unhurried, literary  
**Body:** Jost (Sans) — clean, geometric, modern contrast  

> **Do NOT use:** Playfair Display, Inter, Roboto, Open Sans (reflex-reject fonts for this register)

```css
:root {
  --font-serif: 'EB Garamond', Georgia, serif;
  --font-sans:  'Jost', system-ui, sans-serif;
}
```

**Type scale (fluid headings, fixed body):**

| Role | Size | Font | Weight |
|------|------|------|--------|
| Hero display | `clamp(3rem, 9vw, 7rem)` | serif | 400 italic |
| H1 section | `clamp(2.2rem, 5vw, 4rem)` | serif | 400–500 |
| H2 subsection | `clamp(1.5rem, 3vw, 2.4rem)` | serif | 400 |
| Lead / intro | `clamp(1.1rem, 2vw, 1.4rem)` | sans | 300 |
| Body | `1rem` (16px fixed) | sans | 400 |
| Label / eyebrow | `0.68rem` | sans | 500–600, uppercase, 0.15em tracking |
| Caption | `0.75rem` | sans | 400 |

**Rules:**
- `text-wrap: balance` on h1–h3
- `line-height: 1.6–1.7` on body (light-on-dark compensation)
- `letter-spacing: 0.01em` on body text (dark-bg legibility bump)
- All-caps labels: `letter-spacing: 0.12–0.18em`
- Max body line length: `65ch`

---

## 4. Motion System

**Easing:** `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out-quint) — the only curve used  
**Durations:**

| Type | Duration | Notes |
|------|----------|-------|
| Micro (hover, focus) | 150–200ms | buttons, links |
| Standard entrance | 600–750ms | section reveals |
| Premium reveal | 900–1200ms | hero, lightbox open |
| Parallax / scroll | continuous | GPU only (transform) |

**Rules:**
- Exit animations: 60% of enter duration
- `@media (prefers-reduced-motion: reduce)` — all transitions → none, opacity snaps
- Never animate `width`, `height`, `top`, `left` — only `transform` + `opacity`
- Stagger list/grid items: 40–60ms per item
- All entrances are progressive enhancement (`js-animate` class on body)

---

## 5. Effects & Materials

### Glassmorphism (accent use only)
```css
background: var(--surface-glass);
backdrop-filter: blur(12px) saturate(1.2);
-webkit-backdrop-filter: blur(12px) saturate(1.2);
border: 1px solid var(--gold-dim);
```
Use on: nav bar (scrolled state), lightbox controls, booking form panel

### Liquid Glass Cards
```css
background: linear-gradient(135deg, rgba(24,24,24,0.9) 0%, rgba(18,18,18,0.95) 100%);
border: 1px solid rgba(196,151,58,0.12);
box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(196,151,58,0.08);
```

### Gold Glow (hero, section headers)
```css
text-shadow: 0 0 60px rgba(196,151,58,0.3);
```

### Scrim (modal overlays)
```css
background: rgba(8,8,8,0.92);
backdrop-filter: blur(6px);
```
Min 92% opacity — dark property imagery can't compete with content.

---

## 6. Spacing Scale

Base unit: **8px**

| Token | Value | Use |
|-------|-------|-----|
| `--space-xs` | 0.5rem (8px) | icon gap, inline |
| `--space-sm` | 1rem (16px) | element padding |
| `--space-md` | 1.5rem (24px) | card padding |
| `--space-lg` | 2.5rem (40px) | section sub-gap |
| `--space-xl` | 4rem (64px) | section padding |
| `--space-2xl` | 6rem (96px) | major section gap |
| `--space-3xl` | 10rem (160px) | hero height buffer |

---

## 7. Component Rules

### Buttons
- Primary: filled gold bg (`--gold`), black text, 0.6rem tracking uppercase
- Ghost: gold border + gold text, transparent bg → gold bg on hover
- Min touch target: 48px height
- Hover: 150ms ease-out, no transform bounce

### Navigation
- Default: transparent bg
- Scrolled: glassmorphism (`--surface-glass` + blur)
- Mobile: slide-in drawer from right, backdrop dim 70%

### Cards / Amenity Items
- Liquid Glass material
- No side-stripe borders (banned)
- No identical repeated card grid — vary size, weight, layout per section

### Gallery
- `aspect-ratio: 4/3` for thumbnails
- Hover: `scale(1.04)` + gold border reveal, 300ms
- Lightbox: scrim 97% opacity, backdrop blur 6px

### Forms
- Input border: 1px `--gold-dim` → gold on focus
- Invalid: red-tinted border `rgba(200,80,80,0.7)`
- Valid: green-tinted border `rgba(58,107,52,0.6)`
- Label: always visible (never placeholder-only)

---

## 8. Must-Have Sections (Priority Order)

1. **Hero** — fullscreen image, parallax bg, headline + italic gold italic line
2. **About / Storytelling** — why this place, the elephant story, voice of the host
3. **Amenities** — NOT identical card grid; use varied layout
4. **Gallery** — lightbox, high-quality images, 4+ per row desktop
5. **Social Proof / Testimonials** — featured quote + 2-column secondary
6. **Availability / Booking** — iCal + WhatsApp CTA
7. **Location** — distance from Bangalore, map embed
8. **Footer** — contact, WhatsApp, socials

---

## 9. Anti-Patterns (Never Do)

- Side-stripe borders on cards or callouts
- Gradient text (`background-clip: text`)
- Identical card grid (same size, same layout, endlessly repeated)
- Eyebrow label above every section (max 2 per page)
- Numbered section markers (01/02/03) without genuine sequence
- Fast animations < 300ms for primary reveals (luxury = unhurried)
- Bright/warm page background (site stays dark)
- Complex multi-step booking (WhatsApp CTA is primary)
- Emoji as icons

---

## 10. Accessibility Baseline

- Body text contrast ≥ 4.5:1 on dark surfaces (cream `#f0ead8` on `#111111` = ~13:1 ✓)
- Gold `#c4973a` on black = ~3.2:1 (use only for large text / decorative — not body)
- All interactive elements: `:focus-visible` gold outline
- Skip-to-content link
- `role="dialog"` + `aria-modal="true"` on lightbox
- `prefers-reduced-motion` respected throughout
- Touch targets ≥ 44px

---

*Generated: 2026-06-21 | Stack: Vanilla HTML/CSS/JS | Register: Brand*
