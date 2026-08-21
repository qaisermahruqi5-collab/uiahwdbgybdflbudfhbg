# GENOA 2.0 — "Stadium Editorial" Makeover Spec

**Goal:** visibly different design, SAME color theme. All routes, i18n (EN/AR + RTL), form logic, GSAP/Lenis, accessibility and SEO behavior keep working. This is a restyle, not a rewrite.

## Locked (do not change)
- Palette: navy `#060F25` / `#0B1B3D` / `#142850`, red `#7A0A12` / `#5A0810` / accent `#9B1B24`, gold `#C9A84C` / light `#E0C878` / dark `#A68B3A`, off-white `#F5F1EB`, muted `#8A94A6`, WhatsApp green `#25D366`. NO new hues.
- Fonts: Bebas Neue (display), Inter (body), Cairo (Arabic, `html[dir=rtl]`).
- `t()` / `useContent()` / `usePageTitle()` calls, aria attributes, `<picture>` webp markup, form logic & state machine, routes, contract files.
- Reduced-motion CSS block, `:focus-visible` rule, grain overlay (opacity may drop to 0.03).

## New design language

**Geometry — sharp, not soft.** Cards/panels: `border-radius: 2–4px` (was 1.5rem), flat navy fill `rgba(11,27,61,0.55)` (NO backdrop-blur glass), 1px border `rgba(201,168,76,0.22)`. Signature detail: **gold corner ticks** — small L-shaped brackets on two or four corners via the `.corner-ticks` utility. Hover: border brightens to `rgba(201,168,76,0.5)`, translateY(-4px), ticks glow. Shadows: flat, no colored glow.

**Typography — editorial.** Section headers become left-aligned (center only where noted) with: index number `01 / 02 / …` in small gold Bebas with a 40px hairline, small-caps overline, then huge Bebas title. **Ghost text**: oversized background words/numerals (e.g. "GENOA", "1893", "OMAN") rendered as transparent fill + 1px gold/navy stroke (`.text-ghost`), absolutely positioned, `pointer-events-none`, low opacity, aria-hidden.

**Buttons — rectangular with sliding fill.** No pills, no glow. `.btn-primary`: 2px radius, gold fill, navy text, uppercase Inter 600 tracking wide; on hover a darker-gold/navy panel slides in from the left (transform scaleX origin-left) while text turns gold-light — implement with an inner span + ::before. `.btn-outline`: transparent, 1px gold border, gold text; hover fills gold → navy text. Both get tiny corner ticks optional. Keep existing `.hero-cta`-style entrance animations working (classes applied on same elements).

**Slashes & hairlines.** Diagonal `clip-path` cuts: section top/bottom edges get a subtle 2–4° slash where a red-tinted section meets navy (`.slash-top` / `.slash-bottom` utilities); image frames get one diagonal-clipped corner + a 3px gold edge bar. Hairline `1px` gold dividers (`rgba(201,168,76,0.25)`) between stat columns and footer columns instead of cards.

**Marquee.** `.marquee` infinite horizontal ticker (CSS keyframes, duplicate content for seamless loop, pause on hover, respects reduced-motion via existing media block — add `animation: none` there). Used under hero and above footer. Items separated by gold `✦` or `//`.

**Background.** Same red→navy diagonal body gradient. Add a faint repeating diagonal pinstripe on red-tinted sections (CSS `repeating-linear-gradient`, gold 3% opacity).

## Wave A deliverables (design system)

1. **`src/index.css`** (append, keep everything existing):
   - `.btn-primary`, `.btn-outline` (sliding-fill mechanics, both `position:relative; overflow:hidden`)
   - `.card-panel` (flat navy, 2px radius, 1px gold border, transition)
   - `.corner-ticks` (4 ::before/::after-style brackets — implement with two pseudo elements + two child span requirements documented, or a wrapper class `.ticks-wrap` — pick one approach and document it in code comments)
   - `.text-ghost` (`-webkit-text-stroke: 1px rgba(201,168,76,0.35); color: transparent;` + `.text-ghost-navy` variant with navy stroke on lighter bands)
   - `.hairline` (1px gold divider), `.section-index` (gold Bebas number + rule)
   - `.marquee`, `.marquee-track` keyframes `marquee-x { from: translateX(0) to: translateX(-50%) }`, `.marquee:hover .marquee-track { animation-play-state: paused }`; RTL note: animation still translateX-based (fine), but document `dir` behavior in a comment
   - `.slash-top`, `.slash-bottom` (clip-path polygons), `.pinstripe` (repeating-linear-gradient overlay class)
   - Add `animation: none !important` for `.marquee-track` inside the existing prefers-reduced-motion block
