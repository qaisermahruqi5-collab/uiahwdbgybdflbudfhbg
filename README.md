# Genoa Academy Oman — Owner's Handbook

Welcome! This is the upgraded website for **Genoa Academy Oman**, a youth football academy in Muscat, Oman. This guide tells you, in plain language, where everything lives and how to update it.

## What the Site Is

- **Pages:** Home, The Academy, Programs (schedule + full pricing), News, Calendar & Training Schedule, Join (registration form), Privacy, and a friendly 404 page.
- **Age groups:** U6, U8, U10, U12, U14 and U16 — players aged 5 to 16. All training runs Sunday, Tuesday and Wednesday, with families choosing 2 or 3 sessions per week.
- **Bilingual:** English and Arabic, with an EN/AR toggle in the navigation. Arabic switches the whole site to right-to-left (RTL) automatically.
- **Registration:** The Join form emails applications to you via Web3Forms, with WhatsApp as a backup contact option.

---

## HOW TO EDIT YOUR INFO

### Contact details & keys — one file only

Open **`src/config/site.ts`**. Every contact detail on the site comes from this one file:

| Key | What it controls |
|-----|------------------|
| `name` | Academy name shown across the site |
| `whatsappNumber` | WhatsApp number for links (country code + number, **no** `+` sign) |
| `whatsappDisplay` | The pretty number shown to visitors (e.g. `+968 9121 1599`) |
| `email` | Contact email address |
| `instagramUrl` | Link to your Instagram profile |
| `instagramHandle` | The @handle shown on screen |
| `web3formsKey` | The key that delivers form submissions to your inbox |
| `web3formsEndpoint` | Web3Forms API address (leave as-is) |
| `location` | City/country line (e.g. `Muscat, Oman`) |
| `ageMin` / `ageMax` | Age range accepted by the registration form |

