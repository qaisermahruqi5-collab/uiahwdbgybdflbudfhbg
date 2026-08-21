# Genoa Academy Oman — Upgrade & Hardening Plan

> **STATUS: ✅ ALL 5 STAGES COMPLETE (2026-07-17)** — executed by 3 waves of specialist engineers.
> Final gates: `npm run build` ✅ green · `npm run lint` ✅ 0 errors (was 10) · dev-server smoke test ✅ HTTP 200.
> Stage 1 ✅ (form rewrite, config module, deps prune, SEO assets) · Stage 2 ✅ (content, 6 routes, nav/footer) · Stage 3 ✅ (SEO/perf/fonts/WebP) · Stage 4 ✅ (accessibility) · Stage 5 ✅ (EN/AR bilingual + RTL, PWA, README).
> Owner to-do: fill `TODO(OWNER)` drafts in `src/data/content.ts` + `src/data/content-ar.ts`, replace placeholder domain in `public/sitemap.xml` / `robots.txt` / og:image, test one real form submission. See README.md.

**Date:** 2026-07-17 · **Audited by:** 4 parallel specialist auditors (UX/Content, Code/Build, SEO/Perf/A11y, Registration Flow) · **Build status:** `npm run build` ✅ green (0 TS errors, 422 kB JS / 140 kB gzip) · `npm run lint` ❌ 10 errors

---

## 1. What this project is

A marketing + registration website for **Genoa Academy Oman**, a youth football academy in Muscat, Oman.

| Aspect | Reality |
|---|---|
| Stack | React 19 + TypeScript + Vite 7 + Tailwind v3.4 + GSAP + Lenis, HashRouter (3 routes) |
| Pages | `/` hero only · `/about` slideshow + **placeholder text** · `/join` registration form |
| Lead flow | Form → opens WhatsApp (+968 77193523) in new tab **and** fires a hidden form POST to Web3Forms (email → qaisermahruqi10@gmail.com) |
| Brand | Dark red `#7A0A12` / navy `#060F25` / gold `#C9A84C`, Bebas Neue + Inter |
| Hosting target | Static (`dist/` → Netlify/Vercel/cPanel), maintained by a non-technical owner per README |

---

## 2. Verified weak points (audit findings)

### 🔴 Critical — losing leads / shipping unfinished
1. **About page ships literal placeholders** — `[YOUR CONTENT HERE]` title (`AboutPage.tsx:147`) and "Your academy description will go here..." (`:219-221`). The trust-building page is empty.
2. **Registration can silently fail while showing "Thank You!"** — `RegistrationForm.tsx:137-169`: (a) one click spawns **two** new tabs (WhatsApp + Web3Forms POST) — browsers allow only one popup per gesture, so the email POST is frequently blocked; (b) `setSubmitState('success')` fires immediately, response never checked; (c) `setTimeout(removeChild, 2000)` can detach the form mid-submission. **Registrations are being lost.**
3. **Zero trust content** — no programs, age groups, coaches, schedule, fees, location/map, testimonials, or FAQ anywhere; the form even validates ages 4–25 without ever stating which groups exist.
4. **Minors' data (from age 4) collected with no parental-consent checkbox or privacy notice.**

### 🟠 High — correctness, discoverability, maintainability
5. **Dial-code bug** — `selectedCodeCountry = countries.find(c => c.dialCode === …)` returns first match: `+1` shows 🇦🇬 Antigua & Barbuda for US/Canada; `+7` shows Kazakhstan for Russia (`RegistrationForm.tsx:102`).
6. **No spam protection** — no honeypot, no Web3Forms `botcheck`; public access key can be scripted.
7. **SEO near-zero** — no favicon, no Open Graph/Twitter cards, no JSON-LD, no `robots.txt`/`sitemap.xml`; one static `<title>` for all routes; HashRouter fragments aren't indexed as pages.
8. **Config sprawl** — WhatsApp number hardcoded in 3 files (`RegistrationForm.tsx:137`, `WhatsAppButton.tsx:26`, `Footer.tsx:64`), email in 2, Instagram in 4, Web3Forms key inline; README's maintenance instructions are factually wrong (key appears once, not twice; no `redirect` field exists).
9. **ESLint fails with 10 errors** (incl. `react-hooks/set-state-in-effect`, `no-case-declarations`).
10. **Dependency bloat** — ~44 of 51 runtime deps unused by app code (26 radix, recharts, framer-motion, embla…); 53-file `src/components/ui/` scaffold never imported by app code.
11. **Accessibility gaps** — labels not associated with inputs; custom dropdowns have no ARIA/keyboard/Escape/outside-click handling; mobile menu has no focus trap; slideshow autoplays with no pause (WCAG 2.2.2); no `prefers-reduced-motion` anywhere.

