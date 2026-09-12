// ═══════════════════════════════════════════════════════════════════
// REGISTRATION FORM — lead capture for Genoa Academy Oman.
// Owned by Form_Engineer_W1. Hand-rolled controls only (no src/components/ui).
// Contact details & keys come from '@/config/site'; localized programs via useContent().
// IMPORTANT: flags/dial codes are ALWAYS resolved by ISO country code, never
// by dialCode (many countries share +1 etc.).
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, FormEvent, KeyboardEvent, ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  User,
  UserRound,
  Calendar,
  Phone,
  Mail,
  Check,
  CheckCircle,
  Loader2,
  AlertTriangle,
  MessageCircle,
  ChevronDown,
  Pencil,
} from 'lucide-react';
import { SITE, whatsappLink } from '@/config/site';
import { reportFormSubmitted } from '@/lib/presence';
import { countries } from '@/data/countries';
import type { Country } from '@/data/countries';
import type { Program, TermRow } from '@/data/content';
import {
  FREQUENCIES,
  PAYMENT_OPTIONS,
  SEASON_DISCOUNT_PCT,
  formatOMR,
  monthlyTotal,
  optionTotal,
  parseFrequency,
  parsePaymentOption,
  parseProgramId,
  parseTermId,
  pricingRow,
  seasonSaving,
  termPrice,
  type Frequency,
  type PaymentOption,
  type PricingRow,
  type TermId,
} from '@/data/pricing';
import { trainingDaysLabel } from '@/i18n/labels';
import { useLanguage } from '@/i18n/useLanguage';
import { useContent } from '@/i18n/useContent';
import type { TParams } from '@/i18n/context';

/* ── Types ─────────────────────────────────────────────────────── */

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

interface FormData {
  playerName: string;
  parentName: string;
  nationality: string; // ISO code of the player's nationality
  age: string;
  phoneCountry: string; // ISO code that OWNS the selected dial code
  phoneNumber: string; // digits only
  email: string;
  program: string; // Program id ('' = none selected) — required
  /** Training days per week, as a string because it comes from a <select>. */
  frequency: '' | '2' | '3';
  /** Which term they are joining for. */
  term: '' | TermId;
  /** How they intend to pay. Drives the live total. */
  payment: '' | PaymentOption;
  consent: boolean;
}

type FieldKey =
  | 'playerName'
  | 'parentName'
  | 'nationality'
  | 'age'
  | 'phoneNumber'
  | 'email'
  | 'program'
  | 'frequency'
  | 'term'
  | 'payment'
  | 'consent';
/** true = invalid. Messages are derived at render time so they follow the active language. */
type FormErrors = Partial<Record<FieldKey, boolean>>;

type Translate = (key: string, params?: TParams) => string;

const FIELD_ORDER: FieldKey[] = [
  'playerName',
  'parentName',
  'nationality',
  'age',
  'phoneNumber',
  'email',
  'program',
  'frequency',
  'term',
  'payment',
  'consent',
];

const FIELD_IDS: Record<FieldKey, string> = {
  playerName: 'player-name',
  parentName: 'parent-name',
  nationality: 'nationality',
  age: 'age',
  phoneNumber: 'phone',
  email: 'email',
  program: 'program',
  frequency: 'frequency',
  term: 'term',
  /* The radio group has no single input to focus — point at the first one. */
  payment: 'payment-term',
  consent: 'consent',
};

const RESUBMIT_THROTTLE_MS = 60_000;

/* ── Duplicate-submit guard ────────────────────────────────────────
   Swallows a re-submit of the SAME registration within 60s of it being
   delivered — a double tap, or an impatient second press. Scoped to an
   identical payload so a second child still sends, and armed only once
   a send actually succeeded, or "Try again" would silently do nothing
   for a minute.

   Both halves live at module scope deliberately: reading the clock is
   not render work, and keeping Date.now() out of the component body
   keeps that obvious to a reader (and to the react-hooks purity rule,
   which flags a bare Date.now() inside a component). */
function isDuplicateSubmit(signature: string, lastSignature: string, lastAt: number): boolean {
  return signature === lastSignature && Date.now() - lastAt < RESUBMIT_THROTTLE_MS;
}

function armDuplicateGuard(
  atRef: { current: number },
  signatureRef: { current: string },
  signature: string
): void {
  atRef.current = Date.now();
  signatureRef.current = signature;
}

/* Input ceilings — kept in step with validateField(), and enforced on the
   inputs too so an oversized payload can never leave the browser. */
const NAME_MAX_LENGTH = 80;
const EMAIL_MAX_LENGTH = 254; // RFC 5321 maximum address length
const PHONE_MAX_DIGITS = 15; // E.164 maximum

/** Submission time in Muscat, so the academy reads it in local time. */
function submittedAt(): string {
  try {
    const stamp = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Muscat',
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(new Date());
    return `${stamp} (Muscat time)`;
  } catch {
    return new Date().toISOString();
  }
}

const INITIAL_FORM_DATA: FormData = {
  playerName: '',
  parentName: '',
  nationality: '',
  age: '',
  phoneCountry: 'OM', // default dial code: Oman (+968), resolved by ISO code
  phoneNumber: '',
  email: '',
  program: '',
  frequency: '',
  term: '',
  payment: '',
  consent: false,
};

/* ── Pre-selection from the URL ────────────────────────────────────
   A Register button next to an age group arrives here as
   /register?age=U10&frequency=3&term=term1, so the parent never has to
   re-pick what they just clicked (see src/lib/registerLink.ts).

   Every value is parsed, not trusted: anything unrecognised — a stale
   link, a typo, an age group that no longer exists — is dropped and
   that field simply starts empty. With no parameters at all this
   returns INITIAL_FORM_DATA unchanged, so the form behaves exactly as
   it did before.                                                   */
function formDataFromParams(params: URLSearchParams, programIds: string[]): FormData {
  const age = parseProgramId(params.get('age'), programIds);
  const frequency = parseFrequency(params.get('frequency'));
  const term = parseTermId(params.get('term'));
  const payment = parsePaymentOption(params.get('payment'));

  return {
    ...INITIAL_FORM_DATA,
    ...(age ? { program: age } : {}),
    ...(frequency ? { frequency: String(frequency) as '2' | '3' } : {}),
    ...(term ? { term } : {}),
    ...(payment ? { payment } : {}),
  };
}

