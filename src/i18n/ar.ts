// ═══════════════════════════════════════════════════════════════════
// ARABIC UI DICTIONARY — must export the exact same keys as en.ts
// (enforced by Record<DictKey, string>). Natural Modern Standard
// Arabic, football-context appropriate.
//
// TERMINOLOGY — the English split between "duration" (how long one
// training lasts) and "training days per week" (how often) is carried
// over deliberately: مدة التدريب vs أيام التدريب أسبوعيًا. Do not
// collapse both back into "حصص".
// ═══════════════════════════════════════════════════════════════════

import type { DictKey } from './en';

const ar: Record<DictKey, string> = {
  /* ── Site-wide ───────────────────────────────────────────────── */
  'site.location': 'مسقط، عُمان',
  'common.toBeConfirmed': '(قيد التأكيد)',

  /* ── Navbar ──────────────────────────────────────────────────── */
  'nav.home': 'الرئيسية',
  'nav.about': 'الأكاديمية',
  'nav.programs': 'البرامج',
  'nav.pathway': 'المسار',
  'nav.coaches': 'المدربون',
  'nav.location': 'الموقع',
  'nav.faq': 'الأسئلة الشائعة',
  'nav.register': 'التسجيل',
  'nav.news': 'الأخبار',
  'nav.calendar': 'التقويم',
  'nav.openMenu': 'فتح القائمة',
  'nav.closeMenu': 'إغلاق القائمة',
  'nav.dialogLabel': 'قائمة التنقل في الموقع',
  'nav.langSwitchLabel': 'تغيير اللغة',
  'nav.breadcrumbLabel': 'مسار التنقل',

  /* ── Hero (home) ─────────────────────────────────────────────── */
  'hero.badge': 'الأكاديمية الرسمية لنادي جنوى',
  'hero.headline': 'نصنع مستقبل كرة القدم',
  'hero.subheadline':
    'انضم إلى الأكاديمية الرسمية لنادي جنوى في مسقط، عُمان. تدريب بمستوى عالمي للجيل القادم من نجوم كرة القدم.',
  'hero.apply': 'سجّل الآن',
  'hero.explore': 'البرامج والرسوم',
  'hero.scroll': 'انزل',
  'hero.playerAlt': 'لاعب كرة قدم ناشئ بقميص نادي جنوى',

  /* ── Home: at a glance ───────────────────────────────────────── */
  'quick.title': 'نظرة سريعة',
  'quick.pricing': 'البرامج والأسعار',
  'quick.pricingHint': 'كل الرسوم، لكل فصل وللموسم الكامل',
  'quick.times': 'أوقات التدريب',
  'quick.timesHint': 'الأحد · الثلاثاء · الأربعاء، حسب الفئة',
  'quick.location': 'الموقع',
  'quick.locationHint': 'حرم مدينة السلطان قابوس، مسقط',
  'quick.register': 'التسجيل',
  'quick.registerHint': 'نموذج واحد، دقيقتان',

  /* ── Home: Why us ────────────────────────────────────────────── */
  'why.overline': 'لماذا نحن',
  'why.title': 'الفرق مع جنوى',

  /* ── Home: Programs preview ──────────────────────────────────── */
  'programsPreview.overline': 'برامجنا',
  'programsPreview.title': 'فريق لكل فئة عمرية',
  'programsPreview.viewAll': 'عرض البرامج والرسوم',
  'programsPreview.feesFrom': 'من',
  'programsPreview.feesNote':
    'الفصل الأول، بيومي تدريب أسبوعيًا. الجدول الكامل — كل فصل وسعر الموسم الكامل جنبًا إلى جنب — في صفحة البرامج.',

  /* ── Home: CTA band ──────────────────────────────────────────── */
  'cta.title': 'مستعد للعب؟',
  'cta.text':
    'الأماكن محدودة في كل فئة عمرية. سجّل اليوم وسيتواصل معك فريقنا لتأكيد مكان طفلك.',
  'cta.button': 'سجّل الآن',
  'cta.whatsapp': 'اسألنا على واتساب',

  /* ── Gallery (photo + video slideshow) ───────────────────────── */
  'gallery.overline': 'معرض الصور',
  'gallery.title': 'الحياة في الأكاديمية',
  'gallery.label': 'معرض صور وفيديوهات الأكاديمية',
  'gallery.prev': 'العنصر السابق',
  'gallery.next': 'العنصر التالي',
  'gallery.goToSlide': 'الانتقال إلى العنصر {n}',
  'gallery.pause': 'إيقاف العرض',
  'gallery.play': 'تشغيل العرض',
  'gallery.counter': '{current} / {total}',
  'gallery.photoAlt': 'تدريب أكاديمية جنوى عُمان — صورة {n}',
  'gallery.videoLabel': 'فيديو تدريب أكاديمية جنوى عُمان {n}',
  'gallery.videoBadge': 'فيديو',
  'gallery.playVideo': 'تشغيل الفيديو',
  'gallery.pauseVideo': 'إيقاف الفيديو',
  'gallery.noVideo': 'متصفحك لا يدعم تشغيل الفيديو المدمج.',

  /* ── Pathway section ─────────────────────────────────────────── */
  'pathway.overline': 'مسار اللاعب',
  'pathway.title': 'خمس مراحل، رحلة واحدة',
  'pathway.intro':
    'يسير كل لاعب في المسار نفسه، وبالوتيرة التي تناسبه — من أول لمسة للكرة إلى المعايير المطلوبة من اللاعبين الطامحين إلى الاحتراف.',

  /* ── Coaches section ─────────────────────────────────────────── */
  'coaches.overline': 'مدربونا',
  'coaches.title': 'المدربون',
  'coaches.photoAlt': '{name}، {role} في أكاديمية جنوى عُمان',
  'coaches.photoPending': 'الصورة لاحقًا',
  'coaches.openSlot': 'مقعد متاح',
  'coaches.languagesLabel': 'اللغات',
  'coaches.readMore': 'اقرأ المزيد',
  'coaches.readLess': 'عرض أقل',

  /* ── Location section ────────────────────────────────────────── */
  'location.overline': 'أين نتدرب',
  'location.title': 'الموقع',
  'location.addressLabel': 'العنوان',
  'location.plusCodeLabel': 'رمز Plus Code',
  'location.coordinatesLabel': 'الإحداثيات',
  'location.openInMaps': 'الفتح في خرائط جوجل',
  'location.gettingHereTitle': 'الوصول والمواقف وإنزال اللاعبين',
  'location.loadMap': 'إظهار الخريطة',
  'location.mapTitle': 'خريطة توضح {venue}',

  /* ── The Academy page ────────────────────────────────────────── */
  'about.overline': 'عن الأكاديمية',
  'about.joinCta': 'سجّل طفلك',
  'about.followUs': 'تابعنا',

  /* ── Pricing tables (shared by Programs and the form) ────────── */
  'pricing.frequencyHeader': 'البرنامج',
  'pricing.trainingDaysPerWeek': '{count} أيام تدريب أسبوعيًا',
  'pricing.trainingDaysDual': 'يومان تدريب أسبوعيًا',
  'pricing.fullSeasonHeader': 'الموسم الكامل',
  'pricing.fullSeasonSub': 'الفصول الثلاثة، مدفوعة بالكامل مقدمًا. وتوفّر 10٪.',
  'pricing.upfrontNote': 'مدفوعة مقدمًا',
  'pricing.monthlyLabel': 'أقساط شهرية',
  'pricing.monthlyEach': '{amount} / شهريًا',
  'pricing.monthlyBreakdown': '{count} أقساط · {total} إجمالًا',
  'pricing.saveVsTerms': 'توفّر {amount} مقارنة بالدفع فصلًا بفصل.',
  'pricing.instalmentsCount': '{count} أقساط شهرية',

  /* ── Programs page ───────────────────────────────────────────── */
  'programs.overline': 'البرامج والرسوم',
  'programs.title': 'اعرف فريقك',
  'programs.intro':
    'ست فئات عمرية، من تحت 6 إلى تحت 16 سنة. تتدرب كل الفرق أيام الأحد والثلاثاء والأربعاء — تختار يومين منها أو الأيام الثلاثة. وفي ما يلي المواعيد وتواريخ الفصول وكل الرسوم مع سعر الموسم الكامل بجانبها.',

  'programs.scheduleOverline': 'أسبوع التدريب',
  'programs.scheduleTitle': 'مواعيد التدريب',
  'programs.frequencyExplainer':
    '«أيام التدريب أسبوعيًا» تعني عدد مرات تدريب طفلك. و«المدة» تعني طول التدريب الواحد — 60 دقيقة لفئتي تحت 6 وتحت 8، و90 دقيقة من تحت 10 وما فوق.',

  'programs.termsOverline': 'الموسم',
  'programs.termsTitle': 'ثلاثة فصول، 33 أسبوعًا',
  'programs.termHeader': 'الفصل الدراسي',
  'programs.weeksHeader': 'المدة',
  'programs.datesHeader': 'التواريخ',
  'programs.instalmentsHeader': 'في حال الدفع الشهري',

  'programs.pricingOverline': 'الفئات العمرية والرسوم',
  'programs.pricingTitle': 'اختر الفئة العمرية',
  'programs.daysLabel': 'أيام التدريب',
  'programs.timeLabel': 'الموعد',
  'programs.durationLabel': 'المدة',
  'programs.registerFor': 'التسجيل في {name}',
  'programs.registerWithDays': 'التسجيل · {days}',
  'programs.bandCaption': 'تُحدَّد رسوم {name} في فئة {band}.',
  'programs.openItemsTitle': 'سؤالان عن الرسوم قيد التأكيد',

  'programs.includedOverline': 'ماذا تحصل عليه',
  'programs.includedTitle': 'ماذا يحصل عليه طفلك',
  'programs.policiesOverline': 'الشروط',
  'programs.policiesTitle': 'الشروط والسياسات',
  'programs.faqLinkTitle': 'ما زال لديك سؤال؟',
  'programs.faqLinkText':
    'أيام التدريب، وتواريخ الفصول، والأقساط، والزي، والاسترداد، والموقع — كلها مُجابة في صفحة واحدة.',
  'programs.faqLinkButton': 'اقرأ الأسئلة الشائعة',
  'programs.ctaTitle': 'مستعد للانضمام إلى الفريق؟',
  'programs.ctaText':
    'الأماكن محدودة في كل فئة عمرية. سجّل اليوم وسنؤكد مكان طفلك.',

  /* ── FAQ page ────────────────────────────────────────────────── */
  'faq.overline': 'أسئلة وأجوبة',
  'faq.title': 'الأسئلة الشائعة',
  'faq.intro':
    'كل ما يسألنا عنه أولياء الأمور، مرتّبًا في مجموعات لتجد سؤالك بسرعة. اضغط على أي سؤال لفتحه.',
  'faq.jumpLabel': 'الانتقال إلى قسم',
  'faq.linkToAnswer': 'رابط هذه الإجابة',
  'faq.stillStuckTitle': 'ما زلت غير متأكد؟',
  'faq.stillStuckText':
    'راسلنا على واتساب وسيجيبك أحد المدربين، أو تعال لرؤية الملعب بنفسك.',
  'faq.stillStuckButton': 'شاهد الموقع',

  /* ── News page ───────────────────────────────────────────────── */
  'news.overline': 'أخبار الأكاديمية',
  'news.title': 'آخر أخبار الأكاديمية',
  'news.intro':
    'إعلانات وتحديثات الموسم وأخبار أكاديمية جنوى عُمان — أسرع طريقة للبقاء على اطلاع بين التدريبات.',
  'news.empty': 'لا توجد أخبار لعرضها حاليًا. عد قريبًا.',
  'news.followTitle': 'تابعنا للحصول على تحديثات يومية',
  'news.followText':
    'مقاطع المباريات وأبرز لحظات التدريبات والإعلانات تصل أولًا على إنستغرام وواتساب.',

  /* ── Calendar & training schedule page ───────────────────────── */
  'calendar.overline': 'التقويم والجدول',
  'calendar.title': 'مواعيد تدريبنا',
  'calendar.intro':
    'تتدرب كل فئة عمرية أيام الأحد والثلاثاء والأربعاء، وتحتفظ بالموعد نفسه طوال الفصل الدراسي. وجدول الرسوم الكامل في صفحة البرامج.',
  'calendar.weekOverline': 'أسبوع التدريب',
  'calendar.weekTitle': 'الجدول الأسبوعي',
  'calendar.scheduleOverline': 'الجدول الكامل',
  'calendar.scheduleTitle': 'مواعيد التدريب حسب الفئة العمرية',
  'calendar.seasonOverline': 'الموسم',
  'calendar.seasonTitle': 'تقويم الأكاديمية',
  'calendar.seasonIntro':
    'ينقسم العام التدريبي إلى ثلاثة فصول — 33 أسبوعًا من التدريب إجمالًا.',
  'calendar.ageHeader': 'الفئة العمرية',
  'calendar.daysHeader': 'أيام التدريب',
  'calendar.timeHeader': 'الموعد',
  'calendar.durationHeader': 'المدة',
  'calendar.note':
    'يُبلَّغ أولياء الأمور مسبقًا بأي تغيير في الأيام أو المواعيد أو تواريخ الفصول.',
  'calendar.ctaButton': 'سجّل الآن',
  'calendar.viewFees': 'عرض البرامج والرسوم',

  /* ── Registration page ───────────────────────────────────────── */
  'register.backHome': 'العودة إلى الرئيسية',
  'register.overline': 'انضم إلى الأكاديمية',
  'register.title': 'التسجيل',
  'register.subtitle':
    'نموذج واحد، دقيقتان. يؤكد فريقنا مكان طفلك عبر واتساب خلال 24 ساعة.',

  /* ── Registration form ───────────────────────────────────────── */
  'form.playerName': 'اسم اللاعب الكامل',
  'form.playerNamePlaceholder': 'أدخل اسم اللاعب الكامل',
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
  'form.noMatches': 'لا توجد نتائج',
  'form.email': 'البريد الإلكتروني',
  'form.emailPlaceholder': 'أدخل بريدك الإلكتروني',
  'form.program': 'الفئة العمرية',
  'form.programPlaceholder': 'اختر الفئة العمرية',
  'form.frequency': 'أيام التدريب أسبوعيًا',
  'form.frequencyPlaceholder': 'كم مرة سيتدرب؟',
  'form.frequencyHint':
    'نتدرب أيام {days}. يومان أسبوعيًا يعني انتقاء يومين منها؛ وثلاثة تعني الأيام الثلاثة.',
  'form.term': 'لأي فصل دراسي تنضم؟',
  'form.termPlaceholder': 'اختر الفصل الدراسي',
  'form.payment': 'كيف تفضّل الدفع؟',
  'form.paymentLocked':
    'اختر الفئة العمرية وأيام التدريب والفصل الدراسي أعلاه، وسيظهر هنا سعر كل طريقة دفع.',
  'form.pay.term': 'الدفع لكل فصل دراسي',
  'form.pay.monthly': 'الدفع شهريًا (أقساط)',
  'form.pay.season': 'الدفع للموسم الكامل',
  'form.pay.termDetail': 'دفعة واحدة تغطي {term} بالكامل.',
  'form.pay.monthlyDetail': '{count} أقساط بقيمة {each} لكل قسط. وتكلفته الإجمالية أعلى.',
  'form.pay.seasonDetail': 'الفصول الثلاثة مقدمًا — خصم {pct}٪، بتوفير {saving}.',
  'form.summaryLabel': 'أنت تسجّل في',
  'form.summaryChange': 'تغيير',
  'form.summaryIncomplete': 'اختر أيام التدريب والفصل الدراسي لعرض السعر.',
  'form.consent': 'أنا ولي أمر اللاعب وأوافق على التواصل معي بشأن التسجيل في الأكاديمية',
  'form.honeypot': 'اترك هذا الحقل فارغًا',
  'form.submit': 'إرسال التسجيل',
  'form.submitting': 'جارٍ الإرسال...',
  'form.submitError':
    'لم نتمكن من إرسال تسجيلك الآن. تحقق من اتصالك بالإنترنت وحاول مرة أخرى — بياناتك لا تزال محفوظة.',
  'form.tryAgain': 'حاول مرة أخرى',
  'form.successTitle': 'شكرًا لك!',
  'form.successText':
    'تم استلام تسجيلك. سيتواصل معك فريقنا خلال 24 ساعة عبر واتساب والبريد الإلكتروني.',
  'form.successWhatsapp': 'أكّد أسرع عبر واتساب',
  'form.backToForm': 'العودة إلى النموذج',

  /* ── Validation messages ─────────────────────────────────────── */
  'form.err.playerRequired': 'اسم اللاعب مطلوب',
  'form.err.playerShort': 'يجب أن يكون اسم اللاعب حرفين على الأقل',
  'form.err.playerChars': 'اسم اللاعب يحتوي على أحرف غير صالحة',
  'form.err.parentRequired': 'اسم ولي الأمر مطلوب',
  'form.err.parentShort': 'يجب أن يكون اسم ولي الأمر حرفين على الأقل',
  'form.err.parentChars': 'اسم ولي الأمر يحتوي على أحرف غير صالحة',
  'form.err.nationalityRequired': 'يرجى اختيار جنسيتك',
  'form.err.ageRequired': 'العمر مطلوب',
  'form.err.ageNumber': 'يجب أن يكون العمر رقمًا صحيحًا',
  'form.err.ageRange': 'يجب أن يكون العمر بين {min} و{max}',
  'form.err.phoneRequired': 'رقم الهاتف مطلوب',
  'form.err.phoneDigits': 'يجب أن يحتوي رقم الهاتف على أرقام فقط',
  'form.err.phoneShort': 'يجب أن يكون رقم الهاتف 7 أرقام على الأقل',
  'form.err.phoneLong': 'رقم الهاتف يبدو طويلًا جدًا',
  'form.err.emailRequired': 'البريد الإلكتروني مطلوب',
  'form.err.emailInvalid': 'يرجى إدخال بريد إلكتروني صالح',
  'form.err.programRequired': 'يرجى اختيار الفئة العمرية لطفلك',
  'form.err.programAgeSuggest': 'فئة {program} للأعمار {min}–{max}. وفي سن {age}، اختر {suggested}.',
  'form.err.programAgeRange': 'فئة {program} للأعمار {min}–{max}.',
  'form.err.frequencyRequired': 'يرجى اختيار يومي تدريب أو 3 أيام أسبوعيًا',
  'form.err.termRequired': 'يرجى اختيار الفصل الدراسي الذي تنضم إليه',
  'form.err.paymentRequired': 'يرجى اختيار طريقة الدفع',
  'form.err.consentRequired': 'موافقة ولي الأمر مطلوبة للإرسال',

  /* ── WhatsApp prefill + email metadata (form submissions) ────── */
  'form.waTitle': '*تسجيل جديد في الأكاديمية*',
  'form.waPlayer': '*اللاعب:*',
  'form.waParent': '*ولي الأمر:*',
  'form.waNationality': '*الجنسية:*',
  'form.waAge': '*العمر:*',
  'form.waPhone': '*الهاتف:*',
  'form.waEmail': '*البريد الإلكتروني:*',
  'form.waProgram': '*الفئة العمرية:*',
  'form.waFrequency': '*أيام التدريب:*',
  'form.waTerm': '*الفصل الدراسي:*',
  'form.waPayment': '*الدفع:*',

  /* ── WhatsApp floating button ────────────────────────────────── */
  'whatsapp.chat': 'تواصل عبر واتساب',

  /* ── Footer ──────────────────────────────────────────────────── */
  'footer.tagline': 'نرعى موهبة كرة القدم في {location}',
  'footer.pages': 'جميع الصفحات',
  'footer.findFast': 'وصول سريع',
  'footer.pricingLink': 'الرسوم والأسعار',
  'footer.timesLink': 'أوقات التدريب',
  'footer.termsLink': 'تواريخ الفصول',
  'footer.whereWeTrain': 'أين نتدرب',
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
    'النسخة القصيرة والصادقة لكيفية تعامل {site} مع المعلومات التي تشاركها معنا — بلا تعقيدات قانونية، نعدك بذلك.',
  'privacy.collectTitle': 'ما نجمعه',
  'privacy.collectBody':
    'عند تعبئة نموذج التسجيل، نجمع اسم اللاعب وعمره وجنسيته، واسم ولي الأمر، وبيانات التواصل الخاصة بك — عادةً رقم هاتف أو واتساب وبريد إلكتروني. هذا كل ما نطلبه.',
  'privacy.whyTitle': 'لماذا نجمعها',
  'privacy.whyBody':
    'نستخدم هذه البيانات لسبب واحد فقط: التواصل معك بشأن تسجيلك في الأكاديمية — تأكيد مكانك، وترتيب أول تدريب لطفلك، ومشاركة المعلومات العملية. لا قوائم تسويقية، ولا تصنيف، ولا رسائل غير ذات صلة.',
  'privacy.whereTitle': 'إلى أين تذهب معلوماتك',
  'privacy.whereBody':
    'تُسلَّم بيانات نموذج التسجيل مباشرة إلى فريق الأكاديمية بالبريد الإلكتروني عبر اتصال آمن ومشفر. وإذا فضّلت مراسلتنا على واتساب، فتُعالَج رسالتك داخل واتساب وفق سياسة الخصوصية الخاصة به. بياناتك تذهب إلى طاقمنا التدريبي — ولا إلى أي جهة أخرى.',
  'privacy.neverTitle': 'ما لا نفعله أبدًا',
  'privacy.neverBody':
    'لا نبيع بياناتك الشخصية ولا نؤجّرها ولا نشاركها مع أطراف ثالثة لأغراض تسويقية أو لأي غرض آخر. معلوماتك تبقى داخل {site}. دائمًا.',
  'privacy.childrenTitle': 'بيانات الأطفال',
  'privacy.childrenBody':
    'كرة القدم للأطفال — والنماذج للكبار. يجب أن يقدّم التسجيل ولي الأمر أو الوصي القانوني، ولا نجمع عن علم معلومات شخصية من الأطفال مباشرة عبر هذا الموقع.',
  'privacy.retentionTitle': 'كم نحتفظ بها',
  'privacy.retentionBody':
    'نحتفظ ببياناتك فقط للمدة اللازمة لمعالجة تسجيلك وإدارة عضوية الأكاديمية. وعندما لا تعد هناك حاجة إليها، تُحذف.',
  'privacy.contactTitle': 'الاستفسارات والحذف',
  'privacy.contactBefore':
    'تريد معرفة ما نحتفظ به عنك، أو تصحيحه، أو طلب حذفه؟ راسلنا على',
  'privacy.contactAfter': 'وسنتولى الأمر.',

  /* ── Per-route document titles ───────────────────────────────── */
  'page.about': 'الأكاديمية',
  'page.programs': 'البرامج والرسوم',
  'page.faq': 'الأسئلة الشائعة',
  'page.news': 'أخبار الأكاديمية',
  'page.calendar': 'التقويم وجدول التدريب',
  'page.join': 'التسجيل',
  'page.privacy': 'إشعار الخصوصية',
  'page.notFound': 'الصفحة غير موجودة',

  /* ── Per-route meta descriptions (localized SEO) ─────────────── */
  'meta.homeDesc':
    'الأكاديمية الرسمية لنادي جنوى في مسقط، عُمان — تدريب احترافي لكرة القدم للناشئين من الأولاد والبنات من 5 إلى 16 سنة.',
  'meta.aboutDesc':
    'أكاديمية جنوى عُمان — مسار اللاعب، ومدربونا المرخّصون من UEFA، وأين نتدرب في مسقط.',
  'meta.programsDesc':
    'الفئات العمرية وأيام التدريب ومواعيده وتواريخ الفصول وكل الرسوم — لكل فصل وشهريًا وللموسم الكامل — في أكاديمية جنوى عُمان، الأكاديمية الرسمية لنادي جنوى في مسقط، للاعبين من 5 إلى 16 سنة.',
  'meta.faqDesc':
    'الأعمار وأيام التدريب ومواعيده وتواريخ الفصول والرسوم والأقساط والزي والموقع — كل ما يسأل عنه أولياء الأمور أكاديمية جنوى عُمان، مُجابًا.',
  'meta.newsDesc':
    'آخر الإعلانات وتحديثات الموسم وأخبار أكاديمية جنوى عُمان في مسقط.',
  'meta.calendarDesc':
    'تقويم التدريب والجدول الأسبوعي لكل فئة عمرية في أكاديمية جنوى عُمان — من تحت 6 إلى تحت 16 سنة، أيام الأحد والثلاثاء والأربعاء.',
  'meta.joinDesc':
    'سجّل طفلك في أكاديمية جنوى عُمان — تدريب احترافي لكرة القدم للناشئين في مسقط، من 5 إلى 16 سنة.',
  'meta.privacyDesc':
    'كيف تجمع أكاديمية جنوى عُمان المعلومات الشخصية التي تشاركها عبر نموذج التسجيل وتستخدمها وتحميها.',
  'meta.notFoundDesc':
    'الصفحة التي تبحث عنها تم استبدالها. عد إلى الصفحة الرئيسية لأكاديمية جنوى عُمان.',
};

export default ar;