2. **`src/components/design/SectionHeader.tsx`** — props: `{ index: string; overline: string; title: ReactNode; align?: 'left' | 'center'; ghost?: string }`. Renders index + overline + h2 Bebas title + optional absolutely-positioned ghost word behind. Reusable in EN/AR (index stays latin digits).
3. **`src/components/design/Marquee.tsx`** — props: `{ items: string[]; className?: string }`. Renders the seamless ticker (items joined by gold `✦`).
4. **`src/components/design/Stat.tsx`** — props: `{ value: string; label: string }` — hairline-separated stat column (Bebas value gold, micro label muted).

## Wave B page direction (what each page becomes)

- **Hero**: full-height; giant ghost "GENOA" behind left column; player image in sharp frame — one diagonal-clipped corner + 3px gold left edge bar + red slash accent behind; chips row replaced by a hairline stat strip (from HERO_CHIPS or ABOUT_STATS); CTA = `.btn-primary` + secondary `.btn-outline` "EXPLORE PROGRAMS" → /programs; Marquee directly under hero with academy claims; scroll cue kept but square-styled.
- **Home sections**: WhyUs = 4 `.card-panel`s with corner ticks + gold index numerals (01–04) instead of icon circles (icons kept, smaller, gold); ProgramsPreview = sharp table-like rows OR ticked cards with ages badge as corner tab; Testimonials = oversized ghost `“` marks, flat panels, hairline top border; CtaBand = full-width red pinstripe band, slash edges, ghost "JOIN" background, `.btn-primary`.
- **About**: header via SectionHeader ghost="1893"; prose with gold first-letter drop cap on paragraph 1 (2px-radius block); stats via `<Stat/>` hairline row; carousel in sharp frame + gold segment progress bars instead of dots (keep pause/aria); coaches = flat panels, initials avatar becomes square gold-outline monogram; Instagram card restyled as ticked panel.
- **Programs**: cards get corner-tab age badges (absolute top-right gold tab, 2px radius), focus as small uppercase micro-label; fees/schedule rows separated by hairlines; FAQ = sharp accordion, gold `+`/rotate, hairline dividers between items (no card per item — one panel with rows); callout = red pinstripe panel with gold left bar.
- **Join/Form**: form panel = `.card-panel` + `.corner-ticks` (large), inputs 2px radius, focus = bottom 2px gold underline instead of full ring; submit = `.btn-primary`; success card matches; consent checkbox square 2px radius.
- **Navbar**: always-on bottom hairline gold border (stronger when scrolled), links gain gold underline-slide hover, JOIN US = `.btn-primary` small; mobile overlay keeps structure, new button style.
- **Footer**: top hairline, optional ghost "GENOA" watermark row, columns separated by hairlines on desktop, bottom bar hairline; links same targets.
- **Privacy/404**: SectionHeader + flat panels; 404 = giant ghost "404" stroke numeral behind solid gold "404".

## Hard rules for implementers
- Do not break `t()`/`useContent()` — restyle around them; keep all aria/role attributes and ids.
- Keep `.reveal`/useGSAP entrance patterns (retime/retarget as needed, footer stays Layout-owned).
- Buttons replacing old ones must keep the same element type (`Link` vs `a` vs `button`) and handlers.
- Watch RTL: prefer logical properties (`ms-/me-/ps-/pe-/start-/end-`) where Tailwind supports them; marquee/ticker works in both dirs.
- `npm run lint` must stay 0 errors; `tsc --noEmit` clean.
