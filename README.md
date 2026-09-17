# Genoa Academy Oman — Owner's Handbook

Welcome! This is the website for **Genoa Academy Oman**, a youth football academy in Muscat, Oman. This guide tells you, in plain language, where everything lives and how to update it.

## What the Site Is

- **Pages:** Home, Academy (with the Pathway, Coaches and Location sections), Programs & Fees, FAQ, News, Calendar & Training Schedule, Register, Privacy, and a friendly 404 page.
- **Age groups:** U6, U8, U10, U12, U14 and U16 — players aged 5 to 16. All training runs Sunday, Tuesday and Wednesday, and families choose **2 or 3 training days per week** (two of those three days, or all three).
- **Bilingual:** English and Arabic, with an EN/عربي toggle in the navigation. Arabic switches the whole site to right-to-left (RTL) automatically.
- **Registration:** The Register form emails applications to you via Web3Forms, with WhatsApp as a backup contact option.

### Two words that must never blur again

A stakeholder review found the word *session* being used for two different things, and it confused parents. The site now keeps them apart, everywhere — pages, the registration form, the notification email, the FAQ, Studio and the Telegram bot:

| Word | Means | Example |
|---|---|---|
| **Duration** | How long **one** training lasts | 60 minutes (U6–U8), 90 minutes (U10–U16) |
| **Training days per week** | How **often** a child trains | 2 or 3 |

If you are writing new copy: never write "session time" or "2 sessions a week".

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

### PRICES — one file, and only one

**Every price on the site comes from `src/data/pricing.ts`, as numbers.** Nothing else on the site contains an amount: the Programs tables, the age-group blocks, the homepage "from" figures, the live totals in the registration form and the figures in the notification email all read from that file and format them the same way (`OMR 195`).

That means:

- **To change a fee, change it once**, in `PRICING_BANDS` in `src/data/pricing.ts`. Everywhere it appears updates together.
- **Do not put prices in the Arabic file.** `src/data/content-ar.ts` deliberately has none — Arabic and English render the same numbers, so they cannot drift apart.
- The *saving* shown under each Full Season price (`Save OMR 50 vs. paying term by term`) is **calculated**, not typed. It is the three terms added up, minus the season price.

> **Why the three terms added up (485 / 670 / 500 / 685) never appears as a price:** in the review those numbers read like a second, more expensive price list. They are only the arithmetic behind the discount, so the code uses them solely inside the "you save X" line. Please keep it that way.

The same file also holds the season's structure: how many weeks each term runs and **how many monthly instalments it is paid over** (3 / 2 / 3). Those counts are why "OMR 65 a month" is never ambiguous.

### Term dates — edited in Studio, not in code

Term **labels** ("Term 1") stay the same year to year; only the **dates** change. So the dates live in `content/schedule.json` and are editable from Studio → Calendar, like the training times. Each August, open Studio and update the three date lines. Nothing else needs touching.

### Text content — one English master + Arabic translations

- **`src/data/content.ts`** — the marketing copy: hero taglines, feature cards, Academy copy and stats, the five Pathway stages, the venue details, age-group descriptions, what your child gets, terms & policies, and the FAQ. Anything still awaiting your answer is listed in `OPEN_ITEMS` and shows on the site as a visibly-marked "to be confirmed" note — never as an invented fact.
- **`src/data/coaches.ts`** — the coaching staff. Adding a coach is an edit to this file only; see *Adding a coach* below.
- **News posts, the training schedule and the term dates are NOT in these files** — they live in `content/news.json` and `content/schedule.json` and are edited from Studio or Telegram. See *Editing news & the calendar* below.
- **`src/data/content-ar.ts`** — the matching Arabic translations. When you change English text, update the Arabic copy to match (or ask your developer/translator). Arabic groups and FAQ items are matched **by position**, so keep the two files in the same order.

### Adding a coach

Open **`src/data/coaches.ts`** and add an entry. Each coach has a name, role, credential line, languages, a short card bio and an optional longer `detail` list that appears behind "Read more".

1. Put the portrait in `public/` (e.g. `public/coach-name.jpg`, plus a `.webp` twin for speed — see *How to update images* below).
2. Fill in `photo` with both paths and the pixel size. Portraits are cropped to a 3:4 shape automatically, so any portrait-ish photo works.
3. Set `status: 'confirmed'`.

Entries left as `status: 'placeholder'` render as an obviously-empty slot labelled "Open position", so an unfinished card can never be mistaken for a real person. There are none in the file at the moment — add one in **Studio → Coaches** when a position opens, and it starts as an open slot until you switch it to Confirmed.

### Programme details, days and times

