// ═══════════════════════════════════════════════════════════════════
// ENGLISH UI DICTIONARY — flat key → string map for all site chrome.
// ar.ts MUST export the exact same set of keys (type-checked).
//
// TERMINOLOGY — enforced across this file, the form, the emails and the
// FAQ. The review found "session" meaning two different things:
//   Duration                = how long ONE training lasts
//   Training days per week  = how often they train
// There is no key here that says "sessions". Keep it that way.
// ═══════════════════════════════════════════════════════════════════

const en = {
  /* ── Site-wide ───────────────────────────────────────────────── */
  'site.location': 'Muscat, Oman',
  'common.toBeConfirmed': '(to be confirmed)',

  /* ── Navbar ──────────────────────────────────────────────────── */
  'nav.home': 'HOME',
  'nav.about': 'ACADEMY',
  'nav.programs': 'PROGRAMS',
  'nav.pathway': 'PATHWAY',
  'nav.coaches': 'COACHES',
  'nav.location': 'LOCATION',
  'nav.faq': 'FAQ',
  'nav.register': 'REGISTER',
  'nav.news': 'NEWS',
  'nav.calendar': 'CALENDAR',
  'nav.openMenu': 'Open menu',
  'nav.closeMenu': 'Close menu',
  'nav.dialogLabel': 'Site navigation',
  'nav.langSwitchLabel': 'Switch language',
  'nav.breadcrumbLabel': 'Breadcrumb',

  /* ── Hero (home) ─────────────────────────────────────────────── */
  'hero.badge': 'GENOA CFC OFFICIAL ACADEMY',
  'hero.headline': 'SHAPING THE FUTURE OF FOOTBALL',
  'hero.subheadline':
    'Join the official Genoa CFC academy in Muscat, Oman. World-class training for the next generation of football stars.',
  'hero.apply': 'REGISTER NOW',
  'hero.explore': 'PROGRAMS & FEES',
  'hero.scroll': 'SCROLL',
  'hero.playerAlt': 'Young football player in Genoa CFC jersey',

  /* ── Home: at a glance ───────────────────────────────────────── */
  'quick.title': 'AT A GLANCE',
  'quick.pricing': 'Programs & prices',
  'quick.pricingHint': 'Every fee, per term and full season',
  'quick.times': 'Training times',
  'quick.timesHint': 'Sun · Tue · Wed, by age group',
  'quick.location': 'Location',
  'quick.locationHint': 'ABQ MQ Campus, Muscat',
  'quick.register': 'Register',
  'quick.registerHint': 'Two minutes, one form',

  /* ── Home: Why us ────────────────────────────────────────────── */
  'why.overline': 'WHY US',
  'why.title': 'THE GENOA DIFFERENCE',

  /* ── Home: Programs preview ──────────────────────────────────── */
  'programsPreview.overline': 'OUR PROGRAMS',
  'programsPreview.title': 'A SQUAD FOR EVERY AGE',
  'programsPreview.viewAll': 'VIEW PROGRAMS & FEES',
  'programsPreview.feesFrom': 'From',
  'programsPreview.feesNote':
    'Term 1, two training days a week. The full table — every term and the full-season price side by side — is on the Programs page.',

  /* ── Home: CTA band ──────────────────────────────────────────── */
  'cta.title': 'READY TO PLAY?',
  'cta.text':
    'Places are limited in every age group. Register today and our team will be in touch to confirm your child’s place.',
  'cta.button': 'REGISTER NOW',
  'cta.whatsapp': 'ASK US ON WHATSAPP',

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
  'gallery.photoAlt': 'Genoa Academy Oman training — photo {n}',
  'gallery.videoLabel': 'Genoa Academy Oman training video {n}',
  'gallery.videoBadge': 'VIDEO',
  'gallery.playVideo': 'Play video',
  'gallery.pauseVideo': 'Pause video',
  'gallery.noVideo': 'Your browser does not support embedded video.',

  /* ── Pathway section ─────────────────────────────────────────── */
  'pathway.overline': 'PLAYER PATHWAY',
  'pathway.title': 'FIVE STAGES, ONE JOURNEY',
  'pathway.intro':
    'Every player follows the same route, at their own pace — from a first touch of the ball to the standards asked of players aiming at the professional game.',

  /* ── Coaches section ─────────────────────────────────────────── */
  'coaches.overline': 'OUR COACHES',
  'coaches.title': 'COACHES',
  'coaches.photoAlt': '{name}, {role} at Genoa Academy Oman',
  'coaches.photoPending': 'Photo to follow',
  'coaches.openSlot': 'Open position',
  'coaches.languagesLabel': 'Languages',
  'coaches.readMore': 'Read more',
  'coaches.readLess': 'Show less',

  /* ── Location section ────────────────────────────────────────── */
  'location.overline': 'WHERE WE TRAIN',
  'location.title': 'LOCATION',
  'location.addressLabel': 'Address',
  'location.plusCodeLabel': 'Plus code',
  'location.coordinatesLabel': 'Coordinates',
  'location.openInMaps': 'OPEN IN GOOGLE MAPS',
  'location.loadMap': 'Show the map',
  'location.mapTitle': 'Map showing {venue}',

  /* ── The Academy page ────────────────────────────────────────── */
  'about.overline': 'ABOUT THE ACADEMY',
  'about.joinCta': 'REGISTER YOUR CHILD',
  'about.followUs': 'Follow Us',

  /* ── Pricing tables (shared by Programs and the form) ────────── */
  'pricing.frequencyHeader': 'Programme',
  'pricing.trainingDaysPerWeek': '{count} training days / week',
  /* Two is a separate key because Arabic has a dual form — see
     src/i18n/labels.ts. English says the same thing either way. */
  'pricing.trainingDaysDual': '2 training days / week',
  'pricing.fullSeasonHeader': 'Full season',
  'pricing.fullSeasonSub': 'All three terms, paid in full up front. Saves 10%.',
  'pricing.upfrontNote': 'paid up front',
  'pricing.monthlyLabel': 'Monthly instalments',
  'pricing.monthlyEach': '{amount} / month',
  'pricing.monthlyBreakdown': '{count} instalments · {total} in total',
  'pricing.saveVsTerms': 'Save {amount} vs. paying term by term.',
  'pricing.instalmentsCount': '{count} monthly instalments',

  /* ── Programs page ───────────────────────────────────────────── */
  'programs.overline': 'PROGRAMS & FEES',
  'programs.title': 'FIND YOUR SQUAD',
  'programs.intro':
    'Six age groups, from U6 to U16. Every squad trains on Sunday, Tuesday and Wednesday — you choose two of those days or all three. Below: the times, the term dates, and every fee with the full-season price beside it.',

  'programs.scheduleOverline': 'THE TRAINING WEEK',
  'programs.scheduleTitle': 'WHEN WE TRAIN',
  'programs.frequencyExplainer':
    '"Training days per week" is how often your child trains. "Duration" is how long one training lasts — 60 minutes for U6 and U8, 90 minutes from U10 up.',

  'programs.termsOverline': 'THE SEASON',
  'programs.termsTitle': 'THREE TERMS, 33 WEEKS',
  'programs.termHeader': 'Term',
  'programs.weeksHeader': 'Length',
  'programs.datesHeader': 'Dates',
  'programs.instalmentsHeader': 'If paying monthly',

  'programs.pricingOverline': 'AGE GROUPS & FEES',
  'programs.pricingTitle': 'PICK AN AGE GROUP',
  'programs.daysLabel': 'Training days',
  'programs.timeLabel': 'Time',
  'programs.durationLabel': 'Duration',
  'programs.registerFor': 'REGISTER FOR {name}',
  /* {days} is filled by trainingDaysLabel(), so the Arabic dual form is
     correct here too — never interpolate a bare count into this. */
  'programs.registerWithDays': 'REGISTER · {days}',
  'programs.bandCaption': '{name} is priced in the {band} age band.',
  'programs.openItemsTitle': 'Two fee questions we are still confirming',

  'programs.includedOverline': 'WHAT YOU GET',
  'programs.includedTitle': 'WHAT YOUR CHILD GETS',
  'programs.policiesOverline': 'TERMS',
  'programs.policiesTitle': 'TERMS & POLICIES',
  'programs.faqLinkTitle': 'Still have a question?',
  'programs.faqLinkText':
    'Training days, term dates, instalments, kit, refunds and the venue — all answered on one page.',
  'programs.faqLinkButton': 'READ THE FAQ',
  'programs.ctaTitle': 'READY TO JOIN THE SQUAD?',
  'programs.ctaText':
    'Places are limited in every age group. Register today and we will confirm your child’s place.',

  /* ── FAQ page ────────────────────────────────────────────────── */
  'faq.overline': 'QUESTIONS, ANSWERED',
  'faq.title': 'FREQUENTLY ASKED QUESTIONS',
  'faq.intro':
    'Everything parents ask us, grouped so you can find your question fast. Tap any question to open it.',
  'faq.jumpLabel': 'Jump to a section',
  'faq.linkToAnswer': 'Link to this answer',
  'faq.stillStuckTitle': 'STILL NOT SURE?',
  'faq.stillStuckText':
    'Message us on WhatsApp and a coach will answer, or come and see the pitch for yourself.',
  'faq.stillStuckButton': 'SEE THE VENUE',

  /* ── News page ───────────────────────────────────────────────── */
  'news.overline': 'ACADEMY NEWS',
  'news.title': 'LATEST FROM THE ACADEMY',
  'news.intro':
    'Announcements, season updates and news from Genoa Academy Oman — the fastest way to keep up between trainings.',
  'news.empty': 'There is no news to show right now. Check back soon.',
  'news.followTitle': 'FOLLOW US FOR DAILY UPDATES',
  'news.followText':
    'Match clips, training highlights and announcements land on Instagram and WhatsApp first.',

  /* ── Calendar & training schedule page ───────────────────────── */
  'calendar.overline': 'CALENDAR & SCHEDULE',
  'calendar.title': 'WHEN WE TRAIN',
  'calendar.intro':
    'Every age group trains on Sunday, Tuesday and Wednesday and keeps the same time slot all term. The full fee table lives on the Programs page.',
  'calendar.weekOverline': 'TRAINING WEEK',
  'calendar.weekTitle': 'THE WEEKLY GRID',
  'calendar.scheduleOverline': 'FULL SCHEDULE',
  'calendar.scheduleTitle': 'TRAINING TIMES BY AGE GROUP',
  'calendar.seasonOverline': 'SEASON',
  'calendar.seasonTitle': 'ACADEMY CALENDAR',
  'calendar.seasonIntro':
    'The academy year is divided into three terms — 33 weeks of training in total.',
  'calendar.ageHeader': 'Age group',
  'calendar.daysHeader': 'Training days',
  'calendar.timeHeader': 'Time',
  'calendar.durationHeader': 'Duration',
  'calendar.note':
    'Parents are notified in advance of any change to days, times or term dates.',
  'calendar.ctaButton': 'REGISTER NOW',
  'calendar.viewFees': 'VIEW PROGRAMS & FEES',

  /* ── Registration page ───────────────────────────────────────── */
  'register.backHome': 'BACK TO HOME',
  'register.overline': 'JOIN THE ACADEMY',
  'register.title': 'REGISTER',
  'register.subtitle':
    'One form, two minutes. Our team confirms your child’s place on WhatsApp within 24 hours.',

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
  'form.program': 'Age group',
  'form.programPlaceholder': 'Select an age group',
  'form.frequency': 'Training days per week',
  'form.frequencyPlaceholder': 'How often will they train?',
  'form.frequencyHint':
    'We train {days}. Two days a week means picking two of them; three means all three.',
  'form.term': 'Which term are you joining for?',
  'form.termPlaceholder': 'Select a term',
  'form.payment': 'How would you like to pay?',
  'form.paymentLocked':
    'Choose an age group, training days and a term above, and the price for each way of paying appears here.',
  'form.pay.term': 'Pay for the term',
  'form.pay.monthly': 'Pay monthly (instalments)',
  'form.pay.season': 'Pay for the full season',
  'form.pay.termDetail': 'One payment covering all of {term}.',
  'form.pay.monthlyDetail': '{count} instalments of {each}. Costs more in total.',
  'form.pay.seasonDetail': 'All three terms up front — {pct}% off, saving {saving}.',
  'form.summaryLabel': 'You’re registering for',
  'form.summaryChange': 'Change',
  'form.summaryIncomplete': 'Choose training days and a term to see the price.',
  'form.consent':
    'I am the parent/guardian and consent to being contacted about academy registration',
  'form.honeypot': 'Leave this field empty',
  'form.submit': 'SUBMIT REGISTRATION',
  'form.submitting': 'SENDING...',
  'form.submitError':
    'We could not send your registration just now. Please check your internet connection and try again — your details are still here.',
  'form.tryAgain': 'Try again',
  'form.successTitle': 'Thank You!',
  'form.successText':
    'Your registration has been received. Our team will contact you within 24 hours via WhatsApp and email.',
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
  'form.err.programRequired': 'Please select your child’s age group',
  'form.err.programAgeSuggest': '{program} is for ages {min}–{max}. At {age}, choose {suggested}.',
  'form.err.programAgeRange': '{program} is for ages {min}–{max}.',
  'form.err.frequencyRequired': 'Please choose 2 or 3 training days per week',
  'form.err.termRequired': 'Please choose the term you are joining for',
  'form.err.paymentRequired': 'Please choose how you would like to pay',
  'form.err.consentRequired': 'Parental/guardian consent is required to submit',

  /* ── WhatsApp prefill + email metadata (form submissions) ────── */
  'form.waTitle': '*New Academy Registration*',
  'form.waPlayer': '*Player:*',
  'form.waParent': '*Parent/Guardian:*',
  'form.waNationality': '*Nationality:*',
  'form.waAge': '*Age:*',
  'form.waPhone': '*Phone:*',
  'form.waEmail': '*Email:*',
  'form.waProgram': '*Age group:*',
  'form.waFrequency': '*Training days:*',
  'form.waTerm': '*Term:*',
  'form.waPayment': '*Payment:*',

  /* ── WhatsApp floating button ────────────────────────────────── */
  'whatsapp.chat': 'Chat on WhatsApp',

  /* ── Footer ──────────────────────────────────────────────────── */
  'footer.tagline': 'Nurturing football talent in {location}',
  'footer.pages': 'All pages',
  'footer.findFast': 'Find it fast',
  'footer.pricingLink': 'Fees & prices',
  'footer.timesLink': 'Training times',
  'footer.termsLink': 'Term dates',
  'footer.whereWeTrain': 'Where we train',
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
    'We use these details for one reason only: to contact you about your academy registration — confirming your place, arranging your child’s first training and sharing practical information. No marketing lists, no profiling, no unrelated messages.',
  'privacy.whereTitle': 'Where your information goes',
  'privacy.whereBody':
    'Registration form submissions are delivered straight to the academy team by email over a secure, encrypted connection. If you choose to message us on WhatsApp instead, your message is handled within WhatsApp under their own privacy policy. Your details go to our coaching team — nowhere else.',
  'privacy.neverTitle': 'What we never do',
  'privacy.neverBody':
    'We never sell, rent or share your personal data with third parties for marketing or any other purpose. Your information stays within {site}. Ever.',
  'privacy.childrenTitle': 'Children’s data',
  'privacy.childrenBody':
    'Football is for the kids — forms are for the grown-ups. Registrations must be submitted by a parent or legal guardian, and we do not knowingly collect personal information directly from children through this website.',
  'privacy.retentionTitle': 'How long we keep it',
  'privacy.retentionBody':
    'We keep your details only for as long as needed to process your registration and manage academy membership. When they are no longer needed, they are deleted.',
  'privacy.contactTitle': 'Questions & deletion',
  'privacy.contactBefore':
    'Want to know what we hold about you, correct it, or ask us to delete it? Just email us at',
  'privacy.contactAfter': 'and we will take care of it.',

  /* ── Per-route document titles ───────────────────────────────── */
  'page.about': 'The Academy',
  'page.programs': 'Programs & Fees',
  'page.faq': 'Frequently Asked Questions',
  'page.news': 'Academy News',
  'page.calendar': 'Calendar & Training Schedule',
  'page.join': 'Register',
  'page.privacy': 'Privacy Notice',
  'page.notFound': 'Page Not Found',

  /* ── Per-route meta descriptions (localized SEO) ─────────────── */
  'meta.homeDesc':
    'Official Genoa CFC academy in Muscat, Oman — elite youth football training for boys and girls aged 5–16.',
  'meta.aboutDesc':
    'Genoa Academy Oman — the player pathway, our UEFA-licensed coaches and where we train in Muscat.',
  'meta.programsDesc':
    'Age groups, training days and times, term dates and every fee — per term, monthly and full season — at Genoa Academy Oman, the official Genoa CFC academy in Muscat, for players aged 5 to 16.',
  'meta.faqDesc':
    'Ages, training days and times, term dates, fees and instalments, kit, the venue — every question parents ask Genoa Academy Oman, answered.',
  'meta.newsDesc':
    'The latest announcements, season updates and news from Genoa Academy Oman in Muscat.',
  'meta.calendarDesc':
    'Training calendar and weekly schedule for every age group at Genoa Academy Oman — U6 to U16, Sunday, Tuesday and Wednesday.',
  'meta.joinDesc':
    'Register your child at Genoa Academy Oman — elite youth football training in Muscat for ages 5 to 16.',
  'meta.privacyDesc':
    'How Genoa Academy Oman collects, uses and protects the personal information you share through our registration form.',
  'meta.notFoundDesc':
    'The page you are looking for has been substituted. Head back to the Genoa Academy Oman home page.',
};

export default en;
export type DictKey = keyof typeof en;
