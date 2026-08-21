// ═══════════════════════════════════════════════════════════════════
// ARABIC UI DICTIONARY — must export the exact same keys as en.ts
// (enforced by Record<DictKey, string>). Natural Modern Standard
// Arabic, football-context appropriate.
// ═══════════════════════════════════════════════════════════════════

import type { DictKey } from './en';

const ar: Record<DictKey, string> = {
  /* ── Site-wide ───────────────────────────────────────────────── */
  'site.location': 'مسقط، عُمان',

  /* ── Navbar ──────────────────────────────────────────────────── */
  'nav.home': 'الرئيسية',
  'nav.about': 'الأكاديمية',
  'nav.programs': 'البرامج',
  'nav.news': 'الأخبار',
  'nav.calendar': 'الجدول',
  'nav.join': 'انضم إلينا',
  'nav.openMenu': 'فتح القائمة',
  'nav.closeMenu': 'إغلاق القائمة',
  'nav.dialogLabel': 'قائمة الموقع',
  'nav.langSwitchLabel': 'تغيير اللغة',

  /* ── Hero (home) ─────────────────────────────────────────────── */
  'hero.badge': 'الأكاديمية الرسمية لنادي جنوى',
  'hero.headline': 'نصنع مستقبل كرة القدم',
  'hero.subheadline':
    'انضم إلى الأكاديمية الرسمية لنادي جنوى في مسقط، عُمان. تدريب عالمي المستوى لجيل جديد من نجوم كرة القدم.',
  'hero.apply': 'قدّم طلبك الآن',
  'hero.explore': 'استكشف البرامج',
  'hero.scroll': 'مرّر للأسفل',
  'hero.playerAlt': 'لاعب كرة قدم شاب يرتدي قميص نادي جنوى',

  /* ── Home: Why us ────────────────────────────────────────────── */
  'why.overline': 'لماذا نحن',
  'why.title': 'ما يميّز جنوى',

  /* ── Home: Programs preview ──────────────────────────────────── */
  'programsPreview.overline': 'برامجنا',
  'programsPreview.title': 'فريق لكل فئة عمرية',
  'programsPreview.viewAll': 'عرض جميع البرامج',
  'programsPreview.feesFrom': 'ابتداءً من',
  'programsPreview.feesNote':
    'سعر الفصل الأول لحصتين أسبوعيًا. جدول الرسوم الكامل والأقساط وأسعار الموسم الكامل متاحة في صفحة البرامج.',

  /* ── Home: CTA band ──────────────────────────────────────────── */
  'cta.title': 'هل أنت مستعد للعب؟',
  'cta.text':
    'الأماكن محدودة في كل فئة عمرية. قدّم طلبك اليوم وسيتواصل معك فريقنا لترتيب أول حصة تجريبية.',
  'cta.button': 'قدّم طلبك الآن',

  /* ── Gallery (photo + video slideshow) ───────────────────────── */
  'gallery.overline': 'معرض الوسائط',
  'gallery.title': 'الحياة في الأكاديمية',
  'gallery.label': 'معرض صور وفيديوهات الأكاديمية',
  'gallery.prev': 'العنصر السابق',
  'gallery.next': 'العنصر التالي',
  'gallery.goToSlide': 'انتقل إلى العنصر {n}',
  'gallery.pause': 'إيقاف العرض مؤقتًا',
  'gallery.play': 'تشغيل العرض',
  'gallery.counter': '{current} / {total}',
  'gallery.photoAlt': 'حصة تدريبية في أكاديمية جنوى عُمان — صورة {n}',
  'gallery.videoLabel': 'فيديو تدريبي من أكاديمية جنوى عُمان {n}',
  'gallery.videoBadge': 'فيديو',
  'gallery.playVideo': 'تشغيل الفيديو',
  'gallery.pauseVideo': 'إيقاف الفيديو',
  'gallery.noVideo': 'متصفحك لا يدعم تشغيل الفيديو.',

  /* ── Coaches section ─────────────────────────────────────────── */
  'coaches.overline': 'الطاقم التدريبي',
  'coaches.title': 'تعرّف على المدربين',

  /* ── The Academy page ────────────────────────────────────────── */
  'about.overline': 'عن الأكاديمية',
  'about.joinCta': 'انضم إلى الأكاديمية',
  'about.followUs': 'تابعنا',

  /* ── Programs page ───────────────────────────────────────────── */
  'programs.overline': 'البرامج والرسوم',
  'programs.title': 'اعثر على فريقك',
  'programs.intro':
    'من اللمسات الأولى في فئة تحت 6 سنوات حتى اللعب التنافسي في فئة تحت 16 سنة — ستة فرق، ورحلة واحدة واضحة. تتدرب كل فئة أيام الاثنين والأربعاء والخميس، وتختار حصتين أو 3 حصص أسبوعيًا.',
  'programs.daysLabel': 'أيام التدريب',
  'programs.winterLabel': 'الشتاء',
  'programs.summerLabel': 'الصيف',
  'programs.durationLabel': 'مدة الحصة',
  'programs.sessionsLabel': 'الحصص',
  'programs.scheduleTitle': 'جدول التدريبات',
  'programs.feesTitle': 'الرسوم والدفع',
  'programs.cardFeesLabel': 'الرسوم',
  'programs.perTerm': '/ الفصل',
  'programs.fullSeasonRange': 'الموسم الكامل {from} – {to}، مدفوعًا مقدمًا.',
  'programs.viewCalendar': 'عرض جدول التدريبات الكامل',

  'programs.pricingOverline': 'الأسعار',
  'programs.pricingTitle': 'الفصول والرسوم',
  'programs.pricingIntro':
    'تُحدَّد الرسوم حسب الفئة العمرية وعدد الحصص الأسبوعية التي تختارها. يمكن دفع كل فصل دراسي مقدمًا أو تقسيطه شهريًا، ويشمل سعر الموسم الكامل الفصول الثلاثة مدفوعة مقدمًا.',
  'programs.seasonTitle': 'هيكل الموسم',
  'programs.termHeader': 'الفصل',
  'programs.durationHeader': 'المدة',
  'programs.priceSessions': 'البرنامج',
  'programs.priceTerm1': 'الفصل 1 (13 أسبوعًا)',
  'programs.priceTerm2': 'الفصل 2 (7 أسابيع)',
  'programs.priceTerm3': 'الفصل 3 (13 أسبوعًا)',
  'programs.priceFullSeason': 'الموسم الكامل (33 أسبوعًا)',
  'programs.priceCurrencyNote': 'جميع الأسعار بالريال العُماني (OMR).',

  'programs.includedOverline': 'ما تحصل عليه',
  'programs.includedTitle': 'يشمل كل مقعد في الأكاديمية',
  'programs.policiesOverline': 'الشروط',
  'programs.policiesTitle': 'الشروط والسياسات',

  'programs.faqOverline': 'الأسئلة الشائعة',
  'programs.faqTitle': 'أسئلة وأجوبة',
  'programs.ctaTitle': 'هل أنت مستعد للانضمام إلى الفريق؟',
  'programs.ctaText':
    'الأماكن محدودة في كل فئة عمرية. أرسل طلبك اليوم وسنرتب لك أول حصة تجريبية.',
  'programs.ctaButton': 'قدّم طلبك الآن',

  /* ── News page ───────────────────────────────────────────────── */
  'news.overline': 'أخبار الأكاديمية',
  'news.title': 'آخر أخبار الأكاديمية',
  'news.intro':
    'إعلانات وتحديثات الموسم وأخبار أكاديمية جنوى عُمان — أسرع طريقة لمتابعة كل جديد بين الحصص.',
  'news.empty': 'لا توجد أخبار حاليًا. تفقّد الصفحة قريبًا.',
  'news.followTitle': 'تابعنا للحصول على التحديثات اليومية',
  'news.followText':
    'مقاطع المباريات وأبرز لقطات الحصص والإعلانات تصل أولًا عبر إنستغرام وواتساب.',

  /* ── Calendar & training schedule page ───────────────────────── */
  'calendar.overline': 'الجدول والتقويم',
  'calendar.title': 'مواعيد تدريباتنا',
  'calendar.intro':
    'تتدرب كل فئة عمرية أيام الاثنين والأربعاء والخميس، وتحتفظ بالموعد نفسه طوال الفصل الدراسي. وتختلف مواعيد الشتاء عن الصيف — ويوضح الجدول أدناه الاثنين معًا.',
  'calendar.weekOverline': 'أسبوع التدريب',
  'calendar.weekTitle': 'الجدول الأسبوعي',
  'calendar.scheduleOverline': 'الجدول الكامل',
  'calendar.scheduleTitle': 'جدول التدريبات حسب الفئة العمرية',
  'calendar.seasonOverline': 'الموسم',
  'calendar.seasonTitle': 'تقويم الأكاديمية',
  'calendar.seasonIntro':
    'ينقسم العام التدريبي إلى ثلاثة فصول، بإجمالي 33 أسبوعًا من التدريب.',
  'calendar.ageHeader': 'الفئة العمرية',
  'calendar.daysHeader': 'أيام التدريب',
  'calendar.winterHeader': 'موعد الشتاء',
  'calendar.summerHeader': 'موعد الصيف',
  'calendar.durationHeader': 'مدة الحصة',
  'calendar.mon': 'الاثنين',
  'calendar.wed': 'الأربعاء',
  'calendar.thu': 'الخميس',
  'calendar.winterLabel': 'الشتاء',
  'calendar.summerLabel': 'الصيف',
  'calendar.note':
    'تُؤكَّد الأيام والأوقات ومدة الحصص لكل فئة عمرية عند التسجيل، ويُبلَّغ أولياء الأمور مسبقًا بأي تغيير.',
  'calendar.ctaButton': 'سجّل في حصة تدريبية',

  /* ── Registration page ───────────────────────────────────────── */
  'register.backHome': 'العودة إلى الرئيسية',
  'register.overline': 'انضم إلى الأكاديمية',
  'register.title': 'قدّم طلبك الآن',
  'register.subtitle': 'املأ النموذج أدناه وسيتواصل معك فريقنا قريبًا.',

  /* ── Registration form ───────────────────────────────────────── */
  'form.playerName': 'الاسم الكامل للاعب',
  'form.playerNamePlaceholder': 'أدخل الاسم الكامل للاعب',
  'form.parentName': 'اسم ولي الأمر',
  'form.parentNamePlaceholder': 'أدخل اسم ولي الأمر',
  'form.nationality': 'الجنسية',
  'form.nationalityPlaceholder': 'اختر جنسيتك',
  'form.nationalitySearch': 'ابحث عن الجنسية...',
  'form.age': 'العمر',
  'form.agePlaceholder': 'أدخل العمر ({min}–{max})',
  'form.phone': 'رقم الهاتف',
  'form.phonePlaceholder': 'رقم الهاتف',
  'form.dialCodeLabel': 'رمز الاتصال',
  'form.dialCodePlaceholder': 'الرمز',
  'form.dialCodeSearch': 'ابحث عن الرمز أو الدولة...',
  'form.noMatches': 'لا توجد نتائج مطابقة',
  'form.email': 'البريد الإلكتروني',
  'form.emailPlaceholder': 'أدخل بريدك الإلكتروني',
  'form.program': 'البرنامج المطلوب',
  'form.programPlaceholder': 'اختر برنامجًا',
  'form.consent': 'أنا ولي أمر اللاعب وأوافق على التواصل معي بشأن التسجيل في الأكاديمية',
  'form.honeypot': 'اترك هذا الحقل فارغًا',
  'form.submit': 'إرسال الطلب',
  'form.submitting': 'جارٍ الإرسال...',
  'form.submitError':
    'تعذّر إرسال طلبك في الوقت الحالي. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى — بياناتك ما زالت محفوظة هنا.',
  'form.tryAgain': 'حاول مرة أخرى',
  'form.successTitle': 'شكرًا لك!',
  'form.successText':
    'تم استلام طلبك. سيتواصل معك فريقنا خلال 24 ساعة عبر واتساب والبريد الإلكتروني.',
  'form.successWhatsapp': 'أكّد أسرع عبر واتساب',
  'form.backToForm': 'العودة إلى النموذج',

  /* ── Validation messages ─────────────────────────────────────── */
  'form.err.playerRequired': 'اسم اللاعب مطلوب',
  'form.err.playerShort': 'يجب أن يكون اسم اللاعب حرفين على الأقل',
  'form.err.playerChars': 'اسم اللاعب يحتوي على أحرف غير صالحة',
  'form.err.parentRequired': 'اسم ولي الأمر مطلوب',
  'form.err.parentShort': 'يجب أن يكون اسم ولي الأمر حرفين على الأقل',
  'form.err.parentChars': 'اسم ولي الأمر يحتوي على أحرف غير صالحة',
  'form.err.nationalityRequired': 'يرجى اختيار الجنسية',
  'form.err.ageRequired': 'العمر مطلوب',
  'form.err.ageNumber': 'يجب أن يكون العمر رقمًا صحيحًا',
  'form.err.ageRange': 'يجب أن يكون العمر بين {min} و{max}',
  'form.err.phoneRequired': 'رقم الهاتف مطلوب',
  'form.err.phoneDigits': 'يجب أن يحتوي رقم الهاتف على أرقام فقط',
  'form.err.phoneShort': 'يجب أن يكون رقم الهاتف 7 أرقام على الأقل',
  'form.err.phoneLong': 'رقم الهاتف يبدو طويلًا جدًا',
  'form.err.emailRequired': 'البريد الإلكتروني مطلوب',
  'form.err.emailInvalid': 'يرجى إدخال بريد إلكتروني صالح',
  'form.err.programRequired': 'يرجى اختيار البرنامج الذي تهتم به',
  'form.err.programAgeSuggest': 'برنامج {program} مخصص للأعمار من {min} إلى {max}. في عمر {age}، اختر {suggested}.',
  'form.err.programAgeRange': 'برنامج {program} مخصص للأعمار من {min} إلى {max}.',
  'form.err.consentRequired': 'موافقة ولي الأمر مطلوبة لإرسال الطلب',

  /* ── WhatsApp prefill + email metadata (form submissions) ────── */
  'form.waTitle': '*طلب تسجيل جديد في الأكاديمية*',
  'form.waPlayer': '*اللاعب:*',
  'form.waParent': '*ولي الأمر:*',
  'form.waNationality': '*الجنسية:*',
  'form.waAge': '*العمر:*',
  'form.waPhone': '*الهاتف:*',
  'form.waEmail': '*البريد الإلكتروني:*',
  'form.waProgram': '*البرنامج:*',

  /* ── WhatsApp floating button ────────────────────────────────── */
  'whatsapp.chat': 'تحدث معنا عبر واتساب',

  /* ── Footer ──────────────────────────────────────────────────── */
  'footer.tagline': 'نرعى مواهب كرة القدم في {location}',
  'footer.navigate': 'روابط سريعة',
  'footer.aboutLink': 'الأكاديمية',
  'footer.programsLink': 'البرامج',
  'footer.newsLink': 'الأخبار',
  'footer.calendarLink': 'الجدول والتقويم',
  'footer.joinLink': 'انضم إلى الأكاديمية',
  'footer.privacyLink': 'إشعار الخصوصية',
  'footer.contact': 'تواصل معنا',
  'footer.whatsapp': 'تواصل عبر واتساب',
  'footer.rights': 'جميع الحقوق محفوظة.',

  /* ── 404 page ────────────────────────────────────────────────── */
  'notFound.title': 'خارج الملعب',
  'notFound.text': 'الصفحة التي تبحث عنها تم استبدالها.',
  'notFound.backHome': 'العودة إلى الرئيسية',

  /* ── Privacy page ────────────────────────────────────────────── */
  'privacy.overline': 'بياناتك محترمة',
  'privacy.title': 'إشعار الخصوصية',
  'privacy.intro':
    'النسخة المختصرة والصادقة عن كيفية تعامل {site} مع المعلومات التي تشاركها معنا — بلا تعقيدات قانونية، نعدك بذلك.',
  'privacy.collectTitle': 'ما الذي نجمعه',
  'privacy.collectBody':
    'عند تعبئة نموذج التسجيل، نجمع اسم اللاعب وعمره وجنسيته، واسم ولي الأمر، وبيانات التواصل الخاصة بك — عادةً رقم هاتف أو واتساب وعنوان بريد إلكتروني. هذا كل ما نطلبه.',
  'privacy.whyTitle': 'لماذا نجمع هذه البيانات',
  'privacy.whyBody':
    'نستخدم هذه البيانات لغرض واحد فقط: التواصل معك بشأن التسجيل في الأكاديمية — لتأكيد طلبك، وترتيب أول حصة تجريبية، ومشاركة معلومات التدريب العملية. لا قوائم تسويقية، ولا تحليل بيانات، ولا رسائل غير متعلقة.',
  'privacy.whereTitle': 'أين تذهب معلوماتك',
  'privacy.whereBody':
    'تصل طلبات التسجيل مباشرةً إلى فريق الأكاديمية عبر البريد الإلكتروني من خلال اتصال آمن ومشفّر. وإذا اخترت مراسلتنا عبر واتساب، فإن رسائلك تُعالج داخل واتساب وفقًا لسياسة الخصوصية الخاصة بهم. بياناتك تذهب إلى فريقنا التدريبي — ولا إلى أي جهة أخرى.',
  'privacy.neverTitle': 'ما لا نفعله أبدًا',
  'privacy.neverBody':
    'لا نبيع بياناتك الشخصية ولا نؤجرها ولا نشاركها مع أي طرف ثالث لأغراض تسويقية أو غيرها. معلوماتك تبقى داخل {site}. دائمًا.',
  'privacy.childrenTitle': 'بيانات الأطفال',
  'privacy.childrenBody':
    'كرة القدم للأطفال — أما النماذج فللكبار. يجب أن يقدّم الطلب أحد الوالدين أو الوصي القانوني، ولا نجمع عن علم أي معلومات شخصية من الأطفال مباشرةً عبر هذا الموقع.',
  'privacy.retentionTitle': 'مدة الاحتفاظ بالبيانات',
  'privacy.retentionBody':
    'نحتفظ ببياناتك فقط للمدة اللازمة لمعالجة تسجيلك وإدارة عضويتك في الأكاديمية. وعندما لا تعود هناك حاجة إليها، يتم حذفها.',
  'privacy.contactTitle': 'الأسئلة والحذف',
  'privacy.contactBefore': 'تريد معرفة البيانات التي نحتفظ بها عنك، أو تصحيحها، أو طلب حذفها؟ راسلنا عبر البريد',
  'privacy.contactAfter': 'وسنتولى الأمر.',

  /* ── Per-route document titles ───────────────────────────────── */
  'page.about': 'الأكاديمية',
  'page.programs': 'البرامج والرسوم',
  'page.news': 'أخبار الأكاديمية',
  'page.calendar': 'الجدول والتقويم',
  'page.join': 'انضم إلى الأكاديمية',
  'page.privacy': 'إشعار الخصوصية',
  'page.notFound': 'الصفحة غير موجودة',

  /* ── Per-route meta descriptions (localized SEO) ─────────────── */
  'meta.homeDesc':
    'الأكاديمية الرسمية لنادي جنوى في مسقط، عُمان — تدريب احترافي لكرة القدم للناشئين والناشئات من عمر 5 إلى 16 سنة.',
  'meta.aboutDesc':
    'اكتشف أكاديمية جنوى عُمان — إرث نادي جنوى، مدربون مؤهلون من UEFA، ومسار واضح من تحت 6 إلى تحت 16 سنة في مسقط.',
  'meta.programsDesc':
    'الفئات العمرية وأيام وأوقات التدريب ورسوم الفصول وشروط الدفع في أكاديمية جنوى عُمان — الأكاديمية الرسمية لنادي جنوى في مسقط، للاعبين من 5 إلى 16 سنة.',
  'meta.newsDesc':
    'آخر الإعلانات وتحديثات الموسم وأخبار أكاديمية جنوى عُمان في مسقط.',
  'meta.calendarDesc':
    'تقويم التدريبات والجدول الأسبوعي لكل فئة عمرية في أكاديمية جنوى عُمان — من تحت 6 إلى تحت 16 سنة، أيام الاثنين والأربعاء والخميس، بمواعيد الشتاء والصيف.',
  'meta.joinDesc':
    'قدّم طلبك إلى أكاديمية جنوى عُمان — سجّل طفلك في تدريب احترافي لكرة القدم للناشئين في مسقط.',
  'meta.privacyDesc':
    'كيف تجمع أكاديمية جنوى عُمان المعلومات الشخصية التي تشاركها عبر نموذج التسجيل وتستخدمها وتحميها.',
  'meta.notFoundDesc':
    'الصفحة التي تبحث عنها تم استبدالها. عد إلى الصفحة الرئيسية لأكاديمية جنوى عُمان.',
};

export default ar;