> **⚠️ Changing `email` does NOT change where applications are delivered.** The destination inbox is baked into `web3formsKey` by Web3Forms — `email` only controls the address shown on the site and used as the reply-to. To move delivery, get a new key at [web3forms.com](https://web3forms.com) (enter the new address, they email you a key), paste it into `web3formsKey`, rebuild, and send one test application to confirm it lands.

### Text content — one English master + Arabic translations

- **`src/data/content.ts`** — the marketing copy: hero taglines, feature cards, The Academy copy and stats, age-group names and descriptions, pricing tables, what's included, terms & policies, coaches and FAQs. Anything still needing your information is marked `TODO(OWNER)` (currently just the venue name).
- **News posts and the training schedule are NOT in this file** — they live in `content/news.json` and `content/schedule.json` and are edited from the dashboard or Telegram. See *Editing news & the calendar* below.
- **`src/data/content-ar.ts`** — the matching Arabic translations. When you change English text, update the Arabic copy to match (or ask your developer/translator).

### Prices, days and times

All programme figures live in **`src/data/content.ts`**:

- `PROGRAMS` — one entry per age group (U6 → U16): ages and description. Its days and times come from `content/schedule.json`, edited from the dashboard or the bot.
- `TERMS` — read from `content/schedule.json`; edit the term weeks in the dashboard.
- `PRICE_BANDS` — the fee tables. Prices are grouped into two bands (`u6u8` and `u10u16`); each band has one row for **2 sessions / week** and one for **3 sessions / week**, with each term's upfront price, its monthly instalment, and the Full Season price.
- `INCLUDED` — the "what every registered player receives" list.
- `POLICIES` — the terms, payment, cancellation and refund summaries.

Change a number in one of these arrays and it updates everywhere it appears (programme cards, pricing tables, calendar, FAQ answers are written separately in `FAQS`).

### News posts

News is no longer edited in code — see *Editing news & the calendar* below.

---

## HOW TO UPDATE IMAGES & VIDEOS

Every photo and video on the site lives in **one** slideshow, listed in **`src/data/media.ts`**.

1. Drop the new file into **`public/`**.
2. Add an entry to `GALLERY_MEDIA` in `src/data/media.ts` — `kind: 'image'` (with `jpg`, `webp`, `width`, `height`) or `kind: 'video'` (with `src`, `poster`, `width`, `height`). The `index` number is used in the alt text.
3. Each photo also wants a smaller `.webp` copy that the site prefers for speed. Either ask your developer, or run this one-liner (needs Python + Pillow):

   ```bash
   python -c "from PIL import Image; Image.open('public/media-1.jpg').save('public/media-1.webp', quality=80)"
   ```

The logo (`public/logo.png`, transparent background), the hero photo (`public/player.jpg` / `.webp`) and the app icons are separate — replace those files in place, keeping the same filenames.

---

## HOW TO BUILD & HOST

```bash
npm install     # first time only
npm run build   # produces the dist/ folder
```

Upload **everything inside `dist/`** to your host:

- **Netlify (free, easiest):** sign up at netlify.com, drag the `dist/` folder onto the dashboard. Live instantly.
- **Vercel (free):** sign up at vercel.com, `npm i -g vercel`, then `cd dist && vercel --prod`.
- **cPanel / traditional host:** File Manager → `public_html/` → upload all `dist/` contents.
- **GitHub Pages (free):** push `dist/` contents to a repo → Settings → Pages → deploy from branch.

---

## BEFORE GOING LIVE — Checklist

- [ ] **Domain:** replace the placeholder domain in `public/sitemap.xml` and `public/robots.txt`, and set the absolute `og:image` URL in `index.html` (each spot is marked with a `TODO(owner)` comment).
- [ ] **Content:** fill every `TODO(OWNER)` item in `src/data/content.ts` (and mirror it in `src/data/content-ar.ts`) — currently just the training venue name in the FAQ.
- [ ] **News:** replace the three seeded posts using the dashboard at `/admin/` or the Telegram bot.
- [ ] **Prices:** confirm the figures in `PRICE_BANDS` still match the current Programme & Pricing Guide before launch.
- [ ] **Form test:** submit a real test registration and confirm the email arrives in your inbox.
- [ ] **Spam protection:** enable reCAPTCHA for your key in the Web3Forms dashboard.
- [ ] **Analytics (optional):** in `index.html`, replace `your-domain.com` and uncomment the Plausible snippet marked `ANALYTICS (optional)`.

---

## SECURITY

### Security headers

**`netlify.toml`** sets a full header suite on every response — a Content Security Policy, HSTS, `X-Frame-Options: DENY` and `frame-ancestors 'none'` (clickjacking), `nosniff`, a locked-down `Permissions-Policy`, and a strict referrer policy. These headers are what a scanner like [securityheaders.com](https://securityheaders.com) grades you on, so run it once the site is live.

The CSP is written against exactly what this site loads. **If you add anything third-party — an analytics script, a Google Font, a YouTube embed, a booking widget — the browser will block it until you widen the matching directive.** Symptoms are always the same: the thing silently doesn't appear, and the browser console shows a "Refused to load…" message naming the directive to change.

One special case: the CSP pins the inline structured-data (JSON-LD) block in `index.html` by hash. If you edit that block, regenerate the hash:

```bash
npm run csp-hash
```

Paste the printed value into the `script-src` directive in `netlify.toml`. Skipping this doesn't break the site — only your structured data stops being read by search engines.

**Hosting somewhere other than Netlify?** The headers live only in `netlify.toml`, which other hosts ignore. Reproduce the same set in your host's config (Vercel → `vercel.json` `headers`; Cloudflare Pages → a `_headers` file; Apache → `.htaccess`; nginx → `add_header`). Without them the site still works, but you lose the protection.

### The registration form

The form posts to Web3Forms from the visitor's browser, so **the access key is visible in the page source — that is normal and unavoidable for any static site with no backend.** The key can only submit to your form; it can't read past submissions. To stop anyone abusing it:

- Turn on **captcha** (hCaptcha or reCAPTCHA) for the key in your Web3Forms dashboard.
- Set the **allowed domain** for the key to your production domain, so submissions from anywhere else are rejected.

The form already carries a hidden honeypot field, a duplicate-submission guard, length caps on every input, and required parental consent.

### Keeping dependencies clean

```bash
npm audit          # lists known vulnerabilities
npm outdated       # lists packages behind their latest release
```

Worth running before each deploy.

---

## EDITING NEWS & THE CALENDAR (no code)

News posts and the training schedule live in `content/news.json` and
`content/schedule.json`. Two editors write to those files; both commit to
GitHub, which triggers a Netlify rebuild. **Changes appear on the site about
1–2 minutes after you publish.** Every edit is a real commit, so anything can
be reverted from the repo's history.

### The dashboard

Go to **`/admin/`** on your site (e.g. `yoursite.com/admin/`). It is
`noindex`-ed and not linked from anywhere.

- **News** — add, edit, reorder and delete posts; drag a photo straight onto a
  post. Photos are resized in your browser before upload, so a 12MP phone
  picture never travels at full size.
- **Calendar** — change each squad's days, winter/summer slots and session
  length, plus the term weeks. Squads cannot be added or removed here; that is
  a code change, deliberately.
- Arabic sits beside every English field. **Leave Arabic blank and the English
  text is shown to Arabic visitors** — nothing breaks.
- Click **Publish**, then re-enter the admin passcode.

### The Telegram bot

Message your bot. It ignores everyone until they send the admin passcode, then
unlocks that chat for 12 hours and deletes the passcode message.

| Command | What it does |
|---|---|
| `/news` | Guided post: headline → summary → photo → Arabic → preview → `/publish` |
| `/schedule` | Change one squad's times |
| `/list` | Show recent posts and their ids |
| `/delete <id>` | Remove a post |
| `/who` | Who is signed in right now |
| `/revoke <id>` | Sign someone out |
| `/lock` | Sign yourself out |
| `/cancel` | Abandon the current draft |

Bot photos are JPEG only (converting to WebP would need a native image library
in the function); the site treats WebP as optional and serves the JPEG. Upload
through the dashboard instead if you want both formats.

Arabic **times** are mirrored automatically (`PM` → `مساءً`). Arabic **prose**
is never machine-translated — the bot asks for it, or falls back to English.

### How access works

There is no pre-shared list of allowed Telegram accounts. The bot is publicly
reachable — bot usernames are searchable — so **the passcode is the gate**:

- Anyone may open a chat, but nothing happens until they send the passcode.
- A correct passcode unlocks that chat for 12 hours and adds it to the
  authorised list automatically.
- Five wrong attempts locks that chat out for an hour.
- **The passcode is re-checked on every single publish**, in the dashboard and
  the bot alike, and it is enforced on the server — not just in the interface.
  A signed-in laptop left open still cannot publish.

**If the passcode leaks, change `ADMIN_PASSWORD` in Netlify and redeploy.**
That instantly invalidates every unlocked chat and every dashboard session.

### Environment variables

Set in **Netlify → Site configuration → Environment variables**, all scopes:

| Key | Purpose |
|---|---|
| `ADMIN_PASSWORD` | The one passcode, for both the dashboard and the bot |
| `ADMIN_SESSION_SECRET` | Signs session cookies — any long random string |
| `GITHUB_REPO` | `owner/name` of this repository |
| `GITHUB_TOKEN` | Fine-grained token, **Contents: read and write**, this repo only |
| `TELEGRAM_BOT_TOKEN` | From BotFather |
| `TELEGRAM_WEBHOOK_SECRET` | Long random string, also given to Telegram below |

### If you cannot sign in to `/admin/`

The sign-in screen now tells you which of these it is. Read the red message
under the passcode box before changing anything.

| What the screen says | What is actually wrong |
|---|---|
| *"This site is not finished being set up: … is not set on the server"* | That environment variable is missing in Netlify. Add it (**all scopes**) and redeploy. **Retrying the passcode cannot help** — no passcode matches when none is configured. |
| *"Incorrect passcode. N attempt(s) left."* | The passcode really is wrong. `ADMIN_PASSWORD` in Netlify is the exact string to type — no quotes, and watch for a trailing space when pasting. |
| *"Too many incorrect attempts…"* | Five wrong tries locks your IP for an hour. Wait it out, or redeploy the site to clear the counter. |
| *"…the sign-in cookie requires https"* | The site is being served over `http://`. Netlify → Domain management → HTTPS, provision the certificate, turn on **Force HTTPS**. |
| *"Signed in, but GITHUB_TOKEN … is not set"* | Sign-in worked; the editor just cannot reach the content. Add the GitHub variables and redeploy. |
| *"The sign-in function is not deployed"* | The build did not publish the functions. Check Netlify → Deploys succeeded, and that the site is connected to this repository rather than a dragged-in `dist/` folder. |
| Nothing at all happens, and no build stamp shows under the button | `/admin/app.js` never ran. Hard-refresh (Ctrl+Shift+R). If the stamp is still blank, check the browser console. |

The small grey text under the **Sign in** button is the editor build stamp. If
it does not change after a deploy, you are looking at a cached copy of the old
page — hard-refresh before debugging anything else.

Once you are signed in, **`/api/admin/health`** reports which variables are set
(never their values) and whether GitHub is reachable.

---

### Connecting the Telegram bot

Open the dashboard at `/admin/`, go to the **Bot** tab, and press
**Connect bot**. That is the whole procedure — no terminal, and no handling the
bot token yourself. The function already holds the token and the webhook
secret, and tells Telegram where to deliver messages.

The Bot tab also shows live status: whether Telegram is pointed at this site,
how many messages are queued, and the last error Telegram reported. Press
**Connect bot** again whenever the site's address changes.

---

## TECH NOTES

- **HashRouter** is used (`/#/about`-style URLs) so the site works on any static host with **zero configuration**. If you later want cleaner URLs and better SEO, switch to BrowserRouter and add rewrite rules on your host — a small developer task.
- **Fonts are self-hosted** (Bebas Neue + Inter), so no external font requests and no layout shift.
- **The form submits via Web3Forms** using a background fetch (no page redirect), includes spam honeypot + consent checkbox, and **WhatsApp remains a backup CTA** throughout the site.

---

**Built with:** React 19 · TypeScript · Vite · Tailwind CSS · GSAP · Lenis · Web3Forms
**For:** Genoa Academy Oman — Muscat, Oman