- `PROGRAMS` in `src/data/content.ts` — one entry per age group (U6 → U16): the age line and the description. Its days, time, duration and the per-week choice all come from `content/schedule.json`, edited from Studio or the bot.
- `INCLUDED` — the "what your child gets" list (the client-approved wording).
- `POLICIES` — the terms, payment and cancellation summaries.
- `FAQ_GROUPS` — the FAQ page, grouped into sections. **Each question's `id` is a web address** (`/#/faq#faq-instalments`), so people can be sent straight to one answer. Changing an `id` breaks links that have already been shared — add new questions rather than renaming old ones.

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
- [ ] **Open items:** answer the five questions in *WAITING ON YOU* below, then replace the matching entries in `OPEN_ITEMS` (`src/data/content.ts`) and their Arabic twins.
- [ ] **Coaches:** supply the remaining names, roles and photographs, and fill in the two placeholder slots in `src/data/coaches.ts`.
- [ ] **News:** replace the three seeded posts using Studio at `/studio/` or the Telegram bot.
- [ ] **Prices:** confirm the figures in `PRICING_BANDS` (`src/data/pricing.ts`) still match the current Programme & Pricing Guide before launch.
- [ ] **Term dates:** confirm this season's three date ranges in Studio → Calendar.
- [ ] **Form test:** submit a real test registration and confirm the email arrives in your inbox.
- [ ] **Spam protection:** enable reCAPTCHA for your key in the Web3Forms dashboard.
- [ ] **Analytics (optional):** in `index.html`, replace `your-domain.com` and uncomment the Plausible snippet marked `ANALYTICS (optional)`.

---

## WAITING ON YOU — four open questions

The site is complete and live-able, but four things could not be written
because nobody has the answer yet. **None of them has been guessed at.** Each
one shows on the site as a visibly-marked *"(to be confirmed)"* note, and each
is listed in `OPEN_ITEMS` in `src/data/content.ts` (with its Arabic twin in
`src/data/content-ar.ts`). Answer one, replace its text in both files, and the
"to be confirmed" label goes away on its own.

| # | The question | Where it shows now |
|---|---|---|
| 1 | **Is there a one-off registration fee?** How much, and is it included in or added to the first payment? The Programme & Pricing Guide does not mention one; the review discussion did. | Programs page, under the fees · FAQ → Fees & payment |
| 2 | **Are monthly instalments equal or front-loaded?** The published monthly figures are equal per month. A 50% / 25% / 25% split was discussed — confirm before changing anything, because the figures on the site are the guide's. | Programs page, under the fees |
| 3 | **Coach names and photographs** beyond Ivan Potepan and Yaqoob Al Sawafi. | Not shown on the site — the open-position cards were removed. Add each coach in **Studio → Coaches** |
| 4 | **Getting here, parking and drop-off** — the practical arrival note for training evenings. | FAQ → Location |

Also worth a decision:

- **Refund & cancellation policy.** The site says the written policy is shared at
  registration, because no published summary exists yet. Send the wording and it
  can go on the page.
- **`src/config/site.ts` → `web3formsKey`.** Registrations still land in
  `qaisermahruqi10@gmail.com`, not the `GAO@genoaacademyom.com` address shown on
  the site. Generate a new Web3Forms key for that inbox when you want delivery
  moved.

---

## SECURITY

### Security headers