### 🟡 Medium — quality & polish
12. `inspectAttr()` dev plugin runs in production builds (`vite.config.ts:9`).
13. Lenis never synced with GSAP ScrollTrigger; `window.scrollTo` desyncs (`Layout.tsx`, `Navbar.tsx:20`).
14. Footer-entrance GSAP block triplicated across 3 pages, escaping `useGSAP` scope.
15. `duration-400` is not a valid Tailwind class (`Navbar.tsx:26`) — transition silently falls back.
16. Footer copyright hardcoded "2025" (`Footer.tsx:102`); current year is 2026.
17. Images: no `width/height` (CLS), no lazy-loading, no WebP (~740 kB JPEG total), `theme-ref.jpg` (dev reference) shipped to production; absolute `/img.jpg` paths conflict with `base: './'`.
18. Google Fonts render-blocking; placeholder text contrast 2.9:1, slideshow dots 2.5:1 (fail AA).
19. UX dead-ends: hero "SCROLL" cue with nothing below; "01 — / 02 —" overline numbering implies a one-pager that doesn't exist; form collects no parent/guardian name, program, or experience level.
20. English-only site for an Omani audience — Arabic/RTL is a real market opportunity.

---

## 3. Upgrade roadmap (staged execution)

> **Stage-Gate rule:** a stage must pass its validation gate before the next starts. Global gate after every stage: `npm run build` ✅ and `npm run lint` ✅ (0 errors).
> **Skill loading:** load `webapp-building` at Stage 1 start (React/TS/Tailwind stack guidance for all implementation stages). No other indexed skill is needed.
> **Sub-agent model:** implementation → `coder`; review/verification → `plan`. Parallel only when scopes don't touch the same files.

### Stage 1 — Critical fixes (P0) · *stop the bleeding*
**Owner type:** 2× `coder` (split A/B below, disjoint files) + 1 `plan` reviewer.

- **A. Registration flow rewrite** (`RegistrationForm.tsx`, new `src/config/site.ts`):
  - Replace hidden-form hack with `fetch` → Web3Forms JSON API; real `idle|submitting|success|error` state machine, error message + retry.
  - WhatsApp becomes an explicit secondary CTA on the success screen (`wa.me` prefilled link) — single tab, user-initiated, unblockable.
  - Add honeypot + `botcheck` field; client-side 60 s resubmit throttle.
  - Add required **parent/guardian name** field + **consent checkbox** + one-line privacy note.
  - Store country by ISO `code`; auto-sync dial code from country (manual override allowed) — kills the +1/+7 flag bug.
  - Move age bounds (4–25) and all contact details into `src/config/site.ts`; replace all 10 hardcoded occurrences (WhatsApp ×3, email ×2, Instagram ×4, key ×1) with imports.
- **B. Quick correctness fixes** (Navbar, Footer, Layout, vite.config, pages):
  - Dynamic footer year; `duration-400`→`duration-300`; fix `no-case-declarations`; delete dead `App.css`, unused refs.
  - Gate `inspectAttr()` behind dev mode; sync Lenis with `ScrollTrigger.update`; use `lenis.scrollTo` on route change.
  - Move triplicated footer GSAP into `Layout.tsx` once.
  - Delete `public/theme-ref.jpg` from production output.
  - Fix README's wrong key/`redirect` instructions to point at `src/config/site.ts`.
- **Gate:** build + lint green; form submits successfully and shows honest success/error states (manual test via dev server).

### Stage 2 — Content & information architecture (P0/P1) · *make it sell*
**Owner type:** 1 `coder` (structure) + 1 `plan` (content review). Copy deck already drafted by UX auditor (e.g., About headline **"FORGED IN GENOA. BUILT IN MUSCAT."** + heritage/methodology body + stat chips).

