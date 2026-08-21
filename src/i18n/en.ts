// ═══════════════════════════════════════════════════════════════════
// ENGLISH UI DICTIONARY — flat key → string map for all site chrome.
// ar.ts MUST export the exact same set of keys (type-checked).
// ═══════════════════════════════════════════════════════════════════

const en = {
  /* ── Site-wide ───────────────────────────────────────────────── */
  'site.location': 'Muscat, Oman',

  /* ── Navbar ──────────────────────────────────────────────────── */
  'nav.home': 'HOME',
  'nav.about': 'THE ACADEMY',
  'nav.programs': 'PROGRAMS',
  'nav.news': 'NEWS',
  'nav.calendar': 'CALENDAR',
  'nav.join': 'JOIN US',
  'nav.openMenu': 'Open menu',
  'nav.closeMenu': 'Close menu',
  'nav.dialogLabel': 'Site navigation',
  'nav.langSwitchLabel': 'Switch language',

  /* ── Hero (home) ─────────────────────────────────────────────── */
  'hero.badge': 'GENOA CFC OFFICIAL ACADEMY',
  'hero.headline': 'SHAPING THE FUTURE OF FOOTBALL',
  'hero.subheadline':
    'Join the official Genoa CFC academy in Muscat, Oman. World-class training for the next generation of football stars.',
  'hero.apply': 'APPLY NOW',
  'hero.explore': 'EXPLORE PROGRAMS',
  'hero.scroll': 'SCROLL',
  'hero.playerAlt': 'Young football player in Genoa CFC jersey',

  /* ── Home: Why us ────────────────────────────────────────────── */
  'why.overline': 'WHY US',
  'why.title': 'THE GENOA DIFFERENCE',

  /* ── Home: Programs preview ──────────────────────────────────── */
  'programsPreview.overline': 'OUR PROGRAMS',
  'programsPreview.title': 'A SQUAD FOR EVERY AGE',
  'programsPreview.viewAll': 'VIEW FULL PROGRAMS',
  'programsPreview.feesFrom': 'From',
  'programsPreview.feesNote':
    'Term 1 price for 2 sessions a week. Full fee table, instalments and Full Season prices are on the Programs page.',

  /* ── Home: CTA band ──────────────────────────────────────────── */
  'cta.title': 'READY TO PLAY?',
  'cta.text':
    'Places are limited in every age group. Apply today and our team will contact you to arrange a first trial session.',
  'cta.button': 'APPLY NOW',

  /* ── Gallery (photo + video slideshow) ───────────────────────── */
  'gallery.overline': 'GALLERY',
  'gallery.title': 'LIFE AT THE ACADEMY',
  'gallery.label': 'Academy photo and video gallery',
  'gallery.prev': 'Previous item',
  'gallery.next': 'Next item',
  'gallery.goToSlide': 'Go to item {n}',
  'gallery.pause': 'Pause slideshow',
  'gallery.play': 'Play slideshow',
  'gallery.counter': '{current} / {total}',
  'gallery.photoAlt': 'Genoa Academy Oman training session — photo {n}',
  'gallery.videoLabel': 'Genoa Academy Oman training video {n}',
  'gallery.videoBadge': 'VIDEO',
  'gallery.playVideo': 'Play video',
  'gallery.pauseVideo': 'Pause video',
  'gallery.noVideo': 'Your browser does not support embedded video.',

  /* ── Coaches section ─────────────────────────────────────────── */
  'coaches.overline': 'COACHING STAFF',
  'coaches.title': 'MEET THE COACHES',

  /* ── The Academy page ────────────────────────────────────────── */
  'about.overline': 'ABOUT THE ACADEMY',
  'about.joinCta': 'JOIN THE ACADEMY',
  'about.followUs': 'Follow Us',

  /* ── Programs page ───────────────────────────────────────────── */
  'programs.overline': 'PROGRAMS & FEES',
  'programs.title': 'FIND YOUR SQUAD',
  'programs.intro':
    'From first touches at U6 to the competitive game at U16 — six squads, one clear journey. Every group trains on Monday, Wednesday and Thursday, and you choose 2 or 3 sessions a week.',
  'programs.daysLabel': 'Training days',
  'programs.winterLabel': 'Winter',
  'programs.summerLabel': 'Summer',
  'programs.durationLabel': 'Session',
  'programs.sessionsLabel': 'Sessions',
  'programs.scheduleTitle': 'Training Schedule',
  'programs.feesTitle': 'Fees & Payment',
  'programs.cardFeesLabel': 'Fees',
  'programs.perTerm': '/ term',
  'programs.fullSeasonRange': 'Full season {from} – {to}, paid upfront.',
  'programs.viewCalendar': 'VIEW FULL TRAINING CALENDAR',

  'programs.pricingOverline': 'PRICING',
  'programs.pricingTitle': 'TERMS & FEES',
  'programs.pricingIntro':
    'Fees are set by age band and by the number of weekly sessions you choose. Every term can be paid upfront or split into monthly instalments; the Full Season price covers all three terms paid upfront.',
  'programs.seasonTitle': 'Season structure',
  'programs.termHeader': 'Term',
  'programs.durationHeader': 'Duration',
  'programs.priceSessions': 'Programme',
  'programs.priceTerm1': 'Term 1 (13 wks)',
  'programs.priceTerm2': 'Term 2 (7 wks)',
  'programs.priceTerm3': 'Term 3 (13 wks)',
  'programs.priceFullSeason': 'Full Season (33 wks)',
  'programs.priceCurrencyNote': 'All prices in Omani Rial (OMR).',

  'programs.includedOverline': 'WHAT YOU GET',
  'programs.includedTitle': 'INCLUDED WITH EVERY PLACE',
  'programs.policiesOverline': 'TERMS',
  'programs.policiesTitle': 'TERMS & POLICIES',

  'programs.faqOverline': 'FAQ',
  'programs.faqTitle': 'QUESTIONS, ANSWERED',
  'programs.ctaTitle': 'READY TO JOIN THE SQUAD?',
  'programs.ctaText':
    'Places are limited in every age group. Send your application today and we will arrange a first trial session.',
  'programs.ctaButton': 'APPLY NOW',

  /* ── News page ───────────────────────────────────────────────── */
  'news.overline': 'ACADEMY NEWS',
  'news.title': 'LATEST FROM THE ACADEMY',
  'news.intro':
    'Announcements, season updates and news from Genoa Academy Oman — the fastest way to keep up between sessions.',
  'news.empty': 'There is no news to show right now. Check back soon.',
  'news.followTitle': 'FOLLOW US FOR DAILY UPDATES',
  'news.followText':
    'Match clips, session highlights and announcements land on Instagram and WhatsApp first.',

  /* ── Calendar & training schedule page ───────────────────────── */
  'calendar.overline': 'CALENDAR & SCHEDULE',
  'calendar.title': 'WHEN WE TRAIN',
  'calendar.intro':
    'Every age group trains on Monday, Wednesday and Thursday, and keeps the same time slot all term. Winter and summer slots differ — the table below shows both.',
  'calendar.weekOverline': 'TRAINING WEEK',
  'calendar.weekTitle': 'THE WEEKLY GRID',
  'calendar.scheduleOverline': 'FULL SCHEDULE',
  'calendar.scheduleTitle': 'TRAINING SCHEDULE BY AGE GROUP',
  'calendar.seasonOverline': 'SEASON',
  'calendar.seasonTitle': 'ACADEMY CALENDAR',
  'calendar.seasonIntro':
    'The academy year is divided into three terms, 33 weeks of training in total.',
  'calendar.ageHeader': 'Age group',
  'calendar.daysHeader': 'Training days',
  'calendar.winterHeader': 'Winter slot',
  'calendar.summerHeader': 'Summer slot',
  'calendar.durationHeader': 'Session',
  'calendar.mon': 'MON',
  'calendar.wed': 'WED',
  'calendar.thu': 'THU',
  'calendar.winterLabel': 'Winter',
  'calendar.summerLabel': 'Summer',
  'calendar.note':
    'Exact days, times and session durations per age group are confirmed at registration, and parents are notified in advance of any change.',
  'calendar.ctaButton': 'REGISTER FOR A SESSION',

  /* ── Registration page ───────────────────────────────────────── */
  'register.backHome': 'BACK TO HOME',
  'register.overline': 'JOIN THE ACADEMY',
  'register.title': 'APPLY NOW',
  'register.subtitle': 'Fill out the form below and our team will contact you shortly.',

  /* ── Registration form ───────────────────────────────────────── */
  'form.playerName': 'Player Full Name',
  'form.playerNamePlaceholder': "Enter the player's full name",
  'form.parentName': 'Parent/Guardian Name',
  'form.parentNamePlaceholder': 'Enter parent/guardian name',
  'form.nationality': 'Nationality',
  'form.nationalityPlaceholder': 'Select your nationality',
  'form.nationalitySearch': 'Search nationalities...',
  'form.age': 'Age',
  'form.agePlaceholder': 'Enter age ({min}–{max})',
  'form.phone': 'Phone Number',
  'form.phonePlaceholder': 'Phone number',
  'form.dialCodeLabel': 'Dial code',
  'form.dialCodePlaceholder': 'Code',
  'form.dialCodeSearch': 'Search code or country...',
  'form.noMatches': 'No matches found',
  'form.email': 'Email Address',
  'form.emailPlaceholder': 'Enter your email address',
  'form.program': 'Program Interest',
  'form.programPlaceholder': 'Select a program',
  'form.consent': 'I am the parent/guardian and consent to being contacted about academy registration',
  'form.honeypot': 'Leave this field empty',
  'form.submit': 'SUBMIT APPLICATION',
  'form.submitting': 'SENDING...',
  'form.submitError':
    'We could not send your application just now. Please check your internet connection and try again — your details are still here.',
  'form.tryAgain': 'Try again',
  'form.successTitle': 'Thank You!',
  'form.successText':
    'Your application has been received. Our team will contact you within 24 hours via WhatsApp and email.',
  'form.successWhatsapp': 'Confirm faster on WhatsApp',
  'form.backToForm': 'Back to Form',

  /* ── Validation messages ─────────────────────────────────────── */
  'form.err.playerRequired': 'Player name is required',
  'form.err.playerShort': 'Player name must be at least 2 characters',
  'form.err.playerChars': 'Player name contains invalid characters',
  'form.err.parentRequired': 'Parent/guardian name is required',
  'form.err.parentShort': 'Parent/guardian name must be at least 2 characters',
  'form.err.parentChars': 'Parent/guardian name contains invalid characters',
  'form.err.nationalityRequired': 'Please select your nationality',
  'form.err.ageRequired': 'Age is required',
  'form.err.ageNumber': 'Age must be a whole number',
  'form.err.ageRange': 'Age must be between {min} and {max}',
  'form.err.phoneRequired': 'Phone number is required',
  'form.err.phoneDigits': 'Phone number must contain digits only',
  'form.err.phoneShort': 'Phone number must be at least 7 digits',
  'form.err.phoneLong': 'Phone number looks too long',
  'form.err.emailRequired': 'Email is required',
  'form.err.emailInvalid': 'Please enter a valid email address',
  'form.err.programRequired': 'Please select the program you are interested in',
  'form.err.programAgeSuggest': '{program} is for ages {min}–{max}. At {age}, choose {suggested}.',
  'form.err.programAgeRange': '{program} is for ages {min}–{max}.',
  'form.err.consentRequired': 'Parental/guardian consent is required to submit',

  /* ── WhatsApp prefill + email metadata (form submissions) ────── */
  'form.waTitle': '*New Academy Application*',
  'form.waPlayer': '*Player:*',
  'form.waParent': '*Parent/Guardian:*',
  'form.waNationality': '*Nationality:*',
  'form.waAge': '*Age:*',
  'form.waPhone': '*Phone:*',
  'form.waEmail': '*Email:*',
  'form.waProgram': '*Program:*',

  /* ── WhatsApp floating button ────────────────────────────────── */
  'whatsapp.chat': 'Chat on WhatsApp',

  /* ── Footer ──────────────────────────────────────────────────── */
  'footer.tagline': 'Nurturing football talent in {location}',
  'footer.navigate': 'Navigate',
  'footer.aboutLink': 'The Academy',
  'footer.programsLink': 'Programs',
  'footer.newsLink': 'News',
  'footer.calendarLink': 'Calendar & Schedule',
  'footer.joinLink': 'Join the Academy',
  'footer.privacyLink': 'Privacy Notice',
  'footer.contact': 'Get in Touch',
  'footer.whatsapp': 'Contact on WhatsApp',
  'footer.rights': 'All rights reserved.',

  /* ── 404 page ────────────────────────────────────────────────── */
  'notFound.title': 'OFF THE PITCH',
  'notFound.text': 'The page you are looking for has been substituted.',
  'notFound.backHome': 'BACK TO HOME',

  /* ── Privacy page ────────────────────────────────────────────── */
  'privacy.overline': 'YOUR DATA, RESPECTED',
  'privacy.title': 'PRIVACY NOTICE',
  'privacy.intro':
    'The short, honest version of how {site} handles the information you share with us — no legal fog, we promise.',
  'privacy.collectTitle': 'What we collect',
  'privacy.collectBody':
    'When you fill in our registration form, we collect the player’s name, age and nationality, the parent or guardian’s name, and your contact details — typically a phone or WhatsApp number and an email address. That is all we ask for.',
  'privacy.whyTitle': 'Why we collect it',
  'privacy.whyBody':
    'We use these details for one reason only: to contact you about your academy registration — confirming your application, arranging a first trial session and sharing practical training information. No marketing lists, no profiling, no unrelated messages.',
  'privacy.whereTitle': 'Where your information goes',
  'privacy.whereBody':
    'Registration form submissions are delivered straight to the academy team by email over a secure, encrypted connection. If you choose to message us on WhatsApp instead, your message is handled within WhatsApp under their own privacy policy. Your details go to our coaching team — nowhere else.',
  'privacy.neverTitle': 'What we never do',
  'privacy.neverBody':
    'We never sell, rent or share your personal data with third parties for marketing or any other purpose. Your information stays within {site}. Ever.',
  'privacy.childrenTitle': 'Children’s data',
  'privacy.childrenBody':
    'Football is for the kids — forms are for the grown-ups. Applications must be submitted by a parent or legal guardian, and we do not knowingly collect personal information directly from children through this website.',
  'privacy.retentionTitle': 'How long we keep it',
  'privacy.retentionBody':
    'We keep your details only for as long as needed to process your registration and manage academy membership. When they are no longer needed, they are deleted.',
  'privacy.contactTitle': 'Questions & deletion',
  'privacy.contactBefore': 'Want to know what we hold about you, correct it, or ask us to delete it? Just email us at',
  'privacy.contactAfter': 'and we will take care of it.',

  /* ── Per-route document titles ───────────────────────────────── */
  'page.about': 'The Academy',
  'page.programs': 'Programs & Fees',
  'page.news': 'Academy News',
  'page.calendar': 'Calendar & Training Schedule',
  'page.join': 'Join the Academy',
  'page.privacy': 'Privacy Notice',
  'page.notFound': 'Page Not Found',

  /* ── Per-route meta descriptions (localized SEO) ─────────────── */
  'meta.homeDesc':
    'Official Genoa CFC academy in Muscat, Oman — elite youth football training for boys and girls aged 5–16.',
  'meta.aboutDesc':
    'Discover Genoa Academy Oman — Genoa CFC heritage, UEFA-qualified coaches and a clear pathway from U6 to U16 in Muscat.',
  'meta.programsDesc':
    'Age-group squads, training days and times, term fees and payment terms at Genoa Academy Oman — the official Genoa CFC academy in Muscat, for players aged 5 to 16.',
  'meta.newsDesc':
    'The latest announcements, season updates and news from Genoa Academy Oman in Muscat.',
  'meta.calendarDesc':
    'Training calendar and weekly schedule for every age group at Genoa Academy Oman — U6 to U16, Monday, Wednesday and Thursday, with winter and summer time slots.',
  'meta.joinDesc':
    'Apply to Genoa Academy Oman — register your child for elite youth football training in Muscat.',
  'meta.privacyDesc':
    'How Genoa Academy Oman collects, uses and protects the personal information you share through our registration form.',
  'meta.notFoundDesc':
    'The page you are looking for has been substituted. Head back to the Genoa Academy Oman home page.',
};

export default en;
export type DictKey = keyof typeof en;