**`netlify.toml`** sets a full header suite on every response — a Content Security Policy, HSTS, `X-Frame-Options: DENY` and `frame-ancestors 'none'` (clickjacking), `nosniff`, a locked-down `Permissions-Policy`, and a strict referrer policy. These headers are what a scanner like [securityheaders.com](https://securityheaders.com) grades you on, so run it once the site is live.

The CSP is written against exactly what this site loads. **If you add anything third-party — an analytics script, a Google Font, a YouTube embed, a booking widget — the browser will block it until you widen the matching directive.** Symptoms are always the same: the thing silently doesn't appear, and the browser console shows a "Refused to load…" message naming the directive to change.

Two things already depend on this:

- **The map** in the Location section is a Google Maps iframe, so the CSP allows `frame-src https://www.google.com`. Remove the map and you can remove that directive; change map providers and you must change it.
- The CSP pins the inline structured-data (JSON-LD) block in `index.html` by hash. If you edit that block, regenerate the hash:

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

### Studio — the editor

Go to **`/studio/`** on your site (`genoaacademyom.com/studio/`). It is
`noindex`-ed and linked from nowhere. `/admin/` redirects here.

- **News** — posts are a list of closed rows; open one to edit it. A post needs
  four things: headline, date, summary, and optionally a photo. Arabic and the
  category/web-address settings fold away, labelled so you can see at a glance
  whether they hold anything. The web address writes itself from the headline
  until you edit it by hand.
- Photos are resized in your browser before upload, so a 12MP phone picture
  never travels at full size.
- **Calendar** — change each squad's days, its training time, how long one
  length, plus the term weeks. Squads cannot be added or removed here; that is
  a code change, deliberately.
- **Status & Bot** — who is on the site right now, applications today, whether
  publishing still works, when the GitHub token expires, and the Telegram
  webhook.
- Arabic sits beside every English field. **Leave Arabic blank and the English
  text is shown to Arabic visitors** — nothing breaks.
- Click **Publish**, then re-enter the admin passcode.

#### The Status & Bot tab

| Shows | Where it comes from |
|---|---|
| Reading the website / In Studio | Browser tabs that reported in during the last 3 minutes |
| Applications today, and a 7-day chart | The website confirming a successful send |

Publishing problems are not listed here. They appear as a red notice when you
open Studio, and only when something is actually wrong: the token cannot write,
or it is within fourteen days of expiring. An expired token otherwise stops
publishing with no warning at all, which is why that one notice remains.

##### What the presence counter stores, and what it does not

**Stored:** a random id the browser invents for its own tab, which side it is on
(website or Studio), and a timestamp. Entries expire after three minutes and are
deleted on the next read.

**Not stored:** no cookie, no IP address, no user agent, no page or referrer,
nothing that survives closing the tab, and nothing that can be joined up across
visits. The id lives in `sessionStorage`, so it dies with the tab and is never
the same twice.

It answers *is anyone here right now*, and is built so that it cannot answer
anything else — a presence light, not analytics. It sets no cookie, so it needs
no cookie banner. If you would rather not have it at all, delete the
`startPresence()` call in `src/main.tsx` and the two "right now" tiles simply
stop counting; nothing else changes.

Application counts begin from when the feature was added, and count the website
confirming a successful send. **The Web3Forms emails remain the record** of what
was actually received — this is a convenience figure, not an authority, and a
visitor who closes the tab mid-send may not be counted.

#### How sign-in works, and why it is built this way

Signing in is an **ordinary HTML form POST**, not a background `fetch`. This is
the important part of the design, and it is worth knowing why.

The previous dashboard signed in with `fetch()`. A fetch that is blocked or
stalled never settles, never throws and fires no event — so the page had
nothing to react to and nothing to display, and the button simply sat there
reading "Signing in…" forever. No amount of better error handling could catch
a failure that produces no signal at all.

A form POST cannot fail that way. The browser owns the navigation: it either
lands on the desk or shows its own error page. Sign-in works with JavaScript
switched off entirely, and every failure is rendered by the server, so a
broken script cannot hide it.

Three further defences sit behind that:

| Defence | Against |
|---|---|
| Every route answers on two paths — `/studio-io/*` and the older `/api/admin/*` — and the editor falls back automatically | Ad blockers and filter lists that match on URL shape. `/api/admin/*` is a common rule, and a request killed that way never reaches the network |
| Sessions are accepted from an `Authorization` header as well as the cookie | Browsers that silently discard a `Secure` `SameSite` cookie (Safari tracking prevention, "block all cookies", locked-down profiles) |
| Every request has a hard 25-second cap, and every failure puts a sentence on screen | Anything that stalls rather than fails |

**`/studio/check.html`** runs all of those probes in your own browser and
reports what does and does not work. It needs no passcode, has no side
effects, and cannot consume a sign-in attempt. It is the first thing to open
if anything misbehaves.

### The Telegram bot

Message the bot and send the admin passcode. It replies with a menu, and from
there **everything is a button** — you never have to remember a command.

| Button | What happens |
|---|---|
| 📝 Write a news post | Four short answers: headline, summary, photo (optional), Arabic (optional). You see the finished post and nothing goes live until you tap **Publish**. |
| 🗓 Change training times | Pick a squad from the buttons, then change its training time and the duration of one training. Skip anything you want left alone. |
| 📰 Recent posts | The latest posts, each with a delete button — no ids to copy. |
| ❓ How this works | The same explanation, in the chat. |
| 🔒 Sign out | Ends the 12-hour session. |

Typing still works for anyone who prefers it — `/menu`, `/news`, `/schedule`,
`/list`, `/skip`, `/publish`, `/cancel`, `/help`, `/lock` — and Telegram's ☰
menu lists them. Typed and tapped run the same code, so the two cannot drift
apart.

**Your work is not lost by accident.** Tapping the menu or typing a command
mid-draft no longer throws the draft away; the bot says you are in the middle
of something and offers to cancel. Drafts expire after two hours so a forgotten
one cannot swallow the next thing you send.

**Skipping means the right thing wherever you are.** At the photo step it moves
past the photo; at the Arabic step it skips both Arabic fields. Where nothing
can be skipped — the headline, the summary — it says so rather than storing the
word as your answer.

Arabic **times** are mirrored automatically (`PM` → `مساءً`). Arabic **prose**
is never machine-translated: the bot asks, and blank Arabic falls back to
English on the website. Photos sent through Telegram are JPEG only; upload
through Studio if you want a WebP twin as well.

> **Button taps and the webhook.** Telegram only delivers the update types a
> webhook asked for when it was registered, and taps arrive as
> `callback_query`. A webhook registered before the buttons existed answers
> typed commands perfectly and ignores every tap — no error anywhere, because
> the tap is never delivered.
>
> The bot repairs this itself: it checks its own registration once an hour and
> re-registers if taps are not being delivered, then says so in the chat. You
> can also force it immediately with **Connect bot** in Studio, and the Status
> & Bot tab flags the broken state rather than reporting a healthy-looking
> "Connected".

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

### If you cannot sign in to `/studio/`

Open **`/studio/check.html`** first — it tells you in seconds whether this is
a server problem or a browser problem. Then match the message you saw:

| What you see | What is actually wrong |
|---|---|
| *"This site is not finished being set up: … is not set"* | That environment variable is missing in Netlify. Add it (**all scopes**) and redeploy. **Retrying the passcode cannot help** — no passcode matches when none is configured. |
| *"Incorrect passcode. N attempt(s) left."* | The passcode really is wrong. `ADMIN_PASSWORD` in Netlify is the exact string to type — check for wrapping quotes or a trailing space, which count as part of the value. |
| *"Too many incorrect attempts…"* | Five wrong tries locks **your IP** for an hour. The counter lives in Netlify Blobs, so redeploying does **not** clear it — wait it out, or sign in from another network (a phone hotspot is a different IP). |
| *"…the sign-in cookie requires https"* | The site was served over `http://`. Netlify → Domain management → HTTPS, provision the certificate, turn on **Force HTTPS**. |
| Signed in, but the desk says the session was not accepted | The cookie did not stick. The header-token fallback normally covers this; if it persists, check `/studio/check.html` for the cookie test. |
| Both paths time out in the connection check | Something between the browser and the site is blocking requests. Try a private window with extensions off, another browser, then mobile data. |

The grey text under the **Sign in** button is the build stamp. If it does not
change after a deploy, you are looking at a cached page — hard-refresh
(Ctrl+Shift+R) before debugging anything else.

`/api/admin/setup-check` (and `/studio-io/check`) reports which environment
variables are unset, by name and without ever returning a value. Once signed
in, `/api/admin/health` adds whether GitHub is reachable.

### Connecting the Telegram bot

Open Studio at `/studio/`, go to the **Bot** tab, and press
**Connect bot**. That is the whole procedure — no terminal, and no handling the
bot token yourself. The function already holds the token and the webhook
secret, and tells Telegram where to deliver messages.

The Bot tab also shows live status: whether Telegram is pointed at this site,
how many messages are queued, and the last error Telegram reported. Press
**Connect bot** again whenever the site's address changes.

---

## TECH NOTES

- **HashRouter** is used (`/#/about`-style URLs) so the site works on any static host with **zero configuration**. If you later want cleaner URLs and better SEO, switch to BrowserRouter and add rewrite rules on your host — a small developer task.
- **Deep links to sections.** Because the URL's one `#` is already spent on the route, the browser never scrolls to `#coaches` by itself. `src/components/ScrollToHash.tsx` does it, and it is the single owner of scroll position after any navigation — don't add a second scroll-to-top anywhere. Sections that can be linked to carry the `.scroll-anchor` class so the sticky header does not cover the heading; the offset is defined twice on purpose (`NAV_OFFSET` in that file, `scroll-margin-top` in `src/index.css`) and the two must stay in step.
- **Register links carry the choice.** Every Register button that sits next to an age group builds its URL through `src/lib/registerLink.ts` — `/#/register?age=U10&frequency=3&term=term1` — and the form reads those parameters once on mount. Anything it does not recognise is dropped and that field starts empty, so an old or hand-edited link degrades instead of breaking. `/#/join` still works and redirects to `/#/register`, query string intact, because older links and messages point at it.
- **Fonts are self-hosted** (Bebas Neue + Inter + Cairo), so no external font requests and no layout shift.
- **The form submits via Web3Forms** using a background fetch (no page redirect), includes spam honeypot + consent checkbox, and **WhatsApp remains a backup CTA** throughout the site. The notification email now also carries the training days, the term and the payment option the parent chose, so you invoice the same figure the website showed them.

---

**Built with:** React 19 · TypeScript · Vite · Tailwind CSS · GSAP · Lenis · Web3Forms
**For:** Genoa Academy Oman — Muscat, Oman