- Fill About page with real copy; kill the placeholders.
- Add trust sections (as new routes or long-page sections): **Programs by age group** (U8–U18), **Coaches**, **Schedule & Fees**, **Location** (embedded map + Muscat address), **Testimonials**, **FAQ** (accordion — the shadcn accordion already exists).
- Enrich hero: add 2–3 credibility stat chips + secondary "Explore programs" CTA so the SCROLL cue isn't a dead-end (or add a sections strip on home).
- Form upgrade: add **program/age-group selector** and experience level so leads are routable.
- Fix heading hierarchy (one `h1` per page); drop or rethink the "01/02" numbering.
- **Gate:** build green; every route reachable from nav/footer; no placeholder text anywhere (`grep -ri "your content here\|will go here"` returns nothing).

### Stage 3 — SEO, performance & assets (P1)
**Owner type:** 1 `coder` + 1 `plan` (Lighthouse-style checklist review).

- Favicon (from logo), OG/Twitter meta, per-route `<title>`/description (small hook), `SportsActivityLocation` JSON-LD (Muscat, +96877193523, Instagram `sameAs`), `robots.txt`, `sitemap.xml`.
- Decide routing: keep HashRouter (zero host config) **or** switch to BrowserRouter + host rewrite rules — decision recorded with owner.
- Images → WebP with fallback, explicit `width/height`, `loading="lazy"` on slides 2–3, `fetchpriority="high"` on hero image; self-host fonts via `@fontsource` (or preload woff2); raise placeholder/dot contrast to AA.
- Prune ~44 dead deps + unused `ui/` scaffold (or keep only what Stage 2 uses); add `manualChunks` vendor split.
- Global `prefers-reduced-motion` handling (Lenis, GSAP, grain, pulse rings, slideshow).
- **Gate:** build green; bundle/install size measurably smaller; meta verified in served HTML.

### Stage 4 — Accessibility & interaction polish (P1)
**Owner type:** 1 `coder` + 1 `plan` (keyboard/screen-reader walkthrough).

- Labels ↔ inputs (`id`/`htmlFor`), `aria-invalid`/`aria-describedby`, `role="alert"` errors.
- Dropdowns: full ARIA listbox pattern (or adopt installed `@radix-ui/react-select`), Escape/outside-click close, arrow-key navigation.
- Mobile menu: focus trap, Escape close, scroll-lock, `aria-hidden` background.
- Slideshow: pause control + pause on hover/focus/touch, `aria-roledescription="carousel"`, bigger dots.
- Global `:focus-visible` styling; add `/privacy` note page; new `404` route.
- **Gate:** full keyboard-only walkthrough of nav + form + slideshow passes.

### Stage 5 — Enhancements (P2, optional / owner-approved)
- **Arabic/RTL bilingual toggle** (EN/AR) — biggest market lever for Oman; Arabic-capable font (Cairo/IBM Plex Sans Arabic), `dir="rtl"`, localized validation + WhatsApp template.
- Analytics (privacy-friendly, e.g. Plausible/umami) + conversion events on form submit.
- Gallery with lightbox; Instagram feed strip; PWA manifest.
- `.env`-based keys (`VITE_WEB3FORMS_KEY`) so the owner never touches TSX.

---

## 4. Effort & priority summary

| Stage | Theme | Severity addressed | Est. effort |
|---|---|---|---|
| 1 | Critical form/config fixes | 🔴 #2, #4, 🟠 #5, #6, #8–#11 (part), 🟡 #12–#16 | ~1 day |
| 2 | Content & IA | 🔴 #1, #3, 🟡 #19 | 1–2 days (needs owner inputs: fees, schedule, coach bios, photos) |
| 3 | SEO & performance | 🟠 #7, 🟡 #17, #18 + dep prune | ~1 day |
| 4 | Accessibility | 🟠 #11, 🟡 #18 (contrast) | ~0.5–1 day |
| 5 | Bilingual & extras | 🟡 #20 + growth | 1–2 days, optional |

**Owner inputs needed for Stage 2+:** real About text (or approve drafted copy), program/age-group details, fees & schedule, coach names/photos, training venue address, 3+ real photos for gallery/slides.

---

## 5. Execution protocol (when approved)

1. Work only inside this workspace; never overwrite original assets — optimized images get new filenames.
2. After each stage: `npm run build` + `npm run lint` + quick dev-server smoke test; report per-stage diff summary.
3. Keep the brand system intact (red/navy/gold, Bebas/Inter) — enhancements, not redesign.
4. `README.md` updated at the end to match the new config-file workflow.