/* ── Validation (pure, messages localized through t) ───────────── */

const NAME_PATTERN = /^[\p{L}][\p{L}\s.'’-]*$/u;

function validateName(value: string, prefix: 'player' | 'parent', t: Translate): string | undefined {
  const v = value.trim();
  if (!v) return t(`form.err.${prefix}Required`);
  if (v.length < 2) return t(`form.err.${prefix}Short`);
  if (!NAME_PATTERN.test(v)) return t(`form.err.${prefix}Chars`);
  return undefined;
}

/**
 * Cross-field check: the chosen squad must match the player's age, otherwise
 * the academy receives a lead it has to bounce back. Reported on `program`,
 * because that is the field the parent should change.
 */
function validateProgramAge(
  data: FormData,
  t: Translate,
  programs: Program[]
): string | undefined {
  const selected = programs.find(p => p.id === data.program);
  if (!selected) return undefined;

  const age = Number.parseInt(data.age.trim(), 10);
  if (!Number.isFinite(age)) return undefined; // the age field reports its own errors
  if (age >= selected.minAge && age <= selected.maxAge) return undefined;

  const suggested = programs.find(p => age >= p.minAge && age <= p.maxAge);
  const params = {
    program: selected.name,
    min: selected.minAge,
    max: selected.maxAge,
    age,
    suggested: suggested ? suggested.name : '',
  };
  return suggested
    ? t('form.err.programAgeSuggest', params)
    : t('form.err.programAgeRange', params);
}

function validateField(
  field: FieldKey,
  data: FormData,
  t: Translate,
  programs: Program[]
): string | undefined {
  switch (field) {
    case 'playerName':
      return validateName(data.playerName, 'player', t);
    case 'parentName':
      return validateName(data.parentName, 'parent', t);
    case 'nationality':
      return data.nationality ? undefined : t('form.err.nationalityRequired');
    case 'age': {
      const v = data.age.trim();
      if (!v) return t('form.err.ageRequired');
      if (!/^\d+$/.test(v)) return t('form.err.ageNumber');
      const n = parseInt(v, 10);
      if (n < SITE.ageMin || n > SITE.ageMax)
        return t('form.err.ageRange', { min: SITE.ageMin, max: SITE.ageMax });
      return undefined;
    }
    case 'phoneNumber': {
      const v = data.phoneNumber.trim();
      if (!v) return t('form.err.phoneRequired');
      if (!/^\d+$/.test(v)) return t('form.err.phoneDigits');
      if (v.length < 7) return t('form.err.phoneShort');
      if (v.length > 15) return t('form.err.phoneLong');
      return undefined;
    }
    case 'email': {
      const v = data.email.trim();
      if (!v) return t('form.err.emailRequired');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return t('form.err.emailInvalid');
      return undefined;
    }
    case 'program':
      if (!data.program) return t('form.err.programRequired');
      return validateProgramAge(data, t, programs);
    case 'frequency':
      return data.frequency ? undefined : t('form.err.frequencyRequired');
    case 'term':
      return data.term ? undefined : t('form.err.termRequired');
    case 'payment':
      return data.payment ? undefined : t('form.err.paymentRequired');
    case 'consent':
      return data.consent ? undefined : t('form.err.consentRequired');
  }
}

/* ── Shared styles ─────────────────────────────────────────────── */

/* Stadium Editorial: large corner ticks on the form/success panels.
   The panels themselves use the .card-panel + .corner-ticks utilities;
   these vars only enlarge the L-brackets on this page's panels. */
const panelTickStyle: CSSProperties = {
  '--ct-length': '22px',
  '--ct-thickness': '2px',
  '--ct-offset': '14px',
} as CSSProperties;

const labelClass =
  'font-inter text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-[#C9A84C]';

const inputBaseClass =
  'w-full bg-[rgba(6,15,37,0.6)] border rounded-[2px] px-4 py-[0.875rem] font-inter text-[1rem] text-white placeholder:text-[rgba(138,148,166,0.85)] transition-all duration-300 focus:outline-none';

const errorTextClass = 'font-inter text-[0.75rem] text-[#EF4444]';

/* Focus = 2px gold BOTTOM underline (inset shadow), never a full ring.
   Error state keeps the full red border. */
const fieldBorderClass = (invalid: boolean) =>
  invalid
    ? 'border-[#EF4444]'
    : 'border-[rgba(201,168,76,0.25)] focus:border-[rgba(201,168,76,0.25)] focus:shadow-[inset_0_-2px_0_#C9A84C]';

/* ── Small pieces ──────────────────────────────────────────────── */

function RequiredMark() {
  return (
    <span aria-hidden="true" className="text-[#EF4444]">
      {' '}
      *
    </span>
  );
}

/* ── Accessible searchable listbox (hand-rolled) ───────────────── */

interface SearchableListboxProps {
  id: string;
  value: string; // ISO code ('' = nothing selected)
  options: Country[];
  placeholder: string;
  searchPlaceholder: string;
  hasError: boolean;
  describedById?: string;
  labelId?: string; // aria-labelledby for the trigger button
  ariaLabel?: string; // used when labelId is not provided
  buttonContent: (selected: Country | undefined) => ReactNode;
  optionContent: (country: Country) => ReactNode;
  matches: (country: Country, query: string) => boolean;
  onSelect: (code: string) => void;
  buttonClassName?: string;
  listClassName?: string;
}

function SearchableListbox({
  id,
  value,
  options,
  placeholder,
  searchPlaceholder,
  hasError,
  describedById,
  labelId,
  ariaLabel,
  buttonContent,
  optionContent,
  matches,
  onSelect,
  buttonClassName = '',
  listClassName = 'start-0 end-0',
}: SearchableListboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { t } = useLanguage();

  const selected = options.find(o => o.code === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(o => matches(o, q));
  }, [options, query, matches]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  // Close on outside pointer-down (document listener, only while open)
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  // Keep the active option sensible when opening or filtering
  useEffect(() => {
    if (!open) return;
    if (query.trim() === '') {
      const idx = filtered.findIndex(o => o.code === value);
      setActiveIndex(idx >= 0 ? idx : 0);
    } else {
      setActiveIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, query]);

  // Scroll the active option into view for keyboard navigation
  useEffect(() => {
    if (!open) return;
    const opt = filtered[Math.min(activeIndex, Math.max(filtered.length - 1, 0))];
    if (opt) {
      document.getElementById(`${id}-option-${opt.code}`)?.scrollIntoView({ block: 'nearest' });
    }
  }, [open, activeIndex, filtered, id]);

  const selectOption = (code: string) => {
    onSelect(code);
    close();
    buttonRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!open) setOpen(true);
        else setActiveIndex(i => Math.min(i + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (open) setActiveIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        if (open) {
          e.preventDefault();
          const opt = filtered[Math.min(activeIndex, Math.max(filtered.length - 1, 0))];
          if (opt) selectOption(opt.code);
        }
        break;
      case 'Escape':
        if (open) {
          e.preventDefault();
          close();
          buttonRef.current?.focus();
        }
        break;
      case 'Tab':
        if (open) close();
        break;
    }
  };

  const activeOption =
    filtered.length > 0 ? filtered[Math.min(activeIndex, filtered.length - 1)] : undefined;

  const labelProps = labelId
    ? { 'aria-labelledby': labelId }
    : { 'aria-label': ariaLabel ?? placeholder };

  return (
    <div ref={rootRef} className="relative" onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={hasError}
        aria-describedby={hasError ? describedById : undefined}
        {...labelProps}
        onClick={() => (open ? close() : setOpen(true))}
        className={buttonClassName}
      >
        {buttonContent(selected)}
        <ChevronDown
          size={16}
          className="text-[#C9A84C] flex-shrink-0 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div
          className={`absolute z-30 top-full mt-1 rounded-[2px] overflow-hidden ${listClassName}`}
          style={{
            backgroundColor: '#060F25',
            border: '1px solid rgba(201, 168, 76, 0.2)',
            maxHeight: '280px',
          }}
        >
          <div className="p-2">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              aria-activedescendant={activeOption ? `${id}-option-${activeOption.code}` : undefined}
              autoFocus
              className="w-full bg-[rgba(6,15,37,0.8)] border border-[rgba(201,168,76,0.2)] rounded-[2px] px-3 py-2 font-inter text-[0.875rem] text-white placeholder:text-[rgba(138,148,166,0.85)] focus:outline-none focus:border-[#C9A84C]"
            />
          </div>
          <ul
            role="listbox"
            aria-label={placeholder}
            className="overflow-y-auto"
            style={{ maxHeight: '220px' }}
          >
            {filtered.map((c, i) => (
              <li
                key={c.code}
                id={`${id}-option-${c.code}`}
                role="option"
                aria-selected={c.code === value}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => selectOption(c.code)}
                className={`px-4 py-2.5 font-inter text-[0.875rem] cursor-pointer transition-colors flex items-center gap-2 ${
                  i === activeIndex ? 'bg-[rgba(201,168,76,0.12)]' : ''
                } ${c.code === value ? 'text-[#E0C878]' : 'text-[#F5F1EB]'}`}
              >
                {optionContent(c)}
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-4 py-3 text-[#8A94A6] text-sm">{t('form.noMatches')}</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ── Main component ────────────────────────────────────────────── */

export default function RegistrationForm() {
  const { t, lang } = useLanguage();
  const content = useContent();
  const [searchParams] = useSearchParams();

  /* Read the deep link ONCE, on first render. Re-reading it on every
     render would fight the parent's own edits: change the age group and
     the URL's `age` would immediately put it back. */
  const [formData, setFormData] = useState<FormData>(() =>
    formDataFromParams(
      searchParams,
      content.programs.map(p => p.id)
    )
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [shaking, setShaking] = useState(false);
  const [botcheck, setBotcheck] = useState(''); // honeypot — humans never see/fill this
  const [summaryMessage, setSummaryMessage] = useState('');

  const lastSubmitAtRef = useRef(0); // when the last application was delivered
  const lastSubmitSignatureRef = useRef(''); // payload of that application
  const shakeTimerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (shakeTimerRef.current !== null) window.clearTimeout(shakeTimerRef.current);
    },
    []
  );

  const isSubmitting = submitState === 'submitting';

  const showError = (field: FieldKey) => Boolean(errors[field] && touched[field]);

  /* ── The live quote ──────────────────────────────────────────────
     Everything below is derived from what is selected, so the summary
     line and the payment options can never disagree with each other —
     or with the tables on the Programs page, since all three read the
     same numbers out of src/data/pricing.ts.                      */
  const selectedProgram = content.programs.find(p => p.id === formData.program);
  const selectedTerm: TermRow | undefined = content.payableTerms.find(
    term => term.id === formData.term
  );
  const selectedRow: PricingRow | undefined =
    selectedProgram && formData.frequency
      ? pricingRow(selectedProgram.priceBand, Number(formData.frequency) as Frequency)
      : undefined;

  /** What the chosen payment option comes to. Undefined until it can be known. */
  const quotedTotal =
    selectedRow && selectedTerm
      ? optionTotal(selectedRow, selectedTerm.id as TermId, formData.payment || 'term')
      : undefined;

  /** Move focus to the field a "change" control points at. */
  const focusField = (field: FieldKey) => {
    const el = document.getElementById(FIELD_IDS[field]);
    el?.focus();
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };

  /** Localized validation message for an invalid field (derived — always current language). */
  const errorFor = (field: FieldKey): string | undefined =>
    errors[field] ? validateField(field, formData, t, content.programs) : undefined;

  /**
   * Recompute every TOUCHED field against the given data. Doing the whole set
   * (rather than just the edited field) is what keeps cross-field rules — age
   * vs. programme — from going stale when the other side changes.
   */
  const revalidate = (data: FormData, touchedNow: Partial<Record<FieldKey, boolean>>) => {
    const next: FormErrors = {};
    FIELD_ORDER.forEach(f => {
      if (touchedNow[f]) next[f] = validateField(f, data, t, content.programs) !== undefined;
    });
    setErrors(next);
  };

  const updateTextField = (
    field: 'playerName' | 'parentName' | 'age' | 'phoneNumber' | 'email',
    value: string
  ) => {
    const next = { ...formData, [field]: value };
    setFormData(next);
    revalidate(next, touched);
  };

  const handleBlur = (field: FieldKey) => {
    const touchedNow = { ...touched, [field]: true };
    setTouched(touchedNow);
    revalidate(formData, touchedNow);
  };

  /* Nationality does NOT drive the phone dial code — an Indian national living
     in Muscat has an Omani number. The dial code keeps its own default. */
  const handleNationalitySelect = (code: string) => {
    const next = { ...formData, nationality: code };
    const touchedNow = { ...touched, nationality: true };
    setFormData(next);
    setTouched(touchedNow);
    revalidate(next, touchedNow);
  };

  /**
   * Commit one of the choice fields (age group, training days, term,
   * payment). Marks it touched so its own error can show, and
   * revalidates the whole touched set — the age-vs-squad rule is a
   * cross-field check and would otherwise go stale.
   */
  const handleChoice = <K extends 'program' | 'frequency' | 'term' | 'payment'>(
    field: K,
    value: FormData[K]
  ) => {
    const next = { ...formData, [field]: value };
    const touchedNow = { ...touched, [field]: true };
    setFormData(next);
    setTouched(touchedNow);
    revalidate(next, touchedNow);
  };

  // Manual dial-code override — stored as the OWNING country's ISO code
  const handleDialCodeSelect = (code: string) => {
    setFormData(prev => ({ ...prev, phoneCountry: code }));
  };

  const handleConsentChange = (checked: boolean) => {
    const next = { ...formData, consent: checked };
    const touchedNow = { ...touched, consent: true };
    setFormData(next);
    setTouched(touchedNow);
    revalidate(next, touchedNow);
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    setTouched({});
    setBotcheck('');
    setSummaryMessage('');
    setSubmitState('idle');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Honeypot: silently abort if filled (bots only)
    if (botcheck) return;
    if (submitState === 'submitting') return;

    // Validate every required field
    const newErrors: FormErrors = {};
    FIELD_ORDER.forEach(f => {
      if (validateField(f, formData, t, content.programs) !== undefined) newErrors[f] = true;
    });
    setErrors(newErrors);
    setTouched(FIELD_ORDER.reduce<Partial<Record<FieldKey, boolean>>>((acc, f) => ({ ...acc, [f]: true }), {}));

    const firstInvalid = FIELD_ORDER.find(f => newErrors[f]);
    if (firstInvalid) {
      setShaking(true);
      if (shakeTimerRef.current !== null) window.clearTimeout(shakeTimerRef.current);
      shakeTimerRef.current = window.setTimeout(() => setShaking(false), 450);
      const target = document.getElementById(FIELD_IDS[firstInvalid]);
      target?.focus();
      /* The fixed navbar overlaps a focused field near the top of the panel */
      target?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }

    const signature = JSON.stringify(formData);
    if (isDuplicateSubmit(signature, lastSubmitSignatureRef.current, lastSubmitAtRef.current)) {
      setSubmitState('success');
      return;
    }

    const nationality = countries.find(c => c.code === formData.nationality);
    const dial = countries.find(c => c.code === formData.phoneCountry);
    const program = content.programs.find(p => p.id === formData.program);
    const phoneFull = `${dial ? dial.dialCode : ''} ${formData.phoneNumber}`.trim();

    // WhatsApp prefill summary (*bold*, \n newlines — encoded later by whatsappLink).
    // Labels follow the active UI language; the program uses its localized name.
    const summaryLines = [
      t('form.waTitle'),
      '',
      `${t('form.waPlayer')} ${formData.playerName.trim()}`,
      `${t('form.waParent')} ${formData.parentName.trim()}`,
      `${t('form.waNationality')} ${nationality ? nationality.name : formData.nationality}`,
      `${t('form.waAge')} ${formData.age.trim()}`,
      `${t('form.waPhone')} ${phoneFull}`,
      `${t('form.waEmail')} ${formData.email.trim()}`,
    ];
    if (program) summaryLines.push(`${t('form.waProgram')} ${program.name} · ${program.ages}`);
    if (formData.frequency) {
      summaryLines.push(
        `${t('form.waFrequency')} ${trainingDaysLabel(t, formData.frequency)}`
      );
    }
    if (selectedTerm) {
      summaryLines.push(`${t('form.waTerm')} ${selectedTerm.term} (${selectedTerm.dates})`);
    }
    if (formData.payment && quotedTotal !== undefined) {
      summaryLines.push(
        `${t('form.waPayment')} ${t(`form.pay.${formData.payment}`)} — ${formatOMR(quotedTotal)}`
      );
    }
    setSummaryMessage(summaryLines.join('\n'));

    /* ── Notification email ────────────────────────────────────────
       Web3Forms turns each key below into a labelled row, in this
       order, so the keys ARE the labels — hence the readable names.
       Written in English on purpose: it lands in the academy's shared
       inbox, and one consistent language keeps triage sane no matter
       which language the parent applied in. */
    const squad = program ? `${program.name} — ${program.ages}` : '';

    const emailFields: Record<string, string> = {
      '👤 Player': formData.playerName.trim(),
      '🎂 Age': formData.age.trim(),
      '🏆 Squad': squad,
      '🌍 Nationality': nationality ? nationality.name : formData.nationality,
      '───────────────': '',
      '🙋 Parent / Guardian': formData.parentName.trim(),
      '📱 Phone / WhatsApp': phoneFull,
      '✉️ Email': formData.email.trim(),
      '🗣️ Applied in': lang === 'ar' ? 'Arabic — call in Arabic' : 'English',
      '──────────────': '',
    };

    /* Deliberately English, and deliberately using the SPLIT terminology —
       "Training days per week" and "Duration" — so the inbox reads the
       same way the website does and nobody has to guess which "sessions"
       a parent meant. */
    if (program) {
      emailFields['📅 Training days'] = program.days;
      emailFields['🕒 Time'] = program.time;
      emailFields['⏱️ Duration (one training)'] = program.duration;
    }
    if (formData.frequency) {
      emailFields['🔁 Training days per week'] = formData.frequency;
    }
    if (selectedTerm) {
      emailFields['🗓️ Term'] = `${selectedTerm.term} — ${selectedTerm.dates} (${selectedTerm.duration})`;
    }

    /* The quote the parent actually saw, so the academy invoices the same
       figure the website showed them. */
    if (selectedRow && selectedTerm && formData.payment) {
      const termId = selectedTerm.id as TermId;
      const price = termPrice(selectedRow, termId);
      const chosen =
        formData.payment === 'term'
          ? `Pay for the term — ${formatOMR(price.upfront)}`
          : formData.payment === 'monthly'
            ? `Monthly instalments — ${selectedTerm.instalments} × ${formatOMR(price.monthly)} = ${formatOMR(monthlyTotal(selectedRow, termId))}`
            : `Full season — ${formatOMR(selectedRow.fullSeason)} (saves ${formatOMR(seasonSaving(selectedRow))})`;
      emailFields['💰 Payment choice'] = chosen;
    }

    emailFields['─────────────'] = '';
    emailFields['📨 Submitted'] = submittedAt();

    setSubmitState('submitting');
    try {
      const res = await fetch(SITE.web3formsEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: SITE.web3formsKey,
          /* Scannable in an inbox list: who, and which squad. */
          subject: program
            ? `⚽ New application · ${program.name} · ${formData.playerName.trim()}`
            : `⚽ New application · ${formData.playerName.trim()}`,
          from_name: `${SITE.name} — Website`,
          replyto: formData.email.trim(),
          botcheck: '',
          ...emailFields,
        }),
      });
      const data: unknown = await res.json().catch(() => null);
      const succeeded =
        res.ok &&
        typeof data === 'object' &&
        data !== null &&
        (data as { success?: boolean }).success === true;

      if (succeeded) {
        /* Tell the academy's own dashboard that an application arrived.
           Fire-and-forget, and it carries no applicant data — only the fact
           that one was sent. A failure here must never reach the visitor. */
        reportFormSubmitted();

        // Arm the duplicate guard only once the registration is actually delivered
        armDuplicateGuard(lastSubmitAtRef, lastSubmitSignatureRef, signature);
        /* The success screen STAYS until the visitor dismisses it. An auto-
           reset used to yank it away mid-read, taking the WhatsApp
           confirm-faster link with it. */
        setSubmitState('success');
      } else {
        setSubmitState('error');
      }
    } catch {
      setSubmitState('error');
    }
  };

  /* ── Success screen ──────────────────────────────────────────── */

  if (submitState === 'success') {
    return (
      <div
        className="card-panel corner-ticks w-[calc(100%-2rem)] sm:w-full max-w-[640px] mx-auto p-6 md:p-10 flex flex-col items-center text-center"
        style={panelTickStyle}
      >
        <CheckCircle
          size={64}
          className="text-[#25D366] mb-6"
          style={{ animation: 'shake 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        />
        <h3 className="font-bebas text-[clamp(2.5rem,5vw,4rem)] uppercase tracking-[0.03em] text-[#C9A84C] leading-none mb-4">
          {t('form.successTitle')}
        </h3>
        <p className="font-inter text-[1rem] text-[#F5F1EB] leading-relaxed max-w-[400px] mb-8">
          {t('form.successText')}
        </p>
        <a
          href={whatsappLink(summaryMessage || undefined)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 font-inter font-semibold text-[0.875rem] uppercase tracking-[0.06em] text-[#060F25] px-8 py-3 rounded-[2px] transition-all duration-300 hover:brightness-110 active:scale-[0.98] mb-4"
          style={{ backgroundColor: '#25D366' }}
        >
          <MessageCircle size={18} aria-hidden="true" />
          {t('form.successWhatsapp')}
        </a>
        <button
          type="button"
          onClick={resetForm}
          className="btn-outline px-8 py-3"
        >
          {t('form.backToForm')}
        </button>
      </div>
    );
  }

  /* ── Form ────────────────────────────────────────────────────── */

  return (
    <div
      className={`card-panel corner-ticks w-[calc(100%-2rem)] sm:w-full max-w-[640px] mx-auto p-6 md:p-10 ${shaking ? 'animate-shake' : ''}`}
      style={panelTickStyle}
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {/* ── What you clicked, shown back to you ────────────────────
            Appears as soon as an age group is known — whether it came
            from a Register button on the Programs page or was picked
            here. The price is computed from the shared pricing data, so
            it is the same figure the Programs table showed. "Change"
            just moves focus to the field: nothing is locked. */}
        {selectedProgram && (
          <div
            className="rounded-[2px] p-4"
            style={{
              backgroundColor: 'rgba(201,168,76,0.08)',
              border: '1px solid rgba(201,168,76,0.35)',
            }}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-inter text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[#C9A84C]">
                  {t('form.summaryLabel')}
                </p>
                <p className="mt-1.5 font-inter text-[0.9375rem] leading-[1.6] text-[#F5F1EB]">
                  <span className="font-semibold">{selectedProgram.name}</span>
                  <span className="text-[#8A94A6]"> · {selectedProgram.ages}</span>
                  {formData.frequency && (
                    <>
                      <span aria-hidden="true" className="text-[#8A94A6]"> · </span>
                      <span>
                        {trainingDaysLabel(t, formData.frequency)}
                      </span>
                    </>
                  )}
                  {selectedTerm && (
                    <>
                      <span aria-hidden="true" className="text-[#8A94A6]"> · </span>
                      <span>
                        {selectedTerm.term}{' '}
                        <span className="text-[#8A94A6]">({selectedTerm.dates})</span>
                      </span>
                    </>
                  )}
                  {quotedTotal !== undefined && (
                    <>
                      <span aria-hidden="true" className="text-[#8A94A6]"> · </span>
                      <span className="font-semibold text-[#E0C878]">
                        {formatOMR(quotedTotal)}
                      </span>
                    </>
                  )}
                </p>
                {quotedTotal === undefined && (
                  <p className="mt-1 font-inter text-[0.75rem] leading-[1.5] text-[#8A94A6]">
                    {t('form.summaryIncomplete')}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => focusField('program')}
                className="inline-flex shrink-0 items-center gap-1.5 font-inter text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-[#C9A84C] transition-opacity duration-300 hover:opacity-75"
              >
                <Pencil size={12} aria-hidden="true" />
                {t('form.summaryChange')}
              </button>
            </div>
          </div>
        )}

        {/* Player Full Name */}
        <div className="flex flex-col gap-2">
          <label htmlFor="player-name" className={labelClass}>
            {t('form.playerName')}
            <RequiredMark />
          </label>
          <div className="relative">
            <User
              size={18}
              className="absolute start-3 top-1/2 -translate-y-1/2 text-[#8A94A6] pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="player-name"
              disabled={isSubmitting}
              type="text"
              maxLength={NAME_MAX_LENGTH}
              placeholder={t('form.playerNamePlaceholder')}
              value={formData.playerName}
              onChange={e => updateTextField('playerName', e.target.value)}
              onBlur={() => handleBlur('playerName')}
              aria-required="true"
              aria-invalid={showError('playerName')}
              aria-describedby={showError('playerName') ? 'player-name-error' : undefined}
              autoComplete="name"
              className={`${inputBaseClass} ps-10 ${fieldBorderClass(showError('playerName'))}`}
            />
          </div>
          {showError('playerName') && (
            <p id="player-name-error" role="alert" className={errorTextClass}>
              {errorFor('playerName')}
            </p>
          )}
        </div>

        {/* Parent/Guardian Name */}
        <div className="flex flex-col gap-2">
          <label htmlFor="parent-name" className={labelClass}>
            {t('form.parentName')}
            <RequiredMark />
          </label>
          <div className="relative">
            <UserRound
              size={18}
              className="absolute start-3 top-1/2 -translate-y-1/2 text-[#8A94A6] pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="parent-name"
              disabled={isSubmitting}
              type="text"
              maxLength={NAME_MAX_LENGTH}
              autoComplete="name"
              placeholder={t('form.parentNamePlaceholder')}
              value={formData.parentName}
              onChange={e => updateTextField('parentName', e.target.value)}
              onBlur={() => handleBlur('parentName')}
              aria-required="true"
              aria-invalid={showError('parentName')}
              aria-describedby={showError('parentName') ? 'parent-name-error' : undefined}
              className={`${inputBaseClass} ps-10 ${fieldBorderClass(showError('parentName'))}`}
            />
          </div>
          {showError('parentName') && (
            <p id="parent-name-error" role="alert" className={errorTextClass}>
              {errorFor('parentName')}
            </p>
          )}
        </div>

        {/* Nationality (searchable, ISO code stored) */}
        <div className="flex flex-col gap-2">
          <label id="nationality-label" htmlFor="nationality" className={labelClass}>
            {t('form.nationality')}
            <RequiredMark />
          </label>
          <SearchableListbox
            id="nationality"
            labelId="nationality-label"
            value={formData.nationality}
            options={countries}
            placeholder={t('form.nationalityPlaceholder')}
            searchPlaceholder={t('form.nationalitySearch')}
            hasError={showError('nationality')}
            describedById="nationality-error"
            matches={(c, q) => c.name.toLowerCase().includes(q)}
            onSelect={handleNationalitySelect}
            buttonContent={selected => (
              <span className={selected ? 'text-white truncate' : 'text-[rgba(138,148,166,0.85)]'}>
                {selected ? `${selected.flag} ${selected.name}` : t('form.nationalityPlaceholder')}
              </span>
            )}
            optionContent={c => (
              <>
                <span aria-hidden="true">{c.flag}</span>
                <span>{c.name}</span>
              </>
            )}
            buttonClassName={`${inputBaseClass} text-start flex items-center justify-between gap-2 ${fieldBorderClass(
              showError('nationality')
            )}`}
          />
          {showError('nationality') && (
            <p id="nationality-error" role="alert" className={errorTextClass}>
              {errorFor('nationality')}
            </p>
          )}
        </div>

        {/* Age */}
        <div className="flex flex-col gap-2">
          <label htmlFor="age" className={labelClass}>
            {t('form.age')}
            <RequiredMark />
          </label>
          <div className="relative">
            <Calendar
              size={18}
              className="absolute start-3 top-1/2 -translate-y-1/2 text-[#8A94A6] pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="age"
              disabled={isSubmitting}
              /* Deliberately NOT type="number": that variant silently blanks
                 itself when a stray 'e'/'-' is typed, and mutates on scroll
                 wheel. text + inputMode still gives phones a numeric keypad. */
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={2}
              autoComplete="off"
              placeholder={t('form.agePlaceholder', { min: SITE.ageMin, max: SITE.ageMax })}
              value={formData.age}
              onChange={e => {
                const v = e.target.value;
                if (v === '' || /^\d+$/.test(v)) updateTextField('age', v);
              }}
              onBlur={() => handleBlur('age')}
              aria-required="true"
              aria-invalid={showError('age')}
              aria-describedby={showError('age') ? 'age-error' : undefined}
              className={`${inputBaseClass} ps-10 ${fieldBorderClass(showError('age'))}`}
            />
          </div>
          {showError('age') && (
            <p id="age-error" role="alert" className={errorTextClass}>
              {errorFor('age')}
            </p>
          )}
        </div>

        {/* Phone Number (dial code + digits) */}
        <div className="flex flex-col gap-2">
          <label htmlFor="phone" className={labelClass}>
            {t('form.phone')}
            <RequiredMark />
          </label>
          <div className="flex flex-col sm:flex-row">
            <SearchableListbox
              id="dial-code"
              ariaLabel={t('form.dialCodeLabel')}
              value={formData.phoneCountry}
              options={countries}
              placeholder={t('form.dialCodePlaceholder')}
              searchPlaceholder={t('form.dialCodeSearch')}
              hasError={showError('phoneNumber')}
              describedById="phone-error"
              matches={(c, q) => `${c.dialCode} ${c.name}`.toLowerCase().includes(q)}
              onSelect={handleDialCodeSelect}
              buttonContent={selected => (
                <span className="truncate text-white">
                  {selected ? `${selected.flag} ${selected.dialCode}` : t('form.dialCodePlaceholder')}
                </span>
              )}
              optionContent={c => (
                <>
                  <span aria-hidden="true">{c.flag}</span>
                  <span className="text-[#C9A84C] font-medium">{c.dialCode}</span>
                  <span className="text-[#8A94A6] text-[0.75rem]">{c.name}</span>
                </>
              )}
              buttonClassName={`w-full sm:w-[140px] bg-[rgba(6,15,37,0.6)] border sm:border-e-0 rounded-t-[2px] rounded-b-none sm:rounded-[2px] sm:rounded-e-none px-3 py-[0.875rem] font-inter text-[0.875rem] text-white transition-all duration-300 focus:outline-none flex items-center justify-between gap-1 hover:border-[rgba(201,168,76,0.4)] ${fieldBorderClass(
                showError('phoneNumber')
              )}`}
              listClassName="start-0 w-[min(280px,85vw)]"
            />
            <div className="relative flex-1">
              <Phone
                size={18}
                className="absolute start-3 top-1/2 -translate-y-1/2 text-[#8A94A6] pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="phone"
                disabled={isSubmitting}
                type="tel"
                maxLength={PHONE_MAX_DIGITS}
                inputMode="numeric"
                placeholder={t('form.phonePlaceholder')}
                value={formData.phoneNumber}
                onChange={e => updateTextField('phoneNumber', e.target.value.replace(/\D/g, ''))}
                onBlur={() => handleBlur('phoneNumber')}
                aria-required="true"
                aria-invalid={showError('phoneNumber')}
                aria-describedby={showError('phoneNumber') ? 'phone-error' : undefined}
                autoComplete="tel-national"
                className={`${inputBaseClass} ps-10 rounded-b-[2px] rounded-t-none sm:rounded-[2px] sm:rounded-s-none ${fieldBorderClass(
                  showError('phoneNumber')
                )}`}
              />
            </div>
          </div>
          {showError('phoneNumber') && (
            <p id="phone-error" role="alert" className={errorTextClass}>
              {errorFor('phoneNumber')}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className={labelClass}>
            {t('form.email')}
            <RequiredMark />
          </label>
          <div className="relative">
            <Mail
              size={18}
              className="absolute start-3 top-1/2 -translate-y-1/2 text-[#8A94A6] pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="email"
              disabled={isSubmitting}
              type="email"
              maxLength={EMAIL_MAX_LENGTH}
              placeholder={t('form.emailPlaceholder')}
              value={formData.email}
              onChange={e => updateTextField('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              aria-required="true"
              aria-invalid={showError('email')}
              aria-describedby={showError('email') ? 'email-error' : undefined}
              autoComplete="email"
              className={`${inputBaseClass} ps-10 ${fieldBorderClass(showError('email'))}`}
            />
          </div>
          {showError('email') && (
            <p id="email-error" role="alert" className={errorTextClass}>
              {errorFor('email')}
            </p>
          )}
        </div>

        {/* ── The programme choice: age group, training days, term ────
            Three separate questions, because collapsing them was what
            made "session" ambiguous in the first place. */}

        {/* Age group (required) */}
        <div className="flex flex-col gap-2">
          <label htmlFor="program" className={labelClass}>
            {t('form.program')}
            <RequiredMark />
          </label>
          <div className="relative">
            <select
              id="program"
              disabled={isSubmitting}
              value={formData.program}
              onChange={e => handleChoice('program', e.target.value)}
              onBlur={() => handleBlur('program')}
              aria-required="true"
              aria-invalid={showError('program')}
              aria-describedby={showError('program') ? 'program-error' : undefined}
              className={`${inputBaseClass} appearance-none pe-10 cursor-pointer ${fieldBorderClass(
                showError('program')
              )} ${formData.program ? 'text-white' : 'text-[rgba(138,148,166,0.85)]'}`}
            >
              <option value="" style={{ backgroundColor: '#060F25', color: '#F5F1EB' }}>
                {t('form.programPlaceholder')}
              </option>
              {content.programs.map(p => (
                <option
                  key={p.id}
                  value={p.id}
                  style={{ backgroundColor: '#060F25', color: '#F5F1EB' }}
                >
                  {p.name} · {p.ages} · {p.time}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-[#C9A84C] pointer-events-none"
              aria-hidden="true"
            />
          </div>
          {showError('program') && (
            <p id="program-error" role="alert" className={errorTextClass}>
              {errorFor('program')}
            </p>
          )}
        </div>

        {/* Training days per week (required) — how OFTEN, never "sessions" */}
        <div className="flex flex-col gap-2">
          <label htmlFor="frequency" className={labelClass}>
            {t('form.frequency')}
            <RequiredMark />
          </label>
          <div className="relative">
            <select
              id="frequency"
              disabled={isSubmitting}
              value={formData.frequency}
              onChange={e => handleChoice('frequency', e.target.value as FormData['frequency'])}
              onBlur={() => handleBlur('frequency')}
              aria-required="true"
              aria-invalid={showError('frequency')}
              aria-describedby={`form-frequency-hint${showError('frequency') ? ' frequency-error' : ''}`}
              className={`${inputBaseClass} appearance-none pe-10 cursor-pointer ${fieldBorderClass(
                showError('frequency')
              )} ${formData.frequency ? 'text-white' : 'text-[rgba(138,148,166,0.85)]'}`}
            >
              <option value="" style={{ backgroundColor: '#060F25', color: '#F5F1EB' }}>
                {t('form.frequencyPlaceholder')}
              </option>
              {FREQUENCIES.map(f => (
                <option
                  key={f}
                  value={String(f)}
                  style={{ backgroundColor: '#060F25', color: '#F5F1EB' }}
                >
                  {trainingDaysLabel(t, f)}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-[#C9A84C] pointer-events-none"
              aria-hidden="true"
            />
          </div>
          <p id="form-frequency-hint" className="font-inter text-[0.75rem] leading-[1.5] text-[#8A94A6]">
            {t('form.frequencyHint', { days: content.trainingDays.join(' · ') })}
          </p>
          {showError('frequency') && (
            <p id="frequency-error" role="alert" className={errorTextClass}>
              {errorFor('frequency')}
            </p>
          )}
        </div>

        {/* Term (required) — labelled with its dates, never just "Term 2" */}
        <div className="flex flex-col gap-2">
          <label htmlFor="term" className={labelClass}>
            {t('form.term')}
            <RequiredMark />
          </label>
          <div className="relative">
            <select
              id="term"
              disabled={isSubmitting}
              value={formData.term}
              onChange={e => handleChoice('term', e.target.value as FormData['term'])}
              onBlur={() => handleBlur('term')}
              aria-required="true"
              aria-invalid={showError('term')}
              aria-describedby={showError('term') ? 'term-error' : undefined}
              className={`${inputBaseClass} appearance-none pe-10 cursor-pointer ${fieldBorderClass(
                showError('term')
              )} ${formData.term ? 'text-white' : 'text-[rgba(138,148,166,0.85)]'}`}
            >
              <option value="" style={{ backgroundColor: '#060F25', color: '#F5F1EB' }}>
                {t('form.termPlaceholder')}
              </option>
              {content.payableTerms.map(term => (
                <option
                  key={term.id}
                  value={term.id}
                  style={{ backgroundColor: '#060F25', color: '#F5F1EB' }}
                >
                  {term.term} · {term.dates} · {term.duration}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-[#C9A84C] pointer-events-none"
              aria-hidden="true"
            />
          </div>
          {showError('term') && (
            <p id="term-error" role="alert" className={errorTextClass}>
              {errorFor('term')}
            </p>
          )}
        </div>

        {/* ── How you would like to pay ───────────────────────────────
            A radio group, with each option's TOTAL beside it, so the
            full-season saving is visible at the moment of choosing
            rather than buried on another page. The totals only appear
            once the age group, training days and term are known —
            there is no price to state before that. */}
        <fieldset className="flex flex-col gap-2" disabled={isSubmitting}>
          <legend className={labelClass}>
            {t('form.payment')}
            <RequiredMark />
          </legend>

          {!selectedRow || !selectedTerm ? (
            <p className="font-inter text-[0.8125rem] leading-[1.6] text-[#8A94A6]">
              {t('form.paymentLocked')}
            </p>
          ) : (
            <>
              <div className="mt-1 flex flex-col gap-2">
                {PAYMENT_OPTIONS.map(option => {
                  const termId = selectedTerm.id as TermId;
                  const price = termPrice(selectedRow, termId);
                  const total = optionTotal(selectedRow, termId, option);
                  const checked = formData.payment === option;

                  /* The one line under each option that says what the
                     figure actually means. Monthly shows its arithmetic,
                     so "OMR 94 a month" can never read as the cheapest. */
                  const detail =
                    option === 'term'
                      ? t('form.pay.termDetail', { term: selectedTerm.term })
                      : option === 'monthly'
                        ? t('form.pay.monthlyDetail', {
                            count: selectedTerm.instalments,
                            each: formatOMR(price.monthly),
                          })
                        : t('form.pay.seasonDetail', {
                            pct: SEASON_DISCOUNT_PCT,
                            saving: formatOMR(seasonSaving(selectedRow)),
                          });

                  return (
                    <label
                      key={option}
                      htmlFor={`payment-${option}`}
                      className="flex cursor-pointer items-start gap-3 rounded-[2px] p-3 transition-colors duration-200"
                      style={{
                        backgroundColor: checked
                          ? 'rgba(201,168,76,0.1)'
                          : 'rgba(6,15,37,0.6)',
                        border: `1px solid ${checked ? '#C9A84C' : 'rgba(201,168,76,0.25)'}`,
                      }}
                    >
                      <input
                        id={`payment-${option}`}
                        type="radio"
                        name="payment"
                        value={option}
                        checked={checked}
                        onChange={() => handleChoice('payment', option)}
                        onBlur={() => handleBlur('payment')}
                        aria-describedby={showError('payment') ? 'payment-error' : undefined}
                        className="mt-1 h-4 w-4 shrink-0 accent-[#C9A84C]"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                          <span className="font-inter text-[0.9375rem] font-semibold text-[#F5F1EB]">
                            {t(`form.pay.${option}`)}
                          </span>
                          <span className="font-inter text-[1rem] font-semibold text-[#E0C878]">
                            {formatOMR(total)}
                          </span>
                        </span>
                        <span className="mt-0.5 block font-inter text-[0.75rem] leading-[1.5] text-[#8A94A6]">
                          {detail}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
              <p className="font-inter text-[0.75rem] leading-[1.6] text-[#8A94A6]">
                {content.monthlyWarning}
              </p>
            </>
          )}

          {showError('payment') && (
            <p id="payment-error" role="alert" className={errorTextClass}>
              {errorFor('payment')}
            </p>
          )}
        </fieldset>

        {/* Parental Consent */}
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-3">
            {/* Square 2px checkbox with gold check — the native input keeps
                all state/aria; it is visually replaced by the peer span. */}
            <div className="relative mt-1 h-4 w-4 shrink-0">
              <input
                id="consent"
                disabled={isSubmitting}
                type="checkbox"
                checked={formData.consent}
                onChange={e => handleConsentChange(e.target.checked)}
                onBlur={() => handleBlur('consent')}
                aria-required="true"
                aria-invalid={showError('consent')}
                aria-describedby={showError('consent') ? 'consent-error' : undefined}
                className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-[2px] border border-[rgba(201,168,76,0.4)] bg-[rgba(6,15,37,0.6)] transition-all duration-200 peer-checked:border-[#C9A84C] peer-checked:bg-[#C9A84C] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#C9A84C]"
              />
              <Check
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 m-auto h-3 w-3 text-[#060F25] opacity-0 transition-opacity duration-200 peer-checked:opacity-100"
              />
            </div>
            <label
              htmlFor="consent"
              className="font-inter text-[0.875rem] leading-relaxed text-[#F5F1EB] cursor-pointer"
            >
              {t('form.consent')}
              <RequiredMark />
            </label>
          </div>
          {showError('consent') && (
            <p id="consent-error" role="alert" className={errorTextClass}>
              {errorFor('consent')}
            </p>
          )}
        </div>

        {/* Honeypot — visually hidden, bots only. Silently aborts submit when filled. */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            padding: 0,
            margin: '-1px',
            overflow: 'hidden',
            clip: 'rect(0 0 0 0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
        >
          <label htmlFor="botcheck">{t('form.honeypot')}</label>
          <input
            id="botcheck"
            name="botcheck"
            type="text"
            value={botcheck}
            onChange={e => setBotcheck(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* Submit error — real message + Try again (values kept) */}
        {submitState === 'error' && (
          <div
            role="alert"
            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-[2px] px-4 py-3"
            style={{
              border: '1px solid rgba(239, 68, 68, 0.4)',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
            }}
          >
            <AlertTriangle size={18} className="text-[#EF4444] shrink-0" aria-hidden="true" />
            <p className="flex-1 font-inter text-[0.875rem] text-[#F5F1EB] leading-relaxed">
              {t('form.submitError')}
            </p>
            <button
              type="button"
              onClick={() => setSubmitState('idle')}
              className="btn-outline shrink-0 px-5 py-2 text-[0.75rem]"
            >
              {t('form.tryAgain')}
            </button>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitState === 'submitting'}
          className="btn-primary w-full mt-2 py-4 px-10 text-[0.875rem] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitState === 'submitting' ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin-slow" aria-hidden="true" />
              {t('form.submitting')}
            </span>
          ) : (
            t('form.submit')
          )}
        </button>
      </form>
    </div>
  );
}
